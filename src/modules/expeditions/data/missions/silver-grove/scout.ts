/**
 * Миссии разведки для локации "Серебряный Бор"
 *
 * Цель: исследование таинственных мест бора,
 * поиск входа в Лунную кузницу
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// КАРТА НОЧНЫХ ТРОП (common, normal)
// ============================================================================

export const scoutNightPathsCommon: MissionTemplate = {
  id: 'silver_grove_scout_paths_1',
  locationId: 'silver_grove',

  type: 'scout',
  rarity: 'common',
  difficulty: 'normal',

  name: 'Тропы, что меняются',
  description: `Странный следопыт-лунатик блуждает по бору ночами, но никогда не теряется. Он говорит, что во сне видит тропы такими, какие они есть на самом деле — не изменённые лунной магией. Егерь хочет нанести на карту эти "истинные тропы", чтобы путники могли безопасно ходить по бору даже ночью.`,
  objective: 'Следуя за лунатиком, отметить на карте ночные тропы',

  client: {
    name: 'Старый егерь Мартин',
    type: 'commoner',
    description: 'Хочет сделать бор безопаснее для путников',
  },

  duration: {
    base: 3600,           // 1 час
    variance: 0.3,
    perDifficulty: 600,
    perRarity: 300,
  },

  cost: {
    supplies: {
      base: 18,
      variance: 0.1,
      perDifficulty: 9,
      perRarity: 5,
    },
    deposit: {
      base: 35,
      variance: 0.1,
      perDifficulty: 18,
      perRarity: 9,
    },
  },

  reward: {
    gold: {
      base: 85,
      variance: 0.2,
      perDifficulty: 43,
      perRarity: 22,
    },
    glory: {
      base: 4,
      variance: 0,
      perDifficulty: 2,
      perRarity: 1,
    },
    experience: {
      base: 36,
      variance: 0.1,
      perDifficulty: 18,
      perRarity: 9,
    },
    warSoul: {
      base: 12,
      variance: 0.2,
      perDifficulty: 6,
      perRarity: 4,
    },
  },

  isRepeatable: true,
  cooldownHours: 8,
};

// ============================================================================
// ПОИСК СЕРЕБРЯНОЙ ЖИЛЫ (uncommon, normal)
// ============================================================================

export const scoutSilverVeinUncommon: MissionTemplate = {
  id: 'silver_grove_scout_vein_1',
  locationId: 'silver_grove',

  type: 'scout',
  rarity: 'uncommon',
  difficulty: 'normal',

  name: 'Корни серебра',
  description: `Серебряных дел мастер Ансельм ищет новую жилу серебра — старые выработки истощаются. Он слышал легенду о месте, где серебро растёт прямо из корней сосен, образуя естественные отложения. Это место должно быть где-то в глубине бора, куда редко заходят люди.`,
  objective: 'Найти место, где серебро соединяется с корнями деревьев',

  client: {
    name: 'Серебряных дел мастер Ансельм',
    type: 'merchant',
    description: 'Нужен новый источник серебра для работы',
  },

  duration: {
    base: 4500,           // 1 час 15 минут
    variance: 0.25,
    perDifficulty: 600,
    perRarity: 300,
  },

  cost: {
    supplies: {
      base: 22,
      variance: 0.1,
      perDifficulty: 11,
      perRarity: 6,
    },
    deposit: {
      base: 45,
      variance: 0.1,
      perDifficulty: 22,
      perRarity: 12,
    },
  },

  reward: {
    gold: {
      base: 110,
      variance: 0.2,
      perDifficulty: 55,
      perRarity: 28,
    },
    glory: {
      base: 5,
      variance: 0,
      perDifficulty: 3,
      perRarity: 2,
    },
    experience: {
      base: 45,
      variance: 0.1,
      perDifficulty: 23,
      perRarity: 12,
    },
    warSoul: {
      base: 18,
      variance: 0.2,
      perDifficulty: 9,
      perRarity: 6,
    },
  },

  isRepeatable: true,
  cooldownHours: 10,
};

// ============================================================================
// ПОИСК ВХОДА В ЛУННУЮ КУЗНИЦУ (rare, hard)
// ============================================================================

export const scoutMoonForgeRare: MissionTemplate = {
  id: 'silver_grove_scout_forge_1',
  locationId: 'silver_grove',

  type: 'scout',
  rarity: 'rare',
  difficulty: 'hard',

  name: 'Лунная кузница',
  description: `Отшельник-учёный Эдвард нашёл упоминания о Лунной кузнице — древнем месте, где серебро можно ковать при лунном свете, придавая ему магические свойства. Вход находится под корнями самого старого дерева в бору, но само дерево — лишь защита. Нужно найти путь, минуя охрану лесных духов.`,
  objective: 'Найти вход в Лунную кузницу и отметить безопасный путь',

  client: {
    name: 'Отшельник-учёный Эдвард',
    type: 'scholar',
    description: 'Мечтает открыть тайны древней кузницы',
  },

  duration: {
    base: 5400,           // 1.5 часа
    variance: 0.3,
    perDifficulty: 600,
    perRarity: 300,
  },

  cost: {
    supplies: {
      base: 32,
      variance: 0.1,
      perDifficulty: 16,
      perRarity: 8,
    },
    deposit: {
      base: 65,
      variance: 0.1,
      perDifficulty: 32,
      perRarity: 16,
    },
  },

  reward: {
    gold: {
      base: 180,
      variance: 0.2,
      perDifficulty: 90,
      perRarity: 45,
    },
    glory: {
      base: 10,
      variance: 0,
      perDifficulty: 5,
      perRarity: 3,
    },
    experience: {
      base: 70,
      variance: 0.1,
      perDifficulty: 35,
      perRarity: 18,
    },
    warSoul: {
      base: 30,
      variance: 0.2,
      perDifficulty: 15,
      perRarity: 10,
    },
  },

  enemies: {
    types: ['moon_wolf', 'silver_spider'],
    count: {
      base: 2,
      variance: 0.5,
      perDifficulty: 1,
      perRarity: 0,
    },
    levelBonus: 1,
  },

  isRepeatable: true,
  cooldownHours: 12,
};

// ============================================================================
// ЭКСПОРТ ВСЕХ МИССИЙ
// ============================================================================

export const silverGroveScoutMissions: MissionTemplate[] = [
  scoutNightPathsCommon,
  scoutSilverVeinUncommon,
  scoutMoonForgeRare,
];
