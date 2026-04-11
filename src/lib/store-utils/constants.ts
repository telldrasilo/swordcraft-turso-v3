/**
 * Store Utilities - Constants
 * Все константы и маппинги для игры
 */

import { ResourceKey } from '@/store/slices/resources-slice'

// ================================
// ТИТУЛЫ ИГРОКА
// ================================

export const PLAYER_TITLES: { minLevel: number; title: string }[] = [
  { minLevel: 50, title: 'Легендарный мастер' },
  { minLevel: 40, title: 'Великий мастер' },
  { minLevel: 30, title: 'Мастер-кузнец' },
  { minLevel: 20, title: 'Опытный кузнец' },
  { minLevel: 10, title: 'Подмастерье' },
  { minLevel: 5, title: 'Ученик' },
  { minLevel: 1, title: 'Новичок' },
]

// ================================
// ЦЕНЫ ПРОДАЖИ РЕСУРСОВ
// ================================

export const RESOURCE_SELL_PRICES: Partial<Record<ResourceKey, number>> = {
  // Сырьё
  wood: 0.3,
  stone: 0.4,
  iron: 2,
  coal: 1.5,
  copper: 3,
  tin: 3,
  silver: 8,
  goldOre: 15,
  mithril: 50,
  // Переработанные
  ironIngot: 4,
  copperIngot: 6,
  tinIngot: 6,
  bronzeIngot: 10,
  steelIngot: 15,
  silverIngot: 16,
  goldIngot: 30,
  mithrilIngot: 100,
  planks: 0.5,
  stoneBlocks: 0.6,
}

// ================================
// МНОЖИТЕЛИ ТИРОВ
// ================================

export const TIER_MULTIPLIERS: Record<string, number> = {
  common: 1,
  uncommon: 1.5,
  rare: 2,
  epic: 3,
  legendary: 5,
  mythic: 8,
}

/**
 * Перековка (усиление статов): надбавка к базовой цене в ДВ за каждый **тир души** на клинке (0…10).
 * Итог: `round(реестр.warSoulCost * (1 + tier * этот коэффициент))`. Пробуждение шрама не масштабируется.
 */
export const REFORGE_BUFF_WAR_SOUL_COST_PER_TIER = 0.08

// ================================
// КАЧЕСТВО ОРУЖИЯ
// ================================

export const QUALITY_GRADES: { min: number; max: number; grade: string; multiplier: number }[] = [
  { min: 0, max: 25, grade: 'poor', multiplier: 0.6 },
  { min: 26, max: 50, grade: 'normal', multiplier: 1.0 },
  { min: 51, max: 70, grade: 'good', multiplier: 1.3 },
  { min: 71, max: 85, grade: 'excellent', multiplier: 1.6 },
  { min: 86, max: 95, grade: 'masterwork', multiplier: 2.0 },
  { min: 96, max: 100, grade: 'legendary', multiplier: 3.0 },
]

// ================================
// КОНСТАНТЫ ИГРОКА
// ================================

/** Базовый опыт для следующего уровня */
export const BASE_EXPERIENCE_TO_LEVEL = 100

/** Множитель роста опыта */
export const EXPERIENCE_GROWTH_MULTIPLIER = 1.5

/** Бонус славы за уровень */
export const FAME_PER_LEVEL = 10

/** Максимальный уровень игрока */
export const MAX_PLAYER_LEVEL = 50

// ================================
// КОНСТАНТЫ РАБОЧИХ
// ================================

/** Базовый опыт для повышения уровня рабочего */
export const BASE_WORKER_EXP_TO_LEVEL = 100

/** Опыт за уровень рабочего */
export const WORKER_EXP_PER_LEVEL = 50

/** Максимальный уровень рабочего */
export const MAX_WORKER_LEVEL = 50

/** Множитель стоимости найма за каждого рабочего того же класса */
export const WORKER_COST_INCREASE_PER_CLASS = 0.5

/** Процент возврата при увольнении */
export const WORKER_FIRE_REFUND_PERCENT = 0.3

// ================================
// КОНСТАНТЫ КРАФТА
// ================================

/** Базовый опыт за крафт */
export const CRAFT_BASE_EXPERIENCE = 5

/** Множитель опыта за качество */
export const CRAFT_QUALITY_EXP_DIVISOR = 5

/** Базовая прочность оружия */
export const BASE_WEAPON_DURABILITY = 100

/** Базовый множитель эпичности */
export const BASE_EPIC_MULTIPLIER = 1.0

// ================================
// КОНСТАНТЫ ЗАЧАРОВАНИЯ
// ================================

/** Максимальное количество зачарований на оружии */
export const MAX_ENCHANTMENTS_PER_WEAPON = 3

// ================================
// КОНСТАНТЫ ЗАКАЗОВ
// ================================

/** Минимальное качество для заказа */
export const ORDER_MIN_QUALITY = 30

/** Максимальное качество для заказа */
export const ORDER_MAX_QUALITY = 90

/** Базовая награда золотом */
export const ORDER_BASE_GOLD_REWARD = 50

