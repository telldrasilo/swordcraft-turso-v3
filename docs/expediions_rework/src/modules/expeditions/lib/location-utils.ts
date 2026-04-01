/**
 * УТИЛИТЫ ДЛЯ УПРАВЛЕНИЯ ЛОКАЦИЯМИ
 *
 * Функции для добавления, редактирования и валидации локаций.
 * Позволяет легко расширять контент игры.
 */

import type {
  Location,
  LocationResource,
  LocationTier,
  Rarity,
  WeatherCondition,
  LocationNPC,
} from '../types';
import type { Material } from '../types/resource.types';
import { recalculateRarityDistribution, validateLocationMaterials } from './material-utils';

// ============================================================================
// ДОБАВЛЕНИЕ ЛОКАЦИЙ
// ============================================================================

/**
 * Добавить локацию в реестр
 *
 * @example
 * const newLocation = createLocation({
 *   id: 'ancient_forest',
 *   name: 'Древний лес',
 *   tier: 3,
 *   // ...
 * });
 * const updatedRegistry = addLocationToRegistry(LOCATION_REGISTRY, newLocation);
 */
export function addLocationToRegistry(
  registry: Location[],
  location: Location
): Location[] {
  if (registry.some(l => l.id === location.id)) {
    console.warn(`Location "${location.id}" already exists in registry`);
    return registry;
  }

  return [...registry, location];
}

/**
 * Массовое добавление локаций
 */
export function addLocationsToRegistry(
  registry: Location[],
  locations: Location[]
): Location[] {
  return locations.reduce(
    (acc, location) => addLocationToRegistry(acc, location),
    registry
  );
}

// ============================================================================
// ОБНОВЛЕНИЕ ЛОКАЦИЙ
// ============================================================================

/**
 * Обновить локацию в реестре (иммутабельно)
 *
 * @example
 * const updatedRegistry = updateLocationInRegistry(
 *   LOCATION_REGISTRY,
 *   'oak_grove_outskirts',
 *   {
 *     name: 'Окраины Великой Рощи',
 *     tier: 2,
 *   }
 * );
 */
export function updateLocationInRegistry(
  registry: Location[],
  locationId: string,
  updates: Partial<Location>
): Location[] {
  return registry.map(location =>
    location.id === locationId
      ? { ...location, ...updates }
      : location
  );
}

/**
 * Обновить ресурсы локации
 */
export function updateLocationResources(
  registry: Location[],
  locationId: string,
  resources: LocationResource[]
): Location[] {
  return registry.map(location => {
    if (location.id !== locationId) return location;

    return {
      ...location,
      resources,
      rarityDistribution: recalculateRarityDistribution(resources),
    };
  });
}

/**
 * Добавить ресурс в локацию
 */
export function addResourceToLocationInRegistry(
  registry: Location[],
  locationId: string,
  resource: LocationResource
): Location[] {
  return registry.map(location => {
    if (location.id !== locationId) return location;

    if (location.resources.some(r => r.materialId === resource.materialId)) {
      console.warn(`Resource "${resource.materialId}" already in location "${locationId}"`);
      return location;
    }

    const newResources = [...location.resources, resource];

    return {
      ...location,
      resources: newResources,
      rarityDistribution: recalculateRarityDistribution(newResources),
    };
  });
}

/**
 * Обновить погодные условия локации
 */
export function updateLocationWeather(
  registry: Location[],
  locationId: string,
  weather: WeatherCondition[]
): Location[] {
  return registry.map(location =>
    location.id === locationId
      ? { ...location, weather }
      : location
  );
}

/**
 * Добавить погодное условие в локацию
 */
export function addWeatherToLocation(
  registry: Location[],
  locationId: string,
  weather: WeatherCondition
): Location[] {
  return registry.map(location => {
    if (location.id !== locationId) return location;

    if (location.weather.some(w => w.id === weather.id)) {
      console.warn(`Weather "${weather.id}" already in location "${locationId}"`);
      return location;
    }

    return {
      ...location,
      weather: [...location.weather, weather],
    };
  });
}

/**
 * Обновить NPC локации
 */
