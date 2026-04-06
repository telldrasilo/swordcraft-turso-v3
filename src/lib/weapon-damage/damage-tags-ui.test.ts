import { describe, expect, it } from 'vitest'
import type { CraftedWeaponV2 } from '@/types/craft-v2'
import { getActiveDamageTagLabels } from './damage-tags-ui'

const minimalWeapon = (tags: CraftedWeaponV2['activeDamageTags']): CraftedWeaponV2 =>
  ({
    id: 'w',
    recipeId: 'x',
    prefix: '',
    baseName: 'x',
    suffix: '',
    fullName: 'x',
    type: 'sword',
    tier: 1,
    materials: [],
    stats: {
      attack: 1,
      durability: 100,
      maxDurability: 100,
      weight: 1,
      balance: 50,
      soulCapacity: 10,
      repairPotential: 1,
      enchantSlots: 0,
      enchantPower: 0,
    },
    quality: 50,
    qualityGrade: 'common',
    qualityRank: 'C',
    warSoul: 0,
    maxWarSoul: 10,
    createdAt: 0,
    adventureCount: 0,
    sellPrice: 0,
    hiddenTags: [],
    combatMaterialId: 'iron',
    currentDurability: 100,
    epicMultiplier: 1,
    techniquesUsed: [],
    activeDamageTags: tags,
    weaponLegacy: { hiddenMarks: [] },
    repairCondition: 'ok',
  }) as CraftedWeaponV2

describe('getActiveDamageTagLabels', () => {
  it('возвращает не больше maxLabels и счётчик more', () => {
    const w = minimalWeapon([
      { tagId: 'physical_slash_chip', severity: 'light' },
      { tagId: 'physical_loose_fitting', severity: 'moderate' },
      { tagId: 'physical_gouge_chunk', severity: 'light' },
    ])
    const r = getActiveDamageTagLabels(w, 2)
    expect(r.total).toBe(3)
    expect(r.labels.length).toBe(2)
    expect(r.more).toBe(1)
  })
})
