import { describe, expect, it } from 'vitest'
import type { RepairOption } from '@/data/repair-system'
import {
  filterRepairOptionsByActiveDamageTags,
  intersectAllowedRepairTypes,
} from './filter-repair-by-damage-tags'
import type { ActiveDamageTagEntry } from '@/types/weapon-damage'

const opt = (type: RepairOption['type']): RepairOption =>
  ({
    type,
    name: type,
    description: '',
    icon: '',
    materials: {},
    goldCost: 0,
    durabilityRestore: 0,
    maxDurabilityLoss: 0,
    soulLossPercent: 0,
    attackLossChance: 0,
    attackLossPercent: 0,
    epicLossPercent: 0,
    baseSuccessChance: 50,
  }) as RepairOption

describe('intersectAllowedRepairTypes', () => {
  it('без тегов — все пять типов', () => {
    const s = intersectAllowedRepairTypes([])
    expect(s.size).toBe(5)
    expect(s.has('quick')).toBe(true)
  })

  it('elemental_skverna_taint сужает до quality/restoration/enhancement', () => {
    const tags: ActiveDamageTagEntry[] = [{ tagId: 'elemental_skverna_taint', severity: 'light' }]
    const s = intersectAllowedRepairTypes(tags)
    expect([...s].sort()).toEqual(['enhancement', 'quality', 'restoration'])
  })

  it('пересечение slash + skverna — только подмножество soul', () => {
    const tags: ActiveDamageTagEntry[] = [
      { tagId: 'physical_slash_chip', severity: 'light' },
      { tagId: 'elemental_skverna_taint', severity: 'moderate' },
    ]
    const s = intersectAllowedRepairTypes(tags)
    expect([...s].sort()).toEqual(['enhancement', 'quality', 'restoration'])
  })
})

describe('filterRepairOptionsByActiveDamageTags', () => {
  const allFive = [
    opt('quick'),
    opt('standard'),
    opt('quality'),
    opt('restoration'),
    opt('enhancement'),
  ]

  it('фильтрует опции по пересечению', () => {
    const tags: ActiveDamageTagEntry[] = [{ tagId: 'elemental_skverna_taint', severity: 'light' }]
    const out = filterRepairOptionsByActiveDamageTags(allFive, tags)
    expect(out.map((o) => o.type).sort()).toEqual(['enhancement', 'quality', 'restoration'])
  })

  it('без тегов возвращает всё', () => {
    expect(filterRepairOptionsByActiveDamageTags(allFive, []).length).toBe(5)
  })
})
