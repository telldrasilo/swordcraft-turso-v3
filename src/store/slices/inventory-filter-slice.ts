import type { StateCreator } from 'zustand'

export type InventorySortBy = 'power' | 'date' | 'quality' | 'durability'

export type InventoryFilterQuality = 'all' | 'legendary' | 'masterpiece' | 'excellent' | 'good'

export type InventoryFilterDamage = 'all' | 'damaged' | 'undamaged'

export interface InventoryFilterSlice {
  inventorySortBy: InventorySortBy
  inventoryFilterQuality: InventoryFilterQuality
  inventoryFilterDamage: InventoryFilterDamage
  setInventorySortBy: (v: InventorySortBy) => void
  setInventoryFilterQuality: (v: InventoryFilterQuality) => void
  setInventoryFilterDamage: (v: InventoryFilterDamage) => void
}

export const defaultInventoryFilterState: Pick<
  InventoryFilterSlice,
  'inventorySortBy' | 'inventoryFilterQuality' | 'inventoryFilterDamage'
> = {
  inventorySortBy: 'power',
  inventoryFilterQuality: 'all',
  inventoryFilterDamage: 'all',
}

function isInventorySortBy(x: unknown): x is InventorySortBy {
  return x === 'power' || x === 'date' || x === 'quality' || x === 'durability'
}

function isInventoryFilterQuality(x: unknown): x is InventoryFilterQuality {
  return (
    x === 'all' ||
    x === 'legendary' ||
    x === 'masterpiece' ||
    x === 'excellent' ||
    x === 'good'
  )
}

function isInventoryFilterDamage(x: unknown): x is InventoryFilterDamage {
  return x === 'all' || x === 'damaged' || x === 'undamaged'
}

/** Normalize полей фильтра после merge/persist (старые сейвы без ключей). */
export function normalizeInventoryFilterFromMerged(merged: Record<string, unknown>): void {
  merged['inventorySortBy'] = isInventorySortBy(merged['inventorySortBy'])
    ? merged['inventorySortBy']
    : defaultInventoryFilterState.inventorySortBy
  merged['inventoryFilterQuality'] = isInventoryFilterQuality(merged['inventoryFilterQuality'])
    ? merged['inventoryFilterQuality']
    : defaultInventoryFilterState.inventoryFilterQuality
  merged['inventoryFilterDamage'] = isInventoryFilterDamage(merged['inventoryFilterDamage'])
    ? merged['inventoryFilterDamage']
    : defaultInventoryFilterState.inventoryFilterDamage
}

export const createInventoryFilterSlice: StateCreator<
  InventoryFilterSlice,
  [],
  [],
  InventoryFilterSlice
> = (set) => ({
  ...defaultInventoryFilterState,
  setInventorySortBy: (inventorySortBy) => set({ inventorySortBy }),
  setInventoryFilterQuality: (inventoryFilterQuality) => set({ inventoryFilterQuality }),
  setInventoryFilterDamage: (inventoryFilterDamage) => set({ inventoryFilterDamage }),
})
