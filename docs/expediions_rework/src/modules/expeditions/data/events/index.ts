/**
 * Реестр событий экспедиций
 *
 * Этот модуль объединяет все события из:
 * - common/ — общие события для всех локаций (40 событий)
 *   - discovery.ts — находки (5)
 *   - danger.ts — опасности (5)
 *   - travel.ts — путевые (5)
 *   - social.ts — социальные (5)
 *   - environment.ts — окружение (3)
 *   - treasure.ts — сокровища (3)
 *   - mystery.ts — загадки (4)
 *   - combat.ts — боевые (3)
 *   - rest.ts — отдых (3)
 *   - supernatural.ts — сверхъестественное (4)
 * - oak-grove-outskirts/ — Окраины Дубовой Рощи, Tier 1 (8 событий)
 * - red-stone-mines/ — Рудники Красного Камня, Tier 1 (8 событий)
 * - misty-lowlands/ — Туманные Низины, Tier 1 (8 событий)
 * - silver-grove/ — Серебряный Бор, Tier 2 (8 событий)
 * - forgotten-mines/ — Забытые Шахты, Tier 2 (8 событий)
 * - rotten-swamp/ — Гнилое Болото, Tier 2 (8 событий)
 * - frost-iron-ridge/ — Кряж Морозного Железа, Tier 3 (4 события)
 * - ash-wastes/ — Пепельные Пустоши, Tier 3 (4 события)
 * - whispering-forest/ — Шепчущий Лес, Tier 3 (4 события)
 * - dragon-scars/ — Драконьи Шрамы, Tier 4 (4 события)
 * - depths-of-the-world/ — Глубины Подземелий, Tier 4 (4 события)
 *
 * Итого: 108 событий
 */

import type { EventTemplate, EventConditions, EventType } from './_event-template';

// ============================================================================
// ИМПОРТ ВСЕХ СОБЫТИЙ
// ============================================================================

// Общие события (для всех локаций)
import { commonEvents } from './common';

// События по локациям
import { oakGroveEvents } from './oak-grove-outskirts';
import { redStoneEvents } from './red-stone-mines';
import { mistyLowlandsEvents } from './misty-lowlands';
import { silverGroveEvents } from './silver-grove';
import { forgottenMinesEvents } from './forgotten-mines';
import { rottenSwampEvents } from './rotten-swamp';
import { frostIronRidgeEvents } from './frost-iron-ridge';
import { ashWastesEvents } from './ash-wastes';
import { whisperingForestEvents } from './whispering-forest';
import { dragonScarsEvents } from './dragon-scars';
import { depthsOfTheWorldEvents } from './depths-of-the-world';

// ============================================================================
// РЕЕСТРЫ
// ============================================================================

/**
 * Общие события (доступны в любой локации)
 */
export const COMMON_EVENTS: EventTemplate[] = commonEvents;

/**
 * События по локациям
 */
export const LOCATION_EVENTS: Record<string, EventTemplate[]> = {
  'oak_grove_outskirts': oakGroveEvents,
  'red_stone_mines': redStoneEvents,
  'misty_lowlands': mistyLowlandsEvents,
  'silver_grove': silverGroveEvents,
  'forgotten_mines': forgottenMinesEvents,
  'rotten_swamp': rottenSwampEvents,
  'frost_iron_ridge': frostIronRidgeEvents,
  'ash_wastes': ashWastesEvents,
  'whispering_forest': whisperingForestEvents,
  'dragon_scars': dragonScarsEvents,
  'depths_of_the_world': depthsOfTheWorldEvents,
};

/**
 * Полный реестр всех событий
 */
export const EVENT_REGISTRY: EventTemplate[] = [
  ...COMMON_EVENTS,
  ...Object.values(LOCATION_EVENTS).flat(),
];

// ============================================================================
// СТАТИСТИКА
// ============================================================================

/**
 * Статистика событий
 */
export const EVENT_STATS = {
  total: EVENT_REGISTRY.length,
  common: COMMON_EVENTS.length,
  byLocation: Object.fromEntries(
    Object.entries(LOCATION_EVENTS).map(([id, events]) => [id, events.length])
  ),
  byType: {
    positive: EVENT_REGISTRY.filter(e => e.type === 'positive').length,
    negative: EVENT_REGISTRY.filter(e => e.type === 'negative').length,
    neutral: EVENT_REGISTRY.filter(e => e.type === 'neutral').length,
    choice: EVENT_REGISTRY.filter(e => e.type === 'choice').length,
  },
  byCategory: {
    combat: EVENT_REGISTRY.filter(e => e.category === 'combat').length,
    discovery: EVENT_REGISTRY.filter(e => e.category === 'discovery').length,
    travel: EVENT_REGISTRY.filter(e => e.category === 'travel').length,
    social: EVENT_REGISTRY.filter(e => e.category === 'social').length,
    environment: EVENT_REGISTRY.filter(e => e.category === 'environment').length,
    treasure: EVENT_REGISTRY.filter(e => e.category === 'treasure').length,
    danger: EVENT_REGISTRY.filter(e => e.category === 'danger').length,
    rest: EVENT_REGISTRY.filter(e => e.category === 'rest').length,
  },
  byTier: {
    tier1: oakGroveEvents.length + redStoneEvents.length + mistyLowlandsEvents.length,
    tier2: silverGroveEvents.length + forgottenMinesEvents.length + rottenSwampEvents.length,
    tier3: frostIronRidgeEvents.length + ashWastesEvents.length + whisperingForestEvents.length,
    tier4: dragonScarsEvents.length + depthsOfTheWorldEvents.length,
  },
};