/** Базовая награда славой */
export const ORDER_BASE_FAME_REWARD = 5

// ================================
// КОНСТАНТЫ ЭКСПЕДИЦИЙ
// ================================

/** Время жизни искателя в пуле (мс) */
export const ADVENTURER_LIFETIME = 5 * 60 * 1000 // 5 минут

/** Базовый износ оружия */
export const BASE_WEAPON_WEAR = 10

/** Шанс критического успеха */
export const CRIT_SUCCESS_CHANCE = 10

// ================================
// МАТЕРИАЛЫ
// ================================

/**
 * Минимальная экспертиза по материалу для выбора в крафте v2 (ворота B1).
 * См. docs/systems/CRAFT_SYSTEM_ROADMAP.md §2, §6.1–6.2.
 */
export const MIN_MATERIAL_EXPERTISE_FOR_CRAFT = 10

/** Вехи экспертизы материалов: бонус к множителю качества в прогнозе (средняя по материалам плана). */
export const MATERIAL_EXPERTISE_MILESTONE_HIGH = 80
export const MATERIAL_EXPERTISE_MILESTONE_MAX = 100

/** Доп. множитель к expertiseFactor при средней экспертизе ≥ порога (B2 MVP). */
export const FORECAST_EXPERTISE_MILESTONE_80_EXTRA = 0.012
export const FORECAST_EXPERTISE_MILESTONE_100_EXTRA = 0.015

/** Стартовый набор материалов: выдаётся после туториала (§6.1 roadmap) */
export const CRAFT_STARTER_KNOWLEDGE_MATERIAL_IDS = [
  'iron_ore',
  'iron_alloy',
  'birch',
  'raw_leather',
] as const

/** Экспертиза, выдаваемая на стартовый набор после обучения */
export const CRAFT_STARTER_KNOWLEDGE_EXPERTISE = MIN_MATERIAL_EXPERTISE_FOR_CRAFT

// ================================
// ИЗУЧЕНИЕ МАТЕРИАЛОВ (энциклопедия, §6.3 roadmap)
// ================================

/** Базовое число параллельных сессий изучения без учёта зданий. */
export const MATERIAL_STUDY_BASE_SLOTS = 1

/**
 * Доп. слот за каждые N суммарных уровней разблокированных зданий
 * (sum(level) по buildings где unlocked).
 */
export const MATERIAL_STUDY_BUILDING_LEVELS_PER_EXTRA_SLOT = 6

/** Потолок параллельных сессий изучения. */
export const MATERIAL_STUDY_MAX_CONCURRENT_SLOTS = 6

/** Ускорение времени изучения за каждого назначенного рабочего: duration / (1 + per * n). */
export const MATERIAL_STUDY_WORKER_SPEED_PER_ASSIGNED = 0.12

export const MATERIAL_STUDY_MAX_WORKERS_ON_STUDY = 3

/** Шанс «неудачного» завершения: начисляется pity-прирост вместо полного ролла. */
export const MATERIAL_STUDY_COMPLETION_FAILURE_CHANCE = 0.1

export const MATERIAL_STUDY_FAILURE_PITY_GAIN = 1

/** Доля от типичного ролла при отмене, умножается на прогресс сессии [0–1]. */
export const MATERIAL_STUDY_CANCEL_PROGRESS_PAYOUT_RATIO = 0.45

/** Названия материалов на русском */
export const MATERIAL_NAMES: Record<string, string> = {
  iron: 'Железо',
  bronze: 'Бронза',
  steel: 'Сталь',
  silver: 'Серебро',
  gold: 'Золото',
  mithril: 'Мифрил',
  copper: 'Медь',
  tin: 'Олово',
}

/** Названия частей оружия на русском */
export const WEAPON_PART_NAMES: Record<string, string> = {
  blade: 'Лезвие',
  guard: 'Гарда',
  grip: 'Рукоять',
  pommel: 'Навершие',
  wrapping: 'Обмотка',
}

// ================================
// РЕМОНТ ОРУЖИЯ (фаза 3: авто-ремонт, осмотр)
// ================================

/**
 * Раньше — задержка таймера авто-ремонта. Таймер как основная цена снят (§7 фаза A);
 * оставлено для совместимости старых сейвов / поиска по коду.
 * @deprecated
 */
export const WEAPON_AUTO_REPAIR_DELAY_MS = 60_000

/** Базовая стоимость авто-ремонта в золоте (основная цена быстрого пути) */
export const WEAPON_AUTO_REPAIR_GOLD_BASE = 35

/** Доп. золото за единицу атаки оружия (мощность v1 — см. getWeaponRepairPowerScore) */
export const WEAPON_AUTO_REPAIR_GOLD_PER_ATTACK_POINT = 1

/** Длительность сеанса «осмотреть глубже» после списания материалов (мс) */
export const WEAPON_DEEP_INSPECT_DURATION_MS = 8_000

