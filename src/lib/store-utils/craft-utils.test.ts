import { describe, expect, it } from 'vitest'
import {
  calculateAttack,
  calculateSellPrice,
  canStartCraft,
  isProcessComplete,
  getRemainingTime,
} from './craft-utils'
import type { CraftStartParams } from './types'

const craftBase = (): CraftStartParams => ({
  recipeId: 'r1',
  recipeName: 'Test',
  baseCraftTime: 60,
  canAfford: true,
  isRecipeUnlocked: true,
  playerLevel: 10,
  requiredLevel: 1,
  isAlreadyCrafting: false,
})

describe('calculateAttack', () => {
  it('increases with quality and material tier', () => {
    const low = calculateAttack('sword', 'common', 'iron', 30)
    const high = calculateAttack('sword', 'common', 'steel', 80)
    expect(high).toBeGreaterThan(low)
  })
})

describe('calculateSellPrice', () => {
  it('scales by tier and quality', () => {
    expect(calculateSellPrice(100, 85, 'common')).toBeGreaterThan(
      calculateSellPrice(100, 15, 'common')
    )
  })
})

describe('canStartCraft', () => {
  it('blocks when already crafting or locked or poor', () => {
    expect(
      canStartCraft({ ...craftBase(), isAlreadyCrafting: true }).can
    ).toBe(false)

    expect(
      canStartCraft({ ...craftBase(), isRecipeUnlocked: false }).can
    ).toBe(false)

    expect(
      canStartCraft({ ...craftBase(), canAfford: false }).can
    ).toBe(false)

    expect(
      canStartCraft({ ...craftBase(), playerLevel: 1, requiredLevel: 10 }).can
    ).toBe(false)
  })

  it('allows when all gates pass', () => {
    expect(canStartCraft(craftBase()).can).toBe(true)
  })
})

describe('process time helpers', () => {
  it('detects completion and non-negative remaining', () => {
    const now = 1_000_000
    expect(isProcessComplete(now - 1, now)).toBe(true)
    expect(isProcessComplete(now + 10_000, now)).toBe(false)
    expect(getRemainingTime(now + 5000, now)).toBe(5)
  })
})
