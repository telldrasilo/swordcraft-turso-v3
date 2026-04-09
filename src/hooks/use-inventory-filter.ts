'use client'

import { useCallback, useMemo } from 'react'
import { useGameStore } from '@/store'
import type {
  InventoryFilterDamage,
  InventoryFilterQuality,
  InventorySortBy,
} from '@/store/slices/inventory-filter-slice'
import {
  applyInventoryListFilters,
} from '@/lib/forge/inventory-filter-utils'
import type { CraftedWeaponV2 } from '@/types/craft-v2'

export function useInventoryFilter() {
  const sortBy = useGameStore((s) => s.inventorySortBy)
  const filterQuality = useGameStore((s) => s.inventoryFilterQuality)
  const filterDamage = useGameStore((s) => s.inventoryFilterDamage)
  const setSortBy = useGameStore((s) => s.setInventorySortBy)
  const setFilterQuality = useGameStore((s) => s.setInventoryFilterQuality)
  const setFilterDamage = useGameStore((s) => s.setInventoryFilterDamage)

  const apply = useCallback(
    (weapons: readonly CraftedWeaponV2[]) =>
      applyInventoryListFilters(weapons, {
        sortBy,
        filterQuality,
        filterDamage,
      }),
    [sortBy, filterQuality, filterDamage]
  )

  return useMemo(
    () => ({
      sortBy,
      filterQuality,
      filterDamage,
      setSortBy,
      setFilterQuality,
      setFilterDamage,
      apply,
    }),
    [sortBy, filterQuality, filterDamage, setSortBy, setFilterQuality, setFilterDamage, apply]
  )
}

export type UseInventoryFilterSortBy = InventorySortBy
export type UseInventoryFilterQuality = InventoryFilterQuality
export type UseInventoryFilterDamage = InventoryFilterDamage
