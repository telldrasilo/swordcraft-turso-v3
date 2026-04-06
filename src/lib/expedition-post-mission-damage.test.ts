import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as eventTemplateToDamageTags from '@/data/weapon-damage/event-template-to-damage-tags'
import {
  ALL_ELEMENT_AXIS_IDS,
  ELEMENTAL_DAMAGE_TAG_TO_AXIS,
} from '@/data/weapon-damage/elemental-axes'
import { getEventById } from '@/modules/expeditions'
import { eventResolutionSeedForSnapshot } from '@/lib/expedition-event-loot'
import {
  buildActiveDamageTagsFromMissionSnapshots,
  eventTemplateQualifiesForWeaponDamageTags,
  weaponWearToSeverity,
} from './expedition-post-mission-damage'
import type { ModuleExpeditionEventSnapshot } from '@/lib/expedition-module-events-host'

describe('weaponWearToSeverity', () => {
  it('классифицирует пороги', () => {
    expect(weaponWearToSeverity(5)).toBe('light')
    expect(weaponWearToSeverity(12)).toBe('light')
    expect(weaponWearToSeverity(13)).toBe('moderate')
    expect(weaponWearToSeverity(25)).toBe('moderate')
    expect(weaponWearToSeverity(26)).toBe('heavy')
  })
})

describe('eventTemplateQualifiesForWeaponDamageTags', () => {
  it('true для препятствия с damage_weapon в effects', () => {
    const t = getEventById('event_common_obstacle')
    expect(t && eventTemplateQualifiesForWeaponDamageTags(t)).toBe(true)
  })

  it('false для стража без сида резолва (урон только в выборе)', () => {
    const t = getEventById('event_common_territory_guardian')
    expect(t && eventTemplateQualifiesForWeaponDamageTags(t)).toBe(false)
  })

  it('страж квалифицируется при сиде ветки с damage_weapon', () => {
    const t = getEventById('event_common_territory_guardian')
    if (!t) throw new Error('missing event_common_territory_guardian')
    let foundSeed = -1
    for (let i = 0; i < 5000; i++) {
      const rs = eventResolutionSeedForSnapshot(i, 0)
      if (eventTemplateQualifiesForWeaponDamageTags(t, rs)) {
        foundSeed = i
        break
      }
    }
    expect(foundSeed).toBeGreaterThanOrEqual(0)
  })
})

