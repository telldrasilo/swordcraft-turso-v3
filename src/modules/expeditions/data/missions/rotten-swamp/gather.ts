/**
 * Миссии сбора ресурсов для локации "Гнилое Болото"
 *
 * Ресурсы:
 * - rotten_wood (гнилое дерево) - common
 * - decayed_bones (гнилые кости) - common
 * - raw_leather (сырая кожа) - common
 * - iron_ore (железная руда) - common
 * - bog_iron (болотное железо) - uncommon
 * - poison_gland (ядовитая железа) - uncommon
 * - toxic_moss (токсичный мох) - uncommon
 * - shadow_leather (теневая кожа) - rare
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// СБОР ГНИЛОЙ ДРЕВЕСИНЫ (common, normal)
// ============================================================================

export const gatherRottenWoodCommon: MissionTemplate = {
  id: 'rotten_swamp_gather_wood_1',
  locationId: 'rotten_swamp',

  type: 'gather',
  rarity: 'common',
  difficulty: 'normal',

  name: 'Дрова для злых зелий',
  description: `Гнилое дерево из этого болота используется алхимиками для приготовления особых зелий — оно горит с едким дымом, усиливающим некоторые эффекты. Отравитель Скальд платит хорошие деньги за качественный материал.`,
  objective: 'Заготовить гнилое дерево (3-7)',

  client: {
    name: 'Отравитель Скальд',
    type: 'scholar',
    description: 'Нужны ингредиенты для экспериментов',
  },

  duration: {
    base: 3600,
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
      base: 90,
      variance: 0.2,
      perDifficulty: 45,
      perRarity: 23,
    },
    glory: {
      base: 3,
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
      base: 14,
      variance: 0.2,
      perDifficulty: 7,
      perRarity: 5,
    },
  },

  resources: [
    { materialId: 'rotten_wood', quantity: { base: 5, variance: 0.4, perDifficulty: 0, perRarity: 1 } },
  ],

  isRepeatable: true,
  cooldownHours: 6,
};

// ============================================================================
// СБОР ЯДОВИТЫХ ЖЕЛЕЗ (uncommon, hard)
// ============================================================================

export const gatherPoisonGlandsUncommon: MissionTemplate = {
  id: 'rotten_swamp_gather_glands_1',
  locationId: 'rotten_swamp',

  type: 'gather',
  rarity: 'uncommon',
  difficulty: 'hard',

  name: 'Яд из желез',
  description: `Ядовитые железы тритонов и токсичный мох — ценные ингредиенты для ядов и противоядий. Болотный целитель платит хорошо, но добывать их нужно в самых опасных зонах, где водятся агрессивные тритоны.`,
  objective: 'Собрать ядовитые железы (1-3) и токсичный мох (1-4)',

  client: {
    name: 'Болотный целитель Мёрт',
    type: 'scholar',
    description: 'Создаёт противоядия для жителей окрестностей',
  },

  duration: {
    base: 4500,
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
      base: 24,
      variance: 0.2,
      perDifficulty: 12,
      perRarity: 8,
    },
  },

  enemies: {
    types: ['poison_newt'],
    count: {
      base: 2,
      variance: 0.5,
      perDifficulty: 1,
      perRarity: 0,
    },
    levelBonus: 0,
  },

  resources: [
    { materialId: 'poison_gland', quantity: { base: 2, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
    { materialId: 'toxic_moss', quantity: { base: 2.5, variance: 0.6, perDifficulty: 0, perRarity: 1 } },
  ],

  isRepeatable: true,
  cooldownHours: 10,
};

// ============================================================================
// БОЛОТНОЕ ЖЕЛЕЗО И ТЕНЕВАЯ КОЖА (rare, hard)
// ============================================================================

export const gatherRareMaterialsRare: MissionTemplate = {
  id: 'rotten_swamp_gather_rare_1',
  locationId: 'rotten_swamp',

  type: 'gather',
  rarity: 'rare',
  difficulty: 'hard',

  name: 'Сокровища гниения',
  description: `Болотное железо образуется в трясине под воздействием векового гниения — оно прочнее обычного и держит чары лучше. Теневая кожа снимается с утопленников — из неё делают броню, скрывающую владельца в темноте. Оба материала редки и ценны.`,
  objective: 'Найти болотное железо (2-5) и теневую кожу (1-2)',

  client: {
    name: 'Кузнец-некромант Враг',
    type: 'merchant',
    description: 'Специализируется на необычных материалах',
  },

  duration: {
    base: 5400,
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
      base: 220,
      variance: 0.25,
      perDifficulty: 110,
      perRarity: 55,
    },
    glory: {
      base: 12,
      variance: 0,
      perDifficulty: 6,
      perRarity: 4,
    },
    experience: {
      base: 80,
      variance: 0.1,
      perDifficulty: 40,
      perRarity: 20,
    },
    warSoul: {
      base: 35,
      variance: 0.2,
      perDifficulty: 18,
      perRarity: 12,
    },
  },

  enemies: {
    types: ['rotten_drowned'],
    count: {
      base: 2,
      variance: 0.5,
      perDifficulty: 1,
      perRarity: 0,
    },
    levelBonus: 1,
  },

  resources: [
    { materialId: 'bog_iron', quantity: { base: 3.5, variance: 0.43, perDifficulty: 0, perRarity: 1 } },
    { materialId: 'shadow_leather', quantity: { base: 1.5, variance: 0.33, perDifficulty: 0, perRarity: 1 } },
  ],

  isRepeatable: true,
  cooldownHours: 12,
};

// ============================================================================
// ЭКСПОРТ ВСЕХ МИССИЙ
// ============================================================================

export const rottenSwampGatherMissions: MissionTemplate[] = [
  gatherRottenWoodCommon,
  gatherPoisonGlandsUncommon,
  gatherRareMaterialsRare,
];
