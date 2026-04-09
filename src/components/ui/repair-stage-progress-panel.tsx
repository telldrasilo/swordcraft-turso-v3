'use client'

import { CheckCircle, Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { WeaponRepairPlan } from '@/types/weapon-repair'
import type { RepairStageProgressView } from '@/lib/weapon-damage/repair-stage-timing'

export const REPAIR_STAGE_CATEGORY_LABEL: Record<string, string> = {
  preparation: 'Подготовка',
  work: 'Работа',
  finishing: 'Отделка',
}

export function RepairStageProgressPanel(props: {
  displayPlan: WeaponRepairPlan
  progressView: RepairStageProgressView
}) {
  const { displayPlan, progressView } = props
  const current = displayPlan.stages[progressView.stageIndex]

  return (
    <div className="rounded-lg border border-amber-800/50 bg-stone-950/60 p-3 space-y-2">
      <p className="text-xs text-amber-200/90 font-medium">
        Этап {progressView.stageIndex + 1} / {displayPlan.stages.length}
      </p>
      <p className="text-sm text-stone-200">{current?.name}</p>
      <p className="text-[10px] text-stone-500">
        {REPAIR_STAGE_CATEGORY_LABEL[current?.category ?? ''] ?? ''}
        {' · '}
        {current?.sourceTechniqueName}
      </p>
      <Progress value={progressView.progressInStage} className="h-2 bg-stone-800" />
      <ul className="space-y-1 max-h-28 overflow-y-auto text-[11px]">
        {displayPlan.stages.map((s, i) => (
          <li key={s.order} className="flex items-start gap-2">
            {i < progressView.stageIndex ? (
              <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
            ) : i === progressView.stageIndex ? (
              <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0 mt-0.5" />
            ) : (
              <span className="w-3.5 h-3.5 mt-0.5 rounded-full border border-stone-600 shrink-0 inline-block" />
            )}
            <span
              className={cn(i <= progressView.stageIndex ? 'text-stone-300' : 'text-stone-600')}
            >
              {s.name}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-stone-500 pt-1 border-t border-stone-800">
        После последнего этапа — бросок на успех и списание стоимости плана.
      </p>
    </div>
  )
}
