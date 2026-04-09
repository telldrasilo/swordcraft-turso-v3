/**
 * WeaponInventoryCard - карточка оружия в инвентаре
 */

'use client'

import { motion } from 'framer-motion'
import {
  Sword,
  Heart,
  Star,
  Map as MapIcon,
  Sparkles,
  Package,
  AlertTriangle,
  Wrench,
  ChevronDown,
  Zap,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { useGameStore } from '@/store'
import { useMemo } from 'react'
import { weaponTypeStats } from '@/lib/craft/weapon-display-meta'
import type { CraftedWeaponV2, QualityGrade } from '@/types/craft-v2'
import { getQualityColor, getQualityNameRu } from '@/types/craft-v2'
import { cn } from '@/lib/utils'
import { WeaponIcon } from './forge-utils'
import {
  getWarSoulTier,
  getProgressToNextTier,
  getNextTierInfo,
  resolveWarSoulProgressBarMax,
  WAR_SOUL_WEAPON_POOL_MIN,
} from '@/lib/war-soul-utils'
import { isWarSoulPoolUncapped } from '@/data/war-soul-balance'
import { getQualityWithinGradeDisplay } from '@/lib/craft/quality-display'
import { getActiveDamageTagLabels } from '@/lib/weapon-damage/damage-tags-ui'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { getDamageTagById } from '@/data/weapon-damage/damage-tag-registry'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { weaponHasActiveWorkbenchWork } from '@/lib/workbench/workbench-queue'
import { recalculateWeaponPowerScore } from '@/lib/craft/weapon-power-score'
import {
  durabilityBarFillClass,
  durabilityLabelTextClass,
  durabilityPercentValue,
} from '@/lib/forge/durability-bar-tone'

/** Компактная карточка для превью в popover полосы очереди (без store / действий). */
function WeaponQueuePreviewCard({
  weapon,
  caption,
}: {
  weapon: CraftedWeaponV2
  caption: string
}) {
  const powerScore = weapon.powerScore ?? recalculateWeaponPowerScore(weapon)
  const typeStats = (weaponTypeStats as Record<string, (typeof weaponTypeStats)['sword']>)[weapon.type]
  const durability = weapon.currentDurability ?? weapon.stats.durability
  const durabilityPercent = Math.round((durability / weapon.stats.maxDurability) * 100)
  const damageUi = getActiveDamageTagLabels(weapon, 2)
  const iconBgByQuality: Record<QualityGrade, string> = {
    poor: 'bg-stone-900/50',
    common: 'bg-stone-900/50',
    good: 'bg-green-900/30',
    excellent: 'bg-blue-900/30',
    masterpiece: 'bg-purple-900/30',
    legendary: 'bg-amber-900/30',
  }
  const iconBoxBg = iconBgByQuality[weapon.qualityGrade] ?? 'bg-stone-900/50'

  return (
    <div className="w-[min(100vw,20rem)]">
      <Card className="card-medieval border-stone-700/80 shadow-lg">
        <CardContent className="p-3 space-y-2">
          <p className="text-[10px] text-amber-200/80 uppercase tracking-wide leading-snug">{caption}</p>
          <div className="flex items-start gap-2.5">
            <div
              className={cn(
                'w-11 h-11 shrink-0 rounded-lg flex items-center justify-center text-xl',
                iconBoxBg
              )}
            >
              <WeaponIcon type={weapon.type} />
            </div>
            <div className="min-w-0 flex-1">
              <h4
                className="font-semibold text-stone-200 text-sm leading-snug break-words"
                title={weapon.fullName}
              >
                {weapon.fullName}
              </h4>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                <span className="text-[11px] text-stone-500">{typeStats?.name}</span>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-amber-200/90 tabular-nums">
                  <Zap className="w-3 h-3 shrink-0 text-amber-400/90" />
                  {powerScore}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] text-stone-400 pt-1 border-t border-stone-700/50">
            <span>
              Атака <span className="text-red-300/90 tabular-nums">{weapon.stats.attack}</span>
            </span>
            <span>
              Прочн.{' '}
              <span className="text-stone-200 tabular-nums">
                {durability}/{weapon.stats.maxDurability}
              </span>{' '}
              <span className="text-stone-500">({durabilityPercent}%)</span>
            </span>
          </div>
          {damageUi.total > 0 ? (
            <div className="flex flex-wrap gap-1">
              <AlertTriangle className="w-3 h-3 shrink-0 text-amber-500 mt-0.5" />
              {damageUi.labels.slice(0, 3).map((label, i) => (
                <Badge
                  key={`${label}-${i}`}
                  variant="outline"
                  className="text-[9px] border-amber-800/50 text-amber-100/90 max-w-[7rem] truncate"
                >
                  {label}
                </Badge>
              ))}
              {damageUi.more > 0 ? (
                <span className="text-[10px] text-amber-400/90">+{damageUi.more}</span>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

/** Свёртка §9.1: архив тегов и счётчики устранения — для отладки на верстаке */
function WeaponRepairLegacyDebugPanel({ weapon }: { weapon: CraftedWeaponV2 }) {
  const legacy = weapon.weaponLegacy
  const archived = legacy?.archivedDamageTagIds ?? []
  const resolveMap = legacy?.repairResolveCountByTagId ?? {}
  const precise = legacy?.repairDiagnosisPreciseCountByTagId ?? {}
  const risky = legacy?.repairDiagnosisRiskyCountByTagId ?? {}
  const skipped = legacy?.repairDiagnosisSkippedCountByTagId ?? {}
  const tagIds = Array.from(
    new Set([
      ...archived,
      ...Object.keys(resolveMap),
      ...Object.keys(precise),
      ...Object.keys(risky),
      ...Object.keys(skipped),
    ])
  )

  if (tagIds.length === 0) {
    return (
      <div className="pt-2 border-t border-stone-700/50">
        <Collapsible className="group">
          <CollapsibleTrigger
            type="button"
            className="flex w-full items-center justify-between gap-2 rounded-md border border-stone-700/60 bg-stone-900/35 px-2 py-1.5 text-left text-[11px] text-stone-500 hover:text-stone-300"
          >
            <span>Под капотом (§9.1)</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-1.5 text-[10px] text-stone-500">
            Пока нет архива тегов и счётчиков починок — появятся после успешных ремонтов с снятием
            повреждений.
          </CollapsibleContent>
        </Collapsible>
      </div>
    )
  }

  return (
    <div className="pt-2 border-t border-stone-700/50">
      <Collapsible className="group" defaultOpen={false}>
        <CollapsibleTrigger
          type="button"
          className="flex w-full items-center justify-between gap-2 rounded-md border border-stone-700/60 bg-stone-900/35 px-2 py-1.5 text-left text-[11px] text-stone-500 hover:text-stone-300"
        >
          <span>Под капотом (§9.1)</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2 text-[10px] text-stone-400">
          <p className="text-stone-500 leading-snug">
            Данные для будущего зачарования; в бою не показываются.
          </p>
          <div>
            <p className="text-stone-500 mb-1 font-medium">Архив тегов (id)</p>
            <ul className="space-y-0.5 font-mono text-[10px] text-stone-400">
              {archived.length === 0 ? (
                <li>—</li>
              ) : (
                archived.map((id) => {
                  const def = getDamageTagById(id)
                  return (
                    <li key={id}>
                      <span className="text-stone-500">{id}</span>
                      {def?.label ? (
                        <span className="text-stone-500"> — {def.label}</span>
                      ) : null}
                    </li>
                  )
                })
              )}
            </ul>
          </div>
          <div>
            <p className="text-stone-500 mb-1 font-medium">Устранений по тегу (repair resolve)</p>
            <ul className="space-y-0.5">
              {tagIds.map((tagId) => {
                const n = resolveMap[tagId] ?? 0
                const def = getDamageTagById(tagId)
                return (
                  <li key={tagId} className="flex justify-between gap-2">
                    <span className="truncate text-stone-400">
                      {def?.label ?? tagId}
                    </span>
                    <span className="tabular-nums text-stone-300 shrink-0">×{n}</span>
                  </li>
                )
              })}
            </ul>
          </div>
          {(Object.keys(precise).length > 0 ||
            Object.keys(risky).length > 0 ||
            Object.keys(skipped).length > 0) && (
            <div>
              <p className="text-stone-500 mb-1 font-medium">Диагностика §9.1.1 (precise / risky / skipped)</p>
              <ul className="space-y-0.5 font-mono text-[10px]">
                {Array.from(
                  new Set([
                    ...Object.keys(precise),
                    ...Object.keys(risky),
                    ...Object.keys(skipped),
                  ])
                ).map((tagId) => {
                  const p = precise[tagId] ?? 0
                  const r = risky[tagId] ?? 0
                  const s = skipped[tagId] ?? 0
                  const def = getDamageTagById(tagId)
                  return (
                    <li key={`diag-${tagId}`} className="flex flex-wrap justify-between gap-x-2 gap-y-0.5">
                      <span className="truncate text-stone-400">{def?.label ?? tagId}</span>
                      <span className="text-stone-300 shrink-0">
                        P{p} R{r} S{s}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

interface WeaponInventoryCardProps {
  weapon: CraftedWeaponV2
  /** inventory — список инвентаря; workbench — сетка верстака; queuePreview — превью в popover */
  context?: 'inventory' | 'workbench' | 'queuePreview'
  /** Только при context workbench: активная подвкладка (подписи/данные при необходимости) */
  workbenchMode?: 'repair' | 'reforge'
  /** Панель ремонта: «на верстаке» и кнопка возврата в инвентарь */
  benchDetail?: boolean
  /** Подпись задачи очереди для `context="queuePreview"` (например «#2 · Ремонт · Имя»). */
  queuePreviewCaption?: string
}

export function WeaponInventoryCard({
  weapon,
  context = 'inventory',
  workbenchMode = 'repair',
  benchDetail = false,
  queuePreviewCaption,
}: WeaponInventoryCardProps) {
  const onRepairBench = benchDetail
  const isWorkbench = context === 'workbench'
  const isMobile = useIsMobile()
  const isWeaponInExpedition = useGameStore((state) => state.isWeaponInExpedition)
  const sendWeaponToRepairBench = useGameStore((state) => state.sendWeaponToRepairBench)
  const returnWeaponFromRepairBench = useGameStore((state) => state.returnWeaponFromRepairBench)
  const navigateToForgeTab = useGameStore((state) => state.navigateToForgeTab)
  const selectRepairBenchWeapon = useGameStore((state) => state.selectRepairBenchWeapon)
  const workbenchQueue = useGameStore((state) => state.workbenchQueue)

  const weaponInActiveQueue = weaponHasActiveWorkbenchWork(workbenchQueue, weapon.id)
  const onWorkbenchBench = isWorkbench && weaponInActiveQueue
  const powerScore = weapon.powerScore ?? recalculateWeaponPowerScore(weapon)
  const queueTouchCount = useMemo(
    () =>
      workbenchQueue.filter(
        (i) =>
          i.weaponId === weapon.id && (i.status === 'planned' || i.status === 'running')
      ).length,
    [workbenchQueue, weapon.id]
  )

  if (context === 'queuePreview') {
    return (
      <WeaponQueuePreviewCard
        weapon={weapon}
        caption={queuePreviewCaption ?? 'Задача в очереди верстака'}
      />
    )
  }

  const qualityGrade = weapon.qualityGrade
  const qualityColor = getQualityColor(weapon.quality)
  const qualityNameRu = getQualityNameRu(weapon.quality)
  
  const qInGrade = getQualityWithinGradeDisplay(weapon.quality)
  const qualityInfo = {
    grade: qualityGrade,
    name: qualityNameRu,
    multiplier: qInGrade.multiplier,
    color: qualityColor,
  }

  const qualityBgColor = {
    'text-gray-400': 'bg-gray-600',
    'text-green-400': 'bg-green-600',
    'text-blue-400': 'bg-blue-600',
    'text-purple-400': 'bg-purple-600',
    'text-amber-400': 'bg-amber-700',
    'text-rose-400': 'bg-rose-600',
  }[qualityInfo.color] || 'bg-gray-600'
  const typeStats = (weaponTypeStats as Record<string, (typeof weaponTypeStats)['sword']>)[weapon.type]

  // Проверяем, в экспедиции ли оружие
  const inExpedition = isWeaponInExpedition(weapon.id)
  
  // Прочность для индикаторов
  const durability = weapon.currentDurability ?? weapon.stats.durability
  const durabilityPercent = durabilityPercentValue(durability, weapon.stats.maxDurability)
  const durabilityColor = durabilityLabelTextClass(durabilityPercent)
  const durabilityBgColor = durabilityBarFillClass(durabilityPercent)

  const damageUi = getActiveDamageTagLabels(weapon, 2)
  const hasVisibleDamage = damageUi.total > 0
  const needsRepairShortcut =
    hasVisibleDamage || durability < weapon.stats.maxDurability

  /** Фон иконки по градации качества (не от attack-tier) */
  const iconBgByQuality: Record<QualityGrade, string> = {
    poor: 'bg-stone-900/50',
    common: 'bg-stone-900/50',
    good: 'bg-green-900/30',
    excellent: 'bg-blue-900/30',
    masterpiece: 'bg-purple-900/30',
    legendary: 'bg-amber-900/30',
  }
  const iconBoxBg = iconBgByQuality[weapon.qualityGrade] ?? 'bg-stone-900/50'
  // Тир Души Войны
  const warSoulTier =
    weapon.warSoul > 0 || (weapon.maxWarSoul ?? 0) > 0 || (weapon.soulPotential ?? 0) > 0
      ? getWarSoulTier(
          weapon.warSoul,
          isWarSoulPoolUncapped(weapon.maxWarSoul)
            ? Number.POSITIVE_INFINITY
            : (weapon.maxWarSoul ?? WAR_SOUL_WEAPON_POOL_MIN)
        )
    : null
  
  return (
    <motion.div
      data-workbench-mode={isWorkbench ? workbenchMode : undefined}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="min-w-0 w-full"
    >
      <Card
        role={isWorkbench ? 'button' : undefined}
        tabIndex={isWorkbench ? 0 : undefined}
        onClick={
          isWorkbench
            ? () => {
                if (weaponInActiveQueue) {
                  selectRepairBenchWeapon(weapon.id)
                } else {
                  sendWeaponToRepairBench(weapon.id)
                }
              }
            : undefined
        }
        onKeyDown={
          isWorkbench
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  if (weaponInActiveQueue) {
                    selectRepairBenchWeapon(weapon.id)
                  } else {
                    sendWeaponToRepairBench(weapon.id)
                  }
                }
              }
            : undefined
        }
        className={cn(
          'card-medieval transition-all group relative overflow-hidden w-full min-w-0',
          'hover:border-amber-600/50',
          inExpedition && 'border-green-600/50 bg-green-900/10',
          isWorkbench && 'cursor-pointer'
        )}
      >
        {/* Фоновое свечение качества */}
        <div className={cn(
          'absolute inset-0 opacity-10 pointer-events-none',
          qualityInfo.color
        )} />
        
        {/* Индикатор экспедиции */}
        {inExpedition && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
        )}
        
        <CardContent className="p-4 relative">
          {/* Заголовок с иконкой и названием */}
          <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-2 mb-3">
            {/* min-w гарантирует место под название; flex-wrap уводит бейджи на следующую строку при тесноте */}
            <div className="flex min-w-[min(100%,12.5rem)] max-w-full flex-1 items-center gap-3">
              <div className={cn(
                'w-14 h-14 shrink-0 rounded-xl flex items-center justify-center text-2xl',
                iconBoxBg
              )}>
                <WeaponIcon type={weapon.type} />
              </div>
              <div className="min-w-0 flex-1">
                <h4
                  className="font-semibold text-stone-200 leading-snug break-words"
                  title={weapon.fullName}
                >
                  {weapon.fullName}
                </h4>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                  <span className="text-xs text-stone-500">{typeStats?.name}</span>
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-amber-200/90 tabular-nums">
                    <Zap className="w-3 h-3 shrink-0 text-amber-400/90" />
                    {powerScore}
                  </span>
                  {isWorkbench && queueTouchCount > 0 ? (
                    <span className="inline-flex" onClick={(e) => e.stopPropagation()}>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0.5 border-amber-700/60 text-amber-200/90 shrink-0"
                        title="В очереди верстака"
                      >
                        ⌛ {queueTouchCount}
                      </Badge>
                    </span>
                  ) : null}
                  {isWorkbench && isMobile ? (
                    <Sheet>
                      <SheetTrigger asChild>
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] text-amber-300/90 underline-offset-2 hover:underline"
                        >
                          Подробнее
                        </button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
                        <SheetHeader>
                          <SheetTitle className="text-left text-stone-200">{weapon.fullName}</SheetTitle>
                        </SheetHeader>
                        <div className="mt-4 space-y-2 text-sm text-stone-300">
                          <p>
                            <span className="text-stone-500">Атака:</span> {weapon.stats.attack}
                          </p>
                          <p>
                            <span className="text-stone-500">Мощь:</span> {powerScore}
                          </p>
                          <p>
                            <span className="text-stone-500">Прочность:</span> {durability}/
                            {weapon.stats.maxDurability}
                          </p>
                          {hasVisibleDamage ? (
                            <p className="text-amber-200/90 text-xs">Есть повреждения — ⌛ в очереди ремонта</p>
                          ) : null}
                        </div>
                      </SheetContent>
                    </Sheet>
                  ) : null}
                </div>
              </div>
            </div>
            
            {/* Справа: как в инвентаре — сначала качество и тир души, затем метки верстака */}
            <div className="flex flex-col items-end gap-2 shrink-0 min-w-0 max-w-[min(100%,14rem)] text-right">
              {onRepairBench && (
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 border-stone-500 text-stone-400"
                  >
                    На ремонте
                  </Badge>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      returnWeaponFromRepairBench(weapon.id)
                    }}
                    className="text-[10px] rounded border border-stone-600 px-1.5 py-0.5 text-stone-300 hover:bg-stone-800"
                  >
                    Вернуть в инвентарь
                  </button>
                </div>
              )}
              <div className="flex flex-wrap justify-end gap-1.5 items-center w-full">
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className={cn(
                        'font-semibold cursor-help border-stone-600/90 shrink-0',
                        qualityBgColor,
                        'text-stone-100 shadow-inner'
                      )}
                    >
                      {qualityInfo.name}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p>Качество: {qualityInfo.name} (×{qualityInfo.multiplier})</p>
                    <p className="text-xs text-stone-400">Влияет на характеристики оружия</p>
                  </TooltipContent>
                </Tooltip>
                {warSoulTier ? (
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <Badge
                        className={cn(
                          'text-xs font-semibold gap-1 cursor-help shrink-0',
                          warSoulTier.bgColor,
                          warSoulTier.color
                        )}
                      >
                        <span>{warSoulTier.icon}</span>
                        <span>{warSoulTier.name}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p className="font-medium text-stone-200">
                        Душа войны: {warSoulTier.name}
                      </p>
                      <p className="text-xs text-stone-400 mt-1">{warSoulTier.description}</p>
                      <p className="text-xs text-stone-500 mt-2">
                        Накапливается при успешных экспедициях с этим оружием. Тир влияет на бонусы к шансу успеха, золоту и скорости роста души.
                      </p>
                      {(warSoulTier.bonus.successBonus > 0 ||
                        warSoulTier.bonus.goldBonus > 0 ||
                        warSoulTier.bonus.warSoulBonus > 0) && (
                        <p className="text-xs text-amber-200/90 mt-2">
                          Сейчас: +{warSoulTier.bonus.successBonus}% успех, +{warSoulTier.bonus.goldBonus}% золото, +{warSoulTier.bonus.warSoulBonus}% душа
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                ) : null}
              </div>
              {isWorkbench &&
              (hasVisibleDamage || durabilityPercent < 100) &&
              queueTouchCount === 0 ? (
                <div
                  className="flex flex-wrap justify-end gap-1.5 w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0.5 border-amber-800/50 text-amber-100/90 shrink-0"
                  >
                    ⚠️ нужен уход
                  </Badge>
                </div>
              ) : null}
            </div>
          </div>

          {/* ===== ОСНОВНЫЕ ХАРАКТЕРИСТИКИ ===== */}
          <div className="space-y-3 mb-3">
            
            {/* АТАКА */}
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-3 cursor-help bg-red-500/10 rounded-lg px-3 py-2">
                  <Sword className="w-5 h-5 text-red-400" />
                  <div className="flex-1">
                    <div className="text-xs text-stone-500 mb-0.5">Атака</div>
                    <div className="text-xl font-bold text-red-400">{weapon.stats.attack}</div>
                  </div>
                  <div className="text-xs text-stone-500">{typeStats?.name}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="font-semibold text-red-400">Атака: {weapon.stats.attack}</p>
                <p className="text-xs text-stone-400">Определяет урон в бою и эффективность экспедиций</p>
              </TooltipContent>
            </Tooltip>

            {/* ПРОЧНОСТЬ */}
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-help">
                  <Heart className={cn('w-4 h-4', durabilityColor)} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-stone-500">Прочность</span>
                      <span className={cn('text-xs font-medium', durabilityColor)}>{durability}/{weapon.stats.maxDurability}</span>
                    </div>
                    <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                      <div 
                        className={cn('h-full rounded-full transition-all', durabilityBgColor)} 
                        style={{ width: `${durabilityPercent}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="font-semibold">Прочность: {durability}/{weapon.stats.maxDurability}</p>
                <p className="text-xs text-stone-400">Уменьшается в экспедициях. При 0% оружие непригодно</p>
              </TooltipContent>
            </Tooltip>

            {/* КАЧЕСТВО (ступени внутри градации v2) */}
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-help">
                  <Star className={cn('w-4 h-4', qualityInfo.color)} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-stone-500">Качество</span>
                      <span className={cn('text-xs font-medium tabular-nums', qualityInfo.color)}>
                        {qInGrade.step}/{qInGrade.steps}
                      </span>
                    </div>
                    <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                      <div 
                        className={cn('h-full rounded-full transition-all', qualityBgColor)} 
                        style={{ width: `${Math.round(qInGrade.progressInGrade * 100)}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className={cn('font-semibold', qualityInfo.color)}>
                  {qualityInfo.name}: шаг {qInGrade.step} из {qInGrade.steps}
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  Градация при крафте. Выше шаг — сильнее бонус к характеристикам.
                  {qInGrade.nextGradeMin !== null && (
                    <> До следующей градации: {qInGrade.nextGradeMin - weapon.quality}.</>
                  )}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* ===== СПЕЦИАЛЬНЫЕ СВОЙСТВА ===== */}
          <div className="pt-2 border-t border-stone-700/50 mb-3">
            <p className="text-xs text-stone-500 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Накопленные свойства
            </p>
            <div className="flex flex-wrap gap-2">
            {/* Душа Войны с тиром и прогресс-баром */}
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <div className={cn(
                    'flex items-center gap-2 px-2.5 py-1.5 rounded-md border cursor-help transition-colors',
                    weapon.warSoul > 0 
                      ? 'bg-purple-900/30 border-purple-600/50 text-purple-400' 
                      : 'bg-stone-800/80 border-stone-700/50 text-stone-500'
                  )}>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-xs text-stone-400">Душа:</span>
                    <span className={cn('text-sm font-semibold', weapon.warSoul > 0 ? 'text-purple-400' : 'text-stone-500')}>
                      {weapon.warSoul}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  {(() => {
                    const uncapped = isWarSoulPoolUncapped(weapon.maxWarSoul)
                    const poolCap = uncapped
                      ? Number.POSITIVE_INFINITY
                      : (weapon.maxWarSoul ?? WAR_SOUL_WEAPON_POOL_MIN)
                    const tier = getWarSoulTier(weapon.warSoul, poolCap)
                    const progress = getProgressToNextTier(weapon.warSoul, poolCap)
                    const barMax = resolveWarSoulProgressBarMax(weapon.warSoul, poolCap)
                    const nextTier = getNextTierInfo(weapon.warSoul, poolCap)
                    const tierBonuses = tier.bonus
                    const pot = weapon.soulPotential ?? weapon.stats.soulPotential ?? 1
                    return (
                      <>
                        <p className="font-semibold text-purple-400">
                          {nextTier
                            ? `${tier.icon} ${tier.name}: ${weapon.warSoul}/${barMax} душ до «${nextTier.name}»`
                            : uncapped
                              ? `${tier.icon} ${tier.name}: ${weapon.warSoul} душ`
                              : `${tier.icon} ${tier.name}: ${weapon.warSoul}/${barMax} душ (пул)`}
                        </p>
                        <p className="text-xs text-amber-200/90 mt-1">
                          Потенциал души: ×{pot.toFixed(2)} к награде за миссию
                        </p>
                        <p className="text-xs text-stone-400 mt-1">
                          Прогресс к следующему тиру: {progress}%
                        </p>
                        <div className="mt-2 pt-2 border-t border-stone-700/50">
                          <p className="text-xs font-medium text-stone-300 mb-1">Бонусы текущего тира:</p>
                          {tierBonuses.successBonus > 0 && <p className="text-xs text-stone-400">+{tierBonuses.successBonus}% шанс успеха</p>}
                          {tierBonuses.goldBonus > 0 && <p className="text-xs text-stone-400">+{tierBonuses.goldBonus}% золота</p>}
                          {tierBonuses.warSoulBonus > 0 && <p className="text-xs text-stone-400">+{tierBonuses.warSoulBonus}% душ</p>}
                          {tierBonuses.critChance > 0 && <p className="text-xs text-stone-400">+{tierBonuses.critChance}% крита</p>}
                        </div>
                      </>
                    )
                  })()}
                </TooltipContent>
              </Tooltip>

              {/* Количество экспедиций */}
              {(weapon.adventureCount ?? 0) > 0 && (
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-stone-800/80 border border-stone-700/50 text-stone-400 cursor-help">
                      <MapIcon className="w-3.5 h-3.5" />
                      <span className="text-xs text-stone-400">Вылазок:</span>
                      <span className="text-sm font-semibold text-stone-300">{weapon.adventureCount ?? 0}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="font-semibold">Экспедиций: {weapon.adventureCount ?? 0}</p>
                    <p className="text-xs text-stone-400">Количество успешных вылазок с этим оружием</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* ===== МАТЕРИАЛЫ ===== */}
          {weapon.materials && weapon.materials.length > 0 && (
            <div className="pt-2 border-t border-stone-700/50 mb-3">
              <p className="text-xs text-stone-500 mb-2 flex items-center gap-1">
                <Package className="w-3 h-3" />
                Состав оружия
              </p>
              {(() => {
                const uniqueMaterials = Array.from(
                  new Map(weapon.materials.map(m => [m.materialId, m])).values()
                );
                return (
                  <div className="flex flex-wrap gap-2">
                    {uniqueMaterials.map((mat, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-stone-800/60 border-stone-600/50">
                        <span className="text-stone-400">{mat.materialName}</span>
                      </Badge>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Повреждения и переход на ремонт — внизу, после состава */}
          {(hasVisibleDamage ||
            (needsRepairShortcut && !inExpedition && !onRepairBench)) && (
            <div className="pt-2 border-t border-stone-700/50 space-y-2">
              {hasVisibleDamage && (
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <div className="flex flex-wrap items-center gap-1.5 cursor-help rounded-lg border border-amber-800/50 bg-amber-950/30 px-2 py-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                      {damageUi.labels.map((label, i) => (
                        <Badge
                          key={`${label}-${i}`}
                          variant="outline"
                          className="text-[10px] border-amber-700/60 text-amber-200/90 max-w-[9rem] truncate"
                        >
                          {label}
                        </Badge>
                      ))}
                      {damageUi.more > 0 && (
                        <span className="text-[10px] text-amber-400/90">+{damageUi.more}</span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="font-medium text-amber-200">Видимые повреждения ({damageUi.total})</p>
                    <p className="text-xs text-stone-400 mt-1">
                      Устраняются на вкладке «Ремонт» после отправки клинка на верстак.
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
              {needsRepairShortcut && !inExpedition && !onRepairBench && context === 'inventory' && (
                <button
                  type="button"
                  onClick={() => {
                    sendWeaponToRepairBench(weapon.id)
                    navigateToForgeTab('repair')
                  }}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-md border border-amber-700/55 bg-stone-900/70 px-3 py-2 text-xs font-medium text-amber-100/95 hover:bg-amber-950/40"
                >
                  <Wrench className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  Отправить на ремонт
                </button>
              )}
            </div>
          )}

          {(onRepairBench || (isWorkbench && onWorkbenchBench)) && (
            <WeaponRepairLegacyDebugPanel weapon={weapon} />
          )}

        </CardContent>
      </Card>
    </motion.div>
  )
}
