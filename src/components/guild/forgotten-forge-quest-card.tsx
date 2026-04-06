'use client'

import { ScrollText, Map, Shield, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useGameStore } from '@/store'
import {
  FORGOTTEN_FORGE_CARD_BLURB,
  FORGOTTEN_FORGE_QUEST_NAME,
  FORGOTTEN_FORGE_EXPEDITION_LOCATION_BY_STEP,
  FORGOTTEN_FORGE_STEP3_INSURANCE_GOLD,
} from '@/data/quests/forgotten-forge'
import { getLocationById } from '@/modules/expeditions/data/locations'
import { getForgottenForgeProgressLine } from '@/store/slices/forgotten-forge-quest-slice'

type Props = {
  questExpeditionLink: boolean
  onQuestExpeditionLinkChange: (v: boolean) => void
  onGoToExpeditionsTab: () => void
}

export function ForgottenForgeQuestCard(props: Props) {
  const { questExpeditionLink, onQuestExpeditionLinkChange, onGoToExpeditionsTab } = props

  const forgottenForgeQuest = useGameStore((s) => s.forgottenForgeQuest)
  const forgottenForgePhase = useGameStore((s) => s.forgottenForgePhase)
  const setMessagesDockChannel = useGameStore((s) => s.setMessagesDockChannel)
  const setForgottenForgeStep3Insurance = useGameStore((s) => s.setForgottenForgeStep3Insurance)
  const setForgottenForgeStep5Cleanse = useGameStore((s) => s.setForgottenForgeStep5Cleanse)
  const setForgottenForgeStep6Anselm = useGameStore((s) => s.setForgottenForgeStep6Anselm)

  const q = forgottenForgeQuest
  const progress = getForgottenForgeProgressLine(q.step, q.status)
  const expectedLocId =
    q.status === 'active' && forgottenForgePhase === 'awaiting_expedition'
      ? FORGOTTEN_FORGE_EXPEDITION_LOCATION_BY_STEP[q.step]
      : undefined
  const expectedLocName = expectedLocId ? getLocationById(expectedLocId)?.name : undefined

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
        <CardContent>
          <p className="text-sm text-stone-400">{progress}</p>
        </CardContent>
      </Card>
    )
  }

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
        <p className="text-sm text-amber-100/90 border-l-2 border-amber-700/60 pl-3">{progress}</p>

        {expectedLocName && (
          <p className="text-xs text-stone-500">
            Следующая цель экспедиции: <span className="text-stone-300">{expectedLocName}</span>
          </p>
        )}

        {q.step === 3 && forgottenForgePhase === 'awaiting_expedition' && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-stone-700/80 bg-stone-900/40 px-3 py-2">
            <div>
              <Label htmlFor="ff-insurance" className="text-stone-200">
                Страховка в шахтах
              </Label>
              <p className="text-[11px] text-stone-500">
                Списание {FORGOTTEN_FORGE_STEP3_INSURANCE_GOLD} золота при старте экспедиции
              </p>
            </div>
            <Switch
              id="ff-insurance"
              checked={q.flags.step3Insurance === true}
              onCheckedChange={(v) => setForgottenForgeStep3Insurance(v)}
            />
          </div>
        )}

        {q.step === 5 && forgottenForgePhase === 'awaiting_expedition' && (
          <div className="space-y-2 rounded-md border border-stone-700/80 bg-stone-900/40 px-3 py-2">
            <p className="text-xs text-stone-400">Очистка чаши</p>
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
            <p className="text-xs text-stone-400">Ансельм</p>
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

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <Button
            type="button"
            variant="secondary"
            className="gap-2"
            onClick={() => {
              setMessagesDockChannel('archivist')
            }}
          >
            <ScrollText className="w-4 h-4" />
            Чат с архивариусом
          </Button>
          <Button type="button" variant="outline" className="gap-2" onClick={onGoToExpeditionsTab}>
            <Map className="w-4 h-4" />
            К экспедициям
          </Button>
        </div>

        {forgottenForgePhase === 'awaiting_expedition' && q.status === 'active' && (
          <div className="rounded-md border border-amber-900/40 bg-amber-950/20 px-3 py-2 space-y-2">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-stone-400 leading-snug">
                Включите «Засчитать квесту», затем выберите миссию в нужной локации и отправьте экспедицию.
                Без этого флага успех в той же локации не продвинет квест.
              </p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="ff-quest-link" className="text-stone-200 text-sm">
                Засчитать квесту
              </Label>
              <Switch
                id="ff-quest-link"
                checked={questExpeditionLink}
                onCheckedChange={onQuestExpeditionLinkChange}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
