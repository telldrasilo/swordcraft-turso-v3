/**
 * Именованные константы расчёта крафта v2 (характеристики оружия).
 */

/** Значения бонусов материалов/техник заданы как «проценты» (20 = +20%). */
export const CRAFT_PERCENT_SCALE = 100

/** Стартовый баланс до учёта материалов. */
export const DEFAULT_WEAPON_BALANCE = 75

export const DEFAULT_REPAIR_POTENTIAL = 1.0

export const DEFAULT_ENCHANT_POWER = 1.0

/**
 * Делитель количества материала в вкладе в атаку/прочность
 * (исторически quantity/2).
 */
export const MATERIAL_EFFECT_QUANTITY_DIVISOR = 2

/** Опора для смещения баланса от среднего flexibility/hardness. */
export const BALANCE_MATERIAL_NEUTRAL = 50

/** Масштаб вклада материала в баланс. */
export const BALANCE_MATERIAL_WEIGHT = 0.2

export const BALANCE_MIN = 50
export const BALANCE_MAX = 100

export const WEIGHT_ROUND_DECIMALS = 10

export const ENCHANT_POWER_ROUND_DECIMALS = 100

export const SOUL_CAPACITY_PER_QUANTITY = 0.5

export const WEIGHT_PER_UNIT_DENSITY = 0.1

// --- Качество (calculateQuality) ---

export const QUALITY_BASE = 30

export const QUALITY_PER_BLACKSMITH_LEVEL = 2

export const QUALITY_AVG_MATERIAL_FALLBACK = 50

export const QUALITY_MATERIAL_TILT = 0.2

export const QUALITY_TECHNIQUE_PER_POINT = 0.5

// --- Цена продажи ---

export const SELL_GOLD_PER_ATTACK = 2

export const SELL_GOLD_PER_DURABILITY = 0.5

/** Базовая линия качества для множителя цены (50 → ×1, 100 → ×2). */
export const SELL_QUALITY_BASELINE = 50

export const SELL_GOLD_PER_ENCHANT_SLOT = 20

// =============================================================================
// Разброс итога крафта (асимметрия от экспертизы материалов)
// Высокая экспертиза: меньше просадка вниз, больше потолок вверх.
// =============================================================================

/** Макс. доля просадки вниз при нулевой экспертизе (доля от базы). */
export const CRAFT_VARIANCE_DOWN_MAX = 0.14

/** Мин. доля просадки вниз при 100% средней экспертизе. */
export const CRAFT_VARIANCE_DOWN_MIN = 0.035

/** Мин. доля бонуса вверх при нулевой экспертизе. */
export const CRAFT_VARIANCE_UP_MIN = 0.055

/** Макс. доля бонуса вверх при 100% средней экспертизе. */
export const CRAFT_VARIANCE_UP_MAX = 0.2

/** Вес и баланс: ослабленный разброс относительно атаки/прочности. */
export const CRAFT_VARIANCE_WEIGHT_DOWN_SCALE = 0.65

export const CRAFT_VARIANCE_WEIGHT_UP_SCALE = 0.55

// =============================================================================
// Прогноз крафта (forecast-calculator.ts)
// =============================================================================

export const FORECAST_PREDICTION_ACCURACY_BASE = 50

export const FORECAST_PREDICTION_ACCURACY_PER_EXPERTISE = 0.5

/** Вклад materialFactor в baseScore: (baseScore + materialFactor * N). */
export const FORECAST_QUALITY_MATERIAL_TERM_WEIGHT = 20

export const FORECAST_MATERIAL_FACTOR_BASE = 0.5

export const FORECAST_MATERIAL_QUALITY_DIVISOR = 200

export const FORECAST_EXPERTISE_FACTOR_BASE = 0.85

export const FORECAST_EXPERTISE_FACTOR_SLOPE = 0.3

export const FORECAST_TECHNIQUE_INCOMPATIBILITY_PENALTY = 0.1

export const FORECAST_TECHNIQUE_FACTOR_QUALITY_DIVISOR = CRAFT_PERCENT_SCALE

export const FORECAST_RISK_AGGREGATE_DIVISOR = CRAFT_PERCENT_SCALE

export const FORECAST_RISK_FACTOR_MAX_REDUCTION = 0.3

export const FORECAST_RISK_CURVE_WEIGHT = 0.3

export const FORECAST_QUALITY_VARIANCE_SPREAD = 0.4

export const FORECAST_QUALITY_MAX_SPREAD_RATIO = 0.5

