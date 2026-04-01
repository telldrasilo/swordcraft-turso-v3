import { describe, expect, it } from 'vitest'
import { getLocationById } from '@/modules/expeditions'
import { eventCommonOldChest } from '@/modules/expeditions/data/events/common/treasure'
import { eventCommonResourceCache } from '@/modules/expeditions/data/events/common/discovery'
import { getEffectsForEventResolution, resolveTemplateLoot } from '@/lib/expedition-event-loot'

describe('expedition-event-loot', () => {
  it('resolves direct effects for non-choice events', () => {
    const loc = getLocationById('oak_grove_outskirts')
    expect(loc).toBeDefined()
    if (!loc) return
    const loot = resolveTemplateLoot(eventCommonResourceCache, loc, 42)
    expect(loot.bonusGold).toBeGreaterThan(0)
    expect(loot.materialGrants.length).toBeGreaterThan(0)
  })

  it('resolves choice events with deterministic branch', () => {
    const loc = getLocationById('red_stone_mines')
    expect(loc).toBeDefined()
    if (!loc) return
    const a = resolveTemplateLoot(eventCommonOldChest, loc, 100)
    const b = resolveTemplateLoot(eventCommonOldChest, loc, 100)
    expect(a.bonusGold).toBe(b.bonusGold)
    expect(a.materialGrants).toEqual(b.materialGrants)
    const effects = getEffectsForEventResolution(eventCommonOldChest, 777)
    expect(effects.length).toBeGreaterThan(0)
  })
})
