/**
 * Миссии для локации "Кряж Морозного Железа"
 * Tier 3 - Опасная локация
 *
 * Структура:
 * - hunt.ts   — 4 боевые миссии
 * - scout.ts  — 3 миссии разведки
 * - gather.ts — 3 миссии сбора
 * - rescue.ts — 2 миссии спасения
 *
 * Итого: 12 миссий
 */

import { frostIronRidgeHuntMissions } from './hunt';
import { frostIronRidgeScoutMissions } from './scout';
import { frostIronRidgeGatherMissions } from './gather';
import { frostIronRidgeRescueMissions } from './rescue';

export {
  frostIronRidgeHuntMissions,
  frostIronRidgeScoutMissions,
  frostIronRidgeGatherMissions,
  frostIronRidgeRescueMissions,
};

export const frostIronRidgeMissions = [
  ...frostIronRidgeHuntMissions,
  ...frostIronRidgeScoutMissions,
  ...frostIronRidgeGatherMissions,
  ...frostIronRidgeRescueMissions,
];

export const frostIronRidgeStats = {
  total: 12,
  byType: { hunt: 4, scout: 3, gather: 3, rescue: 2 },
  byRarity: { common: 0, uncommon: 3, rare: 5, epic: 4, legendary: 0 },
  byDifficulty: { easy: 0, normal: 0, hard: 3, extreme: 9 },
};

export default frostIronRidgeMissions;
