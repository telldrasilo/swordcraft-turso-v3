'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { materialById } from '@/data/materials/library'
import { ResourceIcon } from '@/components/ui/resource-icon'
import { emojiFromLegacyResourcePngPath } from '@/lib/ui/resource-emoji'
import type { ResourceKey } from '@/store'

const sizePx = {
  sm: 20,
  md: 32,
  lg: 48,
  xl: 64,
} as const

export type MaterialDisplayIconSize = keyof typeof sizePx

function isLikelyPathIcon(icon: string): boolean {
  const t = icon.trim()
  return t.startsWith('/') || t.startsWith('http://') || t.startsWith('https://')
}

function isLikelyEmojiOrShortGlyph(icon: string): boolean {
  const t = icon.trim()
  if (!t || t.length > 12) return false
  return !isLikelyPathIcon(t)
}

function emojiBoxClass(size: MaterialDisplayIconSize): string {
  return size === 'lg' || size === 'xl'
    ? 'w-12 h-12 text-2xl'
    : size === 'md'
      ? 'w-8 h-8 text-lg'
      : 'w-5 h-5 text-sm'
}

export interface MaterialDisplayIconProps {
  catalogMaterialId: string | null
  resourceKeyFallback?: ResourceKey | null
  size?: MaterialDisplayIconSize
  className?: string
  title?: string
}

/**
 * Единый значок: эмодзи из каталога / склада; для старых путей `/icons/resources/*.png` — эмодзи из маппинга; иначе внешний URL — Image.
 */
export function MaterialDisplayIcon({
  catalogMaterialId,
  resourceKeyFallback = null,
  size = 'md',
  className,
  title,
}: MaterialDisplayIconProps) {
  const px = sizePx[size]
  const node = catalogMaterialId ? materialById[catalogMaterialId] : undefined
  const iconRaw = node?.icon?.trim()

  if (node && iconRaw) {
    if (isLikelyPathIcon(iconRaw)) {
      const fromLegacy = emojiFromLegacyResourcePngPath(iconRaw)
      if (fromLegacy) {
        return (
          <div
            className={cn(
              emojiBoxClass(size),
              'rounded-lg flex items-center justify-center leading-none bg-stone-800/80 border border-stone-600/50 select-none',
              className
            )}
            title={title ?? node.identity.name}
          >
            {fromLegacy}
          </div>
        )
      }
      if (iconRaw.startsWith('http://') || iconRaw.startsWith('https://')) {
        return (
          <Image
            src={iconRaw}
            alt={title ?? node.identity.name}
            width={px}
            height={px}
            className={cn('drop-shadow-lg object-contain', className)}
            title={title}
          />
        )
      }
      return (
        <div
          className={cn(
            emojiBoxClass(size),
            'rounded-lg flex items-center justify-center leading-none bg-stone-800/80 border border-stone-600/50 select-none text-stone-500',
            className
          )}
          title={title ?? node.identity.name}
        >
          📦
        </div>
      )
    }
    if (isLikelyEmojiOrShortGlyph(iconRaw)) {
      return (
        <div
          className={cn(
            emojiBoxClass(size),
            'rounded-lg flex items-center justify-center leading-none bg-stone-800/80 border border-stone-600/50 select-none',
            className
          )}
          title={title ?? node.identity.name}
        >
          {iconRaw}
        </div>
      )
    }
  }

  if (resourceKeyFallback) {
    return <ResourceIcon id={resourceKeyFallback} size={size} className={className} showTooltip={!!title} />
  }

  const fallbackLabel = catalogMaterialId ? catalogMaterialId.slice(0, 2) : '?'
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg bg-stone-700/50 text-stone-400 font-semibold border border-stone-600/50',
        className
      )}
      style={{ width: px, height: px, fontSize: Math.max(10, px * 0.35) }}
      title={title ?? catalogMaterialId ?? undefined}
    >
      {fallbackLabel}
    </div>
  )
}
