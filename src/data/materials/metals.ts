/**
 * Металлы и сплавы
 *
 * **Roadmap 5.2:** числовой контур `metalMaterials` постепенно смыкается с каталогом `MaterialNode`;
 * контракт id ⊆ реестр — [`metals-catalog-alignment.test.ts`](./metals-catalog-alignment.test.ts).
 *
 * Сбалансированная система материалов v2
 * 
 * Принцип баланса: У каждого материала есть плюсы И минусы.
 * Нет "лучшего" материала — есть подходящий для ситуации.
 */

import type { Material } from '@/types/craft-v2'

/** Fallback для `iron` и `iron_alloy` до [`getMetalMaterialsRuntimeMerged`](./metals-runtime-merge.ts). */
const IRON_FAMILY_LEGACY_BASE = {
  adjective: 'Железный',
  category: 'metal',
  properties: {
    hardness: 50,
    flexibility: 45,
    weight: 5,
    conductivity: 15,
  },
  crafting: {
    workability: 70,
    meltingPoint: 1200,
    requiredHeat: 1,
  },
  weaponEffects: {
    attackBonus: 0,
    durabilityBonus: 10,
    soulCapacity: 50,
    repairPotential: 1.3,
    enchantPower: 0.9,
    enchantSlots: 0,
  },
  craftTimeModifier: 0.85,
  craftRisk: 0,
  dominantProperty: {
    type: 'durability',
    value: 55,
  },
  source: {
    rarity: 'common',
  },
  icon: '/icons/resources/iron.png',
} as const satisfies Omit<Material, 'id' | 'name' | 'description'>

/** Fallback для `mithril` и `mithril_alloy` до [`getMetalMaterialsRuntimeMerged`](./metals-runtime-merge.ts). */
const MITHRIL_FAMILY_LEGACY_BASE = {
  adjective: 'Мифриловый',
  category: 'metal',
  properties: {
    hardness: 88,
    flexibility: 75,
    weight: 2.5,
    conductivity: 90,
  },
  crafting: {
    workability: 25,
    meltingPoint: 2500,
    requiredHeat: 4,
  },
  weaponEffects: {
    attackBonus: 22,
    durabilityBonus: 25,
    soulCapacity: 200,
    repairPotential: 1.5,
    enchantPower: 1.8,
    enchantSlots: 3,
  },
  craftTimeModifier: 1.6,
  craftRisk: 15,
  dominantProperty: {
    type: 'balance',
    value: 90,
  },
  source: {
    rarity: 'legendary',
    unlockCondition: 'Найти в эльфийских руинах',
  },
  icon: '/icons/resources/mithrilIngot.png',
} as const satisfies Omit<Material, 'id' | 'name' | 'description'>

