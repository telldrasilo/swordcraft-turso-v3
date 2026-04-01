/**
 * Миссии разведки для локации "Кряж Морозного Железа"
 */

import type { MissionTemplate } from '../../missions/_mission-template';

export const scoutPassUncommon: MissionTemplate = {
  id: 'frost_iron_scout_pass_1',
  locationId: 'frost_iron_ridge',
  type: 'scout',
  rarity: 'uncommon',
  difficulty: 'hard',
  name: 'Тропа через лёд',
  description: `Горный проводник хочет найти новый перевал через хребет. Старый путь завален лавиной. Нужно исследовать южные склоны и отметить возможные маршруты.`,
  objective: 'Исследовать и отметить безопасный перевал',
  client: { name: 'Горный проводник Торн', type: 'commoner', description: 'Ищет новые маршруты' },
  duration: { base: 5400, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 25, variance: 0.1, perDifficulty: 12, perRarity: 6 },
    deposit: { base: 50, variance: 0.1, perDifficulty: 25, perRarity: 13 },
  },
  reward: {
    gold: { base: 140, variance: 0.2, perDifficulty: 70, perRarity: 35 },
    glory: { base: 7, variance: 0, perDifficulty: 4, perRarity: 2 },
    experience: { base: 55, variance: 0.1, perDifficulty: 28, perRarity: 14 },
    warSoul: { base: 24, variance: 0.2, perDifficulty: 12, perRarity: 8 },
  },
  isRepeatable: true,
  cooldownHours: 10,
};

export const scoutIceCavesRare: MissionTemplate = {
  id: 'frost_iron_scout_caves_1',
  locationId: 'frost_iron_ridge',
  type: 'scout',
  rarity: 'rare',
  difficulty: 'extreme',
  name: 'Ледяные пещеры',
  description: `Старый горняк рассказывает о пещерах в глубине ледника, где древние добывали первозданный лёд. Говорят, там можно найти Сердце зимы — место, где время остановилось.`,
  objective: 'Найти вход в ледяные пещеры и отметить путь',
  client: { name: 'Старый горняк', type: 'commoner', description: 'Последний из древней артели' },
  duration: { base: 7200, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 38, variance: 0.1, perDifficulty: 19, perRarity: 10 },
    deposit: { base: 75, variance: 0.1, perDifficulty: 38, perRarity: 19 },
  },
  reward: {
    gold: { base: 250, variance: 0.2, perDifficulty: 125, perRarity: 63 },
    glory: { base: 14, variance: 0, perDifficulty: 7, perRarity: 5 },
    experience: { base: 95, variance: 0.1, perDifficulty: 48, perRarity: 24 },
    warSoul: { base: 45, variance: 0.2, perDifficulty: 23, perRarity: 15 },
  },
  enemies: { types: ['ice_elemental', 'frozen_traveler'], count: { base: 2, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 1 },
  isRepeatable: true,
  cooldownHours: 14,
};

export const scoutForgeRare: MissionTemplate = {
  id: 'frost_iron_scout_forge_1',
  locationId: 'frost_iron_ridge',
  type: 'scout',
  rarity: 'rare',
  difficulty: 'extreme',
  name: 'Ледяная кузница',
  description: `Кузнец Торин мечтает найти легендарную Ледяную кузницу — место, где древние ковали морозное железо. Говорят, она находится в самом холодном месте хребта.`,
  objective: 'Найти Ледяную кузницу',
  client: { name: 'Кузнец морозного железа Торин', type: 'merchant', description: 'Хочет узнать секреты древних' },
  duration: { base: 7200, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 40, variance: 0.1, perDifficulty: 20, perRarity: 10 },
    deposit: { base: 80, variance: 0.1, perDifficulty: 40, perRarity: 20 },
  },
  reward: {
    gold: { base: 280, variance: 0.2, perDifficulty: 140, perRarity: 70 },
    glory: { base: 16, variance: 0, perDifficulty: 8, perRarity: 5 },
    experience: { base: 100, variance: 0.1, perDifficulty: 50, perRarity: 25 },
    warSoul: { base: 50, variance: 0.2, perDifficulty: 25, perRarity: 17 },
  },
  enemies: { types: ['ice_elemental', 'frost_giant'], count: { base: 2, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 2 },
  isRepeatable: true,
  cooldownHours: 16,
};

export const frostIronRidgeScoutMissions: MissionTemplate[] = [
  scoutPassUncommon,
  scoutIceCavesRare,
  scoutForgeRare,
];
