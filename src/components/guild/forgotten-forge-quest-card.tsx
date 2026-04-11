'use client'

import { ScrollText, Map, Sparkles, FastForward, RotateCcw, Hammer } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { useGameStore } from '@/store'
import {
  FORGOTTEN_FORGE_CARD_BLURB,
  FORGOTTEN_FORGE_QUEST_NAME,
  FORGOTTEN_FORGE_STEP3_INSURANCE_GOLD,
  getForgottenForgeProgressDisplayLine,
} from '@/data/quests/forgotten-forge'
import { getForgottenForgeQuestCardPrimaryCta } from '@/lib/quests/forgotten-forge-quest-card-cta'
import { FORGOTTEN_FORGE_QUEST_STEP_MAX } from '@/types/forgotten-forge-quest'

const IS_DEV = process.env.NODE_ENV === 'development'

const PROGRESS_TOTAL_STAGES = FORGOTTEN_FORGE_QUEST_STEP_MAX + 1

type Props = {
  onGoToExpeditionsTab: () => void
}

export function ForgottenForgeQuestCard(props: Props) {
  const { onGoToExpeditionsTab } = props

  const forgottenForgeQuest = useGameStore((s) => s.forgottenForgeQuest)
  const forgottenForgePhase = useGameStore((s) => s.forgottenForgePhase)
  const openMessagesDock = useGameStore((s) => s.openMessagesDock)
  const setCurrentScreen = useGameStore((s) => s.setCurrentScreen)
  const navigateToForgeTab = useGameStore((s) => s.navigateToForgeTab)
  const setForgottenForgeStep3Insurance = useGameStore((s) => s.setForgottenForgeStep3Insurance)
  const setForgottenForgeStep5Cleanse = useGameStore((s) => s.setForgottenForgeStep5Cleanse)
  const setForgottenForgeStep6Anselm = useGameStore((s) => s.setForgottenForgeStep6Anselm)
  const completeForgottenForgeQuestDev = useGameStore((s) => s.completeForgottenForgeQuestDev)
  const resetForgottenForgeQuestDev = useGameStore((s) => s.resetForgottenForgeQuestDev)
  const tickForgottenForgeQuestAvailability = useGameStore((s) => s.tickForgottenForgeQuestAvailability)

  const devFullReset = () => {
    resetForgottenForgeQuestDev()
    tickForgottenForgeQuestAvailability()
  }

  const q = forgottenForgeQuest
  const goalLine = getForgottenForgeProgressDisplayLine(
    q.step,
    q.status,
    q.waitingForCraftAfterPhase2
  )
  const primaryCta = getForgottenForgeQuestCardPrimaryCta(q, forgottenForgePhase)
  const progressPercent =
    q.status === 'completed'
      ? 100
      : q.status === 'active' || q.status === 'available'
        ? Math.round((q.step / FORGOTTEN_FORGE_QUEST_STEP_MAX) * 100)
        : 0

  const runPrimaryAction = () => {
    switch (primaryCta.kind) {
      case 'expedition':
        onGoToExpeditionsTab()
        break
      case 'forge':
        navigateToForgeTab('craft')
        break
      case 'altar':
        setCurrentScreen('altar')
        break
      case 'archivist':
        openMessagesDock('archivist')
        break
      default:
        break
    }
  }

  const primaryIcon =
    primaryCta.kind === 'expedition' ? (
      <Map className="w-4 h-4 shrink-0" />
    ) : primaryCta.kind === 'forge' ? (
      <Hammer className="w-4 h-4 shrink-0" />
    ) : primaryCta.kind === 'altar' ? (
      <Sparkles className="w-4 h-4 shrink-0" />
    ) : (
      <ScrollText className="w-4 h-4 shrink-0" />
    )

  if (q.status === 'locked') {
    return (
      <Card className="card-medieval border-stone-700/50 opacity-80">
        <CardHeader>
          <CardTitle className="text-stone-400 flex items-center gap-2 text-lg">
            <ScrollText className="w-5 h-5" />
            {FORGOTTEN_FORGE_QUEST_NAME}
          </CardTitle>
          <CardDescription>
            Станет доступно, когда гильдия откроет локации 2-го тира.
          </CardDescription>
        </CardHeader>
        {IS_DEV ? (
          <CardContent className="pt-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 border-rose-800/50 text-rose-100/90 hover:bg-rose-950/30"
              title="Только dev: сбросить квест FF, алтарь, квестовые артефакты на складе и снова открыть доступ при 2-м тире"
              onClick={devFullReset}
            >
              <RotateCcw className="w-4 h-4" />
              Тест: полный перезапуск квеста
            </Button>
          </CardContent>
        ) : null}
      </Card>
    )
  }

  if (q.status === 'completed') {
    return (
      <Card className="card-medieval border-amber-800/40">
        <CardHeader>
          <CardTitle className="text-amber-200 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            {FORGOTTEN_FORGE_QUEST_NAME}
            <Badge variant="outline" className="text-emerald-400 border-emerald-700/50">
              Завершено
            </Badge>
          </CardTitle>
          <CardDescription>{FORGOTTEN_FORGE_CARD_BLURB}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
              <span className="tabular-nums">
                Этап {PROGRESS_TOTAL_STAGES} из {PROGRESS_TOTAL_STAGES}
              </span>
              <span className="tabular-nums text-stone-400">100%</span>
            </div>
            <Progress value={100} className="h-2 bg-stone-800" />
          </div>
          <div className="rounded-lg border border-stone-700/80 bg-stone-900/40 px-3 py-3">
            <p className="text-xs font-medium text-stone-400 mb-1.5">Текущая цель</p>
            <p className="text-sm text-stone-300 leading-relaxed">{goalLine}</p>
          </div>
          {IS_DEV ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 border-rose-800/50 text-rose-100/90 hover:bg-rose-950/30"
              title="Только dev: сбросить квест FF, алтарь и квестовые артефакты на складе"
              onClick={devFullReset}
            >
              <RotateCcw className="w-4 h-4" />
              Тест: полный перезапуск квеста
            </Button>
          ) : null}
        </CardContent>
      </Card>
    )
  }

  const showSecondaryArchivist =
    primaryCta.kind !== 'archivist' && primaryCta.kind !== 'none'

  return (
    <Card className="card-medieval border-amber-900/35">
      <CardHeader>
        <CardTitle className="text-amber-200 flex items-center gap-2 flex-wrap">
          <ScrollText className="w-5 h-5 shrink-0" />
          {FORGOTTEN_FORGE_QUEST_NAME}
          <Badge variant="secondary" className="text-xs">
            {q.status === 'available' ? 'Доступно' : 'В процессе'}
          </Badge>
        </CardTitle>
        <CardDescription className="text-stone-400 leading-relaxed">{FORGOTTEN_FORGE_CARD_BLURB}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
            <span className="tabular-nums">
              Этап {q.step + 1} из {PROGRESS_TOTAL_STAGES}
            </span>
            <span className="tabular-nums text-stone-400">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-stone-800" />
        </div>

        <div className="rounded-lg border border-stone-700/80 bg-stone-900/40 px-3 py-3 space-y-3">
          <p className="text-xs font-medium text-stone-400">Текущая цель</p>
          <p className="text-sm text-stone-200 leading-relaxed">{goalLine}</p>
          {primaryCta.kind !== 'none' ? (
            <Button type="button" className="w-full sm:w-auto gap-2" onClick={runPrimaryAction}>
              {primaryIcon}
              {primaryCta.label}
            </Button>
          ) : null}
        </div>

        {q.step === 3 && forgottenForgePhase === 'awaiting_expedition' && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-stone-700/80 bg-stone-900/40 px-3 py-2">
            <div className="min-w-0">
              <Label htmlFor="ff-insurance" className="text-stone-200">
                Шахтная страховка ({FORGOTTEN_FORGE_STEP3_INSURANCE_GOLD} золота)
              </Label>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                Списывается при старте экспедиции. Влияет только на текст отчёта архивариуса после похода, не на добычу.
                Если в диалоге вы уже согласились на осторожную перевозку матрицы, переключатель может быть включён — его можно снять.
              </p>
            </div>
            <Switch
              id="ff-insurance"
              className="shrink-0"
              checked={q.flags.step3Insurance === true}
              onCheckedChange={(v) => setForgottenForgeStep3Insurance(v)}
            />
          </div>
        )}

        {q.step === 5 && forgottenForgePhase === 'awaiting_expedition' && (
          <div className="space-y-2 rounded-md border border-stone-700/80 bg-stone-900/40 px-3 py-2">
            <p className="text-xs text-stone-300">Очистка фокусирующей чаши</p>
            <p className="text-[11px] text-stone-500">Выберите способ — от этого зависит формулировка в отчёте.</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={q.flags.step5Cleanse === 'magic' ? 'default' : 'outline'}
                onClick={() => setForgottenForgeStep5Cleanse('magic')}
              >
                Магия
              </Button>
              <Button
                type="button"
                size="sm"
                variant={q.flags.step5Cleanse === 'physical' ? 'default' : 'outline'}
                onClick={() => setForgottenForgeStep5Cleanse('physical')}
              >
                Физически
              </Button>
            </div>
          </div>
        )}

        {q.step === 6 && forgottenForgePhase === 'awaiting_expedition' && (
          <div className="space-y-2 rounded-md border border-stone-700/80 bg-stone-900/40 px-3 py-2">
            <p className="text-xs text-stone-300">Ансельм и камертон</p>
            <p className="text-[11px] text-stone-500">Сделка или кража — отразится в диалоге и отчёте.</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={q.flags.step6Anselm !== 'theft' ? 'default' : 'outline'}
                onClick={() => setForgottenForgeStep6Anselm('deal')}
              >
                Сделка
              </Button>
              <Button
                type="button"
                size="sm"
                variant={q.flags.step6Anselm === 'theft' ? 'default' : 'outline'}
                onClick={() => setForgottenForgeStep6Anselm('theft')}
              >
                Кража
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3 pt-1">
          {showSecondaryArchivist ? (
            <Button
              type="button"
              variant="outline"
              className="gap-2 w-full sm:w-auto"
              onClick={() => openMessagesDock('archivist')}
            >
              <ScrollText className="w-4 h-4 shrink-0" />
              Поговорить с архивариусом
            </Button>
          ) : null}
          {primaryCta.kind === 'none' ? (
            <Button
              type="button"
              variant="outline"
              className="gap-2 w-full sm:w-auto"
              onClick={() => openMessagesDock('archivist')}
            >
              <ScrollText className="w-4 h-4 shrink-0" />
              Поговорить с архивариусом
            </Button>
          ) : null}
          {IS_DEV ? (
            <>
              <div className="border-t border-stone-700/60" role="separator" aria-hidden />
              <div className="flex flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 flex-1 min-w-0 border-rose-800/50 text-rose-100/90 hover:bg-rose-950/30 whitespace-normal h-auto min-h-9 py-2"
                  title="Только dev: сбросить квест FF, алтарь, квестовые артефакты на складе и снова открыть доступ при 2-м тире"
                  onClick={devFullReset}
                >
                  <RotateCcw className="w-4 h-4 shrink-0" />
                  Тест: полный перезапуск квеста
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 flex-1 min-w-0 border-amber-700/60 text-amber-100/90 hover:bg-amber-950/40 whitespace-normal h-auto min-h-9 py-2"
                  title="Только dev-сборка: завершить квест и выдать чертёж алтаря"
                  onClick={() => completeForgottenForgeQuestDev()}
                >
                  <FastForward className="w-4 h-4 shrink-0" />
                  Тест: завершить цепочку
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
