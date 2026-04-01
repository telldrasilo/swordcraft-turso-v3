/**
 * Order Utilities
 * Чистые функции для логики заказов (NPC заказы)
 * 
 * НОВАЯ ФОРМУЛА НАГРАД:
 * Награда = (Стоимость материалов × 2.0 + Крафт-бонус) × (1 + Качество/100) × (1 + Уровень×0.05)
 * Где Крафт-бонус = 20-40 золота в зависимости от сложности
 * 
 * Пример: Железный кинжал (23 золота материалы)
 * = (23 × 2.0 + 25) × 1.4 × 1.05 = 46 + 25 = 71 × 1.47 = 104 → Округляем до 45-55 для баланса
 * 
 * Упрощенная формула для баланса:
 * Награда = Материалы × 2.0 + Базовый бонус (15-30) + Качество × 0.5
 * Минимум 30, максимум 200
 */

import { generateId, generateClientName, randomInt, randomElement } from './generators'
import { ORDER_MIN_QUALITY, ORDER_MAX_QUALITY, ORDER_BASE_FAME_REWARD } from './constants'
import type { OrderCompletionParams, OrderCompletionResult } from './types'
import type { RecipeForCraftingCost } from '@/lib/craft/inventory-check'
import { getCraftingCost } from '@/lib/craft/inventory-check'
import type { NPCOrder, MaterialAdvance } from '@/types/npc-order'

// ================================
// ТИПЫ
// ================================

export type { NPCOrder, MaterialAdvance }

export interface OrderGenerationParams {
  playerLevel: number
  playerFame: number
  existingClients: string[]
}

export interface OrderGenerationResult {
  order: NPCOrder | null
  reason?: string
}

// ================================
// КОНСТАНТЫ
// ================================

const WEAPON_TYPES = ['sword', 'dagger', 'axe', 'mace', 'spear', 'hammer']
const MATERIALS = ['iron', 'bronze', 'steel', 'silver', 'gold', 'mithril']

const BONUS_ITEMS: { resource: string; minAmount: number; maxAmount: number }[] = [
  { resource: 'iron', minAmount: 5, maxAmount: 20 },
  { resource: 'coal', minAmount: 3, maxAmount: 15 },
  { resource: 'wood', minAmount: 10, maxAmount: 30 },
  { resource: 'stone', minAmount: 5, maxAmount: 20 },
]

// ================================
// ГЕНЕРАЦИЯ ЗАКАЗОВ
// ================================

/**
 * Рассчитать награду золотом на основе стоимости материалов
 * 
 * Новая формула:
 * 1. Получаем стоимость материалов для крафта
 * 2. Базовая награда = Стоимость материалов × 2.0 (100% markup за работу)
 * 3. Добавляем бонус за качество (minQuality × 0.3)
 * 4. Добавляем бонус за уровень (playerLevel × 2)
 * 5. Округляем до целого числа
 * 
 * Диапазон: 30-200 золота
 */
export function calculateGoldReward(
  minQuality: number,
  weaponType: string,
  material: string | undefined,
  playerLevel: number,
  recipeOrCost?: RecipeForCraftingCost | number  // Рецепт или готовая стоимость материалов
): number {
  // Определяем стоимость материалов
  let materialCost = 0
  
  if (typeof recipeOrCost === 'number') {
    // Передана готовая стоимость материалов
    materialCost = recipeOrCost
  } else if (recipeOrCost) {
    // Передан рецепт — считаем точную стоимость материалов
    const materialCostMap = getCraftingCost(recipeOrCost, {})
    
    // Переводим ресурсы в золото (примерные цены)
    const resourcePrices: Record<string, number> = {
      iron: 2, wood: 1, stone: 1, coal: 1,
      ironIngot: 5, steelIngot: 12, bronzeIngot: 8,
      copper: 3, tin: 3, silver: 10, mithril: 25,
      leather: 3, planks: 2
    }
    
    materialCost = Object.entries(materialCostMap).reduce((total, [resource, amount]) => {
      const price = resourcePrices[resource] || 1
      return total + (amount || 0) * price
    }, 0)
  } else {
    // Приблизительная стоимость если нет данных
    const materialCosts: Record<string, number> = {
      iron: 15, bronze: 25, steel: 35, silver: 50, gold: 80, mithril: 120
    }
    materialCost = materialCosts[material || 'iron'] || 15
  }
  
  // Базовая награда: материалы × 2.0 (возмещение + оплата работы)
  let reward = materialCost * 2.0
  
  // Бонус за качество (0.3 золота за каждое очко качества)
  const qualityBonus = minQuality * 0.3
  reward += qualityBonus
  
  // Бонус за уровень игрока (2 золота за уровень)
  const levelBonus = playerLevel * 2
  reward += levelBonus
  
  // Бонус за тип оружия (сложность крафта)
  const typeBonus: Record<string, number> = {
    sword: 10, dagger: 5, axe: 8, mace: 8, spear: 8, hammer: 12
  }
  reward += typeBonus[weaponType] || 8
  
  // Округляем до целого
  reward = Math.floor(reward)
  
  // Ограничиваем диапазон
  return Math.max(30, Math.min(200, reward))
}

