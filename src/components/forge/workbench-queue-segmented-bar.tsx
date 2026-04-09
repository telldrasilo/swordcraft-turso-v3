'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { WorkbenchBarSegmentView } from '@/lib/workbench/workbench-bar-baseline'
import type { CraftedWeaponV2 } from '@/types/craft-v2'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { WeaponInventoryCard } from '@/components/forge/weapon-inventory-card'
import { cn } from '@/lib/utils'

function hueForWeaponId(weaponId: string): number {
  let h = 0
  for (let i = 0; i < weaponId.length; i++) {
    h = (h * 31 + weaponId.charCodeAt(i)) >>> 0
  }
  return h % 360
}

function usePrefersHover(): boolean {
  const [v, setV] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover)')
    const sync = () => setV(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return v
}

export function WorkbenchQueueSegmentedBar(props: {
  segments: readonly WorkbenchBarSegmentView[]
  activeIndex: number
  /** Оружие по id для превью в popover полосы. */
  weaponById: Readonly<Record<string, CraftedWeaponV2>>
  className?: string
}) {
  const { segments, activeIndex, weaponById, className } = props
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const prefersHover = usePrefersHover()
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current != null) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  const scheduleClose = useCallback(() => {
    clearCloseTimer()
    closeTimer.current = setTimeout(() => setOpenIdx(null), 180)
  }, [clearCloseTimer])

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer])

  if (segments.length === 0) return null

  return (
    <div className={cn('space-y-1.5', className)}>
      <div
        className="flex w-full h-10 rounded-md overflow-hidden border border-stone-700/80 bg-stone-950"
        role="img"
        aria-label="Очередь верстака по доле времени"
      >
        {segments.map((seg, i) => {
          const item = seg.item
          const isActive = i === activeIndex && item?.status === 'running'
          const weaponKey = item?.weaponId ?? `missing-${seg.queueItemId}`
          const h = hueForWeaponId(weaponKey)
          const bg = isActive
            ? 'linear-gradient(180deg, rgba(251,191,36,0.95), rgba(180,120,40,0.85))'
            : `hsl(${h} 35% 32%)`
          const title = `#${i + 1} · ${seg.opLabel} · ${seg.weaponLabel}`
          const dim = item == null || item.status === 'done'
          const weapon =
            item?.weaponId && weaponById[item.weaponId] ? weaponById[item.weaponId]! : null
          const caption = `#${i + 1} · ${seg.opLabel} · ${seg.weaponLabel}`

          const segmentButton = (
            <button
              type="button"
              title={title}
              style={{ width: `${Math.max(0.35, seg.widthPct)}%`, background: bg }}
              className={cn(
                'min-w-[2px] h-full min-h-0 border-0 p-0 cursor-pointer transition-[opacity,width] duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60',
                dim && 'opacity-45',
                openIdx === i && 'ring-2 ring-amber-400/70 z-[1]'
              )}
              aria-expanded={openIdx === i}
              aria-haspopup="dialog"
              onClick={() => {
                if (!prefersHover) {
                  setOpenIdx((v) => (v === i ? null : i))
                }
              }}
              onMouseEnter={() => {
                if (prefersHover) {
                  clearCloseTimer()
                  setOpenIdx(i)
                }
              }}
              onMouseLeave={() => {
                if (prefersHover) {
                  scheduleClose()
                }
              }}
            />
          )

          return (
            <Popover
              key={seg.queueItemId}
              open={openIdx === i}
              onOpenChange={(o) => {
                if (!o) setOpenIdx(null)
              }}
            >
              <PopoverAnchor asChild>{segmentButton}</PopoverAnchor>
              <PopoverContent
                side="top"
                align="center"
                sideOffset={8}
                className="w-auto max-w-[min(100vw,22rem)] p-2 border-stone-700 bg-stone-950 shadow-xl"
                onMouseEnter={() => {
                  if (prefersHover) clearCloseTimer()
                }}
                onMouseLeave={() => {
                  if (prefersHover) scheduleClose()
                }}
              >
                {weapon ? (
                  <WeaponInventoryCard
                    context="queuePreview"
                    weapon={weapon}
                    queuePreviewCaption={caption}
                  />
                ) : (
                  <p className="text-xs text-stone-400 px-2 py-1 max-w-[16rem]">{caption}</p>
                )}
              </PopoverContent>
            </Popover>
          )
        })}
      </div>
    </div>
  )
}
