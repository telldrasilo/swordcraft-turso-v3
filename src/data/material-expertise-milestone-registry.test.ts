import { describe, expect, it } from 'vitest'
import { getRegistryForecastExpertiseFactorExtras } from '@/data/material-expertise-milestone-registry'

describe('material-expertise-milestone-registry', () => {
  it('суммирует extras только для достигнутых порогов', () => {
    expect(getRegistryForecastExpertiseFactorExtras(0)).toBe(0)
    expect(getRegistryForecastExpertiseFactorExtras(79)).toBe(0)
    expect(getRegistryForecastExpertiseFactorExtras(80)).toBeCloseTo(0.002, 6)
    expect(getRegistryForecastExpertiseFactorExtras(99)).toBeCloseTo(0.002, 6)
    expect(getRegistryForecastExpertiseFactorExtras(100)).toBeCloseTo(0.005, 6)
  })
})
