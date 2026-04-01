import { describe, expect, it } from 'vitest'
import {
  describeQualityRange,
  getQualityWithinGradeDisplay,
} from '@/lib/craft/quality-display'

describe('getQualityWithinGradeDisplay', () => {
  it('poor tier lower bound', () => {
    const d = getQualityWithinGradeDisplay(0)
    expect(d.grade).toBe('poor')
    expect(d.step).toBe(1)
    expect(d.steps).toBe(31)
    expect(d.nextGradeMin).toBe(31)
    expect(d.progressInGrade).toBe(0)
  })

  it('poor tier upper bound', () => {
    const d = getQualityWithinGradeDisplay(30)
    expect(d.grade).toBe('poor')
    expect(d.step).toBe(31)
    expect(d.steps).toBe(31)
    expect(d.progressInGrade).toBe(1)
  })

  it('common tier lower bound', () => {
    const d = getQualityWithinGradeDisplay(31)
    expect(d.grade).toBe('common')
    expect(d.step).toBe(1)
    expect(d.steps).toBe(20)
  })

  it('legendary tier', () => {
    const d = getQualityWithinGradeDisplay(100)
    expect(d.grade).toBe('legendary')
    expect(d.step).toBe(5)
    expect(d.steps).toBe(5)
    expect(d.nextGradeMin).toBeNull()
    expect(d.progressInGrade).toBe(1)
  })

  it('clamps out of range', () => {
    expect(getQualityWithinGradeDisplay(-5).min).toBe(0)
    expect(getQualityWithinGradeDisplay(150).grade).toBe('legendary')
  })
})

describe('describeQualityRange', () => {
  it('single grade range', () => {
    expect(describeQualityRange(10, 12)).toContain('Плохое')
    expect(describeQualityRange(10, 12)).toMatch(/шаги/)
  })

  it('crosses grades', () => {
    const s = describeQualityRange(28, 35)
    expect(s).toContain('…')
  })
})
