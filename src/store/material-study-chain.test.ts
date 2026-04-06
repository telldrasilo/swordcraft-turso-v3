/**
 * Сессии изучения: списание через resources-slice + начисление экспертизы после flush.
 */
import { describe, expect, it, vi, afterEach } from 'vitest'
import { create } from 'zustand'
import { createEncyclopediaSlice, type EncyclopediaSlice } from '@/store/slices/encyclopedia-slice'
import { createResourcesSlice, type ResourcesSlice } from '@/store/slices/resources-slice'
import { createWorkersSlice, type WorkersSlice } from '@/store/slices/workers-slice'
import { getMaterialStudyTechniqueById } from '@/data/material-study-techniques'
import { resolveStudyDurationMs } from '@/lib/materials/material-study-balance'

type ChainStore = ResourcesSlice & EncyclopediaSlice & WorkersSlice

function createChainStore() {
  return create<ChainStore>()((set, get, _store) => ({
    ...createResourcesSlice(set, get, _store),
    ...createWorkersSlice(set, get, _store),
    ...createEncyclopediaSlice(set, get, _store),
  }))
}

describe('material study chain', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('startMaterialStudy spends cost; flushCompletedMaterialStudies adds expertise', () => {
    const store = createChainStore()
    store.getState().addMaterialToStash('birch', 5)
    store.getState().addResource('coal', 5)
    store.getState().setMaterialExpertise('birch', 5)

    const t0 = 50_000_000
    let nowVal = t0
    vi.spyOn(Date, 'now').mockImplementation(() => nowVal)
    let rnd = 0
    vi.spyOn(Math, 'random').mockImplementation(() => {
      rnd += 1
      // 1-й вызов — проверка неудачи завершения; далее — ролл прироста
      return rnd === 1 ? 0.5 : 0
    })

    const tech = getMaterialStudyTechniqueById('study_surface_reading')
    const studyMs = tech ? resolveStudyDurationMs(tech.durationMs) : 0

    expect(store.getState().startMaterialStudy('birch', 'study_surface_reading')).toBe(true)
    expect(store.getState().materialStash.birch).toBe(4)

    const beforeFlush = store.getState().getExpertisePercent('birch')

    nowVal = t0 + studyMs + 1000
    store.getState().flushCompletedMaterialStudies()

    const k = store.getState().materialKnowledge.birch
    expect(k).toBeDefined()
    expect(store.getState().getExpertisePercent('birch') - beforeFlush).toBe(2)
    expect(store.getState().gameMessages.length).toBeGreaterThan(0)
  })
})
