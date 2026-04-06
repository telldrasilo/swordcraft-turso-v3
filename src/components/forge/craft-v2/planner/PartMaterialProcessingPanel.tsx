'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MaterialProcessingTechnique } from '@/data/material-processing-techniques'
import type { PartMaterialSupplyEntry } from '@/types/craft-v2'
import { getRefiningRecipe, type RawResource } from '@/data/refining-recipes'
import { preparationStages } from '@/data/stages/preparation'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const PREP_STAGE_NAME = new Map(preparationStages.map(s => [s.id, s.name]))

const RAW_RESOURCE_LABEL: Record<RawResource, string> = {
  iron: 'железной руды',
  copper: 'медной руды',
  tin: 'оловянной руды',
  silver: 'серебряной руды',
  goldOre: 'золотой руды',
  mithril: 'мифриловой руды',
  wood: 'древесины',
  stone: 'камня',
}

type RefiningBuilding = NonNullable<ReturnType<typeof getRefiningRecipe>>['requiredBuilding']

function badgeForBuilding(building: RefiningBuilding | undefined) {
  switch (building) {
    case 'smelter':
      return { short: 'Плавка', hint: 'Переплавка руды в горне перед ковкой' }
    case 'sawmill':
      return { short: 'Дерево', hint: 'Распил и заготовка пиломатериала у горна' }
    case 'quarry':
      return { short: 'Камень', hint: 'Подготовка каменных блоков у горна' }
    default:
      return { short: 'Обработка', hint: 'Переработка заготовки перед ковкой' }
  }
}

function formatRefiningConsumption(
  ref: NonNullable<ReturnType<typeof getRefiningRecipe>>
): string {
  const parts = ref.inputs.map(i => {
    const label = RAW_RESOURCE_LABEL[i.resource] ?? i.resource
    return `${i.amount} ед. ${label}`
  })
  const coal = ref.extraCost?.coal ?? 0
  if (coal > 0) parts.push(`${coal} угля`)
  return parts.join(' · ')
}

function switchCopy(building: RefiningBuilding | undefined) {
  switch (building) {
    case 'smelter':
      return {
        title: 'Брать металл из руды',
        secondary:
          'Несколько техник на эту заготовку — выберите вариант; несовместимые комбинации отфильтруются при старте крафта.',
        selectPlaceholder: 'Вариант плавки',
      }
    case 'sawmill':
      return {
        title: 'Готовить доски у горна',
        secondary:
          'Несколько техник — выберите вариант обработки древесины; несовместимые комбинации отфильтруются при старте крафта.',
        selectPlaceholder: 'Вариант распила',
      }
    case 'quarry':
      return {
        title: 'Готовить блоки у горна',
        secondary:
          'Несколько техник — выберите вариант обработки камня; несовместимые комбинации отфильтруются при старте крафта.',
        selectPlaceholder: 'Вариант обработки камня',
      }
    default:
      return {
        title: 'Переработка у горна',
        secondary: 'Выберите технику; несовместимые комбинации отфильтруются при старте крафта.',
        selectPlaceholder: 'Вариант техники',
      }
  }
}

export interface PartMaterialProcessingPanelProps {
  partId: string
  processingOpts: MaterialProcessingTechnique[]
  supplyEntry: PartMaterialSupplyEntry | undefined
  onToggleOreSmelt: (enabled: boolean) => void
  onProcessingTechniqueChange: (techniqueId: string) => void
  className?: string
}

/**
 * Панель техники обработки (горн / заготовка) для части оружия — десктоп или контент шторки.
 */
