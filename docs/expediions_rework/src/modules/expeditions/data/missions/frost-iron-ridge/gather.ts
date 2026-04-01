/**
 * Миссии сбора ресурсов для локации "Кряж Морозного Железа"
 */

import type { MissionTemplate } from '../../missions/_mission-template';

export const gatherColdIronUncommon: MissionTemplate = {
  id: 'frost_iron_gather_cold_1',
  locationId: 'frost_iron_ridge',
  type: 'gather',
  rarity: 'uncommon',
  difficulty: 'hard',
  name: 'Холодное железо',
  description: `Холодное железо — металл, добываемый только в этих местах. Он сохраняет холод после закалки и идеально подходит для оружия против магических существ. Кузнец Торин платит хорошо за каждую единицу.`,
  objective: 'Добыть холодное железо (2-5)',
  client: { name: 'Кузнец морозного железа Торин', type: 'merchant', description: 'Скупает весь металл' },
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
    { materialId: 'cold_iron_ore', quantity: { base: 2, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
  ],
  isRepeatable: true,
  cooldownHours: 10,
};

export const gatherFrostMaterialsRare: MissionTemplate = {
  id: 'frost_iron_gather_frost_1',
  locationId: 'frost_iron_ridge',
  type: 'gather',
  rarity: 'rare',
  difficulty: 'extreme',
  name: 'Мороз и кристаллы',
  description: `Морозное железо и замороженные кристаллы — редчайшие материалы, образующиеся только в самых холодных местах хребта. Добыча их смертельно опасна, но ценность несравненна.`,
  objective: 'Найти морозное железо (1-3) и замороженные кристаллы (1-2)',
  client: { name: 'Кузнец морозного железа Торин', type: 'merchant', description: 'Нужны редкие материалы' },
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
  enemies: { types: ['ice_elemental'], count: { base: 2, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 1 },
  resources: [
    { materialId: 'frost_iron', quantity: { base: 1, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
    { materialId: 'frozen_crystals', quantity: { base: 1, variance: 0.3, perDifficulty: 0, perRarity: 1 } },
  ],
  isRepeatable: true,
  cooldownHours: 14,
};

export const gatherPrimordialIceEpic: MissionTemplate = {
  id: 'frost_iron_gather_primordial_1',
  locationId: 'frost_iron_ridge',
  type: 'gather',
  rarity: 'epic',
  difficulty: 'extreme',
  name: 'Первозданный лёд',
  description: `Первозданный лёд — лёд, который никогда не таял с момента создания мира. Он хранит в себе холод первой зимы. Найти его можно только в глубочайших пещерах ледника, куда даже элементали боятся заходить.`,
  objective: 'Добывать первозданный лёд (1)',
  client: { name: 'Древний друид', type: 'scholar', description: 'Ищет древние материалы' },
  duration: { base: 9000, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 50, variance: 0.1, perDifficulty: 25, perRarity: 13 },
    deposit: { base: 100, variance: 0.1, perDifficulty: 50, perRarity: 25 },
  },
  reward: {
    gold: { base: 500, variance: 0.25, perDifficulty: 250, perRarity: 125 },
    glory: { base: 25, variance: 0, perDifficulty: 13, perRarity: 8 },
    experience: { base: 160, variance: 0.1, perDifficulty: 80, perRarity: 40 },
    warSoul: { base: 85, variance: 0.2, perDifficulty: 43, perRarity: 28 },
  },
  enemies: { types: ['frost_giant', 'ice_elemental'], count: { base: 3, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 2 },
  resources: [
    { materialId: 'primordial_ice', quantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 } },
  ],
  isRepeatable: true,
  cooldownHours: 20,
};

export const frostIronRidgeGatherMissions: MissionTemplate[] = [
  gatherColdIronUncommon,
  gatherFrostMaterialsRare,
  gatherPrimordialIceEpic,
];
