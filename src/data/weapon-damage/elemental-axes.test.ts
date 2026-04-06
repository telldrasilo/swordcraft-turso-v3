import { describe, expect, it } from 'vitest'
import {
  ALL_ELEMENT_AXIS_IDS,
  ALL_ELEMENTAL_DAMAGE_TAG_IDS,
  ELEMENTAL_AXIS_LABELS,
  ELEMENTAL_DAMAGE_TAG_TO_AXIS,
  isElementalDamageTagAllowedOnLocation,
} from './elemental-axes'

describe('ELEMENTAL_DAMAGE_TAG_TO_AXIS', () => {
  it('содержит ровно 15 тэгов и 15 осей (SPEC §3)', () => {
    expect(ALL_ELEMENTAL_DAMAGE_TAG_IDS.length).toBe(15)
    expect(ALL_ELEMENT_AXIS_IDS.length).toBe(15)
    expect(Object.keys(ELEMENTAL_DAMAGE_TAG_TO_AXIS).length).toBe(15)
  })

  it('каждый ключ — elemental_*', () => {
    for (const k of ALL_ELEMENTAL_DAMAGE_TAG_IDS) {
      expect(k.startsWith('elemental_')).toBe(true)
    }
  })

  it('каждое значение — валидная ось', () => {
    const axisSet = new Set(ALL_ELEMENT_AXIS_IDS)
    for (const axis of Object.values(ELEMENTAL_DAMAGE_TAG_TO_AXIS)) {
      expect(axisSet.has(axis)).toBe(true)
    }
  })

  it('ELEMENTAL_AXIS_LABELS покрывает все оси', () => {
    for (const id of ALL_ELEMENT_AXIS_IDS) {
      expect(ELEMENTAL_AXIS_LABELS[id].length).toBeGreaterThan(0)
    }
  })
})

describe('isElementalDamageTagAllowedOnLocation', () => {
  it('физический тэг всегда разрешён', () => {
    expect(isElementalDamageTagAllowedOnLocation('physical_slash_chip', [])).toBe(true)
    expect(isElementalDamageTagAllowedOnLocation('physical_slash_chip', undefined)).toBe(true)
  })

  it('undefined presentElements — не фильтровать стихии', () => {
    expect(isElementalDamageTagAllowedOnLocation('elemental_frost_bite', undefined)).toBe(true)
  })

  it('пустой массив — отбрасывает все elemental_*', () => {
    expect(isElementalDamageTagAllowedOnLocation('elemental_frost_bite', [])).toBe(false)
  })

  it('ось в списке — разрешено', () => {
    expect(isElementalDamageTagAllowedOnLocation('elemental_frost_bite', ['frost'])).toBe(true)
    expect(isElementalDamageTagAllowedOnLocation('elemental_frost_bite', ['fire', 'frost'])).toBe(
      true
    )
  })

  it('нет оси в списке — отклонено', () => {
    expect(isElementalDamageTagAllowedOnLocation('elemental_frost_bite', ['fire'])).toBe(false)
  })

  it('неизвестный elemental_* при включённом фильтре — отклонено', () => {
    expect(isElementalDamageTagAllowedOnLocation('elemental_unknown', [])).toBe(false)
  })
})
