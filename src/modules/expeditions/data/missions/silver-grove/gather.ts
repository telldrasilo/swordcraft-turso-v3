/**
 * Миссии сбора ресурсов для локации "Серебряный Бор"
 *
 * Ресурсы локации:
 * - silver_ore (серебряная руда) - common
 * - pine (сосновая древесина) - common
 * - pine_resin (сосновая смола) - common
 * - iron_ore (железная руда) - common
 * - coal (уголь) - common
 * - silver_bark (серебряная кора) - uncommon
 * - moonstone_shards (осколки лунного камня) - uncommon
 * - silvered_pine (серебристая сосна) - rare
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// ДОБЫЧА СЕРЕБРЯНОЙ РУДЫ (common, normal)
// ============================================================================

export const gatherSilverOreCommon: MissionTemplate = {
  id: 'silver_grove_gather_silver_1',
  locationId: 'silver_grove',

  type: 'gather',
  rarity: 'common',
  difficulty: 'normal',

  name: 'Серебро из земли',
  description: `Мастер Ансельм принимает заказы на серебряные изделия, но запасы руды подходят к концу. Известные жилы на окраине бора почти истощены, но егерь указал на место глубже в лесу, где есть выходы серебра на поверхность. Работать придётся осторожно — место находится на территории лунных волков.`,
  objective: 'Добыть серебряную руду (4-10 единиц)',

  client: {
    name: 'Серебряных дел мастер Ансельм',
    type: 'merchant',
    description: 'Нужна качественная руда для заказов',
  },

  duration: {
    base: 3600,           // 1 час
    variance: 0.2,
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
      base: 100,
      variance: 0.2,
      perDifficulty: 50,
      perRarity: 25,
    },
    glory: {
      base: 4,
      variance: 0,
      perDifficulty: 2,
      perRarity: 1,
    },
    experience: {
      base: 40,
      variance: 0.1,
      perDifficulty: 20,
      perRarity: 10,
    },
    warSoul: {
      base: 14,
      variance: 0.2,
      perDifficulty: 7,
      perRarity: 5,
    },
  },

  resources: [
    { materialId: 'silver_ore', quantity: { base: 7, variance: 0.43, perDifficulty: 0, perRarity: 0 } },
  ],

  isRepeatable: true,
  cooldownHours: 6,
};

// ============================================================================
// ЗАГОТОВКА СОСНЫ И СМОЛЫ (common, normal)
// ============================================================================

export const gatherPineResinCommon: MissionTemplate = {
  id: 'silver_grove_gather_pine_1',
  locationId: 'silver_grove',

  type: 'gather',
  rarity: 'common',
  difficulty: 'normal',

  name: 'Серебристая смола',
  description: `Сосны в этом бору дают особую смолу — она светится в темноте и используется в алхимии. Лесная дева просит не рубить деревья, а только собирать смолу, которая вытекает естественным образом. Также можно заготовить немного древесины упавших деревьев — они пропитаны смолой и отлично горят.`,
  objective: 'Собрать сосновую смолу (2-6) и древесину (3-8)',

  client: {
    name: 'Лесная дева',
    type: 'scholar',
    description: 'Дух бора, покровительница леса',
  },

  duration: {
    base: 3600,           // 1 час
    variance: 0.2,
    perDifficulty: 600,
    perRarity: 300,
  },

  cost: {
    supplies: {
      base: 16,
      variance: 0.1,
      perDifficulty: 8,
      perRarity: 4,
    },
    deposit: {
      base: 32,
      variance: 0.1,
      perDifficulty: 16,
      perRarity: 8,
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
      base: 3,
      variance: 0,
      perDifficulty: 2,
      perRarity: 1,
    },
    experience: {
      base: 35,
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

  resources: [
    { materialId: 'pine_resin', quantity: { base: 4, variance: 0.5, perDifficulty: 0, perRarity: 0 } },
    { materialId: 'pine', quantity: { base: 5, variance: 0.5, perDifficulty: 0, perRarity: 0 } },
  ],

  isRepeatable: true,
  cooldownHours: 6,
};

// ============================================================================
// СБОР СЕРЕБРЯНОЙ КОРЫ И ЛУННЫХ КАМНЕЙ (uncommon, hard)
// ============================================================================

export const gatherRareMaterialsUncommon: MissionTemplate = {
  id: 'silver_grove_gather_rare_1',
  locationId: 'silver_grove',

  type: 'gather',
  rarity: 'uncommon',
  difficulty: 'hard',

  name: 'Серебро и луна',
  description: `В полнолуние в бору можно найти редкие материалы: серебряную кору с самых старых сосен и осколки лунного камня, падающие с неба в особые ночи. Эти материалы крайне ценны для мастеров и алхимиков. Но собирать их нужно ночью, когда бор наиболее опасен.`,
  objective: 'Собрать серебряную кору (1-3) и осколки лунного камня (1-2)',

  client: {
    name: 'Отшельник-учёный Эдвард',
    type: 'scholar',
    description: 'Изучает свойства редких материалов',
  },

  duration: {
    base: 4500,           // 1 час 15 минут
    variance: 0.3,
    perDifficulty: 600,
    perRarity: 300,
  },

  cost: {
    supplies: {
      base: 25,
      variance: 0.1,
      perDifficulty: 12,
      perRarity: 6,
    },
    deposit: {
      base: 50,
      variance: 0.1,
      perDifficulty: 25,
      perRarity: 13,
    },
  },

  reward: {
    gold: {
      base: 150,
      variance: 0.25,
      perDifficulty: 75,
      perRarity: 38,
    },
    glory: {
      base: 7,
      variance: 0,
      perDifficulty: 4,
      perRarity: 2,
    },
    experience: {
      base: 55,
      variance: 0.1,
      perDifficulty: 28,
      perRarity: 14,
    },
    warSoul: {
      base: 22,
      variance: 0.2,
      perDifficulty: 11,
      perRarity: 7,
    },
  },

  resources: [
    { materialId: 'silver_bark', quantity: { base: 2, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
    { materialId: 'moonstone_shards', quantity: { base: 1, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
  ],

  enemies: {
    types: ['moon_wolf', 'silver_spider'],
    count: {
      base: 2,
      variance: 0.5,
      perDifficulty: 1,
      perRarity: 0,
    },
    levelBonus: 0,
  },

  isRepeatable: true,
  cooldownHours: 10,
};

// ============================================================================
// ЭКСПОРТ ВСЕХ МИССИЙ
// ============================================================================

export const silverGroveGatherMissions: MissionTemplate[] = [
  gatherSilverOreCommon,
  gatherPineResinCommon,
  gatherRareMaterialsUncommon,
];
