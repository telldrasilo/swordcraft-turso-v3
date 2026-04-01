/**
 * Миссии сбора ресурсов для локации "Рудники Красного Камня"
 *
 * Ресурсы локации:
 * - iron_ore (железная руда) - common
 * - copper_ore (медная руда) - common
 * - tin_ore (оловянная руда) - common
 * - coal (уголь) - common
 * - stone (камень) - common
 * - red_stone (красный камень) - common
 * - flint (кремень) - common
 * - clay (глина) - common
 * - copper_nuggets (медные самородки) - uncommon
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// ДОБЫЧА ЖЕЛЕЗНОЙ РУДЫ (common, easy)
// ============================================================================

export const gatherIronOreCommon: MissionTemplate = {
  id: 'red_stone_gather_iron_1',
  locationId: 'red_stone_mines',

  type: 'gather',
  rarity: 'common',
  difficulty: 'easy',

  name: 'Железная жила',
  description: `Шахта получила крупный заказ на железные слитки от городской кузнечной гильдии. Верхние уровни уже истощены, но бригадир знает о богатой желехной жиле в боковой штольне третьего уровня. Там несложная работа для новичка — порода мягкая, а жила выходит прямо к поверхности. Нужно добыть руду и доставить её к главному стволу для подъёма.`,
  objective: 'Добыть железную руду из жилы (4-10 единиц)',

  client: {
    name: 'Бригадир Харальд',
    type: 'commoner',
    description: 'Ответственный за выполнение заказов',
  },

  duration: {
    base: 2400,           // 40 минут
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
      base: 50,
      variance: 0.2,
      perDifficulty: 25,
      perRarity: 13,
    },
    glory: {
      base: 2,
      variance: 0,
      perDifficulty: 1,
      perRarity: 1,
    },
    experience: {
      base: 20,
      variance: 0.1,
      perDifficulty: 10,
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
    { materialId: 'iron_ore', quantity: { base: 5, variance: 0.4, perDifficulty: 1, perRarity: 1 } },
  ],

  isRepeatable: true,
  cooldownHours: 4,
};

// ============================================================================
// ДОБЫЧА УГЛЯ И МЕДИ (common, normal)
// ============================================================================

export const gatherCoalCopperCommon: MissionTemplate = {
  id: 'red_stone_gather_coal_copper_1',
  locationId: 'red_stone_mines',

  type: 'gather',
  rarity: 'common',
  difficulty: 'normal',

  name: 'Уголь и медь',
  description: `Кузницы города испытывают нехватку угля и медной руды. Старшая смена знает о месте, где обе жилы проходят рядом — можно добывать одновременно. Работа посложнее, чем на верхних уровнях: туннель узкий, воздух спёртый, а жила уходит глубже, чем обычно. Но оплата соответственная, и шахта обеспечивает всем необходимым инструментом.`,
  objective: 'Добыть уголь (2-6) и медную руду (3-8)',

  client: {
    name: 'Старший смены Грегор',
    type: 'commoner',
    description: 'Координирует добычу полезных ископаемых',
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
    { materialId: 'coal', quantity: { base: 3, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
    { materialId: 'copper_ore', quantity: { base: 4, variance: 0.5, perDifficulty: 1, perRarity: 1 } },
  ],

  isRepeatable: true,
  cooldownHours: 6,
};

// ============================================================================
// ПОИСК МЕДНЫХ САМОРОДКОВ (uncommon, normal)
// ============================================================================

export const gatherCopperNuggetsUncommon: MissionTemplate = {
  id: 'red_stone_gather_nuggets_1',
  locationId: 'red_stone_mines',

  type: 'gather',
  rarity: 'uncommon',
  difficulty: 'normal',

  name: 'Самородки в россыпи',
  description: `После недавнего обвала в нижней штольне открылась старая россыпь — рыхлые породы, богатые самородным металлом. Геолог подтвердил наличие медных самородков, редко — с примесью серебра. Шахтёры боятся туда соваться из-за неустойчивости свода, но опытный искатель может набрать неплохой улов, если будет осторожен. Шахта предлагает долю от находок.`,
  objective: 'Собрать медные самородки в россыпи (1-3 единицы)',

  client: {
    name: 'Геолог Мариус',
    type: 'scholar',
    description: 'Специалист по минералам, ищет редкие образцы',
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
    { materialId: 'copper_nuggets', quantity: { base: 1, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
  ],

  isRepeatable: true,
  cooldownHours: 8,
};

// ============================================================================
// ЭКСПОРТ ВСЕХ МИССИЙ
// ============================================================================

export const redStoneGatherMissions: MissionTemplate[] = [
  gatherIronOreCommon,
  gatherCoalCopperCommon,
  gatherCopperNuggetsUncommon,
];
