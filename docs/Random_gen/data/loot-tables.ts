/**
 * Таблицы дропа (Loot Tables) для локаций экспедиций
 * Определяют, какие материалы, ресурсы и знания можно найти в каждой локации
 */

import type {
  LootTable,
  LocationTag,
  LootRarity,
  MaterialDropChance,
  ResourceLoot,
} from '../types/expedition-loot.types'

// ================================
// ОПРЕДЕЛЕНИЯ МАТЕРИАЛОВ
// ================================

const WOOD_MATERIALS = {
  oak: { id: 'oak', name: 'Дуб', nameRu: 'Дуб', category: 'wood', rarity: 'common' as LootRarity },
  birch: { id: 'birch', name: 'Береза', nameRu: 'Береза', category: 'wood', rarity: 'common' as LootRarity },
  ash: { id: 'ash', name: 'Ясень', nameRu: 'Ясень', category: 'wood', rarity: 'common' as LootRarity },
  ironwood: { id: 'ironwood', name: 'Железное дерево', nameRu: 'Железное дерево', category: 'wood', rarity: 'rare' as LootRarity },
  ebony: { id: 'ebony', name: 'Эбен', nameRu: 'Эбен', category: 'wood', rarity: 'epic' as LootRarity },
}

const ORE_MATERIALS = {
  ironOre: { id: 'ironOre', name: 'Железная руда', nameRu: 'Железная руда', category: 'ores', rarity: 'common' as LootRarity },
  copperOre: { id: 'copperOre', name: 'Медная руда', nameRu: 'Медная руда', category: 'ores', rarity: 'common' as LootRarity },
  tinOre: { id: 'tinOre', name: 'Оловянная руда', nameRu: 'Оловянная руда', category: 'ores', rarity: 'common' as LootRarity },
  silverOre: { id: 'silverOre', name: 'Серебряная руда', nameRu: 'Серебряная руда', category: 'ores', rarity: 'rare' as LootRarity },
  goldOre: { id: 'goldOre', name: 'Золотая руда', nameRu: 'Золотая руда', category: 'ores', rarity: 'rare' as LootRarity },
  mithrilOre: { id: 'mithrilOre', name: 'Митриловая руда', nameRu: 'Митриловая руда', category: 'ores', rarity: 'epic' as LootRarity },
}

const METAL_MATERIALS = {
  iron: { id: 'iron', name: 'Железо', nameRu: 'Железо', category: 'ingots', rarity: 'common' as LootRarity },
  copper: { id: 'copper', name: 'Медь', nameRu: 'Медь', category: 'ingots', rarity: 'common' as LootRarity },
  tin: { id: 'tin', name: 'Олово', nameRu: 'Олово', category: 'ingots', rarity: 'common' as LootRarity },
  bronze: { id: 'bronze', name: 'Бронза', nameRu: 'Бронза', category: 'ingots', rarity: 'common' as LootRarity },
  steel: { id: 'steel', name: 'Сталь', nameRu: 'Сталь', category: 'ingots', rarity: 'rare' as LootRarity },
  highCarbonSteel: { id: 'highCarbonSteel', name: 'Высокоуглеродистая сталь', nameRu: 'Высокоуглеродистая сталь', category: 'ingots', rarity: 'rare' as LootRarity },
  coldIron: { id: 'coldIron', name: 'Холодное железо', nameRu: 'Холодное железо', category: 'ingots', rarity: 'epic' as LootRarity },
  mithril: { id: 'mithril', name: 'Митрил', nameRu: 'Митрил', category: 'ingots', rarity: 'epic' as LootRarity },
  silverAlloy: { id: 'silverAlloy', name: 'Серебряный сплав', nameRu: 'Серебряный сплав', category: 'ingots', rarity: 'rare' as LootRarity },
}

