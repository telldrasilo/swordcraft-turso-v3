import { describe, expect, it } from 'vitest'
import { getRecipeById } from '@/data/recipes'
import { getForgePartMaterialCandidates } from '@/lib/materials/forge-part-material-candidates'

describe('getForgePartMaterialCandidates (фаза A крафта)', () => {
  const recipe = getRecipeById('basic_sword')
  if (!recipe) throw new Error('fixture: basic_sword missing')

  it('для лезвия нет руд и абстрактного iron / mithril; есть канонический iron_alloy', () => {
    const bladePart = recipe.parts.find(p => p.id === 'blade')
    if (!bladePart) throw new Error('basic_sword.blade')
    const ids = getForgePartMaterialCandidates('blade', bladePart.materialTypes).map(m => m.identity.id)

    expect(ids).not.toContain('iron_ore')
    expect(ids).not.toContain('copper_ore')
    expect(ids).not.toContain('iron')
    expect(ids).not.toContain('mithril')
    expect(ids).toContain('iron_alloy')
  })

  it('рукоять (дерево): кандидаты с ролью weapon_body_wood, не голая руда', () => {
    const grip = recipe.parts.find(p => p.id === 'grip')
    if (!grip) throw new Error('basic_sword.grip')
    const ids = getForgePartMaterialCandidates('grip', grip.materialTypes).map(m => m.identity.id)
    expect(ids).toContain('birch')
    expect(ids).not.toContain('iron_ore')
  })

  it('кожа для хвата: сырая кожа с ролью weapon_grip_leather (§6.1 raw_leather)', () => {
    const ids = getForgePartMaterialCandidates('grip', ['leather']).map(m => m.identity.id)
    expect(ids).toContain('raw_leather')
  })

  it('металлическое навершие допускает steel и iron_alloy', () => {
    const pommel = recipe.parts.find(p => p.id === 'pommel')
    if (!pommel) throw new Error('basic_sword.pommel')
    const ids = getForgePartMaterialCandidates('pommel', pommel.materialTypes).map(m => m.identity.id)
    expect(ids).toContain('steel')
    expect(ids).toContain('iron_alloy')
  })

  it('категория gem мапится на mineral и даёт инкрустные кандидаты (weapon_inlay_gem)', () => {
    const ids = getForgePartMaterialCandidates('inlay', ['gem']).map(m => m.identity.id)
    expect(ids).toContain('echo_stone')
    expect(ids).not.toContain('fieldstone')
  })

  it('категория stone даёт минеральные тела (не самоцвет)', () => {
    const ids = getForgePartMaterialCandidates('blade', ['stone']).map(m => m.identity.id)
    expect(ids).toContain('granite')
    expect(ids).not.toContain('echo_stone')
  })
})
