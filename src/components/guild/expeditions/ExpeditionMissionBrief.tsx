'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Gauge, Map, Send } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ExpeditionTemplate } from '@/data/expedition-templates'
import { difficultyInfo } from '@/data/expedition-templates'
import type { ExpeditionCalculation } from '@/lib/expedition-calculator-v2'
import { CONTRACT_CONFIG, type ContractType } from '@/modules/expeditions/data/missions/_mission-template'
import { cn } from '@/lib/utils'
import { getExpeditionOutcomeSegments } from '@/lib/expedition-outcome-segments'
import { ExpeditionClientPaymentBreakdown } from '@/components/guild/expeditions/ExpeditionClientPaymentBreakdown'
import { FullModifierBreakdown } from '@/components/ui/modifier-breakdown'

export interface ExpeditionMissionBriefProps {
  expedition: ExpeditionTemplate
  calculation: ExpeditionCalculation
  missionContract: ContractType
  onMissionContractChange: (c: ContractType) => void
  adventurerName: string
  weaponName: string
  onLaunch: () => void
  /** Согласовано с validateExpeditionStart / startExpeditionFull */
  canLaunch?: boolean
  launchBlockedReason?: string
  /** Панель отладки (рендерится внизу карточки) */
  devControls?: React.ReactNode
}

