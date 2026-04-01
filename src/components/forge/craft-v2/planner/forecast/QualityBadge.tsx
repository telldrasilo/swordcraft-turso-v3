'use client'

import { motion } from 'framer-motion'
import { QUALITY_RANKS, type QualityScore } from '@/types/forecast'
import { cn } from '@/lib/utils'
import {
  describeQualityRange,
  getQualityWithinGradeDisplay,
} from '@/lib/craft/quality-display'

interface QualityBadgeProps {
  quality: QualityScore
}

export function QualityBadge({ quality }: QualityBadgeProps) {
  const rankInfo = QUALITY_RANKS[quality.rank]
  const expected = getQualityWithinGradeDisplay(quality.value)
  const rangeGrades = describeQualityRange(quality.min, quality.max)

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
          <div className="flex flex-col items-end text-right">
            <span className="text-xl font-bold text-stone-200 tabular-nums">
              {expected.step}/{expected.steps}
            </span>
            <span className="text-xs text-stone-500">{expected.nameRu}</span>
          </div>
        </div>

        {/* Ранг F–S (имя) + градация крафта v2 */}
        <div className={cn('text-sm font-medium', rankInfo.color)}>
          Ранг {quality.rank}: {rankInfo.name}
        </div>
        <p className="text-xs text-stone-500 mt-1">
          Градация по крафту совпадает с карточкой оружия (ступени внутри тира).
        </p>

        {/* Прогресс внутри текущей градации v2 по ожидаемому качеству */}
        <div className="mt-3">
          <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', expected.color.replace('text-', 'bg-'))}
              initial={{ width: 0 }}
              animate={{ width: `${expected.progressInGrade * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="mt-2 text-xs text-stone-500">
          <span className="text-stone-400 font-medium">Диапазон: </span>
          <span className="text-stone-300">{rangeGrades}</span>
        </div>
      </motion.div>
    </div>
  )
}
