'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, ArrowDownAZ } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useGameStore, type Resources, type ResourceKey } from '@/store'
import { TooltipProvider } from '@/components/ui/game-tooltip'
import { cn } from '@/lib/utils'
import { rarityColors, getResourceIconInfo, getResourceRarity } from '@/components/ui/resource-icon'
import { MaterialDisplayIcon } from '@/components/ui/material-display-icon'
import { materialById } from '@/data/materials/library'
import type { MaterialNode } from '@/types/materials/material-core'
import { getMaterialRarity } from '@/types/materials/material-core'
import { getMaterialName } from '@/modules/expeditions'
import { getGrantTargetMaterialId } from '@/lib/craft/inventory-check'

type SortKey = 'rarity' | 'quantity' | 'name'
type FilterBucket = 'all' | 'raw' | 'derived'

const RAW_RESOURCE_KEYS = new Set<ResourceKey>([
  'wood',
  'stone',
  'iron',
  'coal',
  'copper',
  'tin',
  'silver',
  'goldOre',
  'mithril',
  'leather',
])

function resourceKeyBucket(k: ResourceKey): 'raw' | 'derived' {
  return RAW_RESOURCE_KEYS.has(k) ? 'raw' : 'derived'
}

function resourceRarityNumeric(key: string): number {
  const info = getResourceIconInfo(key)
  const m: Record<string, number> = {
    common: 12,
    uncommon: 32,
    rare: 52,
    epic: 72,
    legendary: 92,
  }
  return m[info?.rarity ?? 'common'] ?? 12
}

function materialNodeBucket(node: MaterialNode): 'raw' | 'derived' {
  return node.identity.origin === 'natural' ? 'raw' : 'derived'
}

interface StashRow {
  id: string
  name: string
  quantity: number
  rarityScore: number
  rarityLabel: keyof typeof rarityColors
  bucket: 'raw' | 'derived'
  /** Канонический материал для значка/имени (как в ENC и getGrantTargetMaterialId) */
  catalogMaterialId: string | null
  /** Только для строк из `resources`: эмодзи по ResourceKey */
  resourceKeyForIcon: ResourceKey | null
}

function buildRows(resources: Resources, stash: Record<string, number>): StashRow[] {
  const rows: StashRow[] = []

  for (const key of Object.keys(resources) as ResourceKey[]) {
    if (key === 'gold' || key === 'soulEssence') continue
    const q = resources[key]
    if (q <= 0) continue
    const catalogId = getGrantTargetMaterialId(key)
    const catNode = catalogId ? materialById[catalogId] : undefined
    const info = getResourceIconInfo(key)
    const name = catNode?.identity.name ?? info?.name ?? key
    const rarityScore = catNode?.economy.rarity ?? resourceRarityNumeric(key)
    const rarityLabel = catNode
      ? getMaterialRarity(catNode.economy)
      : getResourceRarity(key)
    rows.push({
      id: `res:${key}`,
      name,
      quantity: q,
      rarityScore,
      rarityLabel,
      bucket: resourceKeyBucket(key),
      catalogMaterialId: catalogId,
      resourceKeyForIcon: key,
    })
  }

  for (const [mid, q] of Object.entries(stash)) {
    if (q <= 0) continue
    const node = materialById[mid]
    const name = node?.identity.name ?? getMaterialName(mid)
    const rNum = node?.economy.rarity ?? 0
    const rarityLabel = node ? getMaterialRarity(node.economy) : ('common' as const)

    rows.push({
      id: `mat:${mid}`,
      name,
      quantity: q,
      rarityScore: rNum,
      rarityLabel,
      bucket: node ? materialNodeBucket(node) : 'raw',
      catalogMaterialId: mid,
      resourceKeyForIcon: null,
    })
  }

  return rows
}

function formatQty(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}k`
  return String(Math.floor(n))
}

export function ResourcesScreen() {
  const resources = useGameStore((s) => s.resources)
  const materialStash = useGameStore((s) => s.materialStash)
  const [sortKey, setSortKey] = useState<SortKey>('rarity')
  const [filterBucket, setFilterBucket] = useState<FilterBucket>('all')

  const rows = useMemo(() => buildRows(resources, materialStash), [resources, materialStash])

  const filtered = useMemo(() => {
    let r = rows
    if (filterBucket !== 'all') {
      r = r.filter((x) => x.bucket === filterBucket)
    }
    const out = [...r]
    if (sortKey === 'name') {
      out.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
    } else if (sortKey === 'quantity') {
      out.sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name, 'ru'))
    } else {
      out.sort((a, b) => b.rarityScore - a.rarityScore || b.quantity - a.quantity)
    }
    return out
  }, [rows, sortKey, filterBucket])

  const totalKinds = filtered.length

  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-5">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-amber-200 flex items-center gap-2">
              <Package className="w-7 h-7 text-amber-500" />
              Склад
            </h2>
            <p className="text-sm text-stone-500 mt-1 max-w-xl">
              Названия и значки совпадают с каталогом материалов (экспедиции, плавка, кузница).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filterBucket} onValueChange={(v) => setFilterBucket(v as FilterBucket)}>
              <SelectTrigger className="w-[200px] h-9 bg-stone-900/80 border-stone-600 text-stone-200">
                <SelectValue placeholder="Фильтр" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="raw">Сырьё</SelectItem>
                <SelectItem value="derived">Производные</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
              <SelectTrigger className="w-[200px] h-9 bg-stone-900/80 border-stone-600 text-stone-200">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rarity">По редкости</SelectItem>
                <SelectItem value="quantity">По количеству</SelectItem>
                <SelectItem value="name">По названию</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        <Card className="card-medieval border-stone-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-3">
              <span className="flex items-center gap-1">
                <ArrowDownAZ className="w-3.5 h-3.5" />
                Позиций: {totalKinds}
              </span>
            </div>

            {totalKinds === 0 ? (
              <div className="text-center py-16 text-stone-500 text-sm border border-dashed border-stone-700 rounded-lg">
                Пока пусто. Добывайте в экспедициях и у рабочих — появятся в этой сетке.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filtered.map((row) => {
                  const colors = rarityColors[row.rarityLabel]
                  return (
                    <motion.div
                      key={row.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        'rounded-xl border p-3 flex flex-col gap-1 min-h-[108px]',
                        colors.bg,
                        colors.border,
                        'shadow-sm'
                      )}
                    >
                      <div className="flex justify-center">
                        <MaterialDisplayIcon
                          catalogMaterialId={row.catalogMaterialId}
                          resourceKeyFallback={row.resourceKeyForIcon}
                          size="lg"
                          title={`${row.name}: ${formatQty(row.quantity)}`}
                        />
                      </div>
                      <div className={cn('text-center font-bold text-lg leading-tight', colors.text)}>
                        {formatQty(row.quantity)}
                      </div>
                      <div className="text-center text-[11px] text-stone-400 leading-snug line-clamp-2">
                        {row.name}
                      </div>
                      <div className="mt-auto pt-1 flex justify-center gap-1">
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0 rounded',
                            row.bucket === 'raw'
                              ? 'bg-amber-900/40 text-amber-200/90'
                              : 'bg-violet-900/35 text-violet-200/85'
                          )}
                        >
                          {row.bucket === 'raw' ? 'Сырьё' : 'Произв.'}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