const STONE_MATERIALS = {
  fieldstone: { id: 'fieldstone', name: 'Полевой камень', nameRu: 'Полевой камень', category: 'stones', rarity: 'common' as LootRarity },
  granite: { id: 'granite', name: 'Гранит', nameRu: 'Гранит', category: 'stones', rarity: 'common' as LootRarity },
  obsidian: { id: 'obsidian', name: 'Обсидиан', nameRu: 'Обсидиан', category: 'stones', rarity: 'rare' as LootRarity },
  bloodstone: { id: 'bloodstone', name: 'Кровавый камень', nameRu: 'Кровавый камень', category: 'stones', rarity: 'epic' as LootRarity },
  flint: { id: 'flint', name: 'Кремень', nameRu: 'Кремень', category: 'stones', rarity: 'common' as LootRarity },
}

const LEATHER_MATERIALS = {
  rawLeather: { id: 'rawLeather', name: 'Сырая кожа', nameRu: 'Сырая кожа', category: 'leather', rarity: 'common' as LootRarity },
  tannedLeather: { id: 'tannedLeather', name: 'Выделанная кожа', nameRu: 'Выделанная кожа', category: 'leather', rarity: 'common' as LootRarity },
  bullLeather: { id: 'bullLeather', name: 'Бычья кожа', nameRu: 'Бычья кожа', category: 'leather', rarity: 'rare' as LootRarity },
  dragonLeather: { id: 'dragonLeather', name: 'Драконья кожа', nameRu: 'Драконья кожа', category: 'leather', rarity: 'legendary' as LootRarity },
}

const ESSENCE_MATERIALS = {
  fireEssence: { id: 'fireEssence', name: 'Эссенция огня', nameRu: 'Эссенция огня', category: 'essence', rarity: 'rare' as LootRarity },
  iceEssence: { id: 'iceEssence', name: 'Эссенция льда', nameRu: 'Эссенция льда', category: 'essence', rarity: 'rare' as LootRarity },
  lightningEssence: { id: 'lightningEssence', name: 'Эссенция молнии', nameRu: 'Эссенция молнии', category: 'essence', rarity: 'epic' as LootRarity },
  voidEssence: { id: 'voidEssence', name: 'Эссенция пустоты', nameRu: 'Эссенция пустоты', category: 'essence', rarity: 'legendary' as LootRarity },
}

// ================================
// ОПРЕДЕЛЕНИЯ РЕСУРСОВ
// ================================

const FOREST_RESOURCES: ResourceLoot[] = [
  { resourceId: 'wood', baseAmount: 10, variance: 5, name: 'Древесина', icon: '🪵' },
  { resourceId: 'gold', baseAmount: 3, variance: 2, name: 'Травы', icon: '🌿' as any },
]

const CAVE_RESOURCES: ResourceLoot[] = [
  { resourceId: 'stone', baseAmount: 15, variance: 5, name: 'Камень', icon: '🪨' },
  { resourceId: 'coal', baseAmount: 5, variance: 3, name: 'Уголь', icon: '⚫' },
]

const RUINS_RESOURCES: ResourceLoot[] = [
  { resourceId: 'gold', baseAmount: 20, variance: 10, name: 'Золото', icon: '💰' },
  { resourceId: 'iron', baseAmount: 5, variance: 3, name: 'Железо', icon: '🔩' },
]

const MOUNTAIN_RESOURCES: ResourceLoot[] = [
  { resourceId: 'goldOre', baseAmount: 8, variance: 4, name: 'Железная руда', icon: '⛏️' as any },
  { resourceId: 'stoneBlocks', baseAmount: 10, variance: 5, name: 'Каменные блоки', icon: '🧱' },
]

const SWAMP_RESOURCES: ResourceLoot[] = [
  { resourceId: 'leather', baseAmount: 3, variance: 2, name: 'Кожа', icon: '🟫' },
  { resourceId: 'gold', baseAmount: 5, variance: 3, name: 'Травы', icon: '🌿' as any },
]

