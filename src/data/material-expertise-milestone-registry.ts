/**
 * Реестр вех экспертизы материалов (CRAFT_SYSTEM_ROADMAP §2.4, §7 п.4).
 * Числовые бонусы в прогнозе — `FORECAST_EXPERTISE_MILESTONE_*` в store-utils/constants;
 * здесь — человекочитаемые метки для UI и будущих перков в данных.
 */

export type MaterialExpertiseMilestoneTier = 'milestone_80' | 'milestone_100'

export interface GlobalMaterialExpertiseMilestoneRow {
  tier: MaterialExpertiseMilestoneTier
  atPercent: 80 | 100
  labelRu: string
  summaryRu: string
  /**
   * Дополнительный вклад к множителю вех средней экспертизы в прогнозе качества
   * (суммируется с `FORECAST_EXPERTISE_MILESTONE_*` в constants при avgExpertise >= atPercent).
   */
  forecastExpertiseFactorExtra?: number
}

export const GLOBAL_MATERIAL_EXPERTISE_MILESTONE_ROWS: GlobalMaterialExpertiseMilestoneRow[] = [
  {
    tier: 'milestone_80',
    atPercent: 80,
    labelRu: 'Уверенное мастерство',
    summaryRu: 'Сужение разброса прогноза и малый бонус к качеству (см. forecast-calculator).',
    forecastExpertiseFactorExtra: 0.002,
  },
  {
    tier: 'milestone_100',
    atPercent: 100,
    labelRu: 'Покорение материала',
    summaryRu: 'Дополнительный вклад в стабильность прогноза; основа для будущих уникальных перков.',
    forecastExpertiseFactorExtra: 0.003,
  },
]

/** Сумма `forecastExpertiseFactorExtra` из реестра для достигнутых порогов средней экспертизы плана. */
export function getRegistryForecastExpertiseFactorExtras(avgExpertisePercent: number): number {
  let sum = 0
  for (const row of GLOBAL_MATERIAL_EXPERTISE_MILESTONE_ROWS) {
    if (avgExpertisePercent >= row.atPercent && row.forecastExpertiseFactorExtra != null) {
      sum += row.forecastExpertiseFactorExtra
    }
  }
  return sum
}
