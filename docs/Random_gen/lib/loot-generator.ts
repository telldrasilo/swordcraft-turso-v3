/**
 * Генератор случайных находок (loot) для экспедиций.
 * Автономная версия для отдельной среды разработки.
 */

import type {
  GenerateLootOptions,
  KnowledgeLoot,
  LootConfig,
  LootDrop,
  LootGenerationContext,
  LootGenerationResult,
  LootRarity,
  LootType,
  MaterialLoot,
  RecipeLoot,
  ResourceLoot,
} from '../types/expedition-loot.types'
import { DEFAULT_LOOT_CONFIG } from '../types/expedition-loot.types'
import { getLootTable, getMaterialData } from '../data/loot-tables'
import { getKnowledgeById, getKnowledgeForLocation } from '../data/knowledge-discoveries'

function randomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function checkChance(chance: number): boolean {
  return Math.random() * 100 < chance
}

function weightedRandom<T>(items: Array<{ item: T; weight: number }>): T | null {
  const total = items.reduce((sum, entry) => sum + entry.weight, 0)
  if (!total) return null

  let roll = Math.random() * total
  for (const entry of items) {
    roll -= entry.weight
    if (roll <= 0) return entry.item
  }

  return items[items.length - 1]?.item ?? null
}

const BASE_RARITY_DISTRIBUTION: Record<string, Record<LootRarity, number>> = {
  easy: { common: 60, rare: 30, epic: 10, legendary: 0 },
  normal: { common: 40, rare: 40, epic: 20, legendary: 0 },
  hard: { common: 30, rare: 40, epic: 25, legendary: 5 },
  extreme: { common: 20, rare: 30, epic: 35, legendary: 15 },
  legendary: { common: 10, rare: 20, epic: 40, legendary: 30 },
}

export function calculateRarityModifiers(context: LootGenerationContext, config: LootConfig = DEFAULT_LOOT_CONFIG) {
  const luckModifier = (context.adventurer.luck - 25) * config.rarityModifiers.luckPerPoint
  const eventModifier =
    context.event.type === 'treasure'
      ? config.rarityModifiers.treasureBonus
      : context.event.type === 'discovery'
        ? config.rarityModifiers.discoveryBonus
        : 0

  let traitModifier = 0
  if (context.adventurer.traits.includes('lucky_star')) traitModifier += config.rarityModifiers.luckyStarBonus
  if (context.adventurer.traits.includes('keen_eye')) traitModifier += config.rarityModifiers.keenEyeBonus

  return {
    totalModifier: luckModifier + eventModifier + traitModifier,
    luckModifier,
    eventModifier,
    traitModifier,
  }
}

export function selectRarity(context: LootGenerationContext, config: LootConfig = DEFAULT_LOOT_CONFIG): LootRarity {
  const distribution = {
    ...BASE_RARITY_DISTRIBUTION[context.expedition.difficulty],
  }

  const modifiers = calculateRarityModifiers(context, config)
  const rareBoost = modifiers.totalModifier * 0.4

  distribution.common = Math.max(5, distribution.common - rareBoost)
  distribution.rare = Math.min(50, distribution.rare + rareBoost * 0.5)
  distribution.epic = Math.min(30, distribution.epic + rareBoost * 0.35)
  distribution.legendary = Math.min(15, distribution.legendary + rareBoost * 0.15)

  return (
    weightedRandom(
      Object.entries(distribution).map(([rarity, weight]) => ({
        item: rarity as LootRarity,
        weight,
      }))
    ) ?? 'common'
  )
}

function calculateTypeWeights(context: LootGenerationContext, config: LootConfig): Record<LootType, number> {
  const weights = { ...config.typeWeights }

  if (context.event.type === 'treasure') {
    weights.materials += 10
    weights.recipes += 5
  }

  if (context.event.type === 'discovery') {
    weights.knowledge += 15
  }

  if (context.adventurer.traits.includes('knowledge_seeker')) weights.knowledge += 10
  if (context.adventurer.traits.includes('resourceful')) weights.resources += 10
  if (context.adventurer.traits.includes('explorer')) weights.materials += 5

  return weights
}

export function selectLootType(context: LootGenerationContext, config: LootConfig = DEFAULT_LOOT_CONFIG): LootType {
  const weights = calculateTypeWeights(context, config)
  return (
    weightedRandom(
      Object.entries(weights).map(([type, weight]) => ({
        item: type as LootType,
        weight,
      }))
    ) ?? 'resources'
  )
}

function generateResourceLoot(context: LootGenerationContext, rarity: LootRarity): ResourceLoot | null {
  const lootTable = getLootTable(context.expedition.location)
  if (!lootTable?.resources?.length) return null

  const resource = lootTable.resources[Math.floor(Math.random() * lootTable.resources.length)]
  const multiplier = { common: 1, rare: 1.5, epic: 2, legendary: 3 }[rarity]
  const amount = Math.floor((resource.baseAmount + randomRange(-resource.variance, resource.variance)) * multiplier)

  return {
    ...resource,
    baseAmount: amount,
    variance: 0,
  }
}

