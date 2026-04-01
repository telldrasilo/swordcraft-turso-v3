/**
 * События локации: Забытые Шахты
 *
 * Tier 2 - Древние заброшенные шахты
 *
 * Структура:
 * - ancient.ts — древние механизмы и стражи (4 события)
 * - depth.ts — глубины и существа (4 события)
 *
 * Итого: 8 событий для forgotten_mines
 */

import { forgottenAncientEvents } from './ancient';
import { forgottenDepthEvents } from './depth';

// ============================================================================
// ЭКСПОРТ ВСЕХ СОБЫТИЙ
// ============================================================================

export {
  forgottenAncientEvents,
  forgottenDepthEvents,
};

// Экспорт отдельных событий для удобства
export {
  // Ancient
  eventForgottenAncientMachinery,
  eventForgottenSealedDoor,
  eventForgottenAncientGuardian,
  eventForgottenEchoes,
} from './ancient';

export {
  // Depth
  eventForgottenDeepCrawler,
  eventForgottenEchoBeast,
  eventForgottenGhostMiner,
  eventForgottenCaveIn,
} from './depth';

// Объединённый массив всех событий локации
export const forgottenMinesEvents = [
  ...forgottenAncientEvents,
  ...forgottenDepthEvents,
];

// Статистика событий локации
export const forgottenMinesEventsStats = {
  total: 8,
  locationId: 'forgotten_mines',
  byType: {
    positive: 0,
    negative: 4,
    neutral: 1,
    choice: 3,
  },
  byCategory: {
    discovery: 1,
    danger: 2,
    combat: 2,
    environment: 1,
    travel: 0,
    social: 1,
    treasure: 1,
    rest: 0,
  },
};

export default forgottenMinesEvents;
