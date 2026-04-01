/**
 * Миссии для локации "Шепчущий Лес"
 * Tier 3 - Опасная локация
 *
 * Структура:
 * - hunt.ts       — 4 боевые миссии
 * - scout.ts      — 3 миссии разведки
 * - gather.ts     — 3 миссии сбора
 * - investigate.ts — 2 миссии расследования
 *
 * Итого: 12 миссий
 */

import { whisperingForestHuntMissions } from './hunt';
import { whisperingForestScoutMissions } from './scout';
import { whisperingForestGatherMissions } from './gather';
import { whisperingForestInvestigateMissions } from './investigate';

export {
  whisperingForestHuntMissions,
  whisperingForestScoutMissions,
  whisperingForestGatherMissions,
  whisperingForestInvestigateMissions,
};

export const whisperingForestMissions = [
  ...whisperingForestHuntMissions,
  ...whisperingForestScoutMissions,
  ...whisperingForestGatherMissions,
  ...whisperingForestInvestigateMissions,
];

export const whisperingForestStats = {
  total: 12,
  byType: { hunt: 4, scout: 3, gather: 3, investigate: 2 },
  byRarity: { common: 0, uncommon: 3, rare: 5, epic: 4, legendary: 0 },
  byDifficulty: { easy: 0, normal: 0, hard: 3, extreme: 9 },
};

export default whisperingForestMissions;
