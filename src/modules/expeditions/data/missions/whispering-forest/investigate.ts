/**
 * Миссии расследования для локации "Шепчущий Лес"
 */

import type { MissionTemplate } from '../../missions/_mission-template';

export const investigateVoicesRare: MissionTemplate = {
  id: 'whispering_forest_investigate_voices_1',
  locationId: 'whispering_forest',
  type: 'investigate',
  rarity: 'rare',
  difficulty: 'extreme',
  name: 'Природа голосов',
  description: `Искатель тишины хочет понять природу голосов леса. Он уверен, что это не просто звуки, а магия, проникающая в разум. Нужно собрать доказательства его теории.`,
  objective: 'Исследовать природу голосов и собрать доказательства',
  client: { name: 'Искатель тишины', type: 'scholar', description: 'Изучает феномен голосов' },
  duration: { base: 7200, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 38, variance: 0.1, perDifficulty: 19, perRarity: 10 },
    deposit: { base: 75, variance: 0.1, perDifficulty: 38, perRarity: 19 },
  },
  reward: {
    gold: { base: 260, variance: 0.2, perDifficulty: 130, perRarity: 65 },
    glory: { base: 15, variance: 0, perDifficulty: 8, perRarity: 5 },
    experience: { base: 100, variance: 0.1, perDifficulty: 50, perRarity: 25 },
    warSoul: { base: 48, variance: 0.2, perDifficulty: 24, perRarity: 16 },
  },
  enemies: { types: ['whispering_shadow', 'possessed_traveler'], count: { base: 2, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 1 },
  isRepeatable: true,
  cooldownHours: 14,
};

export const investigateFirstChildEpic: MissionTemplate = {
  id: 'whispering_forest_investigate_child_1',
  locationId: 'whispering_forest',
  type: 'investigate',
  rarity: 'epic',
  difficulty: 'extreme',
  name: 'Заблудший ребёнок',
  description: `Заблудший ребёнок в лесу слышит только хорошие голоса. Друид хочет понять, почему он особенный — возможно, это ключ к пониманию природы леса.`,
  objective: 'Исследовать связь ребёнка с лесом',
  client: { name: 'Древний друид Элара', type: 'scholar', description: 'Хочет защитить ребёнка' },
  duration: { base: 9000, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 48, variance: 0.1, perDifficulty: 24, perRarity: 12 },
    deposit: { base: 95, variance: 0.1, perDifficulty: 48, perRarity: 24 },
  },
  reward: {
    gold: { base: 420, variance: 0.2, perDifficulty: 210, perRarity: 105 },
    glory: { base: 22, variance: 0, perDifficulty: 11, perRarity: 7 },
    experience: { base: 145, variance: 0.1, perDifficulty: 73, perRarity: 36 },
    warSoul: { base: 75, variance: 0.2, perDifficulty: 38, perRarity: 25 },
  },
  enemies: { types: ['root_guardian', 'tree_spirit'], count: { base: 3, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 2 },
  isRepeatable: true,
  cooldownHours: 18,
};

export const whisperingForestInvestigateMissions: MissionTemplate[] = [
  investigateVoicesRare,
  investigateFirstChildEpic,
];
