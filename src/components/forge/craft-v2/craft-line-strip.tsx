'use client'

import { useMemo } from 'react'
import type { CraftLineSegment } from '@/types/craft-line'
import { craftLineSegmentReactKey } from '@/types/craft-line'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { WeaponRecipe } from '@/types/craft-v2'
import {
  buildTechniqueBracketSpans,
  craftLineSegmentTooltipLines,
  thermalBandForCraftLineSegment,
  thermalSegmentStyle,
} from '@/lib/craft/craft-line-strip-model'

function TechniqueBracketsOverlay({
  segments,
}: {
  segments: CraftLineSegment[]
}) {
  const spans = useMemo(() => buildTechniqueBracketSpans(segments), [segments])
  if (spans.length === 0) return null

  return (
    <div className="relative z-10 -mb-2 h-10 w-full">
      {spans.map((span, idx) => {
        const border =
          span.kind === 'material_processing'
            ? 'border-amber-400/75 text-amber-100/95'
            : 'border-sky-400/80 text-sky-100/95'
        return (
          <Tooltip key={`${span.kind}-${span.techniqueId}-${idx}`} delayDuration={300}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'absolute top-0 flex h-full cursor-default items-end justify-center px-0.5',
                  span.widthPct < 8 && 'min-w-[2.5rem]'
                )}
                style={{
                  left: `${span.leftPct}%`,
                  width: `${span.widthPct}%`,
                }}
              >
                <div
                  className={cn(
                    'max-w-full truncate rounded-t border-l-2 border-r-2 border-t-2 bg-stone-950/75 px-1 py-0.5 text-center text-[10px] font-medium leading-tight shadow-sm backdrop-blur-[2px]',
                    border
                  )}
                >
                  <span aria-hidden className="text-stone-400">
                    【
                  </span>
                  <span className="px-0.5">{span.label}</span>
                  <span aria-hidden className="text-stone-400">
                    】
                  </span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs border-stone-600 bg-stone-900 text-stone-100">
              <p className="font-semibold text-amber-100/90">Техника (энциклопедия)</p>
              <p className="text-sm">{span.label}</p>
              <p className="mt-1 text-xs text-stone-400">
                {span.kind === 'material_processing'
                  ? 'Объединяет микрошаги обработки материала на этом участке линии.'
                  : 'Объединяет микрошаги боевого приёма на этом участке линии.'}
              </p>
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}

/**
 * Единая крафтовая линия: тепловая палитра по шагам, подсказки, скобки техник.
 */
export function CraftLineStrip({
  segments,
  overallProgress01,
  recipe,
  className,
}: {
  segments: CraftLineSegment[]
  overallProgress01: number
  recipe: WeaponRecipe | null | undefined
  className?: string
}) {
  const p = Math.min(1, Math.max(0, overallProgress01))
  const pct = Math.round(p * 100)

  if (!segments.length) return null

  return (
    <div className={cn('w-full space-y-2', className)}>
      <TechniqueBracketsOverlay segments={segments} />

      <div
        className="relative z-0 h-7 w-full overflow-hidden rounded-md border border-stone-600/90 bg-stone-950 ring-1 ring-stone-800/80 shadow-inner"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={`${pct}% полного процесса`}
        aria-label="Крафтовая линия: микрошаги рецепта и техник"
      >
        <div className="flex h-full w-full">
          {segments.map((seg, i) => {
            const band = thermalBandForCraftLineSegment(seg, recipe)
            const { style, bandLabel } = thermalSegmentStyle(band, i)
            const { title, lines } = craftLineSegmentTooltipLines(seg, recipe, i, segments.length)

            return (
              <Tooltip key={craftLineSegmentReactKey(seg, i)} delayDuration={280}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'relative h-full shrink-0 border-r border-black/25 outline-none last:border-r-0',
                      'transition-[filter] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-amber-400/80'
                    )}
                    style={{ width: `${seg.durationShare * 100}%`, ...style }}
                  >
                    <span className="sr-only">{title}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="max-w-sm border-stone-600 bg-stone-900 text-stone-100"
                >
                  <p className="font-semibold text-amber-100/95">{title}</p>
                  <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-stone-300">
                    {lines.map((line, li) => (
                      <li key={li}>{line}</li>
                    ))}
                  </ul>
                  <p className="mt-2 border-t border-stone-700 pt-1.5 text-[10px] text-stone-500">
                    Цвет сегмента: {bandLabel}
                  </p>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 bg-stone-950/88 backdrop-blur-[1px]"
          style={{ width: `${(1 - p) * 100}%` }}
          aria-hidden
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-stone-500">
        <span className="tabular-nums text-stone-400">Микрошагов: {segments.length}</span>
        <div
          className="h-2 flex-1 min-w-[120px] max-w-md rounded-full opacity-90"
          style={{
            background:
              'linear-gradient(90deg, hsl(222, 85%, 45%) 0%, hsl(200, 70%, 48%) 18%, hsl(45, 70%, 55%) 50%, hsl(24, 90%, 50%) 75%, hsl(8, 95%, 48%) 100%)',
          }}
          title="Холодная работа слева → горячая справа (условная температура, как на тепловизоре)"
        />
        <span className="text-right text-stone-600">холоднее · горячее</span>
      </div>
    </div>
  )
}
