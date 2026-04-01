/**
 * Типы миссий для модуля экспедиций
 */

import { ExpeditionDifficulty, ExpeditionType } from './expedition.types';
import { Rarity } from './location.types';

// ============================================================================
// Шаблон миссии
// ============================================================================

export interface MissionTemplate {
  id: string;
  locationId: string;

  // Идентификация
  name: string;
  description: string;

  // Классификация
  type: ExpeditionType;
  difficulty: ExpeditionDifficulty;

  // Параметры
  duration: number;  // Секунды

  // Награды
  rewards: MissionReward[];

  // Повторяемость
  isRepeatable: boolean;
  cooldown?: number;

  // Для боевых миссий
  enemyTypes?: string[];
  enemyCount?: [number, number];

  // Условия появления
  conditions?: MissionCondition[];
}

// ============================================================================
// Награда миссии
// ============================================================================

export interface MissionReward {
  type: 'gold' | 'warSoul' | 'glory' | 'reputation' | 'material' | 'item';
  baseAmount: number;
  variance?: number;      // Случайное отклонение ±
  rarity?: Rarity;
  materialId?: string;
  itemId?: string;
}

// ============================================================================
// Условия появления миссии
// ============================================================================

export interface MissionCondition {
  type: 'time' | 'weather' | 'quest_completed' | 'location_cleared' | 'item_owned';
  value: string | number;
}

// ============================================================================
// Генерация миссий
// ============================================================================

export interface MissionGenerationContext {
  locationId: string;
  guildLevel: number;
  completedMissions: string[];
  currentWeather?: string;
  currentTime?: number;
}

export interface GeneratedMission extends MissionTemplate {
  generatedAt: number;
  expiresAt?: number;
  seed: string;  // Для воспроизводимости
}

// ============================================================================
// События экспедиции
// ============================================================================

export type ExpeditionEventType =
  | 'combat'
  | 'discovery'
  | 'social'
  | 'travel'
  | 'danger'
  | 'rest'
  | 'mystery'
  | 'weather'
  | 'treasure';

// ============================================================================
// Шаблон события
// ============================================================================

export interface ExpeditionEventTemplate {
  id: string;
  name: string;
  text: string;
  type: ExpeditionEventType;
  icon: string;

  // Условия появления
  conditions: EventCondition[];
  weight: number;

  // Флаги
  flags?: string[];

  // Возможные эффекты
  possibleEffects: EventEffectTemplate[];

  // Требования к локации
  locationTypes?: string[];
  locationTags?: string[];
  locationIds?: string[];
}

// ============================================================================
// Условия события
// ============================================================================

export interface EventCondition {
  type:
    | 'expedition_type'
    | 'difficulty'
    | 'duration_min'
    | 'duration_max'
    | 'location'
    | 'weather'
    | 'time_of_day'
    | 'random_chance';
  value: string | number | string[];
}

// ============================================================================
// Шаблон эффекта события
// ============================================================================

export interface EventEffectTemplate {
  type:
    | 'grant_resource'
    | 'grant_material'
    | 'modify_success'
    | 'modify_gold'
    | 'modify_warSoul'
    | 'damage_weapon'
    | 'heal'
    | 'damage'
    | 'narrative';
  value: number;
  variance?: number;
  resourceId?: string;
  materialId?: string;
  rarity?: Rarity;
  weight: number;  // Вес для случайного выбора
}

// ============================================================================
// Конфигурация генерации событий
// ============================================================================

export interface EventGenerationConfig {
  baseCount: number;
  eventsPerSeconds: number;
  minCount: number;
  maxCount: number;
}

export const DEFAULT_EVENT_CONFIG: EventGenerationConfig = {
  baseCount: 2,
  eventsPerSeconds: 0.001,  // 1 событие на 1000 секунд
  minCount: 1,
  maxCount: 8,
};

// ============================================================================
// Утилиты
// ============================================================================

export function calculateEventCount(
  duration: number,
  config: EventGenerationConfig = DEFAULT_EVENT_CONFIG
): number {
  const count = config.baseCount + Math.floor(duration * config.eventsPerSeconds);
  return Math.max(config.minCount, Math.min(config.maxCount, count));
}
