import { describe, expect, it, vi } from 'vitest'
import type { GuildState } from '@/types/guild'
import { initialPlayer, initialStatistics } from '@/store/slices/player-slice'
import { buildGuildExpeditionCrossSlice } from './guild-expedition-cross-slice'
import type { GuildExpeditionStoreDeps } from './guild-expedition-cross-slice'

function emptyGuild(): GuildState {
  return {
    level: 1,
    reputation: 0,
    totalReputation: 0,
    glory: 0,
    totalGlory: 0,
    adventurers: [],
    adventurerRefreshAt: 0,
    knownAdventurers: [],
    maxKnownAdventurers: 5,
    activeExpeditions: [],
    recoveryQuests: [],
    history: [],
    stats: {
      totalExpeditions: 0,
      successfulExpeditions: 0,
      failedExpeditions: 0,
      weaponsLost: 0,
      weaponsRecovered: 0,
      totalCommission: 0,
      totalWarSoul: 0,
      totalGlory: 0,
    },
  }
}

function mockDeps(over: Partial<GuildExpeditionStoreDeps> = {}): GuildExpeditionStoreDeps {
  return {
    guild: emptyGuild(),
    weaponInventory: { weapons: [] },
    player: initialPlayer,
    statistics: initialStatistics,
    canAfford: () => true,
    spendResource: vi.fn(),
    addResource: vi.fn(),
    addExperience: vi.fn(),
    updateStatistics: vi.fn(),
    removeWeapon: vi.fn(() => false),
    addWarSoulToWeapon: vi.fn(() => false),
    ...over,
  }
}

describe('buildGuildExpeditionCrossSlice', () => {
  it('completeExpeditionFull returns null when id not found', () => {
    const set = vi.fn()
    const get = vi.fn(() => mockDeps())
    const { completeExpeditionFull } = buildGuildExpeditionCrossSlice(set, get)
    expect(completeExpeditionFull('unknown_expedition')).toBeNull()
  })
})