const COAST_RESOURCES: ResourceLoot[] = [
  { resourceId: 'stone', baseAmount: 8, variance: 4, name: 'Камень', icon: '🪨' },
  { resourceId: 'wood', baseAmount: 5, variance: 3, name: 'Древесина', icon: '🪵' },
]

// ================================
// ТАБЛИЦЫ ДРОПА ПО ЛОКАЦИЯМ
// ================================

export const FOREST_LOOT_TABLE: LootTable = {
  location: 'forest',
  maxLootPerEvent: 3,
  multipleLootChance: 25,
  resources: FOREST_RESOURCES,
  materials: [
    { materialId: 'oak', chance: 40, minRarity: 'common', maxRarity: 'common', conditions: {} },
    { materialId: 'birch', chance: 30, minRarity: 'common', maxRarity: 'common', conditions: {} },
    { materialId: 'ash', chance: 25, minRarity: 'common', maxRarity: 'common', conditions: {} },
    { materialId: 'ironwood', chance: 12, minRarity: 'rare', maxRarity: 'rare', conditions: { timeOfDay: 'night' } },
    { materialId: 'ebony', chance: 5, minRarity: 'epic', maxRarity: 'legendary', conditions: { adventurerLevel: { min: 30 } } },
    { materialId: 'fireEssence', chance: 8, minRarity: 'rare', maxRarity: 'epic', conditions: { eventType: ['discovery'] } },
  ],
}

export const CAVE_LOOT_TABLE: LootTable = {
  location: 'cave',
  maxLootPerEvent: 4,
  multipleLootChance: 30,
  resources: CAVE_RESOURCES,
  materials: [
    { materialId: 'granite', chance: 35, minRarity: 'common', maxRarity: 'common', conditions: {} },
    { materialId: 'fieldstone', chance: 30, minRarity: 'common', maxRarity: 'common', conditions: {} },
    { materialId: 'obsidian', chance: 15, minRarity: 'rare', maxRarity: 'rare', conditions: { timeOfDay: 'night' } },
    { materialId: 'bloodstone', chance: 8, minRarity: 'epic', maxRarity: 'epic', conditions: { adventurerLevel: { min: 25 }, eventType: ['treasure'] } },
    { materialId: 'ironOre', chance: 40, minRarity: 'common', maxRarity: 'common', conditions: {} },
    { materialId: 'coal', chance: 30, minRarity: 'common', maxRarity: 'common', conditions: {} },
    { materialId: 'iceEssence', chance: 10, minRarity: 'rare', maxRarity: 'epic', conditions: { timeOfDay: 'night' } },
    { materialId: 'voidEssence', chance: 3, minRarity: 'legendary', maxRarity: 'legendary', conditions: { adventurerLevel: { min: 40 }, eventType: ['treasure'] } },
  ],
}

export const RUINS_LOOT_TABLE: LootTable = {
  location: 'ruins',
  maxLootPerEvent: 4,
  multipleLootChance: 35,
  resources: RUINS_RESOURCES,
  materials: [
    { materialId: 'obsidian', chance: 20, minRarity: 'rare', maxRarity: 'rare', conditions: {} },
    { materialId: 'flint', chance: 25, minRarity: 'common', maxRarity: 'common', conditions: {} },
    { materialId: 'bloodstone', chance: 12, minRarity: 'epic', maxRarity: 'epic', conditions: { adventurerLevel: { min: 20 } } },
    { materialId: 'iron', chance: 30, minRarity: 'common', maxRarity: 'common', conditions: {} },
    { materialId: 'steel', chance: 15, minRarity: 'rare', maxRarity: 'rare', conditions: { adventurerLevel: { min: 15 } } },
    { materialId: 'highCarbonSteel', chance: 10, minRarity: 'rare', maxRarity: 'epic', conditions: { adventurerLevel: { min: 25 }, eventType: ['treasure'] } },
    { materialId: 'coldIron', chance: 5, minRarity: 'epic', maxRarity: 'legendary', conditions: { adventurerLevel: { min: 35 } } },
  ],
}

