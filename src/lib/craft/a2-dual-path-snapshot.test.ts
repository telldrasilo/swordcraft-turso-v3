import { describe, expect, it } from 'vitest'
import {
  collectWorldBridgeMaterialPoolKeys,
  RESOURCE_KEYS_EXCLUDED_FROM_WORLD_MATERIAL_BRIDGE,
} from '@/lib/craft/a2-dual-path-snapshot'
import { getInventoryCheckCoreWorldKeyOverlap } from '@/lib/craft/inventory-check'
import type { ResourceKey } from '@/store/slices/resources-slice'
import { initialResources } from '@/store/slices/resources-slice'

describe('a2-dual-path snapshot (roadmap §8.2)', () => {
  it('CORE∩WORLD по materialId пустой', () => {
    expect(getInventoryCheckCoreWorldKeyOverlap()).toEqual([])
  })

  it('WORLD-мост задаёт непустой набор пулов ResourceKey', () => {
    const pools = collectWorldBridgeMaterialPoolKeys()
    expect(pools.length).toBeGreaterThan(5)
    for (const k of pools) {
      expect(k in initialResources).toBe(true)
      expect(RESOURCE_KEYS_EXCLUDED_FROM_WORLD_MATERIAL_BRIDGE).not.toContain(k)
    }
  })

  it('валюта не попадает в пулы моста', () => {
    const pools = new Set<ResourceKey>(collectWorldBridgeMaterialPoolKeys())
    expect(pools.has('gold')).toBe(false)
    expect(pools.has('soulEssence')).toBe(false)
  })
})
