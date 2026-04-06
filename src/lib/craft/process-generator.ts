/**
 * Генератор процесса крафта
 * Создаёт последовательность этапов из рецепта с учётом материалов и техник
 */

import type { 
  WeaponRecipe, 
  Material, 
  Technique, 
  CraftStageInstance, 
  MaterialAssignment,
  CraftPlan,
  ActiveCraftV2,
  GameConfig,
  StageTypeDefinition,
  PartMaterialSupplyEntry,
  CraftStageSource,
} from '@/types/craft-v2'
import { DEFAULT_GAME_CONFIG } from '@/types/craft-v2'
import { getStageById } from '@/data/stages'
import { getMaterialAsLegacy } from '@/data/materials'
import { getRecipeById } from '@/data/recipes'
import { getTechniqueById } from '@/data/techniques'
import { resolveProcessingTechniqueForPart } from '@/data/material-processing-techniques'
import {
  aggregateExpertiseImpactsForPlan,
  buildExpertisePlanRowsFromCraft,
  getExpertiseTimeMultiplierForMaterial,
} from '@/lib/craft/aggregate-expertise-impact'
import { scaleCraftSoulCapacityToWeaponPool } from '@/data/war-soul-tiers'

/**
 * Контекст для генерации процесса
 */
interface GenerationContext {
  recipe: WeaponRecipe
  materials: MaterialAssignment
  techniques: Technique[]
  blacksmithLevel: number
  forgeLevel: number
  config: GameConfig
  materialExpertise: Record<string, number>
  /** Глобальный множитель времени от экспертизы (этапы без primaryMaterialId). */
  aggregatedExpertiseTimeMultiplier: number
}

/**
 * Сгенерировать экземпляры этапов из плана крафта
 */
export function generateCraftStages(
  recipe: WeaponRecipe,
  materials: MaterialAssignment,
  techniques: Technique[] = [],
  blacksmithLevel: number = 1,
  forgeLevel: number = 1,
  config: GameConfig = DEFAULT_GAME_CONFIG,
  shouldPurchaseMaterials: boolean = false,
  partMaterialSupply?: Record<string, PartMaterialSupplyEntry>,
  materialExpertise: Record<string, number> = {}
): CraftStageInstance[] {
  const expertiseRows = buildExpertisePlanRowsFromCraft(recipe, materials)
  const aggExpertise = aggregateExpertiseImpactsForPlan(expertiseRows, materialExpertise)

  const context: GenerationContext = {
    recipe,
    materials,
    techniques,
    blacksmithLevel,
    forgeLevel,
    config,
    materialExpertise,
    aggregatedExpertiseTimeMultiplier: aggExpertise.timeMultiplier,
  }
  
  // 1. Базовая последовательность этапов из рецепта
  let stageConfigs = [...recipe.stages]
  
  // 2. Добавляем этап закупки материалов, если нужно
  if (shouldPurchaseMaterials) {
    stageConfigs.unshift({ stageType: 'proc_purchasing', stageSource: 'global' })
  }
  
  // 3. Применяем модификации от материалов
  stageConfigs = applyMaterialMods(stageConfigs, materials, context)
  
  // 3. Применяем модификации от техник
  stageConfigs = applyTechniqueMods(stageConfigs, techniques, context)

  stageConfigs = applyPartMaterialSupplyStageConfigs(
    stageConfigs,
    materials,
    partMaterialSupply
  )

  stageConfigs = attachPrimaryMetadataToStages(stageConfigs, materials)
  
  // 4. Создаём экземпляры этапов
  const instances: CraftStageInstance[] = stageConfigs.map((config, index) => {
    const stageType = getStageById(config.stageType)
    if (!stageType) {
      console.warn(`Stage type not found: ${config.stageType}`)
      return null
    }
    
    return createStageInstance(
      stageType,
      config,
      index,
      context
    )
  }).filter(Boolean) as CraftStageInstance[]
  
  return instances
}

/**
 * Применить модификации от материалов
 */
function applyMaterialMods(
  stages: WeaponRecipe['stages'],
  materials: MaterialAssignment,
  _context: GenerationContext
): WeaponRecipe['stages'] {
  const result = [...stages]
  
  // Для каждого материала проверяем processingProfile
  for (const [, { materialId }] of Object.entries(materials)) {
    const material = getMaterialAsLegacy(materialId)
    if (!material?.processingProfile?.stages) continue
    
    const { replacements, forbidden } = material.processingProfile.stages
    
    // Удаляем запрещённые этапы
    if (forbidden) {
      for (let i = result.length - 1; i >= 0; i--) {
        if (forbidden.includes(result[i].stageType)) {
          result.splice(i, 1)
        }
      }
    }
    
    // Заменяем этапы
    if (replacements) {
      for (let i = 0; i < result.length; i++) {
        const replacement = replacements[result[i].stageType]
        if (replacement) {
          result[i] = { ...result[i], stageType: replacement }
        }
      }
    }
  }
  
  return result
}

