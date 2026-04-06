/**
 * Resources Slice
 * Управление всеми ресурсами игры
 * Использует constants для цен продажи
 */

import type { StateCreator } from 'zustand'
import type { EncyclopediaActions } from './encyclopedia-slice'
import { RESOURCE_SELL_PRICES } from '@/lib/store-utils/constants'
import {
  applyCraftingCostSpend,
  canAffordCraftingCostWithStash as canAffordCraftingCostWithStashPure,
  computePoolSpendDeltas,
  getCatalogMaterialIdsForResourceKey,
  getGrantTargetMaterialId,
  removeResourceKeyFromPools,
} from '@/lib/craft/inventory-check'

const POOL_SPEND_ENC_SKIP_KEYS = new Set<ResourceKey>(['gold', 'soulEssence'])

/** В composed store у `get()` есть действия энциклопедии; слайс типизирован узко. */
type ResourcesGet = () => ResourcesSlice & Pick<EncyclopediaActions, 'useMaterialAmount' | 'discoverMaterial'>

function applyPoolSpendDeltasToEncyclopedia(
  get: ResourcesGet,
  deltas: ReturnType<typeof computePoolSpendDeltas>
): void {
  for (const [mid, n] of Object.entries(deltas.stashDecrements)) {
    if (n > 0) get().useMaterialAmount(mid, n)
  }
  for (const [rk, n] of Object.entries(deltas.resourceDecrements)) {
    if (!n || n <= 0) continue
    const key = rk as ResourceKey
    if (POOL_SPEND_ENC_SKIP_KEYS.has(key)) continue
    const ids = getCatalogMaterialIdsForResourceKey(key)
    if (ids.length === 0) continue
    const base = Math.floor(n / ids.length)
    const remainder = n - base * ids.length
    ids.forEach((mid, i) => {
      const part = base + (i < remainder ? 1 : 0)
      if (part > 0) get().useMaterialAmount(mid, part)
    })
  }
}

// ================================
// ТИПЫ
// ================================

/** Все ресурсы в игре */
export interface Resources {
  gold: number
  soulEssence: number
  // Сырьё
  wood: number
  stone: number
  iron: number
  coal: number
  copper: number
  tin: number
  silver: number
  goldOre: number
  mithril: number
  // Переработанные
  ironIngot: number
  copperIngot: number
  tinIngot: number
  bronzeIngot: number
  steelIngot: number
  silverIngot: number
  goldIngot: number
  mithrilIngot: number
  planks: number
  stoneBlocks: number
  leather: number  // Кожа для рукоятей
}

/** Ключи ресурсов */
export type ResourceKey = keyof Resources

/** Стоимость (словарь ресурсов) */
export type CraftingCost = Partial<Record<ResourceKey, number>>

/** Состояние ресурсов */
export interface ResourcesState {
  resources: Resources
  /** Склад материалов по id из каталога (экспедиции, др.) — не валюта и не soulEssence */
  materialStash: Record<string, number>
}

/** Actions для ресурсов */
export interface ResourcesActions {
  addResource: (resource: ResourceKey, amount: number) => void
  spendResource: (resource: ResourceKey, amount: number) => boolean
  canAfford: (cost: CraftingCost) => boolean
  spendResources: (cost: CraftingCost) => boolean
  /** Крафт v2 / переработка: достаточно ли cost с учётом materialStash */
  canAffordCraftingCostWithStash: (cost: CraftingCost) => boolean
  /** Крафт v2: списать cost с учётом materialStash (маппинг MATERIAL_TO_RESOURCE), затем resources */
  spendCraftingCostWithStash: (cost: CraftingCost) => boolean
  sellResource: (resource: ResourceKey, amount: number) => boolean
  getResourceSellPrice: (resource: ResourceKey) => number
  addMaterialToStash: (materialId: string, amount: number) => void
  /**
   * Канал начисления материалов (аудит 2–3): каталожный id стадии → `materialStash`
   * (`getGrantTargetMaterialId`, `REFINING_INPUT_STAGE_MATERIAL_ID` для руд/сырья);
   * золото / `soulEssence` → `addResource`. Подземелья — отдельный редизайн.
   */
  grantResourceKeyFromWorld: (resource: ResourceKey, amount: number) => void
}

/** Полный тип slice */
export type ResourcesSlice = ResourcesState & ResourcesActions

// ================================
// НАЧАЛЬНОЕ СОСТОЯНИЕ
// ================================

