/**
 * Генератор событий для миссий
 *
 * Генерирует события при старте миссии с учётом:
 * - Ресурсов локации (материалы подставляются динамически)
 * - Распределения по редкости
 * - Контракта (exploration/speed)
 */

import type { Location } from '../types';
import type { MissionTemplate, ContractType } from '../data/missions/_mission-template';
import type {
  EventTemplate,
  EventEffect,
  GeneratedEvent,
  ResolvedEffect,
} from '../data/events/_event-template';
import {
  calculateEventCount,
  distributeEventsByTime,
  selectMaterialFromLocation,
  EVENT_TYPE_CONFIG,
} from '../data/events/_event-template';
import { CONTRACT_CONFIG } from '../data/missions/_mission-template';
import { filterEventsByConditions, getEventsForLocation } from '../data/events';
import { materialById } from '@/data/materials/library';

/** Дополнительные выборы материала на один эффект grant_location_material (сверх первого) */
const DEFAULT_EXTRA_LOCATION_MATERIAL_ROLLS = 3;

// ============================================================================
// ГЕНЕРАЦИЯ СОБЫТИЙ ДЛЯ МИССИИ
// ============================================================================

export interface EventGenerationContext {
  mission: MissionTemplate;
  location: Location;
  contractType: ContractType;
  seed: number;
  progress?: number;
  /** Длина маршрута в секундах (стена миссии); иначе из длительности миссии и множителя договора */
  routeDurationSeconds?: number;
}

/**
 * Сгенерировать события для миссии
 */
export function generateEventsForMission(
  context: EventGenerationContext
): GeneratedEvent[] {
  const { mission, location, contractType, seed } = context;

  const routeSec =
    context.routeDurationSeconds ??
    Math.max(
      60,
      Math.round(mission.duration.base * CONTRACT_CONFIG[contractType].durationMultiplier)
    );

  // 1. Определить количество событий
  const eventCount = calculateEventCount(
    routeSec,
    location.tier,
    mission.difficulty,
    mission.rarity,
    contractType
  );

  // 2. Получить подходящие шаблоны
  const availableTemplates = getAvailableEventTemplates(context);

  if (availableTemplates.length === 0) {
    return [];
  }

  // 3. Выбрать шаблоны с учётом весов и распределения типов
  const selectedTemplates = selectEventTemplates(
    availableTemplates,
    eventCount,
    seed
  );

  // 4. Распределить по времени
  const triggerTimes = distributeEventsByTime(eventCount, routeSec, seed);

  // 5. Создать сгенерированные события
  const events: GeneratedEvent[] = selectedTemplates.map((template, index) => ({
    instanceId: `event_${mission.id}_${index + 1}`,
    templateId: template.id,
    triggeredAt: triggerTimes[index],
    order: index + 1,
    status: 'hidden' as const,
  }));

  return events;
}

// ============================================================================
// ВЫБОР ШАБЛОНОВ
// ============================================================================

/**
 * Получить доступные шаблоны событий для контекста
 */
function getAvailableEventTemplates(
  context: EventGenerationContext
): EventTemplate[] {
  const { mission, location } = context;

  // Получаем все события для локации
  const allEvents = getEventsForLocation(location.id);

  // У карты часто задан minProgress > 0; при старте миссии progress ещё 0 — пул был бы пустым.
  // Для выбора шаблонов используем середину диапазона прогресса, если явный progress не передан.
  const progressForFilter = context.progress ?? 50;

  // Фильтруем по условиям
  return filterEventsByConditions(allEvents, {
    locationId: location.id,
    locationType: location.type,
    locationTags: location.tags,
    locationTier: location.tier,
    missionType: mission.type,
    missionDifficulty: mission.difficulty,
    progress: progressForFilter,
  });
}

/**
 * Выбрать шаблоны событий с учётом весов и распределения типов
 */
function selectEventTemplates(
  templates: EventTemplate[],
  count: number,
  seed: number
): EventTemplate[] {
  if (templates.length <= count) {
    return templates;
  }

  // Сортируем по типам (чтобы было разнообразие)
  const byType: Record<string, EventTemplate[]> = {};
  for (const t of templates) {
    if (!byType[t.type]) byType[t.type] = [];
    byType[t.type].push(t);
  }

  // Определяем желаемое распределение типов
  const typeDistribution = calculateTypeDistribution(count);

  const selected: EventTemplate[] = [];

  // Выбираем по одному из каждого типа
  for (const [type, typeCount] of Object.entries(typeDistribution)) {
    const typeTemplates = byType[type] || [];
    for (let i = 0; i < typeCount && selected.length < count; i++) {
      if (typeTemplates.length > 0) {
        const index = Math.floor(seededRandom(seed + selected.length) * typeTemplates.length);
        const template = typeTemplates.splice(index, 1)[0];
        if (template) selected.push(template);
      }
    }
  }

  // Добираем случайные, если не хватило
  const remaining = templates.filter(t => !selected.includes(t));
  while (selected.length < count && remaining.length > 0) {
    const index = Math.floor(seededRandom(seed + selected.length * 100) * remaining.length);
    const template = remaining.splice(index, 1)[0];
    if (template) selected.push(template);
  }

  return selected;
}

