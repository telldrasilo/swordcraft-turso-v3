/**
 * События локации: Туманные Низины
 *
 * Tier 1 - Стартовая болотистая локация
 *
 * Структура:
 * - fog.ts — туман и мистика (4 события)
 * - swamp.ts — болото и трясина (4 события)
 *
 * Итого: 8 событий для misty_lowlands
 */

import { mistyFogEvents } from './fog';
import { mistySwampEvents } from './swamp';

// ============================================================================
// ЭКСПОРТ ВСЕХ СОБЫТИЙ
// ============================================================================

export {
  mistyFogEvents,
  mistySwampEvents,
};

// Экспорт отдельных событий для удобства
export {
  // Fog
  eventMistyFogVoices,
  eventMistyGhostEncounter,
  eventMistyFogClearing,
  eventMistySubmergedBells,
} from './fog';

export {
  // Swamp
  eventMistyQuicksand,
  eventMistyBogWalker,
  eventMistyHerbalistHut,
  eventMistyLeechAmbush,
} from './swamp';

// Объединённый массив всех событий локации
export const mistyLowlandsEvents = [
  ...mistyFogEvents,
  ...mistySwampEvents,
];

// Статистика событий локации
export const mistyLowlandsEventsStats = {
  total: 8,
  locationId: 'misty_lowlands',
  byType: {
    positive: 2,
    negative: 2,
    neutral: 1,
    choice: 3,
  },
  byCategory: {
    discovery: 1,
    danger: 2,
    combat: 1,
    environment: 2,
    travel: 0,
    social: 1,
    treasure: 0,
    rest: 0,
  },
};

export default mistyLowlandsEvents;
