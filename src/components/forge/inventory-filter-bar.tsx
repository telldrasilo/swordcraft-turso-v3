'use client'

import { Filter, SortAsc } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useInventoryFilter } from '@/hooks/use-inventory-filter'
import type { InventoryFilterDamage, InventoryFilterQuality, InventorySortBy } from '@/store/slices/inventory-filter-slice'

const QUALITY_FILTERS: { id: InventoryFilterQuality; label: string; color?: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'legendary', label: 'Легенда', color: 'text-amber-400' },
  { id: 'masterpiece', label: 'Шедевр', color: 'text-purple-400' },
  { id: 'excellent', label: 'Отличное', color: 'text-blue-400' },
  { id: 'good', label: 'Хорошее', color: 'text-green-400' },
]

const DAMAGE_FILTERS: { id: InventoryFilterDamage; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'damaged', label: 'Поврежд.' },
  { id: 'undamaged', label: 'Целые' },
]

export function InventoryFilterBar(props: { className?: string }) {
  const { className } = props
  const { sortBy, filterQuality, filterDamage, setSortBy, setFilterQuality, setFilterDamage } =
    useInventoryFilter()

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <div className="flex items-center gap-1 text-xs text-stone-500">
        <Filter className="w-3 h-3" />
        <span>Качество:</span>
      </div>
      {QUALITY_FILTERS.map((f) => (
        <Button
          key={f.id}
          type="button"
          variant={filterQuality === f.id ? 'default' : 'outline'}
          size="sm"
          className={cn(
            'h-7 text-xs',
            filterQuality === f.id
              ? 'bg-amber-800 text-amber-100'
              : 'border-stone-600 text-stone-400',
            f.color && filterQuality !== f.id ? f.color : ''
          )}
          onClick={() => setFilterQuality(f.id)}
        >
          {f.label}
        </Button>
      ))}
      <div className="flex items-center gap-1 text-xs text-stone-500 ml-1">
        <span>Состояние:</span>
      </div>
      {DAMAGE_FILTERS.map((f) => (
        <Button
          key={f.id}
          type="button"
          variant={filterDamage === f.id ? 'default' : 'outline'}
          size="sm"
          className={cn(
            'h-7 text-xs',
            filterDamage === f.id
              ? 'bg-amber-800 text-amber-100'
              : 'border-stone-600 text-stone-400'
          )}
          onClick={() => setFilterDamage(f.id)}
        >
          {f.label}
        </Button>
      ))}
      <div className="ml-auto flex items-center gap-1 min-h-[44px] sm:min-h-0">
        <SortAsc className="w-3 h-3 text-stone-500 shrink-0" />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as InventorySortBy)}
          className="min-h-[44px] sm:min-h-0 bg-stone-800 border border-stone-600 rounded px-2 py-2 sm:py-1 text-xs text-stone-300"
        >
          <option value="power">По мощи</option>
          <option value="date">По дате</option>
          <option value="quality">По качеству</option>
          <option value="durability">По прочности</option>
        </select>
      </div>
    </div>
  )
}
