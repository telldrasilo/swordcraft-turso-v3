'use client'

import { getForgottenForgeProgressDisplayLine } from '@/data/quests/forgotten-forge'
import type { ForgottenForgeQuestState } from '@/types/forgotten-forge-quest'
import { ScrollText } from 'lucide-react'

interface AltarQuestGoalProps {
  quest: ForgottenForgeQuestState
}

export function AltarQuestGoal({ quest }: AltarQuestGoalProps) {
  if (quest.status !== 'active') return null
  const line = getForgottenForgeProgressDisplayLine(
    quest.step,
    quest.status,
    quest.waitingForCraftAfterPhase2
  )
  return (
    <div className="rounded-lg border border-stone-700/80 bg-stone-900/40 px-3 py-3 space-y-2">
      <p className="text-xs font-medium text-stone-400 flex items-center gap-2">
        <ScrollText className="w-4 h-4 text-amber-500 shrink-0" />
        Текущая цель
      </p>
      <p className="text-sm text-stone-200 leading-relaxed">{line}</p>
    </div>
  )
}
