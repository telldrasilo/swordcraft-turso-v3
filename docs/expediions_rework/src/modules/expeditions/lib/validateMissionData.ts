/**
 * УТИЛИТА ВАЛИДАЦИИ МИССИЙ
 *
 * Проверяет все миссии на соответствие шаблону MissionTemplate.
 * Используется в тестах для автоматической проверки всех локаций.
 */

import type {
  MissionTemplate,
  MissionType,
  MissionRarity,
  MissionDifficulty,
  ScalableValue,
  MissionEnemies,
  MissionResourceTarget,
  MissionClient,
} from '../data/missions/_mission-template';
import type { Location, Material } from '../types';

// ============================================================================
// ТИПЫ ОШИБОК
// ============================================================================

export interface MissionValidationError {
  missionId: string;
  locationId: string;
  field: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface MissionValidationResult {
  valid: boolean;
  errors: MissionValidationError[];
  warnings: MissionValidationError[];
  stats: {
    totalMissions: number;
    validMissions: number;
    invalidMissions: number;
    warningsCount: number;
  };
}

// ============================================================================
// КОНСТАНТЫ
// ============================================================================

const VALID_MISSION_TYPES: MissionType[] = [
  'hunt', 'scout', 'clear', 'gather', 'rescue', 'delivery', 'escort', 'investigate'
];

const VALID_RARITIES: MissionRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

const VALID_DIFFICULTIES: MissionDifficulty[] = ['easy', 'normal', 'hard', 'extreme'];

const VALID_CLIENT_TYPES = [
  'farmer', 'merchant', 'noble', 'guild', 'military', 'scholar', 'commoner'
];

// ============================================================================
// ВАЛИДАТОРЫ
// ============================================================================

/**
 * Валидация ScalableValue
 */
function validateScalableValue(
  value: ScalableValue,
  fieldName: string,
  missionId: string
): MissionValidationError[] {
  const errors: MissionValidationError[] = [];

  if (typeof value.base !== 'number' || value.base < 0) {
    errors.push({
      missionId,
      locationId: '',
      field: fieldName,
      message: `base must be a non-negative number, got ${value.base}`,
      severity: 'critical',
    });
  }

  if (typeof value.variance !== 'number' || value.variance < 0 || value.variance > 1) {
    errors.push({
      missionId,
      locationId: '',
      field: fieldName,
      message: `variance must be between 0 and 1, got ${value.variance}`,
      severity: 'warning',
    });
  }

  return errors;
}

/**
 * Валидация MissionClient
 */
function validateClient(
  client: MissionClient,
  missionId: string
): MissionValidationError[] {
  const errors: MissionValidationError[] = [];

  if (!client.name || client.name.trim() === '') {
    errors.push({
      missionId,
      locationId: '',
      field: 'client.name',
      message: 'Client name is required',
      severity: 'critical',
    });
  }

  if (!VALID_CLIENT_TYPES.includes(client.type)) {
    errors.push({
      missionId,
      locationId: '',
      field: 'client.type',
      message: `Invalid client type "${client.type}", must be one of: ${VALID_CLIENT_TYPES.join(', ')}`,
      severity: 'critical',
    });
  }

  return errors;
}

/**
 * Валидация MissionEnemies
 */
function validateEnemies(
  enemies: MissionEnemies | undefined,
  location: Location | undefined,
  missionId: string,
  missionType: MissionType
): MissionValidationError[] {
  const errors: MissionValidationError[] = [];

  // Для боевых миссий враги обязательны
  const combatMissions: MissionType[] = ['hunt', 'clear'];

  if (!enemies || !enemies.types || enemies.types.length === 0) {
    if (combatMissions.includes(missionType)) {
      errors.push({
        missionId,
        locationId: location?.id ?? '',
        field: 'enemies',
        message: `Mission type "${missionType}" requires enemies`,
        severity: 'critical',
      });
    }
    return errors;
  }

  // Проверяем что враги существуют в локации
  if (location) {
    const locationEnemyIds = location.npcs.hostile.map(n => n.id);
    for (const enemyType of enemies.types) {
      if (!locationEnemyIds.includes(enemyType)) {
        errors.push({
          missionId,
          locationId: location.id,
          field: 'enemies.types',
          message: `Enemy "${enemyType}" not found in location NPCs. Available: ${locationEnemyIds.join(', ')}`,
          severity: 'critical',
        });
      }
    }
  }

  // Проверяем count
  if (enemies.count) {
    errors.push(...validateScalableValue(enemies.count, 'enemies.count', missionId));
  }

  return errors;
}

/**
 * Валидация MissionResourceTarget[]
 */
function validateResources(
  resources: MissionResourceTarget[] | undefined,
  materials: Material[],
  location: Location | undefined,
  missionId: string,
  missionType: MissionType
): MissionValidationError[] {
  const errors: MissionValidationError[] = [];

  // Для gather миссий ресурсы обязательны
  if (missionType === 'gather') {
    if (!resources || resources.length === 0) {
      errors.push({
        missionId,
        locationId: location?.id ?? '',
        field: 'resources',
        message: `Mission type "gather" requires resources field`,
        severity: 'critical',
      });
      return errors;
    }
  }

  if (!resources || resources.length === 0) {
    return errors;
  }

  for (const resource of resources) {
    // Проверяем что материал существует
    const material = materials.find(m => m.id === resource.materialId);
    if (!material) {
      errors.push({
        missionId,
        locationId: location?.id ?? '',
        field: 'resources.materialId',
        message: `Material "${resource.materialId}" not found in MATERIAL_REGISTRY`,
        severity: 'critical',
      });
    }

    // Проверяем что материал есть в локации
    if (location) {
      const locationMaterialIds = location.resources.map(r => r.materialId);
      if (!locationMaterialIds.includes(resource.materialId)) {
        errors.push({
          missionId,
          locationId: location.id,
          field: 'resources.materialId',
          message: `Material "${resource.materialId}" not found in location resources`,
          severity: 'warning',
        });
      }
    }

    // Проверяем quantity
    if (resource.quantity) {
      errors.push(...validateScalableValue(resource.quantity, `resources[${resource.materialId}].quantity`, missionId));
    }
  }

  return errors;
}

/**
 * Валидация одной миссии
 */
export function validateMission(
  mission: MissionTemplate,
  location: Location | undefined,
  materials: Material[]
): MissionValidationError[] {
  const errors: MissionValidationError[] = [];

  // === Обязательные поля ===

  // ID
  if (!mission.id || mission.id.trim() === '') {
    errors.push({
      missionId: 'unknown',
      locationId: mission.locationId,
      field: 'id',
      message: 'Mission ID is required',
      severity: 'critical',
    });
  }

  // Location ID
  if (!mission.locationId || mission.locationId.trim() === '') {
    errors.push({
      missionId: mission.id,
      locationId: '',
      field: 'locationId',
      message: 'Location ID is required',
      severity: 'critical',
    });
  }

  // Location ID должен совпадать
  if (location && mission.locationId !== location.id) {
    errors.push({
      missionId: mission.id,
      locationId: mission.locationId,
      field: 'locationId',
      message: `Mission locationId "${mission.locationId}" does not match location "${location.id}"`,
      severity: 'critical',
    });
  }

  // Type
  if (!VALID_MISSION_TYPES.includes(mission.type)) {
    errors.push({
      missionId: mission.id,
      locationId: mission.locationId,
      field: 'type',
      message: `Invalid mission type "${mission.type}"`,
      severity: 'critical',
    });
  }

  // Rarity
  if (!VALID_RARITIES.includes(mission.rarity)) {
    errors.push({
      missionId: mission.id,
      locationId: mission.locationId,
      field: 'rarity',
      message: `Invalid rarity "${mission.rarity}", must be one of: ${VALID_RARITIES.join(', ')}`,
      severity: 'critical',
    });
  }

  // Difficulty
  if (!VALID_DIFFICULTIES.includes(mission.difficulty)) {
    errors.push({
      missionId: mission.id,
      locationId: mission.locationId,
      field: 'difficulty',
      message: `Invalid difficulty "${mission.difficulty}", must be one of: ${VALID_DIFFICULTIES.join(', ')}`,
      severity: 'critical',
    });
  }

  // Name
  if (!mission.name || mission.name.trim() === '') {
    errors.push({
      missionId: mission.id,
      locationId: mission.locationId,
      field: 'name',
      message: 'Mission name is required',
      severity: 'critical',
    });
  }

  // Description
  if (!mission.description || mission.description.trim() === '') {
    errors.push({
      missionId: mission.id,
      locationId: mission.locationId,
      field: 'description',
      message: 'Mission description is required',
      severity: 'critical',
    });
  }

  // Objective
  if (!mission.objective || mission.objective.trim() === '') {
    errors.push({
      missionId: mission.id,
      locationId: mission.locationId,
      field: 'objective',
      message: 'Mission objective is required',
      severity: 'critical',
    });
  }

  // Client
  errors.push(...validateClient(mission.client, mission.id));

  // Duration
  errors.push(...validateScalableValue(mission.duration, 'duration', mission.id));

  // Cost
  if (!mission.cost) {
    errors.push({
      missionId: mission.id,
      locationId: mission.locationId,
      field: 'cost',
      message: 'Mission cost is required',
      severity: 'critical',
    });
  } else {
    errors.push(...validateScalableValue(mission.cost.supplies, 'cost.supplies', mission.id));
    errors.push(...validateScalableValue(mission.cost.deposit, 'cost.deposit', mission.id));
  }

  // Reward
  if (!mission.reward) {
    errors.push({
      missionId: mission.id,
      locationId: mission.locationId,
      field: 'reward',
      message: 'Mission reward is required',
      severity: 'critical',
    });
  } else {
    errors.push(...validateScalableValue(mission.reward.gold, 'reward.gold', mission.id));
    errors.push(...validateScalableValue(mission.reward.glory, 'reward.glory', mission.id));
    errors.push(...validateScalableValue(mission.reward.experience, 'reward.experience', mission.id));
    errors.push(...validateScalableValue(mission.reward.warSoul, 'reward.warSoul', mission.id));
  }

  // isRepeatable
  if (typeof mission.isRepeatable !== 'boolean') {
    errors.push({
      missionId: mission.id,
      locationId: mission.locationId,
      field: 'isRepeatable',
      message: 'isRepeatable must be a boolean',
      severity: 'critical',
    });
  }

  // cooldownHours
  if (mission.isRepeatable && (!mission.cooldownHours || mission.cooldownHours <= 0)) {
    errors.push({
      missionId: mission.id,
      locationId: mission.locationId,
      field: 'cooldownHours',
      message: 'Repeatable missions must have a positive cooldown',
      severity: 'critical',
    });
  }

  // === Опциональные поля ===

  // Enemies
  errors.push(...validateEnemies(mission.enemies, location, mission.id, mission.type));

  // Resources
  errors.push(...validateResources(mission.resources, materials, location, mission.id, mission.type));

  return errors;
}

/**
 * Валидация всех миссий локации
 */
export function validateLocationMissions(
  missions: MissionTemplate[],
  location: Location,
  materials: Material[]
): MissionValidationResult {
  const allErrors: MissionValidationError[] = [];

  for (const mission of missions) {
    const errors = validateMission(mission, location, materials);
    allErrors.push(...errors);
  }

  // Проверка на дубликаты ID
  const ids = missions.map(m => m.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  for (const dupId of [...new Set(duplicates)]) {
    allErrors.push({
      missionId: dupId,
      locationId: location.id,
      field: 'id',
      message: `Duplicate mission ID "${dupId}"`,
      severity: 'critical',
    });
  }

  const criticalErrors = allErrors.filter(e => e.severity === 'critical');
  const warnings = allErrors.filter(e => e.severity === 'warning');

  return {
    valid: criticalErrors.length === 0,
    errors: criticalErrors,
    warnings,
    stats: {
      totalMissions: missions.length,
      validMissions: missions.length - new Set(criticalErrors.map(e => e.missionId)).size,
      invalidMissions: new Set(criticalErrors.map(e => e.missionId)).size,
      warningsCount: warnings.length,
    },
  };
}

/**
 * Валидация всех миссий всех локаций
 */
export function validateAllMissions(
  missionsByLocation: Map<string, MissionTemplate[]>,
  locations: Location[],
  materials: Material[]
): MissionValidationResult & { byLocation: Map<string, MissionValidationResult> } {
  const allErrors: MissionValidationError[] = [];
  const allWarnings: MissionValidationError[] = [];
  const byLocation = new Map<string, MissionValidationResult>();

  let totalMissions = 0;
  let validMissions = 0;

  for (const location of locations) {
    const missions = missionsByLocation.get(location.id) || [];
    const result = validateLocationMissions(missions, location, materials);
    byLocation.set(location.id, result);

    totalMissions += missions.length;
    if (result.valid) {
      validMissions += missions.length;
    } else {
      validMissions += result.stats.validMissions;
    }

    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  }

  // Глобальная проверка на дубликаты ID
  const allIds: string[] = [];
  for (const missions of missionsByLocation.values()) {
    allIds.push(...missions.map(m => m.id));
  }
  const duplicates = allIds.filter((id, index) => allIds.indexOf(id) !== index);
  for (const dupId of [...new Set(duplicates)]) {
    allErrors.push({
      missionId: dupId,
      locationId: '',
      field: 'id',
      message: `Duplicate mission ID "${dupId}" across locations`,
      severity: 'critical',
    });
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    stats: {
      totalMissions,
      validMissions,
      invalidMissions: totalMissions - validMissions,
      warningsCount: allWarnings.length,
    },
    byLocation,
  };
}
