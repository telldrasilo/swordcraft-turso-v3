/**
 * Общие типы и функции для качества
 * Используются в обеих системах крафта (craft.ts и craft-v2.ts)
 */

/** Градация качества */
export type QualityGrade = 'poor' | 'common' | 'good' | 'excellent' | 'masterpiece' | 'legendary'

/** Конфигурация градаций качества */
export interface QualityGradeConfig {
  min: number
  max: number
  grade: QualityGrade
  multiplier: number
  color: string
  nameRu?: string
}

/** Конфигурации качества для разных систем крафта */
export const QUALITY_GRADES_V1: { min: number; max: number; grade: QualityGrade; multiplier: number; color: string }[] = [
  { min: 0, max: 25, grade: 'poor', multiplier: 0.6, color: 'text-red-400' },
  { min: 26, max: 50, grade: 'common', multiplier: 1.0, color: 'text-gray-400' },
  { min: 51, max: 70, grade: 'good', multiplier: 1.3, color: 'text-green-400' },
  { min: 71, max: 85, grade: 'excellent', multiplier: 1.6, color: 'text-blue-400' },
  { min: 86, max: 95, grade: 'masterpiece', multiplier: 2.0, color: 'text-purple-400' },
  { min: 96, max: 100, grade: 'legendary', multiplier: 3.0, color: 'text-amber-400' },
]

export const QUALITY_GRADES_V2: QualityGradeConfig[] = [
  { min: 0, max: 30, grade: 'poor', multiplier: 0.7, color: 'text-red-400', nameRu: 'Плохое' },
  { min: 31, max: 50, grade: 'common', multiplier: 1.0, color: 'text-gray-400', nameRu: 'Обычное' },
  { min: 51, max: 70, grade: 'good', multiplier: 1.1, color: 'text-green-400', nameRu: 'Хорошее' },
  { min: 71, max: 85, grade: 'excellent', multiplier: 1.2, color: 'text-blue-400', nameRu: 'Отличное' },
  { min: 86, max: 95, grade: 'masterpiece', multiplier: 1.35, color: 'text-purple-400', nameRu: 'Шедевр' },
  { min: 96, max: 100, grade: 'legendary', multiplier: 1.5, color: 'text-amber-400', nameRu: 'Легендарное' },
]

/**
 * Получить градацию качества (система v1)
 */
export function getQualityGrade(quality: number): QualityGrade {
  const grade = QUALITY_GRADES_V1.find(g => quality >= g.min && quality <= g.max)
  return grade?.grade ?? 'common'
}

/**
 * Получить множитель качества (система v1)
 */
export function getQualityMultiplier(quality: number): number {
  const grade = QUALITY_GRADES_V1.find(g => quality >= g.min && quality <= g.max)
  return grade?.multiplier ?? 1.0
}

/**
 * Получить цвет качества (система v1)
 */
export function getQualityColor(quality: number): string {
  const grade = QUALITY_GRADES_V1.find(g => quality >= g.min && quality <= g.max)
  return grade?.color ?? 'text-gray-400'
}

/**
 * Получить градацию качества (система v2)
 */
export function getQualityGradeV2(quality: number): QualityGrade {
  const grade = QUALITY_GRADES_V2.find(g => quality >= g.min && quality <= g.max)
  return grade?.grade ?? 'common'
}

/**
 * Получить множитель качества (система v2)
 */
export function getQualityMultiplierV2(quality: number): number {
  const grade = QUALITY_GRADES_V2.find(g => quality >= g.min && quality <= g.max)
  return grade?.multiplier ?? 1.0
}

/**
 * Получить цвет качества (система v2)
 */
export function getQualityColorV2(quality: number): string {
  const grade = QUALITY_GRADES_V2.find(g => quality >= g.min && quality <= g.max)
  return grade?.color ?? 'text-gray-400'
}

/**
 * Получить название качества на русском (система v2)
 */
export function getQualityNameRu(quality: number): string {
  const grade = QUALITY_GRADES_V2.find(g => quality >= g.min && quality <= g.max)
  return grade?.nameRu ?? 'Обычное'
}