export function updateLocationNPCs(
  registry: Location[],
  locationId: string,
  npcs: {
    hostile?: LocationNPC[];
    neutral?: LocationNPC[];
    friendly?: LocationNPC[];
  }
): Location[] {
  return registry.map(location =>
    location.id === locationId
      ? {
          ...location,
          npcs: {
            ...location.npcs,
            ...npcs,
          },
        }
      : location
  );
}

/**
 * Добавить NPC в локацию
 */
export function addNPCToLocation(
  registry: Location[],
  locationId: string,
  npc: LocationNPC,
  disposition: 'hostile' | 'neutral' | 'friendly'
): Location[] {
  return registry.map(location => {
    if (location.id !== locationId) return location;

    const npcList = location.npcs[disposition];
    if (npcList.some(n => n.id === npc.id)) {
      console.warn(`NPC "${npc.id}" already in location "${locationId}" (${disposition})`);
      return location;
    }

    return {
      ...location,
      npcs: {
        ...location.npcs,
        [disposition]: [...npcList, npc],
      },
    };
  });
}

/**
 * Обновить требования разблокировки локации
 */
export function updateLocationUnlockRequirements(
  registry: Location[],
  locationId: string,
  requirements: Partial<Location['unlockRequirements']>
): Location[] {
  return registry.map(location =>
    location.id === locationId
      ? {
          ...location,
          unlockRequirements: {
            ...location.unlockRequirements,
            ...requirements,
          },
        }
      : location
  );
}

// ============================================================================
// УДАЛЕНИЕ
// ============================================================================

/**
 * Удалить локацию из реестра
 */
export function removeLocationFromRegistry(
  registry: Location[],
  locationId: string
): Location[] {
  return registry.filter(l => l.id !== locationId);
}

/**
 * Удалить ресурс из локации
 */
export function removeResourceFromLocationInRegistry(
  registry: Location[],
  locationId: string,
  materialId: string
): Location[] {
  return registry.map(location => {
    if (location.id !== locationId) return location;

    const newResources = location.resources.filter(r => r.materialId !== materialId);

    return {
      ...location,
      resources: newResources,
      rarityDistribution: recalculateRarityDistribution(newResources),
    };
  });
}

// ============================================================================
// ФИЛЬТРАЦИЯ И ПОИСК
// ============================================================================

/**
 * Получить локации по tier
 */
export function getLocationsByTierFromRegistry(
  registry: Location[],
  tier: LocationTier
): Location[] {
  return registry.filter(l => l.tier === tier);
}

/**
 * Получить локации по типу
 */
export function getLocationsByTypeFromRegistry(
  registry: Location[],
  type: string
): Location[] {
  return registry.filter(l => l.type === type);
}

/**
 * Получить локации по тегу
 */
export function getLocationsByTagFromRegistry(
  registry: Location[],
  tag: string
): Location[] {
  return registry.filter(l => l.tags.includes(tag));
}

/**
 * Получить доступные локации для уровня гильдии
 */
export function getAvailableLocationsForGuildLevel(
  registry: Location[],
  guildLevel: number,
  completedLocations: string[] = [],
  completedQuests: string[] = [],
  ownedItems: string[] = []
): Location[] {
  return registry.filter(location => {
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
  });
}

/**
 * Получить локации, где встречается материал
 */
export function getLocationsWithMaterialFromRegistry(
  registry: Location[],
  materialId: string
): Location[] {
  return registry.filter(l =>
    l.resources.some(r => r.materialId === materialId)
  );
}

/**
 * Получить локации с определённой погодой
 */
export function getLocationsWithWeather(
  registry: Location[],
  weatherId: string
): Location[] {
  return registry.filter(l =>
    l.weather.some(w => w.id === weatherId)
  );
}

/**
 * Получить локации с определённым NPC
 */
export function getLocationsWithNPC(
  registry: Location[],
  npcId: string
): Location[] {
  return registry.filter(l =>
    l.npcs.hostile.some(n => n.id === npcId) ||
    l.npcs.neutral.some(n => n.id === npcId) ||
    l.npcs.friendly.some(n => n.id === npcId)
  );
}

// ============================================================================
// ВАЛИДАЦИЯ
// ============================================================================

