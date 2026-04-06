/**
 * События локации: Рудники Красного Камня
 *
 * Tier 1 - Стартовая шахта
 *
 * Структура:
 * - underground.ts — подземные явления (4 события)
 * - miners.ts — шахтёры (4 события)
 *
 * Итого: 11 событий для red_stone_mines
 */

import { redStoneUndergroundEvents } from './underground';
import { redStoneMinersEvents } from './miners';
import { redStoneElementalEvents } from './elemental';

// ============================================================================
// ЭКСПОРТ ВСЕХ СОБЫТИЙ
// ============================================================================

export {
  redStoneUndergroundEvents,
  redStoneMinersEvents,
};

// Экспорт отдельных событий для удобства
export {
  // Underground
  eventMineCaveIn,
  eventMineGasPocket,
  eventMineOreVein,
  eventMineFloodedTunnel,
} from './underground';

export {
  // Miners
  eventMineGhostMiner,
  eventMineAbandonedEquipment,
  eventMineTrappedMiner,
  eventMineOldCamp,
} from './miners';

// Объединённый массив всех событий локации
export const redStoneEvents = [
  ...redStoneUndergroundEvents,
  ...redStoneMinersEvents,
  ...redStoneElementalEvents,
];

// Статистика событий локации
export const redStoneEventsStats = {
  total: 11,
  locationId: 'red_stone_mines',
  byType: {
    positive: 2,
    negative: 2,
    neutral: 2,
    choice: 2,
  },
  byCategory: {
    discovery: 1,
    danger: 2,
    combat: 0,
    environment: 0,
    travel: 1,
    social: 1,
    treasure: 1,
    rest: 1,
  },
};

export default redStoneEvents;