export const MOUNTAIN_LOOT_TABLE: LootTable = {
  location: 'mountain',
  maxLootPerEvent: 3,
  multipleLootChance: 25,
  resources: MOUNTAIN_RESOURCES,
  materials: [
    { materialId: 'ironOre', chance: 35, minRarity: 'common', maxRarity: 'common', conditions: {} },
    { materialId: 'copperOre', chance: 30, minRarity: 'common', maxRarity: 'common', conditions: {} },
    { materialId: 'tinOre', chance: 25, minRarity: 'common', maxRarity: 'common', conditions: {} },
    { materialId: 'silverOre', chance: 15, minRarity: 'rare', maxRarity: 'rare', conditions: { adventurerLevel: { min: 20 } } },
    { materialId: 'goldOre', chance: 10, minRarity: 'rare', maxRarity: 'rare', conditions: { adventurerLevel: { min: 25 }, eventType: ['treasure'] } },
    { materialId: 'mithrilOre', chance: 5, minRarity: 'epic', maxRarity: 'legendary', conditions: { adventurerLevel: { min: 35 } } },
    { materialId: 'lightningEssence', chance: 8, minRarity: 'rare', maxRarity: 'epic', conditions: { eventType: ['discovery'], weather: ['storm', 'rain'] } },
  ],
}

export const SWAMP_LOOT_TABLE: LootTable = {
  location: 'swamp',
  maxLootPerEvent: 3,
  multipleLootChance: 20,
  resources: SWAMP_RESOURCES,
  materials: [
    { materialId: 'rawLeather', chance: 35, minRarity: 'common', maxRarity: 'common', conditions: {} },
    { materialId: 'tannedLeather', chance: 25, minRarity: 'common', maxRarity: 'common', conditions: {} },
    { materialId: 'bullLeather', chance: 15, minRarity: 'rare', maxRarity: 'rare', conditions: { adventurerLevel: { min: 15 } } },
    { materialId: 'dragonLeather', chance: 5, minRarity: 'legendary', maxRarity: 'legendary', conditions: { adventurerLevel: { min: 40 }, eventType: ['treasure'] } },
    { materialId: 'ash', chance: 20, minRarity: 'common', maxRarity: 'common', conditions: {} },
    { materialId: 'ironwood', chance: 8, minRarity: 'rare', maxRarity: 'rare', conditions: { timeOfDay: 'night' } },
  ],
}

export const COAST_LOOT_TABLE: LootTable = {
  location: 'coast',
  maxLootPerEvent: 3,
  multipleLootChance: 20,
  resources: COAST_RESOURCES,
  materials: [
    { materialId: 'granite', chance: 30, minRarity: 'common', maxRarity: 'common', conditions: {} },
    { materialId: 'flint', chance: 25, minRarity: 'common', maxRarity: 'common', conditions: {} },
    { materialId: 'oak', chance: 20, minRarity: 'common', maxRarity: 'common', conditions: {} },
    { materialId: 'iceEssence', chance: 8, minRarity: 'rare', maxRarity: 'rare', conditions: { weather: ['fog', 'rain'] } },
    { materialId: 'voidEssence', chance: 3, minRarity: 'legendary', maxRarity: 'legendary', conditions: { adventurerLevel: { min: 40 }, timeOfDay: 'night', eventType: ['treasure'] } },
  ],
}

export const ROAD_LOOT_TABLE: LootTable = {
  location: 'road',
  maxLootPerEvent: 2,
  multipleLootChance: 15,
  resources: [
    { resourceId: 'wood', baseAmount: 5, variance: 3, name: 'Древесина', icon: '🪵' },
    { resourceId: 'gold', baseAmount: 10, variance: 5, name: 'Золото', icon: '💰' },
  ],
  materials: [
    { materialId: 'oak', chance: 30, minRarity: 'common', maxRarity: 'common', conditions: {} },
    { materialId: 'iron', chance: 25, minRarity: 'common', maxRarity: 'common', conditions: {} },
    { materialId: 'steel', chance: 10, minRarity: 'rare', maxRarity: 'rare', conditions: { adventurerLevel: { min: 10 } } },
  ],
}

