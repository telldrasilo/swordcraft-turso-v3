/**
 * Боевые миссии для локации "Забытые Шахты"
 *
 * Враги из локации:
 * - Глубинный ползун (deep_crawler) [4-7 ур.] - слепой, охотится на звук
 * - Древний шахтёр (ancient_miner_ghost) [5-8 ур.] - призрак
 * - Теневой страж (shadow_guard) [6-10 ур.] - охраняет запретные зоны
 * - Эхо-тварь (echo_beast) [7-11 ур.] - копирует голоса жертв
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// ОХОТА НА ГЛУБИННЫХ ПОЛЗУНОВ (common, normal)
// ============================================================================

export const huntDeepCrawlersCommon: MissionTemplate = {
  id: 'forgotten_mines_hunt_crawlers_1',
  locationId: 'forgotten_mines',

  type: 'hunt',
  rarity: 'common',
  difficulty: 'normal',

  name: 'Слепые охотники',
  description: `Спелеолог Арнис сообщает о глубинных ползунах в верхних уровнях шахты. Эти слепые существа охотятся по звуку, и любой шум привлекает их внимание. Они расплодились в заброшенных туннелях и представляют опасность для исследователей. Нужно проредить их популяцию, чтобы сделать верхние уровни безопаснее.`,
  objective: 'Уничтожить 4-6 глубинных ползунов',

  client: {
    name: 'Спелеолог Арнис',
    type: 'scholar',
    description: 'Исследует пещеры из любопытства',
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
      base: 15,
      variance: 0.2,
      perDifficulty: 8,
      perRarity: 5,
    },
  },

  enemies: {
    types: ['deep_crawler'],
    count: {
      base: 4,
      variance: 0.25,
      perDifficulty: 2,
      perRarity: 0,
    },
    levelBonus: 0,
  },

  isRepeatable: true,
  cooldownHours: 6,
};

// ============================================================================
// ДРЕВНИЕ ШАХТЁРЫ (uncommon, normal)
// ============================================================================

export const huntAncientMinersUncommon: MissionTemplate = {
  id: 'forgotten_mines_hunt_miners_1',
  locationId: 'forgotten_mines',

  type: 'hunt',
  rarity: 'uncommon',
  difficulty: 'normal',

  name: 'Призраки древних',
  description: `В средней части шахты появились призраки — духи шахтёров, работавших здесь в незапамятные времена. Они бродят по туннелям с призрачными кирками и нападают на любого живого. Старый контрабандист говорит, что призраки обрели покой, когда что-то потревожило их могилы в глубине. Нужно уничтожить несколько духов, чтобы они не распространялись дальше.`,
  objective: 'Уничтожить 3-5 призраков древних шахтёров',

  client: {
    name: 'Старый контрабандист Рурк',
    type: 'merchant',
    description: 'Использует шахты для тайных перевозок',
  },

  duration: {
    base: 4500,           // 1 час 15 минут
    variance: 0.2,
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
      base: 125,
      variance: 0.2,
      perDifficulty: 63,
      perRarity: 32,
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
      perRarity: 13,
    },
    warSoul: {
      base: 22,
      variance: 0.2,
      perDifficulty: 11,
      perRarity: 7,
    },
  },

  enemies: {
    types: ['ancient_miner_ghost'],
    count: {
      base: 3,
      variance: 0.3,
      perDifficulty: 2,
      perRarity: 0,
    },
    levelBonus: 1,
  },

  isRepeatable: true,
  cooldownHours: 8,
};

// ============================================================================
// ТЕНЕВЫЕ СТРАЖИ (rare, hard)
// ============================================================================

export const huntShadowGuardsRare: MissionTemplate = {
  id: 'forgotten_mines_hunt_guards_1',
  locationId: 'forgotten_mines',

  type: 'hunt',
  rarity: 'rare',
  difficulty: 'hard',

  name: 'Стражи запретного',
  description: `Глубоко в шахтах есть зоны, охраняемые теневыми стражами — существами из чистой тьмы. Они стоят на посту у закрытых дверей и атакуют любого, кто приближается. Уцелевший исследователь говорит, что за одной из дверей слышен гул механизмов. Стражей нужно уничтожить, чтобы добраться до тайны.`,
  objective: 'Уничтожить 2-3 теневых стражей',

  client: {
    name: 'Уцелевший исследователь Карл',
    type: 'scholar',
    description: 'Едва выбрался из шахт живым',
  },

  duration: {
    base: 5400,           // 1.5 часа
    variance: 0.25,
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
      base: 200,
      variance: 0.2,
      perDifficulty: 100,
      perRarity: 50,
    },
    glory: {
      base: 12,
      variance: 0,
      perDifficulty: 6,
      perRarity: 4,
    },
    experience: {
      base: 75,
      variance: 0.1,
      perDifficulty: 38,
      perRarity: 19,
    },
    warSoul: {
      base: 35,
      variance: 0.2,
      perDifficulty: 18,
      perRarity: 12,
    },
  },

  enemies: {
    types: ['shadow_guard'],
    count: {
      base: 2,
      variance: 0.25,
      perDifficulty: 1,
      perRarity: 0,
    },
    levelBonus: 2,
  },

  isRepeatable: true,
  cooldownHours: 12,
};

// ============================================================================
// ЭХО-ТВАРЬ (rare, extreme)
// ============================================================================

export const huntEchoBeastRare: MissionTemplate = {
  id: 'forgotten_mines_hunt_echo_1',
  locationId: 'forgotten_mines',

  type: 'hunt',
  rarity: 'rare',
  difficulty: 'extreme',

  name: 'Голоса из тьмы',
  description: `В самой глубокой части шахты охотится эхо-тварь — чудовище, способное копировать любые звуки. Оно приманивает жертв голосами их близких, криками о помощи, обещаниями сокровищ. Те, кто слышал его "песню", не могут забыть её и возвращаются в шахту снова и снова. Существо нужно уничтожить, пока оно не заманило больше жертв.`,
  objective: 'Найти и уничтожить эхо-тварь',

  client: {
    name: 'Городской совет',
    type: 'military',
    description: 'Объявил награду за убийство чудовища',
  },

  duration: {
    base: 7200,           // 2 часа
    variance: 0.3,
    perDifficulty: 600,
    perRarity: 300,
  },

  cost: {
    supplies: {
      base: 40,
      variance: 0.1,
      perDifficulty: 20,
      perRarity: 10,
    },
    deposit: {
      base: 80,
      variance: 0.1,
      perDifficulty: 40,
      perRarity: 20,
    },
  },

  reward: {
    gold: {
      base: 300,
      variance: 0.2,
      perDifficulty: 150,
      perRarity: 75,
    },
    glory: {
      base: 18,
      variance: 0,
      perDifficulty: 9,
      perRarity: 6,
    },
    experience: {
      base: 100,
      variance: 0.1,
      perDifficulty: 50,
      perRarity: 25,
    },
    warSoul: {
      base: 50,
      variance: 0.2,
      perDifficulty: 25,
      perRarity: 17,
    },
  },

  enemies: {
    types: ['echo_beast'],
    count: {
      base: 1,
      variance: 0,
      perDifficulty: 0,
      perRarity: 0,
    },
    levelBonus: 3,
  },

  isRepeatable: true,
  cooldownHours: 16,
};

// ============================================================================
// ЭКСПОРТ ВСЕХ МИССИЙ
// ============================================================================

export const forgottenMinesHuntMissions: MissionTemplate[] = [
  huntDeepCrawlersCommon,
  huntAncientMinersUncommon,
  huntShadowGuardsRare,
  huntEchoBeastRare,
];
