/**
 * Order Achievability Utilities
 * Утилиты для проверки достижимости заказов и генерации достижимых заказов
 */

import { generateId, randomInt, randomElement, generateClientName } from './generators'
import { ORDER_MIN_QUALITY, ORDER_MAX_QUALITY, ORDER_BASE_GOLD_REWARD, ORDER_BASE_FAME_REWARD } from './constants'
import { calculateGoldReward, calculateFameReward } from './order-utils'
import { calculateAttack } from './craft-utils'
import { RESOURCE_SELL_PRICES } from './constants'
import { WeaponRecipe, weaponRecipes } from '@/data/weapon-recipes'
import { getCraftingCost } from '@/lib/craft/inventory-check'
import type { NPCOrder } from './order-utils'
import type { UnlockedRecipes } from '@/store/slices/craft-slice'

// ================================
// ТИПЫ
// ================================

export interface MaterialAdvance {
  materials: { resource: string; amount: number }[]
  totalCost: number
}

export interface OrderGenerationContext {
  playerLevel: number
  playerFame: number
  playerResources: Record<string, number>
  unlockedRecipes: UnlockedRecipes
  existingClients: string[]
}

export interface OrderCategory {
  type: 'basic' | 'progressive' | 'ambitious'
  weight: number
}

// ================================
// КОНСТАНТЫ
// ================================

const ORDER_CATEGORIES: OrderCategory[] = [
  { type: 'basic', weight: 60 },
  { type: 'progressive', weight: 30 },
  { type: 'ambitious', weight: 10 },
]

// ================================
// ПРОВЕРКА ДОСТИЖИМОСТИ ЗАКАЗА
// ================================

/**
 * Проверить, может ли игрок выполнить заказ
 */
export function checkOrderAchievability(
  order: NPCOrder,
  context: OrderGenerationContext
): { achievable: boolean; reason?: string } {
  // Проверка уровня и славы
  if (order.requiredLevel > context.playerLevel) {
    return { achievable: false, reason: 'Требуется более высокий уровень' }
  }
  if (order.requiredFame > context.playerFame) {
    return { achievable: false, reason: 'Требуется больше славы' }
  }

  // Найти подходящий рецепт
  const matchingRecipe = weaponRecipes.find(
    r => r.type === order.weaponType && r.material === order.material
  )

  if (!matchingRecipe) {
    return { achievable: false, reason: 'Нет подходящего рецепта' }
  }

  // Проверка, разблокирован ли рецепт
  const isRecipeUnlocked = context.unlockedRecipes.weaponRecipes.includes(matchingRecipe.id)
  if (!isRecipeUnlocked) {
    return { achievable: false, reason: 'Рецепт не разблокирован' }
  }

  // Проверка уровня для рецепта
  if (matchingRecipe.requiredLevel > context.playerLevel) {
    return { achievable: false, reason: 'Требуемый уровень для рецепта' }
  }

  // Проверка, может ли игрок создать такое качество
  const minPossibleQuality = calculateMinAchievableQuality(context.playerLevel)
  if (order.minQuality > minPossibleQuality * 1.3) {
    return { achievable: false, reason: 'Требуемое качество слишком высокое' }
  }

  // Проверка, может ли игрок создать такую атаку
  const maxPossibleAttack = calculateMaxAchievableAttack(
    matchingRecipe,
    context.playerLevel
  )
  if (order.minAttack && order.minAttack > maxPossibleAttack) {
    return { achievable: false, reason: 'Требуемая атака слишком высокая' }
  }

  return { achievable: true }
}

/**
 * Проверить, может ли игрок позволить материалы для рецепта
 */
export function checkCanAffordRecipeMaterials(
  recipe: WeaponRecipe,
  playerResources: Record<string, number>
): boolean {
  if (!recipe.cost) return true

  for (const [resource, amount] of Object.entries(recipe.cost)) {
    if (amount && (playerResources[resource] || 0) < amount) {
      return false
    }
  }

  return true
}

/**
 * Рассчитать стоимость материалов для выполнения заказа
 */
