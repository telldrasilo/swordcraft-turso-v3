'use client'

import { useMemo } from 'react'
import type { CraftedWeaponV2, QualityGrade } from '@/types/craft-v2'
import { weaponTypeStats } from '@/lib/craft/weapon-display-meta'
import { cn } from '@/lib/utils'
import { WeaponIcon } from '@/components/forge/forge-utils'
import { getActiveDamageTagLabels } from '@/lib/weapon-damage/damage-tags-ui'
import { weaponHasActiveWorkbenchWork } from '@/lib/workbench/workbench-queue'
import type { WorkbenchQueueItem } from '@/lib/workbench/workbench-queue'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-mobile'
import { recalculateWeaponPowerScore } from '@/lib/craft/weapon-power-score'
import {
  durabilityBarFillClass,
  durabilityLabelTextClass,
  durabilityPercentValue,
} from '@/lib/forge/durability-bar-tone'
import { getWarSoulTier, WAR_SOUL_WEAPON_POOL_MIN } from '@/lib/war-soul-utils'
import { isWarSoulPoolUncapped } from '@/data/war-soul-balance'

/** Эмодзи мощи — согласовано с восприятием «силы» клинка (аналог Zap в карточке инвентаря). */
const POWER_EMOJI = '⚡'

const qualityBorderByGrade: Record<QualityGrade, string> = {
  poor: 'border-stone-700/90',
  common: 'border-stone-600/80',
  good: 'border-green-800/55',
  excellent: 'border-blue-600/50',
  masterpiece: 'border-purple-600/50',
  legendary: 'border-amber-600/55',
}

function powerOf(w: CraftedWeaponV2): number {
  return typeof w.powerScore === 'number' ? w.powerScore : recalculateWeaponPowerScore(w)
}

export function WorkbenchStripWeaponCell(props: {
  weapon: CraftedWeaponV2
  selected: boolean
  onSelect: () => void
  workbenchQueue: readonly WorkbenchQueueItem[]
}) {
  const { weapon, selected, onSelect, workbenchQueue } = props
  const isMobile = useIsMobile()

  const durability = weapon.currentDurability ?? weapon.stats.durability
  const maxD = weapon.stats.maxDurability
  const pct = durabilityPercentValue(durability, maxD)
  const barFill = durabilityBarFillClass(pct)
  const durabilityTextClass = durabilityLabelTextClass(pct)

  const inQueue = weaponHasActiveWorkbenchWork(workbenchQueue, weapon.id)
  const warSoul = weapon.warSoul ?? 0
  const poolCap = isWarSoulPoolUncapped(weapon.maxWarSoul)
    ? Number.POSITIVE_INFINITY
    : (weapon.maxWarSoul ?? WAR_SOUL_WEAPON_POOL_MIN)
  const warSoulTier =
    warSoul > 0 || (weapon.maxWarSoul ?? 0) > 0 || (weapon.soulPotential ?? 0) > 0
      ? getWarSoulTier(warSoul, poolCap)
      : null
  const soulEmoji = warSoulTier?.icon ?? '✨'
  const soulDisplay = warSoul.toLocaleString('ru-RU')

  const tagUi = useMemo(() => getActiveDamageTagLabels(weapon, 99), [weapon])

  const typeName =
    (weaponTypeStats as Record<string, (typeof weaponTypeStats)['sword']>)[weapon.type]?.name ??
    weapon.type

  const borderQ = qualityBorderByGrade[weapon.qualityGrade] ?? 'border-stone-700/90'

  const tooltipBody = (
    <div className="max-w-[16rem] space-y-1.5 text-xs text-stone-200">
      <p className="font-semibold leading-snug text-stone-100">{weapon.fullName}</p>
      <p className="text-[11px] text-stone-500">{typeName}</p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-stone-400 border-t border-stone-700/60 pt-1.5">
        <span className="inline-flex items-center gap-0.5 tabular-nums text-amber-200/90">
          <span aria-hidden>{POWER_EMOJI}</span>
          {powerOf(weapon)}
        </span>
        <span className={cn('tabular-nums', durabilityTextClass)}>
          Прочн. {durability}/{maxD} ({pct}%)
        </span>
        <span className="tabular-nums text-amber-200/80">
          <span aria-hidden>{soulEmoji}</span> {soulDisplay} ДВ
        </span>
      </div>
      {warSoulTier ? (
        <p className="text-[11px] text-stone-300">
          <span className="text-stone-500">Тир души войны:</span>{' '}
          <span className="inline-flex items-center gap-1">
            <span aria-hidden>{warSoulTier.icon}</span>
            <span className="font-medium text-stone-200">{warSoulTier.name}</span>
            <span className="text-stone-500">(тир {warSoulTier.tier})</span>
          </span>
        </p>
      ) : null}
      {tagUi.total > 0 ? (
        <div className="flex flex-wrap gap-1 text-[10px] text-amber-100/85">
          {tagUi.labels.map((l, i) => (
            <span key={`${l}-${i}`} className="rounded border border-amber-900/40 px-1 py-0.5">
              {l}
            </span>
          ))}
        </div>
      ) : null}
      {inQueue ? <p className="text-[10px] text-stone-500">В очереди верстака</p> : null}
    </div>
  )

  const button = (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full rounded-md border px-2 py-1.5 text-left transition-colors',
        'flex flex-col bg-stone-950/55 hover:bg-stone-900/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50',
        borderQ,
        selected && 'ring-2 ring-amber-500/80 bg-amber-950/35 border-amber-600/70'
      )}
    >
      <div className="flex min-w-0 items-start gap-1.5">
        <WeaponIcon type={weapon.type} className="shrink-0 text-lg leading-none pt-px" />
        <div className="min-w-0 flex-1">
          <p
            className="line-clamp-2 text-sm font-semibold leading-tight text-stone-200 break-words"
            title={weapon.fullName}
          >
            {typeName}
          </p>
          {inQueue ? (
            <p className="mt-0.5 text-[10px] text-stone-500 leading-none">⌛ в очереди</p>
          ) : null}
        </div>
        <div
          className="flex shrink-0 flex-col items-end gap-0.5 tabular-nums leading-tight"
          title={`Мощь ${powerOf(weapon)}, душа войны ${soulDisplay}`}
        >
          <span className="inline-flex items-center gap-0.5 text-sm font-bold text-amber-200/95">
            <span aria-hidden className="text-[0.95em]">
              {POWER_EMOJI}
            </span>
            {powerOf(weapon)}
          </span>
          <span className="inline-flex items-center gap-0.5 text-sm font-bold text-amber-200/85">
            <span aria-hidden className="text-[0.95em]">
              {soulEmoji}
            </span>
            {soulDisplay}
          </span>
        </div>
      </div>

      <div className="mt-1 flex min-w-0 items-center gap-1.5">
        <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-stone-800/90">
          <div
            className={cn('h-full rounded-full transition-[width]', barFill)}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={cn('shrink-0 tabular-nums text-xs font-medium leading-none', durabilityTextClass)}>
          {durability}/{maxD}
        </span>
      </div>
    </button>
  )

  if (isMobile) {
    return button
  }

  return (
    <Tooltip delayDuration={400}>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="start"
        className="border-stone-700 bg-stone-950 text-stone-200 max-w-none"
      >
        {tooltipBody}
      </TooltipContent>
    </Tooltip>
  )
}
