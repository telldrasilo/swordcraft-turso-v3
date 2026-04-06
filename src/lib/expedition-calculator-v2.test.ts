import { describe, expect, it } from 'vitest'
import { expeditionTemplates } from '@/data/expedition-templates'
import type { AdventurerExtended } from '@/types/adventurer-extended'
import {
  calculateExpeditionResult,
  formatModifierValue,
  getRatingBgColor,
  getRatingColor,
} from '@/lib/expedition-calculator-v2'

const easyHunt = expeditionTemplates.find((t) => t.id === 'oak_grove_hunt_boars_1')
const normalHunt = expeditionTemplates.find((t) => t.id === 'oak_grove_hunt_wolves_1')

function requireTemplate(
  t: (typeof expeditionTemplates)[number] | undefined,
  id: string
): NonNullable<typeof t> {
  expect(t).toBeDefined()
  if (!t) throw new Error(`fixture: ${id}`)
  return t
}

function testAdventurer(combatLevel: number): AdventurerExtended {
  return {
    id: 'test_adv',
    identity: {
      firstName: 'Test',
      gender: 'male',
      portraitId: 1,
    },
    combat: {
      level: combatLevel,
      rarity: 'common',
      power: 12,
      precision: 12,
      endurance: 12,
      luck: 12,
      combatStyle: 'berserker',
      preferredWeapons: ['sword'],
      avoidedWeapons: [],
    },
    personality: {
      primaryTrait: 'brave',
      riskTolerance: 'balanced',
      motivations: ['gold'],
      socialTags: ['newcomer'],
    },
    traits: [],
    uniqueBonuses: [],
    strengths: [],
    weaknesses: [],
    requirements: { minAttack: 5 },
    createdAt: 0,
    expiresAt: 9_999_999,
  }
}

