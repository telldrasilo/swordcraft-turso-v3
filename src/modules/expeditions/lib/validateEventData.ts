/**
 * УТИЛИТА ВАЛИДАЦИИ СОБЫТИЙ
 *
 * Проверяет все события на соответствие шаблону EventTemplate.
 * Используется в тестах для автоматической проверки.
 */

import type {
  EventTemplate,
  EventType,
  EventCategory,
  EventEffect,
  EventEffectType,
  EventChoice,
  EventConditions,
} from '../data/events/_event-template';
import type { Location, Material, Rarity } from '../types';

// ============================================================================
// ТИПЫ ОШИБОК
// ============================================================================

export interface EventValidationError {
  eventId: string;
  field: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface EventValidationResult {
  valid: boolean;
  errors: EventValidationError[];
  warnings: EventValidationError[];
  stats: {
    totalEvents: number;
    validEvents: number;
    invalidEvents: number;
    warningsCount: number;
    byType: Record<EventType, number>;
    byCategory: Record<EventCategory, number>;
  };
}

// ============================================================================
// КОНСТАНТЫ
// ============================================================================

const VALID_EVENT_TYPES: EventType[] = ['positive', 'negative', 'neutral', 'choice'];

const VALID_EVENT_CATEGORIES: EventCategory[] = [
  'combat', 'discovery', 'travel', 'social', 'environment', 'treasure', 'danger', 'rest'
];

const VALID_EFFECT_TYPES: EventEffectType[] = [
  'grant_resource',
  'grant_location_material',
  'damage_weapon',
  'damage_adventurer',
  'modify_success_chance',
  'modify_duration',
  'modify_gold_reward',
  'spawn_enemy',
  'narrative_only',
];

const VALID_RESOURCE_IDS = ['gold', 'experience', 'glory', 'warSoul'];

const VALID_RARITIES: Rarity[] = ['common', 'uncommon', 'rare', 'epic'];

// ============================================================================
// ВАЛИДАТОРЫ
// ============================================================================

/**
 * Валидация эффекта события
 */
function validateEffect(
  effect: EventEffect,
  eventId: string,
  effectIndex: number,
  locations: Location[],
  _materials: Material[]
): EventValidationError[] {
  const errors: EventValidationError[] = [];
  const field = `effects[${effectIndex}]`;

  // Проверяем тип эффекта
  if (!VALID_EFFECT_TYPES.includes(effect.type)) {
    errors.push({
      eventId,
      field: `${field}.type`,
      message: `Invalid effect type "${effect.type}", must be one of: ${VALID_EFFECT_TYPES.join(', ')}`,
      severity: 'critical',
    });
    return errors;
  }

  // Проверяем специфичные поля для каждого типа эффекта
  switch (effect.type) {
    case 'grant_resource':
      if (!effect.resourceId || !VALID_RESOURCE_IDS.includes(effect.resourceId)) {
        errors.push({
          eventId,
          field: `${field}.resourceId`,
          message: `grant_resource requires valid resourceId (${VALID_RESOURCE_IDS.join(', ')})`,
          severity: 'critical',
        });
      }
      if (!effect.quantity) {
        errors.push({
          eventId,
          field: `${field}.quantity`,
          message: 'grant_resource requires quantity field',
          severity: 'critical',
        });
      }
      break;

    case 'grant_location_material':
      if (effect.materialRarity && !VALID_RARITIES.includes(effect.materialRarity)) {
        errors.push({
          eventId,
          field: `${field}.materialRarity`,
          message: `Invalid materialRarity "${effect.materialRarity}", must be one of: ${VALID_RARITIES.join(', ')}`,
          severity: 'critical',
        });
      }
      if (!effect.materialQuantity) {
        errors.push({
          eventId,
          field: `${field}.materialQuantity`,
          message: 'grant_location_material requires materialQuantity field',
          severity: 'critical',
        });
      }
      break;

    case 'damage_weapon':
    case 'damage_adventurer':
      if (typeof effect.modifier !== 'number') {
        errors.push({
          eventId,
          field: `${field}.modifier`,
          message: `${effect.type} requires modifier (number)`,
          severity: 'critical',
        });
      } else if (effect.modifier < 0 || effect.modifier > 100) {
        errors.push({
          eventId,
          field: `${field}.modifier`,
          message: `${effect.type} modifier should be between 0 and 100 (percentage)`,
          severity: 'warning',
        });
      }
      break;

    case 'modify_success_chance':
    case 'modify_gold_reward':
      if (typeof effect.modifier !== 'number') {
        errors.push({
          eventId,
          field: `${field}.modifier`,
          message: `${effect.type} requires modifier (number)`,
          severity: 'critical',
        });
      }
      break;

    case 'modify_duration':
      if (typeof effect.modifier !== 'number') {
        errors.push({
          eventId,
          field: `${field}.modifier`,
          message: 'modify_duration requires modifier (seconds)',
          severity: 'critical',
        });
      }
      break;

    case 'spawn_enemy':
      if (!effect.enemyType) {
        errors.push({
          eventId,
          field: `${field}.enemyType`,
          message: 'spawn_enemy requires enemyType',
          severity: 'critical',
        });
      } else if (effect.enemyType !== 'random_from_location') {
        // Проверяем что враг существует в какой-либо локации
        const enemyExists = locations.some(loc =>
          loc.npcs.hostile.some(npc => npc.id === effect.enemyType)
        );
        if (!enemyExists) {
          errors.push({
            eventId,
            field: `${field}.enemyType`,
            message: `Enemy "${effect.enemyType}" not found in any location`,
            severity: 'warning',
          });
        }
      }
      break;

    case 'narrative_only':
      // Только описание требуется
      break;
  }

  // Проверяем description
  if (!effect.description || effect.description.trim() === '') {
    errors.push({
      eventId,
      field: `${field}.description`,
      message: 'Effect description is required',
      severity: 'critical',
    });
  }

  return errors;
}

/**
 * Валидация выбора в событии
 */
function validateChoice(
  choice: EventChoice,
  eventId: string,
  choiceIndex: number,
  locations: Location[],
  materials: Material[]
): EventValidationError[] {
  const errors: EventValidationError[] = [];
  const field = `choices[${choiceIndex}]`;

  if (!choice.id || choice.id.trim() === '') {
    errors.push({
      eventId,
      field: `${field}.id`,
      message: 'Choice ID is required',
      severity: 'critical',
    });
  }

  if (!choice.text || choice.text.trim() === '') {
    errors.push({
      eventId,
      field: `${field}.text`,
      message: 'Choice text is required',
      severity: 'critical',
    });
  }

  if (!choice.effects || choice.effects.length === 0) {
    errors.push({
      eventId,
      field: `${field}.effects`,
      message: 'Choice must have at least one effect',
      severity: 'critical',
    });
  } else {
    for (let i = 0; i < choice.effects.length; i++) {
      errors.push(...validateEffect(choice.effects[i], eventId, i, locations, materials));
    }
  }

  return errors;
}

/**
 * Валидация условий события
 */
function validateConditions(
  conditions: EventConditions,
  eventId: string,
  locations: Location[]
): EventValidationError[] {
  const errors: EventValidationError[] = [];

  // Проверяем locationIds
  if (conditions.locationIds && conditions.locationIds.length > 0) {
    const validLocationIds = locations.map(l => l.id);
    for (const locId of conditions.locationIds) {
      if (!validLocationIds.includes(locId)) {
        errors.push({
          eventId,
          field: 'conditions.locationIds',
          message: `Location "${locId}" not found in registry`,
          severity: 'warning',
        });
      }
    }
  }

  // Проверяем minProgress/maxProgress
  if (conditions.minProgress !== undefined) {
    if (conditions.minProgress < 0 || conditions.minProgress > 100) {
      errors.push({
        eventId,
        field: 'conditions.minProgress',
        message: 'minProgress must be between 0 and 100',
        severity: 'warning',
      });
    }
  }

  if (conditions.maxProgress !== undefined) {
    if (conditions.maxProgress < 0 || conditions.maxProgress > 100) {
      errors.push({
        eventId,
        field: 'conditions.maxProgress',
        message: 'maxProgress must be between 0 and 100',
        severity: 'warning',
      });
    }
  }

  if (conditions.minProgress !== undefined && conditions.maxProgress !== undefined) {
    if (conditions.minProgress > conditions.maxProgress) {
      errors.push({
        eventId,
        field: 'conditions.minProgress',
        message: 'minProgress cannot be greater than maxProgress',
        severity: 'warning',
      });
    }
  }

  // Проверяем baseChance
  if (conditions.baseChance !== undefined) {
    if (conditions.baseChance < 0 || conditions.baseChance > 100) {
      errors.push({
        eventId,
        field: 'conditions.baseChance',
        message: 'baseChance must be between 0 and 100',
        severity: 'warning',
      });
    }
  }

  return errors;
}

/**
 * Валидация одного события
 */
export function validateEvent(
  event: EventTemplate,
  locations: Location[],
  materials: Material[]
): EventValidationError[] {
  const errors: EventValidationError[] = [];

  // === Обязательные поля ===

  // ID
  if (!event.id || event.id.trim() === '') {
    errors.push({
      eventId: 'unknown',
      field: 'id',
      message: 'Event ID is required',
      severity: 'critical',
    });
  }

  // Name
  if (!event.name || event.name.trim() === '') {
    errors.push({
      eventId: event.id,
      field: 'name',
      message: 'Event name is required',
      severity: 'critical',
    });
  }

  // Type
  if (!VALID_EVENT_TYPES.includes(event.type)) {
    errors.push({
      eventId: event.id,
      field: 'type',
      message: `Invalid event type "${event.type}", must be one of: ${VALID_EVENT_TYPES.join(', ')}`,
      severity: 'critical',
    });
  }

  // Category
  if (!VALID_EVENT_CATEGORIES.includes(event.category)) {
    errors.push({
      eventId: event.id,
      field: 'category',
      message: `Invalid category "${event.category}", must be one of: ${VALID_EVENT_CATEGORIES.join(', ')}`,
      severity: 'critical',
    });
  }

  // Title
  if (!event.title || event.title.trim() === '') {
    errors.push({
      eventId: event.id,
      field: 'title',
      message: 'Event title is required',
      severity: 'critical',
    });
  }

  // Description
  if (!event.description || event.description.trim() === '') {
    errors.push({
      eventId: event.id,
      field: 'description',
      message: 'Event description is required',
      severity: 'critical',
    });
  }

  // Weight
  if (typeof event.weight !== 'number' || event.weight <= 0) {
    errors.push({
      eventId: event.id,
      field: 'weight',
      message: 'Event weight must be a positive number',
      severity: 'critical',
    });
  }

  // Icon
  if (!event.icon || event.icon.trim() === '') {
    errors.push({
      eventId: event.id,
      field: 'icon',
      message: 'Event icon is required',
      severity: 'warning',
    });
  }

  // Conditions
  if (!event.conditions) {
    errors.push({
      eventId: event.id,
      field: 'conditions',
      message: 'Event conditions are required',
      severity: 'critical',
    });
  } else {
    errors.push(...validateConditions(event.conditions, event.id, locations));
  }

  // Effects (для не-choice событий)
  if (event.type !== 'choice') {
    if (!event.effects || event.effects.length === 0) {
      errors.push({
        eventId: event.id,
        field: 'effects',
        message: 'Non-choice events must have at least one effect',
        severity: 'critical',
      });
    } else {
      for (let i = 0; i < event.effects.length; i++) {
        errors.push(...validateEffect(event.effects[i], event.id, i, locations, materials));
      }
    }
  }

  // Choices (для choice событий)
  if (event.type === 'choice') {
    if (!event.choices || event.choices.length < 2) {
      errors.push({
        eventId: event.id,
        field: 'choices',
        message: 'Choice events must have at least 2 choices',
        severity: 'critical',
      });
    } else {
      for (let i = 0; i < event.choices.length; i++) {
        errors.push(...validateChoice(event.choices[i], event.id, i, locations, materials));
      }
    }
  } else if (event.choices && event.choices.length > 0) {
    errors.push({
      eventId: event.id,
      field: 'choices',
      message: 'Non-choice events should not have choices array',
      severity: 'warning',
    });
  }

  return errors;
}

/**
 * Валидация всех событий
 */
export function validateAllEvents(
  events: EventTemplate[],
  locations: Location[],
  materials: Material[]
): EventValidationResult {
  const allErrors: EventValidationError[] = [];
  const byType: Record<EventType, number> = {
    positive: 0, negative: 0, neutral: 0, choice: 0
  };
  const byCategory: Record<EventCategory, number> = {
    combat: 0, discovery: 0, travel: 0, social: 0,
    environment: 0, treasure: 0, danger: 0, rest: 0
  };

  // Проверка на дубликаты ID
  const ids = events.map(e => e.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

  for (const dupId of [...new Set(duplicates)]) {
    allErrors.push({
      eventId: dupId,
      field: 'id',
      message: `Duplicate event ID "${dupId}"`,
      severity: 'critical',
    });
  }

  // Валидация каждого события
  for (const event of events) {
    const errors = validateEvent(event, locations, materials);
    allErrors.push(...errors);

    // Статистика
    if (VALID_EVENT_TYPES.includes(event.type)) {
      byType[event.type]++;
    }
    if (VALID_EVENT_CATEGORIES.includes(event.category)) {
      byCategory[event.category]++;
    }
  }

  const criticalErrors = allErrors.filter(e => e.severity === 'critical');
  const warnings = allErrors.filter(e => e.severity === 'warning');

  return {
    valid: criticalErrors.length === 0,
    errors: criticalErrors,
    warnings,
    stats: {
      totalEvents: events.length,
      validEvents: events.length - new Set(criticalErrors.map(e => e.eventId)).size,
      invalidEvents: new Set(criticalErrors.map(e => e.eventId)).size,
      warningsCount: warnings.length,
      byType,
      byCategory,
    },
  };
}
