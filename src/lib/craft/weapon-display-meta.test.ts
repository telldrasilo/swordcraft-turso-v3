import { describe, expect, it } from 'vitest'
import {
  catalogMaterialIdFromOrderWeaponMaterial,
  hiddenTagsSatisfyOrderMaterial,
  weaponMaterialTagsAlignForOrders,
} from '@/lib/craft/weapon-display-meta'

describe('catalogMaterialIdFromOrderWeaponMaterial', () => {
  it('maps legacy order tags to catalog combat-stage ids', () => {
    expect(catalogMaterialIdFromOrderWeaponMaterial('iron')).toBe('iron_alloy')
    expect(catalogMaterialIdFromOrderWeaponMaterial('mithril')).toBe('mithril_alloy')
    expect(catalogMaterialIdFromOrderWeaponMaterial('steel')).toBe('steel')
  })
})

describe('hiddenTagsSatisfyOrderMaterial', () => {
  it('accepts legacy tag or catalog combat-stage id in hiddenTags', () => {
    const tags = ['sword', 'iron_alloy']
    expect(hiddenTagsSatisfyOrderMaterial(tags, 'iron')).toBe(true)
    expect(hiddenTagsSatisfyOrderMaterial(tags, 'iron_alloy')).toBe(true)
    expect(hiddenTagsSatisfyOrderMaterial(tags, undefined)).toBe(true)
  })

  it('returns false when material tag does not match', () => {
    expect(hiddenTagsSatisfyOrderMaterial(['sword', 'steel'], 'iron')).toBe(false)
  })
})

describe('weaponMaterialTagsAlignForOrders', () => {
  it('treats WeaponMaterial and canonical catalog id as equal when bridged', () => {
    expect(weaponMaterialTagsAlignForOrders('iron', 'iron_alloy')).toBe(true)
    expect(weaponMaterialTagsAlignForOrders('iron_alloy', 'iron')).toBe(true)
  })

  it('returns false for different metals', () => {
    expect(weaponMaterialTagsAlignForOrders('iron', 'steel')).toBe(false)
  })

  it('returns false when either side unknown to the bridge', () => {
    expect(weaponMaterialTagsAlignForOrders('iron', 'oak')).toBe(false)
  })
})
