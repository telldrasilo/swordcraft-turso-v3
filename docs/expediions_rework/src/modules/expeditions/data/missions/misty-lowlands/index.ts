/**
 * Миссии для локации "Туманные Низины"
 * Tier 1 - Стартовая локация
 *
 * Структура:
 * - hunt.ts    — 4 боевые миссии
 * - scout.ts   — 3 миссии разведки
 * - gather.ts  — 3 миссии сбора
 * - rescue.ts  — 2 миссии спасения
 *
 * Итого: 12 миссий
 */

import { mistyLowlandsHuntMissions } from './hunt';
import { mistyLowlandsScoutMissions } from './scout';
import { mistyLowlandsGatherMissions } from './gather';
import { mistyLowlandsRescueMissions } from './rescue';

// ============================================================================
// ЭКСПОРТ ПО КАТЕГОРИЯМ
// ============================================================================

export {
  mistyLowlandsHuntMissions,
  mistyLowlandsScoutMissions,
  mistyLowlandsGatherMissions,
  mistyLowlandsRescueMissions,
};

// ============================================================================
// ЭКСПОРТ ИНДИВИДУАЛЬНЫХ МИССИЙ (для удобства)
// ============================================================================

// Боевые миссии
export {
  huntLeechesCommon,
  huntBogWalkersCommon,
  huntMistGhostsUncommon,
  huntSwampHydraRare,
} from './hunt';

// Разведка
export {
  scoutSafePathCommon,
  scoutHerbalistSpotUncommon,
  scoutSunkenCityRare,
} from './scout';

// Сбор ресурсов
export {
  gatherClayCommon,
  gatherPeatMossCommon,
  gatherMistHerbsUncommon,
} from './gather';

// Спасение
export {
  rescueLostTravelerCommon,
  rescueFromQuagmireUncommon,
} from './rescue';

// ============================================================================
// ОБЩИЙ РЕЕСТР МИССИЙ ЛОКАЦИИ
// ============================================================================

export const mistyLowlandsMissions = [
  ...mistyLowlandsHuntMissions,
  ...mistyLowlandsScoutMissions,
  ...mistyLowlandsGatherMissions,
  ...mistyLowlandsRescueMissions,
];

// ============================================================================
// СТАТИСТИКА
// ============================================================================

export const mistyLowlandsStats = {
  total: 12,
  byType: {
    hunt: 4,
    scout: 3,
    gather: 3,
    rescue: 2,
  },
  byRarity: {
    common: 5,
    uncommon: 5,
    rare: 2,
    epic: 0,
    legendary: 0,
  },
  byDifficulty: {
    easy: 2,
    normal: 7,
    hard: 3,
    extreme: 0,
  },
};

export default mistyLowlandsMissions;
