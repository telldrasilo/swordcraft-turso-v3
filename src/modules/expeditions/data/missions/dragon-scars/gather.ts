/**
 * Миссии сбора ресурсов для локации "Драконьи Шрамы"
 */

import type { MissionTemplate } from '../../missions/_mission-template';

export const gatherDragonMaterialsRare: MissionTemplate = {
  id: 'dragon_scars_gather_materials_1',
  locationId: 'dragon_scars',
  type: 'gather',
  rarity: 'rare',
  difficulty: 'extreme',
  name: 'Кости и чешуя',
  description: `Драконья кость и чешуя — материалы, оставшиеся от древних драконов. Они scattered по всему хребту. Кузнец Драган платит невероятные суммы за них.`,
  objective: 'Найти драконью кость (1-3) и чешую (1-2)',
  client: { name: 'Кузнец драконьей кости Драган', type: 'merchant', description: 'Уникальный мастер' },
  duration: { base: 7200, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 40, variance: 0.1, perDifficulty: 20, perRarity: 10 },
    deposit: { base: 80, variance: 0.1, perDifficulty: 40, perRarity: 20 },
  },
  reward: {
    gold: { base: 350, variance: 0.25, perDifficulty: 175, perRarity: 88 },
    glory: { base: 18, variance: 0, perDifficulty: 9, perRarity: 6 },
    experience: { base: 130, variance: 0.1, perDifficulty: 65, perRarity: 33 },
    warSoul: { base: 68, variance: 0.2, perDifficulty: 34, perRarity: 23 },
  },
  enemies: { types: ['drake', 'wyvern'], count: { base: 2, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 1 },
  resources: [
    { materialId: 'dragon_bone', quantity: { base: 2, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
    { materialId: 'dragon_scale', quantity: { base: 1, variance: 0.3, perDifficulty: 0, perRarity: 1 } },
  ],
  isRepeatable: true,
  cooldownHours: 14,
};

export const gatherStarMetalEpic: MissionTemplate = {
  id: 'dragon_scars_gather_star_1',
  locationId: 'dragon_scars',
  type: 'gather',
  rarity: 'epic',
  difficulty: 'extreme',
  name: 'Звёздный металл',
  description: `Звёздный металл — материал, упавший с неба во время битвы богов. Он не существует нигде больше. Найти его можно только в кратерах на вершинах.`,
  objective: 'Добывать звёздный металл (1)',
  client: { name: 'Кузнец драконьей кости Драган', type: 'merchant', description: 'Мечтает о звёздном мече' },
  duration: { base: 9000, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 52, variance: 0.1, perDifficulty: 26, perRarity: 13 },
    deposit: { base: 105, variance: 0.1, perDifficulty: 53, perRarity: 26 },
  },
  reward: {
    gold: { base: 500, variance: 0.25, perDifficulty: 250, perRarity: 125 },
    glory: { base: 28, variance: 0, perDifficulty: 14, perRarity: 9 },
    experience: { base: 165, variance: 0.1, perDifficulty: 83, perRarity: 41 },
    warSoul: { base: 95, variance: 0.2, perDifficulty: 48, perRarity: 32 },
  },
  enemies: { types: ['fire_giant', 'ice_golem'], count: { base: 3, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 2 },
  resources: [
    { materialId: 'star_metal', quantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 } },
  ],
  isRepeatable: true,
  cooldownHours: 20,
};

export const gatherHeartOfFlameLegendary: MissionTemplate = {
  id: 'dragon_scars_gather_heart_1',
  locationId: 'dragon_scars',
  type: 'gather',
  rarity: 'legendary',
  difficulty: 'extreme',
  name: 'Сердце пламени',
  description: `Сердце пламени — застывший огонь древней битвы. Оно горело тысячи лет и не погаснет никогда. Найти его можно только в самом сердце хребта, где сходятся огонь и лёд.`,
  objective: 'Добывать сердце пламени (1)',
  client: { name: 'Дух дракона', type: 'scholar', description: 'Хочет вернуть часть силы' },
  duration: { base: 10800, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 65, variance: 0.1, perDifficulty: 33, perRarity: 16 },
    deposit: { base: 130, variance: 0.1, perDifficulty: 65, perRarity: 33 },
  },
  reward: {
    gold: { base: 700, variance: 0.25, perDifficulty: 350, perRarity: 175 },
    glory: { base: 40, variance: 0, perDifficulty: 20, perRarity: 13 },
    experience: { base: 220, variance: 0.1, perDifficulty: 110, perRarity: 55 },
    warSoul: { base: 135, variance: 0.2, perDifficulty: 68, perRarity: 45 },
  },
  enemies: { types: ['egg_guardian', 'fire_giant', 'drake'], count: { base: 4, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 3 },
  resources: [
    { materialId: 'heart_of_flame', quantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 } },
  ],
  isRepeatable: true,
  cooldownHours: 24,
};

export const dragonScarsGatherMissions: MissionTemplate[] = [
  gatherDragonMaterialsRare,
  gatherStarMetalEpic,
  gatherHeartOfFlameLegendary,
];