export function ExpeditionMissionBrief({
  expedition,
  calculation,
  missionContract,
  onMissionContractChange,
  adventurerName,
  weaponName,
  onLaunch,
  canLaunch = true,
  launchBlockedReason = '',
  devControls,
}: ExpeditionMissionBriefProps) {
  const diff = difficultyInfo[expedition.difficulty]
  const segs = getExpeditionOutcomeSegments(calculation.successChance, calculation.critChance)

  const bsGold = calculation.commission
  const bsGoldCrit = Math.floor(bsGold * 1.5)
  const ws = calculation.warSoul
  const wsCrit = Math.floor(ws * 1.5)

  return (
    <Card className="card-medieval border-amber-700/40 overflow-hidden">
      <CardContent className="p-4 sm:p-5 space-y-5">
        <header className="flex flex-wrap items-start gap-3 border-b border-stone-700/60 pb-4">
          <div className="text-3xl leading-none" aria-hidden>
            {expedition.icon}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-base font-semibold text-stone-100 leading-snug">{expedition.name}</h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
              {expedition.moduleLocationName && (
                <span className="text-stone-400">{expedition.moduleLocationName}</span>
              )}
              <Badge variant="outline" className={cn('text-[10px] border-stone-600', diff.color)}>
                {diff.name}
              </Badge>
            </div>
            <p className="text-[11px] text-stone-500 leading-snug pt-1">
              Заказчик платит по контракту, гильдия удерживает комиссию, кузнец получает долю при успехе.{' '}
              <span className="text-stone-400">Старт миссии не списывает ваше золото.</span> Поля «снабжение /
              залог» в данных миссии — условия контракта заказчика, не оплата с вашего счёта.
            </p>
          </div>
        </header>

        {/* Договор: компактное сравнение */}
        <section aria-label="Тип договора">
          <p className="text-[11px] font-medium uppercase tracking-wide text-stone-500 mb-2">
            Договор
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(['exploration', 'speed'] as const).map((key) => {
              const cfg = CONTRACT_CONFIG[key]
              const active = missionContract === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onMissionContractChange(key)}
                  className={cn(
                    'rounded-lg border px-3 py-2.5 text-left transition-all',
                    active
                      ? 'border-amber-500/80 bg-amber-950/35 ring-1 ring-amber-500/40'
                      : 'border-stone-600/50 bg-stone-900/25 hover:border-stone-500/55'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {key === 'exploration' ? (
                      <Map className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Gauge className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    )}
                    <span className="text-sm font-medium text-stone-100">{cfg.name}</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-snug">
                    {key === 'exploration'
                      ? 'Дольше путь и больше событий — выше находки материалов.'
                      : 'Короче маршрут — быстрее возврат, материалов в среднем меньше.'}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] tabular-nums text-stone-500">
                    <span>Ваша доля золота</span>
                    <span className="text-stone-300">{cfg.blacksmithGoldPercent}%</span>
                    <span>Материалы (×)</span>
                    <span className="text-stone-300">{cfg.materialFindMultiplier.toFixed(1)}</span>
                    <span>Длительность (×)</span>
                    <span className="text-stone-300">{cfg.durationMultiplier.toFixed(1)}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <ExpeditionClientPaymentBreakdown economy={calculation.economy} />

        {/* Риск и исходы */}
        <section aria-label="Исход миссии">
          <p className="text-[11px] font-medium uppercase tracking-wide text-stone-500 mb-2">
            Исход миссии
          </p>
          <div
            className="flex h-3 w-full overflow-hidden rounded-full bg-stone-800 border border-stone-700/60"
            role="img"
            aria-label={`Провал ${segs.failPct}%, успех ${segs.successNoCritPct}%, крит ${segs.critPct}%`}
          >
            <div
              className="h-full bg-red-600/75"
              style={{ width: `${segs.failPct}%` }}
              title={`Провал ${segs.failPct}%`}
            />
            <div
              className="h-full bg-emerald-600/80"
              style={{ width: `${segs.successNoCritPct}%` }}
              title={`Успех ${segs.successNoCritPct}%`}
            />
            <div
              className="h-full bg-amber-500/85"
              style={{ width: `${segs.critPct}%` }}
              title={`Крит при успехе ${segs.critPct}%`}
            />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] tabular-nums text-stone-500">
            <span>
              Провал <span className="text-red-400/90">{segs.failPct}%</span>
            </span>
            <span>
              Успех <span className="text-emerald-400/90">{segs.successNoCritPct}%</span>
            </span>
            <span>
              Крит{' '}
              <span className="text-amber-400/90">
                {segs.critPct}%{' '}
                <span className="text-stone-600 normal-case">(если миссия удалась)</span>
              </span>
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-2">
            Шанс крита: <span className="tabular-nums text-stone-300">{calculation.critChance}%</span> при
            успешном исходе · износ оружия{' '}
            <span className="tabular-nums text-stone-300">−{calculation.weaponWear}%</span> · при провале шанс
            потери оружия{' '}
            <span className="tabular-nums text-amber-200/90">{calculation.weaponLossChance}%</span>
          </p>
        </section>

        {/* Награды при успехе */}
        <section aria-label="Награды при успехе">
          <p className="text-[11px] font-medium uppercase tracking-wide text-stone-500 mb-2">
            При успехе
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={missionContract}
              initial={{ opacity: 0.5, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0.5 }}
              transition={{ duration: 0.15 }}
              className="rounded-lg border border-stone-700/50 bg-stone-900/40 px-3 py-2.5 space-y-1.5 text-sm tabular-nums"
            >
              <div className="flex flex-wrap justify-between gap-2 text-stone-200">
                <span className="text-stone-400 text-xs">Золото кузнецу</span>
                <span>
                  {bsGold}{' '}
                  <span className="text-stone-500 text-xs">
                    · крит <span className="text-amber-300/90">{bsGoldCrit}</span>
                  </span>
                </span>
              </div>
              <div className="flex flex-wrap justify-between gap-2 text-stone-200">
                <span className="text-stone-400 text-xs">Души войны</span>
                <span>
                  {ws}{' '}
                  <span className="text-stone-500 text-xs">
                    · крит <span className="text-purple-300/90">{wsCrit}</span>
                  </span>
                </span>
              </div>
              <p className="text-[10px] text-stone-600 pt-1 border-t border-stone-800/80">
                Плюс золото и материалы из находок в журнале миссии (только при успехе).
              </p>
            </motion.div>
          </AnimatePresence>
        </section>

        <section aria-label="При провале">
          <p className="text-[11px] font-medium uppercase tracking-wide text-stone-500 mb-1">
            При провале
          </p>
          <p className="text-xs text-stone-400 leading-relaxed">
            Выплата заказчика, души и добыча из событий не начисляются; износ оружия применяется; возможна
            потеря оружия с указанным шансом.
          </p>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-stone-700/50">
          <p className="text-xs text-stone-500 min-w-0">
            <span className="text-stone-400">{adventurerName}</span>
            <span className="mx-1.5 text-stone-600">·</span>
            <span className="text-stone-400">{weaponName}</span>
          </p>
          <div className="flex flex-col gap-2 w-full sm:w-auto sm:items-end">
            {!canLaunch && launchBlockedReason ? (
              <p className="text-xs text-red-400/90 text-right sm:max-w-xs">{launchBlockedReason}</p>
            ) : null}
            <Button
              type="button"
              onClick={onLaunch}
              disabled={!canLaunch}
              className="shrink-0 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white w-full sm:w-auto disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send className="w-4 h-4 mr-2" />
              Отправить в экспедицию
            </Button>
          </div>
        </div>

        {devControls ? <div className="pt-2 border-t border-dashed border-amber-800/35">{devControls}</div> : null}

        <details className="group rounded-lg border border-stone-700/50 bg-stone-950/30 px-3 py-2">
          <summary className="cursor-pointer text-xs text-amber-400/90 hover:text-amber-300 flex items-center gap-1 list-none [&::-webkit-details-marker]:hidden">
            <span className="group-open:rotate-90 transition-transform inline-block text-[10px]">▶</span>
            Подробнее: разбивка шансов, наград и износа
          </summary>
          <div className="mt-3 space-y-3">
            <p className="text-xs text-stone-400 leading-relaxed">{calculation.recommendation.description}</p>
            <FullModifierBreakdown calculation={calculation} compact />
          </div>
        </details>
      </CardContent>
    </Card>
  )
}
