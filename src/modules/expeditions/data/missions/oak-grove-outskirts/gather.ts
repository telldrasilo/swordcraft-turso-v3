/**
 * Миссии сбора ресурсов для локации "Окраины Дубовой Рощи"
 *
 * Ресурсы из локации:
 * - oak, birch (древесина)
 * - iron_ore, coal (руды)
 * - oak_bark, acorns, forest_moss, wild_herbs (новые материалы)
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// ЗАГОТОВКА ДРЕВЕСИНЫ (common, easy)
// ============================================================================

export const gatherWoodCommon: MissionTemplate = {
  id: 'oak_grove_gather_wood_1',
  locationId: 'oak_grove_outskirts',

  type: 'gather',
  rarity: 'common',
  difficulty: 'easy',

  name: 'Заготовка древесины',
  description: `Плотник из Ольховки Фёдор принял большой заказ на ремонт амбаров и ему срочно нужна качественная древесина. Дуб и берёза из этой рощи славятся своей прочностью. Фёдор указал несколько поваленных бурей деревьев, которые можно распилить прямо на месте. Нужно собрать брёвна и сложить их у тракта для вывоза.`,
  objective: 'Заготовить 5-8 брёвен дуба и берёзы',

  client: {
    name: 'Плотник Фёдор',
    type: 'commoner',
    description: 'Мастер на все руки, уважаемый в деревне человек',
  },

  duration: {
    base: 1800,           // 30 минут
    variance: 0.2,
    perDifficulty: 600,
    perRarity: 300,
  },

  cost: {
    supplies: {
      base: 8,
      variance: 0.1,
      perDifficulty: 4,
      perRarity: 2,
    },
    deposit: {
      base: 15,
      variance: 0.1,
      perDifficulty: 8,
      perRarity: 4,
    },
  },

  reward: {
    gold: {
      base: 40,
      variance: 0.2,
      perDifficulty: 20,
      perRarity: 10,
    },
    glory: {
      base: 1,
      variance: 0,
      perDifficulty: 1,
      perRarity: 1,
    },
    experience: {
      base: 15,
      variance: 0.1,
      perDifficulty: 8,
      perRarity: 4,
    },
    warSoul: {
      base: 2,
      variance: 0.2,
      perDifficulty: 1,
      perRarity: 1,
    },
  },

  resources: [
    { materialId: 'oak', quantity: { base: 3, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
    { materialId: 'birch', quantity: { base: 2, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
  ],

  isRepeatable: true,
  cooldownHours: 4,
};

// ============================================================================
// СБОР ДУБОВОЙ КОРЫ (common, easy)
// ============================================================================

export const gatherBarkCommon: MissionTemplate = {
  id: 'oak_grove_gather_bark_1',
  locationId: 'oak_grove_outskirts',

  type: 'gather',
  rarity: 'common',
  difficulty: 'easy',

  name: 'Кора для дубления',
  description: `Кожевник Кузьма из соседнего посёлка срочно ищет дубовую кору для дубления кож. Его обычные поставщики не смогли доставить товар вовремя, а заказы копятся. В роще достаточно старых дубов с толстой корой — нужно аккуратно снять её с нескольких деревьев, не повреждая стволы. Кузьма научит, как это делать правильно.`,
  objective: 'Собрать 4-6 кусков качественной дубовой коры',

  client: {
    name: 'Кожевник Кузьма',
    type: 'merchant',
    description: 'Мастер кожевенного дела, ценит качественное сырьё',
  },

  duration: {
    base: 2100,           // 35 минут
    variance: 0.2,
    perDifficulty: 600,
    perRarity: 300,
  },

  cost: {
    supplies: {
      base: 8,
      variance: 0.1,
      perDifficulty: 4,
      perRarity: 2,
    },
    deposit: {
      base: 12,
      variance: 0.1,
      perDifficulty: 6,
      perRarity: 3,
    },
  },

  reward: {
    gold: {
      base: 35,
      variance: 0.2,
      perDifficulty: 18,
      perRarity: 9,
    },
    glory: {
      base: 1,
      variance: 0,
      perDifficulty: 1,
      perRarity: 1,
    },
    experience: {
      base: 15,
      variance: 0.1,
      perDifficulty: 8,
      perRarity: 4,
    },
    warSoul: {
      base: 2,
      variance: 0.2,
      perDifficulty: 1,
      perRarity: 1,
    },
  },

  resources: [
    { materialId: 'oak_bark', quantity: { base: 4, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
  ],

  isRepeatable: true,
  cooldownHours: 4,
};

// ============================================================================
// СБОР ЛЕСНЫХ ТРАВ (common, normal)
// ============================================================================

export const gatherHerbsCommon: MissionTemplate = {
  id: 'oak_grove_gather_herbs_1',
  locationId: 'oak_grove_outskirts',

  type: 'gather',
  rarity: 'common',
  difficulty: 'normal',

  name: 'Сбор целебных трав',
  description: `Травница Агафья готовит запас снадобий на зиму и ей нужны различные травы, растущие в роще. Она дала список: подорожник, зверобой, душица — и показала, как они выглядят. Эти травы растут на прогалинах и вдоль ручьёв. Сбор требует внимательности: некоторые похожие растения ядовиты.`,
  objective: 'Собрать 3-5 пучков целебных трав',

  client: {
    name: 'Травница Агафья',
    type: 'commoner',
    description: 'Знахарка, лечащая жителей окрестных деревень',
  },

  duration: {
    base: 3000,           // 50 минут
    variance: 0.2,
    perDifficulty: 600,
    perRarity: 300,
  },

  cost: {
    supplies: {
      base: 10,
      variance: 0.1,
      perDifficulty: 5,
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
      base: 25,
      variance: 0.1,
      perDifficulty: 12,
      perRarity: 6,
    },
    warSoul: {
      base: 4,
      variance: 0.2,
      perDifficulty: 2,
      perRarity: 1,
    },
  },

  resources: [
    { materialId: 'wild_herbs', quantity: { base: 2, variance: 0.5, perDifficulty: 1, perRarity: 1 } },
  ],

  isRepeatable: true,
  cooldownHours: 6,
};

// ============================================================================
// ПОИСК ЖЕЛЕЗНОЙ РУДЫ (uncommon, normal)
// ============================================================================

export const gatherIronUncommon: MissionTemplate = {
  id: 'oak_grove_gather_iron_1',
  locationId: 'oak_grove_outskirts',

  type: 'gather',
  rarity: 'uncommon',
  difficulty: 'normal',

  name: 'Рудные жилы',
  description: `Старый рудокоп Тихон знает место в овраге, где железная руда выходит близко к поверхности. Это не богатое месторождение, но для небольших нужд хватит. Добывать там непросто — порода твёрдая, а овраг скользкий после дождей. Но кузнец из деревни готов хорошо заплатить за качественную руду.`,
  objective: 'Добить 2-4 куска железной руды из обнажения',

  client: {
    name: 'Кузнец Ерёмин',
    type: 'commoner',
    description: 'Единственный кузнец на несколько деревень',
  },

  duration: {
    base: 3600,           // 1 час
    variance: 0.25,
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
      base: 90,
      variance: 0.2,
      perDifficulty: 45,
      perRarity: 22,
    },
    glory: {
      base: 3,
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
      base: 6,
      variance: 0.2,
      perDifficulty: 3,
      perRarity: 2,
    },
  },

  resources: [
    { materialId: 'iron_ore', quantity: { base: 3, variance: 0.5, perDifficulty: 1, perRarity: 1 } },
  ],

  isRepeatable: true,
  cooldownHours: 8,
};

// ============================================================================
// ЭКСПОРТ ВСЕХ МИССИЙ
// ============================================================================

export const oakGroveGatherMissions: MissionTemplate[] = [
  gatherWoodCommon,
  gatherBarkCommon,
  gatherHerbsCommon,
  gatherIronUncommon,
];
