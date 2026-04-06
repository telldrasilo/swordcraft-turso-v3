import { describe, expect, it } from 'vitest'
import {
  getMaterialProcessingTechniquesForCatalogMaterial,
  getMaterialProcessingTechniqueById,
  resolveCatalogMaterialIdForProcessingTechniques,
} from '@/data/material-processing-techniques'

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

  it('резолвит refiningRecipeId для новых техник', () => {
    const t = getMaterialProcessingTechniqueById('forge_basic_bronze_smelt')
    expect(t?.refiningRecipeId).toBe('bronze_ingot')
  })

  it('связывает дерево и камень (processed_wood / processed_stone) с рецептами лесопилки и каменоломни', () => {
    const wood = getMaterialProcessingTechniqueById('forge_basic_wood_planks')
    expect(wood?.refiningRecipeId).toBe('wood_planks')
    expect(wood?.targetCatalogMaterialIds).toContain('processed_wood')
    const stone = getMaterialProcessingTechniqueById('forge_basic_stone_blocks')
    expect(stone?.refiningRecipeId).toBe('stone_blocks')
    expect(stone?.targetCatalogMaterialIds).toContain('processed_stone')
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
