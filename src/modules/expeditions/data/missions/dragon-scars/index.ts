/**
 * Миссии для локации "Драконьи Шрамы"
 * Tier 4 - Экстремальная локация
 *
 * Итого: 12 миссий
 */

import { dragonScarsHuntMissions } from './hunt';
import { dragonScarsScoutMissions } from './scout';
import { dragonScarsGatherMissions } from './gather';
import { dragonScarsClearMissions } from './clear';

export {
  dragonScarsHuntMissions,
  dragonScarsScoutMissions,
  dragonScarsGatherMissions,
  dragonScarsClearMissions,
};

export const dragonScarsMissions = [
  ...dragonScarsHuntMissions,
  ...dragonScarsScoutMissions,
  ...dragonScarsGatherMissions,
  ...dragonScarsClearMissions,
];

export const dragonScarsStats = {
  total: 12,
  byType: { hunt: 4, scout: 3, gather: 3, clear: 2 },
  byRarity: { common: 0, uncommon: 0, rare: 4, epic: 5, legendary: 3 },
  byDifficulty: { easy: 0, normal: 0, hard: 0, extreme: 12 },
};

export default dragonScarsMissions;
