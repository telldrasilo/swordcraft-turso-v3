'use client'

import { Package } from 'lucide-react'
import { useMemo } from 'react'
import { useGameStore } from '@/store'
import { useInventoryFilter } from '@/hooks/use-inventory-filter'
import { InventoryFilterBar } from '@/components/forge/inventory-filter-bar'
import { countUniqueActiveWorkbenchWeaponIds } from '@/lib/workbench/workbench-queue'

/** Шапка верстака: счётчики и фильтры (список клинков — компактный ряд отдельно). */
export function WorkbenchWeaponList() {
  const weapons = useGameStore((state) => state.weaponInventory.weapons)
  const workbenchQueue = useGameStore((state) => state.workbenchQueue)
  const { apply } = useInventoryFilter()

  const filteredWeapons = useMemo(() => apply(weapons), [apply, weapons])

  const benchSummary = useMemo(() => {
    const onBench = countUniqueActiveWorkbenchWeaponIds(workbenchQueue)
    return { onBench, total: weapons.length, filtered: filteredWeapons.length }
  }, [workbenchQueue, weapons.length, filteredWeapons.length])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
        <Package className="w-3.5 h-3.5 text-amber-600/80" />
        <span>
          Клинков в инвентаре: <span className="text-stone-300">{benchSummary.total}</span>
          {benchSummary.filtered !== benchSummary.total ? (
            <span className="text-stone-600">
              {' '}
              · в выборке: <span className="text-stone-400">{benchSummary.filtered}</span>
            </span>
          ) : null}
          {benchSummary.onBench > 0 ? (
            <span className="text-stone-600">
              {' '}
              · на верстаке (очередь):{' '}
              <span className="text-emerald-200/90">{benchSummary.onBench}</span>
            </span>
          ) : null}
        </span>
      </div>

      <InventoryFilterBar />
    </div>
  )
}
