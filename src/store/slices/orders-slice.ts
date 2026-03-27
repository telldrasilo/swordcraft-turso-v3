/**
 * Orders Slice
 * Управление заказами NPC (рыночные заказы)
 * Использует utils для генерации
 */

import type { StateCreator } from 'zustand'

// Импорт утилит
import {
  generateAchievableOrder,
  type OrderGenerationContext,
  type MaterialAdvance
} from '@/lib/store-utils/order-achievable-utils'

// ================================
// ХЕЛПЕР: Проверка соответствия оружия заказу
// ================================

/**
 * Проверяет, соответствует ли оружие требованиям заказа
 * Использует новую систему hiddenTags с fallback на старую
 */
function checkWeaponMatchesOrder(
  weapon: {
    quality: number
    attack: number
    type: string
    recipeId?: string
    hiddenTags?: string[]
  },
  order: NPCOrder
): boolean {
  // Проверка качества
  if (weapon.quality < order.minQuality) return false
  
  // Проверка атаки
  if (order.minAttack && weapon.attack < order.minAttack) return false
  
  // Новая система: проверяем hiddenTags
  if (weapon.hiddenTags && weapon.hiddenTags.length > 0) {
    // Проверка типа оружия
    if (!weapon.hiddenTags.includes(order.weaponType)) return false
    
    // Проверка материала
    if (order.material && !weapon.hiddenTags.includes(order.material)) return false
  } else {
    // Fallback: старая система проверки
    if (weapon.type !== order.weaponType) return false
    if (order.material && weapon.recipeId && !weapon.recipeId.includes(order.material)) {
      return false
    }
  }
  
  return true
}

// ================================
// ТИПЫ
// ================================

/** Статус заказа */
export type OrderStatus = 'available' | 'in_progress' | 'completed' | 'expired'

/** Заказ от NPC */
export interface NPCOrder {
  id: string
  clientName: string
  clientTitle: string
  clientIcon: string
  weaponType: string
  material?: string
  minQuality: number
  minAttack?: number
  goldReward: number
  fameReward: number
  bonusItems?: OrderBonusItem[]
  materialAdvance?: MaterialAdvance
  advanceTaken?: number  // Сколько аванса было взято
  materialCost?: number   // Точная стоимость материалов для расчёта награды
  status: OrderStatus
  acceptedAt?: number
  completedAt?: number
  requiredLevel: number
  requiredFame: number
}

/** Бонусный предмет за выполнение заказа */
export interface OrderBonusItem {
  resource: string
  amount: number
}

/** Состояние заказов */
export interface OrdersState {
  orders: NPCOrder[]
  activeOrderId: string | null
}

/** Actions для заказов */
export interface OrdersActions {
  generateOrder: (context: OrderGenerationContext) => NPCOrder | null
  acceptOrder: (orderId: string) => boolean
  cancelOrder: (orderId: string) => { success: boolean; penalty: number }
  takeAdvance: (orderId: string, amount: number) => { success: boolean; taken: number }
  completeOrder: (orderId: string, weaponId: string, weapon: {
    quality: number
    attack: number
    type: string
    recipeId?: string
    hiddenTags?: string[]
  }) => { success: boolean; rewards: { gold: number; fame: number; bonusItems?: OrderBonusItem[] } }
  getActiveOrder: () => NPCOrder | undefined
  refreshOrders: () => void  // Обновить список доступных заказов
}

/** Полный тип slice - только действия и состояние */
export type OrdersSlice = OrdersState & OrdersActions

// ================================
// НАЧАЛЬНОЕ СОСТОЯНИЕ
// ================================

export const initialOrdersState: OrdersState = {
  orders: [],
  activeOrderId: null,
}

// ================================
// SLICE
// ================================

export const createOrdersSlice: StateCreator<
  OrdersSlice,
  [],
  [],
  OrdersSlice
