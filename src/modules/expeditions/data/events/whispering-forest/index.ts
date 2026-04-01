/**
 * События локации: Шепчущий Лес
 *
 * Tier 3 - Магический лес с голосами
 *
 * Структура:
 * - magic.ts — голоса, магия и духи (4 события)
 *
 * Итого: 4 события для whispering_forest
 */

import { whisperingMagicEvents } from './magic';

// ============================================================================
// ЭКСПОРТ ВСЕХ СОБЫТИЙ
// ============================================================================

export { whisperingMagicEvents };

// Экспорт отдельных событий для удобства
export {
  eventWhisperVoices,
  eventWhisperAncientDruid,
  eventWhisperMemoryTree,
  eventWhisperShadowSelf,
} from './magic';

// Объединённый массив всех событий локации
export const whisperingForestEvents = [
  ...whisperingMagicEvents,
];

// Статистика событий локации
export const whisperingForestEventsStats = {
  total: 4,
  locationId: 'whispering_forest',
  byType: {
    positive: 2,
    negative: 0,
    neutral: 0,
    choice: 2,
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

export default whisperingForestEvents;
