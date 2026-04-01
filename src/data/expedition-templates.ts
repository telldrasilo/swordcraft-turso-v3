/**
 * Шаблоны экспедиций для гильдии
 */

import type { ExpeditionTags } from '@/types/expedition-tags'
import type {
  ExpeditionDifficulty as ExpeditionDifficultyDomain,
  ExpeditionMissionType,
} from '@/types/expedition-domain'
import { EXPEDITION_DIFFICULTY_BALANCE } from '@/lib/expedition-difficulty-balance'
import { MISSION_REGISTRY } from '@/modules/expeditions'
import { missionModuleToCalculatorTemplate } from '@/lib/expedition-mission-bridge'

// ================================
// ТИПЫ
// ================================

/** Алиас канона `ExpeditionMissionType` (`src/types/expedition-domain.ts`) для обратной совместимости */
export type ExpeditionType = ExpeditionMissionType
export type ExpeditionDifficulty = ExpeditionDifficultyDomain

export interface ExpeditionReward {
  baseGold: number
  baseWarSoul: number
  bonusResources?: { resource: string; amount: number; chance: number }[]
  bonusEssence?: number
}

export interface ExpeditionCost {
  supplies: number
  deposit: number
}

export interface ExpeditionTemplate {
  id: string
  name: string
  description: string
  /** Краткая цель миссии модуля (одна строка); полное повествование в `description` */
  moduleObjective?: string
  /** Название локации модуля для UI (до интеграции прогрессии по картам) */
  moduleLocationName?: string
  /** Заказчик миссии (имя для карточки) */
  moduleClientName?: string
  icon: string
  type: ExpeditionType
  difficulty: ExpeditionDifficulty
  duration: number // Время в секундах
  cost: ExpeditionCost
  reward: ExpeditionReward
  minGuildLevel: number
  failureChance: number // Базовый шанс провала (0-100)
  weaponLossChance: number // Базовый шанс потери оружия при провале
  recommendedWeaponTypes: string[]
  minWeaponAttack: number
  tags?: ExpeditionTags // Тэги для подбора событий и категоризации (опционально)
  /** Для калькулятора v2 / модификаторов (напр. миссии модуля с явными врагами) */
  enemyTypes?: string[]
  /** Явный id миссии в `src/modules/expeditions` (если `id` шаблона не совпадает с миссией) */
  moduleMissionId?: string
  /** Договор генератора событий модуля; по умолчанию в хосте — `exploration` */
  moduleContractType?: 'exploration' | 'speed'
}

// ================================
// ДАННЫЕ О СЛОЖНОСТЯХ
// ================================

const DIFFICULTY_PRESENTATION: Record<
  ExpeditionDifficulty,
  { name: string; color: string; bgColor: string; stars: number; tierName: string }
> = {
  easy: {
    name: 'Лёгкая',
    color: 'text-green-400',
    bgColor: 'bg-green-900/30',
    stars: 1,
    tierName: 'Новичок',
  },
  normal: {
    name: 'Обычная',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/30',
    stars: 2,
    tierName: 'Опытный',
  },
  hard: {
    name: 'Сложная',
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/30',
    stars: 3,
    tierName: 'Ветеран',
  },
  extreme: {
    name: 'Экстремальная',
    color: 'text-red-400',
    bgColor: 'bg-red-900/30',
    stars: 4,
    tierName: 'Мастер',
  },
  legendary: {
    name: 'Легендарная',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/30',
    stars: 5,
    tierName: 'Герой',
  },
}

export type DifficultyInfoRow = (typeof DIFFICULTY_PRESENTATION)[ExpeditionDifficulty] &
  (typeof EXPEDITION_DIFFICULTY_BALANCE)[ExpeditionDifficulty]

export const difficultyInfo: Record<ExpeditionDifficulty, DifficultyInfoRow> = {
  easy: { ...DIFFICULTY_PRESENTATION.easy, ...EXPEDITION_DIFFICULTY_BALANCE.easy },
  normal: { ...DIFFICULTY_PRESENTATION.normal, ...EXPEDITION_DIFFICULTY_BALANCE.normal },
  hard: { ...DIFFICULTY_PRESENTATION.hard, ...EXPEDITION_DIFFICULTY_BALANCE.hard },
  extreme: { ...DIFFICULTY_PRESENTATION.extreme, ...EXPEDITION_DIFFICULTY_BALANCE.extreme },
  legendary: { ...DIFFICULTY_PRESENTATION.legendary, ...EXPEDITION_DIFFICULTY_BALANCE.legendary },
}

// ================================
// ДАННЫЕ О ТИПАХ
// ================================

