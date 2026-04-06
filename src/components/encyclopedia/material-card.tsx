/**
 * Карточка материала для энциклопедии
 */

'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  type MaterialNode,
  getMaterialRarity,
  RARITY_COLORS,
  RARITY_BG_COLORS,
  RARITY_LABELS,
  getDisplayCategory,
  MATERIAL_CATEGORIES,
  type MaterialKnowledge,
  getKnowledgeThreshold,
  KNOWLEDGE_LABELS,
  calculateExpertiseImpact,
} from '@/types/materials'
import {
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  Package,
  Target,
} from 'lucide-react'
import { MaterialDisplayIcon } from '@/components/ui/material-display-icon'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/store/game-store-composed'
import { getStudyTechniquesForMaterial } from '@/data/material-study-techniques'
import {
  MIN_MATERIAL_EXPERTISE_FOR_CRAFT,
  MATERIAL_STUDY_MAX_WORKERS_ON_STUDY,
} from '@/lib/store-utils/constants'
import {
  formatStudyDurationMinutes,
  getMaterialStudyExpertiseGainRangeLabel,
  resolveStudyDurationMs,
} from '@/lib/materials/material-study-balance'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { encyclopediaCraftBonusTooltips } from '@/lib/encyclopedia/encyclopedia-craft-bonus-tooltips'