export function calculateMaterialCostForOrder(
  recipe: WeaponRecipe
): { materials: { resource: string; amount: number }[]; totalCost: number } {
  if (!recipe.cost) {
    return { materials: [], totalCost: 0 }
  }

  const materials: { resource: string; amount: number }[] = []
  let totalCost = 0

  for (const [resource, amount] of Object.entries(recipe.cost)) {
    if (amount > 0) {
      materials.push({ resource, amount })
      // Рассчитываем стоимость на основе цен продажи ресурсов
      const resourcePrice = RESOURCE_SELL_PRICES[resource as keyof typeof RESOURCE_SELL_PRICES] || 1
      totalCost += resourcePrice * amount
    }
  }

  return { materials, totalCost }
}

/**
 * Создать аванс материалов для заказа
 */
export function generateMaterialAdvance(
  recipe: WeaponRecipe,
  originalReward: number
): MaterialAdvance | null {
  const { materials, totalCost } = calculateMaterialCostForOrder(recipe)

  if (totalCost === 0) {
    return null
  }

  return {
    materials,
    totalCost: Math.min(totalCost, originalReward * 0.5), // Максимум 50% от награды
  }
}

// ================================
// РАСЧЁТ ВОЗМОЖНОСТЕЙ ИГРОКА
// ================================

/**
 * Рассчитать минимальное качество, которое игрок может создать
 */
export function calculateMinAchievableQuality(playerLevel: number): number {
  // Базовое качество на основе уровня (10-20 на уровне 1, до 60-70 на уровне 20)
  const baseQuality = 10 + playerLevel * 3
  // Добавляем небольшой запас (+20%)
  return Math.floor(baseQuality * 1.2)
}

/**
 * Рассчитать максимальную атаку, которую может создать игрок для рецепта
 */
export function calculateMaxAchievableAttack(
  recipe: WeaponRecipe,
  playerLevel: number
): number {
  // Используем максимальное качество, которое может создать игрок
  const maxQuality = Math.min(ORDER_MAX_QUALITY, 50 + playerLevel * 2)

  // Рассчитываем атаку с этим качеством
  return calculateAttack(
    recipe.type,
    recipe.tier,
    recipe.material,
    maxQuality
  )
}

/**
 * Фильтровать рецепты по прогрессивной сложности
 */
export function filterRecipesByProgression(
  category: 'basic' | 'progressive' | 'ambitious',
  context: OrderGenerationContext
): WeaponRecipe[] {
  return weaponRecipes.filter(recipe => {
    switch (category) {
      case 'basic':
        // Точно может сделать сейчас (рецепт разблокирован и уровень достаточен)
        return (
          context.unlockedRecipes.weaponRecipes.includes(recipe.id) &&
          recipe.requiredLevel <= context.playerLevel
        )

      case 'progressive':
        // Через 1-2 уровня реально (рецепт может быть ещё не разблокирован, но уровень почти достигнут)
        return (
          !context.unlockedRecipes.weaponRecipes.includes(recipe.id) &&
          recipe.requiredLevel <= context.playerLevel + 2 &&
          recipe.requiredLevel >= context.playerLevel
        )

      case 'ambitious':
        // Любые рецепты для мотивации
        return true

      default:
        return false
    }
  })
}

// ================================
// ГЕНЕРАЦИЯ ДОСТИЖИМЫХ ЗАКАЗОВ
// ================================

/**
 * Сгенерировать достижимый заказ
 */
export function generateAchievableOrder(context: OrderGenerationContext): NPCOrder | null {
  // Выбираем категорию заказа
  const category = selectOrderCategory()

  // Фильтруем рецепты по категории
  const availableRecipes = filterRecipesByProgression(category.type, context)

  console.log('[Order Generation] Category:', category.type, 'Available recipes:', availableRecipes.length, 'Unlocked recipes:', context.unlockedRecipes.weaponRecipes)

  if (availableRecipes.length === 0) {
    // Если нет рецептов в выбранной категории, пробуем базовую
    const basicRecipes = filterRecipesByProgression('basic', context)
    console.log('[Order Generation] Trying basic recipes:', basicRecipes.length)
    if (basicRecipes.length === 0) {
      console.warn('[Order Generation] No suitable recipes found')
      return null
    }
    return generateOrderFromRecipe(basicRecipes[Math.floor(Math.random() * basicRecipes.length)], context)
  }

  // Выбираем случайный рецепт
  const recipe = randomElement(availableRecipes)
  console.log('[Order Generation] Selected recipe:', recipe.id)

  return generateOrderFromRecipe(recipe, context)
}