export const typeInfo: Record<ExpeditionType, {
  name: string
  icon: string
  description: string
  warSoulMultiplier: number
}> = {
  hunt: { name: 'Охота', icon: '⚔️', description: 'Убийство монстров', warSoulMultiplier: 1.2 },
  scout: { name: 'Разведка', icon: '💎', description: 'Поиск сокровищ', warSoulMultiplier: 1.0 },
  clear: { name: 'Зачистка', icon: '🏰', description: 'Очистка подземелья', warSoulMultiplier: 1.5 },
  delivery: { name: 'Доставка', icon: '📜', description: 'Сопровождение каравана', warSoulMultiplier: 0.8 },
  magic: { name: 'Магическая', icon: '🧙', description: 'Специальные задания', warSoulMultiplier: 1.3 },
  rescue: { name: 'Спасение', icon: '🆘', description: 'Эвакуация и помощь', warSoulMultiplier: 1.15 },
  gather: { name: 'Сбор', icon: '🌿', description: 'Добыча ресурсов в поле', warSoulMultiplier: 0.9 },
  escort: { name: 'Сопровождение', icon: '🛡️', description: 'Охрана пути и людей', warSoulMultiplier: 1.0 },
  investigate: { name: 'Расследование', icon: '🔍', description: 'Поиск улик и тайн', warSoulMultiplier: 1.15 },
}

// ================================
// ШАБЛОНЫ ЭКСПЕДИЦИЙ (источник — миссии модуля expeditions)
// ================================

export const expeditionTemplates: ExpeditionTemplate[] = MISSION_REGISTRY.map(
  missionModuleToCalculatorTemplate
)

// ================================
// ФУНКЦИИ
// ================================

export function getExpeditionById(id: string): ExpeditionTemplate | undefined {
  return expeditionTemplates.find(e => e.id === id)
}

export function getExpeditionsByType(type: ExpeditionType): ExpeditionTemplate[] {
  return expeditionTemplates.filter(e => e.type === type)
}

export function getExpeditionsByDifficulty(difficulty: ExpeditionDifficulty): ExpeditionTemplate[] {
  return expeditionTemplates.filter(e => e.difficulty === difficulty)
}

export function getAvailableExpeditions(guildLevel: number): ExpeditionTemplate[] {
  return expeditionTemplates.filter(e => e.minGuildLevel <= guildLevel)
}

// Расчёт полной стоимости экспедиции
export function calculateTotalCost(template: ExpeditionTemplate): number {
  return template.cost.supplies + template.cost.deposit
}

// Расчёт комиссии игрока
export function calculateCommission(
  template: ExpeditionTemplate,
  guildLevel: number,
  glory: number
): number {
  // Базовая комиссия: 15% + 2% за каждый уровень гильдии
  const baseCommission = 15 + (guildLevel - 1) * 2

  // Бонус от славы: +1% за каждые 100 очков
  const gloryBonus = Math.floor(glory / 100)

  const totalCommission = Math.min(30, baseCommission + gloryBonus)

  return Math.floor(template.reward.baseGold * totalCommission / 100)
}

// Расчёт Души Войны для оружия
export function calculateWarSoul(
  template: ExpeditionTemplate,
  adventurerSkill: number,
  weaponQuality: number
): number {
  const typeMultiplier = typeInfo[template.type].warSoulMultiplier
  const skillBonus = 1 + adventurerSkill / 100
  const qualityBonus = 0.8 + (weaponQuality / 100) * 0.4 // 0.8-1.2

  const base = template.reward.baseWarSoul
  const result = base * typeMultiplier * skillBonus * qualityBonus

  // Добавляем случайность ±20%
  const variance = 0.8 + Math.random() * 0.4

  return Math.floor(result * variance)
}

// Расчёт шанса успеха
export function calculateSuccessChance(
  template: ExpeditionTemplate,
  weaponAttack: number,
  adventurerBonuses: number = 0
): number {
  // Базовый шанс успеха = 100% - шанс провала
  let baseSuccess = 100 - template.failureChance

  // Бонус от атаки оружия
  const attackBonus = Math.min(20, (weaponAttack - template.minWeaponAttack) / 2)
  baseSuccess += Math.max(0, attackBonus)

  // Бонус от искателя
  baseSuccess += adventurerBonuses

  // Ограничение: 10% - 95%
  return Math.max(10, Math.min(95, baseSuccess))
}

// Расчёт шанса потери оружия
export function calculateWeaponLossChance(
  template: ExpeditionTemplate,
  weaponQuality: number,
  adventurerBonuses: number = 0
): number {
  // Базовый шанс потери
  let lossChance = template.weaponLossChance

  // Каждые +20 качества = -2% к шансу потери
  const qualityReduction = Math.floor(weaponQuality / 20) * 2
  lossChance -= qualityReduction

  // Бонус от искателя
  lossChance += adventurerBonuses // Обычно отрицательный

  // Ограничение: 0% - 50%
  return Math.max(0, Math.min(50, lossChance))
}

// Расчёт случайных бонусов
export function rollBonusRewards(
  _template: ExpeditionTemplate
): { type: string; amount: number }[] {
  const bonuses: { type: string; amount: number }[] = []

  // Guild Bonus (20% шанс)
  if (Math.random() < 0.2) {
    bonuses.push({
      type: 'guild_bonus',
      amount: Math.floor(10 + Math.random() * 40), // 10-50 золота
    })
  }

  // Lucky Find (10% шанс)
  if (Math.random() < 0.1) {
    bonuses.push({
      type: 'lucky_find',
      amount: Math.floor(25 + Math.random() * 75), // 25-100 золота
    })
  }

  // Special Event (5% шанс)
  if (Math.random() < 0.05) {
    bonuses.push({
      type: 'special_event',
      amount: Math.floor(50 + Math.random() * 150), // 50-200 золота
    })
  }

  return bonuses
}