export interface LocationValidationError {
  locationId: string;
  field: string;
  message: string;
}

/**
 * Валидация локации
 */
export function validateLocation(
  location: Location,
  materials: Material[]
): LocationValidationError[] {
  const errors: LocationValidationError[] = [];

  // Проверка ID
  if (!location.id || location.id.trim() === '') {
    errors.push({
      locationId: 'unknown',
      field: 'id',
      message: 'Location ID is required',
    });
  }

  // Проверка названия
  if (!location.name || location.name.trim() === '') {
    errors.push({
      locationId: location.id,
      field: 'name',
      message: 'Location name is required',
    });
  }

  // Проверка tier
  if (![1, 2, 3, 4].includes(location.tier)) {
    errors.push({
      locationId: location.id,
      field: 'tier',
      message: `Invalid tier "${location.tier}", must be 1, 2, 3, or 4`,
    });
  }

  // Проверка ресурсов
  if (location.resources.length === 0) {
    errors.push({
      locationId: location.id,
      field: 'resources',
      message: 'Location must have at least one resource',
    });
  }

  // Валидация материалов
  const materialErrors = validateLocationMaterials(location, materials);
  for (const err of materialErrors.errors) {
    errors.push({
      locationId: location.id,
      field: 'resources',
      message: err,
    });
  }

  // Проверка погоды
  const totalWeatherChance = location.weather.reduce((sum, w) => sum + w.chance, 0);
  if (Math.abs(totalWeatherChance - 100) > 1) {
    errors.push({
      locationId: location.id,
      field: 'weather',
      message: `Weather chances sum to ${totalWeatherChance}%, should be 100%`,
    });
  }

  // Проверка NPC
  if (location.npcs.hostile.length === 0) {
    errors.push({
      locationId: location.id,
      field: 'npcs.hostile',
      message: 'Location should have at least one hostile NPC for combat missions',
    });
  }

  // Проверка требований разблокировки
  const req = location.unlockRequirements;
  if (req.guildLevel < 1 || req.guildLevel > 10) {
    errors.push({
      locationId: location.id,
      field: 'unlockRequirements.guildLevel',
      message: `Invalid guild level requirement "${req.guildLevel}", should be 1-10`,
    });
  }

  // Проверка соответствия tier и guildLevel
  const expectedGuildLevel = { 1: 1, 2: 3, 3: 6, 4: 9 }[location.tier];
  if (req.guildLevel < expectedGuildLevel) {
    errors.push({
      locationId: location.id,
      field: 'unlockRequirements.guildLevel',
      message: `Tier ${location.tier} location should require at least guild level ${expectedGuildLevel}`,
    });
  }

  return errors;
}

/**
 * Валидация всех локаций
 */
