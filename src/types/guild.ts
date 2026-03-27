/**
 * Типы данных для системы гильдии и экспедиций
 */

import type { CraftedWeapon } from './craft'
import type { AdventurerExtended } from './adventurer-extended'
import type { KnownAdventurer } from './known-adventurer'
import type { CraftedWeaponV2 } from './craft-v2'
import type { ExpeditionEvent } from './expedition-events'

// Импортируем типы из adventurer-traits
import type { AdventurerTrait } from '@/data/adventurer-traits'
import type { UniqueBonus } from '@/data/unique-bonuses'

// Реэкспорт для использования в других местах
export type { AdventurerTrait, UniqueBonus }

// Реэкспорт типов экспедиций из expedition-templates
export type {
  ExpeditionTemplate,
  ExpeditionType,
  ExpeditionDifficulty,
  ExpeditionReward,
  ExpeditionCost,
} from '@/data/expedition-templates'

// ================================
// ИСКАТЕЛИ ПРИКЛЮЧЕНИЙ
// ================================

export interface WeaponRequirement {
  minAttack: number
  weaponType?: string
  minQuality?: number
  preferredEnchantment?: string
}

export interface Adventurer {
  id: string
  name: string
  title?: string
  nickname?: string
  skill: number // 0-30 (бонус к War Soul в процентах)
  traits: AdventurerTrait[]
  uniqueBonuses: UniqueBonus[] // Уникальные преимущества (1-3)
  requirements: WeaponRequirement
  portrait: number
  expiresAt: number
  createdAt: number
  hiredAt?: number // Когда был нанят (опционально)
}

// ================================
// ТИПЫ ЭКСПЕДИЦИЙ
// ================================

// ExpeditionTemplate, ExpeditionType, ExpeditionDifficulty
// ExpeditionReward, ExpeditionCost реэкспортируются выше из @/data/expedition-templates

// ================================
// АКТИВНЫЕ ЭКСПЕДИЦИИ
// ================================

export interface ActiveExpedition {
  id: string
  expeditionId: string // ID шаблона
  expeditionName: string // Кэшируем имя для UI
  expeditionIcon: string
  adventurerId: string
  adventurerName: string // Кэшируем имя для UI
  adventurerData?: Adventurer // Старый формат для совместимости
  adventurerExtended?: AdventurerExtended // Полные данные Extended
  weaponId: string
  weaponName: string // Кэшируем имя для UI
  weaponData: CraftedWeaponV2 // Копия данных об оружии (для восстановления)
  startedAt: number
  endsAt: number
  deposit: number // Сохранённый депозит
  suppliesCost: number // Сохранённая стоимость снабжения
  events?: ExpeditionEvent[] // События во время экспедиции (опционально для обратной совместимости)
}

// ================================
// КВЕСТЫ ВОССТАНОВЛЕНИЯ
// ================================

export interface RecoveryQuest {
  id: string
  lostWeaponId: string
  lostWeaponData: CraftedWeaponV2 // Копия данных об оружии
  originalExpeditionId: string
  originalExpeditionName: string
  cost: number
  duration: number
  startedAt?: number
  endsAt?: number
  status: 'available' | 'active' | 'completed' | 'declined'
}

// ================================
// ИСТОРИЯ И СТАТИСТИКА
// ================================

export interface ExpeditionHistoryEntry {
  id: string
  expeditionName: string
  expeditionIcon: string
  adventurerName: string
  adventurerData?: Adventurer // Старый формат для совместимости
  adventurerExtended?: AdventurerExtended // Полные данные Extended со всеми чертами
  weaponName: string
  completedAt: number
  success: boolean
  commission: number
  warSoul: number
  glory: number
  weaponLost: boolean
  isCrit?: boolean // Критический успех
}

export interface GuildStats {
  totalExpeditions: number
  successfulExpeditions: number
  failedExpeditions: number
  weaponsLost: number
  weaponsRecovered: number
  totalCommission: number
  totalWarSoul: number
  totalGlory: number
}

// ================================
// СОСТОЯНИЕ ГИЛЬДИИ
// ================================

export interface GuildState {
  level: number
  reputation: number // Новое поле: очки репутации гильдии
  totalReputation: number // Общая заработанная репутация (не уменьшается)

  // Glory сохраняется для обратной совместимости, но больше не используется для уровней
  glory: number
  totalGlory: number

  adventurers: Adventurer[]
  adventurerRefreshAt: number

  // База известных искателей (для контрактов)
  knownAdventurers: KnownAdventurer[]
  maxKnownAdventurers: number

  activeExpeditions: ActiveExpedition[]
  recoveryQuests: RecoveryQuest[]

  history: ExpeditionHistoryEntry[]
  stats: GuildStats
}

// ================================
// УРОВНИ ГИЛЬДИИ
// ================================

export interface GuildLevelData {
  level: number
  requiredReputation: number // Требуется репутации (заменили glory на reputation)
  maxActiveExpeditions: number // Максимальное количество экспедиций одновременно
  commissionReduction: number // Снижение комиссии в процентах
  maxKnownAdventurers: number // Максимум известных искателей
}

