/**
 * Целостность: все экспедиционные materialId и стартовая энциклопедия ⊆ materialById.
 */

import { describe, it, expect } from 'vitest'
import { materialById } from '@/data/materials/library'
import { LOCATION_REGISTRY } from './locations'
import { MISSION_REGISTRY } from './missions'
import { initialEncyclopediaState } from '@/store/slices/encyclopedia-slice'

function collectMissionResourceMaterialIds(): string[] {
  const ids = new Set<string>()
  for (const mission of MISSION_REGISTRY) {
    const resources = mission.resources
    if (!resources) continue
    for (const r of resources) {
      ids.add(r.materialId)
    }
  }
  return [...ids]
}

describe('expedition materials vs materialById', () => {
  it('location resources reference existing MaterialNode ids', () => {
    for (const loc of LOCATION_REGISTRY) {
      for (const res of loc.resources) {
        expect(materialById[res.materialId], `${loc.id} → ${res.materialId}`).toBeDefined()
      }
    }
  })

  it('mission gather resources reference existing MaterialNode ids', () => {
    for (const id of collectMissionResourceMaterialIds()) {
      expect(materialById[id], id).toBeDefined()
    }
  })

  it('initial encyclopedia materialKnowledge keys exist in materialById', () => {
    for (const key of Object.keys(initialEncyclopediaState.materialKnowledge)) {
      expect(materialById[key], key).toBeDefined()
    }
  })
})
