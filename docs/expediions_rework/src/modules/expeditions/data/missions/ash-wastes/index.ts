/**
 * Миссии для локации "Пепельные Пустоши"
 * Tier 3 - Опасная локация
 *
 * Итого: 12 миссий
 */

import { ashWastesHuntMissions } from './hunt';
import { ashWastesScoutMissions } from './scout';
import { ashWastesGatherMissions } from './gather';
import { ashWastesInvestigateMissions } from './investigate';

export {
  ashWastesHuntMissions,
  ashWastesScoutMissions,
  ashWastesGatherMissions,
  ashWastesInvestigateMissions,
};

export const ashWastesMissions = [
  ...ashWastesHuntMissions,
  ...ashWastesScoutMissions,
  ...ashWastesGatherMissions,
  ...ashWastesInvestigateMissions,
];

export const ashWastesStats = {
  total: 12,
  byType: { hunt: 4, scout: 3, gather: 3, investigate: 2 },
  byRarity: { common: 0, uncommon: 3, rare: 5, epic: 4, legendary: 0 },
  byDifficulty: { easy: 0, normal: 0, hard: 3, extreme: 9 },
};

export default ashWastesMissions;