> = (set, get) => ({
  // State
  orders: [],
  activeOrderId: null,

  // Actions
  generateOrder: (context) => {
    const state = get()

    // Проверяем лимит заказов
    const activeOrders = state.orders.filter(o => o.status === 'available').length
    if (activeOrders >= 3) {
      console.log('[Orders Slice] Order limit reached (3)')
      return null
    }

    console.log('[Orders Slice] Attempting to generate order, player level:', context.playerLevel, 'unlocked recipes:', context.unlockedRecipes.weaponRecipes.length)

    // Генерируем достижимый заказ с помощью новой утилиты
    const existingClients = state.orders
      .filter(o => o.status === 'available')
      .map(o => o.clientName)

    const generationContext = {
      ...context,
      existingClients,
    }

    const order = generateAchievableOrder(generationContext)

    if (!order) {
      console.warn('[Orders Slice] Failed to generate order')
      return null
    }

    // Проверяем, нет ли уже такого клиента
    if (state.orders.some(o => o.clientName === order.clientName && o.status === 'available')) {
      console.warn('[Orders Slice] Client already has an active order:', order.clientName)
      return null
    }

    console.log('[Orders Slice] Order generated successfully:', order.id, order.weaponType, order.material)

    set((state) => ({
      orders: [...state.orders, order]
    }))

    return order
  },

  acceptOrder: (orderId) => {
    const state = get()

    const order = state.orders.find(o => o.id === orderId)
    if (!order || order.status !== 'available') return false
    if (state.activeOrderId) return false // Уже есть активный заказ

    // Если есть аванс материалов, добавляем их в ресурсы (будет списано через composed store)
    // Примечание: здесь только логика, списание ресурсов происходит в composed store

    set((state) => ({
      orders: state.orders.map(o =>
        o.id === orderId
          ? { ...o, status: 'in_progress' as const, acceptedAt: Date.now(), advanceTaken: 0 }
          : o
      ),
      activeOrderId: orderId,
    }))

    return true
  },

  takeAdvance: (orderId, amount) => {
    const state = get()

    const order = state.orders.find(o => o.id === orderId)
    if (!order || order.status !== 'in_progress') {
      return { success: false, taken: 0 }
    }

    // Максимальный аванс - 50% от награды
    const maxAdvance = Math.floor(order.goldReward * 0.5)
    const alreadyTaken = order.advanceTaken || 0
    const availableAdvance = maxAdvance - alreadyTaken

    if (availableAdvance <= 0) {
      console.warn('[Orders Slice] No advance available for order:', orderId)
      return { success: false, taken: 0 }
    }

    // Ограничиваем запрошенную сумму доступным авансом
    const amountToTake = Math.min(amount, availableAdvance)

    // Примечание: добавление золота происходит в composed store

    set((state) => ({
      orders: state.orders.map(o =>
        o.id === orderId
          ? { ...o, advanceTaken: (o.advanceTaken || 0) + amountToTake }
          : o
      ),
    }))

    console.log('[Orders Slice] Advance taken:', amountToTake, 'from order:', orderId)
    return { success: true, taken: amountToTake }
  },

  cancelOrder: (orderId) => {
    const state = get()
    
    const order = state.orders.find(o => o.id === orderId)
    if (!order || order.status !== 'in_progress') {
      return { success: false, penalty: 0 }
    }

    // Рассчитать штраф: 10% от награды или минимум 5 золота
    const penalty = Math.max(5, Math.floor(order.goldReward * 0.1))

    // Примечание: списание штрафа происходит в composed store

    // Вернуть заказ в статус available
    set((state) => ({
      orders: state.orders.map(o =>
        o.id === orderId
          ? { ...o, status: 'available' as const, acceptedAt: undefined }
          : o
      ),
      activeOrderId: null,
    }))

    return { success: true, penalty }
  },

  completeOrder: (orderId, _weaponId, weapon) => {
    const state = get()

    const order = state.orders.find(o => o.id === orderId)
    if (!order || order.status !== 'in_progress') {
      return { success: false, rewards: { gold: 0, fame: 0 } }
    }

    // Проверяем требования с помощью новой функции
    const matches = checkWeaponMatchesOrder(weapon, order)
    if (!matches) {
      return { success: false, rewards: { gold: 0, fame: 0 } }
    }

    // Награды будут рассчитаны в composed store на основе качества оружия
    const rewards = {
      gold: order.goldReward, // Временное значение, будет перезаписано в composed store
      fame: order.fameReward,
      bonusItems: order.bonusItems,
    }

    // Обновляем статус заказа
    set((state) => ({
      orders: state.orders.map(o =>
        o.id === orderId
          ? { ...o, status: 'completed' as const, completedAt: Date.now() }
          : o
      ),
      activeOrderId: null,
    }))

    return { success: true, rewards }
  },

  getActiveOrder: () => {
    const state = get()
    if (!state.activeOrderId) return undefined
    return state.orders.find(o => o.id === state.activeOrderId)
  },

  refreshOrders: () => {
    const state = get()
    
    // Удаляем все доступные заказы (не помечаем, а именно удаляем)
    // Оставляем только активные, выполненные и просроченные
    const updatedOrders = state.orders.filter(o => o.status !== 'available')
    
    set({ orders: updatedOrders })
    
    // После этого useEffect в контейнере увидит изменение orders.length 
    // и автоматически сгенерирует новые заказы
    console.log('[Orders Slice] Orders refreshed, available orders removed. Total orders:', updatedOrders.length)
  },
})
