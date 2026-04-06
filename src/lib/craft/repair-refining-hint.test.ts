import { describe, expect, it } from 'vitest'
import { formatRepairRefiningHint } from '@/lib/craft/repair-refining-hint'

describe('formatRepairRefiningHint', () => {
  it('counts iron ore and coal for iron ingot shortfall', () => {
    const s = formatRepairRefiningHint('ironIngot', 2, 5)
    expect(s).toContain('Железный слиток')
    expect(s).toMatch(/6×/)
    expect(s).toMatch(/4×/)
    expect(s).toContain('2× партия')
  })

  it('returns null when no shortfall', () => {
    expect(formatRepairRefiningHint('ironIngot', 0, 5)).toBeNull()
  })

  it('returns null for keys without refining recipe', () => {
    expect(formatRepairRefiningHint('soulEssence', 3, 20)).toBeNull()
  })

  it('notes required level when player is too low', () => {
    const s = formatRepairRefiningHint('steelIngot', 1, 1)
    expect(s).toContain('8')
  })
})