export const metalMaterials: Material[] = [
  // ============================================
  // БАЗОВЫЕ МЕТАЛЛЫ (сырьё)
  // ============================================

  {
    id: 'iron',
    name: 'Железо',
    description:
      'Надёжный металл для начинающего кузнеца. Мягкий, легко обрабатывается, не ломается.',
    ...IRON_FAMILY_LEGACY_BASE,
  },

  {
    id: 'iron_alloy',
    name: 'Железный слиток',
    description:
      'Готовая к ковке заготовка после плавки. Основа простого оружия и то же имя в префиксе, что у классического железа.',
    ...IRON_FAMILY_LEGACY_BASE,
  },

  {
    id: 'copper_alloy',
    name: 'Медный слиток',
    adjective: 'Медный',
    category: 'metal',
    description: 'Слиток меди после плавки.',
    properties: { hardness: 40, flexibility: 35, weight: 8.9, conductivity: 35 },
    crafting: { workability: 80, meltingPoint: 1085, requiredHeat: 1 },
    weaponEffects: {
      attackBonus: -2,
      durabilityBonus: 8,
      soulCapacity: 40,
      repairPotential: 1.2,
      enchantPower: 0.85,
      enchantSlots: 0,
    },
    craftTimeModifier: 0.9,
    craftRisk: 2,
    dominantProperty: { type: 'durability', value: 48 },
    source: { rarity: 'common' },
    icon: '/icons/resources/copperIngot.png',
  },

  {
    id: 'tin_alloy',
    name: 'Оловянный слиток',
    adjective: 'Оловянный',
    category: 'metal',
    description: 'Слиток олова после плавки.',
    properties: { hardness: 35, flexibility: 40, weight: 7.3, conductivity: 25 },
    crafting: { workability: 90, meltingPoint: 232, requiredHeat: 1 },
    weaponEffects: {
      attackBonus: -4,
      durabilityBonus: 5,
      soulCapacity: 35,
      repairPotential: 1.1,
      enchantPower: 0.8,
      enchantSlots: 0,
    },
    craftTimeModifier: 0.88,
    craftRisk: 1,
    dominantProperty: { type: 'balance', value: 42 },
    source: { rarity: 'common' },
    icon: '/icons/resources/tinIngot.png',
  },

  {
    id: 'bronze',
    name: 'Бронза',
    adjective: 'Бронзовый',
    category: 'alloy',
    description: 'Сплав меди и олова.',
    properties: { hardness: 58, flexibility: 38, weight: 8.8, conductivity: 30 },
    crafting: { workability: 65, meltingPoint: 950, requiredHeat: 1 },
    weaponEffects: {
      attackBonus: 4,
      durabilityBonus: 12,
      soulCapacity: 45,
      repairPotential: 1.0,
      enchantPower: 0.9,
      enchantSlots: 0,
    },
    craftTimeModifier: 1.0,
    craftRisk: 3,
    dominantProperty: { type: 'durability', value: 58 },
    source: { rarity: 'uncommon' },
    icon: '/icons/resources/bronzeIngot.png',
  },

  {
    id: 'gold_alloy',
    name: 'Золотой слиток',
    adjective: 'Золотой',
    category: 'metal',
    description: 'Слиток золота после плавки.',
    properties: { hardness: 25, flexibility: 30, weight: 19.3, conductivity: 70 },
    crafting: { workability: 85, meltingPoint: 1064, requiredHeat: 2 },
    weaponEffects: {
      attackBonus: 2,
      durabilityBonus: 5,
      soulCapacity: 120,
      repairPotential: 1.4,
      enchantPower: 1.4,
      enchantSlots: 1,
    },
    craftTimeModifier: 1.15,
    craftRisk: 4,
    dominantProperty: { type: 'conductivity', value: 75 },
    source: { rarity: 'rare' },
    icon: '/icons/resources/goldIngot.png',
  },
  
  // ============================================
  // СПЛАВЫ (создаются из сырья)
  // ============================================
  
  {
    id: 'steel',
    name: 'Сталь',
    adjective: 'Стальной',
    category: 'alloy',
    description: 'Сплав железа с углеродом. Твёрже железа, но требует мастерства и времени.',
    
    properties: {
      hardness: 72,
      flexibility: 30,  // Низкая — может треснуть при ударе
      weight: 4.6,
      conductivity: 20,
    },
    
    crafting: {
      workability: 45,  // Требует мастерства
      meltingPoint: 1400,
      requiredHeat: 2,
    },
    
    weaponEffects: {
      attackBonus: 12,  // +12% урона
      durabilityBonus: 0,
      soulCapacity: 75,
      repairPotential: 0.85,  // Сложнее чинить
      enchantPower: 1.0,
      enchantSlots: 1,
    },
    
    // БАЛАНС
    craftTimeModifier: 1.2,  // +20% времени
    craftRisk: 5,            // 5% риск трещины
    
    dominantProperty: {
      type: 'sharpness',
      value: 72,
    },
    
    source: {
      rarity: 'uncommon',
      unlockCondition: 'Уровень кузнеца 3',
    },
    
    // Рецепт создания
    recipe: {
      inputs: [
        { resourceId: 'iron_ore', quantity: 2, name: 'Железная руда' },
      ],
      fuel: { resourceId: 'coal', quantity: 2 },
      requiredLevel: 3,
    },
    
    icon: '/icons/resources/steelIngot.png',
  },
  
  {
    id: 'high_carbon_steel',
    name: 'Высокоуглеродистая сталь',
    adjective: 'Углеродистый',
    category: 'alloy',
    description: 'Сталь с высоким содержанием углерода. Очень острая, но хрупкая — требует осторожности.',
    
    properties: {
      hardness: 85,
      flexibility: 20,  // Низкая — хрупкая
      weight: 4.7,
      conductivity: 18,
    },
    
    crafting: {
      workability: 35,  // Сложно работать
      meltingPoint: 1450,
      requiredHeat: 2,
    },
    
    weaponEffects: {
      attackBonus: 20,  // +20% урона — очень острая
      durabilityBonus: -5,  // -5% — хрупкая
      soulCapacity: 60,
      repairPotential: 0.6,  // Сложно чинить
      enchantPower: 0.9,
      enchantSlots: 0,
    },
    
    // БАЛАНС
    craftTimeModifier: 1.35,  // +35% времени
    craftRisk: 12,            // 12% риск
    
    dominantProperty: {
      type: 'sharpness',
      value: 85,
    },
    
    source: {
      rarity: 'rare',
      unlockCondition: 'Уровень кузнеца 8',
    },
    
    recipe: {
      inputs: [
        { resourceId: 'iron_ore', quantity: 2, name: 'Железная руда' },
        { resourceId: 'coal', quantity: 3, name: 'Уголь' },
      ],
      requiredLevel: 8,
    },
    
    icon: '/icons/resources/steelIngot.png',
  },
  
  {
    id: 'silver_alloy',
    name: 'Серебряный сплав',
    adjective: 'Серебряный',
    category: 'alloy',
    description: 'Сплав с серебром для борьбы с нечистью. Высокая проводимость, но мягче стали.',
    
    properties: {
      hardness: 48,
      flexibility: 50,
      weight: 5.8,
      conductivity: 70,  // Высокая!
    },
    
    crafting: {
      workability: 55,
      meltingPoint: 1000,
      requiredHeat: 1,
    },
    
    weaponEffects: {
      attackBonus: 5,
      durabilityBonus: 0,
      soulCapacity: 120,  // Высокая вместимость души
      repairPotential: 1.0,
      enchantPower: 1.5,  // +50% к зачарованиям
      enchantSlots: 2,
    },
    
    // БАЛАНС
    craftTimeModifier: 1.1,   // +10% времени
    craftRisk: 3,
    
    dominantProperty: {
      type: 'conductivity',
      value: 70,
    },
    
    source: {
      rarity: 'rare',
      unlockCondition: 'Уровень кузнеца 6',
    },
    
    recipe: {
      inputs: [
        { resourceId: 'iron_ore', quantity: 1, name: 'Железная руда' },
        { resourceId: 'silver_ore', quantity: 2, name: 'Серебряная руда' },
      ],
      fuel: { resourceId: 'coal', quantity: 1 },
      requiredLevel: 6,
    },
    
    icon: '/icons/resources/silverIngot.png',
  },
  
  {
    id: 'cold_iron',
    name: 'Холодное железо',
    adjective: 'Холодный',
    category: 'metal',
    description: 'Особое железо, эффективное против магических существ. Сложно обрабатывать.',
    
    properties: {
      hardness: 65,
      flexibility: 35,
      weight: 5.2,
      conductivity: 5,  // Почти не проводит магию
    },
    
    crafting: {
      workability: 40,
      meltingPoint: 1350,
      requiredHeat: 2,
    },
    
    weaponEffects: {
      attackBonus: 8,
      durabilityBonus: 15,
      soulCapacity: 30,  // Низкая
      repairPotential: 1.1,
      enchantPower: 0.5,  // Плохо для зачарований
      enchantSlots: 0,
    },
    
    // БАЛАНС
    craftTimeModifier: 1.25,  // +25% времени
    craftRisk: 8,
    
    dominantProperty: {
      type: 'durability',
      value: 65,
    },
    
    source: {
      rarity: 'uncommon',
      unlockCondition: 'Уровень кузнеца 5',
    },
    
    icon: '/icons/resources/iron.png',
  },
  
  // ============================================
  // ЛЕГЕНДАРНЫЕ МАТЕРИАЛЫ
  // ============================================
  
  {
    id: 'mithril',
    name: 'Мифрил',
    description:
      'Легендарный эльфийский металл. Лёгкий, прочный, идеально сбалансированный.',
    ...MITHRIL_FAMILY_LEGACY_BASE,
  },

  {
    id: 'mithril_alloy',
    name: 'Мифриловый слиток',
    description:
      'Выплавленный мифрил — лёгкий слиток легендарного металла для высшего оружия.',
    ...MITHRIL_FAMILY_LEGACY_BASE,
  },
]
