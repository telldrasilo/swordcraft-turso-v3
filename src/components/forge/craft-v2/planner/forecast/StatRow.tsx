'use client'

import { motion } from 'framer-motion'
import { type StatRange } from '@/types/forecast'
import { cn } from '@/lib/utils'

interface StatRowProps {
  stat: 'attack' | 'durability' | 'weight' | 'soulCapacity'
  range: StatRange
  icon: React.ReactNode
  label: string
}

const STAT_CONFIG = {
  attack: {
    iconColor: 'text-red-400',
    barColor: 'bg-red-500',
    bgBarColor: 'bg-red-900/20',
    borderColor: 'border-red-900/30',
    gradient: 'from-red-500/60 to-red-400/40'
  },
  durability: {
    iconColor: 'text-amber-400',
    barColor: 'bg-amber-500',
    bgBarColor: 'bg-amber-900/20',
    borderColor: 'border-amber-900/30',
    gradient: 'from-amber-500/60 to-amber-400/40'
  },
  weight: {
    iconColor: 'text-stone-400',
    barColor: 'bg-stone-500',
    bgBarColor: 'bg-stone-900/20',
    borderColor: 'border-stone-700/30',
    gradient: 'from-stone-500/60 to-stone-400/40'
  },
  soulCapacity: {
    iconColor: 'text-purple-400',
    barColor: 'bg-purple-500',
    bgBarColor: 'bg-purple-900/20',
    borderColor: 'border-purple-900/30',
    gradient: 'from-purple-500/60 to-purple-400/40'
  }
} as const

export function StatRow({ stat, range, icon, label }: StatRowProps) {
  const config = STAT_CONFIG[stat]

  // Вычисляем позицию диапазона на баре (нормализованная 0-100)
  // Используем разумные максимумы для нормализации
  const MAX_VALUES = {
    attack: 150,
    durability: 300,
    weight: 20,
    soulCapacity: 50
  }
  const maxValue = MAX_VALUES[stat] || 100
  const normalizedMin = Math.max(0, Math.min(100, (range.min / maxValue) * 100))
  const normalizedMax = Math.max(0, Math.min(100, (range.max / maxValue) * 100))
  const rangeWidth = normalizedMax - normalizedMin

  const precision = stat === 'weight' ? 1 : 0

  const formatValue = (val: number): string => {
    return precision > 0 ? val.toFixed(precision) : val.toString()
  }

  return (
    <div className="px-3 py-2 rounded-lg border border-stone-700 transition-all duration-200">
      {/* Иконка и название */}
      <div className="flex items-center gap-3 mb-1.5">
        <span className={cn('w-5 h-5', config.iconColor)}>
          {icon}
        </span>
        <span className="text-sm font-medium text-stone-200">
          {label}
        </span>

        {/* Значения */}
        <span className="ml-auto text-sm font-bold text-stone-100">
          {formatValue(range.min)} - {formatValue(range.max)}
        </span>
      </div>

      {/* Визуальный бар */}
      <div className="relative h-2 bg-stone-800 rounded-full overflow-hidden">
        {/* Минимальное значение */}
        <motion.div
          className="absolute top-0 bottom-0 bg-gradient-to-r from-stone-700 to-stone-600 rounded-l-full"
          style={{ width: `${normalizedMin}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${normalizedMin}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />

        {/* Диапазон */}
        <motion.div
          className={cn(
            'absolute top-0 bottom-0 rounded-full',
            'bg-gradient-to-r',
            config.gradient
          )}
          style={{
            left: `${normalizedMin}%`,
            width: `${rangeWidth}%`
          }}
          initial={{
            left: `${normalizedMin}%`,
            width: 0
          }}
          animate={{
            left: `${normalizedMin}%`,
            width: `${rangeWidth}%`
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />

        {/* Пульсирующая граница справа */}
        {rangeWidth > 0 && (
          <motion.div
            className="absolute top-0 bottom-0 right-0 w-0.5 bg-white/30"
            animate={{
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        )}
      </div>

      {/* Индикатор неопределённости */}
      {range.variance > 0.2 && (
        <div className="mt-2 flex items-center gap-1.5">
          <motion.div
            className={cn('w-1.5 h-1.5 rounded-full', config.barColor)}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <span className="text-xs text-stone-500">
            Низкая точность
          </span>
        </div>
      )}
    </div>
  )
}
