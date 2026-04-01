/**
 * Отображение качества внутри градации v2 (QUALITY_GRADES_V2).
 * Базовое число quality 0–100 не меняется — только производные для UI и будущей перековки.
 */

import type { QualityGrade } from '@/types/shared/quality'
import { QUALITY_GRADES_V2 } from '@/types/shared/quality'

export interface QualityWithinGradeDisplay {
  grade: QualityGrade
  nameRu: string
  min: number
  max: number
  /** 1-based позиция внутри включительного диапазона [min, max] */
  step: number
  /** Число ступеней в градации (включительно) */
  steps: number
  /** 0–1 заполнение внутри градации; при max === min считается 1 */
  progressInGrade: number
  /** Минимум следующей градации или null для легендарного */
  nextGradeMin: number | null
  color: string
  multiplier: number
}

function configForQuality(quality: number) {
  const q = Math.round(Math.max(0, Math.min(100, quality)))
  const config =
    QUALITY_GRADES_V2.find((g) => q >= g.min && q <= g.max) ??
    QUALITY_GRADES_V2[QUALITY_GRADES_V2.length - 1]!
  return { q, config }
}

export function getQualityWithinGradeDisplay(quality: number): QualityWithinGradeDisplay {
  const { q, config } = configForQuality(quality)
  const { min, max, grade, color, multiplier, nameRu } = config
  const steps = max - min + 1
  const step = q - min + 1
  const span = max - min
  const progressInGrade = span <= 0 ? 1 : (q - min) / span

  const idx = QUALITY_GRADES_V2.indexOf(config)
  const next = QUALITY_GRADES_V2[idx + 1]
  const nextGradeMin = next?.min ?? null

  return {
    grade,
    nameRu: nameRu ?? 'Обычное',
    min,
    max,
    step,
    steps,
    progressInGrade,
    nextGradeMin,
    color,
    multiplier,
  }
}

/** Краткая подпись диапазона качества для прогноза (возможен переход через градации). */
export function describeQualityRange(qMin: number, qMax: number): string {
  const a = Math.round(Math.max(0, Math.min(100, Math.min(qMin, qMax))))
  const b = Math.round(Math.max(0, Math.min(100, Math.max(qMin, qMax))))
  const da = getQualityWithinGradeDisplay(a)
  const db = getQualityWithinGradeDisplay(b)
  if (da.grade === db.grade) {
    const lo = Math.min(da.step, db.step)
    const hi = Math.max(da.step, db.step)
    return `${da.nameRu}: шаги ${lo}–${hi} из ${da.steps}`
  }
  return `${da.nameRu} ${da.step}/${da.steps} … ${db.nameRu} ${db.step}/${db.steps}`
}
