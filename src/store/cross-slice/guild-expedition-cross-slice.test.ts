import { describe, expect, it, vi } from 'vitest'
import type { GuildState } from '@/types/guild'
import { initialPlayer, initialStatistics } from '@/store/slices/player-slice'
import { initialTutorialState } from '@/store/slices/tutorial-slice'
import { buildGuildExpeditionCrossSlice } from './guild-expedition-cross-slice'
import type { GuildExpeditionStoreDeps } from './guild-expedition-cross-slice'
import { expeditionTemplates } from '@/data/expedition-templates'
import type { CraftedWeaponV2 } from '@/types/craft-v2'

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
    contractedAdventurers: [],
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
    workbenchQueue: [],
    repairTechniqueStageRun: null,
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
    addMaterialToStash: vi.fn(),
    addReputation: vi.fn(),
    tutorial: { ...initialTutorialState },
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

  it('completeExpeditionFull returns null without adventurerExtended/adventurerData', () => {
    const tpl = expeditionTemplates[0]
    expect(tpl).toBeDefined()
    const w = {
      id: 'w_test_ce',
      stats: { attack: 20 },
      currentDurability: 50,
      type: 'sword',
      qualityRank: 'C',
      epicMultiplier: 1,
      combatMaterialId: 'iron',
      quality: 50,
    } as unknown as CraftedWeaponV2
    const guild = emptyGuild()
    guild.activeExpeditions = [
      {
        id: 'ae_no_adv',
        expeditionId: tpl.id,
        expeditionName: tpl.name,
        expeditionIcon: tpl.icon,
        adventurerId: 'a1',
        adventurerName: 'Nobody',
        weaponId: w.id,
        weaponName: 'Blade',
        weaponData: w,
        startedAt: Date.now(),
        endsAt: Date.now() + 60_000,
        deposit: 0,
        suppliesCost: 0,
      },
    ]
    const set = vi.fn()
    const get = vi.fn(() => mockDeps({ guild, weaponInventory: { weapons: [w] } }))
    const { completeExpeditionFull } = buildGuildExpeditionCrossSlice(set, get)
    expect(completeExpeditionFull('ae_no_adv')).toBeNull()
  })
})