describe('buildActiveDamageTagsFromMissionSnapshots', () => {
  const snap = (partial: Partial<ModuleExpeditionEventSnapshot>): ModuleExpeditionEventSnapshot => ({
    instanceId: 'i1',
    templateId: 'event_common_obstacle',
    triggerOffsetSec: 10,
    order: 0,
    status: 'resolved',
    ...partial,
  })

  it('возвращает теги для снимка препятствия', () => {
    const tags = buildActiveDamageTagsFromMissionSnapshots({
      snapshots: [snap({ instanceId: 'a', templateId: 'event_common_obstacle' })],
      weaponWear: 10,
      completedAtMs: 1_700_000_000_000,
      expeditionStartedAtMs: 1_700_000_000_000,
    })
    expect(tags.length).toBe(1)
    expect(tags[0]?.tagId).toBe('physical_slash_chip')
    expect(tags[0]?.severity).toBe('light')
    expect(tags[0]?.sourceEventTemplateId).toBe('event_common_obstacle')
    expect(tags[0]?.appliedAt).toBe(1_700_000_000_000)
  })

  it('пусто без снимков', () => {
    expect(
      buildActiveDamageTagsFromMissionSnapshots({
        snapshots: [],
        weaponWear: 20,
        completedAtMs: 0,
      })
    ).toEqual([])
  })

  it('дедуплицирует по instanceId', () => {
    const tags = buildActiveDamageTagsFromMissionSnapshots({
      snapshots: [
        snap({ instanceId: 'dup', templateId: 'event_common_obstacle' }),
        snap({ instanceId: 'dup', templateId: 'event_common_obstacle', order: 1 }),
      ],
      weaponWear: 20,
      completedAtMs: 0,
    })
    expect(tags.filter((t) => t.tagId === 'physical_slash_chip').length).toBe(1)
  })

  it('страж территории: при startedAt с веткой «бой» выдаёт тег из маппинга', () => {
    const t = getEventById('event_common_territory_guardian')
    if (!t) throw new Error('missing event_common_territory_guardian')
    let startedAt = 0
    for (let i = 0; i < 8000; i++) {
      if (eventTemplateQualifiesForWeaponDamageTags(t, eventResolutionSeedForSnapshot(i, 0))) {
        startedAt = i
        break
      }
    }
    const tags = buildActiveDamageTagsFromMissionSnapshots({
      snapshots: [snap({ instanceId: 'guard', templateId: 'event_common_territory_guardian' })],
      weaponWear: 18,
      completedAtMs: 0,
      expeditionStartedAtMs: startedAt,
    })
    expect(tags.some((x) => x.tagId === 'physical_bend_warp')).toBe(true)
  })

  describe('фильтр стихий (SPEC §3.7)', () => {
    let spy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      spy = vi.spyOn(eventTemplateToDamageTags, 'getDamageTagsForEventTemplate')
    })

    afterEach(() => {
      spy.mockRestore()
    })

    it('без frost в presentElements — elemental_frost_bite не попадает', () => {
      spy.mockReturnValue({ tagIds: ['elemental_frost_bite'] })
      const tags = buildActiveDamageTagsFromMissionSnapshots({
        snapshots: [snap({ instanceId: 'a', templateId: 'event_common_obstacle' })],
        weaponWear: 10,
        completedAtMs: 0,
        presentElements: ['fire'],
      })
      expect(tags.some((t) => t.tagId === 'elemental_frost_bite')).toBe(false)
    })

    it('с frost в presentElements — elemental_frost_bite попадает', () => {
      spy.mockReturnValue({ tagIds: ['elemental_frost_bite'] })
      const tags = buildActiveDamageTagsFromMissionSnapshots({
        snapshots: [snap({ instanceId: 'a', templateId: 'event_common_obstacle' })],
        weaponWear: 10,
        completedAtMs: 0,
        presentElements: ['frost'],
      })
      expect(tags.some((t) => t.tagId === 'elemental_frost_bite')).toBe(true)
    })

    it('physical_* не отфильтровываются при пустом presentElements', () => {
      spy.mockReturnValue({ tagIds: ['physical_slash_chip'] })
      const tags = buildActiveDamageTagsFromMissionSnapshots({
        snapshots: [snap({ instanceId: 'a', templateId: 'event_common_obstacle' })],
        weaponWear: 10,
        completedAtMs: 0,
        presentElements: [],
      })
      expect(tags.some((t) => t.tagId === 'physical_slash_chip')).toBe(true)
    })

    it('пустой presentElements — все elemental_* отброшены; физические сохраняются', () => {
      spy.mockReturnValue({ tagIds: ['elemental_frost_bite', 'physical_slash_chip'] })
      const tags = buildActiveDamageTagsFromMissionSnapshots({
        snapshots: [snap({ instanceId: 'a', templateId: 'event_common_obstacle' })],
        weaponWear: 10,
        completedAtMs: 0,
        presentElements: [],
      })
      expect(tags.map((t) => t.tagId).sort()).toEqual(['physical_slash_chip'])
    })

    it('presentElements undefined — фильтр стихий отключён', () => {
      spy.mockReturnValue({ tagIds: ['elemental_frost_bite'] })
      const tags = buildActiveDamageTagsFromMissionSnapshots({
        snapshots: [snap({ instanceId: 'a', templateId: 'event_common_obstacle' })],
        weaponWear: 10,
        completedAtMs: 0,
      })
      expect(tags.some((t) => t.tagId === 'elemental_frost_bite')).toBe(true)
    })

    it('маппинг elemental_* → ось: без оси в списке — отброшен; с осью — остаётся', () => {
      for (const [tagId, axis] of Object.entries(ELEMENTAL_DAMAGE_TAG_TO_AXIS)) {
        spy.mockReturnValue({ tagIds: [tagId] })
        const without = buildActiveDamageTagsFromMissionSnapshots({
          snapshots: [snap({ instanceId: `i-${tagId}`, templateId: 'event_common_obstacle' })],
          weaponWear: 10,
          completedAtMs: 0,
          presentElements: ALL_ELEMENT_AXIS_IDS.filter((a) => a !== axis),
        })
        expect(without.some((t) => t.tagId === tagId)).toBe(false)

        const withAxis = buildActiveDamageTagsFromMissionSnapshots({
          snapshots: [snap({ instanceId: `i2-${tagId}`, templateId: 'event_common_obstacle' })],
          weaponWear: 10,
          completedAtMs: 0,
          presentElements: [axis],
        })
        expect(withAxis.some((t) => t.tagId === tagId)).toBe(true)
      }
    })
  })
})
