/**
 * Cross-slice: ремонт оружия (resources + workers + inventory).
 * Вызывается из game-store-composed; get/set — Zustand API полного стора.
 */

import type { RepairType, ExecuteRepairResult } from '@/data/repair-system'
import type { ResourceKey } from '@/store/slices/resources-slice'
import type { WeaponInventory } from '@/store/slices/craft-slice'
import { findBestBlacksmith } from '@/lib/store-utils/worker-utils'
import {
  getRepairOptionsForWeapon,
  calculateRepairCost,
  calculateMaxRepairPercent,
  executeRepair as executeRepairUtil,
  craftedWeaponV2ToWeaponRepairCalc,
} from '@/lib/store-utils/repair-utils'

/** Минимальный контракт стора для блока ремонта (без циклического импорта GameStore). */
export type RepairStoreSlice = {
  weaponInventory: {
    weapons: import('@/types/craft-v2').CraftedWeaponV2[]
  }
  workers: import('@/store/slices/workers-slice').Worker[]
  resources: { gold: number } & Partial<Record<ResourceKey, number>>
  spendResource: (key: ResourceKey, amount: number) => void
  canAfford: (cost: Partial<Record<ResourceKey, number>>) => boolean
  updateWorkerStamina: (workerId: string, delta: number) => void
}

export function buildRepairCrossSlice(
  // Zustand API полного GameStore — узкий тип только для тела функций ниже
  set: (partial: unknown) => void,
  get: () => RepairStoreSlice
) {
  return {
    executeWeaponRepair: (weaponId: string, repairType: RepairType): ExecuteRepairResult => {
      const state = get()
      const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
      if (!weapon) {
        return { success: false, error: 'Оружие не найдено' }
      }

      const blacksmith = findBestBlacksmith(state.workers)
      const model = craftedWeaponV2ToWeaponRepairCalc(weapon)

      const result = executeRepairUtil(
        model,
        repairType,
        blacksmith,
        state.resources.gold,
        state.resources
      )

      const roll = result.result
      const options = getRepairOptionsForWeapon(model, blacksmith)
      const option = options.find(o => o.type === repairType)

      if (result.success && roll && option) {
        state.spendResource('gold', option.goldCost)
        for (const [mat, amount] of Object.entries(option.materials)) {
          const n = amount || 0
          if (n > 0) state.spendResource(mat as ResourceKey, n)
        }
        if (blacksmith) {
          get().updateWorkerStamina(blacksmith.id, -option.staminaCost)
        }
      }

      if (roll) {
        set((s: { weaponInventory: WeaponInventory }) => ({
          weaponInventory: {
            ...s.weaponInventory,
            weapons: s.weaponInventory.weapons.map(w => {
              if (w.id !== weaponId) return w
              const cur = w.currentDurability ?? w.stats.durability
              const newDur = Math.min(
                roll.maxDurabilityAfter,
                Math.max(0, cur + roll.durabilityRestored)
              )
              return {
                ...w,
                currentDurability: newDur,
                stats: {
                  ...w.stats,
                  durability: newDur,
                  maxDurability: roll.maxDurabilityAfter,
                  attack: Math.max(1, w.stats.attack - roll.attackLost),
                },
                warSoul: Math.max(0, w.warSoul - roll.soulLost),
                epicMultiplier: Math.max(1, w.epicMultiplier - roll.epicLost),
              }
            }),
          },
        }))
      }

      return result
    },

    repairWeaponWithResources: (weaponId: string) => {
      const state = get()
      const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
      if (!weapon) return { success: false, cost: 0, repairedAmount: 0 }

      const blacksmith = findBestBlacksmith(state.workers)
      if (!blacksmith) return { success: false, cost: 0, repairedAmount: 0 }

      const model = craftedWeaponV2ToWeaponRepairCalc(weapon)
      const cur = weapon.currentDurability ?? weapon.stats.durability
      const maxD = weapon.stats.maxDurability

      const cost = calculateRepairCost(model, blacksmith.level)
      const maxRepair = calculateMaxRepairPercent(blacksmith.level)

      if (!state.canAfford({ gold: cost })) return { success: false, cost, repairedAmount: 0 }

      const repairedAmount = Math.floor((maxD - cur) * (maxRepair / 100))

      state.spendResource('gold', cost)

      set((s: { weaponInventory: WeaponInventory }) => ({
        weaponInventory: {
          ...s.weaponInventory,
          weapons: s.weaponInventory.weapons.map(w => {
            if (w.id !== weaponId) return w
            const c = w.currentDurability ?? w.stats.durability
            const m = w.stats.maxDurability
            const next = Math.min(m, c + repairedAmount)
            return {
              ...w,
              currentDurability: next,
              stats: { ...w.stats, durability: next },
            }
          }),
        },
      }))

      return { success: true, cost, repairedAmount }
    },

    getRepairOptions: (weaponId: string) => {
      const state = get()
      const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
      if (!weapon) return []

      const model = craftedWeaponV2ToWeaponRepairCalc(weapon)
      return getRepairOptionsForWeapon(model, findBestBlacksmith(state.workers))
    },

    getBestBlacksmith: () => findBestBlacksmith(get().workers),

    getWeaponRepairCost: (weaponId: string) => {
      const state = get()
      const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
      if (!weapon) return 0

      const blacksmith = findBestBlacksmith(state.workers)
      const model = craftedWeaponV2ToWeaponRepairCalc(weapon)
      return calculateRepairCost(model, blacksmith?.level ?? 1)
    },

    getMaxRepairPercent: (_weaponId: string) => {
      const blacksmith = findBestBlacksmith(get().workers)
      return blacksmith ? calculateMaxRepairPercent(blacksmith.level) : 0
    },
  }
}
