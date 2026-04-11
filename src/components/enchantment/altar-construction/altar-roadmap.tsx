'use client'

import { Fragment, type ReactNode } from 'react'
import { Check, Lock } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { altarPhasesConfig } from '@/data/altar/altar-phases-config'
import type { AltarPhase } from '@/types/altar-construction'
import type { ForgottenForgeQuestState } from '@/types/forgotten-forge-quest'
import { forgottenForgeAllowsStartingAltarPhase } from '@/lib/altar/altar-quest-gates'

const PHASES: readonly AltarPhase[] = [1, 2, 3, 4, 5]

/** Ромб в сечении — грани задаёт conic-gradient по направлениям граней. */
const RHOMBUS_CLIP = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'

const CONIC_AMETHYST = `conic-gradient(from 45deg,
  #8a2be2 0deg 90deg,
  #b57ced 90deg 180deg,
  #4b1e7a 180deg 270deg,
  #c77dff 270deg 360deg)`

const CONIC_LOCKED = `conic-gradient(from 45deg,
  #3f3f46 0deg 90deg,
  #52525b 90deg 180deg,
  #27272a 180deg 270deg,
  #71717a 270deg 360deg)`

const SPECULAR_GEM = `linear-gradient(145deg,
  rgba(255,255,255,0.32) 0%,
  rgba(255,255,255,0.08) 32%,
  transparent 52%)`

/** Масштаб относительно прежних size-6 / size-7 — под зону клика и тени. */
const DIAMOND_BOX = 'size-[1.95rem] sm:size-[2.275rem]'
const CELL_BOX = 'size-[2.925rem] sm:size-[3.575rem]'
const ROADMAP_ROW_MIN_H = 'min-h-[2.925rem] sm:min-h-[3.575rem]'
const CONNECTOR_W = 'w-[0.65rem] sm:w-[0.975rem]'
const GLYPH_ICON = 'size-[1.625rem]'
const PHASE_TEXT = 'text-[1.1375rem] sm:text-[1.3rem]'

function RoadmapAmethystDiamond({
  completed,
  locked,
  isSelected,
  clickable,
  highlightPulse,
  children,
}: {
  completed: boolean
  locked: boolean
  isSelected: boolean
  clickable: boolean
  highlightPulse: boolean
  children: ReactNode
}) {
  const facetFill = locked ? CONIC_LOCKED : CONIC_AMETHYST

  return (
    <div
      className={cn(
        'relative touch-manipulation',
        DIAMOND_BOX,
        highlightPulse && !locked && !completed && 'motion-safe:animate-pulse',
        locked && 'drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)]',
        !locked &&
          !completed &&
          'drop-shadow-[0_2px_10px_rgba(76,29,149,0.55)]',
        completed && 'drop-shadow-[0_0_4px_rgba(251,191,36,0.55),0_0_10px_rgba(167,139,250,0.35)]',
        isSelected && clickable && !completed && !locked && 'drop-shadow-[0_0_6px_rgba(251,191,36,0.45)]'
      )}
    >
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 transition-opacity duration-300',
          locked && 'opacity-[0.72]'
        )}
        style={{
          clipPath: RHOMBUS_CLIP,
          background: facetFill,
        }}
      />
      {!locked && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            clipPath: RHOMBUS_CLIP,
            background: SPECULAR_GEM,
          }}
        />
      )}
      <span
        className={cn(
          'relative z-10 flex size-full items-center justify-center font-semibold leading-none tabular-nums',
          PHASE_TEXT,
          locked ? 'text-stone-400' : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]'
        )}
      >
        {children}
      </span>
    </div>
  )
}

function phaseRoman(p: AltarPhase): string {
  const names: Record<AltarPhase, string> = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V',
  }
  return names[p]
}

