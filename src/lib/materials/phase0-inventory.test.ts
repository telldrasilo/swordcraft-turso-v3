/**
 * Фаза 0: снимок инвентаризации и согласованность с реестром craft-маппинга.
 */

import { describe, it, expect } from 'vitest'
import { materialById } from '@/data/materials/library'
import { CRAFT_MAPPED_MATERIAL_IDS } from '@/lib/craft/inventory-check'
import { buildPhase0Report } from './phase0-inventory'

describe('materials phase0 inventory', () => {
  it('buildPhase0Report completes with expected scale', () => {
    const r = buildPhase0Report()
    expect(r.libraryCount).toBeGreaterThan(50)
    expect(r.materialRows.length).toBeGreaterThanOrEqual(r.libraryCount)
    expect(r.referencedNotInLibrary.length).toBeGreaterThan(0)
  })

  it('every craft-mapped materialId without library node appears in referencedNotInLibrary', () => {
    const missingNodes = CRAFT_MAPPED_MATERIAL_IDS.filter((id) => !materialById[id])
    const r = buildPhase0Report()
    for (const id of missingNodes) {
      expect(r.referencedNotInLibrary, `expected ${id} documented`).toContain(id)
    }
  })
})
