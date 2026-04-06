/**
 * Типы локаций для модуля экспедиций
 * Автономный модуль — может быть перенесён в основной проект
 */

import type { ElementAxisId } from '@/data/weapon-damage/elemental-axes'

// ============================================================================
// ТИпы редкости
// ============================================================================

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 100,
  uncommon: 40,
  rare: 15,
  epic: 5,
  legendary: 1,
} as const;

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9CA3AF',      // Серый
  uncommon: '#22C55E',    // Зелёный
  rare: '#3B82F6',        // Синий
  epic: '#A855F7',        // Фиолетовый
  legendary: '#F97316',   // Оранжевый
} as const;

// ============================================================================
// ТИпы локаций
// ============================================================================

export type LocationTier = 1 | 2 | 3 | 4;

export type LocationType =
  | 'forest'
  | 'mine'
  | 'swamp'
  | 'mountain'
  | 'volcanic'
  | 'underground'
  | 'magical';

export type LocationTag = string;

// ============================================================================
// Погодные условия
// ============================================================================

export interface WeatherCondition {
  id: string;
  name: string;
  chance: number;          // Шанс в процентах
  effects: WeatherEffect[];
}

export interface WeatherEffect {
  type: 'visibility' | 'speed' | 'stealth' | 'damage' | 'magic' | 'special';
  value: number;           // Процент модификатора
  description?: string;
}

// ============================================================================
// Ресурсы локации
// ============================================================================

export interface LocationResource {
  materialId: string;
  baseWeight: number;      // Базовый шанс выпадения
  rarity: Rarity;
  minQuantity: number;
  maxQuantity: number;
  /** Сырьё базового крафта (руда, уголь, простая древесина) — выше шанс в случайных находках */
  lootTier?: 'primary' | 'secondary';
  seasonalModifier?: SeasonalModifier;
}

export interface SeasonalModifier {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  weightMultiplier: number;
}

// ============================================================================
// Распределение редкости по tiers
// ============================================================================

export interface RarityDistribution {
  common: number;
  uncommon: number;
  rare: number;
  epic: number;
  legendary: number;
}

export const TIER_RARITY_DISTRIBUTION: Record<LocationTier, RarityDistribution> = {
  1: { common: 90, uncommon: 10, rare: 0, epic: 0, legendary: 0 },
  2: { common: 70, uncommon: 20, rare: 10, epic: 0, legendary: 0 },
  3: { common: 50, uncommon: 25, rare: 20, epic: 5, legendary: 0 },
  4: { common: 30, uncommon: 30, rare: 25, epic: 14, legendary: 1 },
} as const;

// ============================================================================
// NPC
// ============================================================================

export type NPCDisposition = 'hostile' | 'neutral' | 'friendly';

export interface LocationNPC {
  id: string;
  name: string;
  levelRange: [number, number];
  disposition: NPCDisposition;
  description: string;
  groupSize?: number;      // Для стайных существ
}

// ============================================================================
// Подземелье
// ============================================================================

export interface DungeonHook {
  name: string;
  description: string;
  entryRequirement: string;  // ID требуемого предмета
  difficulty: 'hard' | 'extreme' | 'legendary';
}

// ============================================================================
// Локация (полный тип)
// ============================================================================

export interface Location {
  // Идентификация
  id: string;
  name: string;
  description: string;

  // Классификация
  tier: LocationTier;
  type: LocationType;
  tags: LocationTag[];

  /** Стихии окружения; фильтр выдачи elemental_* на оружие (ELEMENTAL_PLATFORM_SPEC §3.2). Пусто — пока без явных стихий. */
  presentElements?: ElementAxisId[];

  // Доступ
  unlockRequirements: LocationUnlockRequirements;

  // Ресурсы
  resources: LocationResource[];
  rarityDistribution: RarityDistribution;

  // Условия
  weather: WeatherCondition[];

  // Население
  npcs: {
    hostile: LocationNPC[];
    neutral: LocationNPC[];
    friendly: LocationNPC[];
  };

  // Сюжет
  plotHook: string;
  dungeonHook?: DungeonHook;
}

// ============================================================================
// Требования для разблокировки
// ============================================================================

export interface LocationUnlockRequirements {
  guildLevel: number;
  completedLocations?: string[];  // ID локаций, которые нужно пройти
  requiredItems?: string[];       // ID предметов для доступа
  questCompleted?: string;        // ID квеста
}

// ============================================================================
// Утилиты
// ============================================================================

export function getTierByGuildLevel(level: number): LocationTier[] {
  if (level >= 9) return [1, 2, 3, 4];
  if (level >= 6) return [1, 2, 3];
  if (level >= 3) return [1, 2];
  return [1];
}

export function isLocationUnlocked(
  location: Location,
  guildLevel: number,
  completedLocations: string[] = [],
  completedQuests: string[] = [],
  ownedItems: string[] = []
): boolean {
  const req = location.unlockRequirements;

  if (guildLevel < req.guildLevel) return false;

  if (req.completedLocations) {
    for (const locId of req.completedLocations) {
      if (!completedLocations.includes(locId)) return false;
    }
  }

  if (req.questCompleted && !completedQuests.includes(req.questCompleted)) {
    return false;
  }

  if (req.requiredItems) {
    for (const itemId of req.requiredItems) {
      if (!ownedItems.includes(itemId)) return false;
    }
  }

  return true;
}
