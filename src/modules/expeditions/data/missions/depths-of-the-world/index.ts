/**
 * Миссии для локации "Глубины Подземелий"
 * Tier 4 - Экстремальная локация
 *
 * Итого: 12 миссий
 */

import { depthsHuntMissions } from './hunt';
import { depthsScoutMissions } from './scout';
import { depthsGatherMissions } from './gather';
import { depthsInvestigateMissions } from './investigate';

export {
  depthsHuntMissions,
  depthsScoutMissions,
  depthsGatherMissions,
  depthsInvestigateMissions,
};

export const depthsMissions = [
  ...depthsHuntMissions,
  ...depthsScoutMissions,
  ...depthsGatherMissions,
  ...depthsInvestigateMissions,
];

export const depthsStats = {
  total: 12,
  byType: { hunt: 4, scout: 2, gather: 3, investigate: 2 },
  byRarity: { common: 0, uncommon: 0, rare: 0, epic: 6, legendary: 4 },
  byDifficulty: { easy: 0, normal: 0, hard: 0, extreme: 12 },
};

export default depthsMissions;
