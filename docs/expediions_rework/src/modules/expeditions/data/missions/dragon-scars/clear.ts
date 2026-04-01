/**
 * Миссии зачистки для локации "Драконьи Шрамы"
 */

import type { MissionTemplate } from '../../missions/_mission-template';

export const clearCultistNestEpic: MissionTemplate = {
  id: 'dragon_scars_clear_cultists_1',
  locationId: 'dragon_scars',
  type: 'clear',
  rarity: 'epic',
  difficulty: 'extreme',
  name: 'Гнездо культа',
  description: `Драконьи культисты обосновались в древнем храме. Они готовят ритуал пробуждения Последнего, что приведёт к катастрофе. Дух дракона просит остановить их.`,
  objective: 'Зачистить храм культистов',
  client: { name: 'Дух дракона', type: 'scholar', description: 'Хочет покоя для сородича' },
  duration: { base: 9000, variance: 0.25, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 50, variance: 0.1, perDifficulty: 25, perRarity: 13 },
    deposit: { base: 100, variance: 0.1, perDifficulty: 50, perRarity: 25 },
  },
  reward: {
    gold: { base: 480, variance: 0.2, perDifficulty: 240, perRarity: 120 },
    glory: { base: 26, variance: 0, perDifficulty: 13, perRarity: 9 },
    experience: { base: 165, variance: 0.1, perDifficulty: 83, perRarity: 41 },
    warSoul: { base: 90, variance: 0.2, perDifficulty: 45, perRarity: 30 },
  },
  enemies: { types: ['dragon_cultist', 'dragon_cultist', 'drake'], count: { base: 6, variance: 0.2, perDifficulty: 2, perRarity: 0 }, levelBonus: 2 },
  isRepeatable: true,
  cooldownHours: 18,
};

export const clearWyvernCliffsLegendary: MissionTemplate = {
  id: 'dragon_scars_clear_wyverns_1',
  locationId: 'dragon_scars',
  type: 'clear',
  rarity: 'legendary',
  difficulty: 'extreme',
  name: 'Утёсы виверн',
  description: `Утёсы на севере хребта — гнездовье сотен виверн. Они делают невозможным любой проход. Выживший охотник просит зачистить территорию раз и навсегда.`,
  objective: 'Зачистить гнездовье виверн',
  client: { name: 'Выживший охотник', type: 'commoner', description: 'Потерял там друзей' },
  duration: { base: 10800, variance: 0.25, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 62, variance: 0.1, perDifficulty: 31, perRarity: 16 },
    deposit: { base: 125, variance: 0.1, perDifficulty: 63, perRarity: 31 },
  },
  reward: {
    gold: { base: 620, variance: 0.2, perDifficulty: 310, perRarity: 155 },
    glory: { base: 34, variance: 0, perDifficulty: 17, perRarity: 11 },
    experience: { base: 200, variance: 0.1, perDifficulty: 100, perRarity: 50 },
    warSoul: { base: 115, variance: 0.2, perDifficulty: 58, perRarity: 38 },
  },
  enemies: { types: ['wyvern', 'wyvern', 'wyvern', 'drake'], count: { base: 8, variance: 0.2, perDifficulty: 2, perRarity: 0 }, levelBonus: 2 },
  isRepeatable: true,
  cooldownHours: 22,
};

export const dragonScarsClearMissions: MissionTemplate[] = [
  clearCultistNestEpic,
  clearWyvernCliffsLegendary,
];