/**
 * Рассчитать диапазон награды золотом (минимум и максимум)
 * 
 * Минимум: за минимальное требуемое качество
 * Максимум: за качество 100 (или максимально возможное)
 * 
 * Используется для отображения в UI заказов
 */
export function calculateGoldRewardRange(
  minQuality: number,
  weaponType: string,
  material: string | undefined,
  playerLevel: number,
  recipeOrCost?: RecipeForCraftingCost | number // Можно передать рецепт или готовую стоимость материалов
): { min: number; max: number; current: (quality: number) => number } {
  // Рассчитываем награду за минимальное качество
  const minReward = calculateGoldReward(minQuality, weaponType, material, playerLevel, recipeOrCost)
  
  // Рассчитываем награду за максимальное качество (100)
  const maxReward = calculateGoldReward(100, weaponType, material, playerLevel, recipeOrCost)
  
  // Функция для расчета награды за конкретное качество
  const getRewardForQuality = (quality: number): number => {
    // Награда растет линейно от minQuality до 100
    if (quality <= minQuality) return minReward
    if (quality >= 100) return maxReward
    
    // Линейная интерполяция
    const progress = (quality - minQuality) / (100 - minQuality)
    return Math.floor(minReward + (maxReward - minReward) * progress)
  }
  
  return { min: minReward, max: maxReward, current: getRewardForQuality }
}

/**
 * Рассчитать награду славой
 */
export function calculateFameReward(
  minQuality: number,
  _playerFame: number
): number {
  const baseFame = ORDER_BASE_FAME_REWARD
  const qualityBonus = Math.floor(minQuality / 20)
  return baseFame + qualityBonus
}

/**
 * Сгенерировать бонусные предметы
 */
export function generateBonusItems(): { resource: string; amount: number }[] | undefined {
  // 30% шанс бонусных предметов
  if (Math.random() > 0.3) return undefined

  const numItems = randomInt(1, 2)
  const items: { resource: string; amount: number }[] = []

  for (let i = 0; i < numItems; i++) {
    const bonus = randomElement(BONUS_ITEMS)
    items.push({
      resource: bonus.resource,
      amount: randomInt(bonus.minAmount, bonus.maxAmount),
    })
  }

  return items.length > 0 ? items : undefined
}

/**
 * Сгенерировать новый заказ
 */
export function generateOrder(params: OrderGenerationParams): OrderGenerationResult {
  const { playerLevel, playerFame, existingClients } = params

  // Минимальный уровень для заказов
  if (playerLevel < 2) {
    return { order: null, reason: 'Требуется уровень 2' }
  }

  // Генерация клиента
  const client = generateClientName()

  // Проверка на дубликат клиента
  if (existingClients.includes(client.name)) {
    return { order: null, reason: 'Клиент уже заказывает' }
  }

  // Определение типа оружия
  const weaponType = randomElement(WEAPON_TYPES)

  // Определение материала (50% шанс указать)
  const material = Math.random() > 0.5 ? randomElement(MATERIALS) : undefined

  // Определение минимального качества
  const minQuality = randomInt(
    Math.max(ORDER_MIN_QUALITY, playerLevel * 2),
    Math.min(ORDER_MAX_QUALITY, 50 + playerLevel * 2)
  )

  // Минимальная атака (только для высоких требований качества)
  const minAttack = minQuality > 70 ? randomInt(10, 20 + playerLevel) : undefined

  // Награды
  const goldReward = calculateGoldReward(minQuality, weaponType, material, playerLevel)
  const fameReward = calculateFameReward(minQuality, playerFame)
  const bonusItems = generateBonusItems()

  const order: NPCOrder = {
    id: generateId(),
    clientName: client.name,
    clientTitle: client.title,
    clientIcon: client.icon,
    weaponType,
    material,
    minQuality,
    minAttack,
    goldReward,
    fameReward,
    bonusItems,
    status: 'available',
    requiredLevel: Math.max(1, playerLevel - 2),
    requiredFame: Math.max(0, playerFame - 50),
  }

  return { order }
}

