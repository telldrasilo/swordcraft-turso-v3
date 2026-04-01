/**
 * События локации: Глубины Подземелий
 *
 * Tier 4 - Глубочайшие пещеры мира
 *
 * Структура:
 * - eldritch.ts — бездна, древние машины и элдрич (4 события)
 *
 * Итого: 4 события для depths_of_the_world
 */

import { depthsEldritchEvents } from './eldritch';

// ============================================================================
// ЭКСПОРТ ВСЕХ СОБЫТИЙ
// ============================================================================

export { depthsEldritchEvents };

// Экспорт отдельных событий для удобства
export {
  eventDepthsVoidWhisper,
  eventDepthsAncientMachine,
  eventDepthsLivingRock,
  eventDepthsHeartOfMountain,
} from './eldritch';

// Объединённый массив всех событий локации
export const depthsOfTheWorldEvents = [
  ...depthsEldritchEvents,
];

// Статистика событий локации
export const depthsOfTheWorldEventsStats = {
  total: 4,
  locationId: 'depths_of_the_world',
  byType: {
    positive: 1,
    negative: 1,
    neutral: 0,
    choice: 2,
  },
  byCategory: {
    discovery: 1,
    danger: 1,
    combat: 1,
    environment: 0,
    travel: 0,
    social: 0,
    treasure: 1,
    rest: 0,
  },
};

export default depthsOfTheWorldEvents;
