import { describe, expect, it } from 'vitest'
import {
  getQualityColor,
  getQualityColorV2,
  getQualityGrade,
  getQualityGradeV2,
  getQualityMultiplier,
  getQualityMultiplierV2,
  getQualityNameRu,
} from './quality'

describe('quality v1 helpers', () => {
  it('maps boundaries to expected grade, multiplier, color', () => {
    expect(getQualityGrade(0)).toBe('poor')
    expect(getQualityMultiplier(0)).toBeCloseTo(0.6)
    expect(getQualityColor(0)).toBe('text-red-400')

    expect(getQualityGrade(50)).toBe('common')
    expect(getQualityMultiplier(50)).toBe(1.0)

    expect(getQualityGrade(100)).toBe('legendary')
    expect(getQualityMultiplier(100)).toBe(3.0)
  })
})

describe('quality v2 helpers', () => {
  it('maps boundaries and Russian labels', () => {
    expect(getQualityGradeV2(0)).toBe('poor')
    expect(getQualityMultiplierV2(30)).toBeCloseTo(0.7)
    expect(getQualityColorV2(45)).toBe('text-gray-400')
    expect(getQualityNameRu(45)).toBe('Обычное')

    expect(getQualityGradeV2(100)).toBe('legendary')
    expect(getQualityNameRu(100)).toBe('Легендарное')
  })
})

describe('fallbacks for out-of-range quality', () => {
  it('defaults to common / Обычное when no band matches', () => {
    expect(getQualityGrade(-5)).toBe('common')
    expect(getQualityMultiplier(-5)).toBe(1.0)
    expect(getQualityGradeV2(200)).toBe('common')
    expect(getQualityMultiplierV2(200)).toBe(1.0)
    expect(getQualityColorV2(200)).toBe('text-gray-400')
    expect(getQualityNameRu(200)).toBe('Обычное')
  })
})
