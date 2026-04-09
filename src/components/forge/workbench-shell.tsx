'use client'

import type { ReactNode } from 'react'
import type { WorkbenchQueueItem } from '@/lib/workbench/workbench-queue'
import type { CraftedWeaponV2 } from '@/types/craft-v2'
import {
  buildWorkbenchBarSegmentViews,
  findActiveSegmentIndex,
  type WorkbenchBarBaseline,
} from '@/lib/workbench/workbench-bar-baseline'
import { WorkbenchQueueSegmentedBar } from '@/components/forge/workbench-queue-segmented-bar'
import { cn } from '@/lib/utils'

/** Обёртка верстака: основной контент сверху, затем полоса очереди и панель внизу. */
export function WorkbenchShell(props: {
  queue: readonly WorkbenchQueueItem[]
  workbenchBarBaseline: WorkbenchBarBaseline | null
  weaponNameById: Record<string, string>
  weaponById: Readonly<Record<string, CraftedWeaponV2>>
  /** id активного пункта очереди (из stage-run или running). */
  activeQueueItemId: string | null
  showBar: boolean
  /** Панель очереди (список, старт работы, этапы) — всегда под полосой/подсказкой. */
  queuePanel: ReactNode
  children: ReactNode
}) {
  const {
    queue,
    workbenchBarBaseline,
    weaponNameById,
    weaponById,
    activeQueueItemId,
    showBar,
    queuePanel,
    children,
  } = props
  const segments = buildWorkbenchBarSegmentViews(workbenchBarBaseline, queue, weaponNameById)
  const activeIndex = findActiveSegmentIndex(segments, activeQueueItemId)
  const hasStrip = showBar && segments.length > 0

  const stripPlaceholder = (() => {
    if (hasStrip) return null
    if (queue.length === 0) {
      return (
        <div className="rounded-md border border-stone-800/80 bg-stone-950/30 px-3 py-2 text-[11px] text-stone-500">
          Очередь пуста. Добавьте задачу ремонта или перековки — после «Начать работу» здесь появится
          полоса прогресса.
        </div>
      )
    }
    return (
      <div className="rounded-md border border-stone-800/80 bg-stone-950/30 px-3 py-2 text-[11px] text-stone-500">
        Нажмите «Начать работу» в панели ниже — здесь отобразится полоса доли времени по очереди.
      </div>
    )
  })()

  return (
    <div className="space-y-4" data-tutorial="workbench-shell">
      {children}
      {hasStrip ? (
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wide text-stone-500">Очередь (доля времени)</p>
          <WorkbenchQueueSegmentedBar
            segments={segments}
            activeIndex={activeIndex}
            weaponById={weaponById}
          />
          <ul className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-stone-500 list-none p-0 m-0">
            {segments.map((seg, i) => (
              <li
                key={seg.queueItemId}
                className={cn(
                  'max-w-[min(100%,14rem)] truncate',
                  i === activeIndex && seg.item?.status === 'running' && 'text-amber-200/95'
                )}
                title={`#${i + 1} · ${seg.opLabel} · ${seg.weaponLabel}`}
              >
                <span className="text-stone-600 tabular-nums">#{i + 1}</span> · {seg.opLabel} ·{' '}
                <span className="text-stone-400">{seg.weaponLabel}</span>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-stone-600">
            Наведите курсор на сегмент (ПК) или нажмите (сенсор) — откроется превью клинка. Список ниже
            дублирует порядок.
          </p>
        </div>
      ) : (
        stripPlaceholder
      )}
      {queuePanel}
    </div>
  )
}
