/**
 * Боевые миссии для локации "Рудники Красного Камня"
 *
 * Враги из локации:
 * - Пещерный паук (cave_spider) [1-3 ур.]
 * - Рудокрыс (ore_rat) [2-4 ур.]
 * - Заблудший шахтёр (lost_miner) [3-6 ур.]
 * - Грибной человек (mushroom_man) [4-7 ур.]
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// ОХОТА НА РУДОКРЫСОВ (common, easy)
// ============================================================================

export const huntOreRatsCommon: MissionTemplate = {
  id: 'red_stone_hunt_rats_1',
  locationId: 'red_stone_mines',

  type: 'hunt',
  rarity: 'common',
  difficulty: 'easy',

  name: 'Крысиная угроза',
  description: `Бригадир Харальд жалуется на рудокрысов — огромных крыс размером с кошку, которые расплодились в заброшенных штольнях. Твари грызут инструменты, портят припасы и нападают на рабочих, когда те спускаются в низкие туннели. Несколько новичков уже получили укусы, а один едва не лишился пальца. Нужно уничтожить крысиное гнездо в боковой штольне, чтобы очистить проход для нормальной работы.`,
  objective: 'Уничтожить 4-6 рудокрысов в заброшенной штольне',

  client: {
    name: 'Бригадир Харальд',
    type: 'commoner',
    description: 'Крепкий мужчина средних лет, отвечающий за порядок в шахте',
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

  enemies: {
    types: ['ore_rat'],
    count: {
      base: 4,
      variance: 0.25,
      perDifficulty: 2,
      perRarity: 0,
    },
    levelBonus: 0,
  },

  isRepeatable: true,
  cooldownHours: 4,
};

// ============================================================================
// ЗАЧИСТКА ПАУКОВ (common, normal)
// ============================================================================

export const clearSpidersCommon: MissionTemplate = {
  id: 'red_stone_clear_spiders_1',
  locationId: 'red_stone_mines',

  type: 'clear',
  rarity: 'common',
  difficulty: 'normal',

  name: 'Паутина в штольне',
  description: `Шахтёры обнаружили, что одна из рабочих штолен полностью затянута паутиной. Пещерные пауки оплетают стены и потолок плотными сетями, делая проход невозможным. Рабочие боятся соваться туда — пауки агрессивны и нападают на любого, кто приблизится. Старший смены просит расчистить штольню от восьминогих захватчиков, чтобы возобновить добычу в этом крыле.`,
  objective: 'Зачистить штольню от пещерных пауков (5-7 особей)',

  client: {
    name: 'Старший смены Грегор',
    type: 'commoner',
    description: 'Опытный горняк, следящий за безопасностью рабочих',
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
      base: 75,
      variance: 0.2,
      perDifficulty: 38,
      perRarity: 20,
    },
    glory: {
      base: 3,
      variance: 0,
      perDifficulty: 2,
      perRarity: 1,
    },
    experience: {
      base: 32,
      variance: 0.1,
      perDifficulty: 16,
      perRarity: 8,
    },
    warSoul: {
      base: 10,
      variance: 0.2,
      perDifficulty: 5,
      perRarity: 3,
    },
  },

  enemies: {
    types: ['cave_spider'],
    count: {
      base: 5,
      variance: 0.2,
      perDifficulty: 2,
      perRarity: 0,
    },
    levelBonus: 0,
  },

  isRepeatable: true,
  cooldownHours: 6,
};

// ============================================================================
// ЗАБЛУДШИЕ ШАХТЁРЫ (uncommon, normal)
// ============================================================================

export const huntLostMinersUncommon: MissionTemplate = {
  id: 'red_stone_hunt_lost_miners_1',
  locationId: 'red_stone_mines',

  type: 'hunt',
  rarity: 'uncommon',
  difficulty: 'normal',

  name: 'Призраки забытой штольни',
  description: `Старые штольни на нижнем уровне пользуются дурной славой. Рабочие рассказывают о призрачных фигурах, скользящих во тьме — это заблудшиеся шахтёры, погибшие здесь много лет назад. Их духи не нашли покоя и теперь бродят по туннелям, нападая на живых. Ветеран шахты говорит, что эти призраки становятся агрессивны, когда кто-то приближается к их "территории". Нужно успокоить мёртвых, чтобы рабочие могли безопасно расширять выработку.`,
  objective: 'Уничтожить 3-5 заблудших шахтёров в старых туннелях',

  client: {
    name: 'Шахтёр-ветеран Орлан',
    type: 'commoner',
    description: 'Пожилой горняк, знающий историю каждой штольни',
  },

  duration: {
    base: 3600,           // 1 час
    variance: 0.25,
    perDifficulty: 600,
    perRarity: 300,
  },

  cost: {
    supplies: {
      base: 20,
      variance: 0.1,
      perDifficulty: 10,
      perRarity: 5,
    },
    deposit: {
      base: 40,
      variance: 0.1,
      perDifficulty: 20,
      perRarity: 10,
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
      perDifficulty: 2,
      perRarity: 2,
    },
    experience: {
      base: 42,
      variance: 0.1,
      perDifficulty: 21,
      perRarity: 11,
    },
    warSoul: {
      base: 18,
      variance: 0.2,
      perDifficulty: 9,
      perRarity: 6,
    },
  },

  enemies: {
    types: ['lost_miner'],
    count: {
      base: 3,
      variance: 0.3,
      perDifficulty: 2,
      perRarity: 0,
    },
    levelBonus: 0,
  },

  isRepeatable: true,
  cooldownHours: 8,
};

// ============================================================================
// ГРИБНЫЕ ЛЮДИ (uncommon, hard)
// ============================================================================

export const huntMushroomMenUncommon: MissionTemplate = {
  id: 'red_stone_hunt_mushroom_men_1',
  locationId: 'red_stone_mines',

  type: 'hunt',
  rarity: 'uncommon',
  difficulty: 'hard',

  name: 'Споры в глубине',
  description: `В нижних штольнях рабочие столкнулись с чем-то невероятным — живыми существами из плоти и грибов. Грибные люди появляются из тьмы беззвучно, их тела покрыты плесенью и светящимися спорами. Они не нападают первыми, но яростно защищают свою территорию. Двое шахтёров уже попали в больницу с отравлением спорами. Старший смены хочет избавиться от этих созданий до того, как они расплодятся дальше.`,
  objective: 'Уничтожить колонию грибных людей (4-6 особей)',

  client: {
    name: 'Старший смены Грегор',
    type: 'commoner',
    description: 'Беспокоится о здоровье рабочих',
  },

  duration: {
    base: 5400,           // 1.5 часа
    variance: 0.2,
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
      variance: 0.2,
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

  enemies: {
    types: ['mushroom_man'],
    count: {
      base: 4,
      variance: 0.25,
      perDifficulty: 2,
      perRarity: 0,
    },
    levelBonus: 1,
  },

  isRepeatable: true,
  cooldownHours: 10,
};

// ============================================================================
// КОРОЛЕВА ПАУКОВ (rare, hard)
// ============================================================================

export const huntSpiderQueenRare: MissionTemplate = {
  id: 'red_stone_hunt_spider_queen_1',
  locationId: 'red_stone_mines',

  type: 'hunt',
  rarity: 'rare',
  difficulty: 'hard',

  name: 'Матерь паутины',
  description: `Группа шахтёров, углублявшая новую штольню, наткнулась на обширную пещеру, превращённую в гигантское паучье гнездо. В центре паутины, опутывающей сталактиты и сталагмиты, скрывается огромная королева пауков — древнее создание размером с лошадь. Её потомство заполонило все ближние туннели, делая работу невозможной. Бригадир просит уничтожить матку — без неё колония рассыплется, и шахтёры смогут вернуться к работе.`,
  objective: 'Убить королеву пауков и её стражу (королева + 4-6 пауков)',

  client: {
    name: 'Бригадир Харальд',
    type: 'commoner',
    description: 'Нужно очистить новые штольни для расширения добычи',
  },

  duration: {
    base: 7200,           // 2 часа
    variance: 0.2,
    perDifficulty: 600,
    perRarity: 300,
  },

  cost: {
    supplies: {
      base: 35,
      variance: 0.1,
      perDifficulty: 18,
      perRarity: 9,
    },
    deposit: {
      base: 70,
      variance: 0.1,
      perDifficulty: 35,
      perRarity: 18,
    },
  },

  reward: {
    gold: {
      base: 220,
      variance: 0.2,
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
      base: 85,
      variance: 0.1,
      perDifficulty: 43,
      perRarity: 22,
    },
    warSoul: {
      base: 35,
      variance: 0.2,
      perDifficulty: 18,
      perRarity: 12,
    },
  },

  enemies: {
    types: ['cave_spider', 'cave_spider', 'cave_spider', 'spider_queen'],
    count: {
      base: 5,
      variance: 0.2,
      perDifficulty: 2,
      perRarity: 0,
    },
    levelBonus: 3,
  },

  isRepeatable: true,
  cooldownHours: 12,
};

// ============================================================================
// ЭКСПОРТ ВСЕХ МИССИЙ
// ============================================================================

export const redStoneHuntMissions: MissionTemplate[] = [
  huntOreRatsCommon,
  clearSpidersCommon,
  huntLostMinersUncommon,
  huntMushroomMenUncommon,
  huntSpiderQueenRare,
];
