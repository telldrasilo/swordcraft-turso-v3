import { describe, expect, it } from 'vitest'
import {
  getTitleByLevel,
  getNextTitle,
  getLevelProgress,
  addFame,
  calculateFameBonus,
} from './player-utils'

describe('getTitleByLevel', () => {
  it('returns a title for low and high levels', () => {
    expect(getTitleByLevel(1).length).toBeGreaterThan(0)
    expect(getTitleByLevel(25).length).toBeGreaterThan(0)
  })
})

describe('getNextTitle', () => {
  it('returns null at high level', () => {
    expect(getNextTitle(999)).toBeNull()
  })
})

describe('getLevelProgress', () => {
  it('clamps to 0–100', () => {
    expect(getLevelProgress(0, 100)).toBe(0)
    expect(getLevelProgress(50, 100)).toBe(50)
    expect(getLevelProgress(150, 100)).toBe(100)
  })
})

describe('fame helpers', () => {
  it('addFame never goes negative', () => {
    expect(addFame(10, -5)).toBe(5)
  })

  it('calculateFameBonus is non-negative', () => {
    expect(calculateFameBonus(5)).toBeGreaterThanOrEqual(0)
  })
})
