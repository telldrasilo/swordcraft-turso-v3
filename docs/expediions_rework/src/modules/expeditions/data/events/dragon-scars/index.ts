/**
 * События локации: Драконьи Шрамы
 *
 * Tier 4 - Земли драконов
 *
 * Структура:
 * - dragon.ts — драконы, дрейки и огонь (4 события)
 *
 * Итого: 4 события для dragon_scars
 */

import { dragonScarsDragonEvents } from './dragon';

// ============================================================================
// ЭКСПОРТ ВСЕХ СОБЫТИЙ
// ============================================================================

export { dragonScarsDragonEvents };

// Экспорт отдельных событий для удобства
export {
  eventDragonFlight,
  eventDragonHoard,
  eventDragonWyrmling,
  eventDragonScorchedEarth,
} from './dragon';

// Объединённый массив всех событий локации
export const dragonScarsEvents = [
  ...dragonScarsDragonEvents,
];

// Статистика событий локации
export const dragonScarsEventsStats = {
  total: 4,
  locationId: 'dragon_scars',
  byType: {
    positive: 1,
    negative: 2,
    neutral: 0,
    choice: 1,
  },
  byCategory: {
    discovery: 0,
    danger: 2,
    combat: 1,
    environment: 1,
    travel: 0,
    social: 0,
    treasure: 1,
    rest: 0,
  },
};

export default dragonScarsEvents;
