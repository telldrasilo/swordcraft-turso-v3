// ================================
// ТИПЫ ДЛЯ ПРОГНОЗА РЕЗУЛЬТАТА ОРУЖИЯ
// ================================

import type { MaterialAssignment, Technique, WeaponRecipe } from '@/types/craft-v2'

// ================================
// Диапазон характеристики
// ================================

export interface StatRange {
  min: number
  max: number
  current?: number  // фактическое значение после крафта
  variance: number  // коэффициент неопределённости (0-1)
}

// ================================
// Ранг качества
// ================================

export type QualityRank = 'S' | 'A' | 'B' | 'C' | 'D' | 'F'

/** Диапазоны синхронизированы с getQualityRank в types/craft-v2.ts */
export const QUALITY_RANKS: Record<QualityRank, {
  name: string
  range: [number, number]
  color: string
  glow?: string
}> = {
  S: { name: 'Легендарное', range: [96, 100], color: 'text-amber-400', glow: 'shadow-amber-400/50' },
  A: { name: 'Эпическое', range: [86, 95], color: 'text-purple-400' },
  B: { name: 'Отличное', range: [71, 85], color: 'text-blue-400' },
  C: { name: 'Хорошее', range: [51, 70], color: 'text-green-400' },
  D: { name: 'Стандартное', range: [31, 50], color: 'text-stone-400' },
  F: { name: 'Слабое', range: [0, 30], color: 'text-red-400' },
}

// ================================
// Оценка качества
// ================================

export interface QualityScore {
  value: number         // среднее качество 0-100
  min: number          // минимально возможное
  max: number          // максимально возможное
  rank: QualityRank
  progress: number      // прогресс до следующего ранга (0-1)
}

// ================================
// Прогноз результата оружия
// ================================

export interface WeaponForecast {
  attack: StatRange
  durability: StatRange
  weight: StatRange
  /** Множитель награды души войны (Soul Potential); min/max совпадают, variance 0. */
  soulPotential: StatRange
  quality: QualityScore
  predictionAccuracy: number  // точность прогноза 50-100%
}

// ================================
// Детализация вкладов
// ================================

export type ContributionSource = 'materials' | 'techniques' | 'mastery' | 'expertise'

export interface ContributionDetail {
  name: string
  value: number
  description?: string
}

export interface ContributionBreakdown {
  source: ContributionSource
  value: number
  percentage: number
  details: ContributionDetail[]
}

export interface StatBreakdown {
  stat: 'attack' | 'durability' | 'weight' | 'soulPotential'
  breakdown: ContributionBreakdown[]
  accuracy: number
}

// ================================
// Параметры для расчёта
// ================================

export interface ForecastInput {
  recipe: {
    baseStats: {
      attackBase: number
      durabilityBase: number
      weightBase: number
      soulCapacityBase: number
    }
  }
  /**
   * Полный контекст крафта для расчёта Soul Potential (как в `computeSoulPotential`).
   * Без него альтернативный прогноз (`calculateWeaponForecast`) даёт ×1.0.
   */
  craftContext?: {
    recipe: WeaponRecipe
    materials: MaterialAssignment
    techniques: Technique[]
  }
  materials: Array<{
    material: {
      identity: { id: string; name: string }
      physical: {
        hardness: number
        toughness: number
        density: number
        compressiveStrength: number
        elasticity: number
      }
      arcane: {
        conductivity: number
        affinity: number
      }
    }
    quantity: number
    partWeight: number  // вес части в общем оружии
  }>
  techniques: Array<{
    id: string
    name: string
    effects: {
      qualityBonus?: number
      durabilityBonus?: number
      conductivityBonus?: number
    }
    penalties?: {
      riskOfFailure?: number
      qualityPenalty?: number
    }
  }>
  blacksmithLevel: number
  materialExpertise: Record<string, number>  // materialId -> expertise (0-100)
}

// ================================
// Вспомогательные типы
// ================================

export interface ExpertiseImpact {
  timeMultiplier: number         // множитель времени 0.85-1.0
  defectRiskMultiplier: number    // множитель риска дефектов 0.5-1.0
  materialWasteMultiplier: number // множитель отходов 0.4-1.0
  qualityBonus: number           // бонус к качеству 0-15
  varianceMultiplier: number      // множитель разброса 0.2-1.0
  predictionAccuracy: number     // точность прогноза 50-100%
}

export interface ForecastStats {
  totalMaterialContribution: number
  totalTechniqueBonus: number
  masteryBonus: number
  expertiseBonus: number
  riskPenalty: number
}
