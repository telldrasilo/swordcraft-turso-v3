/**
 * Модуль экспедиций
 * Автономный модуль для системы локаций, миссий и экспедиций
 *
 * ИНТЕГРАЦИЯ:
 * 1. Импортировать типы из './types'
 * 2. Импортировать данные из './data'
 * 3. Реализовать интерфейсы из './contracts'
 * 4. Использовать утилиты для генерации миссий и событий
 *
 * СТАТИСТИКА:
 * - 11 локаций (Tier 1-4)
 * - 136 миссий
 * - 108 событий
 * - ~70 материалов
 */

// ============================================================================
// ТИПЫ
// ============================================================================

export * from './types';

// ============================================================================
// ЛОКАЦИИ
// ============================================================================

export {
  LOCATION_REGISTRY,
  getLocationById,
  getLocationsByTier,
  getAvailableLocations,
  getLocationsByType,
  getLocationsByTag,
  isLocationAvailable,
} from './data/locations';

// ============================================================================
// МАТЕРИАЛЫ
// ============================================================================

export {
  MATERIAL_REGISTRY,
  getMaterialById,
  getMaterialsByRarity,
  getMaterialsByCategory,
  getMaterialsForLocation,
  getMaterialName,
} from './data/materials';

// ============================================================================
// МИССИИ
// ============================================================================

export {
  MISSION_REGISTRY,
  MISSIONS_BY_LOCATION,
  MISSION_STATS,
  getMissionsForLocation,
  getMissionById,
  getMissionsByType,
  // Реэкспорты по локациям
  OAK_GROVE_MISSIONS,
  redStoneMinesMissions,
  mistyLowlandsMissions,
  silverGroveMissions,
  forgottenMinesMissions,
  rottenSwampMissions,
  frostIronRidgeMissions,
  ashWastesMissions,
  whisperingForestMissions,
  dragonScarsMissions,
  depthsMissions,
} from './data/missions';

export type { MissionTemplate } from './data/missions';

// ============================================================================
// СОБЫТИЯ
// ============================================================================

export {
  EVENT_REGISTRY,
  COMMON_EVENTS,
  LOCATION_EVENTS,
  EVENT_STATS,
  getEventById,
  getEventsForLocation,
  getEventsByType,
  getEventsByCategory,
  getEventsByTier,
  filterEventsByConditions,
  getRandomEvents,
  // Реэкспорт категорий
  commonEvents,
  commonDiscoveryEvents,
  commonDangerEvents,
  commonTravelEvents,
  commonSocialEvents,
  commonEnvironmentEvents,
  commonTreasureEvents,
  commonMysteryEvents,
  commonCombatEvents,
  commonRestEvents,
  commonSupernaturalEvents,
  // Реэкспорт по локациям
  oakGroveEvents,
  redStoneEvents,
  mistyLowlandsEvents,
  silverGroveEvents,
  forgottenMinesEvents,
  rottenSwampEvents,
  frostIronRidgeEvents,
  ashWastesEvents,
  whisperingForestEvents,
  dragonScarsEvents,
  depthsOfTheWorldEvents,
} from './data/events';

export type {
  EventTemplate,
  EventEffect,
  EventEffectType,
  EventType,
  EventCategory,
  EventConditions,
  EventChoice,
  GeneratedEvent,
  ResolvedEffect,
} from './data/events';

export {
  EVENT_TYPE_CONFIG,
  EVENT_COUNT_CONFIG,
  calculateEventCount,
  selectMaterialFromLocation,
  getMaterialsByRarityFromLocation,
  distributeEventsByTime,
} from './data/events';

// ============================================================================
// КОНТРАКТЫ ДЛЯ ИНТЕГРАЦИИ
// ============================================================================

export * from './contracts';

// ============================================================================
// УТИЛИТЫ
// ============================================================================

export {
  // Балансировка
  GLOBAL_BALANCE_CONFIG,
  BalancePreset,
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
} from './lib/balance-config';

export {
  // Генератор событий
  generateEventsForMission,
  resolveEventEffects,
} from './lib/event-generator';

export {
  // Утилиты локаций
  addLocationToRegistry,
  updateLocationInRegistry,
  updateLocationResources,
  addResourceToLocationInRegistry,
  addNPCToLocation,
  addWeatherToLocation,
  validateLocation,
  createForestLocation,
  createMineLocation,
  createSwampLocation,
  getLocationStats,
  getRegistryStats,
} from './lib/location-utils';

export {
  // Утилиты материалов
  addMaterialToRegistry,
  addResourceToLocation,
  updateResourceInLocation,
  removeResourceFromLocation,
  validateLocationMaterials,
  recalculateRarityDistribution,
} from './lib/material-utils';

export {
  // Утилиты миссий
  addMissionToRegistry,
  updateMissionInRegistry,
  updateMissionReward,
  updateMissionCost,
  removeMissionFromRegistry,
  getMissionsForLocation as getMissionsForLocationUtil,
  getAvailableMissions,
  validateMission,
  createHuntMission,
  createGatherMission,
  createScoutMission,
} from './lib/mission-utils';

// ============================================================================
// СТАТИСТИКА МОДУЛЯ
// ============================================================================

export const EXPEDITION_MODULE_STATS = {
  locations: 11,
  missions: 136,
  events: 108,
  materials: 70,
  byTier: {
    tier1: { locations: 3, missions: 36, events: 24 },
    tier2: { locations: 3, missions: 36, events: 24 },
    tier3: { locations: 3, missions: 40, events: 12 },
    tier4: { locations: 2, missions: 24, events: 8 },
    common: { events: 40 },
  },
} as const;