/**
 * Рассчитать распределение событий по типам
 */
function calculateTypeDistribution(count: number): Record<string, number> {
  const distribution: Record<string, number> = {
    positive: 0,
    negative: 0,
    neutral: 0,
    choice: 0,
  };

  // Пропорционально весам
  const totalWeight = Object.values(EVENT_TYPE_CONFIG).reduce((s, c) => s + c.weight, 0);

  let remaining = count;
  for (const [type, config] of Object.entries(EVENT_TYPE_CONFIG)) {
    const proportion = config.weight / totalWeight;
    const typeCount = Math.round(count * proportion);

    if (remaining > 0 && typeCount > 0) {
      distribution[type] = Math.min(typeCount, remaining);
      remaining -= distribution[type];
    }
  }

  // Добираем до нужного количества
  if (remaining > 0) {
    distribution.positive += remaining;
  }

  return distribution;
}

// ============================================================================
// РАЗРЕШЕНИЕ ЭФФЕКТОВ
// ============================================================================

/**
 * Разрешить эффекты события (подставить материалы из локации)
 */
export function resolveEventEffects(
  effects: EventEffect[],
  location: Location,
  seed: number
): ResolvedEffect[] {
  const resolved: ResolvedEffect[] = [];

  for (let i = 0; i < effects.length; i++) {
    const effect = effects[i]!;
    resolved.push(...resolveEffectExpanded(effect, location, seed + i * 9973 + resolved.length));
  }

  return resolved;
}

/** Один логический эффект → одна или несколько записей резолва */
function resolveEffectExpanded(
  effect: EventEffect,
  location: Location,
  seed: number
): ResolvedEffect[] {
  switch (effect.type) {
    case 'grant_location_material': {
      const rarity = effect.materialRarity || 'common';
      const catalogued = location.resources.filter((r) => Boolean(materialById[r.materialId]));
      const configured = effect.extraMaterialRolls ?? DEFAULT_EXTRA_LOCATION_MATERIAL_ROLLS;
      const extraRolls = Math.max(0, Math.min(6, configured));
      const totalRolls = 1 + extraRolls;
      const out: ResolvedEffect[] = [];
      for (let r = 0; r < totalRolls; r++) {
        const selectedResource = selectMaterialFromLocation(catalogued, rarity, seed + r * 7919);
        if (!selectedResource) continue;
        const rawQty = randomInRange(
          effect.materialQuantity?.base ?? 1,
          effect.materialQuantity?.variance ?? 0,
          seed + r * 503
        );
        const quantity = Math.max(1, Math.round(rawQty * 1.25));
        out.push({
          type: 'grant_material',
          materialId: selectedResource.materialId,
          quantity,
          description: effect.description,
        });
      }
      return out;
    }

    case 'grant_resource': {
      const quantity = randomInRange(
        effect.quantity?.base ?? 1,
        effect.quantity?.variance ?? 0,
        seed
      );

      return [
        {
          type: 'grant_resource',
          resourceId: effect.resourceId,
          quantity: Math.max(1, quantity),
          description: effect.description,
        },
      ];
    }

    case 'damage_weapon':
    case 'damage_adventurer':
    case 'modify_success_chance':
    case 'modify_gold_reward': {
      return [
        {
          type: effect.type,
          quantity: effect.modifier ?? 0,
          description: effect.description,
        },
      ];
    }

    case 'modify_duration': {
      return [
        {
          type: 'modify_duration',
          quantity: effect.modifier ?? 0,
          description: effect.description,
        },
      ];
    }

    case 'narrative_only': {
      return [
        {
          type: 'narrative_only',
          quantity: 0,
          description: effect.description,
        },
      ];
    }

    default:
      return [];
  }
}

// ============================================================================
// УТИЛИТЫ
// ============================================================================

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function randomInRange(base: number, variance: number, seed: number): number {
  const random = seededRandom(seed);
  const range = base * variance;
  return Math.floor(base + (random - 0.5) * 2 * range);
}

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export { selectMaterialFromLocation } from '../data/events/_event-template';
