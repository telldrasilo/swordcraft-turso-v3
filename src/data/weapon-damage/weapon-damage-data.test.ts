import { describe, expect, it } from 'vitest'
import {
  DAMAGE_TAG_REGISTRY,
  getAllDamageTagIds,
  getDamageTagById,
} from './damage-tag-registry'
import {
  EVENT_TEMPLATE_TO_DAMAGE_TAGS,
  getDamageTagsForEventTemplate,
} from './event-template-to-damage-tags'

describe('damage-tag-registry', () => {
  it('имеет 24 уникальных id и обязательные поля', () => {
    const ids = getAllDamageTagIds()
    expect(ids.length).toBe(24)
    expect(new Set(ids).size).toBe(24)
    for (const id of ids) {
      const d = getDamageTagById(id)
      expect(d).toBeDefined()
      expect(d?.label.length).toBeGreaterThan(0)
      expect(d?.shortDescription.length).toBeGreaterThan(0)
      expect(d?.flavorFromSmith.length).toBeGreaterThan(0)
      expect(Array.isArray(d?.allowedRepairTechniqueIds)).toBe(true)
    }
  })

  it('реестр и массив совпадают по составу', () => {
    expect(DAMAGE_TAG_REGISTRY.map((x) => x.id).sort()).toEqual(getAllDamageTagIds().sort())
  })
})

describe('event-template-to-damage-tags', () => {
  it('связывает event_common_obstacle с physical_slash_chip', () => {
    const m = getDamageTagsForEventTemplate('event_common_obstacle')
    expect(m?.tagIds).toEqual(['physical_slash_chip'])
  })

  it('ловушка даёт два тега', () => {
    expect(EVENT_TEMPLATE_TO_DAMAGE_TAGS.event_common_trap?.tagIds).toEqual([
      'physical_slash_chip',
      'physical_loose_fitting',
    ])
  })

  it('все tagIds из карты есть в реестре', () => {
    const reg = new Set(getAllDamageTagIds())
    for (const { tagIds } of Object.values(EVENT_TEMPLATE_TO_DAMAGE_TAGS)) {
      for (const id of tagIds) {
        expect(reg.has(id), `missing tag ${id}`).toBe(true)
      }
    }
  })
})
