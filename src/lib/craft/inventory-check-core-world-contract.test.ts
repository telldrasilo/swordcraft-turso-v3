import { describe, expect, it } from 'vitest'
import { WORLD_RESOURCE_TO_RESOURCE_KEY } from '@/lib/materials/world-resource-inventory-bridge'
import {
  getInventoryCheckCoreMaterialMappingEntryCount,
  getInventoryCheckCoreWorldKeyOverlap,
  getResourceKeyForMaterial,
} from '@/lib/craft/inventory-check'

/**
 * Новые переносы **CORE → WORLD** (`inventory-check`) допускаются только осознанными PR с пустым пересечением;
 * снимок §8.2 и строка §11 обязательны (**MATERIALS_SINGLE_SOURCE_ROADMAP**).
 */
describe('inventory-check CORE ∪ WORLD (roadmap 2.4)', () => {
  it('CORE and WORLD materialId keys are disjoint', () => {
    expect(getInventoryCheckCoreWorldKeyOverlap()).toEqual([])
  })

  it('CORE_MATERIAL_TO_RESOURCE пуст после 2.4h (все id в WORLD-мосте)', () => {
    expect(getInventoryCheckCoreMaterialMappingEntryCount()).toBe(0)
  })

  it('merged map: every WORLD id resolves same as direct WORLD table', () => {
    for (const [mid, rk] of Object.entries(WORLD_RESOURCE_TO_RESOURCE_KEY)) {
      expect(getResourceKeyForMaterial(mid)).toBe(rk)
    }
  })
})
