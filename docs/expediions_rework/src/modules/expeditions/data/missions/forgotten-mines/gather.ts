/**
 * Миссии сбора ресурсов для локации "Забытые Шахты"
 *
 * Ресурсы:
 * - tin_ore (оловянная руда) - common
 * - coal (уголь) - common
 * - iron_ore (железная руда) - common
 * - copper_ore (медная руда) - common
 * - deep_clay (глубинная глина) - common
 * - ancient_coal (древний уголь) - uncommon
 * - echo_stone (эхо-камень) - uncommon
 * - black_dust (чёрная пыль) - uncommon
 * - depth_iron (глубинное железо) - rare
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// ДОБЫЧА ОЛОВА И УГЛЯ (common, normal)
// ============================================================================

export const gatherTinCoalCommon: MissionTemplate = {
  id: 'forgotten_mines_gather_tin_1',
  locationId: 'forgotten_mines',

  type: 'gather',
  rarity: 'common',
  difficulty: 'normal',

  name: 'Богатые жилы',
  description: `Городским кузнецам нужен олово и уголь для производства бронзы. В забытых шахтах есть богатые жилы, но они находятся глубже, чем привыкли работать обычные шахтёры. Контрабандист Рурк знает безопасный путь к месту добычи.`,
  objective: 'Добыть оловянную руду (4-10) и уголь (3-8)',

  client: {
    name: 'Кузнечная гильдия',
    type: 'guild',
    description: 'Нужны материалы для производства',
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

  resources: [
    { materialId: 'tin_ore', quantity: { base: 4, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
    { materialId: 'coal', quantity: { base: 3, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
  ],

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

  isRepeatable: true,
  cooldownHours: 6,
};

// ============================================================================
// СБОР РЕДКИХ МАТЕРИАЛОВ (uncommon, hard)
// ============================================================================

export const gatherRareMaterialsUncommon: MissionTemplate = {
  id: 'forgotten_mines_gather_rare_1',
  locationId: 'forgotten_mines',

  type: 'gather',
  rarity: 'uncommon',
  difficulty: 'hard',

  name: 'Эхо-камни и чёрная пыль',
  description: `Алхимики ищут эхо-камни — минералы, способные "записывать" звуки, и чёрную пыль — странное вещество, образующееся в глубинах шахты. Эти материалы редки и ценны, но добывать их нужно в самых опасных зонах.`,
  objective: 'Собрать эхо-камни (1-2) и чёрную пыль (1-3)',

  client: {
    name: 'Алхимическая гильдия',
    type: 'guild',
    description: 'Платит хорошо за редкие ингредиенты',
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

  resources: [
    { materialId: 'echo_stone', quantity: { base: 1, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
    { materialId: 'black_dust', quantity: { base: 1, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
  ],

  enemies: {
    types: ['deep_crawler'],
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
// ГЛУБИННОЕ ЖЕЛЕЗО (rare, hard)
// ============================================================================

export const gatherDepthIronRare: MissionTemplate = {
  id: 'forgotten_mines_gather_depth_iron_1',
  locationId: 'forgotten_mines',

  type: 'gather',
  rarity: 'rare',
  difficulty: 'hard',

  name: 'Железо глубин',
  description: `Глубинное железо — редчайший металл, образующийся только под давлением километров породы. Оно прочнее обычного железа и держит магические чары лучше любого другого материала. Но залежи находятся в самых глубоких зонах шахты, где охотятся теневые стражи.`,
  objective: 'Добыть глубинное железо (1-2)',

  client: {
    name: 'Мастер-оружейник Гальд',
    type: 'merchant',
    description: 'Создаёт оружие для знати',
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

  resources: [
    { materialId: 'depth_iron', quantity: { base: 1, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
  ],

  enemies: {
    types: ['shadow_guard', 'ancient_miner_ghost'],
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

export const forgottenMinesGatherMissions: MissionTemplate[] = [
  gatherTinCoalCommon,
  gatherRareMaterialsUncommon,
  gatherDepthIronRare,
];
