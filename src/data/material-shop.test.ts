import { describe, expect, it } from 'vitest'
import type { ResourceKey } from '@/store/slices/resources-slice'
import {
  canBuyMaterial,
  collectShopOfferCatalogMaterialIds,
  getMaterialPrice,
  getMaterialShopInfo,
  materialShopItems,
} from '@/data/material-shop'

describe('material-shop (§3.5 MATERIALS_SINGLE_SOURCE_ROADMAP)', () => {
  it('каждый offerId встречается ровно один раз', () => {
    const keys = materialShopItems.map((i) => i.offerId)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('стартовые покупки: iron → руда, coal, birch (wood + stashMaterialId)', () => {
    expect(canBuyMaterial('iron')).toBe(true)
    expect(canBuyMaterial('coal')).toBe(true)
    expect(canBuyMaterial('wood')).toBe(true)
    for (const k of ['iron', 'coal', 'wood'] as ResourceKey[]) {
      expect(getMaterialPrice(k, 1)).toBeGreaterThan(0)
    }
  })

  it('слитки и прочие ключи не в лавке — dokupka недоступна', () => {
    expect(canBuyMaterial('ironIngot')).toBe(false)
    expect(getMaterialPrice('ironIngot', 1)).toBe(0)
    expect(canBuyMaterial('copper')).toBe(false)
  })

  it('мифриловая руда по-прежнему не продаётся', () => {
    expect(canBuyMaterial('mithril')).toBe(false)
  })

  it('getMaterialShopInfo подтягивает имя из каталога (канон руды iron → iron_ore)', () => {
    const info = getMaterialShopInfo('iron')
    expect(info).toBeDefined()
    expect(info?.name).toBe('Железная руда')
  })

  it('collectShopOfferCatalogMaterialIds ⊆ канон старта', () => {
    const ids = new Set(collectShopOfferCatalogMaterialIds())
    expect(ids.has('iron_ore')).toBe(true)
    expect(ids.has('coal')).toBe(true)
    expect(ids.has('birch')).toBe(true)
    expect(ids.has('mithril_ore')).toBe(true)
  })
})
