import { describe, expect, it } from 'vitest'
import { expeditionTemplates } from '@/data/expedition-templates'
import type { AdventurerExtended } from '@/types/adventurer-extended'
import {
  calculateExpeditionResult,
  formatModifierValue,
  getRatingBgColor,
  getRatingColor,
} from '@/lib/expedition-calculator-v2'

const goblinHunt = expeditionTemplates.find((t) => t.id === 'goblin_hunt')
const wolfPack = expeditionTemplates.find((t) => t.id === 'wolf_pack')

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
    expect(goblinHunt).toBeDefined()
    const adv = testAdventurer(5)
    const r = calculateExpeditionResult(adv, goblinHunt!, 3, 12)

    expect(r.successChance).toBeGreaterThanOrEqual(5)
    expect(r.successChance).toBeLessThanOrEqual(95)
    expect(r.weaponLossChance).toBeGreaterThanOrEqual(0)
    expect(r.weaponLossChance).toBeLessThanOrEqual(50)
    expect(r.critChance).toBeGreaterThanOrEqual(0)
    expect(r.critChance).toBeLessThanOrEqual(25)
    expect(r.weaponWear).toBeGreaterThanOrEqual(1)
    expect(r.weaponWear).toBeLessThanOrEqual(50)
    expect(r.warSoul).toBeGreaterThanOrEqual(1)
    expect(r.levelMatch.match).toBe('optimal')
    expect(r.recommendation.rating).toMatch(/excellent|good|risky|dangerous/)
  })

  it('commission increases (or stays equal) with higher guild level for same gold path', () => {
    expect(goblinHunt).toBeDefined()
    const adv = testAdventurer(5)
    const low = calculateExpeditionResult(adv, goblinHunt!, 1, 12)
    const high = calculateExpeditionResult(adv, goblinHunt!, 9, 12)

    // Same inputs → same finalGold path; commission % rises 15% → 30% capped
    expect(high.commission).toBeGreaterThanOrEqual(low.commission)
    const gold = goblinHunt!.reward.baseGold
    const expectedLow = Math.floor(gold * 0.15)
    const expectedHigh = Math.floor(gold * 0.3)
    expect(low.commission).toBe(expectedLow)
    expect(high.commission).toBe(expectedHigh)
  })

  it('levelMatch dangerous when adventurer far below mission tier', () => {
    expect(wolfPack).toBeDefined()
    // normal: levelRange [8, 20] → dangerous if level < 8 - 5 = 3
    const adv = testAdventurer(2)
    const r = calculateExpeditionResult(adv, wolfPack!, 1, 15)

    expect(r.levelMatch.match).toBe('dangerous')
  })

  it('levelMatch overlevel when adventurer far above easy mission band', () => {
    expect(goblinHunt).toBeDefined()
    const adv = testAdventurer(22)
    const r = calculateExpeditionResult(adv, goblinHunt!, 1, 12)

    expect(r.levelMatch.match).toBe('overlevel')
  })

  it('lower weapon durability does not break invariants', () => {
    expect(goblinHunt).toBeDefined()
    const adv = testAdventurer(5)
    const r = calculateExpeditionResult(adv, goblinHunt!, 3, 12, 15)
    expect(r.successChance).toBeGreaterThanOrEqual(5)
    expect(r.successChance).toBeLessThanOrEqual(95)
    expect(r.commission).toBeGreaterThanOrEqual(0)
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