function formatRemainHuman(totalSec: number): string {
  const sec = Math.max(0, totalSec)
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h} ч ${m} мин`
  if (m > 0) return `${m} мин ${s} с`
  return `${s} с`
}

function CraftImpactTooltipRow({
  icon,
  label,
  value,
  tooltipKey,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  tooltipKey: keyof typeof encyclopediaCraftBonusTooltips
}) {
  const { title, body } = encyclopediaCraftBonusTooltips[tooltipKey]
  const titleAttr = `${title}. ${body}`

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="flex items-center gap-1 min-w-0 cursor-help rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
          title={titleAttr}
        >
          {icon}
          <span className="text-stone-400 shrink-0">{label}</span>
          <span className="truncate">{value}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-balance">
        <p className="font-medium text-stone-100 mb-1">{title}</p>
        <p className="text-stone-300 leading-snug">{body}</p>
      </TooltipContent>
    </Tooltip>
  )
}

interface MaterialCardProps {
  material: MaterialNode
  knowledge?: MaterialKnowledge
  onClick?: () => void
}

export function MaterialCard({ material, knowledge, onClick }: MaterialCardProps) {
  const materialStudySessions = useGameStore(s => s.materialStudySessions)
  const startMaterialStudy = useGameStore(s => s.startMaterialStudy)
  const cancelMaterialStudy = useGameStore(s => s.cancelMaterialStudy)
  const workers = useGameStore(s => s.workers)
  const getMaterialStudySlotCapacity = useGameStore(s => s.getMaterialStudySlotCapacity)
  const [techniquePick, setTechniquePick] = useState<string | null>(null)
  const [assistWorkerIds, setAssistWorkerIds] = useState<string[]>([])
  const [studyRemainSec, setStudyRemainSec] = useState(0)
  const studyEndRef = useRef(0)
  /** Панель изучения по умолчанию свёрнута; прогресс при активной сессии показываем компактно. */
  const [studyPanelOpen, setStudyPanelOpen] = useState(false)

  const rarity = getMaterialRarity(material.economy)
  const displayCategory = getDisplayCategory(material)
  const categoryInfo = MATERIAL_CATEGORIES.find(c => c.id === displayCategory)

  const expertise = knowledge?.expertise || 0
  const threshold = getKnowledgeThreshold(expertise)
  const thresholdLabel = KNOWLEDGE_LABELS[threshold]
  const impact = calculateExpertiseImpact(material, expertise)

  // Что показывать
  const showBasic = expertise >= 10
  const showApplied = expertise >= 30
  const showStrengths = expertise >= 50
  const showDetails = expertise >= 75

  const undiscovered = expertise < 1
  const mid = material.identity.id
  const studyTechniques = useMemo(() => getStudyTechniquesForMaterial(mid), [mid])
  const activeStudy = materialStudySessions.find(
    s => s.materialId === mid && s.status === 'running'
  )
  const forgeReady = expertise >= MIN_MATERIAL_EXPERTISE_FOR_CRAFT
  const canStudySection =
    !undiscovered && studyTechniques.length > 0 && expertise < 100
  const expertiseGainHint = getMaterialStudyExpertiseGainRangeLabel()
  const studySlotCapacity = getMaterialStudySlotCapacity()
  const runningStudies = materialStudySessions.filter(s => s.status === 'running').length
  const restWorkers = workers.filter(w => w.assignment === 'rest')

  const toggleAssistWorker = (wid: string) => {
    setAssistWorkerIds(prev => {
      if (prev.includes(wid)) return prev.filter(id => id !== wid)
      if (prev.length >= MATERIAL_STUDY_MAX_WORKERS_ON_STUDY) return prev
      return [...prev, wid]
    })
  }

  useEffect(() => {
    if (!studyPanelOpen || activeStudy) return
    setTechniquePick(prev => {
      if (prev && studyTechniques.some(t => t.id === prev)) return prev
      return studyTechniques[0]?.id ?? null
    })
  }, [studyPanelOpen, activeStudy, studyTechniques])

  useEffect(() => {
    if (!activeStudy) return
    studyEndRef.current = activeStudy.endTime
    // Таймер только по id/endTime сессии; полный объект activeStudy меняется каждый рендер.
    const tick = () => {
      setStudyRemainSec(Math.max(0, Math.ceil((studyEndRef.current - Date.now()) / 1000)))
    }
    const id = window.setInterval(tick, 500)
    const t0 = window.setTimeout(tick, 0)
    return () => {
      window.clearInterval(id)
      window.clearTimeout(t0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- см. комментарий выше
  }, [activeStudy?.id, activeStudy?.endTime])

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg',
        RARITY_BG_COLORS[rarity],
        'border',
        undiscovered && 'ring-1 ring-stone-600/40'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className={cn('text-lg', RARITY_COLORS[rarity])}>
              {material.identity.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {categoryInfo?.label || 'Другое'}
              </Badge>
              <Badge
                variant="outline"
                className={cn('text-xs', RARITY_COLORS[rarity])}
              >
                {RARITY_LABELS[rarity]}
              </Badge>
              {material.identity.origin !== 'natural' && (
                <Badge variant="outline" className="text-xs text-purple-400">
                  {material.identity.origin === 'refined' && 'Очищен'}
                  {material.identity.origin === 'alloy' && 'Сплав'}
                  {material.identity.origin === 'composite' && 'Композит'}
                </Badge>
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-lg bg-stone-800/50 flex items-center justify-center overflow-hidden">
            <MaterialDisplayIcon catalogMaterialId={material.identity.id} size="lg" title={material.identity.name} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {undiscovered && (
          <p className="text-sm text-stone-500 leading-snug">
            <span className="text-stone-400 font-medium">Не изучено.</span>{' '}
            Используйте материал в крафте или добудьте в мире, чтобы открыть сведения.
          </p>
        )}

        {/* Прогресс экспертизы */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-stone-400">Экспертиза</span>
            <span className="text-stone-300">{Math.round(expertise)}%</span>
          </div>
          <Progress value={expertise} className="h-2" />
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-stone-500">{thresholdLabel}</span>
            {material.identity.id === 'coal' && (
              <span className="text-xs text-orange-400">Огонь</span>
            )}
          </div>
        </div>

        {/* Влияние на крафт (если есть экспертиза) */}
        {expertise > 0 && (
          <div>
            <p className="text-xs text-stone-500 mb-2">Бонусы к крафту:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <CraftImpactTooltipRow
                tooltipKey="speed"
                icon={<Clock className="w-3 h-3 text-blue-400 shrink-0" aria-hidden />}
                label="Скорость:"
                value={
                  <span className="text-green-400">
                    -{Math.round((1 - impact.timeMultiplier) * 100)}%
                  </span>
                }
              />
              <CraftImpactTooltipRow
                tooltipKey="reliability"
                icon={<AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" aria-hidden />}
                label="Надёжность:"
                value={
                  <span className="text-green-400">
                    -{Math.round((1 - impact.defectRiskMultiplier) * 100)}%
                  </span>
                }
              />
              <CraftImpactTooltipRow
                tooltipKey="mastery"
                icon={<Package className="w-3 h-3 text-purple-400 shrink-0" aria-hidden />}
                label="Мастерство:"
                value={
                  <span className="text-green-400">
                    -{Math.round((1 - impact.materialWasteMultiplier) * 100)}%
                  </span>
                }
              />
              <CraftImpactTooltipRow
                tooltipKey="accuracy"
                icon={<Target className="w-3 h-3 text-cyan-400 shrink-0" aria-hidden />}
                label="Точность:"
                value={
                  <span className="text-cyan-400">
                    {Math.round(impact.predictionAccuracy)}%
                  </span>
                }
              />
            </div>
          </div>
        )}

        {/* Базовое описание */}
        {showBasic && (
          <p className="text-sm text-stone-400 line-clamp-2">
            {material.summary.basic}
          </p>
        )}

        {/* Применение */}
        {showApplied && (
          <div className="text-xs">
            <span className="text-stone-500">Применение: </span>
            <span className="text-stone-300">{material.summary.applied}</span>
          </div>
        )}

        {/* Плюсы/минусы */}
        {showStrengths && (
          <div className="space-y-1">
            {material.summary.strengths.slice(0, 2).map((strength: string, i: number) => (
              <div key={i} className="flex items-center gap-1 text-xs">
                <TrendingUp className="w-3 h-3 text-green-400 shrink-0" />
                <span className="text-green-300">{strength}</span>
              </div>
            ))}
            {material.summary.weaknesses.slice(0, 1).map((weakness: string, i: number) => (
              <div key={i} className="flex items-center gap-1 text-xs">
                <TrendingDown className="w-3 h-3 text-red-400 shrink-0" />
                <span className="text-red-300">{weakness}</span>
              </div>
            ))}
          </div>
        )}

        {/* Детальные свойства */}
        {canStudySection && (
          <div className="text-left space-y-2" onClick={e => e.stopPropagation()}>
            {!studyPanelOpen && !activeStudy && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-full border-amber-700/50 text-amber-200/90 hover:bg-amber-950/40"
                onClick={e => {
                  e.stopPropagation()
                  setStudyPanelOpen(true)
                }}
              >
                Изучение
              </Button>
            )}

            {activeStudy && !studyPanelOpen && (
              <button
                type="button"
                className="w-full rounded-md border border-amber-800/50 bg-stone-900/50 px-3 py-2 text-left text-xs text-stone-300 hover:bg-stone-900/80"
                onClick={e => {
                  e.stopPropagation()
                  setStudyPanelOpen(true)
                }}
              >
                <span className="flex items-center gap-2 text-amber-400/90">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>Идёт изучение · осталось {formatRemainHuman(studyRemainSec)}</span>
                </span>
                <span className="mt-1 block text-stone-500">Нажмите, чтобы развернуть</span>
              </button>
            )}

            {studyPanelOpen && (
              <div className="rounded-md border border-stone-700 bg-stone-900/40 p-3 space-y-2 text-left">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-amber-200/90">Изучить материал</p>
                  <button
                    type="button"
                    className="text-[10px] uppercase tracking-wide text-stone-500 hover:text-stone-400"
                    onClick={e => {
                      e.stopPropagation()
                      setStudyPanelOpen(false)
                    }}
                  >
                    Свернуть
                  </button>
                </div>
                <p className="text-[11px] text-stone-500">
                  Слоты изучения: {runningStudies}/{studySlotCapacity} (ещё слоты за уровни зданий).
                </p>
                {!forgeReady && (
                  <p className="text-xs text-stone-500">
                    Для кузницы нужно не менее {MIN_MATERIAL_EXPERTISE_FOR_CRAFT}% экспертизы.
                  </p>
                )}
                {activeStudy ? (
                  <div className="text-xs text-stone-400 space-y-1">
                    <p className="text-amber-400/90">Идёт изучение…</p>
                    <p>Осталось: {formatRemainHuman(studyRemainSec)}</p>
                    <ul className="mt-1 max-h-20 overflow-y-auto text-stone-500 space-y-0.5 border-t border-stone-800 pt-1">
                      {activeStudy.log.slice(-5).map((line, i) => (
                        <li key={`${line.ts}-${i}`}>{line.message}</li>
                      ))}
                    </ul>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full mt-2 border-red-900/50 text-red-300/90 hover:bg-red-950/40"
                      onClick={e => {
                        e.stopPropagation()
                        cancelMaterialStudy(activeStudy.id)
                      }}
                    >
                      Прервать (частичный прогресс)
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-[11px] text-stone-500">
                      По завершении: случайно {expertiseGainHint} к экспертизе (макс. 100%); возможна
                      неудача с малым приростом. Отмена частично сохраняет прогресс.
                    </p>
                    {restWorkers.length > 0 && (
                      <div className="text-[11px] text-stone-400 space-y-1 border border-stone-800 rounded-md p-2">
                        <p className="text-stone-500">Помощники (отдых, до {MATERIAL_STUDY_MAX_WORKERS_ON_STUDY} чел.) — ускоряют сессию:</p>
                        <div className="flex flex-wrap gap-2">
                          {restWorkers.map(w => (
                            <label
                              key={w.id}
                              className="flex items-center gap-1 cursor-pointer text-stone-300"
                            >
                              <input
                                type="checkbox"
                                checked={assistWorkerIds.includes(w.id)}
                                onChange={() => toggleAssistWorker(w.id)}
                              />
                              <span className="truncate max-w-[140px]" title={w.name}>
                                {w.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      {studyTechniques.map(t => {
                        const plannedMs = resolveStudyDurationMs(t.durationMs)
                        return (
                          <label
                            key={t.id}
                            className="flex items-start gap-2 text-xs text-stone-300 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`study-${mid}`}
                              checked={techniquePick === t.id}
                              onChange={() => setTechniquePick(t.id)}
                              className="mt-0.5"
                            />
                            <span>
                              <span className="font-medium text-stone-200">{t.name}</span>
                              <span className="text-stone-500">
                                {' '}
                                (~{formatStudyDurationMinutes(plannedMs)}, расход:{' '}
                                {t.materialCosts.map(c => `${c.materialId}×${c.quantity}`).join(', ')})
                              </span>
                            </span>
                          </label>
                        )
                      })}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="w-full mt-1"
                      disabled={!techniquePick}
                      onClick={e => {
                        e.stopPropagation()
                        if (techniquePick) {
                          startMaterialStudy(
                            mid,
                            techniquePick,
                            assistWorkerIds.length ? assistWorkerIds : undefined
                          )
                          setAssistWorkerIds([])
                        }
                      }}
                    >
                      Начать изучение
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {showDetails && (
          <details className="text-xs">
            <summary className="cursor-pointer text-stone-500 hover:text-stone-400">
              Детальные свойства
            </summary>
            <div className="mt-2 space-y-1 border-l-2 border-stone-700 pl-2">
              <div className="flex justify-between">
                <span className="text-stone-500">Твёрдость:</span>
                <span className="text-stone-300">{material.physical.hardness}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Прочность:</span>
                <span className="text-stone-300">{material.physical.toughness}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Обрабатываемость:</span>
                <span className="text-stone-300">{material.processing.workability}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Магия:</span>
                <span className="text-stone-300">{material.arcane.conductivity}</span>
              </div>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  )
}

export default MaterialCard