export const VILLAGE_LOOT_TABLE: LootTable = {
  location: 'village',
  maxLootPerEvent: 2,
  multipleLootChance: 15,
  resources: [
    { resourceId: 'gold', baseAmount: 15, variance: 8, name: 'Золото', icon: '💰' },
    { resourceId: 'wood', baseAmount: 8, variance: 4, name: 'Древесина', icon: '🪵' },
  ],
  materials: [
    { materialId: 'oak', chance: 35, minRarity: 'common', maxRarity: 'common', conditions: {} },
    { materialId: 'birch', chance: 25, minRarity: 'common', maxRarity: 'common', conditions: {} },
    { materialId: 'iron', chance: 20, minRarity: 'common', maxRarity: 'common', conditions: {} },
    { materialId: 'steel', chance: 8, minRarity: 'rare', maxRarity: 'rare', conditions: { adventurerLevel: { min: 15 } } },
  ],
}

export const DUNGEON_LOOT_TABLE: LootTable = {
  location: 'dungeon',
  maxLootPerEvent: 4,
  multipleLootChance: 35,
  resources: [
    { resourceId: 'gold', baseAmount: 30, variance: 15, name: 'Золото', icon: '💰' },
    { resourceId: 'goldOre', baseAmount: 10, variance: 5, name: 'Железная руда', icon: '⛏️' as any },
  ],
  materials: [
    { materialId: 'obsidian', chance: 25, minRarity: 'rare', maxRarity: 'rare', conditions: {} },
    { materialId: 'bloodstone', chance: 15, minRarity: 'epic', maxRarity: 'epic', conditions: { adventurerLevel: { min: 25 } } },
    { materialId: 'coldIron', chance: 10, minRarity: 'epic', maxRarity: 'epic', conditions: { adventurerLevel: { min: 30 } } },
    { materialId: 'mithril', chance: 8, minRarity: 'epic', maxRarity: 'legendary', conditions: { adventurerLevel: { min: 35 }, eventType: ['treasure'] } },
    { materialId: 'voidEssence', chance: 5, minRarity: 'legendary', maxRarity: 'legendary', conditions: { adventurerLevel: { min: 45 }, eventType: ['treasure'] } },
  ],
}

export const CASTLE_LOOT_TABLE: LootTable = {
  location: 'castle',
  maxLootPerEvent: 4,
  multipleLootChance: 35,
  resources: [
    { resourceId: 'gold', baseAmount: 40, variance: 20, name: 'Золото', icon: '💰' },
    { resourceId: 'goldOre', baseAmount: 8, variance: 4, name: 'Серебряная руда', icon: '⚪' as any },
  ],
  materials: [
    { materialId: 'steel', chance: 30, minRarity: 'rare', maxRarity: 'rare', conditions: {} },
    { materialId: 'highCarbonSteel', chance: 20, minRarity: 'rare', maxRarity: 'epic', conditions: { adventurerLevel: { min: 20 } } },
    { materialId: 'silverAlloy', chance: 15, minRarity: 'rare', maxRarity: 'epic', conditions: { adventurerLevel: { min: 25 } } },
    { materialId: 'coldIron', chance: 10, minRarity: 'epic', maxRarity: 'legendary', conditions: { adventurerLevel: { min: 35 }, eventType: ['treasure'] } },
    { materialId: 'mithril', chance: 5, minRarity: 'epic', maxRarity: 'legendary', conditions: { adventurerLevel: { min: 40 } } },
  ],
}

