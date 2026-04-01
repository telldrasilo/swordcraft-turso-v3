/**
 * Утилиты для управления контентом модуля экспедиций
 *
 * Экспортирует все функции для работы с:
 * - Материалами (material-utils.ts)
 * - Миссиями (mission-utils.ts)
 * - Локациями (location-utils.ts)
 */

// ============================================================================
// МАТЕРИАЛЫ
// ============================================================================

export {
  // Добавление
  addMaterialToRegistry,
  addMaterialsToRegistry,
  addResourceToLocation,
  addResourcesToLocation,

  // Обновление
  updateResourceInLocation,
  removeResourceFromLocation,

  // Расчёты
  recalculateRarityDistribution,

  // Валидация
  validateLocationMaterials,
  validateAllLocations,
  validateLocationMaterials as validateMaterialsInLocation,

  // Специальные
  getLocationsWithMaterial,
  cloneMaterialToLocation,
} from './material-utils';

// ============================================================================
// МИССИИ
// ============================================================================

export {
  // Добавление
  addMissionToRegistry,
  addMissionsToRegistry,

  // Обновление
  updateMissionInRegistry,
  updateMissionReward,
  updateMissionCost,
  updateMissionDuration,
  updateMissionEnemies,

  // Удаление
  removeMissionFromRegistry,

  // Фильтрация
  getMissionsForLocation,
  getMissionsByType,
  getMissionsByDifficulty,
  getMissionsByRarity,
  getMissionsForGuildLevel,
  getAvailableMissions,

  // Валидация
  validateMission,
  validateAllMissions,

  // Фабрики
  createHuntMission,
  createGatherMission,
  createScoutMission,
} from './mission-utils';

export type { MissionValidationError } from './mission-utils';

// ============================================================================
// ЛОКАЦИИ
// ============================================================================

export {
  // Добавление
  addLocationToRegistry,
  addLocationsToRegistry,

  // Обновление
  updateLocationInRegistry,
  updateLocationResources,
  addResourceToLocationInRegistry,
  updateLocationWeather,
  addWeatherToLocation,
  updateLocationNPCs,
  addNPCToLocation,
  updateLocationUnlockRequirements,

  // Удаление
  removeLocationFromRegistry,
  removeResourceFromLocationInRegistry,

  // Фильтрация
  getLocationsByTierFromRegistry,
  getLocationsByTypeFromRegistry,
  getLocationsByTagFromRegistry,
  getAvailableLocationsForGuildLevel,
  getLocationsWithMaterialFromRegistry,
  getLocationsWithWeather,
  getLocationsWithNPC,

  // Валидация
  validateLocation,
  validateAllLocationsInRegistry,

  // Фабрики
  createLocation,
  createForestLocation,
  createMineLocation,
  createSwampLocation,

  // Статистика
  getLocationStats,
  getRegistryStats,
} from './location-utils';

export type { LocationValidationError } from './location-utils';

// ============================================================================
// ЭКСПОРТ ТИПОВ
// ============================================================================

export type { ScalableValue, MissionType, MissionDifficulty, MissionRarity } from '../data/missions/_mission-template';
export type { Location, LocationResource, LocationTier, Rarity } from '../types';
export type { Material } from '../types/resource.types';

// ============================================================================
// БАЛАНСИРОВКА
// ============================================================================

export {
  GLOBAL_BALANCE_CONFIG,
  applyResourceMultiplier,
  applyQualityShift,
  applyDropChanceMultiplier,
  applyDurationMultiplier,
  applyEventTimeMultiplier,
  applySoftCap,
  getRandomValue,
  getBalanceConfig,
  resetBalanceConfig,
  isTestingMode,
} from './balance-config';

export type { BalancePreset } from './balance-config';
