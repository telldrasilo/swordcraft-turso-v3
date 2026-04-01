/**
 * Метаданные отображения оружия (качество, типы) — P2-Craft-03.
 * Не зависят от legacy weapon-recipes.ts; импортируйте отсюда UI и новый код.
 */

import type { QualityGrade } from '@/store/slices/craft-slice'

export const qualityGrades: Record<
  QualityGrade,
  { name: string; min: number; max: number; multiplier: number; color: string }
> = {
  poor: { name: 'Плохое', min: 0, max: 25, multiplier: 0.6, color: 'text-red-400' },
  normal: { name: 'Обычное', min: 26, max: 50, multiplier: 1.0, color: 'text-stone-300' },
  good: { name: 'Хорошее', min: 51, max: 70, multiplier: 1.3, color: 'text-green-400' },
  excellent: { name: 'Отличное', min: 71, max: 85, multiplier: 1.6, color: 'text-blue-400' },
  masterwork: { name: 'Шедевр', min: 86, max: 95, multiplier: 2.0, color: 'text-purple-400' },
  legendary: { name: 'Легендарное', min: 96, max: 100, multiplier: 3.0, color: 'text-amber-400' },
}

export function getQualityGrade(quality: number): QualityGrade {
  if (quality <= 25) return 'poor'
  if (quality <= 50) return 'normal'
  if (quality <= 70) return 'good'
  if (quality <= 85) return 'excellent'
  if (quality <= 95) return 'masterwork'
  return 'legendary'
}

export const weaponTypeStats = {
  sword: { attackBase: 10, attackPerTier: 5, name: 'Меч', icon: '⚔️' },
  dagger: { attackBase: 6, attackPerTier: 3, name: 'Кинжал', icon: '🗡️' },
  axe: { attackBase: 14, attackPerTier: 7, name: 'Топор', icon: '🪓' },
  mace: { attackBase: 16, attackPerTier: 8, name: 'Булава', icon: '🔨' },
  spear: { attackBase: 12, attackPerTier: 6, name: 'Копьё', icon: '🔱' },
  hammer: { attackBase: 18, attackPerTier: 9, name: 'Молот', icon: '⚒️' },
  bow: { attackBase: 8, attackPerTier: 4, name: 'Лук', icon: '🏹' },
  staff: { attackBase: 7, attackPerTier: 3, name: 'Посох', icon: '🪄' },
}
