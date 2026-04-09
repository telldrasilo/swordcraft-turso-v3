'use client'

import { useMemo, useState } from 'react'
import { Lock, Sparkles, ExternalLink } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  REFORGE_TECHNIQUES,
  type ReforgeTechniqueEntry,
} from '@/data/reforge/reforge-techniques-registry'
import { getMaterialProcessingTechniqueById } from '@/data/material-processing-techniques'
import { getWarSoulTier } from '@/data/war-soul-tiers'
import { getIntendantReforgeTechniqueOffer } from '@/data/guild/intendant-catalog'
import {
  computeAwakenScarChance,
  getAwakenChanceBreakdown,
  isReforgeTechniqueUnlocked,
  listScarCandidates,
  resolveBuffReforgeWarSoulCost,
  type ReforgeApplyContext,
} from '@/lib/reforge'
import { useGameStore } from '@/store'
import type { CraftedWeaponV2 } from '@/types/craft-v2'
import { WorkbenchQueueBlockOverlay } from '@/components/forge/workbench-queue-block-overlay'

function nextUnawakenedScarKey(weapon: CraftedWeaponV2): string | null {
  const candidates = listScarCandidates(weapon.weaponLegacy)
  const awakened = weapon.weaponReforge?.awakenedScarKeys ?? {}
  for (const c of candidates) {
    if (!awakened[c.key]) return c.key
  }
  return null
}

function describeBlockReason(
  tech: ReforgeTechniqueEntry,
  weapon: CraftedWeaponV2 | undefined,
  ctx: ReforgeApplyContext
): string | null {
  if (!weapon) return 'Поставьте клинок на верстак во вкладке «Ремонт».'
  if (!isReforgeTechniqueUnlocked(tech, ctx)) {
    if (ctx.guildLevel < tech.minGuildLevel) {
      return `Нужен уровень гильдии ≥ ${tech.minGuildLevel}.`
    }
    if (tech.reforgeTier === 'specialized') {
      const mt = tech.sourceCraftTechniqueId
        ? getMaterialProcessingTechniqueById(tech.sourceCraftTechniqueId)
        : null
      const craftHint = mt
        ? `либо освойте в кузне «${mt.name}»`
        : 'либо выполните условия в кузне'
      return `Купите технику у интенданта (${craftHint}).`
    }
    if (tech.sourceCraftTechniqueId) {
      const mt = getMaterialProcessingTechniqueById(tech.sourceCraftTechniqueId)
      return `Нужна техника обработки в кузне: «${mt?.name ?? tech.sourceCraftTechniqueId}» (уровень кузнеца / плавка).`
    }
    return 'Техника перековки недоступна.'
  }
  if (tech.reforgeType === 'awakenScar') {
    if (weapon.weaponReforge?.scarAwakeningCompleted) {
      return 'Уже было успешное пробуждение шрама (один успех на клинок в этой фазе).'
    }
    if (weapon.warSoul <= 0) return 'Нужна душа войны на клинке (пробуждение сжигает всю текущую душу).'
    if (listScarCandidates(weapon.weaponLegacy).length === 0) return 'Нет шрамов на клинке (веса в наследии).'
    if (nextUnawakenedScarKey(weapon) == null) return 'Нет доступных шрамов для пробуждения.'
  } else if (
    tech.reforgeType === 'buffStat' &&
    weapon.warSoul < resolveBuffReforgeWarSoulCost(weapon, tech.warSoulCost)
  ) {
    return 'Недостаточно души войны на этом клинке.'
  }
  if (tech.reforgeType === 'buffStat' && tech.buffStat === 'attack') {
    const stacks = weapon.weaponReforge?.attackBonusStacks ?? 0
    if (stacks >= (tech.maxStacks ?? 5)) return 'Достигнут общий лимит усилений атаки для всех техник этой оси.'
  }
  if (tech.reforgeType === 'buffStat' && tech.buffStat === 'maxDurability') {
    const stacks = weapon.weaponReforge?.maxDurabilityBonusStacks ?? 0
    if (stacks >= (tech.maxStacks ?? 5))
      return 'Достигнут общий лимит усилений прочности для всех техник этой оси.'
  }
  return null
}

