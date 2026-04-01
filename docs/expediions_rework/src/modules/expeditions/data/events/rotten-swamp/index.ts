/**
 * События локации: Гнилое Болото
 *
 * Tier 2 - Токсичное болото с нежитью
 *
 * Структура:
 * - toxic.ts — яды и токсины (4 события)
 * - undead.ts — нежить и мертвецы (4 события)
 *
 * Итого: 8 событий для rotten_swamp
 */

import { rottenToxicEvents } from './toxic';
import { rottenUndeadEvents } from './undead';

// ============================================================================
// ЭКСПОРТ ВСЕХ СОБЫТИЙ
// ============================================================================

export {
  rottenToxicEvents,
  rottenUndeadEvents,
};

// Экспорт отдельных событий для удобства
export {
  // Toxic
  eventRottenPoisonFog,
  eventRottenDisease,
  eventRottenAlchemistCache,
  eventRottenPoisoner,
} from './toxic';

export {
  // Undead
  eventRottenDrowned,
  eventRottenCorpseEater,
  eventRottenSwampLich,
  eventRottenDrownedSpirit,
} from './undead';

// Объединённый массив всех событий локации
export const rottenSwampEvents = [
  ...rottenToxicEvents,
  ...rottenUndeadEvents,
];

// Статистика событий локации
export const rottenSwampEventsStats = {
  total: 8,
  locationId: 'rotten_swamp',
  byType: {
    positive: 1,
    negative: 3,
    neutral: 1,
    choice: 3,
  },
  byCategory: {
    discovery: 0,
    danger: 2,
    combat: 2,
    environment: 0,
    travel: 0,
    social: 3,
    treasure: 1,
    rest: 0,
  },
};

export default rottenSwampEvents;
