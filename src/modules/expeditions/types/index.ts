/**
 * Экспорт всех типов модуля экспедиций
 */

// Локации
export type {
  Location,
  LocationTier,
  LocationType,
  LocationTag,
  LocationResource,
  LocationNPC,
  LocationUnlockRequirements,
  WeatherCondition,
  WeatherEffect,
  RarityDistribution,
  SeasonalModifier,
  DungeonHook,
} from './location.types';

export {
  RARITY_WEIGHTS,
  RARITY_COLORS,
  TIER_RARITY_DISTRIBUTION,
  getTierByGuildLevel,
  isLocationUnlocked,
} from './location.types';

export type { Rarity } from './location.types';

// Ресурсы
export type {
  Material,
  MaterialCategory,
  MaterialProperties,
  BaseResourceKey,
  ResourceAmount,
} from './resource.types';

export {
  getMaterialsByRarity,
  getMaterialsByCategory,
  getMaterialsByLocation,
} from './resource.types';

// Экспедиции
export type {
  ExpeditionType,
  ExpeditionDifficulty,
  DifficultyInfo,
  ExpeditionCost,
  ExpeditionReward,
  ExpeditionTemplate,
  ActiveExpedition,
  ExpeditionModifiers,
  ExpeditionEvent,
  EventEffectType,
  EventEffect,
  ExpeditionResult,
  RecoveryQuestData,
  ExpeditionHistoryEntry,
} from './expedition.types';

export {
  DIFFICULTY_INFO,
  getDifficultyByTier,
  calculateExpeditionDuration,
  isExpeditionComplete,
} from './expedition.types';

// Миссии
export type {
  MissionTemplate,
  MissionReward,
  MissionCondition,
  MissionGenerationContext,
  GeneratedMission,
  ExpeditionEventType,
  ExpeditionEventTemplate,
  EventCondition,
  EventEffectTemplate,
  EventGenerationConfig,
} from './mission.types';

export {
  DEFAULT_EVENT_CONFIG,
  calculateEventCount,
} from './mission.types';