function generateMaterialLoot(context: LootGenerationContext): MaterialLoot | null {
  const lootTable = getLootTable(context.expedition.location)
  if (!lootTable?.materials?.length) return null

  const materialId = weightedRandom(
    lootTable.materials.map((entry) => ({ item: entry.materialId, weight: entry.chance }))
  )
  if (!materialId) return null

  const material = getMaterialData(materialId)
  if (!material) return null

  return {
    ...material,
    amount: 1,
  }
}

function generateKnowledgeLoot(context: LootGenerationContext, rarity: LootRarity): KnowledgeLoot | null {
  const knowledgeEntries = getKnowledgeForLocation(context.expedition.location).filter((entry) => {
    const rank = ['common', 'rare', 'epic', 'legendary']
    const current = rank.indexOf(rarity)
    return current >= rank.indexOf(entry.minRarity) && current <= rank.indexOf(entry.maxRarity)
  })

  const knowledgeId = weightedRandom(knowledgeEntries.map((entry) => ({ item: entry.knowledgeId, weight: entry.chance })))
  return knowledgeId ? getKnowledgeById(knowledgeId) ?? null : null
}

function generateRecipeLoot(_context: LootGenerationContext, _rarity: LootRarity): RecipeLoot | null {
  return null
}

function generateLootByType(
  type: LootType,
  context: LootGenerationContext,
  rarity: LootRarity
): ResourceLoot | MaterialLoot | RecipeLoot | KnowledgeLoot | null {
  switch (type) {
    case 'resources':
      return generateResourceLoot(context, rarity)
    case 'materials':
      return generateMaterialLoot(context)
    case 'knowledge':
      return generateKnowledgeLoot(context, rarity)
    case 'recipes':
      return generateRecipeLoot(context, rarity)
    default:
      return null
  }
}

export function checkBaseLootChance(eventType: string, config: LootConfig = DEFAULT_LOOT_CONFIG): boolean {
  if (eventType === 'treasure') return checkChance(config.baseLootChance.treasure)
  if (eventType === 'discovery') return checkChance(config.baseLootChance.discovery)
  return false
}

export function generateLootFromEvent(
  event: { id: string; type: string },
  context: LootGenerationContext,
  options?: GenerateLootOptions
): LootDrop[] {
  const config = DEFAULT_LOOT_CONFIG
  if (!options?.ignoreChance && !checkBaseLootChance(event.type, config)) return []

  const lootTable = getLootTable(context.expedition.location)
  if (!lootTable) return []

  const minLoot = options?.minCount ?? 1
  const maxLoot = options?.maxCount ?? lootTable.maxLootPerEvent ?? config.maxLootPerEvent
  let lootCount = randomRange(minLoot, maxLoot)

  if (lootCount > 1 && !checkChance(lootTable.multipleLootChance ?? config.multipleLootChance)) {
    lootCount = 1
  }

  const drops: LootDrop[] = []

  for (let i = 0; i < lootCount; i++) {
    const type = options?.forceType ?? selectLootType(context, config)
    const rarity = options?.forceRarity ?? selectRarity(context, config)
    const item = generateLootByType(type, context, rarity)
    if (!item) continue

    drops.push({
      id: `loot_${Date.now()}_${i}`,
      type,
      rarity,
      item,
      amount: 'amount' in item ? item.amount : undefined,
      source: {
        eventId: event.id,
        location: context.expedition.location,
      },
    })
  }

  return drops
}

export function generateLootWithStats(
  event: { id: string; type: string },
  context: LootGenerationContext,
  options?: GenerateLootOptions
): LootGenerationResult {
  const drops = generateLootFromEvent(event, context, options)

  const stats = { resources: 0, materials: 0, recipes: 0, knowledge: 0 }
  const rarityStats = { common: 0, rare: 0, epic: 0, legendary: 0 }

  for (const drop of drops) {
    stats[drop.type] += 1
    rarityStats[drop.rarity] += 1
  }

  return {
    drops,
    totalCount: drops.length,
    stats,
    rarityStats,
  }
}

export function createMockEvent(type: string = 'treasure') {
  return {
    id: `test_${type}_${Date.now()}`,
    type,
    text: `Test ${type} event`,
    icon: '🎁',
  }
}

export function createMockContext(overrides?: Partial<LootGenerationContext>): LootGenerationContext {
  return {
    adventurer: {
      level: 15,
      luck: 25,
      traits: [],
      ...overrides?.adventurer,
    },
    expedition: {
      difficulty: 'normal',
      location: 'forest',
      duration: 600,
      ...overrides?.expedition,
    },
    timeOfDay: 'day',
    weather: 'clear',
    event: {
      id: 'test_event',
      type: 'treasure',
      text: 'Test event',
      icon: '🎁',
      ...overrides?.event,
    },
    ...overrides,
  } as LootGenerationContext
}

export function generateManyLoot(
  event: { id: string; type: string },
  context: LootGenerationContext,
  count: number,
  options?: GenerateLootOptions
): LootDrop[] {
  const all: LootDrop[] = []
  for (let i = 0; i < count; i++) {
    all.push(...generateLootFromEvent(event, context, options))
  }
  return all
}
