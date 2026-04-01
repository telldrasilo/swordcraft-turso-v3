import { describe, expect, it } from 'vitest'
import { huntBoarsCommon } from '@/modules/expeditions/data/missions/oak-grove-outskirts/hunt'
import type { AdventurerExtended } from '@/types/adventurer-extended'
import { calculateExpeditionResult } from '@/lib/expedition-calculator-v2'
import { missionModuleToCalculatorTemplate } from '@/lib/expedition-mission-bridge'

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

describe('missionModuleToCalculatorTemplate', () => {
  it('maps module mission to template digestible by calculateExpeditionResult', () => {
    const tpl = missionModuleToCalculatorTemplate(huntBoarsCommon)
    expect(tpl.id).toBe('oak_grove_hunt_boars_1')
    expect(tpl.type).toBe('hunt')
    expect(tpl.difficulty).toBe('easy')
    expect(tpl.duration).toBeGreaterThanOrEqual(60)
    expect(tpl.moduleObjective).toBe(huntBoarsCommon.objective)
    expect(tpl.moduleLocationName).toBeDefined()
    expect(tpl.moduleClientName).toBe(huntBoarsCommon.client.name)
    expect(tpl.reward.baseGold).toBeGreaterThan(0)
    expect(tpl.reward.baseWarSoul).toBeGreaterThan(0)
    expect(tpl.enemyTypes?.length).toBeGreaterThan(0)

    const adv = testAdventurer(5)
    const r = calculateExpeditionResult(adv, tpl, 2, 12)
    expect(r.successChance).toBeGreaterThanOrEqual(5)
    expect(r.successChance).toBeLessThanOrEqual(95)
  })
})
