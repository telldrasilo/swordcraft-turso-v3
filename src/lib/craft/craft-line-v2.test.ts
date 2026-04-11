import { describe, expect, it } from 'vitest'
import {
  buildBackboneSegmentsFromRecipe,
  buildCraftLineFromPlan,
  buildCraftLineFromPlanV2,
} from '@/lib/craft/build-craft-line'
import { collectExpandedStageConfigsForCraft, generateCraftStages } from '@/lib/craft/process-generator'
import { getRecipeById } from '@/data/recipes/index'
import { getTechniqueById } from '@/data/techniques'
import type { CraftPlan } from '@/types/craft-v2'
import { DEFAULT_GAME_CONFIG } from '@/types/craft-v2'
import { isCraftLineBackboneSegment, isCraftLineTechniqueSegment } from '@/types/craft-line'

describe('Craft line v2 (хребет + техники)', () => {
  it('buildBackboneSegmentsFromRecipe: сумма долей = 1', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    if (!recipe) return
    const segs = buildBackboneSegmentsFromRecipe(recipe)
    expect(segs.length).toBeGreaterThan(0)
    const sum = segs.reduce((s, x) => s + x.durationShare, 0)
    expect(sum).toBeCloseTo(1, 5)
    expect(segs.every(isCraftLineBackboneSegment)).toBe(true)
  })

  it('buildCraftLineFromPlanV2: якорь basic_forging после стадии 8 — боевой блок не в самом конце', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    if (!recipe) return
    const plan: CraftPlan = {
      recipeId: 'basic_sword',
      materials: {
        blade: { materialId: 'iron_alloy', quantity: 1 },
        guard: { materialId: 'iron_alloy', quantity: 1 },
        grip: { materialId: 'oak_wood', quantity: 1 },
        pommel: { materialId: 'iron_alloy', quantity: 1 },
      },
      techniques: ['basic_forging'],
      shouldPurchaseMaterials: false,
      partMaterialSupply: {
        blade: { mode: 'ore_smelt', processingTechniqueId: 'forge_basic_iron_smelt' },
      },
      estimatedTime: 100,
      estimatedStats: {
        attack: 1,
        durability: 1,
        maxDurability: 1,
        weight: 1,
        balance: 1,
        soulCapacity: 1,
        repairPotential: 1,
        enchantSlots: 0,
        enchantPower: 0,
      },
      estimatedQuality: 'common',
    }

    const v2 = buildCraftLineFromPlanV2(plan, recipe)
    const legacy = buildCraftLineFromPlan(plan)
    expect(v2.reduce((s, x) => s + x.durationShare, 0)).toBeCloseTo(1, 5)
    const hasBackbone = v2.some(isCraftLineBackboneSegment)
    const hasTechnique = v2.some(isCraftLineTechniqueSegment)
    expect(hasBackbone).toBe(true)
    expect(hasTechnique).toBe(true)

    const firstForging = v2.findIndex(
      s =>
        isCraftLineTechniqueSegment(s) &&
        s.techniqueRef.kind === 'craft' &&
        s.techniqueRef.id === 'basic_forging'
    )
    expect(firstForging).toBeGreaterThan(0)
    const prefix = v2.slice(0, firstForging)
    expect(prefix.some(s => isCraftLineBackboneSegment(s) && s.stageIndex === 8)).toBe(true)
    const suffix = v2.slice(firstForging)
    expect(suffix.some(s => isCraftLineBackboneSegment(s) && s.stageIndex === 9)).toBe(true)
    expect(legacy.length).toBeGreaterThan(0)
  })

  it('buildCraftLineFromPlanV2 + balanced_design (processMods): полоса нормализована, приём присутствует', () => {
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
    const supply = {
      blade: { mode: 'direct' as const },
      guard: { mode: 'direct' as const },
      grip: { mode: 'direct' as const },
      pommel: { mode: 'direct' as const },
    }
    const plan: CraftPlan = {
      recipeId: 'basic_sword',
      materials,
      techniques: ['balanced_design'],
      shouldPurchaseMaterials: false,
      partMaterialSupply: supply,
      estimatedTime: 100,
      estimatedStats: {
        attack: 1,
        durability: 1,
        maxDurability: 1,
        weight: 1,
        balance: 1,
        soulCapacity: 1,
        repairPotential: 1,
        enchantSlots: 0,
        enchantPower: 0,
      },
      estimatedQuality: 'common',
    }

    const expanded = collectExpandedStageConfigsForCraft(
      recipe,
      materials,
      [tech],
      1,
      1,
      DEFAULT_GAME_CONFIG,
      false,
      supply,
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
      supply,
      {}
    )
    expect(expanded.map(c => c.stageType).join('|')).toBe(
      instances.map(i => i.stageTypeId).join('|')
    )

    const v2 = buildCraftLineFromPlanV2(plan, recipe)
    expect(v2.reduce((s, x) => s + x.durationShare, 0)).toBeCloseTo(1, 5)
    expect(
      v2.some(
        s =>
          isCraftLineTechniqueSegment(s) &&
          s.techniqueRef.kind === 'craft' &&
          s.techniqueRef.id === 'balanced_design'
      )
    ).toBe(true)
  })
})
