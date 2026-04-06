/**
 * События локации: Серебряный Бор
 *
 * Tier 2 - Лесная локация с сереброносными жилами
 *
 * Структура:
 * - lunar.ts — лунная магия и ночные существа (4 события)
 * - silver.ts — серебро и лесные явления (4 события)
 *
 * Итого: 10 событий для silver_grove
 */

import { silverLunarEvents } from './lunar';
import { silverForestEvents } from './silver';
import { silverElementalEvents } from './elemental';

// ============================================================================
// ЭКСПОРТ ВСЕХ СОБЫТИЙ
// ============================================================================

export {
  silverLunarEvents,
  silverForestEvents,
};

// Экспорт отдельных событий для удобства
export {
  // Lunar
  eventSilverMoonWolf,
  eventSilverShadowHunter,
  eventSilverMoonlight,
  eventSilverWerewolf,
} from './lunar';

export {
  // Silver
  eventSilverOreVein,
  eventSilverSilversmith,
  eventSilverSpider,
  eventSilverForestMaiden,
} from './silver';

// Объединённый массив всех событий локации
export const silverGroveEvents = [
  ...silverLunarEvents,
  ...silverForestEvents,
  ...silverElementalEvents,
];

// Статистика событий локации
export const silverGroveEventsStats = {
  total: 10,
  locationId: 'silver_grove',
  byType: {
    positive: 3,
    negative: 2,
    neutral: 0,
    choice: 3,
  },
  byCategory: {
    discovery: 2,
    danger: 2,
    combat: 2,
    environment: 0,
    travel: 0,
    social: 2,
    treasure: 0,
    rest: 0,
  },
};

export default silverGroveEvents;
