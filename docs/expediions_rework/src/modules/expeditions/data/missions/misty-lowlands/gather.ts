/**
 * Миссии сбора ресурсов для локации "Туманные Низины"
 *
 * Ресурсы локации:
 * - clay (глина) - common
 * - peat (торф) - common
 * - swamp_moss (болотный мох) - common
 * - raw_leather (сырая кожа) - common
 * - bones (кости) - common
 * - iron_ore (железная руда) - common
 * - stone (камень) - common
 * - coal (уголь) - common
 * - mist_herbs (туманные травы) - uncommon
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// СБОР ГЛИНЫ (common, easy)
// ============================================================================

export const gatherClayCommon: MissionTemplate = {
  id: 'misty_lowlands_gather_clay_1',
  locationId: 'misty_lowlands',

  type: 'gather',
  rarity: 'common',
  difficulty: 'easy',

  name: 'Глиняные берега',
  description: `Гончарная мастерская города нуждается в качественной глине. В низинах есть отличные залежи — глина там плотная, пластичная, идеально подходит для посуды. Старый рыбак укажет место, где проще всего добраться до глиняных берегов. Работа несложная, но нужно быть осторожным — берега могут быть скользкими.`,
  objective: 'Набрать глину с берегов (3-8 единиц)',

  client: {
    name: 'Гончар Матвей',
    type: 'commoner',
    description: 'Мастер гончарного дела из города',
  },

  duration: {
    base: 1800,           // 30 минут
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
      base: 45,
      variance: 0.2,
      perDifficulty: 22,
      perRarity: 12,
    },
    glory: {
      base: 2,
      variance: 0,
      perDifficulty: 1,
      perRarity: 1,
    },
    experience: {
      base: 18,
      variance: 0.1,
      perDifficulty: 9,
      perRarity: 5,
    },
    warSoul: {
      base: 5,
      variance: 0.2,
      perDifficulty: 3,
      perRarity: 2,
    },
  },

  resources: [
    { materialId: 'clay', quantity: { base: 5, variance: 0.4, perDifficulty: 1, perRarity: 0 } },
  ],

  isRepeatable: true,
  cooldownHours: 4,
};

// ============================================================================
// СБОР ТОРФА И МОХА (common, normal)
// ============================================================================

export const gatherPeatMossCommon: MissionTemplate = {
  id: 'misty_lowlands_gather_peat_moss_1',
  locationId: 'misty_lowlands',

  type: 'gather',
  rarity: 'common',
  difficulty: 'normal',

  name: 'Топливо и перевязки',
  description: `Ближайшие деревни нуждаются в торфе для отопления — зима близко. Одновременно лекари просят заготовить болотный мох, который используют для перевязок — он впитывает кровь и обладает заживляющими свойствами. Место сбора находится глубже в низинах, там придётся постараться, чтобы не увязнуть.`,
  objective: 'Заготовить торф (2-6) и болотный мох (2-5)',

  client: {
    name: 'Староста деревни Ольховка',
    type: 'farmer',
    description: 'Обеспечивает деревни припасами на зиму',
  },

  duration: {
    base: 3600,           // 1 час
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
      base: 80,
      variance: 0.2,
      perDifficulty: 40,
      perRarity: 20,
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
      base: 10,
      variance: 0.2,
      perDifficulty: 5,
      perRarity: 3,
    },
  },

  resources: [
    { materialId: 'peat', quantity: { base: 4, variance: 0.3, perDifficulty: 1, perRarity: 0 } },
    { materialId: 'swamp_moss', quantity: { base: 3, variance: 0.3, perDifficulty: 1, perRarity: 0 } },
  ],

  isRepeatable: true,
  cooldownHours: 6,
};

// ============================================================================
// СБОР ТУМАННЫХ ТРАВ (uncommon, normal)
// ============================================================================

export const gatherMistHerbsUncommon: MissionTemplate = {
  id: 'misty_lowlands_gather_herbs_1',
  locationId: 'misty_lowlands',

  type: 'gather',
  rarity: 'uncommon',
  difficulty: 'normal',

  name: 'Цветы в тумане',
  description: `Туманные травы — редкие растения, которые цветут только в густом тумане. Алхимики платят за них хорошие деньги, ведь они входят в состав многих зелий. Травник знает место в глубине низин, где эти травы растут в изобилии, но путь туда опасен — трясина и призраки.`,
  objective: 'Собрать туманные травы (1-3 единицы)',

  client: {
    name: 'Травник-отшельник Малькольм',
    type: 'scholar',
    description: 'Торгует редкими травами с алхимиками',
  },

  duration: {
    base: 2700,           // 45 минут
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
      base: 100,
      variance: 0.25,
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
    { materialId: 'mist_herbs', quantity: { base: 2, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
  ],

  isRepeatable: true,
  cooldownHours: 8,
};

// ============================================================================
// ЭКСПОРТ ВСЕХ МИССИЙ
// ============================================================================

export const mistyLowlandsGatherMissions: MissionTemplate[] = [
  gatherClayCommon,
  gatherPeatMossCommon,
  gatherMistHerbsUncommon,
];
