/**
 * ExpeditionEventLog - Журнал событий экспедиции
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollText, Clock, MapPin, Sparkles, Gem } from 'lucide-react'
import type { ExpeditionEvent } from '@/types/expedition-events'
import type { ExpeditionDevBalanceTweaks } from '@/types/guild'
import type { ContractType } from '@/modules/expeditions/data/missions/_mission-template'
import { getEventById, getLocationById, getMaterialName } from '@/modules/expeditions'
import {
  resolveTemplateLoot,
  applyExpeditionModuleLootMultipliers,
  mergeMaterialGrantList,
} from '@/lib/expedition-event-loot'

interface ExpeditionEventLogProps {
  events: ExpeditionEvent[]
  startedAt: number
  endsAt: number
  isComplete: boolean
  /** Для превью лута по шаблонам событий */
  locationId?: string
  /** Как при завершении миссии — те же множители материалов и золота из событий */
  contractType?: ContractType
  devBalanceTweaks?: ExpeditionDevBalanceTweaks
}

/** Единый нейтральный стиль строки журнала (SPEC §3.4: одна колонка, без «радуги» по типу). */
const LOG_ROW_CLASS =
  'rounded-lg border border-slate-700/70 bg-slate-800/35 hover:bg-slate-800/50'

const EVENT_TYPE_NAMES: Record<string, string> = {
  combat: 'Бой',
  discovery: 'Открытие',
  social: 'Встреча',
  travel: 'Путь',
  danger: 'Угроза',
  rest: 'Отдых',
  mystery: 'Тайна',
  weather: 'Погода',
  treasure: 'Сокровище',
}

function mergeGrants(
  list: Array<{ materialId: string; quantity: number }>
): Array<{ materialId: string; quantity: number }> {
  return mergeMaterialGrantList(list)
}

function getAdjustedLootForEvent(
  event: ExpeditionEvent,
  location: ReturnType<typeof getLocationById> | undefined,
  seed0: number,
  contractType: ContractType | undefined,
  devBalanceTweaks: ExpeditionDevBalanceTweaks | undefined
): { materials: Array<{ materialId: string; quantity: number }>; gold: number } | null {
  const tpl = getEventById(event.id)
  let bonusGold = 0
  let materials: Array<{ materialId: string; quantity: number }> = []

  if (event.moduleLootPreview) {
    materials = event.moduleLootPreview.materialGrants
    bonusGold = event.moduleLootPreview.bonusGold
  } else if (location && tpl) {
    const loot = resolveTemplateLoot(tpl, location, seed0 + event.order)
    materials = mergeGrants(loot.materialGrants)
    bonusGold = loot.bonusGold
  } else {
    return null
  }

  if (contractType) {
    const adj = applyExpeditionModuleLootMultipliers(materials, bonusGold, contractType, devBalanceTweaks)
    return { materials: adj.materialGrants, gold: adj.bonusGold }
  }
  return { materials, gold: bonusGold }
}

