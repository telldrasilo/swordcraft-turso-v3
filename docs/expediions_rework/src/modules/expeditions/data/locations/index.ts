/**
 * Реестр всех локаций
 */

import type { Location } from '../../types';

// Tier 1
import { oakGroveOutskirts } from './tier1';
import { redStoneMines } from './tier1-red-stone';
import { mistyLowlands } from './tier1-misty';

// Tier 2
import { silverGrove, forgottenMines, rottenSwamp } from './tier2';

// Tier 3
import { frostIronRidge, ashWastes, whisperingForest } from './tier3';

// Tier 4
import { dragonScars, depthsOfTheWorld } from './tier4';

// ============================================================================
// Реестр локаций
// ============================================================================

export const LOCATION_REGISTRY: Location[] = [
  // Tier 1
  oakGroveOutskirts,
  redStoneMines,
  mistyLowlands,

  // Tier 2
  silverGrove,
  forgottenMines,
  rottenSwamp,

  // Tier 3
  frostIronRidge,
  ashWastes,
  whisperingForest,

  // Tier 4
  dragonScars,
  depthsOfTheWorld,
];

// ============================================================================
// Утилиты для работы с локациями
// ============================================================================

/**
 * Получить локацию по ID
 */
export function getLocationById(id: string): Location | undefined {
  return LOCATION_REGISTRY.find((loc) => loc.id === id);
}

/**
 * Получить локации по tier
 */
export function getLocationsByTier(tier: 1 | 2 | 3 | 4): Location[] {
  return LOCATION_REGISTRY.filter((loc) => loc.tier === tier);
}

/**
 * Получить доступные локации для уровня гильдии
 */
export function getAvailableLocations(guildLevel: number): Location[] {
  return LOCATION_REGISTRY.filter((loc) => {
    if (guildLevel >= 9) return true;
    if (guildLevel >= 6) return loc.tier <= 3;
    if (guildLevel >= 3) return loc.tier <= 2;
    return loc.tier === 1;
  });
}

/**
 * Получить локации по типу
 */
export function getLocationsByType(type: string): Location[] {
  return LOCATION_REGISTRY.filter((loc) => loc.type === type);
}

/**
 * Получить локации по тегу
 */
export function getLocationsByTag(tag: string): Location[] {
  return LOCATION_REGISTRY.filter((loc) => loc.tags.includes(tag));
}

/**
 * Проверить разблокировку локации
 */
export function isLocationAvailable(
  locationId: string,
  guildLevel: number,
  completedLocations: string[] = [],
  completedQuests: string[] = [],
  ownedItems: string[] = []
): boolean {
  const location = getLocationById(locationId);
  if (!location) return false;

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
