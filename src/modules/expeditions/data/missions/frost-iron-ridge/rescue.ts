/**
 * Миссии спасения для локации "Кряж Морозного Железа"
 */

import type { MissionTemplate } from '../../missions/_mission-template';

export const rescueFrozenClimbersRare: MissionTemplate = {
  id: 'frost_iron_rescue_climbers_1',
  locationId: 'frost_iron_ridge',
  type: 'rescue',
  rarity: 'rare',
  difficulty: 'extreme',
  name: 'Замурованные во льду',
  description: `Группа альпинистов попала в пургу и укрылась в ледяной пещере. Но вход завалило, и они не могут выбраться. Их крики слышны через лёд, но времени мало — холод убьёт их через несколько часов.`,
  objective: 'Пробиться к пещере и вывести альпинистов',
  client: { name: 'Горный проводник Торн', type: 'commoner', description: 'Организовал спасательную операцию' },
  duration: { base: 5400, variance: 0.25, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 32, variance: 0.1, perDifficulty: 16, perRarity: 8 },
    deposit: { base: 65, variance: 0.1, perDifficulty: 32, perRarity: 16 },
  },
  reward: {
    gold: { base: 220, variance: 0.2, perDifficulty: 110, perRarity: 55 },
    glory: { base: 14, variance: 0, perDifficulty: 7, perRarity: 5 },
    experience: { base: 85, variance: 0.1, perDifficulty: 43, perRarity: 21 },
    warSoul: { base: 40, variance: 0.2, perDifficulty: 20, perRarity: 13 },
  },
  enemies: { types: ['white_wolf', 'frozen_traveler'], count: { base: 2, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 0 },
  isRepeatable: true,
  cooldownHours: 12,
};

export const rescueLostMinerEpic: MissionTemplate = {
  id: 'frost_iron_rescue_miner_1',
  locationId: 'frost_iron_ridge',
  type: 'rescue',
  rarity: 'epic',
  difficulty: 'extreme',
  name: 'Глубина ледника',
  description: `Старый горняк спустился в ледяные пещеры, чтобы показать дорогу к древним штольням, и не вернулся. Его голос доносится из глубины — он жив, но окружён элементалями. Нужно спуститься и вывести его.`,
  objective: 'Спуститься в пещеры и спасти старого горняка',
  client: { name: 'Кузнец морозного железа Торин', type: 'merchant', description: 'Горняк — его старый друг' },
  duration: { base: 7200, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 45, variance: 0.1, perDifficulty: 22, perRarity: 12 },
    deposit: { base: 90, variance: 0.1, perDifficulty: 45, perRarity: 22 },
  },
  reward: {
    gold: { base: 350, variance: 0.2, perDifficulty: 175, perRarity: 88 },
    glory: { base: 20, variance: 0, perDifficulty: 10, perRarity: 7 },
    experience: { base: 120, variance: 0.1, perDifficulty: 60, perRarity: 30 },
    warSoul: { base: 60, variance: 0.2, perDifficulty: 30, perRarity: 20 },
  },
  enemies: { types: ['ice_elemental', 'frost_giant'], count: { base: 4, variance: 0.25, perDifficulty: 2, perRarity: 0 }, levelBonus: 2 },
  isRepeatable: true,
  cooldownHours: 16,
};

export const frostIronRidgeRescueMissions: MissionTemplate[] = [
  rescueFrozenClimbersRare,
  rescueLostMinerEpic,
];
