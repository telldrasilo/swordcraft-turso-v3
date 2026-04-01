import { afterEach, describe, expect, it } from 'vitest'
import type { AdventurerExtended } from '@/types/adventurer-extended'
import type { ModifierContext, ModifierProvider } from './types'
import { calculateModifiers, modifierRegistry } from './registry'

const minimalAdventurer = (): AdventurerExtended => ({
  id: 'a',
  identity: { firstName: 'T', gender: 'male', portraitId: 1 },
  combat: {
    level: 5,
    rarity: 'common',
    power: 10,
    precision: 10,
    endurance: 10,
    luck: 10,
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
  requirements: { minAttack: 1 },
  createdAt: 0,
  expiresAt: 9_999_999,
})

const minimalContext = (): ModifierContext => ({
  adventurer: minimalAdventurer(),
  expedition: {
    id: 'e1',
    type: 'scout',
    difficulty: 'easy',
    duration: 1,
    minWeaponAttack: 5,
  },
  weapon: {
    id: 'w1',
    type: 'sword',
    attack: 10,
    quality: 50,
    durability: 80,
  },
  guild: { level: 1, glory: 0 },
})

const baseValues = () => ({
  successChance: 60,
  gold: 100,
  warSoul: 5,
  glory: 0,
  weaponWear: 10,
  weaponLossChance: 5,
  critChance: 5,
  commission: 0,
} as const)

afterEach(() => {
  modifierRegistry.unregister('_test_provider')
})

describe('modifierRegistry.calculate', () => {
  it('applies additive modifier from a registered provider', () => {
    const provider: ModifierProvider = {
      name: '_test_provider',
      priority: 0,
      getModifiers: () => [
        {
          id: 'test_add',
          target: 'successChance',
          operation: 'add',
          value: 7,
          source: {
            type: 'test',
            id: 'unit',
            name: 'Test',
            icon: '?',
          },
        },
      ],
    }
    modifierRegistry.register(provider)
    const r = calculateModifiers(minimalContext(), { ...baseValues() })
    expect(r.totals.successChance).toBe(67)
    const applied = r.appliedModifiers.filter(m => m.id === 'test_add' && m.applied)
    expect(applied.length).toBe(1)
  })
})
