/**
 * УТИЛИТЫ ДЛЯ УПРАВЛЕНИЯ МИССИЯМИ
 *
 * Функции для добавления, редактирования и валидации миссий.
 * Позволяет легко расширять контент игры.
 */

import type { MissionTemplate, ScalableValue, MissionType, MissionDifficulty, MissionRarity } from '../data/missions/_mission-template';
import type { Location } from '../types';

// ============================================================================
// ДОБАВЛЕНИЕ МИССИЙ
// ============================================================================

/**
 * Добавить миссию в реестр
 *
 * @example
 * const newMission = createMission({
 *   id: 'oak_grove_hunt_deer_1',
 *   locationId: 'oak_grove_outskirts',
 *   type: 'hunt',
 *   // ...
 * });
 * const updatedRegistry = addMissionToRegistry(MISSION_REGISTRY, newMission);
 */
export function addMissionToRegistry(
  registry: MissionTemplate[],
  mission: MissionTemplate
): MissionTemplate[] {
  if (registry.some(m => m.id === mission.id)) {
    console.warn(`Mission "${mission.id}" already exists in registry`);
    return registry;
  }

  return [...registry, mission];
}

/**
 * Массовое добавление миссий
 */
export function addMissionsToRegistry(
  registry: MissionTemplate[],
  missions: MissionTemplate[]
): MissionTemplate[] {
  return missions.reduce(
    (acc, mission) => addMissionToRegistry(acc, mission),
    registry
  );
}

// ============================================================================
// ОБНОВЛЕНИЕ МИССИЙ
// ============================================================================

/**
 * Обновить миссию в реестре (иммутабельно)
 *
 * @example
 * const updatedRegistry = updateMissionInRegistry(
 *   MISSION_REGISTRY,
 *   'oak_grove_hunt_boars_1',
 *   {
 *     reward: {
 *       gold: { base: 60, variance: 0.2, perDifficulty: 30, perRarity: 15 },
 *       // ... остальные поля награды
 *     }
 *   }
 * );
 */
export function updateMissionInRegistry(
  registry: MissionTemplate[],
  missionId: string,
  updates: Partial<MissionTemplate>
): MissionTemplate[] {
  return registry.map(mission =>
    mission.id === missionId
      ? { ...mission, ...updates }
      : mission
  );
}

/**
 * Обновить награду миссии
 */
export function updateMissionReward(
  registry: MissionTemplate[],
  missionId: string,
  rewardUpdates: Partial<MissionTemplate['reward']>
): MissionTemplate[] {
  return registry.map(mission =>
    mission.id === missionId
      ? {
          ...mission,
          reward: { ...mission.reward, ...rewardUpdates }
        }
      : mission
  );
}

/**
 * Обновить стоимость миссии
 */
export function updateMissionCost(
  registry: MissionTemplate[],
  missionId: string,
  costUpdates: Partial<MissionTemplate['cost']>
): MissionTemplate[] {
  return registry.map(mission =>
    mission.id === missionId
      ? {
          ...mission,
          cost: { ...mission.cost, ...costUpdates }
        }
      : mission
  );
}

/**
 * Обновить длительность миссии
 */
export function updateMissionDuration(
  registry: MissionTemplate[],
  missionId: string,
  durationUpdates: Partial<ScalableValue>
): MissionTemplate[] {
  return registry.map(mission =>
    mission.id === missionId
      ? {
          ...mission,
          duration: { ...mission.duration, ...durationUpdates }
        }
      : mission
  );
}

/**
 * Обновить врагов миссии
 */
export function updateMissionEnemies(
  registry: MissionTemplate[],
  missionId: string,
  enemyUpdates: Partial<NonNullable<MissionTemplate['enemies']>>
): MissionTemplate[] {
  return registry.map(mission =>
    mission.id === missionId && mission.enemies
      ? {
          ...mission,
          enemies: { ...mission.enemies, ...enemyUpdates }
        }
      : mission
  );
}

// ============================================================================
// УДАЛЕНИЕ МИССИЙ
// ============================================================================

/**
 * Удалить миссию из реестра
 */
export function removeMissionFromRegistry(
  registry: MissionTemplate[],
  missionId: string
): MissionTemplate[] {
  return registry.filter(m => m.id !== missionId);
}

// ============================================================================
// ФИЛЬТРАЦИЯ И ПОИСК
// ============================================================================

/**
 * Получить миссии для локации
 */
