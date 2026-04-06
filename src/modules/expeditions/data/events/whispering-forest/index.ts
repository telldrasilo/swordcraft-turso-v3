/**
 * События локации: Шепчущий Лес
 *
 * Tier 3 - Магический лес с голосами
 *
 * Структура:
 * - magic.ts — голоса, магия и духи (4 события)
 * - elemental.ts — аркан и природа на клинке (2 события)
 *
 * Итого: 6 событий для whispering_forest
 */

import { whisperingMagicEvents } from './magic';
import { whisperElementalEvents } from './elemental';

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
  ...whisperElementalEvents,
];

// Статистика событий локации
export const whisperingForestEventsStats = {
  total: 6,
  locationId: 'whispering_forest',
  byType: {
    positive: 2,
    negative: 2,
    neutral: 0,
    choice: 2,
  },
  byCategory: {
    discovery: 1,
    danger: 1,
    combat: 0,
    environment: 2,
    travel: 0,
    social: 1,
    treasure: 0,
    rest: 0,
  },
};

export default whisperingForestEvents;
