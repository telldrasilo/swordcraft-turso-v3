'use client'

import { Lock, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  REFORGE_TECHNIQUES,
  type ReforgeTechniqueEntry,
} from '@/data/reforge/reforge-techniques-registry'
import { getMaterialProcessingTechniqueById } from '@/data/material-processing-techniques'
import {
  computeAwakenScarChance,
  isReforgeTechniqueUnlocked,
  listScarCandidates,
  type ReforgeApplyContext,
} from '@/lib/reforge'
import type { CraftedWeaponV2 } from '@/types/craft-v2'

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
      return `Купите технику у интенданта гильдии (${craftHint}).`
    }
    if (tech.sourceCraftTechniqueId) {
      const mt = getMaterialProcessingTechniqueById(tech.sourceCraftTechniqueId)
      return `Нужна техника обработки в кузне: «${mt?.name ?? tech.sourceCraftTechniqueId}» (уровень кузнеца / плавка).`
    }
    return 'Техника перековки недоступна.'
  }
  if (tech.reforgeType === 'awakenScar') {
    if (weapon.weaponReforge?.scarAwakeningCompleted) {
      return 'Уже было успешное пробуждение шрама (фаза 1 — одно на клинок).'
    }
    if (weapon.warSoul <= 0) return 'Нужна душа войны на клинке (пробуждение сжигает всю текущую душу).'
    if (listScarCandidates(weapon.weaponLegacy).length === 0) return 'Нет шрамов на клинке (веса в наследии).'
    if (nextUnawakenedScarKey(weapon) == null) return 'Нет доступных шрамов для пробуждения.'
  } else if (weapon.warSoul < tech.warSoulCost) {
    return 'Недостаточно души войны на этом клинке.'
  }
  if (tech.reforgeType === 'buffStat' && tech.buffStat === 'attack') {
    const stacks = weapon.weaponReforge?.attackBonusStacks ?? 0
    if (stacks >= (tech.maxStacks ?? 5)) return 'Достигнут лимит усилений.'
  }
  if (tech.reforgeType === 'buffStat' && tech.buffStat === 'maxDurability') {
    const stacks = weapon.weaponReforge?.maxDurabilityBonusStacks ?? 0
    if (stacks >= (tech.maxStacks ?? 5)) return 'Достигнут лимит усилений.'
  }
  return null
}

export function ReforgeCard(props: {
  weapon: CraftedWeaponV2 | undefined
  ctx: ReforgeApplyContext
  onApply: (techniqueId: string) => void
}) {
  const { weapon, ctx, onApply } = props

  return (
    <Card className="card-medieval bg-stone-800/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-amber-200">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Техники перековки
        </CardTitle>
        <p className="text-xs text-stone-500">
          Расход души войны на этом клинке. Клинок должен стоять на верстаке (как для ремонта).
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {REFORGE_TECHNIQUES.map((tech) => {
          const block = describeBlockReason(tech, weapon, ctx)
          const chance =
            weapon && tech.reforgeType === 'awakenScar'
              ? computeAwakenScarChance(weapon, tech)
              : null
          const stacksAttack = weapon?.weaponReforge?.attackBonusStacks ?? 0
          const stacksMax = weapon?.weaponReforge?.maxDurabilityBonusStacks ?? 0

          return (
            <div
              key={tech.id}
              className="rounded-lg border border-stone-700/80 bg-stone-900/40 p-3 space-y-2"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="flex flex-wrap items-center gap-1.5 font-medium text-stone-200">
                    {tech.name}
                    {tech.reforgeTier === 'basic' ? (
                      <span className="text-[10px] font-normal text-stone-500">Базовая</span>
                    ) : isReforgeTechniqueUnlocked(tech, ctx) ? (
                      <span className="text-[10px] font-normal text-emerald-500/90">Спец.</span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-normal text-amber-500/90">
                        <Lock className="w-3 h-3" />
                        интендант
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">{tech.description}</p>
                </div>
                <Badge variant="outline" className="text-amber-200/90 border-amber-700/50 shrink-0">
                  {tech.awakenSpendsAllWarSoul ? 'Вся ДВ' : `${tech.warSoulCost.toLocaleString('ru-RU')} ДВ`}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-stone-500">
                <span>Тип: {tech.reforgeType === 'buffStat' ? 'бафф' : 'пробуждение шрама'}</span>
                {tech.reforgeType === 'buffStat' && tech.buffStat === 'attack' && (
                  <span>
                    Стаки атаки: {stacksAttack}/{tech.maxStacks ?? 5}
                    {tech.buffPercentMin != null && tech.buffPercentMax != null && (
                      <span className="text-stone-600"> · бонус {tech.buffPercentMin}–{tech.buffPercentMax}%</span>
                    )}
                  </span>
                )}
                {tech.reforgeType === 'buffStat' && tech.buffStat === 'maxDurability' && (
                  <span>
                    Стаки прочности: {stacksMax}/{tech.maxStacks ?? 5}
                    {tech.buffPercentMin != null && tech.buffPercentMax != null && (
                      <span className="text-stone-600"> · бонус {tech.buffPercentMin}–{tech.buffPercentMax}%</span>
                    )}
                  </span>
                )}
                {chance != null && (
                  <span className="text-amber-200/80">Шанс пробуждения: {Math.round(chance * 100)}%</span>
                )}
              </div>
              <Button
                size="sm"
                className="w-full sm:w-auto"
                disabled={Boolean(block)}
                onClick={() => onApply(tech.id)}
                title={block ?? undefined}
              >
                Применить
              </Button>
              {block && <p className="text-xs text-amber-600/90">{block}</p>}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
