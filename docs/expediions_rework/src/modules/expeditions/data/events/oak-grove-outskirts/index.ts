/**
 * События локации: Окраины Дубовой Рощи
 *
 * Tier 1 - Стартовая лесная локация
 *
 * Структура:
 * - forest.ts — лесные явления (4 события)
 * - wildlife.ts — дикая природа (4 события)
 *
 * Итого: 8 событий для oak_grove_outskirts
 */

import { oakGroveForestEvents } from './forest';
import { oakGroveWildlifeEvents } from './wildlife';

// ============================================================================
// ЭКСПОРТ ВСЕХ СОБЫТИЙ
// ============================================================================

export {
  oakGroveForestEvents,
  oakGroveWildlifeEvents,
};

// Экспорт отдельных событий для удобства
export {
  // Forest
  eventOakForestSpirit,
  eventOakAncientTree,
  eventOakFairyRing,
  eventOakAnimalSigns,
} from './forest';

export {
  // Wildlife
  eventOakWolfHowl,
  eventOakBoarCharge,
  eventOakDeerSighting,
  eventOakHuntedPrey,
} from './wildlife';

// Объединённый массив всех событий локации
export const oakGroveEvents = [
  ...oakGroveForestEvents,
  ...oakGroveWildlifeEvents,
];

// Статистика событий локации
export const oakGroveEventsStats = {
  total: 8,
  locationId: 'oak_grove_outskirts',
  byType: {
    positive: 2,
    negative: 2,
    neutral: 2,
    choice: 2,
  },
  byCategory: {
    discovery: 3,
    danger: 1,
    combat: 1,
    environment: 1,
    travel: 2,
    social: 0,
    treasure: 0,
    rest: 0,
  },
};

export default oakGroveEvents;
