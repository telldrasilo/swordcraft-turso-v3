/**
 * Типы экспедиций для модуля
 */

import type { LocationTier } from './location.types';
import type {
  ExpeditionDifficulty,
  ExpeditionMissionType,
} from '@/types/expedition-domain';
import { EXPEDITION_DIFFICULTY_BALANCE } from '@/lib/expedition-difficulty-balance';

// ============================================================================
// Тип и сложность экспедиции (канон — @/types/expedition-domain)
// ============================================================================

export type ExpeditionType = ExpeditionMissionType;

export type { ExpeditionDifficulty };

// ============================================================================
// Константы сложности
// ============================================================================

export interface DifficultyInfo {
  failureChance: number;
  weaponLossChance: number;
  levelRange: [number, number];
  rewardMultiplier: number;
}

/** Подмножество {@link EXPEDITION_DIFFICULTY_BALANCE} для контракта модуля */
export const DIFFICULTY_INFO: Record<ExpeditionDifficulty, DifficultyInfo> = {
  easy: pickDifficultyModuleView('easy'),
  normal: pickDifficultyModuleView('normal'),
  hard: pickDifficultyModuleView('hard'),
  extreme: pickDifficultyModuleView('extreme'),
  legendary: pickDifficultyModuleView('legendary'),
};

function pickDifficultyModuleView(d: ExpeditionDifficulty): DifficultyInfo {
  const b = EXPEDITION_DIFFICULTY_BALANCE[d];
  return {
    failureChance: b.failureChance,
    weaponLossChance: b.weaponLossChance,
    levelRange: b.levelRange,
    rewardMultiplier: b.rewardMultiplier,
  };
}

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
  _modifiers?: ExpeditionModifiers
): number {
  // События могут модифицировать длительность
  return baseDuration;
}

export function isExpeditionComplete(expedition: ActiveExpedition): boolean {
  return Date.now() >= expedition.endsAt;
}
