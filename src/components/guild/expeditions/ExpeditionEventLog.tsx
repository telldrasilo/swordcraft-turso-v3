/**
 * ExpeditionEventLog - Отображение событий экспедиции
 * Показывает события в хронологическом порядке с анимацией
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollText, Clock, MapPin, Sparkles } from 'lucide-react'
import type { ExpeditionEvent } from '@/types/expedition-events'

interface ExpeditionEventLogProps {
  events: ExpeditionEvent[]
  startedAt: number
  endsAt: number
  isComplete: boolean
}

// Цвета для разных типов событий
const EVENT_TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  combat: { bg: 'bg-red-900/30', border: 'border-red-700/50', text: 'text-red-300' },
  discovery: { bg: 'bg-blue-900/30', border: 'border-blue-700/50', text: 'text-blue-300' },
  social: { bg: 'bg-green-900/30', border: 'border-green-700/50', text: 'text-green-300' },
  travel: { bg: 'bg-amber-900/30', border: 'border-amber-700/50', text: 'text-amber-300' },
  danger: { bg: 'bg-orange-900/30', border: 'border-orange-700/50', text: 'text-orange-300' },
  rest: { bg: 'bg-slate-800/50', border: 'border-slate-600/50', text: 'text-slate-300' },
  mystery: { bg: 'bg-purple-900/30', border: 'border-purple-700/50', text: 'text-purple-300' },
  weather: { bg: 'bg-cyan-900/30', border: 'border-cyan-700/50', text: 'text-cyan-300' },
  treasure: { bg: 'bg-yellow-900/30', border: 'border-yellow-700/50', text: 'text-yellow-300' },
}

// Названия типов на русском
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

export function ExpeditionEventLog({
  events,
  startedAt,
  endsAt,
  isComplete,
}: ExpeditionEventLogProps) {
  const [currentTime, setCurrentTime] = useState(() => Date.now())
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)

  // Обновляем текущее время каждую секунду
  useEffect(() => {
    if (isComplete) return

    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [isComplete])

  // Сортируем события по времени
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => a.triggeredAt - b.triggeredAt)
  }, [events])

  // Определяем, какие события уже произошли
  const visibleEvents = useMemo(() => {
    if (isComplete) return sortedEvents
    return sortedEvents.filter(e => e.triggeredAt <= currentTime)
  }, [sortedEvents, currentTime, isComplete])

  // Прогресс экспедиции
  const progress = useMemo(() => {
    if (isComplete) return 100
    const total = endsAt - startedAt
    const elapsed = currentTime - startedAt
    return Math.min(100, Math.max(0, (elapsed / total) * 100))
  }, [currentTime, startedAt, endsAt, isComplete])

  // Форматирование времени
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  // Пустое состояние - когда экспедиция идёт но событий ещё не было
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-4">
        <p className="text-slate-500 text-sm text-center">
          События будут появляться по ходу экспедиции
        </p>
      </div>
    )
  }

  // Пустое состояние - когда события есть, но ещё ни одно не произошло
  if (!isComplete && visibleEvents.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/50 overflow-hidden">
        {/* Заголовок */}
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

        {/* Прогресс-бар */}
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

        {/* Состояние ожидания */}
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
      {/* Заголовок */}
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

      {/* Прогресс-бар */}
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

      {/* Список событий - только произошедшие */}
      <div className="max-h-64 overflow-y-auto p-2 space-y-2">
        <AnimatePresence mode="popLayout">
          {visibleEvents.map((event, index) => {
            const colors = EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS.travel
            if (!colors) return null
            const { bg, border, text } = colors

            return (
              <motion.div
                key={event.instanceId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setExpandedEvent(
                  expandedEvent === event.instanceId ? null : event.instanceId
                )}
                className={`
                  rounded-lg border p-2.5 cursor-pointer transition-all
                  ${bg} ${border} hover:brightness-110
                `}
              >
                {/* Основная строка */}
                <div className="flex items-start gap-3">
                  {/* Иконка */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    bg-slate-900/50 text-lg flex-shrink-0
                  `}>
                    {event.icon}
                  </div>

                  {/* Контент */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${text} leading-snug`}>
                        {event.text}
                      </p>
                      <span className="text-xs text-slate-500 flex-shrink-0">
                        #{event.order}
                      </span>
                    </div>

                    {/* Мета-информация */}
                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      <span className="text-slate-500">
                        {formatTime(event.triggeredAt)}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-xs bg-slate-900/50 text-slate-400">
                        {EVENT_TYPE_NAMES[event.type]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Развёрнутое описание (если есть) */}
                <AnimatePresence>
                  {expandedEvent === event.instanceId && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 mt-2 border-t border-slate-700/50 text-xs text-slate-400">
                        <p>Событие произошло во время экспедиции.</p>
                        {event.flags?.bossOnly && (
                          <p className="flex items-center gap-1 mt-1 text-yellow-400">
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
    </div>
  )
}

export default ExpeditionEventLog