/**
 * Применить модификации от техник
 */
function applyPartMaterialSupplyStageConfigs(
  stages: WeaponRecipe['stages'],
  materials: MaterialAssignment,
  partMaterialSupply?: Record<string, PartMaterialSupplyEntry>
): WeaponRecipe['stages'] {
  if (!partMaterialSupply || Object.keys(partMaterialSupply).length === 0) {
    return stages
  }
  const result = [...stages]
  const insertions: {
    stageType: string
    afterStageType?: string
    beforeStageType?: string
    baseDurationOverride?: number
    primaryPartId?: string
    primaryMaterialId?: string
    stageSource?: 'processing_technique'
    techniqueId?: string
  }[] = []

  for (const [partId, assign] of Object.entries(materials)) {
    const entry = partMaterialSupply[partId]
    const tech = resolveProcessingTechniqueForPart(partId, assign.materialId, entry)
    if (!tech?.craftStageInsertions?.length) continue
    for (const ins of tech.craftStageInsertions) {
      insertions.push({
        stageType: ins.stageType,
        afterStageType: ins.afterStageType,
        beforeStageType: ins.beforeStageType,
        baseDurationOverride:
          ins.durationSeconds != null && ins.durationSeconds > 0
            ? ins.durationSeconds
            : undefined,
        primaryPartId: partId,
        primaryMaterialId: assign.materialId,
        stageSource: 'processing_technique',
        techniqueId: tech.id,
      })
    }
  }

  for (const ins of insertions) {
    let idx: number
    if (ins.afterStageType) {
      const pos = result.findIndex(s => s.stageType === ins.afterStageType)
      idx = pos >= 0 ? pos + 1 : result.length
    } else if (ins.beforeStageType) {
      const pos = result.findIndex(s => s.stageType === ins.beforeStageType)
      idx = pos >= 0 ? pos : result.length
    } else {
      idx = result.length
    }
    result.splice(idx, 0, {
      stageType: ins.stageType,
      ...(ins.baseDurationOverride != null
        ? { baseDurationOverride: ins.baseDurationOverride }
        : {}),
      ...(ins.primaryPartId != null ? { primaryPartId: ins.primaryPartId } : {}),
      ...(ins.primaryMaterialId != null ? { primaryMaterialId: ins.primaryMaterialId } : {}),
      ...(ins.stageSource != null ? { stageSource: ins.stageSource } : {}),
      ...(ins.techniqueId != null ? { techniqueId: ins.techniqueId } : {}),
    })
  }
  return result
}

function attachPrimaryMetadataToStages(
  stages: WeaponRecipe['stages'],
  materials: MaterialAssignment
): WeaponRecipe['stages'] {
  return stages.map((s) => {
    if (s.primaryMaterialId && s.primaryPartId && s.stageSource) {
      return s
    }
    const partId = s.material
    const assign = partId ? materials[partId] : undefined
    if (partId && assign?.materialId) {
      return {
        ...s,
        primaryPartId: s.primaryPartId ?? partId,
        primaryMaterialId: s.primaryMaterialId ?? assign.materialId,
        stageSource: s.stageSource ?? 'recipe',
      }
    }
    return {
      ...s,
      stageSource: s.stageSource ?? 'global',
    }
  })
}

function applyTechniqueMods(
  stages: WeaponRecipe['stages'],
  techniques: Technique[],
  _context: GenerationContext
): WeaponRecipe['stages'] {
  const result = [...stages]
  
  for (const technique of techniques) {
    if (!technique.processMods) continue
    
    const { replaceStage, addStage } = technique.processMods
    
    // Замена этапов
    if (replaceStage) {
      for (let i = 0; i < result.length; i++) {
        const replacement = replaceStage[result[i].stageType]
        if (replacement) {
          result[i] = { ...result[i], stageType: replacement }
        }
      }
    }
    
    // Добавление этапов
    if (addStage) {
      const insertIndex = addStage.after
        ? result.findIndex(s => s.stageType === addStage.after) + 1
        : addStage.before
        ? result.findIndex(s => s.stageType === addStage.before)
        : result.length
      
      if (insertIndex >= 0) {
        result.splice(insertIndex, 0, { stageType: addStage.stage })
      }
    }
  }
  
  return result
}

/**
 * Создать экземпляр этапа
 */
