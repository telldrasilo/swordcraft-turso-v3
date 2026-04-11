'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, Construction, Flame, Loader2, Wrench, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  ALTAR_PHASE1_CONSTRUCTION_COAL,
  ALTAR_PHASE1_IRON_ALLOY_EQUIV,
  ALTAR_PHASE1_SMELT_COAL,
} from '@/data/altar/altar-phase-material-balance'
import { altarPhasesConfig } from '@/data/altar/altar-phases-config'
import type { AltarConstructionState, AltarPhase, AltarStage } from '@/types/altar-construction'
import type { ForgottenForgeQuestState } from '@/types/forgotten-forge-quest'
import { getMaterialById } from '@/data/materials'
import { getTechniqueById } from '@/data/techniques'
import {
  canStartAltarPhase,
  getEffectiveUnlockedCraftTechniques,
  isMaterialProcessingTechniqueEffectiveUnlocked,
} from '@/lib/altar/altar-construction-phase'
import { getAltarMaterialSourceTooltipText } from '@/lib/altar/altar-material-source-tooltip'
import { getMaterialProcessingTechniqueById } from '@/data/material-processing-techniques'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  forgottenForgeAllowsStartingAltarPhase,
  getForgottenForgeAltarPhaseBlockHint,
} from '@/lib/altar/altar-quest-gates'
import { INTENDANT_OFFERS } from '@/data/guild/intendant-catalog'
import { coerceAltarPhase } from '@/lib/altar/coerce-altar-phase'
import { cn } from '@/lib/utils'

/** Техники крафта, которые продаёт интендант — для подсказки на карточке фазы. */
const INTENDANT_CRAFT_TECHNIQUE_IDS = new Set(
  INTENDANT_OFFERS.filter((o) => o.kind === 'craft_technique').map((o) => o.targetId)
)

function lockedCraftTechniqueHint(techniqueId: string): string {
  if (INTENDANT_CRAFT_TECHNIQUE_IDS.has(techniqueId)) {
    return 'Нет — купите свиток у интенданта (гильдия → техники крафта)'
  }
  return 'Нет — следуйте указаниям в чате с архивариусом'
}

function phaseRoman(p: AltarPhase): string {
  const names: Record<AltarPhase, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' }
  return names[p]
}

/** Акценты для списка микроэтапов (по индексу) — разнообразнее монохрома. */
const ALTAR_STAGE_ACCENT = [
  { icon: 'text-emerald-400', line: 'text-emerald-300/95' },
  { icon: 'text-sky-400', line: 'text-sky-300/95' },
  { icon: 'text-violet-400', line: 'text-violet-300/95' },
  { icon: 'text-amber-400', line: 'text-amber-200/95' },
  { icon: 'text-rose-400', line: 'text-rose-300/95' },
  { icon: 'text-cyan-400', line: 'text-cyan-300/95' },
] as const

/** Сплошная заливка завершённых сегментов (согласовано с акцентами списка). */
const ALTAR_SEGMENT_DONE_BG = [
  'bg-emerald-800/92',
  'bg-sky-800/92',
  'bg-violet-800/92',
  'bg-amber-700/92',
  'bg-rose-800/92',
  'bg-cyan-800/92',
] as const

function useStageElapsedSec(stageStartTime: number): number {
  const [elapsed, setElapsed] = useState(() =>
    Math.max(0, (Date.now() - stageStartTime) / 1000)
  )
  useEffect(() => {
    const id = window.setInterval(() => {
      setElapsed(Math.max(0, (Date.now() - stageStartTime) / 1000))
    }, 400)
    return () => window.clearInterval(id)
  }, [stageStartTime])
  return elapsed
}

/**
 * Сегментированная полоса фазы: доли по durationSec (как craft/workbench).
 * Косые полосы только в активном сегменте; заливка без скругления, чтобы узор не «ломался».
 */
