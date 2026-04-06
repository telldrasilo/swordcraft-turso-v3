import { describe, expect, it } from 'vitest'
import type { ResourceKey } from '@/store/slices/resources-slice'
import {
  canBuyMaterial,
  getMaterialPrice,
  getMaterialShopInfo,
  materialShopItems,
} from '@/data/material-shop'

describe('material-shop (фаза 3: руда / слитки / доски / блоки)', () => {
  it('каждый перечисленный resourceKey встречается ровно один раз', () => {
    const keys = materialShopItems.map(i => i.resourceKey)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('все слитки, доски и stoneBlocks доступны для покупки (кроме задизайненных исключений)', () => {
    const mustBuy: ResourceKey[] = [
      'ironIngot',
      'copperIngot',
      'tinIngot',
      'bronzeIngot',
      'steelIngot',
      'silverIngot',
      'goldIngot',
      'mithrilIngot',
      'planks',
      'stoneBlocks',
    ]
    for (const k of mustBuy) {
      expect(canBuyMaterial(k), k).toBe(true)
      expect(getMaterialPrice(k, 1)).toBeGreaterThan(0)
    }
  })

  it('мифриловая руда по-прежнему не продаётся', () => {
    expect(canBuyMaterial('mithril')).toBe(false)
  })

  it('getMaterialShopInfo подтягивает имя из каталога (канон руды iron → iron_ore)', () => {
    const info = getMaterialShopInfo('iron')
    expect(info).toBeDefined()
    expect(info?.name).toBe('Железная руда')
  })
})
