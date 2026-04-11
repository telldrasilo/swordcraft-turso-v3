import { describe, expect, it } from 'vitest'
import {
  buildEncyclopediaTechniqueSections,
  flattenEncyclopediaTechniqueModels,
  techniqueRefToStableKey,
} from '@/lib/encyclopedia/encyclopedia-technique-sections'

describe('encyclopedia technique registry coverage (ENC P0b)', () => {
  /** 15 craft + 12 processing + 4 study + 5 reforge + 14 repair = 50 (см. ENC §3). */
  const EXPECTED_TOTAL = 50

  it('has expected total, unique (kind, id), non-empty names and refs', () => {
    const sections = buildEncyclopediaTechniqueSections()
    const models = flattenEncyclopediaTechniqueModels(sections)

    expect(models).toHaveLength(EXPECTED_TOTAL)

    const keys = new Set(models.map(m => techniqueRefToStableKey(m.ref)))
    expect(keys.size).toBe(EXPECTED_TOTAL)

    for (const m of models) {
      expect(m.ref.kind).toBeTruthy()
      expect(m.ref.id.length).toBeGreaterThan(0)
      expect(m.name.trim().length).toBeGreaterThan(0)
    }
  })
})
