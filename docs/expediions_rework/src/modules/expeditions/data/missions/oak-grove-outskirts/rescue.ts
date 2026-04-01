/**
 * Миссии спасения для локации "Окраины Дубовой Рощи"
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// СПАСЕНИЕ ЗАБЛУДИВШЕГОСЯ РЕБЁНКА (common, normal)
// ============================================================================

export const rescueChildCommon: MissionTemplate = {
  id: 'oak_grove_rescue_child_1',
  locationId: 'oak_grove_outskirts',

  type: 'rescue',
  rarity: 'common',
  difficulty: 'normal',

  name: 'Потерявшийся в роще',
  description: `Жители Ольховки в панике — десятилетний мальчик Ванька ушёл в рощу за ягодами и не вернулся к закату. Отец нашёл его корзинку на тропе, но следов дальше не видно. Ночь близко, а в роще водятся волки. Родители умоляют найти ребёнка до темноты — каждый час на счету.`,
  objective: 'Найти и вернуть потерявшегося мальчика в деревню',

  client: {
    name: 'Родители Ваньки',
    type: 'commoner',
    description: 'Перепуганные крестьяне, готовые отдать последнее',
  },

  duration: {
    base: 2700,           // 45 минут
    variance: 0.15,       // Меньше вариативности — срочно!
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
      base: 20,
      variance: 0.1,
      perDifficulty: 10,
      perRarity: 5,
    },
  },

  reward: {
    gold: {
      base: 75,
      variance: 0.15,
      perDifficulty: 38,
      perRarity: 19,
    },
    glory: {
      base: 5,
      variance: 0,
      perDifficulty: 2,
      perRarity: 2,
    },
    experience: {
      base: 35,
      variance: 0.1,
      perDifficulty: 18,
      perRarity: 9,
    },
    warSoul: {
      base: 5,
      variance: 0.2,
      perDifficulty: 3,
      perRarity: 2,
    },
  },

  enemies: {
    types: ['wild_boar', 'forest_wolf'],
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
// СПАСЕНИЕ РАНЕНОГО ОХОТНИКА (uncommon, normal)
// ============================================================================

export const rescueHunterUncommon: MissionTemplate = {
  id: 'oak_grove_rescue_hunter_1',
  locationId: 'oak_grove_outskirts',

  type: 'rescue',
  rarity: 'uncommon',
  difficulty: 'normal',

  name: 'Охотник в беде',
  description: `Деревенский охотник Глеб не вернулся из леса второй день. Его жена слышала выстрелы вчера утром, а потом — тишину. Кто-то должен найти его: возможно, он ранен или попал в ловушку. Глеб знает рощу лучше всех, так что если он не вышел — случилось что-то серьёзное. Жена готова отдать все сбережения за спасение мужа.`,
  objective: 'Найти раненого охотника и вывести его из рощи',

  client: {
    name: 'Марфа, жена охотника',
    type: 'commoner',
    description: 'Молодая женщина с заплаканными глазами',
  },

  duration: {
    base: 4200,           // 1 час 10 минут
    variance: 0.2,
    perDifficulty: 600,
    perRarity: 300,
  },

  cost: {
    supplies: {
      base: 15,
      variance: 0.1,
      perDifficulty: 8,
      perRarity: 4,
    },
    deposit: {
      base: 30,
      variance: 0.1,
      perDifficulty: 15,
      perRarity: 8,
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
      base: 6,
      variance: 0,
      perDifficulty: 3,
      perRarity: 2,
    },
    experience: {
      base: 50,
      variance: 0.1,
      perDifficulty: 25,
      perRarity: 12,
    },
    warSoul: {
      base: 10,
      variance: 0.2,
      perDifficulty: 5,
      perRarity: 3,
    },
  },

  enemies: {
    types: ['forest_wolf', 'bandit_outcast', 'wild_boar'],
    count: {
      base: 3,
      variance: 0.3,
      perDifficulty: 1,
      perRarity: 0,
    },
    levelBonus: 0,
  },

  isRepeatable: true,
  cooldownHours: 16,
};

// ============================================================================
// ЭКСПОРТ ВСЕХ МИССИЙ
// ============================================================================

export const oakGroveRescueMissions: MissionTemplate[] = [
  rescueChildCommon,
  rescueHunterUncommon,
];
