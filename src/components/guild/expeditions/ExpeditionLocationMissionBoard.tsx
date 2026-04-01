/**
 * Доска миссий модуля expeditions: до 3 случайных миссий из пула доступных локаций выбранного тира.
 */

'use client'

import { useEffect, useState } from 'react'
import { Shuffle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ExpeditionTemplate } from '@/data/expedition-templates'
import { missionModuleToCalculatorTemplate } from '@/lib/expedition-mission-bridge'
import {
  getAvailableLocations,
  getMissionsForLocation,
} from '@/modules/expeditions'
import { ExpeditionSelectionCard } from './ExpeditionSelectionCard'

const LOCATION_TIERS = [1, 2, 3, 4] as const
export type LocationTierFilter = (typeof LOCATION_TIERS)[number]

function shufflePick<T>(items: T[], count: number): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, Math.min(count, arr.length))
}

export interface ExpeditionLocationMissionBoardProps {
  guildLevel: number
  selectedId: string | null
  canSelectExpedition: (expedition: ExpeditionTemplate) => { can: boolean; reason: string }
  onSelectExpedition: (expedition: ExpeditionTemplate) => void
  /** Сброс выбора, если текущая миссия не входит в новую тройку (смена тира / «другие 3») */
  onSelectedMissionInvalidated?: () => void
}

export function ExpeditionLocationMissionBoard({
  guildLevel,
  selectedId,
  canSelectExpedition,
  onSelectExpedition,
  onSelectedMissionInvalidated,
}: ExpeditionLocationMissionBoardProps) {
  const [tierFilter, setTierFilter] = useState<LocationTierFilter>(1)
  const [poolNonce, setPoolNonce] = useState(0)
  const [picked, setPicked] = useState<ExpeditionTemplate[]>([])

  useEffect(() => {
    const locs = getAvailableLocations(guildLevel).filter((l) => l.tier === tierFilter)
    const templates: ExpeditionTemplate[] = []
    for (const loc of locs) {
      for (const m of getMissionsForLocation(loc.id)) {
        templates.push(missionModuleToCalculatorTemplate(m))
      }
    }
    setPicked(shufflePick(templates, 3))
  }, [guildLevel, tierFilter, poolNonce])

  useEffect(() => {
    if (!selectedId || picked.length === 0) return
    if (!picked.some((p) => p.id === selectedId)) {
      onSelectedMissionInvalidated?.()
    }
  }, [picked, selectedId, onSelectedMissionInvalidated])

  const poolSize = getAvailableLocations(guildLevel)
    .filter((l) => l.tier === tierFilter)
    .reduce((acc, loc) => acc + getMissionsForLocation(loc.id).length, 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-stone-500 uppercase tracking-wide">Тир локаций (тест)</span>
          <div className="flex flex-wrap gap-1">
            {LOCATION_TIERS.map((t) => (
              <Button
                key={t}
                type="button"
                size="sm"
                variant={tierFilter === t ? 'default' : 'outline'}
                className={cn(
                  'h-8 min-w-9 px-2',
                  tierFilter === t && 'bg-amber-700 hover:bg-amber-600 text-stone-100'
                )}
                onClick={() => setTierFilter(t)}
              >
                {t}
              </Button>
            ))}
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="gap-2"
          disabled={poolSize === 0}
          onClick={() => setPoolNonce((n) => n + 1)}
        >
          <Shuffle className="w-3.5 h-3.5" />
          Другие 3 миссии
        </Button>
      </div>

      <p className="text-xs text-stone-500">
        В пуле при уровне гильдии {guildLevel} и тире {tierFilter}: {poolSize} миссий. Показано до 3
        случайных.
      </p>

      {poolSize === 0 ? (
        <p className="text-sm text-stone-500 text-center py-6 border border-dashed border-stone-600/50 rounded-lg">
          Нет доступных локаций этого тира для вашего уровня гильдии.
        </p>
      ) : picked.length === 0 ? (
        <p className="text-sm text-stone-500 text-center py-6">Загрузка…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
          {picked.map((expedition) => {
            const { can, reason } = canSelectExpedition(expedition)
            return (
              <div key={expedition.id} className="flex min-h-0 h-full">
                <ExpeditionSelectionCard
                  expedition={expedition}
                  isSelected={selectedId === expedition.id}
                  canSelect={can}
                  reason={reason}
                  onSelect={() => onSelectExpedition(expedition)}
                  variant="missionBoard"
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
