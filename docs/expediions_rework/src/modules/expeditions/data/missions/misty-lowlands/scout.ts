/**
 * Миссии разведки для локации "Туманные Низины"
 *
 * Цель: исследование опасных зон, поиск безопасных троп,
 * выявление тайн затонувшего города
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// ПОИСК БЕЗОПАСНОЙ ТРОПЫ (common, easy)
// ============================================================================

export const scoutSafePathCommon: MissionTemplate = {
  id: 'misty_lowlands_scout_path_1',
  locationId: 'misty_lowlands',

  type: 'scout',
  rarity: 'common',
  difficulty: 'easy',

  name: 'Тропа через трясину',
  description: `Торговцы регулярно теряют повозки в низинах — трясина затягивает неосторожных. Старый рыбак Одо знает, что существует безопасная тропа через болото, но точный путь утерян. Он готов показать начало пути, но дальше нужно идти самому, отмечая колышками места, где почва твёрдая. Это поможет всем путникам безопасно пересекать низины.`,
  objective: 'Проложить и отметить безопасную тропу через трясину',

  client: {
    name: 'Старый рыбак Одо',
    type: 'commoner',
    description: 'Хочет помочь торговцам, но сам идти не может',
  },

  duration: {
    base: 2400,           // 40 минут
    variance: 0.3,
    perDifficulty: 600,
    perRarity: 300,
  },

  cost: {
    supplies: {
      base: 12,
      variance: 0.1,
      perDifficulty: 6,
      perRarity: 3,
    },
    deposit: {
      base: 25,
      variance: 0.1,
      perDifficulty: 12,
      perRarity: 6,
    },
  },

  reward: {
    gold: {
      base: 55,
      variance: 0.2,
      perDifficulty: 28,
      perRarity: 14,
    },
    glory: {
      base: 2,
      variance: 0,
      perDifficulty: 1,
      perRarity: 1,
    },
    experience: {
      base: 22,
      variance: 0.1,
      perDifficulty: 11,
      perRarity: 6,
    },
    warSoul: {
      base: 6,
      variance: 0.2,
      perDifficulty: 3,
      perRarity: 2,
    },
  },

  isRepeatable: true,
  cooldownHours: 6,
};

// ============================================================================
// ПОИСК ТРАВНИКА (uncommon, normal)
// ============================================================================

export const scoutHerbalistSpotUncommon: MissionTemplate = {
  id: 'misty_lowlands_scout_herbs_1',
  locationId: 'misty_lowlands',

  type: 'scout',
  rarity: 'uncommon',
  difficulty: 'normal',

  name: 'Поляна туманных трав',
  description: `Травник-отшельник просит найти в низинах место, где растут туманные травы — редкие растения, цветущие только в густом тумане. Говорят, они обладают целительными свойствами, но растут лишь в одном месте, которое травник забыл после долгой болезни. Нужно исследовать низины и отметить места скопления этих трав.`,
  objective: 'Найти поляну туманных трав и отметить её на карте',

  client: {
    name: 'Травник-отшельник Малькольм',
    type: 'scholar',
    description: 'Пожилой собиратель трав, живёт на краю болота',
  },

  duration: {
    base: 3600,           // 1 час
    variance: 0.25,
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
      base: 95,
      variance: 0.2,
      perDifficulty: 48,
      perRarity: 24,
    },
    glory: {
      base: 4,
      variance: 0,
      perDifficulty: 2,
      perRarity: 1,
    },
    experience: {
      base: 38,
      variance: 0.1,
      perDifficulty: 19,
      perRarity: 10,
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
// ИССЛЕДОВАНИЕ ЗАТОНУВШЕГО ГОРОДА (rare, hard)
// ============================================================================

export const scoutSunkenCityRare: MissionTemplate = {
  id: 'misty_lowlands_scout_city_1',
  locationId: 'misty_lowlands',

  type: 'scout',
  rarity: 'rare',
  difficulty: 'hard',

  name: 'Колокола Ильтара',
  description: `Болотная ведьма Марга рассказала легенду о затонувшем городе Ильтар, который ушёл под воду за одну ночь. Иногда в густом тумане слышен колокольный звон, доносящийся из глубины. Марга хочет узнать, что на самом деле погубило город — и что скрывается в его руинах. Путь опасен: нужно пройти через самую глубокую часть трясины.`,
  objective: 'Найти вход в затонувший город Ильтар',

  client: {
    name: 'Болотная ведьма Марга',
    type: 'scholar',
    description: 'Ищет древние знания и тайны погибшего города',
  },

  duration: {
    base: 5400,           // 1.5 часа
    variance: 0.3,
    perDifficulty: 600,
    perRarity: 300,
  },

  cost: {
    supplies: {
      base: 30,
      variance: 0.1,
      perDifficulty: 15,
      perRarity: 8,
    },
    deposit: {
      base: 60,
      variance: 0.1,
      perDifficulty: 30,
      perRarity: 15,
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
      base: 28,
      variance: 0.2,
      perDifficulty: 14,
      perRarity: 10,
    },
  },

  enemies: {
    types: ['mist_ghost', 'bog_walker'],
    count: {
      base: 2,
      variance: 0.5,
      perDifficulty: 1,
      perRarity: 0,
    },
    levelBonus: 0,
  },

  isRepeatable: true,
  cooldownHours: 12,
};

// ============================================================================
// ЭКСПОРТ ВСЕХ МИССИЙ
// ============================================================================

export const mistyLowlandsScoutMissions: MissionTemplate[] = [
  scoutSafePathCommon,
  scoutHerbalistSpotUncommon,
  scoutSunkenCityRare,
];