// ================================
// ПРИНЯТИЕ ЗАКАЗА
// ================================

/**
 * Проверить возможность принятия заказа
 */
export function canAcceptOrder(params: {
  orderStatus: string
  hasActiveOrder: boolean
  playerLevel: number
  playerFame: number
  requiredLevel: number
  requiredFame: number
}): { can: boolean; reason: string } {
  if (params.orderStatus !== 'available') {
    return { can: false, reason: 'Заказ недоступен' }
  }

  if (params.hasActiveOrder) {
    return { can: false, reason: 'У вас уже есть активный заказ' }
  }

  if (params.playerLevel < params.requiredLevel) {
    return { can: false, reason: `Требуется уровень ${params.requiredLevel}` }
  }

  if (params.playerFame < params.requiredFame) {
    return { can: false, reason: `Требуется слава ${params.requiredFame}` }
  }

  return { can: true, reason: '' }
}

// ================================
// ВЫПОЛНЕНИЕ ЗАКАЗА
// ================================

/**
 * Проверить соответствие оружия требованиям заказа
 */
export function checkWeaponMatchesOrder(params: {
  weaponQuality: number
  weaponAttack: number
  weaponType: string
  weaponMaterial: string
  orderMinQuality: number
  orderMinAttack?: number
  orderWeaponType: string
  orderMaterial?: string
}): { matches: boolean; reason: string } {
  if (params.weaponType !== params.orderWeaponType) {
    return { matches: false, reason: 'Неподходящий тип оружия' }
  }

  if (params.weaponQuality < params.orderMinQuality) {
    return { matches: false, reason: `Качество должно быть не менее ${params.orderMinQuality}` }
  }

  if (params.orderMinAttack && params.weaponAttack < params.orderMinAttack) {
    return { matches: false, reason: `Атака должна быть не менее ${params.orderMinAttack}` }
  }

  if (params.orderMaterial && params.weaponMaterial !== params.orderMaterial) {
    return { matches: false, reason: `Требуется материал: ${params.orderMaterial}` }
  }

  return { matches: true, reason: '' }
}

/**
 * Выполнить заказ
 */
export function completeOrder(params: OrderCompletionParams): OrderCompletionResult {
  const check = checkWeaponMatchesOrder({
    weaponQuality: params.weaponQuality,
    weaponAttack: params.weaponAttack,
    weaponType: params.weaponType,
    weaponMaterial: params.weaponRecipeId.split('_')[0] || 'iron',
    orderMinQuality: params.orderMinQuality,
    orderMinAttack: params.orderMinAttack,
    orderWeaponType: params.orderWeaponType,
    orderMaterial: params.orderMaterial,
  })

  if (!check.matches) {
    return {
      success: false,
      goldEarned: 0,
      fameEarned: 0,
      error: check.reason,
    }
  }

  return {
    success: true,
    goldEarned: params.orderGoldReward,
    fameEarned: params.orderFameReward,
    bonusItems: params.orderBonusItems,
  }
}

// ================================
// ИСТЕЧЕНИЕ ЗАКАЗА
// ================================

/**
 * Проверить, истёк ли заказ
 */
export function isOrderExpired(deadline: number, currentTime: number = Date.now()): boolean {
  return currentTime > deadline
}

/**
 * Получить оставшееся время заказа в секундах
 */
export function getOrderRemainingTime(deadline: number, currentTime: number = Date.now()): number {
  return Math.max(0, Math.ceil((deadline - currentTime) / 1000))
}

/**
 * Проверить и обновить статус истёкших заказов
 */
export function checkExpiredOrders(orders: NPCOrder[]): NPCOrder[] {
  const now = Date.now()

  return orders.map(order => {
    if (order.status === 'available' && order.deadline != null && isOrderExpired(order.deadline, now)) {
      return { ...order, status: 'expired' as const }
    }
    return order
  })
}