export function getMissionsForLocation(
  registry: MissionTemplate[],
  locationId: string
): MissionTemplate[] {
  return registry.filter(m => m.locationId === locationId);
}

/**
 * Получить миссии по типу
 */
export function getMissionsByType(
  registry: MissionTemplate[],
  type: MissionType
): MissionTemplate[] {
  return registry.filter(m => m.type === type);
}

/**
 * Получить миссии по сложности
 */
export function getMissionsByDifficulty(
  registry: MissionTemplate[],
  difficulty: MissionDifficulty
): MissionTemplate[] {
  return registry.filter(m => m.difficulty === difficulty);
}

/**
 * Получить миссии по редкости
 */
export function getMissionsByRarity(
  registry: MissionTemplate[],
  rarity: MissionRarity
): MissionTemplate[] {
  return registry.filter(m => m.rarity === rarity);
}

/**
 * Получить миссии по уровню гильдии
 */
export function getMissionsForGuildLevel(
  registry: MissionTemplate[],
  guildLevel: number
): MissionTemplate[] {
  return registry.filter(m => {
    const req = m.requirements?.minGuildLevel ?? 1;
    return guildLevel >= req;
  });
}

/**
 * Получить доступные миссии для контекста
 */
export function getAvailableMissions(
  registry: MissionTemplate[],
  context: {
    locationId?: string;
    guildLevel?: number;
    type?: MissionType;
    difficulty?: MissionDifficulty;
    rarity?: MissionRarity;
  }
): MissionTemplate[] {
  return registry.filter(m => {
    if (context.locationId && m.locationId !== context.locationId) return false;
    if (context.guildLevel && m.requirements?.minGuildLevel && context.guildLevel < m.requirements.minGuildLevel) return false;
    if (context.type && m.type !== context.type) return false;
    if (context.difficulty && m.difficulty !== context.difficulty) return false;
    if (context.rarity && m.rarity !== context.rarity) return false;
    return true;
  });
}

// ============================================================================
// ВАЛИДАЦИЯ
// ============================================================================

export interface MissionValidationError {
  missionId: string;
  field: string;
  message: string;
}

/**
 * Валидация миссии
 */
export function validateMission(
  mission: MissionTemplate,
  location?: Location
): MissionValidationError[] {
  const errors: MissionValidationError[] = [];

  // Проверка ID
  if (!mission.id || mission.id.trim() === '') {
    errors.push({
      missionId: 'unknown',
      field: 'id',
      message: 'Mission ID is required',
    });
  }

  // Проверка локации
  if (!mission.locationId) {
    errors.push({
      missionId: mission.id,
      field: 'locationId',
      message: 'Location ID is required',
    });
  }

  // Проверка соответствия локации
  if (location && mission.locationId !== location.id) {
    errors.push({
      missionId: mission.id,
      field: 'locationId',
      message: `Mission locationId "${mission.locationId}" does not match provided location "${location.id}"`,
    });
  }

  // Проверка врагов
  if (mission.enemies && location) {
    for (const enemyType of mission.enemies.types) {
      const enemyExists = location.npcs.hostile.some(n => n.id === enemyType);
      if (!enemyExists) {
        errors.push({
          missionId: mission.id,
          field: 'enemies.types',
          message: `Enemy "${enemyType}" not found in location NPCs`,
        });
      }
    }
  }

  // Проверка наград
  if (mission.reward.gold.base < 0) {
    errors.push({
      missionId: mission.id,
      field: 'reward.gold',
      message: 'Gold reward base cannot be negative',
    });
  }

  // Проверка стоимости
  if (mission.cost.supplies.base < 0 || mission.cost.deposit.base < 0) {
    errors.push({
      missionId: mission.id,
      field: 'cost',
      message: 'Cost values cannot be negative',
    });
  }

  // Проверка длительности
  if (mission.duration.base <= 0) {
    errors.push({
      missionId: mission.id,
      field: 'duration',
      message: 'Duration must be positive',
    });
  }

  // Проверка кулдауна
  if (mission.isRepeatable && (!mission.cooldownHours || mission.cooldownHours <= 0)) {
    errors.push({
      missionId: mission.id,
      field: 'cooldownHours',
      message: 'Repeatable missions must have a positive cooldown',
    });
  }

  return errors;
}

/**
 * Валидация всех миссий
 */
