/**
 * Миссии разведки для локации "Драконьи Шрамы"
 */

import type { MissionTemplate } from '../../missions/_mission-template';

export const scoutPassRare: MissionTemplate = {
  id: 'dragon_scars_scout_pass_1',
  locationId: 'dragon_scars',
  type: 'scout',
  rarity: 'rare',
  difficulty: 'extreme',
  name: 'Путь через шрамы',
  description: `Отшельник на пике знает тропу через хребет, где не летают дрейки. Он готов показать начало пути за плату.`,
  objective: 'Отметить безопасный перевал',
  client: { name: 'Отшельник на пике', type: 'commoner', description: 'Наблюдает за спящим' },
  duration: { base: 7200, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 38, variance: 0.1, perDifficulty: 19, perRarity: 10 },
    deposit: { base: 75, variance: 0.1, perDifficulty: 38, perRarity: 19 },
  },
  reward: {
    gold: { base: 280, variance: 0.2, perDifficulty: 140, perRarity: 70 },
    glory: { base: 16, variance: 0, perDifficulty: 8, perRarity: 5 },
    experience: { base: 105, variance: 0.1, perDifficulty: 53, perRarity: 26 },
    warSoul: { base: 52, variance: 0.2, perDifficulty: 26, perRarity: 17 },
  },
  isRepeatable: true,
  cooldownHours: 14,
};

export const scoutLairEpic: MissionTemplate = {
  id: 'dragon_scars_scout_lair_1',
  locationId: 'dragon_scars',
  type: 'scout',
  rarity: 'epic',
  difficulty: 'extreme',
  name: 'Логово Последнего',
  description: `Дух дракона рассказывает о Логове Последнего — пещере, где спит последний древний дракон. Его чешуя — совершенный материал, но пробуждение несёт гибель.`,
  objective: 'Найти путь к Логову Последнего',
  client: { name: 'Дух дракона', type: 'scholar', description: 'Хочет покоя для сородича' },
  duration: { base: 9000, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 50, variance: 0.1, perDifficulty: 25, perRarity: 13 },
    deposit: { base: 100, variance: 0.1, perDifficulty: 50, perRarity: 25 },
  },
  reward: {
    gold: { base: 420, variance: 0.2, perDifficulty: 210, perRarity: 105 },
    glory: { base: 24, variance: 0, perDifficulty: 12, perRarity: 8 },
    experience: { base: 150, variance: 0.1, perDifficulty: 75, perRarity: 38 },
    warSoul: { base: 80, variance: 0.2, perDifficulty: 40, perRarity: 27 },
  },
  enemies: { types: ['fire_giant', 'ice_golem'], count: { base: 3, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 2 },
  isRepeatable: true,
  cooldownHours: 18,
};

export const scoutBattlegroundLegendary: MissionTemplate = {
  id: 'dragon_scars_scout_battle_1',
  locationId: 'dragon_scars',
  type: 'scout',
  rarity: 'legendary',
  difficulty: 'extreme',
  name: 'Поле древней битвы',
  description: `Драконий исследователь мечтает найти место битвы драконов и богов. Там остались следы божественного огня и драконьего льда — материалы, несуществующие больше нигде.`,
  objective: 'Найти центр древней битвы',
  client: { name: 'Драконий исследователь', type: 'scholar', description: 'Посвятил жизнь поискам' },
  duration: { base: 10800, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 60, variance: 0.1, perDifficulty: 30, perRarity: 15 },
    deposit: { base: 120, variance: 0.1, perDifficulty: 60, perRarity: 30 },
  },
  reward: {
    gold: { base: 580, variance: 0.2, perDifficulty: 290, perRarity: 145 },
    glory: { base: 32, variance: 0, perDifficulty: 16, perRarity: 11 },
    experience: { base: 190, variance: 0.1, perDifficulty: 95, perRarity: 48 },
    warSoul: { base: 110, variance: 0.2, perDifficulty: 55, perRarity: 37 },
  },
  enemies: { types: ['egg_guardian', 'fire_giant', 'ice_golem'], count: { base: 4, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 3 },
  isRepeatable: true,
  cooldownHours: 22,
};

export const dragonScarsScoutMissions: MissionTemplate[] = [
  scoutPassRare,
  scoutLairEpic,
  scoutBattlegroundLegendary,
];
