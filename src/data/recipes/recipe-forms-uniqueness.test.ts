import { describe, expect, it } from 'vitest'
import { getRecipeById } from '@/data/recipes'

function stageSignature(recipeId: string): string {
  const r = getRecipeById(recipeId)
  if (!r) return ''
  return r.stages.map(s => s.stageType).join('>')
}

describe('recipe forms — extra melee differentiation', () => {
  it('булава без финальной заточки; молот тоже; отличаются от каменной булавы по цепочке этапов', () => {
    const mace = getRecipeById('basic_mace')
    const hammer = getRecipeById('basic_hammer')
    const stoneMace = getRecipeById('stone_head_mace')
    expect(mace?.stages.some(s => s.stageType === 'fin_sharpening')).toBe(false)
    expect(hammer?.stages.some(s => s.stageType === 'fin_sharpening')).toBe(false)
    expect(mace?.parts.find(p => p.id === 'blade')?.name).toBe('Головка')
    expect(hammer?.parts.find(p => p.id === 'blade')?.name).toBe('Боёк')
    expect(stoneMace).toBeDefined()
    expect(stageSignature('basic_mace')).not.toBe(stageSignature('stone_head_mace'))
    expect(hammer?.stages.length).not.toBe(mace?.stages.length)
  })

  it('копьё размечено своими названиями частей', () => {
    const spear = getRecipeById('basic_spear')
    expect(spear?.parts.find(p => p.id === 'blade')?.name).toBe('Наконечник')
    expect(spear?.parts.find(p => p.id === 'grip')?.name).toBe('Древко')
  })
})
