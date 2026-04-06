/**
 * Active Expedition Card Component
 * Карточка активной экспедиции
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Sword,
  Clock,
  CheckCircle,
  Undo2,
  TrendingUp,
  FastForward,
  Flag,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useGameStore } from '@/store'
import type { ActiveExpedition } from '@/types/guild'
import type { ExpeditionResult } from '@/store/slices/guild-slice'
import { useState, useEffect } from 'react'

// Импорт журнала событий
import { ExpeditionEventLog } from './expeditions/ExpeditionEventLog'
import { EXPEDITION_SKIP_TIMELINE_UI_ENABLED } from '@/lib/expedition-dev-tools'
import { getMaterialName } from '@/modules/expeditions'

// Импорт функции показа уведомлений
import { showReputationNotification } from './ReputationNotification'

interface ActiveExpeditionCardProps {
  expedition: ActiveExpedition
}

export function ActiveExpeditionCard({ expedition }: ActiveExpeditionCardProps) {
  const completeExpeditionFull = useGameStore((state) => state.completeExpeditionFull)
  const cancelExpedition = useGameStore((state) => state.cancelExpedition)
  const skipExpeditionToNextEvent = useGameStore((state) => state.skipExpeditionToNextEvent)
  const skipExpeditionTimelineToEnd = useGameStore((state) => state.skipExpeditionTimelineToEnd)
  const navigateToForgeTab = useGameStore((state) => state.navigateToForgeTab)

  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [progress, setProgress] = useState<number>(0)
  const [wallNow, setWallNow] = useState(() => Date.now())
  const [showRewards, setShowRewards] = useState(false)
  const [lastResult, setLastResult] = useState<ExpeditionResult | null>(null)
  
  useEffect(() => {
    const totalDuration = expedition.endsAt - expedition.startedAt
    
    const updateTime = () => {
      const now = Date.now()
      setWallNow(now)
      const remaining = Math.max(0, expedition.endsAt - now)
      const elapsed = now - expedition.startedAt
      
      setTimeLeft(remaining)
      setProgress(Math.min(100, Math.max(0, (elapsed / totalDuration) * 100)))
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [expedition.endsAt, expedition.startedAt])
  
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  
  const isComplete = timeLeft === 0

  const sortedEv = expedition.events
    ? [...expedition.events].sort((a, b) => a.triggeredAt - b.triggeredAt)
    : []
  const nextEventAt = !isComplete
    ? sortedEv.find((e) => e.triggeredAt > wallNow)
    : undefined
  
  const handleComplete = () => {
    const result = completeExpeditionFull(expedition.id)
    if (result) {
      // Показываем уведомление о репутации
      if (result.success && result.reputation > 0) {
        showReputationNotification(result.reputation, 'expedition')
      }
      
      setLastResult(result)
      setShowRewards(true)
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className={cn(
        'card-medieval',
        isComplete ? 'border-green-600/50 bg-green-900/20' : 'border-amber-600/30'
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-900/30 flex items-center justify-center text-xl">
                {expedition.expeditionIcon}
              </div>
              <div>
                <h4 className="font-semibold text-stone-200">{expedition.expeditionName}</h4>
                <p className="text-xs text-stone-500">{expedition.adventurerName}</p>
              </div>
            </div>
            {isComplete ? (
              <Badge className="bg-green-800 text-green-100 animate-pulse">
                Завершена!
              </Badge>
            ) : (
              <div className="flex items-center gap-1 text-amber-400">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
          
          <div className="text-sm text-stone-400 mb-2">
            <Sword className="w-4 h-4 inline mr-1" />
            {expedition.weaponName}
          </div>
          
          {/* Журнал событий экспедиции */}
          {expedition.events && expedition.events.length > 0 && (
            <div className="mt-3">
              <ExpeditionEventLog
                events={expedition.events}
                startedAt={expedition.startedAt}
                endsAt={expedition.endsAt}
                isComplete={isComplete}
                locationId={expedition.locationId}
                contractType={expedition.contractType ?? 'exploration'}
                devBalanceTweaks={expedition.devBalanceTweaks}
              />
            </div>
          )}

          {!isComplete ? (
            <>
              {EXPEDITION_SKIP_TIMELINE_UI_ENABLED && (
                <div className="mt-3 flex flex-wrap gap-2 rounded-md border border-dashed border-amber-700/40 bg-stone-950/50 p-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs border-amber-800/50 text-amber-100"
                    disabled={nextEventAt === undefined}
                    onClick={() => skipExpeditionToNextEvent(expedition.id)}
                  >
                    <FastForward className="w-3.5 h-3.5 mr-1" />
                    До следующего события
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs border-amber-800/50 text-amber-100"
                    onClick={() => skipExpeditionTimelineToEnd(expedition.id)}
                  >
                    <Flag className="w-3.5 h-3.5 mr-1" />
                    К концу миссии
                  </Button>
                </div>
              )}
              <Progress value={progress} className="h-2 bg-stone-800 mt-3" />
              <Button
                size="sm"
                variant="ghost"
                className="w-full mt-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                onClick={() => cancelExpedition(expedition.id)}
              >
                <Undo2 className="w-4 h-4 mr-1" />
                Отменить миссию
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                className="w-full bg-green-800 hover:bg-green-700 text-green-100"
                onClick={handleComplete}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Получить награду
              </Button>
              
              {/* Модальное окно с наградами */}
              <AnimatePresence>
                {showRewards && lastResult && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setShowRewards(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-stone-900 border border-stone-700 rounded-xl p-6 max-w-sm w-full shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-center mb-4">
                        {lastResult.success ? (
                          <>
                            <div className="text-4xl mb-2">🎉</div>
                            <h3 className="text-xl font-bold text-green-400">Экспедиция успешна!</h3>
                          </>
                        ) : (
                          <>
                            <div className="text-4xl mb-2">💀</div>
                            <h3 className="text-xl font-bold text-red-400">Экспедиция провалена</h3>
                          </>
                        )}
                      </div>

                      {sortedEv.length > 0 && (
                        <p className="text-[11px] text-stone-500 text-center leading-snug mb-4 px-1">
                          Бонусы из журнала миссии (успех, золото, материалы) уже учтены в значениях ниже — итог собирается при завершении вместе с модульными событиями.
                        </p>
                      )}
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between bg-stone-800/50 rounded-lg p-3">
                          <span className="text-stone-400">Золото</span>
                          <span className="text-lg font-bold text-amber-400">
                            💰 +{lastResult.commission}
                          </span>
                        </div>

                        <div className="flex items-center justify-between bg-stone-800/50 rounded-lg p-3">
                          <span className="text-stone-400">Душа Войны</span>
                          <span className="text-lg font-bold text-purple-400">
                            ⚔️ +{lastResult.warSoul}
                          </span>
                        </div>

                        {lastResult.success && (
                          <div className="flex items-center justify-between bg-green-900/20 rounded-lg p-3 border border-green-600/30">
                            <span className="text-stone-400">Репутация гильдии</span>
                            <span className="text-lg font-bold text-green-400">
                              <TrendingUp className="w-4 h-4 inline mr-1" />
                              +{lastResult.reputation}
                            </span>
                          </div>
                        )}

                        {lastResult.materialsGained && lastResult.materialsGained.length > 0 && (
                          <div className="rounded-lg p-3 border border-emerald-700/40 bg-emerald-950/25">
                            <p className="text-xs text-emerald-400/90 mb-2">Материалы на склад</p>
                            <ul className="text-sm text-stone-300 space-y-1 max-h-32 overflow-y-auto">
                              {lastResult.materialsGained.map((g) => (
                                <li key={g.materialId} className="flex justify-between gap-2">
                                  <span>{getMaterialName(g.materialId)}</span>
                                  <span className="text-emerald-300 tabular-nums">×{g.quantity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center justify-between bg-stone-800/50 rounded-lg p-3">
                          <span className="text-stone-400">Слава гильдии</span>
                          <span className="text-lg font-bold text-blue-400">
                            ⭐ +{lastResult.glory}
                          </span>
                        </div>
                        
                        {!lastResult.weaponLost && (
                          <div className="flex items-center justify-between bg-stone-800/50 rounded-lg p-3">
                            <span className="text-stone-400">Износ оружия</span>
                            <span className="text-lg font-bold text-yellow-400">
                              🔧 -{lastResult.weaponWear}%
                            </span>
                          </div>
                        )}

                        {!lastResult.weaponLost &&
                          lastResult.damageTagLabelsApplied &&
                          lastResult.damageTagLabelsApplied.length > 0 && (
                            <div className="rounded-lg border border-amber-800/45 bg-amber-950/25 p-3">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                                <div className="min-w-0">
                                  <p className="text-xs text-amber-200/95 font-medium mb-1">
                                    Заметные повреждения клинка
                                  </p>
                                  <p className="text-xs text-stone-400 leading-snug">
                                    {lastResult.damageTagLabelsApplied.join(' · ')}
                                  </p>
                                  <Button
                                    type="button"
                                    variant="link"
                                    className="h-auto p-0 mt-2 text-xs text-amber-400/95"
                                    onClick={() => {
                                      setShowRewards(false)
                                      navigateToForgeTab('repair')
                                    }}
                                  >
                                    Открыть вкладку «Ремонт» в кузнице
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        
                        {lastResult.weaponLost && (
                          <div className="flex items-center justify-between bg-red-900/30 rounded-lg p-3 border border-red-600/50">
                            <span className="text-red-400">Оружие потеряно!</span>
                            <span className="text-2xl">💔</span>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        className="w-full bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700"
                        onClick={() => setShowRewards(false)}
                      >
                        Продолжить
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
