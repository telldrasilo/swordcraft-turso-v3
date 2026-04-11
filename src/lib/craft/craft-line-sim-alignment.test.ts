import { describe, expect, it } from 'vitest'
import {
  collectExpandedStageConfigsForCraft,
  generateCraftStages,
} from '@/lib/craft/process-generator'
import { getRecipeById } from '@/data/recipes/index'
import { getTechniqueById } from '@/data/techniques'
import { DEFAULT_GAME_CONFIG } from '@/types/craft-v2'

/**
 * Мягкая сходимость: симуляция исполняет тот же хребет макроэтапов (по stageType),
 * что и рецепт для простого плана без модификаций техник.
 */
describe('Craft line vs generateCraftStages (пилот basic_sword)', () => {
  it('число экземпляров стадий и порядок stageTypeId совпадают с рецептом (без закупки)', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    if (!recipe) return
    const materials = {
      blade: { materialId: 'iron_ingot', quantity: 3 },
      guard: { materialId: 'iron_ingot', quantity: 1 },
      grip: { materialId: 'oak_planks', quantity: 1 },
      pommel: { materialId: 'iron_ingot', quantity: 1 },
    }
    const instances = generateCraftStages(
      recipe,
      materials,
      [],
      1,
      1,
      DEFAULT_GAME_CONFIG,
      false,
      {
        blade: { mode: 'direct' },
        guard: { mode: 'direct' },
        grip: { mode: 'direct' },
        pommel: { mode: 'direct' },
      },
      {}
    )
    expect(instances.length).toBe(recipe.stages.length)
    for (let i = 0; i < recipe.stages.length; i++) {
      const inst = instances[i]
      const cfg = recipe.stages[i]
      expect(inst).toBeDefined()
      expect(cfg).toBeDefined()
      if (inst && cfg) expect(inst.stageTypeId).toBe(cfg.stageType)
    }
  })

  it('collectExpandedStageConfigsForCraft совпадает с generateCraftStages по stageType (processMods: balanced_design)', () => {
    const recipe = getRecipeById('basic_sword')
    const tech = getTechniqueById('balanced_design')
    expect(recipe).toBeDefined()
    expect(tech).toBeDefined()
    if (!recipe || !tech) return
    const materials = {
      blade: { materialId: 'iron_ingot', quantity: 3 },
      guard: { materialId: 'iron_ingot', quantity: 1 },
      grip: { materialId: 'oak_planks', quantity: 1 },
      pommel: { materialId: 'iron_ingot', quantity: 1 },
    }
    const expanded = collectExpandedStageConfigsForCraft(
      recipe,
      materials,
      [tech],
      1,
      1,
      DEFAULT_GAME_CONFIG,
      false,
      {
        blade: { mode: 'direct' },
        guard: { mode: 'direct' },
        grip: { mode: 'direct' },
        pommel: { mode: 'direct' },
      },
      {}
    )
    const instances = generateCraftStages(
      recipe,
      materials,
      [tech],
      1,
      1,
      DEFAULT_GAME_CONFIG,
      false,
      {
        blade: { mode: 'direct' },
        guard: { mode: 'direct' },
        grip: { mode: 'direct' },
        pommel: { mode: 'direct' },
      },
      {}
    )
    expect(expanded.length).toBe(instances.length)
    expect(expanded.length).toBeGreaterThan(recipe.stages.length)
    for (let i = 0; i < expanded.length; i++) {
      expect(instances[i].stageTypeId).toBe(expanded[i].stageType)
    }
  })
})