function TechniqueBlock(props: {
  tech: ReforgeTechniqueEntry
  weapon: CraftedWeaponV2
  ctx: ReforgeApplyContext
  stacksAttack: number
  stacksMax: number
  onApplyBuff: (techniqueId: string) => void
  onOpenAwakenConfirm: (techniqueId: string) => void
  onGoIntendant: (techniqueId: string) => void
  onEnqueueToWorkbench?: (techniqueId: string, kind: 'reforge_buff' | 'reforge_awaken') => void
  /** Только постановка в очередь — без мгновенного «Применить» / «Пробудить». */
  workbenchQueueOnly?: boolean
}) {
  const {
    tech,
    weapon,
    ctx,
    stacksAttack,
    stacksMax,
    onApplyBuff,
    onOpenAwakenConfirm,
    onGoIntendant,
    onEnqueueToWorkbench,
    workbenchQueueOnly = false,
  } = props
  const block = describeBlockReason(tech, weapon, ctx)
  const unlocked = isReforgeTechniqueUnlocked(tech, ctx)
  const chance =
    tech.reforgeType === 'awakenScar' ? computeAwakenScarChance(weapon, tech) : null
  const breakdown =
    tech.reforgeType === 'awakenScar' ? getAwakenChanceBreakdown(weapon, tech) : null
  const hasIntendantOffer =
    tech.reforgeTier === 'specialized' && Boolean(getIntendantReforgeTechniqueOffer(tech.id))

  const buffSoulCost =
    tech.reforgeType === 'buffStat'
      ? resolveBuffReforgeWarSoulCost(weapon, tech.warSoulCost)
      : null
  const costTitle =
    tech.reforgeType === 'buffStat' && buffSoulCost != null && buffSoulCost > tech.warSoulCost
      ? `${buffSoulCost.toLocaleString('ru-RU')} ДВ (база ${tech.warSoulCost.toLocaleString('ru-RU')} с учётом ранга души)`
      : null

  const statLine =
    tech.reforgeType === 'buffStat' && tech.buffStat === 'attack' ? (
      <span>
        Усиления атаки: {stacksAttack}/{tech.maxStacks ?? 5} (общий лимит на все техники атаки)
        {tech.buffPercentMin != null && tech.buffPercentMax != null && (
          <span className="text-stone-600"> · ориентир +{tech.buffPercentMin}–{tech.buffPercentMax}%</span>
        )}
      </span>
    ) : tech.reforgeType === 'buffStat' && tech.buffStat === 'maxDurability' ? (
      <span>
        Усиления прочности: {stacksMax}/{tech.maxStacks ?? 5} (общий лимит на все техники прочности)
        {tech.buffPercentMin != null && tech.buffPercentMax != null && (
          <span className="text-stone-600"> · ориентир +{tech.buffPercentMin}–{tech.buffPercentMax}%</span>
        )}
      </span>
    ) : null

  const typeLabel =
    tech.reforgeType === 'buffStat'
      ? tech.buffStat === 'attack'
        ? 'Усиление атаки'
        : 'Усиление прочности'
      : 'Пробуждение шрама'

  return (
    <div className="rounded-lg border border-stone-700/80 bg-stone-900/40 p-3 space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="flex flex-wrap items-center gap-1.5 font-medium text-stone-200">
            {tech.name}
            {tech.reforgeTier === 'basic' ? (
              <span className="text-[10px] font-normal text-stone-500">Базовая</span>
            ) : unlocked ? (
              <span className="text-[10px] font-normal text-emerald-500/90">Углублённая</span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-normal text-amber-500/90">
                <Lock className="w-3 h-3" />
                интендант / кузня
              </span>
            )}
          </p>
          <p className="text-xs text-stone-500 mt-0.5">{tech.description}</p>
        </div>
        <Badge
          variant="outline"
          className="text-amber-200/90 border-amber-700/50 shrink-0 max-w-[min(100%,12rem)] text-right"
          title={costTitle ?? undefined}
        >
          {tech.awakenSpendsAllWarSoul
            ? 'Вся ДВ'
            : buffSoulCost != null
              ? `${buffSoulCost.toLocaleString('ru-RU')} ДВ`
              : `${tech.warSoulCost.toLocaleString('ru-RU')} ДВ`}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2 text-[11px] text-stone-500">
        <span>{typeLabel}</span>
        {statLine}
        {chance != null && breakdown && (
          <span className="text-amber-200/80" title={breakdownLines(breakdown)}>
            Шанс пробуждения: {Math.round(chance * 100)}%
          </span>
        )}
      </div>
      {breakdown && tech.reforgeType === 'awakenScar' && (
        <p className="text-[10px] text-stone-600 leading-snug">{breakdownLines(breakdown)}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {!workbenchQueueOnly &&
          (tech.reforgeType === 'awakenScar' ? (
            <Button
              size="sm"
              className="w-full sm:w-auto"
              disabled={Boolean(block)}
              onClick={() => onOpenAwakenConfirm(tech.id)}
              title={block ?? undefined}
            >
              Пробудить…
            </Button>
          ) : (
            <Button
              size="sm"
              className="w-full sm:w-auto"
              disabled={Boolean(block)}
              onClick={() => onApplyBuff(tech.id)}
              title={block ?? undefined}
            >
              Применить
            </Button>
          ))}
        {!unlocked && hasIntendantOffer && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1 border-amber-800/50 text-amber-200/90"
            onClick={() => onGoIntendant(tech.id)}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            У интенданта
          </Button>
        )}
        {!block && onEnqueueToWorkbench && (
          <Button
            size="sm"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() =>
              onEnqueueToWorkbench(
                tech.id,
                tech.reforgeType === 'awakenScar' ? 'reforge_awaken' : 'reforge_buff'
              )
            }
          >
            В очередь
          </Button>
        )}
      </div>
      {block && <p className="text-xs text-amber-600/90">{block}</p>}
    </div>
  )
}