/** Расход материалов за запуск глубокого осмотра (кузнец тратит со склада) */
export const WEAPON_DEEP_INSPECT_MATERIAL_COST = { coal: 2 } as const

/** Доля восстановления разрыва прочности при авто-ремонте */
export const WEAPON_AUTO_REPAIR_DURABILITY_RESTORE_RATIO = 0.45

/** Множитель эпичности после авто-ремонта (штраф к наградам) */
export const WEAPON_AUTO_REPAIR_EPIC_MULTIPLIER = 0.98

/** Базовый шанс скрытой метки repair_legacy_resonance после успешного ручного ремонта */
export const WEAPON_LEGACY_RESONANCE_BASE_CHANCE = 0.06

/** +к шансу за каждый blade bond; верхняя граница бонуса */
export const WEAPON_LEGACY_RESONANCE_BOND_PER_POINT = 0.01
export const WEAPON_LEGACY_RESONANCE_BOND_CAP = 0.1

/** Авто-ремонт: слабее шанс той же метки */
export const WEAPON_AUTO_REPAIR_LEGACY_RESONANCE_BASE = 0.02
export const WEAPON_AUTO_REPAIR_LEGACY_RESONANCE_BOND_PER_POINT = 0.005
export const WEAPON_AUTO_REPAIR_LEGACY_RESONANCE_BOND_CAP = 0.05

/** Модель v2: вычитается из baseSuccessChance при неверной гипотезе осмотра (ручной ремонт) */
export const REPAIR_WRONG_HYPOTHESIS_SUCCESS_PENALTY_POINTS = 12

/**
 * Очередь верстака: за каждый завершённый по таймеру этап плана к финальному броску успеха
 * добавляется столько процентных пунктов (логика «промежуточная работа стабилизирует клинок»).
 */
export const REPAIR_WORKBENCH_STAGE_SUCCESS_BONUS_PER_STAGE = 4

/** Потолок суммарного бонуса от этапов верстака к финальному броску (% пунктов). */
export const REPAIR_WORKBENCH_STAGE_SUCCESS_BONUS_CAP = 24

/**
 * Успешный ремонт только **базовыми** техниками: шанс начислить шрам памяти клинка за каждый снятый тег.
 * Если в плане есть хотя бы одна узкоспециализированная техника — шрамы начисляются как раньше (полностью).
 */
export const REPAIR_BASIC_SCAR_ON_SUCCESS_CHANCE = 0.3

/**
 * Только `durability_maintenance`: доля восстановленной прочности от броска (остальной ремонт — полный roll).
 * «Немного» относительно полноценного ремонта по тегам.
 */
export const WEAPON_DURABILITY_MAINTENANCE_RESTORE_MULT = 0.62

/**
 * Средняя точка наценки автоподбора (ориентир); фактическое значение — getRepairAutoPickMaterialMarkup(weapon).
 * @deprecated для UI — используйте функцию
 */
export const REPAIR_AUTO_PICK_MATERIAL_MARKUP = 1.15

/** Нижняя граница множителя материалов при автоподборе (слабое оружие) */
export const REPAIR_AUTO_PICK_MARKUP_MIN = 1.08

/** Верхняя граница множителя материалов при автоподборе (сильное оружие) */
export const REPAIR_AUTO_PICK_MARKUP_MAX = 1.35

/** Референс атаки для «низа» шкалы наценки автоподбора */
export const REPAIR_AUTO_PICK_ATTACK_REF_MIN = 5

/** Референс атаки для «верха» шкалы наценки автоподбора */
export const REPAIR_AUTO_PICK_ATTACK_REF_MAX = 80

/** Минимальная доля текущей прочности к max для старта экспедиции и сдачи заказа NPC */
export const GUILD_WEAPON_MIN_DURABILITY_RATIO = 0.15

/** После стольких завершённых экспедиций показать подсказку про «Ремонт», если ещё не показывали */
export const WEAPON_REPAIR_GUIDANCE_EXPEDITION_MILESTONE = 3

// ================================
// КОНВЕРСИЯ ТИРОВ
// ================================

/** Маппинг числового тира в строковый */
export const TIER_NUMBER_TO_STRING: Record<number, string> = {
  1: 'common',
  2: 'uncommon',
  3: 'rare',
  4: 'epic',
  5: 'legendary',
  6: 'mythic',
}

/** Маппинг qualityGrade из V2 в legacy */
export const QUALITY_GRADE_V2_TO_LEGACY: Record<string, string> = {
  poor: 'poor',
  common: 'normal',
  good: 'good',
  excellent: 'excellent',
  masterpiece: 'masterwork',
  legendary: 'legendary',
}

// ================================
// КРАФТОВАЯ ЛИНИЯ (хребет рецепта)
// ================================

/**
 * Сборка линии из хребта `WeaponRecipe` + техники.
 * По умолчанию включено; отключение: `NEXT_PUBLIC_CRAFT_LINE_RECIPE_BACKBONE=false`.
 */
export function isCraftLineRecipeBackboneEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CRAFT_LINE_RECIPE_BACKBONE !== 'false'
}
