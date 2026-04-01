/**
 * Боевые миссии для локации "Пепельные Пустоши"
 *
 * Враги:
 * - Обгоревший призрак (burned_ghost) [6-9 ур.]
 * - Огненный элементаль (fire_elemental) [7-11 ур.]
 * - Пепельный голем (ash_golem) [8-12 ур.]
 * - Лавовый червь (lava_worm) [9-13 ур.]
 */

import type { MissionTemplate } from '../../missions/_mission-template';

export const huntBurnedGhostsUncommon: MissionTemplate = {
  id: 'ash_wastes_hunt_ghosts_1',
  locationId: 'ash_wastes',
  type: 'hunt',
  rarity: 'uncommon',
  difficulty: 'hard',
  name: 'Души огня',
  description: `Обгоревшие призраки — души погибших в вулканической катастрофе — бродят по пустоши, нападая на всех живых. Кузнец огня Игнис просит зачистить территорию вокруг его кузни.`,
  objective: 'Уничтожить 4-6 обгоревших призраков',
  client: { name: 'Кузнец огня Игнис', type: 'merchant', description: 'Работает с вулканическими материалами' },
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
  enemies: { types: ['burned_ghost'], count: { base: 4, variance: 0.25, perDifficulty: 2, perRarity: 0 }, levelBonus: 1 },
  isRepeatable: true,
  cooldownHours: 10,
};

export const huntFireElementalsRare: MissionTemplate = {
  id: 'ash_wastes_hunt_elementals_1',
  locationId: 'ash_wastes',
  type: 'hunt',
  rarity: 'rare',
  difficulty: 'extreme',
  name: 'Дети пламени',
  description: `Огненные элементали вырываются из раскалённых трещин в земле. Они сжигают всё на своём пути. Искатель обсидиана просит уничтожить их, чтобы можно было безопасно добывать вулканическое стекло.`,
  objective: 'Уничтожить 3-5 огненных элементалей',
  client: { name: 'Искатель обсидиана', type: 'merchant', description: 'Добывает редкие материалы' },
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
  enemies: { types: ['fire_elemental'], count: { base: 3, variance: 0.3, perDifficulty: 2, perRarity: 0 }, levelBonus: 2 },
  isRepeatable: true,
  cooldownHours: 14,
};

export const huntAshGolemsRare: MissionTemplate = {
  id: 'ash_wastes_hunt_golems_1',
  locationId: 'ash_wastes',
  type: 'hunt',
  rarity: 'rare',
  difficulty: 'extreme',
  name: 'Стражи пепла',
  description: `Пепельные големы — ожившие кучи пепла — охраняют руины погребённого города. Они нападают на любого, кто приближается. Дух катастрофы просит уничтожить их, чтобы дать покой душам.`,
  objective: 'Уничтожить 3-4 пепельных големов',
  client: { name: 'Дух катастрофы', type: 'scholar', description: 'Хочет предупредить о будущем' },
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
  enemies: { types: ['ash_golem'], count: { base: 3, variance: 0.25, perDifficulty: 1, perRarity: 0 }, levelBonus: 2 },
  isRepeatable: true,
  cooldownHours: 14,
};

export const huntLavaWormEpic: MissionTemplate = {
  id: 'ash_wastes_hunt_worm_1',
  locationId: 'ash_wastes',
  type: 'hunt',
  rarity: 'epic',
  difficulty: 'extreme',
  name: 'Червь из магмы',
  description: `Лавовый червь — существо из чистой магмы — обитает в самом горячем месте пустоши. Он вырывается на поверхность и пожирает всё живое. Безумный пророк говорит, что это предвестник нового извержения.`,
  objective: 'Победить лавового червя',
  client: { name: 'Безумный пророк', type: 'scholar', description: 'Говорит о возвращении огня' },
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
  enemies: { types: ['lava_worm', 'fire_elemental', 'fire_elemental'], count: { base: 4, variance: 0.25, perDifficulty: 2, perRarity: 0 }, levelBonus: 3 },
  isRepeatable: true,
  cooldownHours: 20,
};

export const ashWastesHuntMissions: MissionTemplate[] = [
  huntBurnedGhostsUncommon,
  huntFireElementalsRare,
  huntAshGolemsRare,
  huntLavaWormEpic,
];
