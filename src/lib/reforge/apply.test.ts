import { describe, expect, it } from 'vitest'
import { applyReforgeTechniquePure, listScarCandidates } from '@/lib/reforge/apply'
import type { CraftedWeaponV2 } from '@/types/craft-v2'
import { canAccessEnchantmentAltarScreen } from '@/lib/enchantment-screen-access'

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
      attack: 100,
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
    warSoul: 200_000,
    maxWarSoul: 500_000,
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

/** Уровень гильдии 5 и кузнеца 10 — tier-2 гильдия и плавки (железо/сталь) по реестру. */
const ctx = {
  guildLevel: 5,
  playerLevel: 10,
  unlockedMaterialProcessingTechniqueIds: [] as string[],
  unlockedReforgeTechniqueIds: [] as string[],
}

describe('applyReforgeTechniquePure', () => {
  it('buff attack: spends fixed war soul and adds random % in range (min when rng=0)', () => {
    const w = baseWeapon()
    const r = applyReforgeTechniquePure(w, 'reforge_buff_attack_01', ctx, () => 0)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.outcome).toBe('buff')
    expect(r.weapon.warSoul).toBe(200_000 - 5_000)
    expect(r.weapon.stats.attack).toBe(101)
  })

  it('buff attack: respects max stacks', () => {
    let w = baseWeapon({ warSoul: 1_000_000 })
    for (let i = 0; i < 5; i++) {
      const r = applyReforgeTechniquePure(w, 'reforge_buff_attack_01', ctx, () => 0.5)
      expect(r.ok).toBe(true)
      if (!r.ok) return
      w = r.weapon
    }
    const fail = applyReforgeTechniquePure(w, 'reforge_buff_attack_01', ctx, () => 0)
    expect(fail.ok).toBe(false)
    if (fail.ok) return
    expect(fail.reason).toBe('max_stacks')
  })

  it('fails when insufficient war soul for buff', () => {
    const w = baseWeapon({ warSoul: 100 })
    const r = applyReforgeTechniquePure(w, 'reforge_buff_attack_01', ctx, () => 0)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.reason).toBe('insufficient_war_soul')
  })

  it('awakenScar: fails without scar weights', () => {
    const w = baseWeapon()
    const r = applyReforgeTechniquePure(w, 'reforge_awaken_scar_01', ctx, () => 0)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.reason).toBe('no_scars')
  })

  it('awakenScar: success spends all war soul and sets scarAwakeningCompleted', () => {
    const w = baseWeapon({
      weaponLegacy: {
        hiddenMarks: [],
        physicalScarWeights: { chip: 2 },
      },
    })
    const r = applyReforgeTechniquePure(w, 'reforge_awaken_scar_01', ctx, () => 0)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.outcome).toBe('awaken_success')
    expect(r.weapon.warSoul).toBe(0)
    expect(r.weapon.weaponReforge?.scarAwakeningCompleted).toBe(true)
    expect(r.weapon.weaponReforge?.awakenedScarKeys?.['physical:chip']).toBe(true)
  })

  it('awakenScar: fail spends all war soul', () => {
    const w = baseWeapon({
      weaponLegacy: {
        hiddenMarks: [],
        physicalScarWeights: { chip: 2 },
      },
    })
    const r = applyReforgeTechniquePure(w, 'reforge_awaken_scar_01', ctx, () => 0.99)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.outcome).toBe('awaken_fail')
    expect(r.weapon.warSoul).toBe(0)
    expect(r.weapon.weaponReforge?.scarAwakeningCompleted).toBeUndefined()
  })

  it('awakenScar: fails with locked_guild when guild below minGuildLevel', () => {
    const w = baseWeapon({
      weaponLegacy: {
        hiddenMarks: [],
        physicalScarWeights: { chip: 2 },
      },
    })
    const lowGuild = { ...ctx, guildLevel: 2 }
    const r = applyReforgeTechniquePure(w, 'reforge_awaken_scar_01', lowGuild, () => 0)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.reason).toBe('locked_guild')
  })

  it('buff attack 02: fails with locked_technique when player level too low for source smelt', () => {
    const w = baseWeapon()
    const lowLevel = { ...ctx, playerLevel: 1, unlockedReforgeTechniqueIds: [] as string[] }
    const r = applyReforgeTechniquePure(w, 'reforge_buff_attack_02', lowLevel, () => 0)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.reason).toBe('locked_technique')
  })

  it('buff attack 02: unlocks via intendant purchase id without craft level', () => {
    const w = baseWeapon()
    const lowLevelBought = {
      ...ctx,
      playerLevel: 1,
      unlockedReforgeTechniqueIds: ['reforge_buff_attack_02'] as string[],
    }
    const r = applyReforgeTechniquePure(w, 'reforge_buff_attack_02', lowLevelBought, () => 0)
    expect(r.ok).toBe(true)
  })

  it('awakenScar: blocks second attempt after successful awakening', () => {
    const w0 = baseWeapon({
      warSoul: 50_000,
      weaponLegacy: {
        hiddenMarks: [],
        physicalScarWeights: { a: 1, b: 1 },
      },
      weaponReforge: {
        scarAwakeningCompleted: true,
        awakenedScarKeys: { 'physical:a': true },
      },
    })
    const r = applyReforgeTechniquePure(w0, 'reforge_awaken_scar_01', ctx, () => 0)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.reason).toBe('scar_awakening_already_done')
  })
})

describe('listScarCandidates', () => {
  it('collects physical and elemental keys', () => {
    const c = listScarCandidates({
      hiddenMarks: [],
      physicalScarWeights: { a: 1 },
      elementalScarWeights: { fire: 3 },
    })
    expect(c.map((x) => x.key)).toEqual(['elemental:fire', 'physical:a'])
  })
})

describe('canAccessEnchantmentAltarScreen', () => {
  it('opens at guild level 3 (tier-2 pool)', () => {
    expect(canAccessEnchantmentAltarScreen(2)).toBe(false)
    expect(canAccessEnchantmentAltarScreen(3)).toBe(true)
  })
})
