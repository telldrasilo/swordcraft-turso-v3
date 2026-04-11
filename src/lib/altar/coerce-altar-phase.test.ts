import { describe, expect, it } from 'vitest'
import { coerceAltarPhase } from '@/lib/altar/coerce-altar-phase'

describe('coerceAltarPhase', () => {
  it('accepts numbers and numeric strings', () => {
    expect(coerceAltarPhase(2)).toBe(2)
    expect(coerceAltarPhase('3')).toBe(3)
  })

  it('returns null for invalid', () => {
    expect(coerceAltarPhase(null)).toBeNull()
    expect(coerceAltarPhase('x')).toBeNull()
    expect(coerceAltarPhase(6)).toBeNull()
  })
})