export const initialResources: Resources = {
  gold: 200,
  soulEssence: 0,
  // Сырьё
  wood: 0,
  stone: 0,
  iron: 0,
  coal: 0,
  copper: 0,
  tin: 0,
  silver: 0,
  goldOre: 0,
  mithril: 0,
  // Переработанные
  ironIngot: 0,
  copperIngot: 0,
  tinIngot: 0,
  bronzeIngot: 0,
  steelIngot: 0,
  silverIngot: 0,
  goldIngot: 0,
  mithrilIngot: 0,
  planks: 0,
  stoneBlocks: 0,
  leather: 0,  // Кожа для рукоятей
}

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================

/**
 * Проверить наличие ресурсов
 */
function checkCanAfford(resources: Resources, cost: CraftingCost): boolean {
  for (const [resource, amount] of Object.entries(cost)) {
    if ((resources[resource as ResourceKey] || 0) < (amount || 0)) {
      return false
    }
  }
  return true
}

// ================================
// SLICE
// ================================

export const createResourcesSlice: StateCreator<
  ResourcesSlice,
  [],
  [],
  ResourcesSlice
> = (set, get) => ({
  // State
  resources: initialResources,
  materialStash: {},

  // Actions
  addResource: (resource, amount) => set((state) => ({
    resources: {
      ...state.resources,
      [resource]: Math.max(0, state.resources[resource] + amount)
    }
  })),

  spendResource: (resource, amount) => {
    const state = get()
    if (state.resources[resource] >= amount) {
      set({
        resources: {
          ...state.resources,
          [resource]: state.resources[resource] - amount
        }
      })
      return true
    }
    return false
  },

  canAfford: (cost) => {
    const state = get()
    return checkCanAfford(state.resources, cost)
  },

  spendResources: (cost) => {
    const state = get()
    if (!checkCanAfford(state.resources, cost)) return false

    const newResources = { ...state.resources }
    for (const [resource, amount] of Object.entries(cost)) {
      if (amount) {
        newResources[resource as ResourceKey] -= amount
      }
    }
    set({ resources: newResources })
    return true
  },

  canAffordCraftingCostWithStash: (cost) => {
    const state = get()
    return canAffordCraftingCostWithStashPure(cost, state.resources, state.materialStash)
  },

  spendCraftingCostWithStash: (cost) => {
    const state = get()
    const result = applyCraftingCostSpend(cost, state.resources, state.materialStash)
    if (!result.ok) return false
    const deltas = computePoolSpendDeltas(
      state.resources,
      state.materialStash,
      result.resources,
      result.materialStash
    )
    set({
      resources: result.resources,
      materialStash: result.materialStash,
    })
    applyPoolSpendDeltasToEncyclopedia(get as ResourcesGet, deltas)
    return true
  },

  sellResource: (resource, amount) => {
    const state = get()
    if (!amount || amount <= 0) return false
    const removed = removeResourceKeyFromPools(resource, amount, state.resources, state.materialStash)
    if (!removed.ok) return false

    const price = state.getResourceSellPrice(resource)
    const totalGold = price * amount
    const afterResources = {
      ...removed.resources,
      gold: removed.resources.gold + totalGold,
    }
    const deltas = computePoolSpendDeltas(
      state.resources,
      state.materialStash,
      afterResources,
      removed.materialStash
    )

    set({
      resources: afterResources,
      materialStash: removed.materialStash,
    })
    applyPoolSpendDeltasToEncyclopedia(get as ResourcesGet, deltas)
    return true
  },

  getResourceSellPrice: (resource) => {
    return RESOURCE_SELL_PRICES[resource] || 1
  },

  addMaterialToStash: (materialId, amount) => {
    if (!materialId || amount <= 0) return
    set((state) => ({
      materialStash: {
        ...state.materialStash,
        [materialId]: Math.max(0, (state.materialStash[materialId] ?? 0) + amount),
      },
    }))
    ;(get as ResourcesGet)().discoverMaterial(materialId)
  },

  grantResourceKeyFromWorld: (resource, amount) => {
    if (!amount || amount <= 0) return
    const mid = getGrantTargetMaterialId(resource)
    if (mid) {
      set((state) => ({
        materialStash: {
          ...state.materialStash,
          [mid]: Math.max(0, (state.materialStash[mid] ?? 0) + amount),
        },
      }))
      ;(get as ResourcesGet)().discoverMaterial(mid)
    } else {
      get().addResource(resource, amount)
    }
  },
})