function createStageInstance(
  stageType: StageTypeDefinition,
  config: {
    stageType: string
    material?: string
    target?: string
    baseDurationOverride?: number
    primaryPartId?: string
    primaryMaterialId?: string
    stageSource?: CraftStageSource
    techniqueId?: string
  },
  index: number,
  context: GenerationContext
): CraftStageInstance {
  // Получаем материал для расчёта модификаторов
  const partAssign = config.material ? context.materials[config.material] : undefined
  const primaryMaterialId =
    config.primaryMaterialId ?? partAssign?.materialId

  const material = primaryMaterialId
    ? getMaterialAsLegacy(primaryMaterialId)
    : partAssign
      ? getMaterialAsLegacy(partAssign.materialId)
      : null

  const primaryPartId =
    config.primaryPartId ?? (config.material ? config.material : undefined)
  const stageSource =
    config.stageSource ?? (config.material ? 'recipe' : 'global')
  
  // Рассчитываем длительность
  const baseDuration =
    config.baseDurationOverride != null && config.baseDurationOverride > 0
      ? config.baseDurationOverride
      : stageType.baseDuration
  const calculatedDuration = calculateStageDuration(
    baseDuration,
    stageType,
    material ?? null,
    context,
    primaryMaterialId
  )
  
  // Выбираем сообщения
  const startMessage = selectMessage(stageType.messages.start)
  const completeMessage = selectMessage(stageType.messages.complete)
  
  return {
    id: `stage_${index}_${Date.now()}`,
    stageTypeId: stageType.id,
    name: stageType.name,
    category: stageType.category,
    materialId: config.material,
    target: config.target,
    primaryPartId,
    primaryMaterialId,
    stageSource,
    techniqueId: config.techniqueId,
    baseDuration,
    calculatedDuration,
    status: 'pending',
    progress: 0,
    startMessage,
    completeMessage,
    requirements: stageType.requirements,
    environmentRequired: stageType.environmentRequired,
  }
}

/**
 * Рассчитать длительность этапа с модификаторами
 */
function calculateStageDuration(
  baseDuration: number,
  stageType: StageTypeDefinition,
  material: Material | null,
  context: GenerationContext,
  primaryMaterialId?: string
): number {
  let duration = baseDuration
  
  // Глобальный множитель
  duration *= context.config.craftSpeedMultiplier
  
  // Модификаторы этапа
  if (stageType.durationModifiers) {
    // Навык кузнеца
    if (stageType.durationModifiers.skill) {
      const reduction = context.blacksmithLevel * 0.03  // -3% за уровень
      duration *= (1 - reduction)
    }
    
    // Уровень кузницы
    if (stageType.durationModifiers.tool) {
      const reduction = context.forgeLevel * 0.05  // -5% за уровень
      duration *= (1 - reduction)
    }
    
    // Материал (обрабатываемость)
    if (stageType.durationModifiers.material && material) {
      const workability = material.crafting.workability
      duration *= (100 / workability)  // Чем ниже workability, тем дольше
    }
  }

  const preExpertiseDuration = duration
  let expertiseTime = 1
  if (primaryMaterialId) {
    expertiseTime = getExpertiseTimeMultiplierForMaterial(
      primaryMaterialId,
      context.materialExpertise
    )
  } else {
    expertiseTime = context.aggregatedExpertiseTimeMultiplier
  }
  duration *= expertiseTime

  const softFloor = preExpertiseDuration * 0.75
  duration = Math.max(duration, softFloor)
  
  // Минимум 5 секунд
  return Math.max(5, Math.round(duration))
}

/**
 * Выбрать случайное сообщение из списка
 */
function selectMessage(messages: string[]): string {
  if (!messages || messages.length === 0) return '...'
  return messages[Math.floor(Math.random() * messages.length)]
}

/**
 * Создать план крафта
 */
export function createCraftPlan(
  recipeId: string,
  materials: MaterialAssignment,
  techniqueIds: string[] = [],
  blacksmithLevel: number = 1,
  forgeLevel: number = 1,
  shouldPurchaseMaterials: boolean = false,
  partMaterialSupply?: Record<string, PartMaterialSupplyEntry>,
  materialExpertise: Record<string, number> = {}
): CraftPlan {
  const recipe = getRecipeById(recipeId)
  if (!recipe) {
    throw new Error(`Recipe not found: ${recipeId}`)
  }
  
  const techniques: Technique[] = techniqueIds
    .map(id => getTechniqueById(id))
    .filter((t): t is Technique => t !== undefined)
  
  // Генерируем этапы
  const stages = generateCraftStages(
    recipe,
    materials,
    techniques,
    blacksmithLevel,
    forgeLevel,
    undefined,
    shouldPurchaseMaterials,
    partMaterialSupply,
    materialExpertise
  )
  
  // Рассчитываем общее время
  const estimatedTime = stages.reduce((sum, s) => sum + s.calculatedDuration, 0)
  
  // Рассчитываем характеристики
  const estimatedStats = calculateWeaponStats(recipe, materials, techniques, blacksmithLevel)
  
  // Оценка качества
  const estimatedQuality = estimateQuality(blacksmithLevel, materials, techniques)
  
  const supply =
    partMaterialSupply && Object.keys(partMaterialSupply).length > 0
      ? partMaterialSupply
      : undefined

  return {
    recipeId,
    materials,
    techniques: techniqueIds,
    shouldPurchaseMaterials,
    partMaterialSupply: supply,
    estimatedTime,
    estimatedStats,
    estimatedQuality,
  }
}

