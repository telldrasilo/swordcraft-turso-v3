/**
 * Боевые миссии для локации "Драконьи Шрамы"
 *
 * Враги:
 * - Драконий культст (dragon_cultist) [10-14 ур.]
 * - Виверна (wyvern) [9-13 ур.]
 * - Дрейк (drake) [10-14 ур.]
 * - Ледяной голем (ice_golem) [11-15 ур.]
 * - Огненный великан (fire_giant) [12-16 ур.]
 * - Страж яйца (egg_guardian) [13-17 ур.]
 */

import type { MissionTemplate } from '../../missions/_mission-template';

export const huntDrakesRare: MissionTemplate = {
  id: 'dragon_scars_hunt_drakes_1',
  locationId: 'dragon_scars',
  type: 'hunt',
  rarity: 'rare',
  difficulty: 'extreme',
  name: 'Младшие драконы',
  description: `Дрейки — младшие родственники драконов — правят небом над Драконьими Шрамами. Они нападают на всё, что движется. Выживший охотник просит проредить их популяцию.`,
  objective: 'Уничтожить 3-5 дрейков',
  client: { name: 'Выживший охотник', type: 'commoner', description: 'Знает повадки дрейков' },
  duration: { base: 7200, variance: 0.2, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 40, variance: 0.1, perDifficulty: 20, perRarity: 10 },
    deposit: { base: 80, variance: 0.1, perDifficulty: 40, perRarity: 20 },
  },
  reward: {
    gold: { base: 320, variance: 0.2, perDifficulty: 160, perRarity: 80 },
    glory: { base: 18, variance: 0, perDifficulty: 9, perRarity: 6 },
    experience: { base: 120, variance: 0.1, perDifficulty: 60, perRarity: 30 },
    warSoul: { base: 60, variance: 0.2, perDifficulty: 30, perRarity: 20 },
  },
  enemies: { types: ['drake'], count: { base: 3, variance: 0.3, perDifficulty: 2, perRarity: 0 }, levelBonus: 2 },
  isRepeatable: true,
  cooldownHours: 14,
};

export const huntWyvernsRare: MissionTemplate = {
  id: 'dragon_scars_hunt_wyverns_1',
  locationId: 'dragon_scars',
  type: 'hunt',
  rarity: 'rare',
  difficulty: 'extreme',
  name: 'Небесные хищники',
  description: `Виверны — летающие хищники, охотящиеся стаями. Они нападают на караваны и исследователей. Драконий исследователь хочет безопасно изучать регион.`,
  objective: 'Уничтожить 4-6 виверн',
  client: { name: 'Драконий исследователь', type: 'scholar', description: 'Изучает следы древних' },
  duration: { base: 7200, variance: 0.2, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 42, variance: 0.1, perDifficulty: 21, perRarity: 11 },
    deposit: { base: 85, variance: 0.1, perDifficulty: 43, perRarity: 21 },
  },
  reward: {
    gold: { base: 340, variance: 0.2, perDifficulty: 170, perRarity: 85 },
    glory: { base: 20, variance: 0, perDifficulty: 10, perRarity: 7 },
    experience: { base: 125, variance: 0.1, perDifficulty: 63, perRarity: 31 },
    warSoul: { base: 65, variance: 0.2, perDifficulty: 33, perRarity: 22 },
  },
  enemies: { types: ['wyvern'], count: { base: 4, variance: 0.25, perDifficulty: 2, perRarity: 0 }, levelBonus: 2 },
  isRepeatable: true,
  cooldownHours: 14,
};

export const huntFireGiantsEpic: MissionTemplate = {
  id: 'dragon_scars_hunt_giants_1',
  locationId: 'dragon_scars',
  type: 'hunt',
  rarity: 'epic',
  difficulty: 'extreme',
  name: 'Потомки огня',
  description: `Огненные великаны — потомки воинов древней битвы между драконами и богами. Они охраняют древние арсеналы. Дух дракона просит дать им покой.`,
  objective: 'Уничтожить 3-4 огненных великанов',
  client: { name: 'Дух дракона', type: 'scholar', description: 'Остаток сознания древнего' },
  duration: { base: 9000, variance: 0.25, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 52, variance: 0.1, perDifficulty: 26, perRarity: 13 },
    deposit: { base: 105, variance: 0.1, perDifficulty: 53, perRarity: 26 },
  },
  reward: {
    gold: { base: 450, variance: 0.2, perDifficulty: 225, perRarity: 113 },
    glory: { base: 25, variance: 0, perDifficulty: 13, perRarity: 8 },
    experience: { base: 155, variance: 0.1, perDifficulty: 78, perRarity: 39 },
    warSoul: { base: 85, variance: 0.2, perDifficulty: 43, perRarity: 28 },
  },
  enemies: { types: ['fire_giant'], count: { base: 3, variance: 0.25, perDifficulty: 1, perRarity: 0 }, levelBonus: 3 },
  isRepeatable: true,
  cooldownHours: 18,
};

export const huntEggGuardianLegendary: MissionTemplate = {
  id: 'dragon_scars_hunt_guardian_1',
  locationId: 'dragon_scars',
  type: 'hunt',
  rarity: 'legendary',
  difficulty: 'extreme',
  name: 'Страж гнезда',
  description: `Страж яйца — древнее существо, защищающее последнее драконье гнездо. Он не позволит никому приблизиться. Но Кузнец драконьей кости говорит, что гнездо давно пусто, а страж охраняет лишь воспоминания.`,
  objective: 'Победить стража яйца и его прислужников',
  client: { name: 'Кузнец драконьей кости Драган', type: 'merchant', description: 'Хочет изучить гнездо' },
  duration: { base: 10800, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 65, variance: 0.1, perDifficulty: 33, perRarity: 16 },
    deposit: { base: 130, variance: 0.1, perDifficulty: 65, perRarity: 33 },
  },
  reward: {
    gold: { base: 650, variance: 0.2, perDifficulty: 325, perRarity: 163 },
    glory: { base: 35, variance: 0, perDifficulty: 18, perRarity: 12 },
    experience: { base: 200, variance: 0.1, perDifficulty: 100, perRarity: 50 },
    warSoul: { base: 120, variance: 0.2, perDifficulty: 60, perRarity: 40 },
  },
  enemies: { types: ['egg_guardian', 'drake', 'drake', 'fire_giant'], count: { base: 5, variance: 0.2, perDifficulty: 2, perRarity: 0 }, levelBonus: 4 },
  isRepeatable: true,
  cooldownHours: 24,
};

export const dragonScarsHuntMissions: MissionTemplate[] = [
  huntDrakesRare,
  huntWyvernsRare,
  huntFireGiantsEpic,
  huntEggGuardianLegendary,
];
