/**
 * События локации: Пепельные Пустоши
 *
 * Tier 3 - Вулканическая пустошь
 *
 * Структура:
 * - fire.ts — огонь, пепел и вулканы (4 события)
 * - elemental.ts — стихийные следы на клинке (3 события)
 *
 * Итого: 7 событий для ash_wastes
 */

import { ashFireEvents } from './fire';
import { ashWastesElementalEvents } from './elemental';

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
export const ashWastesEvents = [...ashFireEvents, ...ashWastesElementalEvents];

// Статистика событий локации
export const ashWastesEventsStats = {
  total: 7,
  locationId: 'ash_wastes',
  byType: {
    positive: 1,
    negative: 5,
    neutral: 0,
    choice: 1,
  },
  byCategory: {
    discovery: 1,
    danger: 2,
    combat: 1,
    environment: 3,
    travel: 0,
    social: 0,
    treasure: 0,
    rest: 0,
  },
};

export default ashWastesEvents;
