import { describe, expect, it } from 'vitest'
import { MATERIAL_PROCESS_OVERRIDES } from '@/data/materials/material-process-overrides'
import { getRefiningOreChargeEfficiency } from '@/lib/materials/material-process-contribution'

/**
 * Фаза E (черновик): явные шихты плавки в оверрайдах согласованы с `getRefiningOreChargeEfficiency`.
 */
describe('material process contract (semantic E, smelting ores)', () => {
  it('every explicit smelt_ore_charge has oreChargeEfficiency in (0, 1] and matches getter', () => {
    for (const [materialId, procs] of Object.entries(MATERIAL_PROCESS_OVERRIDES)) {
      const sm = procs?.refining_smelting
      if (!sm?.facets.includes('smelt_ore_charge')) continue
      expect(typeof sm.oreChargeEfficiency).toBe('number')
      const eff = sm.oreChargeEfficiency
      if (eff == null) throw new Error(`missing oreChargeEfficiency for ${materialId}`)
      expect(eff).toBeGreaterThan(0)
      expect(eff).toBeLessThanOrEqual(1)
      expect(getRefiningOreChargeEfficiency(materialId)).toBe(eff)
    }
  })
})
