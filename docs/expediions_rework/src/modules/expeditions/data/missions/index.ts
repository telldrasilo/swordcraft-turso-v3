/**
 * Реестр всех миссий экспедиций
 *
 * Объединяет миссии из всех локаций в единый реестр.
 */

import type { MissionTemplate } from './_mission-template';

// Tier 1
import { OAK_GROVE_MISSIONS } from './oak-grove-outskirts';
import { redStoneMinesMissions } from './red-stone-mines';
import { mistyLowlandsMissions } from './misty-lowlands';

// Tier 2
import { silverGroveMissions } from './silver-grove';
import { forgottenMinesMissions } from './forgotten-mines';
import { rottenSwampMissions } from './rotten-swamp';

// Tier 3
import { frostIronRidgeMissions } from './frost-iron-ridge';
import { ashWastesMissions } from './ash-wastes';
import { whisperingForestMissions } from './whispering-forest';

// Tier 4
import { dragonScarsMissions } from './dragon-scars';
import { depthsMissions } from './depths-of-the-world';

// ============================================================================
// РЕЕСТР МИССИЙ ПО ЛОКАЦИЯМ
// ============================================================================

export const MISSIONS_BY_LOCATION: Record<string, MissionTemplate[]> = {
  'oak_grove_outskirts': OAK_GROVE_MISSIONS,
  'red_stone_mines': redStoneMinesMissions,
  'misty_lowlands': mistyLowlandsMissions,
  'silver_grove': silverGroveMissions,
  'forgotten_mines': forgottenMinesMissions,
  'rotten_swamp': rottenSwampMissions,
  'frost_iron_ridge': frostIronRidgeMissions,
  'ash_wastes': ashWastesMissions,
  'whispering_forest': whisperingForestMissions,
  'dragon_scars': dragonScarsMissions,
  'depths_of_the_world': depthsMissions,
};

// ============================================================================
// ПОЛНЫЙ РЕЕСТР МИССИЙ
// ============================================================================

export const MISSION_REGISTRY: MissionTemplate[] = Object.values(MISSIONS_BY_LOCATION).flat();

// ============================================================================
// УТИЛИТЫ
// ============================================================================

/**
 * Получить миссии для конкретной локации
 */
export function getMissionsForLocation(locationId: string): MissionTemplate[] {
  return MISSIONS_BY_LOCATION[locationId] || [];
}

/**
 * Получить миссию по ID
 */
export function getMissionById(id: string): MissionTemplate | undefined {
  return MISSION_REGISTRY.find(m => m.id === id);
}

/**
 * Получить миссии по типу
 */
export function getMissionsByType(type: string): MissionTemplate[] {
  return MISSION_REGISTRY.filter(m => m.type === type);
}

// ============================================================================
// СТАТИСТИКА
// ============================================================================

export const MISSION_STATS = {
  total: MISSION_REGISTRY.length,
  byLocation: Object.fromEntries(
    Object.entries(MISSIONS_BY_LOCATION).map(([id, missions]) => [id, missions.length])
  ),
};

// ============================================================================
// РЕЭКСПОРТЫ
// ============================================================================

export { OAK_GROVE_MISSIONS } from './oak-grove-outskirts';
export { redStoneMinesMissions } from './red-stone-mines';
export { mistyLowlandsMissions } from './misty-lowlands';
export { silverGroveMissions } from './silver-grove';
export { forgottenMinesMissions } from './forgotten-mines';
export { rottenSwampMissions } from './rotten-swamp';
export { frostIronRidgeMissions } from './frost-iron-ridge';
export { ashWastesMissions } from './ash-wastes';
export { whisperingForestMissions } from './whispering-forest';
export { dragonScarsMissions } from './dragon-scars';
export { depthsMissions } from './depths-of-the-world';

export type { MissionTemplate } from './_mission-template';