export function PartMaterialProcessingPanel({
  partId,
  processingOpts,
  supplyEntry,
  onToggleOreSmelt,
  onProcessingTechniqueChange,
  className,
}: PartMaterialProcessingPanelProps) {
  if (processingOpts.length === 0) return null

  const oreSmeltOn = supplyEntry?.mode === 'ore_smelt'
  const techniqueIdForSelect =
    supplyEntry?.processingTechniqueId ?? processingOpts[0]?.id

  const technique =
    processingOpts.find(t => t.id === techniqueIdForSelect) ?? processingOpts[0]
  const refining = technique ? getRefiningRecipe(technique.refiningRecipeId) : undefined
  const kind = badgeForBuilding(refining?.requiredBuilding)
  const copy = switchCopy(refining?.requiredBuilding)

  const chainTooltipBody =
    oreSmeltOn && refining && technique ? (
      <div className="space-y-2 text-left">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">
          Цепочка шагов
        </p>
        <ul className="space-y-1.5 text-[11px] text-stone-300">
          {technique.craftStageInsertions.map((ins, idx) => {
            const stageTitle = PREP_STAGE_NAME.get(ins.stageType) ?? ins.stageType
            const dur =
              ins.durationSeconds != null ? `~${ins.durationSeconds} с` : ''
            return (
              <li key={`${ins.stageType}-${idx}`} className="flex gap-2">
                <span className="text-stone-500 shrink-0 w-4">{idx + 1}.</span>
                <span>
                  {stageTitle}
                  {dur ? <span className="text-stone-500"> · {dur}</span> : null}
                </span>
              </li>
            )
          })}
          <li className="flex gap-2 border-t border-stone-800/80 pt-1.5 mt-1">
            <span className="text-stone-500 shrink-0 w-4">→</span>
            <span>
              Рецепт «{refining.name}»: {formatRefiningConsumption(refining)}
            </span>
          </li>
        </ul>
      </div>
    ) : null

  return (
    <div
      className={cn(
        'rounded-lg border border-amber-900/40 bg-stone-950/60 p-3 space-y-3 flex flex-col h-full min-h-0',
        className
      )}
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-500/90">
          Техника обработки
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-amber-700/60 text-amber-200 text-xs">
            {kind.short}
          </Badge>
          <span className="text-[11px] text-stone-500">{kind.hint}</span>
        </div>
        {technique ? (
          <p className="text-[11px] text-stone-400 leading-snug">{technique.description}</p>
        ) : null}
      </div>

      <Tooltip delayDuration={250}>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-between gap-2 rounded-md -mx-1 px-1 py-0.5 cursor-help hover:bg-stone-900/35">
            <Label
              htmlFor={`ore-smelt-${partId}`}
              className="text-sm text-stone-200 cursor-pointer font-normal flex-1 leading-snug"
            >
              {copy.title}
            </Label>
            <Switch
              id={`ore-smelt-${partId}`}
              className="shrink-0"
              checked={oreSmeltOn}
              onCheckedChange={onToggleOreSmelt}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="start"
          sideOffset={8}
          className="max-w-[min(22rem,calc(100vw-2rem))] max-h-[min(70vh,22rem)] overflow-y-auto border border-stone-600 bg-stone-950 p-3 text-stone-200"
        >
          {!oreSmeltOn ? (
            <p className="text-[11px] text-stone-400 leading-snug">
              Включите переключатель, чтобы активировать цепочку подготовки и увидеть этапы.
            </p>
          ) : chainTooltipBody ?? (
            <p className="text-[11px] text-stone-400 leading-snug">
              Нет данных о цепочке для выбранной техники.
            </p>
          )}
        </TooltipContent>
      </Tooltip>

      {oreSmeltOn && processingOpts.length > 1 && (
        <p className="text-[11px] text-stone-500 leading-snug">{copy.secondary}</p>
      )}

      {oreSmeltOn && processingOpts.length > 1 && (
        <Select
          value={techniqueIdForSelect}
          onValueChange={onProcessingTechniqueChange}
        >
          <SelectTrigger className="h-9 text-xs bg-stone-900 border-stone-600">
            <SelectValue placeholder={copy.selectPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {processingOpts.map(t => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {oreSmeltOn && refining && (
        <p className="text-[11px] text-stone-500 leading-snug mt-auto">
          Со склада списываются {formatRefiningConsumption(refining)} по рецепту «{refining.name}»
          вместо готовой заготовки ({refining.output.amount} {refining.name.toLowerCase()} на единицу
          переработки).
        </p>
      )}
    </div>
  )
}
