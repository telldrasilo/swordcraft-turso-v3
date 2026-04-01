/**
 * Боевые миссии для локации "Шепчущий Лес"
 *
 * Враги:
 * - Одержимый путник (possessed_traveler) [6-9 ур.]
 * - Древесный дух (tree_spirit) [7-11 ур.]
 * - Шепчущая тень (whispering_shadow) [8-12 ур.]
 * - Корневой страж (root_guardian) [9-13 ур.]
 */

import type { MissionTemplate } from '../../missions/_mission-template';

export const huntPossessedUncommon: MissionTemplate = {
  id: 'whispering_forest_hunt_possessed_1',
  locationId: 'whispering_forest',
  type: 'hunt',
  rarity: 'uncommon',
  difficulty: 'hard',
  name: 'Одержимые голосами',
  description: `Одержимые путники — люди, сошедшие с ума от шёпота деревьев. Они бродят по лесу, нападая на всех, кого встретят. Древний друид просит зачистить территорию, чтобы дать им покой.`,
  objective: 'Уничтожить 4-6 одержимых путников',
  client: { name: 'Древний друид Элара', type: 'scholar', description: 'Защищает от голосов' },
  duration: { base: 5400, variance: 0.2, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 25, variance: 0.1, perDifficulty: 12, perRarity: 6 },
    deposit: { base: 50, variance: 0.1, perDifficulty: 25, perRarity: 13 },
  },
  reward: {
    gold: { base: 150, variance: 0.2, perDifficulty: 75, perRarity: 38 },
    glory: { base: 8, variance: 0, perDifficulty: 4, perRarity: 3 },
    experience: { base: 60, variance: 0.1, perDifficulty: 30, perRarity: 15 },
    warSoul: { base: 28, variance: 0.2, perDifficulty: 14, perRarity: 9 },
  },
  enemies: { types: ['possessed_traveler'], count: { base: 4, variance: 0.25, perDifficulty: 2, perRarity: 0 }, levelBonus: 1 },
  isRepeatable: true,
  cooldownHours: 10,
};

export const huntTreeSpiritsRare: MissionTemplate = {
  id: 'whispering_forest_hunt_spirits_1',
  locationId: 'whispering_forest',
  type: 'hunt',
  rarity: 'rare',
  difficulty: 'extreme',
  name: 'Духи коры',
  description: `Древесные духи — существа из коры и листьев — охраняют лес от вторжения. Они атакуют любого, кто приближается к древним деревьям. Искатель тишины хочет пройти к центру.`,
  objective: 'Уничтожить 3-5 древесных духов',
  client: { name: 'Искатель тишины', type: 'scholar', description: 'Ищет путь к центру' },
  duration: { base: 7200, variance: 0.25, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 38, variance: 0.1, perDifficulty: 19, perRarity: 10 },
    deposit: { base: 75, variance: 0.1, perDifficulty: 38, perRarity: 19 },
  },
  reward: {
    gold: { base: 280, variance: 0.2, perDifficulty: 140, perRarity: 70 },
    glory: { base: 16, variance: 0, perDifficulty: 8, perRarity: 5 },
    experience: { base: 100, variance: 0.1, perDifficulty: 50, perRarity: 25 },
    warSoul: { base: 50, variance: 0.2, perDifficulty: 25, perRarity: 17 },
  },
  enemies: { types: ['tree_spirit'], count: { base: 3, variance: 0.3, perDifficulty: 2, perRarity: 0 }, levelBonus: 2 },
  isRepeatable: true,
  cooldownHours: 14,
};

export const huntWhisperingShadowsRare: MissionTemplate = {
  id: 'whispering_forest_hunt_shadows_1',
  locationId: 'whispering_forest',
  type: 'hunt',
  rarity: 'rare',
  difficulty: 'extreme',
  name: 'Тени с голосами',
  description: `Шепчущие тени — призраки, повторяющие все голоса, которые когда-либо слышал лес. Они сводят людей с ума своими криками. Дух дерева-друга просит уничтожить их.`,
  objective: 'Уничтожить 3-4 шепчущие тени',
  client: { name: 'Дух дерева-друга', type: 'scholar', description: 'Помогает ориентироваться' },
  duration: { base: 7200, variance: 0.25, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 40, variance: 0.1, perDifficulty: 20, perRarity: 10 },
    deposit: { base: 80, variance: 0.1, perDifficulty: 40, perRarity: 20 },
  },
  reward: {
    gold: { base: 300, variance: 0.2, perDifficulty: 150, perRarity: 75 },
    glory: { base: 18, variance: 0, perDifficulty: 9, perRarity: 6 },
    experience: { base: 110, variance: 0.1, perDifficulty: 55, perRarity: 28 },
    warSoul: { base: 55, variance: 0.2, perDifficulty: 28, perRarity: 18 },
  },
  enemies: { types: ['whispering_shadow'], count: { base: 3, variance: 0.25, perDifficulty: 1, perRarity: 0 }, levelBonus: 2 },
  isRepeatable: true,
  cooldownHours: 14,
};

export const huntRootGuardianEpic: MissionTemplate = {
  id: 'whispering_forest_hunt_guardian_1',
  locationId: 'whispering_forest',
  type: 'hunt',
  rarity: 'epic',
  difficulty: 'extreme',
  name: 'Страж Первого Древа',
  description: `Корневой страж — древнее существо, защищающее подходы к Первому Древу. Он состоит из корней и земли, и его невозможно уничтожить обычным оружием. Друид просит освободить путь.`,
  objective: 'Победить корневого стража',
  client: { name: 'Древний друид Элара', type: 'scholar', description: 'Хочет говорить с Первым Древом' },
  duration: { base: 9000, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 50, variance: 0.1, perDifficulty: 25, perRarity: 13 },
    deposit: { base: 100, variance: 0.1, perDifficulty: 50, perRarity: 25 },
  },
  reward: {
    gold: { base: 480, variance: 0.2, perDifficulty: 240, perRarity: 120 },
    glory: { base: 25, variance: 0, perDifficulty: 13, perRarity: 8 },
    experience: { base: 160, variance: 0.1, perDifficulty: 80, perRarity: 40 },
    warSoul: { base: 80, variance: 0.2, perDifficulty: 40, perRarity: 27 },
  },
  enemies: { types: ['root_guardian', 'tree_spirit', 'tree_spirit'], count: { base: 4, variance: 0.25, perDifficulty: 2, perRarity: 0 }, levelBonus: 3 },
  isRepeatable: true,
  cooldownHours: 20,
};

export const whisperingForestHuntMissions: MissionTemplate[] = [
  huntPossessedUncommon,
  huntTreeSpiritsRare,
  huntWhisperingShadowsRare,
  huntRootGuardianEpic,
];
