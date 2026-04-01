/**
 * Миссии сбора ресурсов для локации "Пепельные Пустоши"
 */

import type { MissionTemplate } from '../../missions/_mission-template';

export const gatherObsidianUncommon: MissionTemplate = {
  id: 'ash_wastes_gather_obsidian_1',
  locationId: 'ash_wastes',
  type: 'gather',
  rarity: 'uncommon',
  difficulty: 'hard',
  name: 'Стекло вулкана',
  description: `Обсидиан — вулканическое стекло, образующееся при быстром остывании лавы. Искатели платят хорошо за качественные образцы. Но добывать их приходится рядом с раскалёнными трещинами.`,
  objective: 'Собрать обсидиан (1-4)',
  client: { name: 'Искатель обсидиана', type: 'merchant', description: 'Скупает вулканическое стекло' },
  duration: { base: 5400, variance: 0.2, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 25, variance: 0.1, perDifficulty: 12, perRarity: 6 },
    deposit: { base: 50, variance: 0.1, perDifficulty: 25, perRarity: 13 },
  },
  reward: {
    gold: { base: 160, variance: 0.25, perDifficulty: 80, perRarity: 40 },
    glory: { base: 8, variance: 0, perDifficulty: 4, perRarity: 3 },
    experience: { base: 60, variance: 0.1, perDifficulty: 30, perRarity: 15 },
    warSoul: { base: 28, variance: 0.2, perDifficulty: 14, perRarity: 9 },
  },
  resources: [
    { materialId: 'obsidian', quantity: { base: 2, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
  ],
  isRepeatable: true,
  cooldownHours: 10,
};

export const gatherRareMaterialsRare: MissionTemplate = {
  id: 'ash_wastes_gather_rare_1',
  locationId: 'ash_wastes',
  type: 'gather',
  rarity: 'rare',
  difficulty: 'extreme',
  name: 'Огненный камень',
  description: `Огненный камень и вулканическое стекло редкого качества — материалы, образующиеся только в самых горячих местах пустоши. Кузнец огня платит за них целое состояние.`,
  objective: 'Найти огненный камень (1-2) и редкий обсидиан (1-3)',
  client: { name: 'Кузнец огня Игнис', type: 'merchant', description: 'Создаёт огненное оружие' },
  duration: { base: 7200, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 38, variance: 0.1, perDifficulty: 19, perRarity: 10 },
    deposit: { base: 75, variance: 0.1, perDifficulty: 38, perRarity: 19 },
  },
  reward: {
    gold: { base: 280, variance: 0.25, perDifficulty: 140, perRarity: 70 },
    glory: { base: 14, variance: 0, perDifficulty: 7, perRarity: 5 },
    experience: { base: 100, variance: 0.1, perDifficulty: 50, perRarity: 25 },
    warSoul: { base: 48, variance: 0.2, perDifficulty: 24, perRarity: 16 },
  },
  resources: [
    { materialId: 'fire_stone', quantity: { base: 1, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
    { materialId: 'volcanic_glass', quantity: { base: 2, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
  ],
  enemies: { types: ['fire_elemental'], count: { base: 2, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 1 },
  isRepeatable: true,
  cooldownHours: 14,
};

export const gatherPrimordialAmberEpic: MissionTemplate = {
  id: 'ash_wastes_gather_amber_1',
  locationId: 'ash_wastes',
  type: 'gather',
  rarity: 'epic',
  difficulty: 'extreme',
  name: 'Первородный янтарь',
  description: `Первородный янтарь — застывший сок мира, существовавший до начала времён. Он хранит в себе огонь первого пламени. Найти его можно только в сердце вулкана.`,
  objective: 'Добывать первородный янтарь (1)',
  client: { name: 'Древний друид', type: 'scholar', description: 'Ищёт древние материалы' },
  duration: { base: 9000, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 50, variance: 0.1, perDifficulty: 25, perRarity: 13 },
    deposit: { base: 100, variance: 0.1, perDifficulty: 50, perRarity: 25 },
  },
  reward: {
    gold: { base: 520, variance: 0.25, perDifficulty: 260, perRarity: 130 },
    glory: { base: 28, variance: 0, perDifficulty: 14, perRarity: 9 },
    experience: { base: 170, variance: 0.1, perDifficulty: 85, perRarity: 43 },
    warSoul: { base: 90, variance: 0.2, perDifficulty: 45, perRarity: 30 },
  },
  resources: [
    { materialId: 'primordial_amber', quantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 } },
  ],
  enemies: { types: ['lava_worm', 'fire_elemental'], count: { base: 3, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 2 },
  isRepeatable: true,
  cooldownHours: 20,
};

export const ashWastesGatherMissions: MissionTemplate[] = [
  gatherObsidianUncommon,
  gatherRareMaterialsRare,
  gatherPrimordialAmberEpic,
];
