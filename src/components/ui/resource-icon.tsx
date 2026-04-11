'use client'

import { cn } from '@/lib/utils'
import { RESOURCE_ICON_META } from '@/lib/ui/resource-emoji'

export const resourceIcons = RESOURCE_ICON_META

// Карта цветов для редкости
export const rarityColors = {
  common: { text: 'text-stone-200', bg: 'bg-stone-700/60', border: 'border-stone-500/40', glow: '' },
  uncommon: { text: 'text-green-300', bg: 'bg-green-900/40', border: 'border-green-500/40', glow: 'shadow-green-500/20' },
  rare: { text: 'text-blue-300', bg: 'bg-blue-900/40', border: 'border-blue-500/40', glow: 'shadow-blue-500/20' },
  epic: { text: 'text-purple-300', bg: 'bg-purple-900/40', border: 'border-purple-500/40', glow: 'shadow-purple-500/20' },
  legendary: { text: 'text-amber-300', bg: 'bg-amber-900/40', border: 'border-amber-500/40', glow: 'shadow-amber-500/20' },
  unique: { text: 'text-fuchsia-200', bg: 'bg-fuchsia-950/45', border: 'border-fuchsia-500/35', glow: 'shadow-fuchsia-500/15' },
}

interface ResourceIconProps {
  id: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showTooltip?: boolean
}

const sizeMap = {
  sm: 20,
  md: 32,
  lg: 48,
  xl: 64,
}

const emojiClass: Record<NonNullable<ResourceIconProps['size']>, string> = {
  sm: 'text-sm leading-none',
  md: 'text-lg leading-none',
  lg: 'text-2xl leading-none',
  xl: 'text-3xl leading-none',
}

/**
 * Значок склада: эмодзи (PNG убраны до отдельной графики).
 */
export function ResourceIcon({ id, size = 'md', className, showTooltip = false }: ResourceIconProps) {
  const resourceInfo = resourceIcons[id]
  const px = sizeMap[size]

  if (!resourceInfo) {
    return (
      <div
        className={cn('flex items-center justify-center bg-stone-700/50 rounded border border-stone-600/50', className)}
        style={{ width: px, height: px }}
      >
        <span className="text-stone-400 text-xs">?</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg bg-stone-800/80 border border-stone-600/50 select-none',
        emojiClass[size],
        className
      )}
      style={{ width: px, height: px }}
      title={showTooltip ? resourceInfo.name : undefined}
    >
      {resourceInfo.emoji}
    </div>
  )
}

/**
 * Получить информацию о ресурсе
 */
export function getResourceIconInfo(id: string) {
  return resourceIcons[id] || null
}

/**
 * Получить цвет редкости ресурса
 */
export function getResourceRarity(id: string): keyof typeof rarityColors {
  return resourceIcons[id]?.rarity || 'common'
}

export default ResourceIcon
