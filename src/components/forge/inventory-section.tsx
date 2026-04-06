/**
 * InventorySection - секция инвентаря оружия
 */

'use client'

import { AnimatePresence } from 'framer-motion'
import { Package, Coins, Star, Sword, Filter, SortAsc, Wrench } from 'lucide-react'
import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/store'
import { cn } from '@/lib/utils'
import { WeaponInventoryCard } from './weapon-inventory-card'

export function InventorySection() {
  const weapons = useGameStore((state) => state.weaponInventory.weapons)
  const repairBenchWeaponId = useGameStore((state) => state.repairBenchWeaponId)
  const navigateToForgeTab = useGameStore((state) => state.navigateToForgeTab)
  const [sortBy, setSortBy] = useState<'date' | 'quality'>('date')
  const [filterQuality, setFilterQuality] = useState<string>('all')

  const visibleWeapons = useMemo(
    () => weapons.filter((w) => w.id !== repairBenchWeaponId),
    [weapons, repairBenchWeaponId]
  )

  // Мемоизированная сортировка оружия (без клинка на верстаке ремонта)
  const sortedWeapons = useMemo(() => {
    return [...visibleWeapons].sort((a, b) => {
      if (sortBy === 'date') return b.createdAt - a.createdAt
      if (sortBy === 'quality') return b.quality - a.quality
      return 0
    })
  }, [visibleWeapons, sortBy])
  
  // Мемоизированная фильтрация по качеству
  const filteredWeapons = useMemo(() => {
    return filterQuality === 'all' 
      ? sortedWeapons 
      : sortedWeapons.filter(w => w.qualityGrade === filterQuality)
  }, [sortedWeapons, filterQuality])
  
  // Мемоизированная статистика
  const stats = useMemo(() => {
    const avgAttack = visibleWeapons.length > 0
      ? Math.round(visibleWeapons.reduce((sum, w) => sum + w.stats.attack, 0) / visibleWeapons.length)
      : 0
    const masterpieceCount = visibleWeapons.filter(
      w => w.qualityGrade === 'masterpiece' || w.qualityGrade === 'legendary'
    ).length
    const needsRepairCount = visibleWeapons.filter((w) => {
      const d = w.currentDurability ?? w.stats.durability
      const tags = w.activeDamageTags?.length ?? 0
      return tags > 0 || d < w.stats.maxDurability
    }).length

    return { avgAttack, masterpieceCount, count: visibleWeapons.length, needsRepairCount }
  }, [visibleWeapons])
  
  return (
    <div className="space-y-4">
      {stats.needsRepairCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-800/40 bg-amber-950/25 px-3 py-2 text-sm">
          <span className="text-stone-300">
            Нужен уход:{' '}
            <span className="text-amber-200/95 font-medium">{stats.needsRepairCount}</span> из{' '}
            {stats.count} клинков в списке
            {repairBenchWeaponId ? (
              <span className="text-stone-500"> (ещё один на верстаке «Ремонт»)</span>
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

      {/* Статистика инвентаря */}
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
            <Coins className="w-5 h-5 mx-auto text-stone-500 mb-1 opacity-60" />
            <p className="text-sm font-medium text-stone-400">В разработке</p>
            <p className="text-xs text-stone-500">Общая стоимость</p>
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
      
      {/* Фильтры и сортировка */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-xs text-stone-500">
          <Filter className="w-3 h-3" />
          <span>Фильтр:</span>
        </div>
        {[
          { id: 'all', label: 'Все' },
          { id: 'legendary', label: 'Легенда', color: 'text-amber-400' },
          { id: 'masterpiece', label: 'Шедевр', color: 'text-purple-400' },
          { id: 'excellent', label: 'Отличное', color: 'text-blue-400' },
          { id: 'good', label: 'Хорошее', color: 'text-green-400' },
        ].map((f) => (
          <Button
            key={f.id}
            variant={filterQuality === f.id ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'h-7 text-xs',
              filterQuality === f.id 
                ? 'bg-amber-800 text-amber-100' 
                : 'border-stone-600 text-stone-400'
            )}
            onClick={() => setFilterQuality(f.id)}
          >
            {f.label}
          </Button>
        ))}
        
        <div className="ml-auto flex items-center gap-1">
          <SortAsc className="w-3 h-3 text-stone-500" />
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'quality')}
            className="bg-stone-800 border border-stone-600 rounded px-2 py-1 text-xs text-stone-300"
          >
            <option value="date">По дате</option>
            <option value="quality">По качеству</option>
          </select>
        </div>
      </div>
      
      {/* Список оружия */}
      {filteredWeapons.length === 0 ? (
        <Card className="card-medieval">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto text-stone-600 mb-3" />
            <p className="text-stone-500 mb-1">Инвентарь пуст</p>
            <p className="text-stone-600 text-sm">
              {stats.count > 0 
                ? 'Нет предметов с выбранным фильтром' 
                : 'Создайте оружие на вкладке "Крафт"'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence mode="popLayout">
          {/* auto-fill + minmax: минимальная ширина колонки, без сжатия заголовка в одну букву. */}
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