// ============================================================================
// УТИЛИТЫ
// ============================================================================

/**
 * Получить событие по ID
 */
export function getEventById(id: string): EventTemplate | undefined {
  return EVENT_REGISTRY.find(e => e.id === id);
}

/**
 * Получить события для локации (общие + специфичные)
 */
export function getEventsForLocation(locationId: string): EventTemplate[] {
  const locationEvents = LOCATION_EVENTS[locationId] || [];
  return [...COMMON_EVENTS, ...locationEvents];
}

/**
 * Получить события по типу
 */
export function getEventsByType(type: EventType): EventTemplate[] {
  return EVENT_REGISTRY.filter(e => e.type === type);
}

/**
 * Получить события по категории
 */
export function getEventsByCategory(category: string): EventTemplate[] {
  return EVENT_REGISTRY.filter(e => e.category === category);
}

/**
 * Получить события по тиру локации
 */
export function getEventsByTier(tier: 1 | 2 | 3 | 4): EventTemplate[] {
  const tierLocations: Record<number, string[]> = {
    1: ['oak_grove_outskirts', 'red_stone_mines', 'misty_lowlands'],
    2: ['silver_grove', 'forgotten_mines', 'rotten_swamp'],
    3: ['frost_iron_ridge', 'ash_wastes', 'whispering_forest'],
    4: ['dragon_scars', 'depths_of_the_world'],
  };

  const locationIds = tierLocations[tier] || [];
  const events = locationIds.flatMap(id => LOCATION_EVENTS[id] || []);

  return [...COMMON_EVENTS, ...events];
}

/**
 * Фильтровать события по условиям
 */
export function filterEventsByConditions(
  events: EventTemplate[],
  context: {
    locationId: string;
    locationType: string;
    locationTags: string[];
    locationTier: number;
    missionType: string;
    missionDifficulty: string;
    progress: number;
    weather?: string;
    timeOfDay?: string;
  }
): EventTemplate[] {
  return events.filter(event => {
    const cond = event.conditions;

    // Проверка конкретных локаций
    if (cond.locationIds && !cond.locationIds.includes(context.locationId)) {
      return false;
    }

    // Проверка типов локаций
    if (cond.locationTypes && !cond.locationTypes.includes(context.locationType)) {
      return false;
    }

    // Проверка тегов
    if (cond.locationTags) {
      const hasTag = cond.locationTags.some(tag => context.locationTags.includes(tag));
      if (!hasTag) return false;
    }

    // Проверка тиров
    if (cond.locationTiers && !cond.locationTiers.includes(context.locationTier)) {
      return false;
    }

    // Проверка типа миссии
    if (cond.missionTypes && !cond.missionTypes.includes(context.missionType as any)) {
      return false;
    }

    // Проверка сложности
    if (cond.missionDifficulties && !cond.missionDifficulties.includes(context.missionDifficulty as any)) {
      return false;
    }

    // Проверка прогресса
    if (cond.minProgress !== undefined && context.progress < cond.minProgress) {
      return false;
    }
    if (cond.maxProgress !== undefined && context.progress > cond.maxProgress) {
      return false;
    }

    // Проверка погоды
    if (cond.weather && context.weather && !cond.weather.includes(context.weather)) {
      return false;
    }

    // Проверка времени суток
    if (cond.timeOfDay && context.timeOfDay && !cond.timeOfDay.includes(context.timeOfDay as any)) {
      return false;
    }

    return true;
  });
}

/**
 * Получить случайные события с весами
 */
export function getRandomEvents(
  events: EventTemplate[],
  count: number,
  rng: () => number = Math.random
): EventTemplate[] {
  const weighted = events.map(e => ({ event: e, weight: e.weight }));
  const selected: EventTemplate[] = [];

  for (let i = 0; i < count && weighted.length > 0; i++) {
    const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
    let random = rng() * totalWeight;

    for (let j = 0; j < weighted.length; j++) {
      random -= weighted[j].weight;
      if (random <= 0) {
        selected.push(weighted[j].event);
        weighted.splice(j, 1);
        break;
      }
    }
  }

  return selected;
}

// ============================================================================
// ЭКСПОРТ ИМПОРТИРОВАННЫХ МОДУЛЕЙ
// ============================================================================

// Реэкспорт common
export { commonEvents } from './common';
export {
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
} from './common';

// Реэкспорт по локациям
export { oakGroveEvents } from './oak-grove-outskirts';
export { redStoneEvents } from './red-stone-mines';
export { mistyLowlandsEvents } from './misty-lowlands';
export { silverGroveEvents } from './silver-grove';
export { forgottenMinesEvents } from './forgotten-mines';
export { rottenSwampEvents } from './rotten-swamp';
export { frostIronRidgeEvents } from './frost-iron-ridge';
export { ashWastesEvents } from './ash-wastes';
export { whisperingForestEvents } from './whispering-forest';
export { dragonScarsEvents } from './dragon-scars';
export { depthsOfTheWorldEvents } from './depths-of-the-world';

// ============================================================================
// ЭКСПОРТ ТИПОВ
// ============================================================================

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
} from './_event-template';

export {
  EVENT_TYPE_CONFIG,
  EVENT_COUNT_CONFIG,
  calculateEventCount,
  selectMaterialFromLocation,
  getMaterialsByRarityFromLocation,
  distributeEventsByTime,
} from './_event-template';