function RoadmapConnector({ leftPhaseCompleted }: { leftPhaseCompleted: boolean }) {
  return (
    <div
      className={cn(
        'pointer-events-none z-0 h-0 min-h-0 shrink-0 self-center border-b-2',
        CONNECTOR_W,
        leftPhaseCompleted
          ? 'border-solid border-amber-500/85'
          : 'border-dashed border-stone-600/75'
      )}
      aria-hidden
    />
  )
}

export interface AltarRoadmapProps {
  quest: ForgottenForgeQuestState
  completedPhases: AltarPhase[]
  activePhase: AltarPhase | null
  selectedPhase: AltarPhase
  onSelectPhase: (phase: AltarPhase) => void
  onLockedClick: () => void
}

export function AltarRoadmap({
  quest,
  completedPhases,
  activePhase,
  selectedPhase,
  onSelectPhase,
  onLockedClick,
}: AltarRoadmapProps) {
  return (
    <div className="w-full py-3 md:py-4">
      {/*
        Нельзя mix overflow-x-auto + overflow-y-visible: по CSS y станет auto → лишний вертикальный скролл.
        Ромб по clip-path вписан в квадрат ячейки; зазор между ячейками — только соединители.
      */}
      <div className="flex w-full justify-center overflow-x-auto overflow-y-hidden">
        <div className={cn('flex items-center justify-center px-1', ROADMAP_ROW_MIN_H)}>
          {PHASES.map((p, index) => {
            const cfg = altarPhasesConfig[p]
            const completed = completedPhases.includes(p)
            const isActive = activePhase === p
            const questAllows = forgottenForgeAllowsStartingAltarPhase(quest, p)
            const locked = !completed && !isActive && !questAllows
            const clickable = completed || isActive || questAllows
            const isSelected = selectedPhase === p
            const highlightPulse =
              isActive || (questAllows && !completed && activePhase == null)

            const tooltipLines: string[] = [cfg.roadmapTitle, cfg.roadmapDescription]
            if (completed) {
              tooltipLines.push('Завершена.')
            } else if (locked) {
              tooltipLines.push('Требуется завершить задание архивариуса.')
            }

            const diamond = (
              <RoadmapAmethystDiamond
                completed={completed}
                locked={locked}
                isSelected={isSelected}
                clickable={clickable}
                highlightPulse={highlightPulse}
              >
                {completed ? (
                  <Check className={GLYPH_ICON} strokeWidth={2.5} aria-hidden />
                ) : locked ? (
                  <Lock className={cn(GLYPH_ICON, 'text-stone-500')} aria-hidden />
                ) : (
                  phaseRoman(p)
                )}
              </RoadmapAmethystDiamond>
            )

            const prevIdx = index - 1
            const prevPhase = prevIdx >= 0 ? PHASES[prevIdx] : undefined

            return (
              <Fragment key={p}>
                {prevPhase !== undefined ? (
                  <RoadmapConnector leftPhaseCompleted={completedPhases.includes(prevPhase)} />
                ) : null}
                <div
                  className={cn(
                    'relative z-10 flex shrink-0 flex-col items-center justify-center',
                    CELL_BOX
                  )}
                >
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => {
                          if (clickable) onSelectPhase(p)
                          else onLockedClick()
                        }}
                        className={cn(
                          'flex size-full items-center justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-amber-500/80 focus-visible:ring-offset-1 focus-visible:ring-offset-stone-950',
                          !clickable && 'cursor-not-allowed'
                        )}
                        aria-current={isSelected ? 'step' : undefined}
                        aria-label={
                          locked
                            ? `Фаза ${phaseRoman(p)}, недоступна`
                            : `Фаза ${phaseRoman(p)}, ${cfg.roadmapTitle}`
                        }
                      >
                        {diamond}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[20rem] space-y-1.5 px-3 py-2 text-left">
                      {tooltipLines.map((line, i) => (
                        <p
                          key={i}
                          className={cn(
                            'text-balance leading-snug',
                            i === 0 ? 'font-medium text-stone-100' : 'text-stone-300'
                          )}
                        >
                          {line}
                        </p>
                      ))}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}
