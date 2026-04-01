/**
 * Миссии разведки для локации "Пепельные Пустоши"
 */

import type { MissionTemplate } from '../../missions/_mission-template';

export const scoutSafeRouteUncommon: MissionTemplate = {
  id: 'ash_wastes_scout_route_1',
  locationId: 'ash_wastes',
  type: 'scout',
  rarity: 'uncommon',
  difficulty: 'hard',
  name: 'Путь через пепел',
  description: `Огнеупорный торговец хочет найти безопасный путь через пустошь к залежам обсидиана. Пепельные бури постоянно меняют ландшафт, и старые карты бесполезны.`,
  objective: 'Исследовать и отметить безопасный маршрут',
  client: { name: 'Огнеупорный торговец', type: 'merchant', description: 'Появляется редко с редкими товарами' },
  duration: { base: 5400, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 25, variance: 0.1, perDifficulty: 12, perRarity: 6 },
    deposit: { base: 50, variance: 0.1, perDifficulty: 25, perRarity: 13 },
  },
  reward: {
    gold: { base: 140, variance: 0.2, perDifficulty: 70, perRarity: 35 },
    glory: { base: 7, variance: 0, perDifficulty: 4, perRarity: 2 },
    experience: { base: 55, variance: 0.1, perDifficulty: 28, perRarity: 14 },
    warSoul: { base: 24, variance: 0.2, perDifficulty: 12, perRarity: 8 },
  },
  isRepeatable: true,
  cooldownHours: 10,
};

export const scoutBuriedCityRare: MissionTemplate = {
  id: 'ash_wastes_scout_city_1',
  locationId: 'ash_wastes',
  type: 'scout',
  rarity: 'rare',
  difficulty: 'extreme',
  name: 'Город под пеплом',
  description: `Кузнец огня Игнис рассказывает о погребённом городе Ирис — столице региона, уничтоженной извержением. Говорят, его библиотека уцелела и хранит древние знания.`,
  objective: 'Найти вход в погребённый город',
  client: { name: 'Кузнец огня Игнис', type: 'merchant', description: 'Ищет древние знания' },
  duration: { base: 7200, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 38, variance: 0.1, perDifficulty: 19, perRarity: 10 },
    deposit: { base: 75, variance: 0.1, perDifficulty: 38, perRarity: 19 },
  },
  reward: {
    gold: { base: 250, variance: 0.2, perDifficulty: 125, perRarity: 63 },
    glory: { base: 14, variance: 0, perDifficulty: 7, perRarity: 5 },
    experience: { base: 95, variance: 0.1, perDifficulty: 48, perRarity: 24 },
    warSoul: { base: 45, variance: 0.2, perDifficulty: 23, perRarity: 15 },
  },
  enemies: { types: ['ash_golem', 'burned_ghost'], count: { base: 2, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 1 },
  isRepeatable: true,
  cooldownHours: 14,
};

export const scoutVolcanoHeartRare: MissionTemplate = {
  id: 'ash_wastes_scout_volcano_1',
  locationId: 'ash_wastes',
  type: 'scout',
  rarity: 'rare',
  difficulty: 'extreme',
  name: 'Сердце вулкана',
  description: `Дух катастрофы говорит о Сердце вулкана — месте, где живёт сам огонь. Туда не может войти ничто живое, но есть путь через застывшие лавовые трубы.`,
  objective: 'Найти путь к Сердцу вулкана',
  client: { name: 'Дух катастрофы', type: 'scholar', description: 'Хочет предотвратить новое извержение' },
  duration: { base: 7200, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 40, variance: 0.1, perDifficulty: 20, perRarity: 10 },
    deposit: { base: 80, variance: 0.1, perDifficulty: 40, perRarity: 20 },
  },
  reward: {
    gold: { base: 280, variance: 0.2, perDifficulty: 140, perRarity: 70 },
    glory: { base: 16, variance: 0, perDifficulty: 8, perRarity: 5 },
    experience: { base: 100, variance: 0.1, perDifficulty: 50, perRarity: 25 },
    warSoul: { base: 50, variance: 0.2, perDifficulty: 25, perRarity: 17 },
  },
  enemies: { types: ['fire_elemental', 'lava_worm'], count: { base: 2, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 2 },
  isRepeatable: true,
  cooldownHours: 16,
};

export const ashWastesScoutMissions: MissionTemplate[] = [
  scoutSafeRouteUncommon,
  scoutBuriedCityRare,
  scoutVolcanoHeartRare,
];