export function validateAllMissions(
  registry: MissionTemplate[],
  locations: Location[]
): MissionValidationError[] {
  const allErrors: MissionValidationError[] = [];

  for (const mission of registry) {
    const location = locations.find(l => l.id === mission.locationId);
    const errors = validateMission(mission, location);
    allErrors.push(...errors);
  }

  return allErrors;
}

// ============================================================================
// ФАБРИКИ МИССИЙ
// ============================================================================

/**
 * Создать базовую миссию охоты
 */
export function createHuntMission(
  overrides: Partial<MissionTemplate> & {
    id: string;
    locationId: string;
    name: string;
    description: string;
    objective: string;
    enemyTypes: string[];
  }
): MissionTemplate {
  return {
    type: 'hunt',
    rarity: 'common',
    difficulty: 'normal',

    client: {
      name: 'Неизвестный заказчик',
      type: 'commoner',
    },

    duration: {
      base: 3600,
      variance: 0.2,
      perDifficulty: 600,
      perRarity: 300,
    },

    cost: {
      supplies: { base: 15, variance: 0.1, perDifficulty: 8, perRarity: 4 },
      deposit: { base: 30, variance: 0.1, perDifficulty: 15, perRarity: 8 },
    },

    reward: {
      gold: { base: 80, variance: 0.2, perDifficulty: 40, perRarity: 20 },
      glory: { base: 3, variance: 0, perDifficulty: 2, perRarity: 1 },
      experience: { base: 35, variance: 0.1, perDifficulty: 18, perRarity: 9 },
      warSoul: { base: 10, variance: 0.2, perDifficulty: 5, perRarity: 3 },
    },

    enemies: {
      types: overrides.enemyTypes,
      count: { base: 4, variance: 0.25, perDifficulty: 2, perRarity: 0 },
      levelBonus: 0,
    },

    isRepeatable: true,
    cooldownHours: 6,

    ...overrides,
  };
}

/**
 * Создать базовую миссию сбора
 */
export function createGatherMission(
  overrides: Partial<MissionTemplate> & {
    id: string;
    locationId: string;
    name: string;
    description: string;
    objective: string;
  }
): MissionTemplate {
  return {
    type: 'gather',
    rarity: 'common',
    difficulty: 'easy',

    client: {
      name: 'Местный житель',
      type: 'commoner',
    },

    duration: {
      base: 2400,
      variance: 0.2,
      perDifficulty: 600,
      perRarity: 300,
    },

    cost: {
      supplies: { base: 10, variance: 0.1, perDifficulty: 5, perRarity: 3 },
      deposit: { base: 20, variance: 0.1, perDifficulty: 10, perRarity: 5 },
    },

    reward: {
      gold: { base: 50, variance: 0.2, perDifficulty: 25, perRarity: 12 },
      glory: { base: 1, variance: 0, perDifficulty: 1, perRarity: 1 },
      experience: { base: 20, variance: 0.1, perDifficulty: 10, perRarity: 5 },
      warSoul: { base: 3, variance: 0.2, perDifficulty: 2, perRarity: 1 },
    },

    isRepeatable: true,
    cooldownHours: 4,

    ...overrides,
  };
}

/**
 * Создать базовую миссию разведки
 */
export function createScoutMission(
  overrides: Partial<MissionTemplate> & {
    id: string;
    locationId: string;
    name: string;
    description: string;
    objective: string;
  }
): MissionTemplate {
  return {
    type: 'scout',
    rarity: 'common',
    difficulty: 'normal',

    client: {
      name: 'Представитель гильдии',
      type: 'guild',
    },

    duration: {
      base: 3600,
      variance: 0.2,
      perDifficulty: 600,
      perRarity: 300,
    },

    cost: {
      supplies: { base: 12, variance: 0.1, perDifficulty: 6, perRarity: 3 },
      deposit: { base: 25, variance: 0.1, perDifficulty: 12, perRarity: 6 },
    },

    reward: {
      gold: { base: 60, variance: 0.2, perDifficulty: 30, perRarity: 15 },
      glory: { base: 2, variance: 0, perDifficulty: 1, perRarity: 1 },
      experience: { base: 30, variance: 0.1, perDifficulty: 15, perRarity: 8 },
      warSoul: { base: 4, variance: 0.2, perDifficulty: 2, perRarity: 1 },
    },

    isRepeatable: true,
    cooldownHours: 6,

    ...overrides,
  };
}

// ============================================================================
// ЭКСПОРТ
// ============================================================================
