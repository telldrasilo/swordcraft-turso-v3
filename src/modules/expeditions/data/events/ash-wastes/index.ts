/**
 * События локации: Пепельные Пустоши
 *
 * Tier 3 - Вулканическая пустошь
 *
 * Структура:
 * - fire.ts — огонь, пепел и вулканы (4 события)
 *
 * Итого: 4 события для ash_wastes
 */

import { ashFireEvents } from './fire';

// ============================================================================
// ЭКСПОРТ ВСЕХ СОБЫТИЙ
// ============================================================================

export { ashFireEvents };

// Экспорт отдельных событий для удобства
export {
  eventAshEruption,
  eventAshFireElemental,
  eventAshBuriedCity,
  eventAshHeatWave,
} from './fire';

// Объединённый массив всех событий локации
export const ashWastesEvents = [
  ...ashFireEvents,
];

// Статистика событий локации
export const ashWastesEventsStats = {
  total: 4,
  locationId: 'ash_wastes',
  byType: {
    positive: 1,
    negative: 2,
    neutral: 0,
    choice: 1,
  },
  byCategory: {
    discovery: 1,
    danger: 1,
    combat: 1,
    environment: 1,
    travel: 0,
    social: 0,
    treasure: 0,
    rest: 0,
  },
};

export default ashWastesEvents;