function AltarPhasedSegmentedBar({
  stages,
  stageIndex,
  elapsedInCurrentStageSec,
  currentDurationSec,
  phaseLabel,
}: {
  stages: AltarStage[]
  stageIndex: number
  elapsedInCurrentStageSec: number
  currentDurationSec: number
  phaseLabel: string
}) {
  const totalSec = useMemo(
    () => stages.reduce((a, s) => a + Math.max(0, s.durationSec), 0),
    [stages]
  )
  const dur = Math.max(1, currentDurationSec)
  const inStagePct = Math.min(100, (elapsedInCurrentStageSec / dur) * 100)
  const stripesPaused = inStagePct >= 99.5

  const ariaLabel = useMemo(() => {
    const cur = stages[stageIndex]
    const name = cur?.name ?? 'этап'
    return `Строительство фазы ${phaseLabel}: микроэтап ${stageIndex + 1} из ${stages.length}, ${name}. Заполнение текущего этапа ${Math.round(inStagePct)}%.`
  }, [stages, stageIndex, phaseLabel, inStagePct])

  if (stages.length === 0) return null

  return (
    <div
      className="flex h-8 w-full overflow-hidden rounded-lg border border-stone-700/80 bg-stone-950"
      role="img"
      aria-label={ariaLabel}
    >
      {stages.map((st, i) => {
        const wPct = totalSec > 0 ? (st.durationSec / totalSec) * 100 : 100 / stages.length
        const done = i < stageIndex
        const cur = i === stageIndex
        const pending = i > stageIndex
        const leftSec = cur ? Math.max(0, Math.ceil(dur - elapsedInCurrentStageSec)) : null

        const segmentBody = (
          <div
            className={cn(
              'relative h-full min-w-0 overflow-hidden border-r border-stone-900 last:border-r-0',
              cur && 'z-10 ring-2 ring-amber-400 ring-inset'
            )}
            style={{ width: `${wPct}%` }}
          >
            {done ? (
              <div
                className={cn('absolute inset-0', ALTAR_SEGMENT_DONE_BG[i % ALTAR_SEGMENT_DONE_BG.length])}
              />
            ) : null}
            {pending ? <div className="absolute inset-0 bg-stone-700" /> : null}
            {cur ? (
              <>
                <div className="absolute inset-0 bg-stone-800" aria-hidden />
                <div
                  className={cn(
                    'altar-construction-fill absolute inset-y-0 left-0 top-0 transition-[width] duration-300 ease-out',
                    stripesPaused && 'altar-construction-fill--paused'
                  )}
                  style={{ width: `${inStagePct}%` }}
                />
              </>
            ) : null}
          </div>
        )

        return (
          <Tooltip key={st.id}>
            <TooltipTrigger asChild>{segmentBody}</TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-balance text-xs">
              <p className="font-medium text-stone-100">{st.name}</p>
              <p className="text-stone-400">
                Длительность: <span className="tabular-nums">{st.durationSec}</span> с
              </p>
              {cur ? (
                <p className="text-amber-200/90">
                  Прогресс: <span className="tabular-nums">{Math.round(inStagePct)}</span>% · осталось ~{' '}
                  <span className="tabular-nums">{leftSec}</span> с
                </p>
              ) : null}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}

/** ETA текущего микроэтапа + сегментированная полоса (один таймер). */
function AltarActivePhaseProgressRows({
  stages,
  stageIndex,
  stageStartTime,
  currentDurationSec,
  phaseRoman,
}: {
  stages: AltarStage[]
  stageIndex: number
  stageStartTime: number
  currentDurationSec: number
  phaseRoman: string
}) {
  const elapsed = useStageElapsedSec(stageStartTime)
  const dur = Math.max(1, currentDurationSec)
  const left = Math.max(0, Math.ceil(dur - elapsed))

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] text-stone-500">
        Этап: <span className="tabular-nums">{currentDurationSec}</span> с · осталось ~{' '}
        <span className="tabular-nums text-amber-200/85">{left}</span> с
      </p>
      <AltarPhasedSegmentedBar
        stages={stages}
        stageIndex={stageIndex}
        elapsedInCurrentStageSec={elapsed}
        currentDurationSec={currentDurationSec}
        phaseLabel={phaseRoman}
      />
    </div>
  )
}

export interface AltarPhaseDetailsPanelProps {
  phase: AltarPhase
  quest: ForgottenForgeQuestState
  altarConstruction: AltarConstructionState
  materialStash: Record<string, number>
  unlockedCraftTechniqueIds: string[]
  unlockedMaterialProcessingTechniqueIds: string[]
  startPhase: (phase: AltarPhase) => boolean
  cancelPhase: () => void
  /** Отладка: микроэтап вперёд (на последнем — завершение фазы). */
  devSkipToNextConstructionStage?: () => void
  /** Отладка: сразу завершить активную фазу. */
  devCompleteConstructionPhase?: () => void
}

export function AltarPhaseDetailsPanel({
  phase,
  quest,
  altarConstruction,
  materialStash,
  unlockedCraftTechniqueIds,
  unlockedMaterialProcessingTechniqueIds,
  startPhase,
  cancelPhase,
  devSkipToNextConstructionStage,
  devCompleteConstructionPhase,
}: AltarPhaseDetailsPanelProps) {
  const cfg = altarPhasesConfig[phase]
  const techSet = getEffectiveUnlockedCraftTechniques(unlockedCraftTechniqueIds)
  const done = altarConstruction.completedPhases.includes(phase)
  const activeNorm = coerceAltarPhase(altarConstruction.activePhase)
  const isActive = activeNorm === phase
  const active = activeNorm
  const questOk = forgottenForgeAllowsStartingAltarPhase(quest, phase)
  const gateHint = getForgottenForgeAltarPhaseBlockHint(quest)
  const simCan = canStartAltarPhase({
    phase,
    materialStash,
    unlockedCraftTechniqueIds,
    unlockedMaterialProcessingTechniqueIds,
    construction: altarConstruction,
  })
  const canPress =
    !done && !isActive && active == null && questOk && simCan

  const currentStage = useMemo(() => {
    if (!isActive) return null
    return (
      altarConstruction.activePhaseStages[altarConstruction.activePhaseStageIndex] ?? null
    )
  }, [
    isActive,
    altarConstruction.activePhaseStages,
    altarConstruction.activePhaseStageIndex,
  ])

  const forgeTechIds = cfg.requiredMaterialProcessingTechniqueIds ?? []

  return (
    <TooltipProvider delayDuration={200}>
    <Card className="card-medieval border-stone-800/70 bg-stone-900/45">
      <CardContent className="space-y-5 p-5 md:p-6">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-amber-800/40 bg-amber-950/25">
            <Construction className="size-6 text-amber-400/90" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-lg font-semibold text-amber-100/95 md:text-xl">
              {cfg.roadmapTitle}
            </h3>
            <p className="text-sm leading-relaxed text-stone-400">{cfg.roadmapDescription}</p>
          </div>
        </div>

        {done ? (
          <div className="rounded-lg border border-emerald-900/35 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-100/90">
            Фаза завершена!
          </div>
        ) : null}

        {!done && !isActive ? (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                Материалы для запуска
              </p>
              <ul className="space-y-2 text-sm">
                {Object.entries(cfg.requiredMaterials).map(([mid, need]) => {
                  const have = materialStash[mid] ?? 0
                  const short = have < need
                  const hint = cfg.requiredMaterialDisplayHints?.[mid]
                  const stashNode = getMaterialById(mid)
                  const labelNode = hint ? getMaterialById(hint.labelMaterialId) : stashNode
                  const productName = labelNode?.identity.name ?? mid
                  const stashName = stashNode?.identity.name ?? mid
                  const sourceHint = getAltarMaterialSourceTooltipText(mid)
                  const smeltBlurb = hint
                    ? `Требуется ${hint.producedQuantity} шт. «${productName}» (плавка в кузнице). Со склада списывается «${stashName}»: ${need} ед. `
                    : ''
                  const coalBlurb =
                    phase === 1 && mid === 'coal'
                      ? `Сумма: ${ALTAR_PHASE1_CONSTRUCTION_COAL} ед. на работы площадки и ${ALTAR_PHASE1_SMELT_COAL} ед. на плавку ${ALTAR_PHASE1_IRON_ALLOY_EQUIV} слитков по рецепту кузницы. `
                      : ''
                  return (
                    <Tooltip key={mid}>
                      <TooltipTrigger asChild>
                        <li
                          className={cn(
                            'flex cursor-help flex-wrap items-baseline justify-between gap-2 rounded-md border px-2.5 py-2 border-dashed',
                            short
                              ? 'border-red-900/40 bg-red-950/15'
                              : 'border-stone-800/80 bg-stone-950/25'
                          )}
                        >
                          <div className="min-w-0 text-stone-200">
                            {hint ? (
                              <>
                                <span className="font-medium">
                                  {productName} × {hint.producedQuantity}
                                </span>
                                <span className="mt-0.5 block text-[11px] font-normal text-stone-500">
                                  Учёт: {stashName}
                                </span>
                              </>
                            ) : (
                              <span>{stashNode?.identity.name ?? mid}</span>
                            )}
                          </div>
                          <span
                            className={cn(
                              'shrink-0 tabular-nums',
                              short ? 'font-medium text-red-300' : 'text-stone-400'
                            )}
                          >
                            {short ? '⚠️ ' : null}
                            {have} / {need}
                          </span>
                        </li>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-balance">
                        {coalBlurb}
                        {smeltBlurb}
                        {sourceHint}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </ul>
              <p className="text-xs text-stone-500">
                Нехватает ресурсов — добывайте в экспедициях или приобретайте в магазине гильдии.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  Требуемые техники
                </p>
                <ul className="space-y-2 text-sm">
                  {cfg.requiredTechniques.map((tid) => {
                    const ok = techSet.has(tid)
                    const t = getTechniqueById(tid)
                    const label = t?.name ?? tid
                    return (
                      <li
                        key={tid}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-stone-800/80 bg-stone-950/25 px-2.5 py-2"
                      >
                        <span className="flex items-center gap-2 text-stone-200">
                          <Wrench className="size-3.5 shrink-0 text-amber-600/80" aria-hidden />
                          {label}
                        </span>
                        <span className="text-xs">
                          {ok ? (
                            <span className="font-medium text-emerald-400">✓ Изучена</span>
                          ) : (
                            <span className="text-red-300">❌ {lockedCraftTechniqueHint(tid)}</span>
                          )}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {forgeTechIds.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    Техники горна
                  </p>
                  <ul className="space-y-2 text-sm">
                    {forgeTechIds.map((pid) => {
                      const ok = isMaterialProcessingTechniqueEffectiveUnlocked(
                        pid,
                        unlockedMaterialProcessingTechniqueIds
                      )
                      const pt = getMaterialProcessingTechniqueById(pid)
                      const label = pt?.name ?? pid
                      return (
                        <li
                          key={pid}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-stone-800/80 bg-stone-950/25 px-2.5 py-2"
                        >
                          <span className="flex items-center gap-2 text-stone-200">
                            <Flame className="size-3.5 shrink-0 text-orange-500/85" aria-hidden />
                            {label}
                          </span>
                          <span className="text-xs">
                            {ok ? (
                              <span className="font-medium text-emerald-400">✓ Доступно</span>
                            ) : (
                              <span className="text-red-300">❌ Нет</span>
                            )}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {isActive && altarConstruction.activePhaseStages.length > 0 ? (
          <div className="space-y-2 rounded-lg border border-amber-800/50 bg-stone-950/60 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-stone-200">
                Строительство · фаза {phaseRoman(phase)}
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="gap-1 text-red-300">
                    <X className="size-4" />
                    Отменить
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="card-medieval border-stone-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Отменить строительство?</AlertDialogTitle>
                    <AlertDialogDescription className="text-stone-400">
                      Потраченные материалы не возвращаются. Прогресс микроэтапов текущей фазы
                      сбросится.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Нет</AlertDialogCancel>
                    <AlertDialogAction onClick={() => cancelPhase()}>Да, отменить</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {currentStage ? (
              <>
                <p className="text-xs font-medium text-amber-200/90">
                  Микроэтап {altarConstruction.activePhaseStageIndex + 1} /{' '}
                  {altarConstruction.activePhaseStages.length}
                </p>
                <p className="text-sm text-stone-200">{currentStage.name}</p>
                <AltarActivePhaseProgressRows
                  key={`${altarConstruction.activePhaseStageIndex}-${altarConstruction.activePhaseStageStartTime}`}
                  stages={altarConstruction.activePhaseStages}
                  stageIndex={altarConstruction.activePhaseStageIndex}
                  stageStartTime={altarConstruction.activePhaseStageStartTime}
                  currentDurationSec={currentStage.durationSec}
                  phaseRoman={phaseRoman(phase)}
                />
              </>
            ) : null}

            <ul className="max-h-32 space-y-1 overflow-y-auto text-[11px]">
              {altarConstruction.activePhaseStages.map((st, i) => {
                const stageDone = i < altarConstruction.activePhaseStageIndex
                const cur = i === altarConstruction.activePhaseStageIndex
                const accent = ALTAR_STAGE_ACCENT[i % ALTAR_STAGE_ACCENT.length]
                return (
                  <li key={st.id} className="flex items-start gap-2">
                    {stageDone ? (
                      <CheckCircle className={cn('size-3.5 shrink-0 mt-0.5', accent.icon)} />
                    ) : cur ? (
                      <Loader2 className={cn('size-3.5 shrink-0 mt-0.5 animate-spin', accent.icon)} />
                    ) : (
                      <span
                        className="mt-0.5 size-3.5 shrink-0 rounded-full border border-stone-600 inline-block"
                        aria-hidden
                      />
                    )}
                    <span
                      className={cn(
                        stageDone || cur ? accent.line : 'text-stone-600',
                        cur && 'font-medium'
                      )}
                    >
                      {st.name}
                    </span>
                  </li>
                )
              })}
            </ul>
            {devSkipToNextConstructionStage != null && devCompleteConstructionPhase != null ? (
              <div className="flex flex-wrap gap-2 border-t border-stone-800 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-dashed border-amber-900/50 text-xs text-stone-300"
                  onClick={() => devSkipToNextConstructionStage()}
                >
                  Следующий этап
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-dashed border-amber-900/50 text-xs text-stone-300"
                  onClick={() => devCompleteConstructionPhase()}
                >
                  Закончить фазу
                </Button>
              </div>
            ) : null}
            <p className="border-t border-stone-800 pt-1 text-[10px] text-stone-500">
              При отмене материалы не возвращаются. Сегменты по длительности этапов; косой узор —
              прогресс текущего сегмента.
            </p>
          </div>
        ) : !done ? (
          <div className="flex flex-wrap items-center gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" disabled={!canPress}>
                  Начать фазу {phaseRoman(phase)}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="card-medieval border-stone-700">
                <AlertDialogHeader>
                  <AlertDialogTitle>Начать фазу {phaseRoman(phase)}?</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-2 text-sm text-stone-400">
                      {!questOk && gateHint ? (
                        <p className="text-amber-200/80">{gateHint}</p>
                      ) : null}
                      <p>
                        Списание материалов по таблице фазы (квестовые предметы фазы III не
                        расходуются).
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction disabled={!canPress} onClick={() => startPhase(phase)}>
                    Начать
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {!canPress && !isActive ? (
              <p className="max-w-prose text-xs text-stone-500">
                {!questOk && gateHint
                  ? gateHint
                  : !simCan && active != null
                    ? 'Дождитесь завершения или отмените текущую фазу на её вкладке.'
                    : 'Соберите материалы и изучите техники, чтобы активировать кнопку.'}
              </p>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
    </TooltipProvider>
  )
}
