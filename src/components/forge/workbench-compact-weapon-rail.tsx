'use client'

import { cn } from '@/lib/utils'
import type { CraftedWeaponV2 } from '@/types/craft-v2'
import type { WorkbenchQueueItem } from '@/lib/workbench/workbench-queue'
import { WorkbenchStripWeaponCell } from '@/components/forge/workbench-strip-weapon-cell'

export function WorkbenchCompactWeaponRail(props: {
  weapons: CraftedWeaponV2[]
  selectedId: string | null
  onSelect: (id: string) => void
  layout: 'vertical' | 'carousel'
  workbenchQueue: readonly WorkbenchQueueItem[]
  className?: string
}) {
  const { weapons, selectedId, onSelect, layout, workbenchQueue, className } = props

  if (weapons.length === 0) {
    return null
  }

  if (layout === 'carousel') {
    return (
      <div
        className={cn(
          '-mx-1 flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scroll-smooth px-1',
          className
        )}
        data-tutorial="workbench-compact-list"
      >
        {weapons.map((w) => (
          <div key={w.id} className="min-w-[9rem] max-w-[10rem] shrink-0 snap-start">
            <WorkbenchStripWeaponCell
              weapon={w}
              selected={selectedId === w.id}
              onSelect={() => onSelect(w.id)}
              workbenchQueue={workbenchQueue}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-2 overflow-y-auto max-h-[min(70vh,36rem)] pr-0.5 min-w-0',
        className
      )}
      data-tutorial="workbench-compact-list"
    >
      {weapons.map((w) => (
        <WorkbenchStripWeaponCell
          key={w.id}
          weapon={w}
          selected={selectedId === w.id}
          onSelect={() => onSelect(w.id)}
          workbenchQueue={workbenchQueue}
        />
      ))}
    </div>
  )
}
