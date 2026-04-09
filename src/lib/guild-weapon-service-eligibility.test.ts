import { describe, expect, it } from 'vitest'
import { getWeaponGuildServiceBlockReason } from '@/lib/guild-weapon-service-eligibility'
import type { CraftedWeaponV2 } from '@/types/craft-v2'

function baseWeapon(over: Partial<CraftedWeaponV2> = {}): CraftedWeaponV2 {
  return {
    id: 'w',
    recipeId: 'basic_sword',
    prefix: '',
    baseName: 'меч',
    suffix: '',
    fullName: 'меч',
    type: 'sword',
    tier: 1,
    materials: [],
    stats: {
      attack: 20,
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
    sellPrice: 10,
    hiddenTags: [],
    combatMaterialId: 'iron',
    currentDurability: 100,
    epicMultiplier: 1,
    techniquesUsed: [],
    activeDamageTags: [],
    weaponLegacy: { hiddenMarks: [] },
    repairCondition: 'ok',
    ...over,
  } as CraftedWeaponV2
}

describe('getWeaponGuildServiceBlockReason', () => {
  it('returns null for healthy weapon', () => {
    expect(getWeaponGuildServiceBlockReason(baseWeapon())).toBeNull()
  })

  it('blocks low durability ratio', () => {
    const w = baseWeapon({ currentDurability: 10, stats: { ...baseWeapon().stats, maxDurability: 100 } })
    expect(getWeaponGuildServiceBlockReason(w)).toMatch(/прочност/i)
  })

  it('allows visible damage tags when durability is at least 50%', () => {
    const w = baseWeapon({
      currentDurability: 60,
      activeDamageTags: [{ tagId: 'physical_slash_chip', severity: 'light', appliedAt: 0 }],
    })
    expect(getWeaponGuildServiceBlockReason(w)).toBeNull()
  })

  it('blocks visible damage tags when durability is below 50%', () => {
    const w = baseWeapon({
      currentDurability: 49,
      activeDamageTags: [{ tagId: 'physical_slash_chip', severity: 'light', appliedAt: 0 }],
    })
    expect(getWeaponGuildServiceBlockReason(w)).toMatch(/50%/i)
  })

  it('blocks needsProperRepair', () => {
    expect(getWeaponGuildServiceBlockReason(baseWeapon({ repairCondition: 'needsProperRepair' }))).toMatch(
      /полноценн/i
    )
  })

  it('blocks temporaryPatch', () => {
    expect(getWeaponGuildServiceBlockReason(baseWeapon({ repairCondition: 'temporaryPatch' }))).toMatch(
      /заплат/i
    )
  })

  it('blocks when workbench session active and weapon has planned queue item', () => {
    const w = baseWeapon({ id: 'qw' })
    expect(
      getWeaponGuildServiceBlockReason(w, [], {
        workbenchQueue: [
          {
            kind: 'repair',
            queueItemId: 'q1',
            weaponId: 'qw',
            status: 'running',
            techniqueIds: [],
            queuedAt: 0,
          },
          {
            kind: 'repair',
            queueItemId: 'q2',
            weaponId: 'qw',
            status: 'planned',
            techniqueIds: [],
            queuedAt: 0,
          },
        ],
        repairTechniqueStageRun: null,
      })
    ).toMatch(/верстак/i)
  })

  it('does not block planned-only when session not active', () => {
    const w = baseWeapon({ id: 'qw' })
    expect(
      getWeaponGuildServiceBlockReason(w, [], {
        workbenchQueue: [
          {
            kind: 'repair',
            queueItemId: 'q1',
            weaponId: 'qw',
            status: 'planned',
            techniqueIds: [],
            queuedAt: 0,
          },
        ],
        repairTechniqueStageRun: null,
      })
    ).toBeNull()
  })
})
