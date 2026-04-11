import { describe, expect, it } from 'vitest'
import { generateCraftStages } from '@/lib/craft/process-generator'
import { getRecipeById } from '@/data/recipes'
import { getTechniqueById } from '@/data/techniques'

/**
 * Интеграция планировщика с техниками обработки (вставка этапов) и боевыми processMods (4.x).
 */
describe('generateCraftStages integration', () => {
  it('вставляет этап плавки по технике обработки и дублирует fin_hardening от double_hardening', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    if (!recipe) return

    const materials = {
      blade: { materialId: 'iron_alloy', quantity: 3 },
      guard: { materialId: 'iron_alloy', quantity: 1 },
      grip: { materialId: 'oak', quantity: 1 },
      pommel: { materialId: 'iron_alloy', quantity: 1 },
    }
    const partMaterialSupply = {
      blade: { mode: 'ore_smelt' as const, processingTechniqueId: 'forge_basic_iron_smelt' },
    }
    const doubleHardening = getTechniqueById('double_hardening')
    expect(doubleHardening).toBeDefined()
    if (!doubleHardening) return

    const stages = generateCraftStages(
      recipe,
      materials,
      [doubleHardening],
      10,
      3,
      undefined,
      false,
      partMaterialSupply
    )

    const types = stages.map((s) => s.stageTypeId)
    expect(types.some((t) => t === 'prep_forge_ore_smelting')).toBe(true)
    expect(types.filter((t) => t === 'fin_hardening').length).toBeGreaterThanOrEqual(2)
  })

  it('вставляет этап дубления кожи при ore_smelt + forge_basic_leather_tan на рукояти', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    if (!recipe) return

    const materials = {
      blade: { materialId: 'iron_alloy', quantity: 3 },
      guard: { materialId: 'iron_alloy', quantity: 1 },
      grip: { materialId: 'raw_leather', quantity: 1 },
      pommel: { materialId: 'iron_alloy', quantity: 1 },
    }
    const partMaterialSupply = {
      grip: { mode: 'ore_smelt' as const, processingTechniqueId: 'forge_basic_leather_tan' },
    }

    const stages = generateCraftStages(
      recipe,
      materials,
      [],
      10,
      3,
      undefined,
      false,
      partMaterialSupply
    )

    const types = stages.map((s) => s.stageTypeId)
    expect(types.some((t) => t === 'prep_forge_leather_tan')).toBe(true)
    const leather = stages.find((s) => s.stageTypeId === 'prep_forge_leather_tan')
    expect(leather?.baseDuration).toBe(12)
  })

  it('дерево: одна вставка prep_forge_wood_stock без дубля craftStageInsertions ∪ stageTypeHint', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    if (!recipe) return

    const materials = {
      blade: { materialId: 'iron_alloy', quantity: 3 },
      guard: { materialId: 'iron_alloy', quantity: 1 },
      grip: { materialId: 'oak', quantity: 1 },
      pommel: { materialId: 'iron_alloy', quantity: 1 },
    }
    const partMaterialSupply = {
      grip: { mode: 'ore_smelt' as const, processingTechniqueId: 'forge_basic_wood_planks' },
    }

    const stages = generateCraftStages(
      recipe,
      materials,
      [],
      10,
      3,
      undefined,
      false,
      partMaterialSupply
    )

    expect(stages.map((s) => s.stageTypeId).filter((t) => t === 'prep_forge_wood_stock').length).toBe(1)
  })

  it('камень: одна вставка prep_forge_stone_blocks по технике с refiningRecipeId на операции', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    if (!recipe) return

    const materials = {
      blade: { materialId: 'iron_alloy', quantity: 3 },
      guard: { materialId: 'iron_alloy', quantity: 1 },
      grip: { materialId: 'granite', quantity: 1 },
      pommel: { materialId: 'iron_alloy', quantity: 1 },
    }
    const partMaterialSupply = {
      grip: { mode: 'ore_smelt' as const, processingTechniqueId: 'forge_basic_stone_blocks' },
    }

    const stages = generateCraftStages(
      recipe,
      materials,
      [],
      10,
      3,
      undefined,
      false,
      partMaterialSupply
    )

    expect(stages.map((s) => s.stageTypeId).filter((t) => t === 'prep_forge_stone_blocks').length).toBe(1)
  })

  it('серебро: одна вставка prep_forge_ore_smelting только из processingOperations (3.x / 4.x)', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    if (!recipe) return

    const materials = {
      blade: { materialId: 'silver_alloy', quantity: 3 },
      guard: { materialId: 'iron_alloy', quantity: 1 },
      grip: { materialId: 'oak', quantity: 1 },
      pommel: { materialId: 'iron_alloy', quantity: 1 },
    }
    const partMaterialSupply = {
      blade: { mode: 'ore_smelt' as const, processingTechniqueId: 'forge_basic_silver_smelt' },
    }

    const stages = generateCraftStages(recipe, materials, [], 10, 3, undefined, false, partMaterialSupply)
    expect(stages.map((s) => s.stageTypeId).filter((t) => t === 'prep_forge_ore_smelting').length).toBe(1)
  })
})
