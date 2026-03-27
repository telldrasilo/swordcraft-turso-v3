'use client'

import { motion } from 'framer-motion'
import { QUALITY_RANKS, type QualityScore } from '@/types/forecast'
import { cn } from '@/lib/utils'

interface QualityBadgeProps {
  quality: QualityScore
}

export function QualityBadge({ quality }: QualityBadgeProps) {
  const rankInfo = QUALITY_RANKS[quality.rank]

  return (
    <div className="relative">
      {/* Свечение для S-ранга */}
      {quality.rank === 'S' && (
        <motion.div
          className="absolute inset-0 rounded-lg blur-xl"
          style={{ backgroundColor: 'rgba(251, 191, 36, 0.3)' }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}

      {/* Основной блок */}
      <motion.div
        className={cn(
          'relative p-4 rounded-lg border-2',
          'bg-gradient-to-br from-stone-900 to-stone-800',
          quality.rank === 'S' ? 'border-amber-400' : 'border-stone-700'
        )}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.4 }}
      >
        {/* Заголовок */}
        <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
          Качество
        </div>

        {/* Ранг и значение */}
        <div className="flex items-baseline gap-2 mb-2">
          <motion.span
            className={cn('text-4xl font-black', rankInfo.color)}
            style={{
              textShadow: quality.rank === 'S' ? '0 0 20px rgba(251, 191, 36, 0.6)' : 'none'
            }}
            animate={{
              scale: [1, 1.03, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {quality.rank}
          </motion.span>
          <span className="text-xl font-bold text-stone-200">
            {quality.min}-{quality.max}%
          </span>
        </div>

        {/* Название ранга */}
        <div className={cn('text-sm font-medium', rankInfo.color)}>
          {rankInfo.name}
        </div>

        {/* Прогресс-бар до следующего ранга */}
        {quality.rank !== 'S' && (
          <div className="mt-3">
            <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
              <motion.div
                className={cn('h-full rounded-full', rankInfo.color.replace('text-', 'bg-'))}
                initial={{ width: 0 }}
                animate={{ width: `${quality.progress * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Диапазон качества */}
        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-xs text-stone-500">Прогноз:</span>
          <span className="text-xs font-semibold text-stone-300">
            {quality.value}%
          </span>
          <span className="text-xs text-stone-500">
            ({quality.min}-{quality.max}%)
          </span>
        </div>
      </motion.div>
    </div>
  )
}
