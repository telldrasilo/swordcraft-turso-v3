import { describe, expect, it } from 'vitest'
import {
  applyInventoryListFilters,
  filterWeaponsByInventoryFilters,
  sortWeaponsByInventorySort,
} from '@/lib/forge/inventory-filter-utils'
import type { CraftedWeaponV2 } from '@/types/craft-v2'

const defaultStats = (): CraftedWeaponV2['stats'] => ({
  attack: 10,
  durability: 100,
  maxDurability: 100,
  weight: 1,
  balance: 0,
  soulCapacity: 0,
  repairPotential: 1,
  enchantSlots: 0,
  enchantPower: 0,
})

function minimalWeapon(partial: Partial<CraftedWeaponV2> & { id: string }): CraftedWeaponV2 {
  const { id, stats: ps, ...rest } = partial
  return {
    id,
    recipeId: 'r',
    prefix: '',
    baseName: 'меч',
    suffix: '',
    fullName: 'меч',
    type: 'sword',
    tier: 1,
    materials: [],
    stats: { ...defaultStats(), ...ps },
    quality: partial.quality ?? 50,
    qualityGrade: partial.qualityGrade ?? 'good',
    qualityRank: partial.qualityRank ?? 'C',
    warSoul: partial.warSoul ?? 0,
    maxWarSoul: partial.maxWarSoul ?? 100,
    createdAt: partial.createdAt ?? 0,
    adventureCount: 0,
    sellPrice: 1,
    hiddenTags: [],
    combatMaterialId: 'iron',
    currentDurability: partial.currentDurability ?? 100,
    epicMultiplier: 1,
    techniquesUsed: [],
    activeDamageTags: partial.activeDamageTags ?? [],
    weaponLegacy: partial.weaponLegacy ?? { hiddenMarks: [] },
    repairCondition: partial.repairCondition ?? 'ok',
    ...rest,
  } as CraftedWeaponV2
}

describe('inventory-filter-utils', () => {
  it('filterQuality keeps only matching grade', () => {
    const w = [
      minimalWeapon({ id: '1', qualityGrade: 'legendary' }),
      minimalWeapon({ id: '2', qualityGrade: 'good' }),
    ]
    const out = filterWeaponsByInventoryFilters(w, 'legendary', 'all')
    expect(out.map((x) => x.id)).toEqual(['1'])
  })

  it('filterDamage damaged uses tags and durability', () => {
    const w = [
      minimalWeapon({
        id: '1',
        activeDamageTags: [{ tagId: 'x', severity: 'light', appliedAt: 1 }],
      }),
      minimalWeapon({
        id: '2',
        currentDurability: 50,
        stats: { ...defaultStats(), attack: 1, durability: 50, maxDurability: 100 },
      }),
      minimalWeapon({ id: '3' }),
    ]
    const out = filterWeaponsByInventoryFilters(w, 'all', 'damaged')
    expect(out.map((x) => x.id).sort()).toEqual(['1', '2'])
  })

  it('sort by power prefers powerScore when set', () => {
    const w = [
      minimalWeapon({
        id: 'a',
        stats: { ...defaultStats(), attack: 100 },
        powerScore: 10,
      }),
      minimalWeapon({
        id: 'b',
        stats: { ...defaultStats(), attack: 5 },
      }),
    ]
    const out = sortWeaponsByInventorySort(w, 'power')
    expect(out[0].id).toBe('a')
    expect(out[1].id).toBe('b')
  })

  it('applyInventoryListFilters chains filter and sort', () => {
    const w = [
      minimalWeapon({ id: '1', qualityGrade: 'good', createdAt: 2 }),
      minimalWeapon({ id: '2', qualityGrade: 'legendary', createdAt: 1 }),
    ]
    const out = applyInventoryListFilters(w, {
      sortBy: 'date',
      filterQuality: 'legendary',
      filterDamage: 'all',
    })
    expect(out.map((x) => x.id)).toEqual(['2'])
  })
})
