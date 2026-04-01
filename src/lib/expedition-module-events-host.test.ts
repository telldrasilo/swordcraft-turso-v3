import { describe, expect, it } from 'vitest'
import type { ExpeditionTemplate } from '@/data/expedition-templates'
import { huntBoarsCommon } from '@/modules/expeditions/data/missions/oak-grove-outskirts/hunt'
import { missionModuleToCalculatorTemplate } from '@/lib/expedition-mission-bridge'
import { buildExpeditionStartEvents } from '@/lib/expedition-module-events-host'

describe('buildExpeditionStartEvents', () => {
  it('uses module generator for mission-backed template', () => {
    const tpl = missionModuleToCalculatorTemplate(huntBoarsCommon)
    const startedAt = 1_700_000_000_000
    const out = buildExpeditionStartEvents(tpl, startedAt)

    expect(out.contractType).toBe('exploration')
    expect(out.locationId).toBeDefined()
    expect(out.missionTemplateId).toBe(huntBoarsCommon.id)
    expect(out.moduleEventSnapshots.length).toBeGreaterThan(0)
    expect(out.events.length).toBe(out.moduleEventSnapshots.length)
    expect(out.events[0]?.instanceId).toBe(out.moduleEventSnapshots[0]?.instanceId)
  })

  it('returns empty events when id does not match any module mission', () => {
    const tpl: ExpeditionTemplate = {
      id: 'nonexistent_host_mission_id',
      name: 'Stub',
      description: '',
      icon: '⚔️',
      type: 'hunt',
      difficulty: 'easy',
      duration: 60,
      cost: { supplies: 0, deposit: 0 },
      reward: { baseGold: 1, baseWarSoul: 1 },
      minGuildLevel: 1,
      failureChance: 5,
      weaponLossChance: 3,
      recommendedWeaponTypes: ['sword'],
      minWeaponAttack: 5,
    }
    const out = buildExpeditionStartEvents(tpl, Date.now())
    expect(out.events).toEqual([])
    expect(out.moduleEventSnapshots).toEqual([])
    expect(out.locationId).toBeUndefined()
    expect(out.missionTemplateId).toBeUndefined()
  })
})
