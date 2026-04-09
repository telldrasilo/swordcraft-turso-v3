'use client'

import { cn } from '@/lib/utils'

/** Заблюренный слой поверх блока планирования, пока для клинка есть planned/running задача этого типа в очереди. */
export function WorkbenchQueueBlockOverlay(props: {
  label?: string
  className?: string
}) {
  const { label = 'В очереди', className } = props
  return (
    <div
      className={cn(
        'pointer-events-auto absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-stone-950/50 backdrop-blur-[3px]',
        className
      )}
      role="status"
      aria-label={label}
    >
      <span className="rounded-md border border-amber-700/55 bg-stone-900/90 px-4 py-2 text-sm font-semibold tracking-wide text-amber-100/95 shadow-md">
        {label}
      </span>
    </div>
  )
}
