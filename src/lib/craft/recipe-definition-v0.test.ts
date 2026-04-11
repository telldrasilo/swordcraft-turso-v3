import { describe, expect, it } from 'vitest'
import { getRecipeById } from '@/data/recipes/index'
import { getRecipeDefinitionV0, RECIPE_DEFINITIONS_V0 } from '@/lib/craft/recipe-definition-v0'
import { serializeRecipeStagesContract } from '@/lib/craft/recipe-stages-contract'

describe('RecipeDefinitionV0 materializer', () => {
  it('basic_sword: материализация совпадает с каталогом по стадиям и частям', () => {
    const def = getRecipeDefinitionV0('basic_sword')
    expect(def).toBeDefined()
    if (!def) return
    const fromDef = def.materialize()
    const catalog = getRecipeById('basic_sword')
    expect(catalog).toBeDefined()
    if (!catalog) return
    expect(fromDef.stages).toEqual(catalog.stages)
    expect(fromDef.parts).toEqual(catalog.parts)
    expect(fromDef.id).toBe('basic_sword')
  })

  it('реестр содержит basic_sword', () => {
    expect(RECIPE_DEFINITIONS_V0.some(d => d.id === 'basic_sword')).toBe(true)
  })

  it('ceremonial_sword: материализация совпадает с каталогом по стадиям и частям', () => {
    const def = getRecipeDefinitionV0('ceremonial_sword')
    expect(def).toBeDefined()
    if (!def) return
    const fromDef = def.materialize()
    const catalog = getRecipeById('ceremonial_sword')
    expect(catalog).toBeDefined()
    if (!catalog) return
    expect(fromDef.stages).toEqual(catalog.stages)
    expect(fromDef.parts).toEqual(catalog.parts)
    expect(fromDef.id).toBe('ceremonial_sword')
  })

  it('реестр содержит ceremonial_sword', () => {
    expect(RECIPE_DEFINITIONS_V0.some(d => d.id === 'ceremonial_sword')).toBe(true)
  })

  it('CI: снимок контракта стадий (stageType + material/target) для эталонов v0', () => {
    const basic = getRecipeDefinitionV0('basic_sword')
    const ceremonial = getRecipeDefinitionV0('ceremonial_sword')
    expect(basic).toBeDefined()
    expect(ceremonial).toBeDefined()
    if (!basic || !ceremonial) return
    expect(serializeRecipeStagesContract(basic.materialize().stages)).toMatchSnapshot('basic_sword')
    expect(serializeRecipeStagesContract(ceremonial.materialize().stages)).toMatchSnapshot(
      'ceremonial_sword'
    )
  })
})
