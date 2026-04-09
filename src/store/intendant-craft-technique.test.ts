import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from '@/store/game-store-composed'
import { INTENDANT_OFFERS } from '@/data/guild/intendant-catalog'

describe('intendant craft techniques', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
  })

  it('contains craft_technique offers in catalog', () => {
    const craftOffers = INTENDANT_OFFERS.filter((o) => o.kind === 'craft_technique')
    expect(craftOffers.length).toBeGreaterThan(0)
    expect(craftOffers.some((o) => o.targetId === 'spirit_blessing')).toBe(true)
  })

  it('purchaseIntendantOffer unlocks craft technique and spends reputation', () => {
    const offer = INTENDANT_OFFERS.find((o) => o.kind === 'craft_technique')
    expect(offer).toBeDefined()
    if (!offer) return

    useGameStore.setState((s) => ({
      guild: {
        ...s.guild,
        level: Math.max(s.guild.level, offer.minGuildLevel),
        reputation: offer.costReputation + 50,
      },
      unlockedCraftTechniqueIds: [],
    }))

    const before = useGameStore.getState().guild.reputation
    const result = useGameStore.getState().purchaseIntendantOffer(offer.id)
    const after = useGameStore.getState().guild.reputation

    expect(result.success).toBe(true)
    expect(useGameStore.getState().unlockedCraftTechniqueIds).toContain(offer.targetId)
    expect(after).toBe(before - offer.costReputation)
  })
})

