/**
 * Craft Progress V2
 * Сегментированный прогресс-бар для крафта
 * 
 * @see docs/CRAFT_SYSTEM_CONCEPT.md - секция 5.6
 */

'use client'

import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Loader2,
  Clock,
  ChevronDown,
  ChevronUp,
  Flame,
  Hammer,
  Wrench,
  Package,
  Sparkles,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CraftLineStrip } from './craft-line-strip'
import {
  buildCraftLineFromPlanWithRecipe,
  craftLineCaptionAtOverallProgress,
} from '@/lib/craft/build-craft-line'
import { getRecipeById } from '@/data/recipes/index'
import { isCraftLineBackboneSegment } from '@/types/craft-line'

import type { ActiveCraftV2, CraftStageInstance, StageCategory } from '@/types/craft-v2'

// ================================
// КОНСТАНТЫ
// ================================

/** Согласовано с фазами крафтовой линии: подготовка ↔ teal, «тело» процесса ↔ amber/orange, финиш ↔ фиолет. */
const CATEGORY_COLORS: Record<StageCategory, string> = {
  preparation: 'bg-emerald-500',
  processing: 'bg-amber-500',
  forming: 'bg-orange-600',
  assembly: 'bg-sky-500',
  finishing: 'bg-fuchsia-600',
}

const CATEGORY_NAMES: Record<StageCategory, string> = {
  preparation: 'Подготовка',
  processing: 'Обработка',
  forming: 'Формовка',
  assembly: 'Сборка',
  finishing: 'Отделка',
}

const CATEGORY_ICONS: Record<StageCategory, React.ReactNode> = {
  preparation: <Flame className="w-4 h-4" />,
  processing: <Wrench className="w-4 h-4" />,
  forming: <Hammer className="w-4 h-4" />,
  assembly: <Package className="w-4 h-4" />,
  finishing: <Sparkles className="w-4 h-4" />,
}

// ================================
// ПОДКОМПОНЕНТЫ
// ================================

