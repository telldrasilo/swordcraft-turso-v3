/**
 * InventorySection - секция инвентаря оружия
 */

'use client'

import { AnimatePresence } from 'framer-motion'
import { Package, Star, Sword, Wrench, Zap } from 'lucide-react'
import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/store'
import { useInventoryFilter } from '@/hooks/use-inventory-filter'
import { WeaponInventoryCard } from './weapon-inventory-card'
import { InventoryFilterBar } from './inventory-filter-bar'

export function InventorySection() {
  const weapons = useGameStore((state) => state.weaponInventory.weapons)
  const workbenchQueue = useGameStore((state) => state.workbenchQueue)
  const navigateToForgeTab = useGameStore((state) => state.navigateToForgeTab)
  const { apply } = useInventoryFilter()

  const workbenchActiveWeaponCount = useMemo(() => {
    const ids = new Set<string>()
    for (const i of workbenchQueue) {
      if (i.status === 'planned' || i.status === 'running') ids.add(i.weaponId)
    }
    return ids.size
  }, [workbenchQueue])

  const visibleWeapons = weapons

  const filteredWeapons = useMemo(() => apply(visibleWeapons), [apply, visibleWeapons])

  const stats = useMemo(() => {
    const avgAttack =
      visibleWeapons.length > 0
        ? Math.round(
            visibleWeapons.reduce((sum, w) => sum + w.stats.attack, 0) / visibleWeapons.length
          )
        : 0
    const avgPower =
      visibleWeapons.length > 0
        ? Math.round(
            visibleWeapons.reduce(
              (sum, w) => sum + (typeof w.powerScore === 'number' ? w.powerScore : w.stats.attack),
              0
            ) / visibleWeapons.length
          )
        : 0
    const masterpieceCount = visibleWeapons.filter(
      (w) => w.qualityGrade === 'masterpiece' || w.qualityGrade === 'legendary'
    ).length
    const needsRepairCount = visibleWeapons.filter((w) => {
      const d = w.currentDurability ?? w.stats.durability
      const tags = w.activeDamageTags?.length ?? 0
      return tags > 0 || d < w.stats.maxDurability
    }).length

    return {
      avgAttack,
      avgPower,
      masterpieceCount,
      count: visibleWeapons.length,
      needsRepairCount,
    }
  }, [visibleWeapons])

  return (
    <div className="space-y-4">
      {stats.needsRepairCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-800/40 bg-amber-950/25 px-3 py-2 text-sm">
          <span className="text-stone-300">
            Нужен уход:{' '}
            <span className="text-amber-200/95 font-medium">{stats.needsRepairCount}</span> из{' '}
            {stats.count} клинков в списке
            {workbenchActiveWeaponCount > 0 ? (
              <span className="text-stone-500">
                {' '}
                (в работе или плане верстака: {workbenchActiveWeaponCount})
              </span>
            ) : null}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-amber-600/50 text-amber-100 hover:bg-amber-950/50"
            onClick={() => navigateToForgeTab('repair')}
          >
            <Wrench className="w-3.5 h-3.5 mr-1.5" />
            Открыть «Ремонт»
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="card-medieval bg-stone-800/50">
          <CardContent className="p-3 text-center">
            <Package className="w-5 h-5 mx-auto text-stone-500 mb-1" />
            <p className="text-xl font-bold text-stone-200">{stats.count}</p>
            <p className="text-xs text-stone-500">Предметов</p>
          </CardContent>
        </Card>
        <Card className="card-medieval bg-stone-800/50">
          <CardContent className="p-3 text-center">
            <Zap className="w-5 h-5 mx-auto text-amber-400 mb-1" />
            <p className="text-xl font-bold text-stone-200">{stats.avgPower}</p>
            <p className="text-xs text-stone-500">Сред. мощь</p>
          </CardContent>
        </Card>
        <Card className="card-medieval bg-stone-800/50">
          <CardContent className="p-3 text-center">
            <Star className="w-5 h-5 mx-auto text-purple-500 mb-1" />
            <p className="text-xl font-bold text-stone-200">{stats.masterpieceCount}</p>
            <p className="text-xs text-stone-500">Шедевров+</p>
          </CardContent>
        </Card>
        <Card className="card-medieval bg-stone-800/50">
          <CardContent className="p-3 text-center">
            <Sword className="w-5 h-5 mx-auto text-red-500 mb-1" />
            <p className="text-xl font-bold text-stone-200">{stats.avgAttack}</p>
            <p className="text-xs text-stone-500">Сред. атака</p>
          </CardContent>
        </Card>
      </div>

      <InventoryFilterBar />

      {filteredWeapons.length === 0 ? (
        <Card className="card-medieval">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto text-stone-600 mb-3" />
            <p className="text-stone-500 mb-1">Инвентарь пуст</p>
            <p className="text-stone-600 text-sm">
              {stats.count > 0
                ? 'Нет предметов с выбранным фильтром'
                : 'Создайте оружие на вкладке «Крафт»'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,17.5rem),1fr))] gap-4">
            {filteredWeapons.map((weapon) => (
              <WeaponInventoryCard key={weapon.id} weapon={weapon} />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