export const TEMPLE_LOOT_TABLE: LootTable = {
  location: 'temple',
  maxLootPerEvent: 3,
  multipleLootChance: 30,
  resources: [{ resourceId: 'gold', baseAmount: 25, variance: 12, name: 'Золото', icon: '💰' }],
  materials: [
    { materialId: 'obsidian', chance: 20, minRarity: 'rare', maxRarity: 'rare', conditions: {} },
    { materialId: 'bloodstone', chance: 15, minRarity: 'epic', maxRarity: 'epic', conditions: { adventurerLevel: { min: 20 } } },
    { materialId: 'fireEssence', chance: 12, minRarity: 'rare', maxRarity: 'epic', conditions: { eventType: ['discovery'] } },
    { materialId: 'lightningEssence', chance: 10, minRarity: 'rare', maxRarity: 'epic', conditions: { eventType: ['treasure'], weather: ['storm', 'rain'] } },
    { materialId: 'voidEssence', chance: 5, minRarity: 'legendary', maxRarity: 'legendary', conditions: { adventurerLevel: { min: 45 }, eventType: ['treasure'] } },
  ],
}

export const DESERT_LOOT_TABLE: LootTable = {
  location: 'desert',
  maxLootPerEvent: 2,
  multipleLootChance: 15,
  resources: [
    { resourceId: 'stone', baseAmount: 12, variance: 6, name: 'Камень', icon: '🪨' },
    { resourceId: 'gold', baseAmount: 15, variance: 8, name: 'Золото', icon: '💰' },
  ],
  materials: [
    { materialId: 'granite', chance: 30, minRarity: 'common', maxRarity: 'common', conditions: {} },
    { materialId: 'goldOre', chance: 20, minRarity: 'rare', maxRarity: 'rare', conditions: { adventurerLevel: { min: 20 } } },
    { materialId: 'obsidian', chance: 10, minRarity: 'rare', maxRarity: 'rare', conditions: { weather: ['heat', 'clear'] } },
    { materialId: 'fireEssence', chance: 8, minRarity: 'rare', maxRarity: 'epic', conditions: { weather: ['heat'], eventType: ['discovery'] } },
  ],
}

export const ALL_LOOT_TABLES: Record<LocationTag, LootTable> = {
  forest: FOREST_LOOT_TABLE,
  cave: CAVE_LOOT_TABLE,
  ruins: RUINS_LOOT_TABLE,
  mountain: MOUNTAIN_LOOT_TABLE,
  swamp: SWAMP_LOOT_TABLE,
  village: VILLAGE_LOOT_TABLE,
  road: ROAD_LOOT_TABLE,
  dungeon: DUNGEON_LOOT_TABLE,
  castle: CASTLE_LOOT_TABLE,
  temple: TEMPLE_LOOT_TABLE,
  coast: COAST_LOOT_TABLE,
  desert: DESERT_LOOT_TABLE,
}

export function getLootTable(location: LocationTag): LootTable | undefined {
  return ALL_LOOT_TABLES[location]
}

export function getAvailableMaterialsForLocation(
  location: LocationTag,
  context: any
): MaterialDropChance[] {
  const table = getLootTable(location)
  if (!table || !table.materials) return []

  return table.materials.filter(() => {
    return true
  })
}

export function getAvailableResourcesForLocation(location: LocationTag): ResourceLoot[] {
  const table = getLootTable(location)
  if (!table || !table.resources) return []
  return table.resources
}

export function getMaterialData(id: string): any {
  const allMaterials = {
    ...WOOD_MATERIALS,
    ...ORE_MATERIALS,
    ...METAL_MATERIALS,
    ...STONE_MATERIALS,
    ...LEATHER_MATERIALS,
    ...ESSENCE_MATERIALS,
  }

  return allMaterials[id as keyof typeof allMaterials] || null
}

export {
  FOREST_RESOURCES,
  CAVE_RESOURCES,
  RUINS_RESOURCES,
  MOUNTAIN_RESOURCES,
  SWAMP_RESOURCES,
  COAST_RESOURCES,
  WOOD_MATERIALS,
  ORE_MATERIALS,
  METAL_MATERIALS,
  STONE_MATERIALS,
  LEATHER_MATERIALS,
  ESSENCE_MATERIALS,
}
