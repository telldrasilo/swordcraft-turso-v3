/**
 * Типы системы случайных находок (loot) для экспедиций.
 * Автономная копия для выноса системы в отдельную среду.
 */

export type LocationTag =
  | 'forest'
  | 'cave'
  | 'ruins'
  | 'desert'
  | 'mountain'
  | 'swamp'
  | 'village'
  | 'road'
  | 'dungeon'
  | 'tavern'
  | 'castle'
  | 'temple'
  | 'coast'

export type ExpeditionDifficulty = 'easy' | 'normal' | 'hard' | 'extreme' | 'legendary'

export type ExpeditionEventType =
  | 'combat'
  | 'discovery'
  | 'social'
  | 'travel'
  | 'danger'
  | 'rest'
  | 'mystery'
  | 'weather'
  | 'treasure'

export type LootType = 'resources' | 'materials' | 'recipes' | 'knowledge'
export type LootRarity = 'common' | 'rare' | 'epic' | 'legendary'
export type TimeOfDay = 'day' | 'night' | 'any'
export type WeatherType = 'clear' | 'rain' | 'storm' | 'fog' | 'snow' | 'heat' | 'wind'

export type ResourceId =
  | 'gold'
  | 'soulEssence'
  | 'wood'
  | 'stone'
  | 'iron'
  | 'coal'
  | 'copper'
  | 'tin'
  | 'silver'
  | 'goldOre'
  | 'mithril'
  | 'ironIngot'
  | 'copperIngot'
  | 'tinIngot'
  | 'bronzeIngot'
  | 'steelIngot'
  | 'silverIngot'
  | 'goldIngot'
  | 'mithrilIngot'
  | 'planks'
  | 'stoneBlocks'
  | 'leather'

export interface ResourceLoot {
  resourceId: ResourceId
  baseAmount: number
  variance: number
  name?: string
  icon?: string
}

export type MaterialCategory = 'ores' | 'ingots' | 'stones' | 'wood' | 'leather' | 'essence'

export interface MaterialLoot {
  id: string
  name: string
  nameRu?: string
  category: MaterialCategory
  rarity: LootRarity
  description?: string
  icon?: string
  amount?: number
  value?: number
  origin?: string
  tags?: string[]
}

export interface LootCondition {
  timeOfDay?: TimeOfDay
  adventurerLevel?: { min: number; max?: number }
  weather?: WeatherType[]
  eventType?: ExpeditionEventType[]
  special?: string[]
  difficulty?: ExpeditionDifficulty[]
}

export interface MaterialDropChance {
  materialId: string
  chance: number
  minRarity: LootRarity
  maxRarity: LootRarity
  conditions?: LootCondition
}

export type WeaponType = 'sword' | 'dagger' | 'axe' | 'mace' | 'spear' | 'hammer' | 'bow' | 'staff'
export type WeaponTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'
export type WeaponMaterial = 'iron' | 'bronze' | 'steel' | 'silver' | 'gold' | 'mithril'

export interface RecipeLoot {
  id: string
  name: string
  type: WeaponType
  tier: WeaponTier
  material: WeaponMaterial
  description?: string
  icon?: string
  requiredLevel?: number
  cost?: Record<string, number>
}

export interface RecipeDropChance {
  recipeId: string
  chance: number
  minRarity: LootRarity
  maxRarity: LootRarity
  conditions?: LootCondition
}

export type KnowledgeType = 'enemy' | 'location' | 'craft'

export interface KnowledgeLoot {
  id: string
  type: KnowledgeType
  name: string
  description: string
  icon?: string
  details?: {
    enemyId?: string
    locationId?: string
    craftId?: string
    extra?: Record<string, unknown>
  }
  level?: number
  bonuses?: Record<string, unknown>
}

export interface KnowledgeDropChance {
  knowledgeId: string
  chance: number
  minRarity: LootRarity
  maxRarity: LootRarity
  conditions?: LootCondition
}