export const FORECAST_AVG_MATERIAL_QUALITY_FALLBACK = 50

export const FORECAST_ATTACK_HARDNESS_WEIGHT = 0.5

export const FORECAST_ATTACK_TOUGHNESS_WEIGHT = 0.3

export const FORECAST_ATTACK_VARIANCE_SPREAD = 0.3

export const FORECAST_ATTACK_MAX_SPREAD_RATIO = 0.5

export const FORECAST_DUR_TOUGHNESS_WEIGHT = 0.6

export const FORECAST_DUR_COMPRESSIVE_WEIGHT = 0.2

export const FORECAST_DUR_VARIANCE_SPREAD = 0.25

export const FORECAST_DUR_MAX_SPREAD_RATIO = 0.5

export const FORECAST_WEIGHT_TECH_BALANCED_DESIGN_PERCENT = 10

export const FORECAST_WEIGHT_TECH_MASTER_BALANCE_PERCENT = 5

export const FORECAST_WEIGHT_VARIANCE_SPREAD = 0.15

export const FORECAST_WEIGHT_MAX_SPREAD_RATIO = 0.3

export const FORECAST_SOUL_CONDUCTIVITY_WEIGHT = 0.3

export const FORECAST_SOUL_AFFINITY_WEIGHT = 0.2

export const FORECAST_SOUL_VARIANCE_SPREAD = 0.35

export const FORECAST_SOUL_MAX_SPREAD_RATIO = 0.5

/** Пороги ранга качества в прогнозе (ветвление if value >= min). */
export const FORECAST_QUALITY_RANK_THRESHOLDS = [
  { min: 95, rank: 'S' as const },
  { min: 85, rank: 'A' as const },
  { min: 70, rank: 'B' as const },
  { min: 55, rank: 'C' as const },
  { min: 40, rank: 'D' as const },
]

export const FORECAST_QUALITY_RANK_FALLBACK = 'F' as const

export const FORECAST_RANK_PROGRESS_RANGES: Record<
  'S' | 'A' | 'B' | 'C' | 'D' | 'F',
  readonly [number, number]
> = {
  S: [95, 100],
  A: [85, 94],
  B: [70, 84],
  C: [55, 69],
  D: [40, 54],
  F: [0, 39],
}

/** Бонус «мастерство» в детализации вкладов: очки на уровень кузнеца. */
export const FORECAST_BREAKDOWN_MASTERY_PER_LEVEL = 2

/** Бонус экспертизы в детализации вкладов. */
export const FORECAST_BREAKDOWN_EXPERTISE_PER_POINT = 0.5

/** Техники → запрещённые подстроки id материалов (совместимость в прогнозе). */
export const FORECAST_TECHNIQUE_MATERIAL_INCOMPATIBILITIES: Readonly<
  Record<string, readonly string[]>
> = {
  dragon_hardening: ['mythril', 'mithril'],
  elven_forging: ['iron', 'steel'],
}

// =============================================================================
// Умная сортировка материалов (material-sorting.ts)
// =============================================================================

export const MATERIAL_SORT_WEIGHT_AVAILABILITY = 0.4

export const MATERIAL_SORT_WEIGHT_QUALITY = 0.3

export const MATERIAL_SORT_WEIGHT_EXPERTISE = 0.2

export const MATERIAL_SORT_WEIGHT_RARITY = 0.1

export const MATERIAL_SORT_IN_STOCK_SCORE = 100

export const MATERIAL_SORT_EXPERTISE_TO_POINTS = 0.2

export const MATERIAL_SORT_RARITY_STEPS = 4

export const MATERIAL_SORT_RARITY_MAX_SCORE = 50

export const MATERIAL_SORT_QUALITY_SCORE_CAP = 50

export const MATERIAL_SORT_QUALITY_PROPERTY_BLEND = 0.5

export const MATERIAL_SORT_PART_BLADE_HARDNESS = 0.6

export const MATERIAL_SORT_PART_BLADE_CONDUCTIVITY = 0.4

export const MATERIAL_SORT_PART_METAL_HARDNESS = 0.7

export const MATERIAL_SORT_PART_METAL_TOUGHNESS = 0.3

export const MATERIAL_SORT_PART_GRIP_ELASTICITY = 0.8

export const MATERIAL_SORT_PART_GRIP_DENSITY_INVERT = 0.2

export const MATERIAL_SORT_DENSITY_INVERT_BASE = CRAFT_PERCENT_SCALE

export const MATERIAL_SORT_RARITY_DISPLAY_MAX = 10
