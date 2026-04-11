'use client'

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
import { getEffectiveRefiningRecipeId } from '@/lib/craft/processing-technique-refining-bridge'
import { getProcessingTechniqueTimelinePreview } from '@/lib/craft/processing-technique-stage-insertions'
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
    case 'tannery':
      return { short: 'Кожа', hint: 'Выделка кожаной заготовки у горна' }
    default:
      return { short: 'Обработка', hint: 'Переработка заготовки перед ковкой' }
  }
}

function formatVariantCountRu(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return `${n} вариантов подготовки`
  if (mod10 === 1) return `${n} вариант подготовки`
  if (mod10 >= 2 && mod10 <= 4) return `${n} варианта подготовки`
  return `${n} вариантов подготовки`
}

function formatRefiningConsumption(
  ref: NonNullable<ReturnType<typeof getRefiningRecipe>>
): string {
  const stashIn = ref.stashInputsPerBatch
  const parts =
    stashIn && Object.keys(stashIn).length > 0
      ? Object.entries(stashIn).map(([mid, n]) => `${n} × ${mid}`)
      : ref.inputs.map(i => {
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
    case 'tannery':
      return {
        title: 'Выделывать кожу у горна',
        secondary:
          'Цепочка сырья → заготовка для рукояти; несовместимые комбинации отфильтруются при старте крафта.',
        selectPlaceholder: 'Вариант выделки',
      }
    default:
      return {
        title: 'Переработка у горна',
        secondary: 'Выберите технику; несовместимые комбинации отфильтруются при старте крафта.',
        selectPlaceholder: 'Вариант техники',
      }
  }
}

function refiningBuildingForTechnique(
  t: MaterialProcessingTechnique | undefined
): RefiningBuilding | undefined {
  if (!t) return undefined
  return getRefiningRecipe(getEffectiveRefiningRecipeId(t))?.requiredBuilding
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
  const techniqueIdForSelect = oreSmeltOn
    ? (supplyEntry?.processingTechniqueId ?? processingOpts[0]?.id)
    : undefined

  const techniqueActive = techniqueIdForSelect
    ? (processingOpts.find(t => t.id === techniqueIdForSelect) ?? processingOpts[0])
    : undefined

  const buildingForSwitch = refiningBuildingForTechnique(
    oreSmeltOn ? techniqueActive : processingOpts[0]
  )
  const copy = switchCopy(buildingForSwitch)

  const refiningActive = techniqueActive
    ? getRefiningRecipe(getEffectiveRefiningRecipeId(techniqueActive))
    : undefined
  const kindActive = badgeForBuilding(refiningActive?.requiredBuilding)

  const chainTooltipBody =
    oreSmeltOn && refiningActive && techniqueActive ? (
      <div className="space-y-2 text-left">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">
          Цепочка шагов
        </p>
        <ul className="space-y-1.5 text-[11px] text-stone-300">
          {getProcessingTechniqueTimelinePreview(techniqueActive).map((row, idx) => {
            const stageTitle = PREP_STAGE_NAME.get(row.stageType) ?? row.stageType
            const dur =
              row.durationSeconds != null ? `~${row.durationSeconds} с` : ''
            return (
              <li key={`${row.stageType}-${idx}`} className="flex gap-2">
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
              Рецепт «{refiningActive.name}»: {formatRefiningConsumption(refiningActive)}
            </span>
          </li>
        </ul>
      </div>
    ) : null

  const nOpts = processingOpts.length

  return (
    <div
      className={cn(
        'rounded-lg border border-amber-900/40 bg-stone-950/60 p-3 space-y-3 flex flex-col h-full min-h-0',
        className
      )}
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-500/90">
          Техника обработки
        </p>
        {oreSmeltOn && techniqueActive ? (
          <>
            <p className="text-sm font-semibold text-stone-100 leading-snug">
              {techniqueActive.name}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-amber-700/60 text-amber-200/95 text-[10px]">
                {kindActive.short}
              </Badge>
              <span className="text-[11px] text-stone-500">{kindActive.hint}</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-snug">
              {techniqueActive.description}
            </p>
          </>
        ) : (
          <p className="text-[11px] text-stone-400 leading-snug">
            Доступно {formatVariantCountRu(nOpts)} по этой заготовке (как в энциклопедии). Включите
            переключатель ниже, чтобы выбрать технику и увидеть цепочку.
          </p>
        )}
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

      {oreSmeltOn && processingOpts.length > 1 && techniqueIdForSelect && (
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

      {oreSmeltOn && refiningActive && (
        <p className="text-[11px] text-stone-500 leading-snug mt-auto">
          {`Со склада списываются ${formatRefiningConsumption(refiningActive)} по рецепту «${refiningActive.name}» вместо готовой заготовки (${refiningActive.output.amount} ${refiningActive.name.toLowerCase()} на единицу переработки).`}
        </p>
      )}
    </div>
  )
}
