/**
 * Cross-slice: заказы (инвентарь + награды + репутация + ресурсы).
 * Вызывается из game-store-composed; slice `createOrdersSlice` даёт `completeOrder` с 3 аргументами.
 */

import type { ResourceKey } from '@/store/slices/resources-slice'
import type { OrdersSlice } from '@/store/slices/orders-slice'
import type { GameStatistics } from '@/store/slices/player-slice'
import type { CraftedWeaponV2 } from '@/types/craft-v2'
import { calculateGoldReward } from '@/lib/store-utils/order-utils'
import { calculateReputationGain } from '@/types/guild'
import { getWeaponGuildServiceBlockReason } from '@/lib/guild-weapon-service-eligibility'
import { toast } from '@/hooks/use-toast'

/** Минимальный контракт стора для координации заказов (без циклического импорта GameStore). */
export type OrderCrossSliceStore = {
  repairBenchWeaponId?: string | null
  weaponInventory: { weapons: CraftedWeaponV2[] }
  orders: OrdersSlice['orders']
  activeOrderId: string | null
  player: { level: number }
  resources: Record<string, number | undefined>
  statistics: GameStatistics
  addResource: (key: ResourceKey, amount: number) => void
  grantResourceKeyFromWorld: (key: ResourceKey, amount: number) => void
  addFame: (amount: number) => void
  addReputation: (amount: number) => void
  updateStatistics: (partial: Partial<GameStatistics>) => void
  removeWeapon: (weaponId: string) => boolean
}

export function buildOrderCrossSlice(
  set: (partial: unknown) => void,
  get: () => OrderCrossSliceStore,
  ordersApi: Pick<OrdersSlice, 'completeOrder' | 'takeAdvance'>
) {
  return {
    takeAdvance: (orderId: string, amount: number) => {
      const state = get()
      const order = state.orders.find((o) => o.id === orderId)
      if (!order) return { success: false, taken: 0 }

      const result = ordersApi.takeAdvance(orderId, amount)
      if (result.success) {
        state.addResource('gold', result.taken)
      }
      return result
    },

    completeOrder: (orderId: string, weaponId: string) => {
      const state = get()
      const weapon = state.weaponInventory.weapons.find((w) => w.id === weaponId)
      if (!weapon) return false

      const serviceBlock = getWeaponGuildServiceBlockReason(weapon, state.repairBenchWeaponId ?? null)
      if (serviceBlock) {
        toast({
          variant: 'destructive',
          title: 'Оружие не принимают',
          description: serviceBlock,
        })
        return false
      }

      const order = state.orders.find((o) => o.id === orderId)
      if (!order) return false

      const baseReward = calculateGoldReward(
        weapon.quality,
        order.weaponType,
        order.material,
        state.player.level,
        order.materialCost || 0
      )

      const advanceTaken = order.advanceTaken || 0
      const materialAdvanceCost = order.materialAdvance?.totalCost || 0
      const totalAdvance = advanceTaken + materialAdvanceCost
      const finalGoldReward = Math.max(1, baseReward - totalAdvance)

      const result = ordersApi.completeOrder(orderId, weaponId, {
        quality: weapon.quality,
        attack: weapon.stats.attack,
        type: weapon.type,
        recipeId: weapon.recipeId,
        hiddenTags: weapon.hiddenTags,
      })
      if (!result.success) return false

      result.rewards.gold = finalGoldReward

      state.addResource('gold', result.rewards.gold)
      state.addFame(result.rewards.fame)

      const reputationGain = calculateReputationGain('craft', result.rewards.gold, state.player.level)
      state.addReputation(reputationGain)

      if (result.rewards.bonusItems) {
        for (const bonus of result.rewards.bonusItems) {
          if (bonus.resource in state.resources) {
            state.grantResourceKeyFromWorld(bonus.resource as ResourceKey, bonus.amount)
          }
        }
      }

      state.removeWeapon(weaponId)

      state.updateStatistics({
        ordersCompleted: state.statistics.ordersCompleted + 1,
        totalGoldEarned: state.statistics.totalGoldEarned + finalGoldReward,
      })

      return true
    },

    expireOrder: (orderId: string) => {
      set((s: { orders: OrdersSlice['orders']; activeOrderId: string | null }) => ({
        orders: s.orders.map((o) =>
          o.id === orderId && o.status === 'available' ? { ...o, status: 'expired' as const } : o
        ),
        activeOrderId: s.activeOrderId === orderId ? null : s.activeOrderId,
      }))
    },
  }
}