export function validateAllLocationsInRegistry(
  registry: Location[],
  materials: Material[]
): LocationValidationError[] {
  const allErrors: LocationValidationError[] = [];

  for (const location of registry) {
    const errors = validateLocation(location, materials);
    allErrors.push(...errors);
  }

  // Проверка на дубликаты ID
  const ids = registry.map(l => l.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  for (const dupId of [...new Set(duplicates)]) {
    allErrors.push({
      locationId: dupId,
      field: 'id',
      message: `Duplicate location ID "${dupId}"`,
    });
  }

  return allErrors;
}

// ============================================================================
// ФАБРИКИ ЛОКАЦИЙ
// ============================================================================

/**
 * Создать базовую локацию
 */
export function createLocation(
  overrides: Partial<Location> & {
    id: string;
    name: string;
    description: string;
    tier: LocationTier;
    type: string;
  }
): Location {
  const tierGuildLevel = { 1: 1, 2: 3, 3: 6, 4: 9 }[overrides.tier] ?? 1;

  return {
    tags: [],
    resources: [],
    rarityDistribution: { common: 100, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
    weather: [
      { id: 'clear', name: 'Ясно', chance: 100, effects: [] },
    ],
    npcs: {
      hostile: [],
      neutral: [],
      friendly: [],
    },
    unlockRequirements: {
      guildLevel: tierGuildLevel,
    },

    ...overrides,
  };
}

/**
 * Создать лесную локацию
 */
export function createForestLocation(
  overrides: Partial<Location> & {
    id: string;
    name: string;
    description: string;
    tier: LocationTier;
  }
): Location {
  return createLocation({
    type: 'forest',
    tags: ['forest', 'woodland'],
    weather: [
      { id: 'clear', name: 'Ясно', chance: 25, effects: [] },
      { id: 'cloudy', name: 'Пасмурно', chance: 35, effects: [] },
      { id: 'light_rain', name: 'Лёгкий дождь', chance: 20, effects: [] },
      { id: 'fog', name: 'Туман', chance: 15, effects: [] },
      { id: 'storm', name: 'Гроза', chance: 5, effects: [] },
    ],
    ...overrides,
  });
}

/**
 * Создать шахту/подземную локацию
 */
export function createMineLocation(
  overrides: Partial<Location> & {
    id: string;
    name: string;
    description: string;
    tier: LocationTier;
  }
): Location {
  return createLocation({
    type: 'mine',
    tags: ['mine', 'underground'],
    weather: [
      { id: 'dry', name: 'Сухой воздух', chance: 40, effects: [] },
      { id: 'humid', name: 'Влажность', chance: 30, effects: [] },
      { id: 'gas', name: 'Газовые карманы', chance: 15, effects: [] },
      { id: 'dust', name: 'Пыль', chance: 10, effects: [] },
      { id: 'collapse', name: 'Обвальная угроза', chance: 5, effects: [] },
    ],
    ...overrides,
  });
}

/**
 * Создать болотную локацию
 */
export function createSwampLocation(
  overrides: Partial<Location> & {
    id: string;
    name: string;
    description: string;
    tier: LocationTier;
  }
): Location {
  return createLocation({
    type: 'swamp',
    tags: ['swamp', 'wetlands', 'fog'],
    weather: [
      { id: 'fog', name: 'Густой туман', chance: 50, effects: [] },
      { id: 'light_fog', name: 'Лёгкий туман', chance: 25, effects: [] },
      { id: 'rain', name: 'Дождь', chance: 15, effects: [] },
      { id: 'clear', name: 'Ясно', chance: 5, effects: [] },
      { id: 'storm', name: 'Гроза', chance: 5, effects: [] },
    ],
    ...overrides,
  });
}

// ============================================================================
// СТАТИСТИКА
// ============================================================================

/**
 * Получить статистику по локации
 */
export function getLocationStats(location: Location): {
  resourceCount: number;
  rarityDistribution: Record<Rarity, number>;
  weatherCount: number;
  hostileNPCCount: number;
  neutralNPCCount: number;
  friendlyNPCCount: number;
  totalNPCCount: number;
} {
  return {
    resourceCount: location.resources.length,
    rarityDistribution: location.rarityDistribution,
    weatherCount: location.weather.length,
    hostileNPCCount: location.npcs.hostile.length,
    neutralNPCCount: location.npcs.neutral.length,
    friendlyNPCCount: location.npcs.friendly.length,
    totalNPCCount:
      location.npcs.hostile.length +
      location.npcs.neutral.length +
      location.npcs.friendly.length,
  };
}

/**
 * Получить общую статистику по всем локациям
 */
export function getRegistryStats(registry: Location[]): {
  totalLocations: number;
  tierDistribution: Record<LocationTier, number>;
  typeDistribution: Record<string, number>;
  totalResources: number;
  totalNPCs: number;
} {
  const tierDistribution: Record<LocationTier, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const typeDistribution: Record<string, number> = {};

  for (const location of registry) {
    tierDistribution[location.tier]++;
    typeDistribution[location.type] = (typeDistribution[location.type] ?? 0) + 1;
  }

  return {
    totalLocations: registry.length,
    tierDistribution,
    typeDistribution,
    totalResources: registry.reduce((sum, l) => sum + l.resources.length, 0),
    totalNPCs: registry.reduce(
      (sum, l) =>
        sum + l.npcs.hostile.length + l.npcs.neutral.length + l.npcs.friendly.length,
      0
    ),
  };
}

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export type { LocationValidationError };