describe('calculateExpeditionResult', () => {
  it('has numeric invariants and optimal levelMatch for easy mission', () => {
    const tpl = requireTemplate(easyHunt, 'oak_grove_hunt_boars_1')
    const adv = testAdventurer(5)
    const r = calculateExpeditionResult(adv, tpl, 3, 12)

    expect(r.successChance).toBeGreaterThanOrEqual(5)
    expect(r.successChance).toBeLessThanOrEqual(95)
    expect(r.weaponLossChance).toBeGreaterThanOrEqual(0)
    expect(r.weaponLossChance).toBeLessThanOrEqual(50)
    expect(r.critChance).toBeGreaterThanOrEqual(0)
    expect(r.critChance).toBeLessThanOrEqual(25)
    expect(r.weaponWear).toBeGreaterThanOrEqual(1)
    expect(r.weaponWear).toBeLessThanOrEqual(50)
    expect(r.warSoul).toBeGreaterThanOrEqual(1)
    expect(r.guildGloryOnSuccess).toBeGreaterThanOrEqual(0)
    expect(Array.isArray(r.gloryModifiers)).toBe(true)
    expect(r.levelMatch.match).toBe('optimal')
    expect(r.recommendation.rating).toMatch(/excellent|good|risky|dangerous/)
  })

  it('economy: higher guild level takes more for guild, less for blacksmith (exploration 20%)', () => {
    const tpl = requireTemplate(easyHunt, 'oak_grove_hunt_boars_1')
    const adv = testAdventurer(5)
    const low = calculateExpeditionResult(adv, tpl, 1, 12)
    const high = calculateExpeditionResult(adv, tpl, 9, 12)

    expect(low.economy.clientGrossGold).toBe(high.economy.clientGrossGold)
    expect(high.economy.guildFeeGold).toBeGreaterThan(low.economy.guildFeeGold)
    expect(high.commission).toBe(high.economy.blacksmithGold)
    expect(high.commission).toBeLessThanOrEqual(low.commission)
    const gross = low.economy.clientGrossGold
    expect(low.economy.guildFeeGold).toBe(Math.floor((gross * 15) / 100))
    expect(high.economy.guildFeeGold).toBe(Math.floor((gross * 30) / 100))
    const poolLow = gross - low.economy.guildFeeGold
    expect(low.commission).toBe(Math.floor((poolLow * 20) / 100))
  })

  it('speed contract gives blacksmith a larger share than exploration at same guild level', () => {
    const tpl = requireTemplate(easyHunt, 'oak_grove_hunt_boars_1')
    const adv = testAdventurer(5)
    const explore = calculateExpeditionResult(adv, tpl, 3, 12, 50, 'sword', 'w', undefined, undefined, undefined, 50, 'exploration')
    const speed = calculateExpeditionResult(adv, tpl, 3, 12, 50, 'sword', 'w', undefined, undefined, undefined, 50, 'speed')
    expect(speed.commission).toBeGreaterThan(explore.commission)
  })

  it('levelMatch dangerous when adventurer far below mission tier', () => {
    const tpl = requireTemplate(normalHunt, 'oak_grove_hunt_wolves_1')
    // normal: levelRange [8, 20] → dangerous if level < 8 - 5 = 3
    const adv = testAdventurer(2)
    const r = calculateExpeditionResult(adv, tpl, 1, 15)

    expect(r.levelMatch.match).toBe('dangerous')
  })

  it('levelMatch overlevel when adventurer far above easy mission band', () => {
    const tpl = requireTemplate(easyHunt, 'oak_grove_hunt_boars_1')
    const adv = testAdventurer(22)
    const r = calculateExpeditionResult(adv, tpl, 1, 12)

    expect(r.levelMatch.match).toBe('overlevel')
  })

  it('lower weapon durability does not break invariants', () => {
    const tpl = requireTemplate(easyHunt, 'oak_grove_hunt_boars_1')
    const adv = testAdventurer(5)
    const r = calculateExpeditionResult(adv, tpl, 3, 12, 15)
    expect(r.successChance).toBeGreaterThanOrEqual(5)
    expect(r.successChance).toBeLessThanOrEqual(95)
    expect(r.commission).toBeGreaterThanOrEqual(0)
  })

  it('data trait (adventurer.traits catalog) affects calculation via modifiers (wear)', () => {
    const tpl = requireTemplate(easyHunt, 'oak_grove_hunt_boars_1')
    const base = testAdventurer(5)
    const withCautious: AdventurerExtended = {
      ...base,
      traits: [
        {
          id: 'cautious',
          name: 'Осторожный',
          icon: '🛡️',
          description: 'Бережёт себя и снаряжение',
          effects: { wear: -20 },
        },
      ],
    }
    const r0 = calculateExpeditionResult(base, tpl, 3, 12)
    const r1 = calculateExpeditionResult(withCautious, tpl, 3, 12)
    expect(r1.weaponWear).toBeLessThan(r0.weaponWear)
    expect(r1.weaponWearModifiers.some((m) => m.source === 'Осторожный')).toBe(true)
  })

  it('unique bonus merchant increases blacksmith commission (gold modifier chain)', () => {
    const tpl = requireTemplate(easyHunt, 'oak_grove_hunt_boars_1')
    const base = testAdventurer(5)
    const withMerchant: AdventurerExtended = {
      ...base,
      uniqueBonuses: [
        {
          id: 'merchant',
          name: 'Торговец',
          description: 'Умеет торговаться за награду',
          type: 'merchant',
          value: 30,
        },
      ],
    }
    const r0 = calculateExpeditionResult(base, tpl, 3, 12)
    const r1 = calculateExpeditionResult(withMerchant, tpl, 3, 12)
    expect(r1.commission).toBeGreaterThan(r0.commission)
    expect(r1.goldModifiers.some((m) => m.source === 'Торговец')).toBe(true)
  })
})

describe('formatModifierValue', () => {
  it('adds plus for positive and keeps sign for non-positive', () => {
    expect(formatModifierValue(7.4)).toBe('+7%')
    expect(formatModifierValue(-3)).toBe('-3%')
    expect(formatModifierValue(0)).toBe('0%')
  })
})

describe('rating colors', () => {
  it('getRatingColor maps known ratings and defaults', () => {
    expect(getRatingColor('excellent')).toBe('text-green-400')
    expect(getRatingColor('dangerous')).toBe('text-red-400')
    expect(getRatingColor('unknown')).toBe('text-stone-400')
  })

  it('getRatingBgColor maps known ratings and defaults', () => {
    expect(getRatingBgColor('good')).toBe('bg-blue-900/30 border-blue-600/50')
    expect(getRatingBgColor('risky')).toBe('bg-amber-900/30 border-amber-600/50')
    expect(getRatingBgColor('')).toBe('bg-stone-900/30 border-stone-600/50')
  })
})