export const GUILD_LEVELS: GuildLevelData[] = [
  { level: 1, requiredReputation: 0, maxActiveExpeditions: 1, commissionReduction: 0, maxKnownAdventurers: 5 },
  { level: 2, requiredReputation: 500, maxActiveExpeditions: 1, commissionReduction: 0, maxKnownAdventurers: 7 },
  { level: 3, requiredReputation: 1500, maxActiveExpeditions: 2, commissionReduction: 0, maxKnownAdventurers: 10 },
  { level: 4, requiredReputation: 3500, maxActiveExpeditions: 2, commissionReduction: 0, maxKnownAdventurers: 12 },
  { level: 5, requiredReputation: 7000, maxActiveExpeditions: 2, commissionReduction: 0, maxKnownAdventurers: 15 },
  { level: 6, requiredReputation: 12000, maxActiveExpeditions: 2, commissionReduction: 0, maxKnownAdventurers: 18 },
  { level: 7, requiredReputation: 20000, maxActiveExpeditions: 2, commissionReduction: 0, maxKnownAdventurers: 22 },
  { level: 8, requiredReputation: 30000, maxActiveExpeditions: 2, commissionReduction: 0, maxKnownAdventurers: 25 },
  { level: 9, requiredReputation: 45000, maxActiveExpeditions: 2, commissionReduction: 0, maxKnownAdventurers: 30 },
  { level: 10, requiredReputation: 65000, maxActiveExpeditions: 3, commissionReduction: 0, maxKnownAdventurers: 35 },
]

// Функция получения уровня гильдии по репутации
export function getGuildReputationLevel(reputation: number): number {
  for (let i = GUILD_LEVELS.length - 1; i >= 0; i--) {
    if (reputation >= GUILD_LEVELS[i].requiredReputation) {
      return GUILD_LEVELS[i].level
    }
  }
  return 1
}

// Функция получения данных уровня по номеру
export function getGuildLevelData(level: number): GuildLevelData | undefined {
  return GUILD_LEVELS.find(l => l.level === level)
}

// Функция получения максимального количества экспедиций
export function getMaxActiveExpeditions(guildLevel: number): number {
  const levelData = GUILD_LEVELS.find(l => l.level === guildLevel)
  return levelData?.maxActiveExpeditions ?? 1
}

// Функция получения снижения комиссии
export function getCommissionReduction(guildLevel: number): number {
  const levelData = GUILD_LEVELS.find(l => l.level === guildLevel)
  return levelData?.commissionReduction ?? 0
}

// Функция получения бонуса комиссии (для обратной совместимости)
export function getCommissionBonus(guildLevel: number): number {
  const levelData = GUILD_LEVELS.find(l => l.level === guildLevel)
  return levelData?.commissionReduction ?? 0
}

// Функция расчёта количества репутации до следующего уровня
export function getReputationToNextLevel(currentReputation: number, currentLevel: number): number {
  const nextLevelData = GUILD_LEVELS.find(l => l.level === currentLevel + 1)
  if (!nextLevelData) return 0
  return nextLevelData.requiredReputation - currentReputation
}

// Функция расчёта общего количества репутации для следующего уровня
export function getTotalReputationForLevel(level: number): number {
  const levelData = GUILD_LEVELS.find(l => l.level === level)
  return levelData?.requiredReputation ?? 0
}

// ================================
// РАСЧЁТ РЕПУТАЦИИ
// ================================

/**
 * Тип деятельности для начисления репутации
 */
export type ReputationActivityType = 'craft' | 'expedition' | 'dungeon'

/**
 * Рассчитать количество репутации за деятельность
 *
 * Формула:
 * - Крафт: baseReward × playerLevelMultiplier
 * - Экспедиции: baseReward × 1.5 × playerLevelMultiplier
 * - Подземелья: baseReward × 1.2 × playerLevelMultiplier
 *
 * Где playerLevelMultiplier = 0.5 + playerLevel × 0.05
 *
 * @param type - Тип деятельности
 * @param baseReward - Базовая награда (goldReward или baseGold)
 * @param playerLevel - Уровень кузнеца
 * @returns Количество репутации
 */
export function calculateReputationGain(
  type: ReputationActivityType,
  baseReward: number,
  playerLevel: number
): number {
  // Множитель от уровня кузнеца (стимулирует прокачку)
  // При уровне 1: 0.55, при уровне 10: 1.0, при уровне 20: 1.5
  const playerLevelMultiplier = 0.5 + playerLevel * 0.05

  // Базовый множитель для всех видов деятельности = 2.0
  const baseMultiplier = 2.0

  // Активный множитель по типу деятельности
  let activityMultiplier = 1
  switch (type) {
    case 'craft':
      activityMultiplier = 1.0 // Крафт даёт базовое количество
      break
    case 'expedition':
      activityMultiplier = 1.5 // Экспедиции дают в 1.5 раза больше
      break
    case 'dungeon':
      activityMultiplier = 1.2 // Подземелья (заглушка)
      break
  }

  const reputation = Math.floor(baseReward * baseMultiplier * activityMultiplier * playerLevelMultiplier)

  // Минимум 1 очко репутации за любую деятельность
  return Math.max(1, reputation)
}

// ================================
// НАЧАЛЬНОЕ СОСТОЯНИЕ
// ================================

export const initialGuildState: GuildState = {
  level: 1,
  reputation: 0,
  totalReputation: 0,
  glory: 0,
  totalGlory: 0,
  adventurers: [],
  adventurerRefreshAt: 0,
  knownAdventurers: [],
  maxKnownAdventurers: 5,
  activeExpeditions: [],
  recoveryQuests: [],
  history: [],
  stats: {
    totalExpeditions: 0,
    successfulExpeditions: 0,
    failedExpeditions: 0,
    weaponsLost: 0,
    weaponsRecovered: 0,
    totalCommission: 0,
    totalWarSoul: 0,
    totalGlory: 0,
  },
}
