import { describe, expect, it } from 'vitest'
import type { Adventurer } from '@/types/guild'
import { getBonusById } from '@/data/unique-bonuses'
import { convertToExtended, convertToLegacy } from './adventurer-converter'

function poolAdventurer(overrides: Partial<Adventurer> = {}): Adventurer {
  return {
    id: 'pool-adv-1',
    name: 'Торин Стальной',
    skill: 25,
    traits: [],
    uniqueBonuses: [],
    requirements: { minAttack: 5 },
    portrait: 7,
    createdAt: 1000,
    expiresAt: 2000,
    ...overrides,
  }
}

describe('convertToExtended', () => {
  it('два вызова с тем же id дают одинаковую личность (детерминированный seed)', () => {
    const a = poolAdventurer()
    const x1 = convertToExtended(a)
    const x2 = convertToExtended(a)
    expect(x1.personality).toEqual(x2.personality)
    expect(x1.strengths).toEqual(x2.strengths)
    expect(x1.weaknesses).toEqual(x2.weaknesses)
  })

  it('пробрасывает uniqueBonuses из каталога в extended', () => {
    const merchant = getBonusById('merchant')
    expect(merchant).toBeDefined()
    if (!merchant) return
    const a = poolAdventurer({ uniqueBonuses: [merchant] })
    const x = convertToExtended(a)
    expect(x.uniqueBonuses).toHaveLength(1)
    expect(x.uniqueBonuses[0]?.id).toBe('merchant')
  })

  it('portraitId из пула', () => {
    const a = poolAdventurer({ portrait: 42 })
    expect(convertToExtended(a).identity.portraitId).toBe(42)
  })

  it('сохраняет createdAt/expiresAt пула', () => {
    const a = poolAdventurer({ createdAt: 111, expiresAt: 222 })
    const x = convertToExtended(a)
    expect(x.createdAt).toBe(111)
    expect(x.expiresAt).toBe(222)
  })
})

describe('convertToLegacy', () => {
  it('восстанавливает uniqueBonuses по id из каталога', () => {
    const merchant = getBonusById('merchant')
    expect(merchant).toBeDefined()
    if (!merchant) return
    const a = poolAdventurer({ uniqueBonuses: [merchant] })
    const x = convertToExtended(a)
    const leg = convertToLegacy(x)
    expect(leg.uniqueBonuses).toHaveLength(1)
    expect(leg.uniqueBonuses[0]?.id).toBe('merchant')
  })
})
