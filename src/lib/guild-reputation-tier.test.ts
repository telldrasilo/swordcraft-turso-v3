import { describe, expect, it } from 'vitest'
import { initialGuildState } from '@/types/guild'
import {
  clampReputationToRankCap,
  getRankUpCost,
  getReputationCapForCurrentRank,
  getReputationPointsToAffordRankUp,
  migrateGuildReputationTierFromLegacy,
  MAX_GUILD_LEVEL,
} from './guild-reputation-tier'

describe('guild-reputation-tier', () => {
  it('rank up cost for level 1 is 500', () => {
    expect(getRankUpCost(1)).toBe(500)
  })

  it('clamps progress to rank cap at level 1', () => {
    expect(clampReputationToRankCap(1, 600)).toBe(500)
    expect(clampReputationToRankCap(1, 100)).toBe(100)
  })

  it('max level has no cap for clamp', () => {
    expect(clampReputationToRankCap(MAX_GUILD_LEVEL, 999999)).toBe(999999)
  })

  it('points to afford rank up', () => {
    expect(getReputationPointsToAffordRankUp(1, 400)).toBe(100)
    expect(getReputationPointsToAffordRankUp(1, 500)).toBe(0)
  })

  it('migrates legacy cumulative to tier progress', () => {
    const g = migrateGuildReputationTierFromLegacy({
      ...initialGuildState,
      reputation: 800,
      level: 1,
    })
    expect(g.level).toBe(2)
    expect(g.reputation).toBe(300)
  })

  it('migrates max tier legacy total', () => {
    const g = migrateGuildReputationTierFromLegacy({
      ...initialGuildState,
      reputation: 70000,
      level: 5,
    })
    expect(g.level).toBe(10)
    expect(g.reputation).toBe(70000 - 65000)
  })

  it('getReputationCapForCurrentRank at max is huge', () => {
    expect(getReputationCapForCurrentRank(MAX_GUILD_LEVEL)).toBe(Number.MAX_SAFE_INTEGER)
  })
})
