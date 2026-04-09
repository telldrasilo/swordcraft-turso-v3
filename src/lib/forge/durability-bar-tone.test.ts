import { describe, expect, it } from 'vitest'
import {
  durabilityBarFillClass,
  durabilityLabelTextClass,
  durabilityPercentValue,
} from '@/lib/forge/durability-bar-tone'

describe('durabilityPercentValue', () => {
  it('returns 0–100', () => {
    expect(durabilityPercentValue(0, 100)).toBe(0)
    expect(durabilityPercentValue(50, 100)).toBe(50)
    expect(durabilityPercentValue(100, 100)).toBe(100)
  })
  it('clamps when max is 0', () => {
    expect(durabilityPercentValue(5, 0)).toBe(100)
  })
})

describe('durability tone classes', () => {
  it('matches >50 / >25 thresholds', () => {
    expect(durabilityBarFillClass(51)).toContain('green')
    expect(durabilityBarFillClass(50)).toContain('yellow')
    expect(durabilityBarFillClass(26)).toContain('yellow')
    expect(durabilityBarFillClass(25)).toContain('red')
    expect(durabilityLabelTextClass(51)).toContain('green')
    expect(durabilityLabelTextClass(25)).toContain('red')
  })
})