function breakdownLines(b: ReturnType<typeof getAwakenChanceBreakdown>): string {
  return [
    `база ${Math.round(b.base * 100)}%`,
    `+ накопление ДВ ${Math.round(b.poolContribution * 100)}% (доля шкалы ${Math.round(b.poolRatio * 100)}%)`,
    `+ тир души (${b.tier}) ${Math.round(b.tierBonus * 100)}%`,
    `= до ограничения ${Math.round(Math.min(0.9, b.base + b.poolContribution + b.tierBonus) * 100)}%`,
  ].join(' · ')
}

export function ReforgeCard(props: {
  weapon: CraftedWeaponV2 | undefined
  ctx: ReforgeApplyContext
  onApply: (techniqueId: string) => void
  onEnqueueToWorkbench?: (techniqueId: string, kind: 'reforge_buff' | 'reforge_awaken') => void
  /** Модалка верстака: только «В очередь», без мгновенного применения. */
  workbenchQueueOnly?: boolean
  /** Перекрытие «В очереди» над всеми блоками усиления (есть reforge_buff в очереди). */
  blockBuffSectionsForQueue?: boolean
  /** Перекрытие над блоком пробуждения (есть reforge_awaken в очереди). */
  blockAwakenSectionForQueue?: boolean
}) {
  const {
    weapon,
    ctx,
    onApply,
    onEnqueueToWorkbench,
    workbenchQueueOnly = false,
    blockBuffSectionsForQueue = false,
    blockAwakenSectionForQueue = false,
  } = props
  const navigateToGuildIntendantReforgeTechnique = useGameStore(
    (s) => s.navigateToGuildIntendantReforgeTechnique
  )
  const [awakenTechId, setAwakenTechId] = useState<string | null>(null)

  const groups = useMemo(() => {
    const buffBasic = REFORGE_TECHNIQUES.filter(
      (t) => t.reforgeType === 'buffStat' && t.reforgeTier === 'basic'
    )
    const buffSpec = REFORGE_TECHNIQUES.filter(
      (t) => t.reforgeType === 'buffStat' && t.reforgeTier === 'specialized'
    )
    const awaken = REFORGE_TECHNIQUES.filter((t) => t.reforgeType === 'awakenScar')
    return { buffBasic, buffSpec, awaken }
  }, [])

  if (!weapon) return null

  const tierInfo = getWarSoulTier(weapon.warSoul, weapon.maxWarSoul)
  const stacksAttack = weapon.weaponReforge?.attackBonusStacks ?? 0
  const stacksMax = weapon.weaponReforge?.maxDurabilityBonusStacks ?? 0
  const awakenTech = awakenTechId ? REFORGE_TECHNIQUES.find((t) => t.id === awakenTechId) : null
  const awakenChance = awakenTech ? computeAwakenScarChance(weapon, awakenTech) : 0

  return (
    <>
      <Card className="card-medieval bg-stone-800/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-amber-200">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Перековка: {weapon.fullName}
          </CardTitle>
          <div className="text-xs text-stone-400 space-y-0.5">
            <p>
              Душа войны:{' '}
              <span className="text-amber-200/90 font-medium tabular-nums">
                {weapon.warSoul.toLocaleString('ru-RU')}
              </span>{' '}
              · тир: {tierInfo.icon} {tierInfo.name}
            </p>
            <p className="text-stone-500">
              Усиления списывают душу войны; чем выше её ранг на клинке, тем выше цена за стак. Шрамы и
              поломки чинят во вкладке «Ремонт» того же верстака.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative isolate space-y-6 rounded-[inherit] [contain:layout]">
            {blockBuffSectionsForQueue ? <WorkbenchQueueBlockOverlay /> : null}
            <section className="space-y-2">
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
                Усиление — базовые
              </h3>
              <div className="space-y-3">
                {groups.buffBasic.map((tech) => (
                  <TechniqueBlock
                    key={tech.id}
                    tech={tech}
                    weapon={weapon}
                    ctx={ctx}
                    stacksAttack={stacksAttack}
                    stacksMax={stacksMax}
                    onApplyBuff={onApply}
                    onOpenAwakenConfirm={onApply}
                    onGoIntendant={navigateToGuildIntendantReforgeTechnique}
                    onEnqueueToWorkbench={onEnqueueToWorkbench}
                    workbenchQueueOnly={workbenchQueueOnly}
                  />
                ))}
              </div>
            </section>
            <section className="space-y-2">
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
                Усиление — углублённые
              </h3>
              <div className="space-y-3">
                {groups.buffSpec.map((tech) => (
                  <TechniqueBlock
                    key={tech.id}
                    tech={tech}
                    weapon={weapon}
                    ctx={ctx}
                    stacksAttack={stacksAttack}
                    stacksMax={stacksMax}
                    onApplyBuff={onApply}
                    onOpenAwakenConfirm={onApply}
                    onGoIntendant={navigateToGuildIntendantReforgeTechnique}
                    onEnqueueToWorkbench={onEnqueueToWorkbench}
                    workbenchQueueOnly={workbenchQueueOnly}
                  />
                ))}
              </div>
            </section>
          </div>
          <div className="relative isolate space-y-2 rounded-[inherit] [contain:layout]">
            {blockAwakenSectionForQueue ? <WorkbenchQueueBlockOverlay /> : null}
            <section className="space-y-2">
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
                Пробуждение шрама
              </h3>
              <div className="space-y-3">
                {groups.awaken.map((tech) => (
                  <TechniqueBlock
                    key={tech.id}
                    tech={tech}
                    weapon={weapon}
                    ctx={ctx}
                    stacksAttack={stacksAttack}
                    stacksMax={stacksMax}
                    onApplyBuff={onApply}
                    onOpenAwakenConfirm={setAwakenTechId}
                    onGoIntendant={navigateToGuildIntendantReforgeTechnique}
                    onEnqueueToWorkbench={onEnqueueToWorkbench}
                    workbenchQueueOnly={workbenchQueueOnly}
                  />
                ))}
              </div>
            </section>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={awakenTechId != null} onOpenChange={(o) => !o && setAwakenTechId(null)}>
        <AlertDialogContent className="border-stone-700 bg-stone-900 text-stone-100 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Пробуждение шрама</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-stone-300 text-sm space-y-2">
                <p>
                  Будет списана <strong>вся</strong> текущая душа войны на клинке (
                  {weapon.warSoul.toLocaleString('ru-RU')} ДВ).
                </p>
                <p>
                  Шанс успеха около <strong>{Math.round(awakenChance * 100)}%</strong>. При неудаче душа всё равно
                  тратится; слот успешного пробуждения не расходуется.
                </p>
                {awakenTech && (
                  <p className="text-[11px] text-stone-500">
                    {breakdownLines(getAwakenChanceBreakdown(weapon, awakenTech))}
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-stone-600">Отмена</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-700 hover:bg-amber-600"
              onClick={() => {
                if (awakenTechId) onApply(awakenTechId)
                setAwakenTechId(null)
              }}
            >
              Сжечь душу и попытаться
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