export function ExpeditionEventLog({
  events,
  startedAt,
  endsAt,
  isComplete,
  locationId,
  contractType,
  devBalanceTweaks,
}: ExpeditionEventLogProps) {
  const [currentTime, setCurrentTime] = useState(() => Date.now())
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)

  useEffect(() => {
    if (isComplete) return
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [isComplete])

  const sortedEvents = useMemo(() => [...events].sort((a, b) => a.triggeredAt - b.triggeredAt), [events])

  const visibleEvents = useMemo(() => {
    if (isComplete) return sortedEvents
    return sortedEvents.filter((e) => e.triggeredAt <= currentTime)
  }, [sortedEvents, currentTime, isComplete])

  const progress = useMemo(() => {
    if (isComplete) return 100
    const total = endsAt - startedAt
    const elapsed = currentTime - startedAt
    return Math.min(100, Math.max(0, (elapsed / total) * 100))
  }, [currentTime, startedAt, endsAt, isComplete])

  const location = locationId ? getLocationById(locationId) : undefined
  const seed0 = Math.floor(startedAt % 2147483647)

  const runLootForVisible = useMemo(() => {
    let gold = 0
    const mats: Array<{ materialId: string; quantity: number }> = []
    for (const e of visibleEvents) {
      const adj = getAdjustedLootForEvent(e, location, seed0, contractType, devBalanceTweaks)
      if (!adj) continue
      gold += adj.gold
      mats.push(...adj.materials)
    }
    return { materials: mergeGrants(mats), gold }
  }, [visibleEvents, location, seed0, contractType, devBalanceTweaks])

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  const renderLootChips = (materials: Array<{ materialId: string; quantity: number }>, gold: number) => {
    if (materials.length === 0 && gold <= 0) {
      return (
        <span className="text-slate-600">
          Нет начислений из превью (или локация ещё не привязана).
        </span>
      )
    }
    return (
      <div className="flex flex-wrap gap-1.5">
        {gold > 0 && (
          <span className="inline-flex items-center gap-1 rounded-md border border-slate-600/60 bg-slate-800/60 px-2 py-0.5 text-slate-200/90 text-[11px]">
            +{gold} зол.
          </span>
        )}
        {materials.map((g) => (
          <span
            key={g.materialId}
            className="inline-flex items-center gap-1 rounded-md border border-slate-600/50 bg-slate-800/50 px-2 py-0.5 text-slate-200/90 text-[11px]"
          >
            <Gem className="w-3 h-3 flex-shrink-0 opacity-80" />
            {getMaterialName(g.materialId)} ×{g.quantity}
          </span>
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-4">
        <p className="text-slate-500 text-sm text-center">События будут появляться по ходу экспедиции</p>
      </div>
    )
  }

  if (!isComplete && visibleEvents.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/50 overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800/50">
          <h4 className="font-semibold text-slate-200 flex items-center gap-2">
            <ScrollText className="w-4 h-4" />
            Журнал событий
          </h4>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
        {!isComplete && (
          <div className="h-1 bg-slate-800">
            <motion.div
              className="h-full bg-blue-500/70"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
        <div className="max-h-64 overflow-y-auto p-2">
          <div className="text-center py-6 text-xs text-slate-500">
            <MapPin className="w-5 h-5 mx-auto mb-2 opacity-40" />
            <p>Экспедиция в пути...</p>
            <p className="text-slate-600 mt-1">События будут появляться по мере продвижения</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800/50">
        <h4 className="font-semibold text-slate-200 flex items-center gap-2">
          <ScrollText className="w-4 h-4" />
          Журнал событий
        </h4>
        {!isComplete && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{Math.round(progress)}%</span>
          </div>
        )}
      </div>

      {!isComplete && (
        <div className="h-1 bg-slate-800">
          <motion.div
            className="h-full bg-blue-500/70"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}

      <div className="max-h-64 overflow-y-auto p-2 space-y-2">
        <AnimatePresence mode="popLayout">
          {visibleEvents.map((event, index) => {
            const tpl = getEventById(event.id)
            const eventLootDisplay = getAdjustedLootForEvent(
              event,
              location,
              seed0,
              contractType,
              devBalanceTweaks
            )

            return (
              <motion.div
                key={event.instanceId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() =>
                  setExpandedEvent(expandedEvent === event.instanceId ? null : event.instanceId)
                }
                className={`${LOG_ROW_CLASS} p-2.5 cursor-pointer transition-colors`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-900/50 text-lg flex-shrink-0">
                    {event.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-200 leading-snug">{event.text}</p>
                      <span className="text-xs text-slate-500 flex-shrink-0">#{event.order}</span>
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      <span className="text-slate-500">{formatTime(event.triggeredAt)}</span>
                      <span className="px-1.5 py-0.5 rounded text-xs bg-slate-900/50 text-slate-400">
                        {EVENT_TYPE_NAMES[event.type]}
                      </span>
                    </div>
                    {eventLootDisplay &&
                      (eventLootDisplay.materials.length > 0 || eventLootDisplay.gold > 0) && (
                        <div className="mt-2 pt-2 border-t border-slate-700/40">
                          <p className="text-[10px] text-slate-500 mb-1">Находки</p>
                          {renderLootChips(eventLootDisplay.materials, eventLootDisplay.gold)}
                        </div>
                      )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedEvent === event.instanceId && tpl && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 mt-2 border-t border-slate-700/50 text-xs text-slate-300 space-y-2">
                        {tpl.title && (
                          <p className="font-medium text-slate-200">{tpl.title}</p>
                        )}
                        {tpl.description && (
                          <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">
                            {tpl.description}
                          </p>
                        )}
                        {tpl.choices?.length ? (
                          <p className="text-slate-500 text-[11px] leading-relaxed">
                            Итог ветки выбирает искатель; кузнец варианты не выбирает.
                          </p>
                        ) : null}
                        {event.flags?.bossOnly && (
                          <p className="flex items-center gap-1 text-yellow-400">
                            <Sparkles className="w-3 h-3" />
                            Особое событие босс-энкаунтера
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div className="border-t border-slate-700/80 bg-slate-900/80 px-3 py-2.5">
        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
          {contractType ? 'Итог находок (как при завершении)' : 'Найдено по журналу (превью)'}
        </p>
        {renderLootChips(runLootForVisible.materials, runLootForVisible.gold)}
        <p className="text-[10px] text-slate-600 mt-1.5">
          {contractType
            ? 'Сумма по видимым событиям с множителями договора и отладки. Начисление на склад только при успешной миссии.'
            : 'Передайте тип договора для совпадения с начислением при завершении.'}
        </p>
      </div>
    </div>
  )
}

export default ExpeditionEventLog
