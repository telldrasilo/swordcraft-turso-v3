/**
 * Боевые миссии для локации "Кряж Морозного Железа"
 *
 * Враги:
 * - Белый волк (white_wolf) [5-8 ур., стаи 4-6]
 * - Замёрзший путник (frozen_traveler) [6-9 ур.]
 * - Ледяной элементаль (ice_elemental) [7-11 ур.]
 * - Морозный великан (frost_giant) [9-13 ур.]
 */

import type { MissionTemplate } from '../../missions/_mission-template';

export const huntWhiteWolvesUncommon: MissionTemplate = {
  id: 'frost_iron_hunt_wolves_1',
  locationId: 'frost_iron_ridge',
  type: 'hunt',
  rarity: 'uncommon',
  difficulty: 'hard',
  name: 'Белые хищники',
  description: `Стая белых волков охотится на южных склонах хребта. Эти звери больше и злее своих лесных собратьев — они приспособились к вечному холоду. Горный проводник просит зачистить территорию, чтобы можно было безопасно вести караваны через перевал.`,
  objective: 'Уничтожить 5-7 белых волков из стаи',
  client: { name: 'Горный проводник Торн', type: 'commoner', description: 'Водит караваны через перевал' },
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
  enemies: { types: ['white_wolf'], count: { base: 5, variance: 0.2, perDifficulty: 2, perRarity: 0 }, levelBonus: 1 },
  isRepeatable: true,
  cooldownHours: 10,
};

export const huntFrozenTravelersRare: MissionTemplate = {
  id: 'frost_iron_hunt_travelers_1',
  locationId: 'frost_iron_ridge',
  type: 'hunt',
  rarity: 'rare',
  difficulty: 'hard',
  name: 'Замёрзшие души',
  description: `Духи погибших путников бродят по ледяным тропам, заманивая живых в ловушки. Ледяной отшельник говорит, что они не могут уйти, пока кто-то не освободит их — разрушив лёд, в котором они заключены.`,
  objective: 'Уничтожить 4-6 замёрзших путников',
  client: { name: 'Ледяной отшельник Край', type: 'scholar', description: 'Живёт в пещере, изучает лёд' },
  duration: { base: 5400, variance: 0.25, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 30, variance: 0.1, perDifficulty: 15, perRarity: 8 },
    deposit: { base: 60, variance: 0.1, perDifficulty: 30, perRarity: 15 },
  },
  reward: {
    gold: { base: 200, variance: 0.2, perDifficulty: 100, perRarity: 50 },
    glory: { base: 12, variance: 0, perDifficulty: 6, perRarity: 4 },
    experience: { base: 80, variance: 0.1, perDifficulty: 40, perRarity: 20 },
    warSoul: { base: 38, variance: 0.2, perDifficulty: 19, perRarity: 13 },
  },
  enemies: { types: ['frozen_traveler'], count: { base: 4, variance: 0.25, perDifficulty: 2, perRarity: 0 }, levelBonus: 1 },
  isRepeatable: true,
  cooldownHours: 12,
};

export const huntIceElementalsRare: MissionTemplate = {
  id: 'frost_iron_hunt_elementals_1',
  locationId: 'frost_iron_ridge',
  type: 'hunt',
  rarity: 'rare',
  difficulty: 'extreme',
  name: 'Дети холода',
  description: `Ледяные элементали — существа из чистого холода — охраняют шахты морозного железа. Кузнец Торин хочет возобновить добычу, но не может приблизиться к залежам. Нужно уничтожить элементалей, чтобы открыть доступ к металлу.`,
  objective: 'Уничтожить 3-5 ледяных элементалей',
  client: { name: 'Кузнец морозного железа Торин', type: 'merchant', description: 'Работает с холодным металлом' },
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
  enemies: { types: ['ice_elemental'], count: { base: 3, variance: 0.3, perDifficulty: 2, perRarity: 0 }, levelBonus: 2 },
  isRepeatable: true,
  cooldownHours: 14,
};

export const huntFrostGiantEpic: MissionTemplate = {
  id: 'frost_iron_hunt_giant_1',
  locationId: 'frost_iron_ridge',
  type: 'hunt',
  rarity: 'epic',
  difficulty: 'extreme',
  name: 'Страж вершин',
  description: `Морозный великан — древний страж гор, пробудившийся от тысячелетнего сна. Он бросает ледяные глыбы на всё, что движется по склонам. Дух горы просит успокоить великана — он не зло, просто не понимает, что мир изменился.`,
  objective: 'Победить морозного великана',
  client: { name: 'Дух горы', type: 'scholar', description: 'Древний дух, хранитель хребта' },
  duration: { base: 9000, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 50, variance: 0.1, perDifficulty: 25, perRarity: 13 },
    deposit: { base: 100, variance: 0.1, perDifficulty: 50, perRarity: 25 },
  },
  reward: {
    gold: { base: 450, variance: 0.2, perDifficulty: 225, perRarity: 113 },
    glory: { base: 25, variance: 0, perDifficulty: 13, perRarity: 8 },
    experience: { base: 150, variance: 0.1, perDifficulty: 75, perRarity: 38 },
    warSoul: { base: 80, variance: 0.2, perDifficulty: 40, perRarity: 27 },
  },
  enemies: { types: ['frost_giant', 'ice_elemental', 'ice_elemental'], count: { base: 4, variance: 0.25, perDifficulty: 2, perRarity: 0 }, levelBonus: 3 },
  isRepeatable: true,
  cooldownHours: 20,
};

export const frostIronRidgeHuntMissions: MissionTemplate[] = [
  huntWhiteWolvesUncommon,
  huntFrozenTravelersRare,
  huntIceElementalsRare,
  huntFrostGiantEpic,
];
