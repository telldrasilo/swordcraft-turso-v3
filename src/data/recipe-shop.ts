/**
 * Система покупки и получения рецептов для SwordCraft: Idle Forge
 * 
 * LEGACY-реестр источников рецептов для контуров order/expedition.
 * Покупки у интенданта и UI-токены редкости вынесены в:
 * - src/data/guild/intendant-pricing.ts
 *
 * Важно: файл сохранён для обратной совместимости старых импортов
 * в системах наград, пока они не будут полностью мигрированы.
 */

// ================================
// ТИПЫ
// ================================

export type RecipeSource = 'order' | 'expedition' | 'level'

export interface RecipePrice {
  recipeId: string
  name: string // Русское название
  source: RecipeSource
  gold?: number
  requiredLevel?: number
  requiredFame?: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  description: string
}

// ================================
// ЦЕНЫ НА РЕЦЕПТЫ ОРУЖИЯ
// ================================

export const weaponRecipePrices: RecipePrice[] = [
  {
    recipeId: 'long_sword',
    name: 'Длинный меч (награда гвардии)',
    source: 'order',
    gold: 100,
    requiredLevel: 8,
    requiredFame: 50,
    rarity: 'rare',
    description: 'Тот же чертёж длинного меча — выдаётся за службу гвардии.',
  },
  {
    recipeId: 'battle_axe',
    name: 'Боевой топор (гильдия)',
    source: 'order',
    gold: 150,
    requiredLevel: 8,
    requiredFame: 60,
    rarity: 'rare',
    description: 'Чертёж боевого топора — награда гильдии.',
  },
  {
    recipeId: 'long_sword',
    name: 'Длинный меч (руины)',
    source: 'expedition',
    requiredLevel: 10,
    requiredFame: 100,
    rarity: 'epic',
    description: 'Обрывки эльфийского чертежа длинного меча.',
  },
  {
    recipeId: 'long_sword',
    name: 'Длинный меч (орден охоты)',
    source: 'expedition',
    requiredLevel: 10,
    requiredFame: 80,
    rarity: 'epic',
    description: 'Чертёж для длинного клинка по стандартам ордена.',
  },
  {
    recipeId: 'long_sword',
    name: 'Длинный меч (знать)',
    source: 'order',
    gold: 500,
    requiredLevel: 15,
    requiredFame: 200,
    rarity: 'epic',
    description: 'Придворный заказ на чертёж длинного меча.',
  },
  {
    recipeId: 'long_sword',
    name: 'Длинный меч (elf оружейная)',
    source: 'expedition',
    requiredLevel: 20,
    requiredFame: 500,
    rarity: 'legendary',
    description: 'Полный эльфийский вариант формы длинного меча.',
  },
  {
    recipeId: 'long_sword',
    name: 'Длинный меч (глубины)',
    source: 'expedition',
    requiredLevel: 20,
    requiredFame: 400,
    rarity: 'legendary',
    description: 'Редкий вариант той же формы — находка из глубин.',
  },
]

// ================================
// ЦЕНЫ НА РЕЦЕПТЫ ПЕРЕРАБОТКИ
// ================================

export const refiningRecipePrices: RecipePrice[] = [
  // === СЕРЕБРО (Экспедиция) ===
  {
    recipeId: 'silver_ingot',
    name: 'Серебряный слиток',
    source: 'expedition',
    requiredLevel: 10,
    requiredFame: 100,
    rarity: 'epic',
    description: 'Рецепт очистки серебра. Магические техники.'
  },
  
  // === ЗОЛОТО (Заказ) ===
  {
    recipeId: 'gold_ingot',
    name: 'Золотой слиток',
    source: 'order',
    gold: 300,
    requiredLevel: 15,
    requiredFame: 150,
    rarity: 'epic',
    description: 'Рецепт золотого слитка. Секрет ювелиров.'
  },
  
  // === МИФРИЛ (Экспедиция) ===
  {
    recipeId: 'mithril_ingot',
    name: 'Мифриловый слиток',
    source: 'expedition',
    requiredLevel: 20,
    requiredFame: 500,
    rarity: 'legendary',
    description: 'Рецепт мифрилового слитка. Утерянное знание.'
  },
]

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================

export function getRecipePrice(recipeId: string): RecipePrice | undefined {
  return weaponRecipePrices.find(p => p.recipeId === recipeId) ||
         refiningRecipePrices.find(p => p.recipeId === recipeId)
}

export function getRecipesBySource(source: RecipeSource): RecipePrice[] {
  return [...weaponRecipePrices, ...refiningRecipePrices].filter(p => p.source === source)
}

export function getPurchasableRecipes(): RecipePrice[] {
  return []
}

export function getOrderRecipes(): RecipePrice[] {
  return getRecipesBySource('order')
}

export function getExpeditionRecipes(): RecipePrice[] {
  return getRecipesBySource('expedition')
}

// Источник → иконка
export const sourceIcons = {
  order: '📜',
  expedition: '🗺️',
  level: '⭐'
}

export const sourceNames = {
  order: 'Заказ',
  expedition: 'Экспедиция',
  level: 'Уровень'
}
