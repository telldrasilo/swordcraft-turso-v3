/**
 * События локации: Кряж Морозного Железа
 *
 * Tier 3 - Ледяные горы с морозным железом
 *
 * Структура:
 * - cold.ts — холод, лёд и великаны (4 события)
 *
 * Итого: 5 событий для frost_iron_ridge
 */

import { frostColdEvents } from './cold';
import { frostElementalEvents } from './elemental';

// ============================================================================
// ЭКСПОРТ ВСЕХ СОБЫТИЙ
// ============================================================================

export { frostColdEvents };

// Экспорт отдельных событий для удобства
export {
  eventFrostBlizzard,
  eventFrostFrozenTraveler,
  eventFrostIceCave,
  eventFrostGiantTrail,
} from './cold';

// Объединённый массив всех событий локации
export const frostIronRidgeEvents = [
  ...frostColdEvents,
  ...frostElementalEvents,
];

// Статистика событий локации
export const frostIronRidgeEventsStats = {
  total: 5,
  locationId: 'frost_iron_ridge',
  byType: {
    positive: 1,
    negative: 1,
    neutral: 1,
    choice: 1,
  },
  byCategory: {
    discovery: 1,
    danger: 1,
    combat: 0,
    environment: 1,
    travel: 0,
    social: 1,
    treasure: 0,
    rest: 0,
  },
};

export default frostIronRidgeEvents;
