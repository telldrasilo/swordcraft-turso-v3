import { describe, expect, it } from 'vitest'
import {
  formatWeaponCraftV2RoleHint,
  getMaterialProcessContribution,
  getRefiningOreChargeEfficiency,
} from '@/lib/materials/material-process-contribution'

describe('getMaterialProcessContribution', () => {
  describe('refining_smelting', () => {
    it('уголь — топливо плавки (явный оверрайд)', () => {
      const r = getMaterialProcessContribution('coal', 'refining_smelting')
      expect(r.source).toBe('explicit')
      expect(r.facets).toEqual(['smelt_fuel'])
    })

    it('древний уголь — топливо (явный оверрайд)', () => {
      const r = getMaterialProcessContribution('ancient_coal', 'refining_smelting')
      expect(r.source).toBe('explicit')
      expect(r.facets).toEqual(['smelt_fuel'])
    })

    it('торф — топливо (явный оверрайд)', () => {
      const r = getMaterialProcessContribution('peat', 'refining_smelting')
      expect(r.source).toBe('explicit')
      expect(r.facets).toEqual(['smelt_fuel'])
    })

    it('болотное железо — шихта (явный оверрайд)', () => {
      const r = getMaterialProcessContribution('bog_iron', 'refining_smelting')
      expect(r.source).toBe('explicit')
      expect(r.facets).toEqual(['smelt_ore_charge'])
      expect(r.refiningSmelting?.oreChargeEfficiency).toBeCloseTo(0.88, 5)
    })

    it('эффективность шихты: каноническая руда выше болотной (пилот params)', () => {
      expect(getRefiningOreChargeEfficiency('iron_ore')).toBe(1)
      expect(getRefiningOreChargeEfficiency('bog_iron')).toBeLessThan(
        getRefiningOreChargeEfficiency('iron_ore')
      )
    })

    it.each([
      'iron_ore',
      'copper_ore',
      'tin_ore',
      'silver_ore',
      'gold_ore',
      'mithril_ore',
    ] as const)('каноническая руда %s — шихта (явный оверрайд)', id => {
      const r = getMaterialProcessContribution(id, 'refining_smelting')
      expect(r.source).toBe('explicit')
      expect(r.facets).toEqual(['smelt_ore_charge'])
    })

    it('глина — без роли плавки в эвристике', () => {
      const r = getMaterialProcessContribution('clay', 'refining_smelting')
      expect(r.facets).toEqual([])
      expect(r.source).toBe('class_fallback')
    })
  })

  describe('weapon_craft_v2', () => {
    it('абстрактное iron — не целевая стадия части (слиток iron_alloy)', () => {
      const r = getMaterialProcessContribution('iron', 'weapon_craft_v2')
      expect(r.facets).toEqual([])
      expect(r.source).toBe('explicit')
    })

    it('железный слиток — тело клинка', () => {
      const r = getMaterialProcessContribution('iron_alloy', 'weapon_craft_v2')
      expect(r.facets).toEqual(['weapon_body_metal'])
      expect(r.source).toBe('class_fallback')
    })

    it('сосна из моста — явное дерево рукояти (волна D)', () => {
      const r = getMaterialProcessContribution('pine', 'weapon_craft_v2')
      expect(r.source).toBe('explicit')
      expect(r.facets).toEqual(['weapon_body_wood'])
    })

    it('руда не помечается как материал части оружия', () => {
      const r = getMaterialProcessContribution('iron_ore', 'weapon_craft_v2')
      expect(r.facets).toEqual([])
    })

    it('криогриб после TD-INV-2 — явное тело дерева (пул wood на складе)', () => {
      const r = getMaterialProcessContribution('cryo_fungi', 'weapon_craft_v2')
      expect(r.source).toBe('explicit')
      expect(r.facets).toEqual(['weapon_body_wood'])
    })

    it('органика без оверрайда weapon_craft — реагент', () => {
      const r = getMaterialProcessContribution('ash_dust', 'weapon_craft_v2')
      expect(r.source).toBe('class_fallback')
      expect(r.facets).toEqual(['organic_reagent'])
    })

    it('уголь — не тело оружия (класс other)', () => {
      const r = getMaterialProcessContribution('coal', 'weapon_craft_v2')
      expect(r.facets).toEqual([])
    })

    it('древний металл — тело оружия (явный оверрайд волны D)', () => {
      const r = getMaterialProcessContribution('ancient_metal', 'weapon_craft_v2')
      expect(r.source).toBe('explicit')
      expect(r.facets).toEqual(['weapon_body_metal'])
    })

    it('древний сок — пул wood на складе; явное дерево (фаза D, класс other без эвристики)', () => {
      const r = getMaterialProcessContribution('ancient_sap', 'weapon_craft_v2')
      expect(r.source).toBe('explicit')
      expect(r.facets).toEqual(['weapon_body_wood'])
    })

    it.each(['clay', 'red_stone', 'sulfur'] as const)(
      'камень моста %s — явный минерал деталей (фаза D)',
      id => {
        const r = getMaterialProcessContribution(id, 'weapon_craft_v2')
        expect(r.source).toBe('explicit')
        expect(r.facets).toEqual(['weapon_body_mineral'])
      }
    )

    it.each(['dragon_glass', 'void_crystal'] as const)(
      'самоцвет моста %s — явная инкрустация (фаза D)',
      id => {
        const r = getMaterialProcessContribution(id, 'weapon_craft_v2')
        expect(r.source).toBe('explicit')
        expect(r.facets).toEqual(['weapon_inlay_gem'])
      }
    )

    it('чешуя дракона — явный хват (фаза D)', () => {
      const r = getMaterialProcessContribution('dragon_scale', 'weapon_craft_v2')
      expect(r.source).toBe('explicit')
      expect(r.facets).toEqual(['weapon_grip_leather'])
    })
  })

  it('неизвестный id', () => {
    const r = getMaterialProcessContribution('no_such_material_xyz', 'refining_smelting')
    expect(r.source).toBe('unknown')
    expect(r.facets).toEqual([])
  })
})

describe('formatWeaponCraftV2RoleHint (семантика C, UI)', () => {
  it('возвращает строку для металла клинка (канон слитка)', () => {
    expect(formatWeaponCraftV2RoleHint('iron_alloy')).toMatch(/В крафте:.*металл/)
  })

  it('null для абстрактного iron (не целевая стадия в кузне)', () => {
    expect(formatWeaponCraftV2RoleHint('iron')).toBeNull()
  })

  it('null если нет роли в weapon_craft_v2', () => {
    expect(formatWeaponCraftV2RoleHint('coal')).toBeNull()
    expect(formatWeaponCraftV2RoleHint('no_such_material_xyz')).toBeNull()
  })
})
