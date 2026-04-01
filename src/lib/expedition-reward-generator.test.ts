import { describe, expect, it } from 'vitest'
import type { ExpeditionEvent } from '@/types/expedition-events'
import {
  applyRewards,
  generateRandomRewards,
  getRarityColor,
  getRarityName,
} from './expedition-reward-generator'

const stubEvent = (): ExpeditionEvent => ({
  id: 'ev1',
  instanceId: 'inst1',
  text: 'Fight',
  type: 'combat',
  icon: '⚔',
  conditions: {},
  triggeredAt: 0,
  order: 0,
})

describe('generateRandomRewards (stub)', () => {
  it('returns empty array until full implementation', () => {
    expect(generateRandomRewards(stubEvent())).toEqual([])
  })
})

describe('getRarityName / getRarityColor', () => {
  it('maps all rarities', () => {
    expect(getRarityName('common')).toContain('Обыч')
    expect(getRarityColor('legendary')).toMatch(/text-/)
  })
})

describe('applyRewards (stub)', () => {
  it('returns zeroed aggregate for now', () => {
    expect(applyRewards([])).toEqual({
      gold: 0,
      warSoul: 0,
      glory: 0,
      essence: 0,
      items: [],
      materials: [],
    })
  })
})