/**
 * Выбрать категорию заказа на основе весов
 */
function selectOrderCategory(): OrderCategory {
  const totalWeight = ORDER_CATEGORIES.reduce((sum, cat) => sum + cat.weight, 0)
  let random = Math.random() * totalWeight

  for (const category of ORDER_CATEGORIES) {
    random -= category.weight
    if (random <= 0) {
      return category
    }
  }

  return ORDER_CATEGORIES[0]
}

/**
 * Сгенерировать заказ из рецепта
 */
function generateOrderFromRecipe(
  recipe: WeaponRecipe,
  context: OrderGenerationContext
): NPCOrder {
  // Генерируем клиента
  const client = generateClientName()

  // Проверка на дубликат клиента
  if (context.existingClients.includes(client.name)) {
    // Если дубликат, добавляем номер
    const existingCount = context.existingClients.filter(n => n.includes(client.name)).length
    client.name = `${client.name} ${existingCount + 1}`
  }

  // Рассчитываем достижимое качество для заказа
  const minQuality = calculateOrderQuality(recipe, context.playerLevel)

  // Рассчитываем возможную атаку для заказа
  const maxPossibleAttack = calculateMaxAchievableAttack(recipe, context.playerLevel)
  const minAttack = minQuality > 70 ? randomInt(10, Math.min(maxPossibleAttack, 20 + context.playerLevel)) : undefined

  // Рассчитываем точную стоимость материалов для хранения в заказе
  const materialCostMap = getCraftingCost(recipe, {})
  const resourcePrices: Record<string, number> = {
    iron: 2, wood: 1, stone: 1, coal: 1,
    ironIngot: 5, steelIngot: 12, bronzeIngot: 8,
    copper: 3, tin: 3, silver: 10, mithril: 25,
    leather: 3, planks: 2
  }
  const materialCost = Object.entries(materialCostMap).reduce((total, [resource, amount]) => {
    const price = resourcePrices[resource] || 1
    return total + (amount || 0) * price
  }, 0)

  // Награды (передаем recipe для точного расчета стоимости материалов)
  let goldReward = calculateGoldReward(minQuality, recipe.type, recipe.material, context.playerLevel, recipe)
  let fameReward = calculateFameReward(minQuality, context.playerFame)

  // Проверяем, может ли игрок позволить материалы
  const canAffordMaterials = checkCanAffordRecipeMaterials(recipe, context.playerResources)

  // Аванс материалов
  let materialAdvance: MaterialAdvance | undefined

  if (!canAffordMaterials) {
    materialAdvance = generateMaterialAdvance(recipe, goldReward)
    // НЕ уменьшаем награду здесь - это будет сделано при выполнении заказа
    // на основе фактического качества оружия
  }

  // Требования для появления
  const requiredLevel = Math.max(1, context.playerLevel - 2)
  const requiredFame = Math.max(0, context.playerFame - 50)

  const order: NPCOrder = {
    id: generateId(),
    clientName: client.name,
    clientTitle: client.title,
    clientIcon: client.icon,
    weaponType: recipe.type,
    material: recipe.material,
    minQuality,
    minAttack,
    goldReward,
    fameReward,
    materialCost, // Точная стоимость материалов для отображения диапазона
    status: 'available',
    requiredLevel,
    requiredFame,
  }

  return order
}

/**
 * Рассчитать качество для заказа
 */
function calculateOrderQuality(recipe: WeaponRecipe, playerLevel: number): number {
  const minPossible = calculateMinAchievableQuality(playerLevel)
  const maxPossible = Math.min(ORDER_MAX_QUALITY, 50 + playerLevel * 2)

  // Для базовых заказов - ближе к минимуму
  // Для прогрессивных - выше
  const variance = Math.random() * 0.4 + 0.1 // 10-50% диапазон

  const quality = Math.floor(
    minPossible + (maxPossible - minPossible) * variance
  )

  return Math.max(ORDER_MIN_QUALITY, Math.min(ORDER_MAX_QUALITY, quality))
}
