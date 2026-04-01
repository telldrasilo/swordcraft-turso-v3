import { describe, expect, it } from 'vitest'
import type { Worker } from '@/store/slices/workers-slice'
import {
  findBestBlacksmith,
  hasEnoughStamina,
  calculateHireCost,
  calculateFireRefund,
} from './worker-utils'

const smith = (level: number, id: string): Worker => ({
  id,
  name: id,
  class: 'blacksmith',
  level,
  experience: 0,
  stamina: 50,
  stats: {
    speed: 1,
    quality: 1,
    stamina_max: 100,
    intelligence: 1,
    loyalty: 1,
  },
  assignment: '',
  hiredAt: 0,
  hireCost: 0,
})

describe('findBestBlacksmith', () => {
  it('picks highest level blacksmith', () => {
    const workers = [smith(3, 'a'), smith(7, 'b'), smith(5, 'c')]
    expect(findBestBlacksmith(workers)?.id).toBe('b')
  })

  it('returns null when no blacksmiths', () => {
    expect(findBestBlacksmith([])).toBeNull()
    expect(
      findBestBlacksmith([
        { ...smith(1, 'm'), class: 'miner' },
      ])
    ).toBeNull()
  })
})

describe('hasEnoughStamina', () => {
  it('compares values', () => {
    expect(hasEnoughStamina(10, 5)).toBe(true)
    expect(hasEnoughStamina(4, 5)).toBe(false)
  })
})

describe('hire / fire economics', () => {
  it('returns positive hire cost and partial refund', () => {
    const cost = calculateHireCost('blacksmith', 1)
    expect(cost).toBeGreaterThan(0)
    expect(calculateFireRefund(cost)).toBeGreaterThan(0)
    expect(calculateFireRefund(cost)).toBeLessThan(cost)
  })
})