/**
 * Рассчитать характеристики оружия
 */
function calculateWeaponStats(
  recipe: WeaponRecipe,
  materials: MaterialAssignment,
  techniques: Technique[],
  _blacksmithLevel: number
): CraftPlan['estimatedStats'] {
  const base = recipe.baseStats
  
  // Начальные значения из базы
  let attack = base.attackBase
  let durability = base.durabilityBase
  let weight = base.weightBase
  let soulCapacity = base.soulCapacityBase
  const balance = 75 // базовый баланс
  let repairPotential = 1.0
  let enchantSlots = 0
  let enchantPower = 1.0
  
  // Применяем бонусы от материалов
  for (const [, { materialId }] of Object.entries(materials)) {
    const material = getMaterialAsLegacy(materialId)
    if (!material) continue
    
    // Бонусы к атаке
    attack += attack * (material.weaponEffects.attackBonus / 100)
    
    // Бонусы к прочности
    durability += durability * (material.weaponEffects.durabilityBonus / 100)
    
    // Вместимость души
    soulCapacity += material.weaponEffects.soulCapacity
    
    // Вес
    weight += material.properties.weight * 0.1
    
    // Дополнительные свойства
    repairPotential = Math.max(repairPotential, material.weaponEffects.repairPotential)
    enchantSlots += material.weaponEffects.enchantSlots
    enchantPower *= material.weaponEffects.enchantPower
  }
  
  // Применяем бонусы от техник
  for (const technique of techniques) {
    if (technique.effects.qualityBonus) {
      attack *= 1 + (technique.effects.qualityBonus / 100)
    }
  }
  
  return {
    attack: Math.round(attack),
    durability: Math.round(durability),
    maxDurability: Math.round(durability),
    weight: Math.round(weight * 10) / 10,
    balance: Math.round(balance),
    soulCapacity: scaleCraftSoulCapacityToWeaponPool(Math.round(soulCapacity)),
    repairPotential,
    enchantSlots,
    enchantPower,
  }
}

/**
 * Оценить качество оружия
 */
function estimateQuality(
  blacksmithLevel: number,
  _materials: MaterialAssignment,
  techniques: Technique[]
): CraftPlan['estimatedQuality'] {
  // Базовое качество от уровня кузнеца
  let quality = 30 + blacksmithLevel * 2
  
  // Бонус от техник
  for (const technique of techniques) {
    if (technique.effects.qualityBonus) {
      quality += technique.effects.qualityBonus * 0.5
    }
  }
  
  // Ограничение
  quality = Math.min(100, Math.max(0, quality))
  
  // Определяем градацию
  if (quality >= 96) return 'legendary'
  if (quality >= 86) return 'masterpiece'
  if (quality >= 71) return 'excellent'
  if (quality >= 51) return 'good'
  if (quality >= 31) return 'common'
  return 'poor'
}

/**
 * Создать активный процесс крафта
 */
export function createActiveCraft(
  plan: CraftPlan,
  recipe: WeaponRecipe,
  materialExpertise: Record<string, number> = {}
): ActiveCraftV2 {
  const stages = generateCraftStages(
    recipe,
    plan.materials,
    [], // техники уже применены в плане
    1,  // уровень кузнеца
    1,  // уровень кузницы
    undefined, // config
    plan.shouldPurchaseMaterials ?? false,
    plan.partMaterialSupply,
    materialExpertise
  )
  
  const totalDuration = stages.reduce((sum, s) => sum + s.calculatedDuration, 0)
  
  return {
    id: `craft_${Date.now()}`,
    plan,
    stages,
    currentStageIndex: 0,
    startTime: Date.now(),
    totalDuration,
    elapsedTime: 0,
    status: 'planning',
    log: [],
  }
}

const processGeneratorDefaultExport = {
  generateCraftStages,
  createCraftPlan,
  createActiveCraft,
}
export default processGeneratorDefaultExport
