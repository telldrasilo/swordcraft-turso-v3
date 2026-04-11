import { describe, expect, it } from 'vitest'
import {
  allMaterialProcessingTechniques,
  getMaterialProcessingTechniquesForCatalogMaterial,
  getMaterialProcessingTechniqueById,
  resolveCatalogMaterialIdForProcessingTechniques,
} from '@/data/material-processing-techniques'
import { refiningRecipes } from '@/data/refining-recipes'
import { getEffectiveRefiningRecipeId } from '@/lib/craft/processing-technique-refining-bridge'

describe('material-processing-techniques (§1 п.3 контент)', () => {
  it('связывает цепочки олова, бронзы, серебра, стали и золота с каталожными id', () => {
    expect(
      getMaterialProcessingTechniquesForCatalogMaterial('tin_alloy').some(
        t => t.id === 'forge_basic_tin_smelt'
      )
    ).toBe(true)
    expect(
      getMaterialProcessingTechniquesForCatalogMaterial('bronze').some(
        t => t.id === 'forge_basic_bronze_smelt'
      )
    ).toBe(true)
    expect(
      getMaterialProcessingTechniquesForCatalogMaterial('silver_alloy').some(
        t => t.id === 'forge_basic_silver_smelt'
      )
    ).toBe(true)
    expect(
      getMaterialProcessingTechniquesForCatalogMaterial('steel').some(
        t => t.id === 'forge_basic_steel_smelt'
      )
    ).toBe(true)
    expect(
      getMaterialProcessingTechniquesForCatalogMaterial('gold_alloy').some(
        t => t.id === 'forge_basic_gold_smelt'
      )
    ).toBe(true)
  })

  it('резолвит рецепт горна через processingOperations.refiningRecipeId', () => {
    const t = getMaterialProcessingTechniqueById('forge_basic_bronze_smelt')
    expect(t).toBeDefined()
    if (!t) return
    expect(t.refiningRecipeId).toBeUndefined()
    expect(getEffectiveRefiningRecipeId(t)).toBe('bronze_ingot')
  })

  it('связывает дерево и камень (processed_wood / processed_stone) с рецептами лесопилки и каменоломни', () => {
    const wood = getMaterialProcessingTechniqueById('forge_basic_wood_planks')
    expect(wood?.refiningRecipeId).toBeUndefined()
    expect(wood && getEffectiveRefiningRecipeId(wood)).toBe('wood_planks')
    expect(wood?.targetCatalogMaterialIds).toContain('processed_wood')
    const stone = getMaterialProcessingTechniqueById('forge_basic_stone_blocks')
    expect(stone?.refiningRecipeId).toBeUndefined()
    expect(stone && getEffectiveRefiningRecipeId(stone)).toBe('stone_blocks')
    expect(stone?.targetCatalogMaterialIds).toContain('processed_stone')
  })

  it('getEffectiveRefiningRecipeId указывает на существующий рецепт горна (3.3)', () => {
    const ids = new Set(refiningRecipes.map((r) => r.id))
    for (const t of allMaterialProcessingTechniques) {
      const rid = getEffectiveRefiningRecipeId(t)
      if (!ids.has(rid)) {
        expect.fail(`technique ${t.id}: no refining recipe ${rid}`)
      }
    }
  })

  it('находит техники обработки для сырой древесины и камня через якорный каталожный id', () => {
    expect(resolveCatalogMaterialIdForProcessingTechniques('birch')).toBe('processed_wood')
    expect(resolveCatalogMaterialIdForProcessingTechniques('granite')).toBe('processed_stone')
    expect(
      getMaterialProcessingTechniquesForCatalogMaterial('oak').some(
        t => t.id === 'forge_basic_wood_planks'
      )
    ).toBe(true)
    expect(
      getMaterialProcessingTechniquesForCatalogMaterial('granite').some(
        t => t.id === 'forge_basic_stone_blocks'
      )
    ).toBe(true)
  })
})
