/**
 * Миссии расследования для локации "Пепельные Пустоши"
 */

import type { MissionTemplate } from '../../missions/_mission-template';

export const investigateLibraryRare: MissionTemplate = {
  id: 'ash_wastes_investigate_library_1',
  locationId: 'ash_wastes',
  type: 'investigate',
  rarity: 'rare',
  difficulty: 'extreme',
  name: 'Библиотека Ириса',
  description: `Безумный пророк говорит о библиотеке погребённого города — там хранятся знания о Сердце вулкана и способе предотвратить следующее извержение. Нужно проникнуть в руины и найти записи.`,
  objective: 'Исследовать руины библиотеки и найти древние записи',
  client: { name: 'Безумный пророк', type: 'scholar', description: 'Хочет предотвратить катастрофу' },
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
  enemies: { types: ['ash_golem', 'burned_ghost'], count: { base: 3, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 1 },
  isRepeatable: true,
  cooldownHours: 14,
};

export const investigateSurvivorsEpic: MissionTemplate = {
  id: 'ash_wastes_investigate_survivors_1',
  locationId: 'ash_wastes',
  type: 'investigate',
  rarity: 'epic',
  difficulty: 'extreme',
  name: 'Те, кто выжили',
  description: `Дух катастрофы говорит, что жители Ириса не погибли — они нашли способ пережить извержение, превратив себя в нечто иное. Нужно найти доказательства этого и понять, чем они стали.`,
  objective: 'Расследовать судьбу жителей погребённого города',
  client: { name: 'Дух катастрофы', type: 'scholar', description: 'Хочет узнать правду' },
  duration: { base: 9000, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 48, variance: 0.1, perDifficulty: 24, perRarity: 12 },
    deposit: { base: 95, variance: 0.1, perDifficulty: 48, perRarity: 24 },
  },
  reward: {
    gold: { base: 400, variance: 0.2, perDifficulty: 200, perRarity: 100 },
    glory: { base: 22, variance: 0, perDifficulty: 11, perRarity: 7 },
    experience: { base: 140, variance: 0.1, perDifficulty: 70, perRarity: 35 },
    warSoul: { base: 70, variance: 0.2, perDifficulty: 35, perRarity: 23 },
  },
  enemies: { types: ['ash_golem', 'lava_worm'], count: { base: 3, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 2 },
  isRepeatable: true,
  cooldownHours: 18,
};

export const ashWastesInvestigateMissions: MissionTemplate[] = [
  investigateLibraryRare,
  investigateSurvivorsEpic,
];
