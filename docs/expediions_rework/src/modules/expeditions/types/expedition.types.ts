/**
 * Типы экспедиций для модуля
 */

import { Location, LocationTier } from './location.types';
import { Rarity } from './location.types';

// ============================================================================
// Тип и сложность экспедиции
// ============================================================================

export type ExpeditionType =
  | 'hunt'      // Охота на существ
  | 'scout'     // Разведка
  | 'clear'     // Зачистка
  | 'delivery'  // Доставка
  | 'magic'     // Магическая миссия
  | 'rescue'    // Спасение
  | 'gather';   // Сбор ресурсов

export type ExpeditionDifficulty =
  | 'easy'
  | 'normal'
  | 'hard'
  | 'extreme'
  | 'legendary';

// ============================================================================
// Константы сложности
// ============================================================================

export interface DifficultyInfo {
  failureChance: number;
  weaponLossChance: number;
  levelRange: [number, number];
  rewardMultiplier: number;
}

export const DIFFICULTY_INFO: Record<ExpeditionDifficulty, DifficultyInfo> = {
  easy: {
    failureChance: 5,
    weaponLossChance: 0,
    levelRange: [1, 5],
    rewardMultiplier: 1.0,
  },
  normal: {
    failureChance: 15,
    weaponLossChance: 2,
    levelRange: [3, 8],
    rewardMultiplier: 1.5,
  },
  hard: {
    failureChance: 30,
    weaponLossChance: 5,
    levelRange: [6, 12],
    rewardMultiplier: 2.0,
  },
  extreme: {
    failureChance: 50,
    weaponLossChance: 10,
    levelRange: [10, 16],
    rewardMultiplier: 3.0,
  },
  legendary: {
    failureChance: 70,
    weaponLossChance: 20,
    levelRange: [14, 20],
    rewardMultiplier: 5.0,
  },
} as const;

// ============================================================================
// Стоимость экспедиции
// ============================================================================

export interface ExpeditionCost {
  supplies: number;    // Расходники (списываются)
  deposit: number;     // Залог (возвращается при успехе)
}

// ============================================================================
// Награда экспедиции
// ============================================================================

export interface ExpeditionReward {
  baseGold: number;
  baseWarSoul: number;
  bonusResources?: string[];   // ID ресурсов
  bonusEssence?: number;
  guaranteedMaterials?: string[]; // ID материалов
  materialChance?: number;    // Шанс получить материал
}

// ============================================================================
// Шаблон экспедиции
// ============================================================================

export interface ExpeditionTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;

  // Связь с локацией
  locationId: string;

  // Классификация
  type: ExpeditionType;
  difficulty: ExpeditionDifficulty;

  // Время
  duration: number;  // В секундах

  // Экономика
  cost: ExpeditionCost;
  reward: ExpeditionReward;

  // Ограничения
  minGuildLevel: number;
  minWeaponAttack: number;
  recommendedWeaponTypes: string[];

  // Повторяемость
  isRepeatable: boolean;
  cooldown?: number;  // В секундах

  // Для боевых миссий
  enemyTypes?: string[];
  enemyCount?: [number, number];
}

// ============================================================================
// Активная экспедиция
// ============================================================================

export interface ActiveExpedition {
  id: string;

  // Ссылки
  expeditionId: string;
  expeditionName: string;
  expeditionIcon: string;
  locationId: string;

  // Участники
  adventurerId: string;
  adventurerName: string;
  adventurerData?: unknown;       // Adventurer из хоста
  adventurerExtended?: unknown;   // AdventurerExtended из хоста

  // Оружие
  weaponId: string;
  weaponName: string;
  weaponData: unknown;            // CraftedWeaponV2 из хоста

  // Время
  startedAt: number;
  endsAt: number;

  // Экономика
  deposit: number;
  suppliesCost: number;

  // События
  events: ExpeditionEvent[];

  // Модификаторы от событий
  accumulatedModifiers?: ExpeditionModifiers;
}

// ============================================================================
// Модификаторы экспедиции
// ============================================================================

export interface ExpeditionModifiers {
  successChance: number;      // Накопленный бонус/штраф
  goldMultiplier: number;
  warSoulMultiplier: number;
  weaponWear: number;
  additionalRewards: string[];
}

// ============================================================================
// Событие экспедиции
// ============================================================================

export interface ExpeditionEvent {
  instanceId: string;
  templateId: string;
  triggeredAt: number;
  order: number;
  shownAt?: number;
  resolvedAt?: number;

  // Результат события
  effects?: EventEffect[];
}

export type EventEffectType =
  | 'grant_resource'
  | 'grant_material_expertise'
  | 'modify_run'
  | 'damage_weapon'
  | 'damage_adventurer'
  | 'narrative_only';

export interface EventEffect {
  type: EventEffectType;
  value?: number;
  resourceId?: string;
  materialId?: string;
  description?: string;
}

// ============================================================================
// Результат экспедиции
// ============================================================================

export interface ExpeditionResult {
  success: boolean;
  isCrit: boolean;

  // Награды
  commission: number;
  warSoul: number;
  bonusGold: number;
  glory: number;
  reputation: number;

  // Полученные материалы
  materialsFound: string[];

  // Последствия
  weaponWear: number;
  weaponLost: boolean;
  recoveryQuest?: RecoveryQuestData;

  // Статистика
  eventsResolved: number;
  totalDuration: number;
}

export interface RecoveryQuestData {
  lostWeaponId: string;
  lostWeaponData: unknown;
  originalExpeditionId: string;
  originalExpeditionName: string;
  cost: number;
  duration: number;
}

// ============================================================================
// История экспедиций
// ============================================================================

export interface ExpeditionHistoryEntry {
  id: string;
  expeditionName: string;
  expeditionIcon: string;
  locationId: string;
  adventurerName: string;
  weaponName: string;
  completedAt: number;
  success: boolean;
  isCrit?: boolean;
  commission: number;
  warSoul: number;
  glory: number;
  weaponLost: boolean;
  materialsFound: string[];
}

// ============================================================================
// Утилиты
// ============================================================================

export function getDifficultyByTier(tier: LocationTier): ExpeditionDifficulty[] {
  switch (tier) {
    case 1: return ['easy', 'normal'];
    case 2: return ['normal', 'hard'];
    case 3: return ['hard', 'extreme'];
    case 4: return ['extreme', 'legendary'];
    default: return ['easy'];
  }
}

export function calculateExpeditionDuration(
  baseDuration: number,
  modifiers?: ExpeditionModifiers
): number {
  // События могут модифицировать длительность
  return baseDuration;
}

export function isExpeditionComplete(expedition: ActiveExpedition): boolean {
  return Date.now() >= expedition.endsAt;
}