/** Одиночный сегмент прогресс-бара */
function ProgressSegment({
  stage,
  index,
  totalDuration,
  isCompleted,
  isInProgress,
}: {
  stage: CraftStageInstance
  index: number
  totalDuration: number
  isCompleted: boolean
  isInProgress: boolean
}) {
  // Ширина сегмента относительно общей длительности
  const widthPercent = useMemo(() => {
    return (stage.calculatedDuration / totalDuration) * 100
  }, [stage.calculatedDuration, totalDuration])
  
  const category = stage.category as StageCategory
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            "h-8 relative group cursor-pointer transition-all",
            "border-r border-stone-900 last:border-r-0",
            isInProgress && "ring-2 ring-amber-400 ring-offset-1 ring-offset-stone-900"
          )}
          style={{ 
            width: `${widthPercent}%`,
            transformOrigin: 'left',
          }}
        >
          {/* Фон сегмента */}
          <div
            className={cn(
              "absolute inset-0 transition-colors",
              isCompleted 
                ? CATEGORY_COLORS[category]
                : isInProgress
                  ? `${CATEGORY_COLORS[category]} opacity-70`
                  : "bg-stone-700"
            )}
          />
          
          {/* Прогресс внутри сегмента (для текущего этапа) */}
          {isInProgress && (
            <motion.div
              className={cn("absolute inset-y-0 left-0", CATEGORY_COLORS[category])}
              initial={{ width: 0 }}
              animate={{ width: `${stage.progress}%` }}
              transition={{ duration: 0.3 }}
            />
          )}
          
          {/* Иконка статуса */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-white" />
            ) : isInProgress ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Circle className="w-3 h-3 text-stone-500" />
            )}
          </div>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-semibold">{stage.name}</p>
          <p className="text-xs text-stone-400">{CATEGORY_NAMES[category]}</p>
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-3 h-3" />
            <span>{stage.calculatedDuration} сек</span>
          </div>
          {isInProgress && (
            <p className="text-amber-400 font-medium">
              {stage.progress.toFixed(0)}% выполнено
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

/** Карточка текущего этапа */
function CurrentStageCard({
  stage,
  craftLineCaption,
  hideItalicCaption,
}: {
  stage: CraftStageInstance
  /** Не показывать цитату, если подпись уже выведена над полосой («Сейчас: …»). */
  craftLineCaption?: string | null
  hideItalicCaption?: boolean
}) {
  const category = stage.category as StageCategory
  const flavorQuote = craftLineCaption ?? stage.startMessage

  const iconSurface: Record<StageCategory, string> = {
    preparation: 'bg-emerald-500/25 text-emerald-200',
    processing: 'bg-amber-500/25 text-amber-200',
    forming: 'bg-orange-600/25 text-orange-200',
    assembly: 'bg-sky-500/25 text-sky-200',
    finishing: 'bg-fuchsia-600/25 text-fuchsia-200',
  }

  return (
    <Card className="bg-stone-800/50 border-stone-700">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={cn('p-2 rounded-lg', iconSurface[category])}>
            {CATEGORY_ICONS[category]}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-stone-200">{stage.name}</p>
            <p className="text-xs text-stone-500">{CATEGORY_NAMES[category]}</p>
          </div>
          <Badge variant="outline" className="bg-stone-700">
            {stage.progress.toFixed(0)}%
          </Badge>
        </div>
        
        {/* Прогресс бар */}
        <div className="relative h-3 bg-stone-700 rounded-full overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full", CATEGORY_COLORS[category])}
            initial={{ width: 0 }}
            animate={{ width: `${stage.progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        
        {!hideItalicCaption && flavorQuote ? (
          <p className="mt-2 text-sm text-stone-400 italic">«{flavorQuote}»</p>
        ) : null}
      </CardContent>
    </Card>
  )
}

/** Лог завершённых этапов */
function CompletedStagesLog({ 
  stages, 
  isExpanded,
  onToggle 
}: { 
  stages: CraftStageInstance[]
  isExpanded: boolean
  onToggle: () => void
}) {
  const completedCount = stages.filter(s => s.status === 'completed').length
  
  return (
    <Card className="bg-stone-900/50 border-stone-700">
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between hover:bg-stone-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span className="font-medium text-stone-200">
            Завершено: {completedCount}/{stages.length}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-stone-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-stone-400" />
        )}
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <ScrollArea className="h-48">
              <div className="p-3 pt-0 space-y-1">
                {stages.map((stage, index) => (
                  <div
                    key={stage.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded",
                      stage.status === 'completed'
                        ? "bg-stone-800/50"
                        : "bg-stone-900/30"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      stage.status === 'completed'
                        ? CATEGORY_COLORS[stage.category as StageCategory]
                        : "bg-stone-700 text-stone-500"
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm truncate",
                        stage.status === 'completed' ? "text-stone-300" : "text-stone-500"
                      )}>
                        {stage.name}
                      </p>
                    </div>
                    {stage.status === 'completed' && (
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

// ================================
// ОСНОВНОЙ КОМПОНЕНТ
// ================================

interface CraftProgressProps {
  activeCraft: ActiveCraftV2
  onCancel?: () => void
  onInstantComplete?: () => void // Тестовая функция мгновенного завершения
  /** Верхняя «Отмена» (как раньше в контейнере при переданном `onBack`) */
  onCancelHeader?: () => void
}

export function CraftProgress({
  activeCraft,
  onCancel,
  onInstantComplete,
  onCancelHeader,
}: CraftProgressProps) {
  const [showLog, setShowLog] = useState(false)
  
  const currentStage = useMemo(() => {
    return activeCraft.stages[activeCraft.currentStageIndex]
  }, [activeCraft.stages, activeCraft.currentStageIndex])
  
  const overallProgress = useMemo(() => {
    return (activeCraft.elapsedTime / (activeCraft.totalDuration * 1000)) * 100
  }, [activeCraft.elapsedTime, activeCraft.totalDuration])

  const lineProgress01 = useMemo(() => {
    const d = activeCraft.totalDuration * 1000
    if (d <= 0) return 0
    return Math.min(1, Math.max(0, activeCraft.elapsedTime / d))
  }, [activeCraft.elapsedTime, activeCraft.totalDuration])

  const recipe = useMemo(() => getRecipeById(activeCraft.plan.recipeId), [activeCraft.plan.recipeId])

  const craftLineSegments = useMemo(
    () => buildCraftLineFromPlanWithRecipe(activeCraft.plan, recipe),
    [activeCraft.plan, recipe],
  )

  const craftLineCaption = useMemo(
    () => craftLineCaptionAtOverallProgress(craftLineSegments, lineProgress01),
    [craftLineSegments, lineProgress01],
  )

  /** Линия с хребтом рецепта + техники: один «источник правды» для полосы; без второго ряда из 26 ячеек. */
  const hasBackboneCraftLine = useMemo(
    () => craftLineSegments.some(isCraftLineBackboneSegment),
    [craftLineSegments],
  )

  const timeRemaining = useMemo(() => {
    const remaining = (activeCraft.totalDuration * 1000 - activeCraft.elapsedTime) / 1000
    return Math.max(0, Math.ceil(remaining))
  }, [activeCraft.elapsedTime, activeCraft.totalDuration])
  
  // Группируем этапы по категориям
  const categoryGroups = useMemo(() => {
    const groups: Record<StageCategory, CraftStageInstance[]> = {
      preparation: [],
      processing: [],
      forming: [],
      assembly: [],
      finishing: [],
    }
    
    activeCraft.stages.forEach(stage => {
      const category = stage.category as StageCategory
      if (groups[category]) {
        groups[category].push(stage)
      }
    })
    
    return groups
  }, [activeCraft.stages])
  
  const progressHeader = (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Hammer className="w-6 h-6 text-amber-400 animate-pulse shrink-0" />
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-stone-200 leading-tight">
            Крафт в процессе
          </h2>
          <p className="text-sm text-stone-500">
            {activeCraft.stages.filter(s => s.status === 'completed').length} из{' '}
            {activeCraft.stages.length} этапов симуляции
            {hasBackboneCraftLine && craftLineSegments.length > 0 ? (
              <span className="text-stone-600">
                {' '}
                · {craftLineSegments.length} микрошагов на линии
              </span>
            ) : null}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="outline" className="bg-amber-900/30 border-amber-600/50 tabular-nums">
          <Clock className="w-3 h-3 mr-1" />
          {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
        </Badge>
        {onCancelHeader ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-stone-300"
            onClick={onCancelHeader}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Отмена
          </Button>
        ) : null}
      </div>
    </div>
  )

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {craftLineSegments.length > 0 ? (
          <Card className="border-amber-800/45 bg-gradient-to-b from-stone-900/95 to-stone-950 shadow-lg shadow-black/40">
            <CardContent className="space-y-3 p-4 sm:p-5">
              {progressHeader}
              <CraftLineStrip
                segments={craftLineSegments}
                overallProgress01={lineProgress01}
                recipe={recipe}
              />
              <p className="text-[11px] leading-relaxed text-stone-600">
                <span className="font-semibold text-amber-500/90">Крафтовая линия: </span>
                наведите на сегмент — подробности; скобки 【·】 — один блок техники из энциклопедии. Оттенок
                цвета соответствует условной температуре процесса (синий — холодная работа, красно-оранжевый —
                горячая).
              </p>
              {craftLineCaption ? (
                <p className="text-sm font-medium text-amber-200/95" aria-live="polite">
                  Сейчас: {craftLineCaption}
                </p>
              ) : null}
              {hasBackboneCraftLine && currentStage ? (
                <p className="text-xs text-stone-500">
                  Макроэтап симулятора: {activeCraft.currentStageIndex + 1}/{activeCraft.stages.length} —{' '}
                  <span className="text-stone-400">{currentStage.name}</span>
                </p>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          progressHeader
        )}

        {!hasBackboneCraftLine ? (
          <div className="rounded-lg overflow-hidden border border-stone-700">
            <div className="flex">
              {activeCraft.stages.map((stage, index) => (
                <ProgressSegment
                  key={stage.id}
                  stage={stage}
                  index={index}
                  totalDuration={activeCraft.totalDuration}
                  isCompleted={stage.status === 'completed'}
                  isInProgress={stage.status === 'in_progress'}
                />
              ))}
            </div>
          </div>
        ) : null}

        {!hasBackboneCraftLine ? (
          <div className="space-y-1">
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryGroups).map(([category, stages]) => {
                if (stages.length === 0) return null
                const completedInCategory = stages.filter(s => s.status === 'completed').length
                const isCurrentCategory = stages.some(s => s.status === 'in_progress')

                return (
                  <Badge
                    key={category}
                    variant="outline"
                    className={cn(
                      'transition-colors',
                      isCurrentCategory && 'ring-2 ring-amber-400',
                      completedInCategory === stages.length
                        ? 'bg-green-900/30 border-green-600/50'
                        : 'bg-stone-800 border-stone-700'
                    )}
                  >
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full mr-1.5',
                        CATEGORY_COLORS[category as StageCategory]
                      )}
                    />
                    {CATEGORY_NAMES[category as StageCategory]}
                    <span className="ml-1.5 text-stone-500">
                      {completedInCategory}/{stages.length}
                    </span>
                  </Badge>
                )
              })}
            </div>
          </div>
        ) : null}
        
        {/* Текущий этап */}
        {currentStage && (
          <CurrentStageCard
            stage={currentStage}
            craftLineCaption={craftLineCaption}
            hideItalicCaption={hasBackboneCraftLine && craftLineCaption != null && craftLineCaption !== ''}
          />
        )}
        
        {/* Лог этапов */}
        <CompletedStagesLog
          stages={activeCraft.stages}
          isExpanded={showLog}
          onToggle={() => setShowLog(!showLog)}
        />
        
        {/* Общий прогресс */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-400">Общий прогресс</span>
            <span className="font-bold text-amber-400">
              {overallProgress.toFixed(1)}%
            </span>
          </div>
          <Progress value={overallProgress} className="h-2 bg-stone-700" />
        </div>
        
        {/* Тестовые кнопки */}
        {onCancel && (
          <div className="flex gap-2 pt-2 border-t border-stone-700">
            <button
              onClick={onCancel}
              className="flex-1 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-colors border border-red-600/30"
            >
              Отменить крафт
            </button>
            
            {/* Тестовая кнопка мгновенного завершения */}
            {onInstantComplete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onInstantComplete}
                    className="px-3 py-2 text-sm text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 rounded-md transition-colors border border-purple-600/30 flex items-center gap-1"
                  >
                    <Zap className="w-4 h-4" />
                    <span className="hidden sm:inline">Тест: Завершить</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Мгновенно завершить крафт (тестовый режим)</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

export default CraftProgress
