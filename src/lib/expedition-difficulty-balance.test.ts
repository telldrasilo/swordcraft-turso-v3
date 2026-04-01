import { describe, expect, it } from 'vitest'
import { EXPEDITION_DIFFICULTY_BALANCE } from '@/lib/expedition-difficulty-balance'
import { difficultyInfo } from '@/data/expedition-templates'
import { DIFFICULTY_INFO } from '@/modules/expeditions/types/expedition.types'

describe('EXPEDITION_DIFFICULTY_BALANCE', () => {
  it('matches difficultyInfo numeric fields from expedition-templates', () => {
    for (const key of Object.keys(EXPEDITION_DIFFICULTY_BALANCE) as Array<
      keyof typeof EXPEDITION_DIFFICULTY_BALANCE
    >) {
      const b = EXPEDITION_DIFFICULTY_BALANCE[key]
      const row = difficultyInfo[key]
      expect(row.failureChance).toBe(b.failureChance)
      expect(row.weaponLossChance).toBe(b.weaponLossChance)
      expect(row.levelRange).toEqual(b.levelRange)
      expect(row.tier).toBe(b.tier)
    }
  })

  it('matches module DIFFICULTY_INFO subset', () => {
    for (const key of Object.keys(EXPEDITION_DIFFICULTY_BALANCE) as Array<
      keyof typeof EXPEDITION_DIFFICULTY_BALANCE
    >) {
      const b = EXPEDITION_DIFFICULTY_BALANCE[key]
      const m = DIFFICULTY_INFO[key]
      expect(m.failureChance).toBe(b.failureChance)
      expect(m.weaponLossChance).toBe(b.weaponLossChance)
      expect(m.levelRange).toEqual(b.levelRange)
      expect(m.rewardMultiplier).toBe(b.rewardMultiplier)
    }
  })
})