export interface LootTable {
  location: LocationTag
  materials?: MaterialDropChance[]
  resources?: ResourceLoot[]
  recipes?: RecipeDropChance[]
  knowledge?: KnowledgeDropChance[]
  maxLootPerEvent?: number
  multipleLootChance?: number
}

export interface AdventurerStats {
  level: number
  luck: number
  traits: string[]
  precision?: number
  power?: number
}

export interface ExpeditionParams {
  difficulty: ExpeditionDifficulty
  location: LocationTag
  duration: number
  tags?: string[]
}

export interface ExpeditionEvent {
  id: string
  type: ExpeditionEventType
  text: string
  icon: string
  order?: number
}

export interface LootGenerationContext {
  adventurer: AdventurerStats
  expedition: ExpeditionParams
  timeOfDay: TimeOfDay
  weather: WeatherType
  event: ExpeditionEvent
}

export interface LootDrop {
  type: LootType
  rarity: LootRarity
  item: ResourceLoot | MaterialLoot | RecipeLoot | KnowledgeLoot
  amount?: number
  id?: string
  source?: {
    eventId: string
    location: LocationTag
  }
}

export interface LootGenerationResult {
  drops: LootDrop[]
  totalCount: number
  stats: {
    resources: number
    materials: number
    recipes: number
    knowledge: number
  }
  rarityStats: {
    common: number
    rare: number
    epic: number
    legendary: number
  }
}

export interface LootConfig {
  baseLootChance: {
    treasure: number
    discovery: number
  }
  maxLootPerEvent: number
  multipleLootChance: number
  typeWeights: {
    resources: number
    materials: number
    knowledge: number
    recipes: number
  }
  rarityModifiers: {
    luckPerPoint: number
    treasureBonus: number
    discoveryBonus: number
    luckyStarBonus: number
    keenEyeBonus: number
  }
}

export const DEFAULT_LOOT_CONFIG: LootConfig = {
  baseLootChance: {
    treasure: 80,
    discovery: 60,
  },
  maxLootPerEvent: 3,
  multipleLootChance: 20,
  typeWeights: {
    resources: 40,
    materials: 30,
    knowledge: 20,
    recipes: 10,
  },
  rarityModifiers: {
    luckPerPoint: 0.4,
    treasureBonus: 5,
    discoveryBonus: 3,
    luckyStarBonus: 5,
    keenEyeBonus: 3,
  },
}

export interface GenerateLootOptions {
  forceRarity?: LootRarity
  forceType?: LootType
  minCount?: number
  maxCount?: number
  ignoreChance?: boolean
}

export interface RarityModifierResult {
  totalModifier: number
  luckModifier: number
  eventModifier: number
  traitModifier: number
}

export interface LootGenerationStats {
  totalGenerated: number
  byType: Record<LootType, number>
  byRarity: Record<LootRarity, number>
  byLocation: Record<LocationTag, number>
  avgLootPerEvent: number
}

export interface LootProvider<T = unknown> {
  type: LootType
  canProvide(context: LootGenerationContext): boolean
  generate(context: LootGenerationContext, rarity: LootRarity): T | null
  getWeight(context: LootGenerationContext): number
}

export function matchesCondition(
  condition: LootCondition | undefined,
  context: LootGenerationContext
): boolean {
  if (!condition) return true

  if (condition.timeOfDay && condition.timeOfDay !== 'any' && condition.timeOfDay !== context.timeOfDay) {
    return false
  }

  if (condition.adventurerLevel) {
    const { min, max } = condition.adventurerLevel
    if (context.adventurer.level < min) return false
    if (max !== undefined && context.adventurer.level > max) return false
  }

  if (condition.weather?.length && !condition.weather.includes(context.weather)) {
    return false
  }

  if (condition.eventType?.length && !condition.eventType.includes(context.event.type)) {
    return false
  }

  if (condition.difficulty?.length && !condition.difficulty.includes(context.expedition.difficulty)) {
    return false
  }

  return true
}
