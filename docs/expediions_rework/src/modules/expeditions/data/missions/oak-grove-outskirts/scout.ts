/**
 * Миссии разведки для локации "Окраины Дубовой Рощи"
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// РАЗВЕДКА ТРОП (common, easy)
// ============================================================================

export const scoutPathsCommon: MissionTemplate = {
  id: 'oak_grove_scout_paths_1',
  locationId: 'oak_grove_outskirts',

  type: 'scout',
  rarity: 'common',
  difficulty: 'easy',

  name: 'Картографирование окраин',
  description: `Лесник Виктор составил карту основных троп рощи, но северная часть остаётся белым пятном. Там давно никто не бывал — слишком густые заросли и топкие места. Но пограничная стража просит проверить, нет ли там путей, которыми могут воспользоваться контрабандисты или беглые преступники. Нужно пройти по периметру и отметить все проходимые тропы.`,
  objective: 'Исследовать северную окраину рощи и отметить все тропы',

  client: {
    name: 'Капрал пограничной стражи',
    type: 'military',
    description: 'Ответственный за безопасность границ',
  },

  duration: {
    base: 2400,           // 40 минут
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
      base: 45,
      variance: 0.2,
      perDifficulty: 22,
      perRarity: 11,
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
      base: 3,
      variance: 0.2,
      perDifficulty: 2,
      perRarity: 1,
    },
  },

  isRepeatable: true,
  cooldownHours: 6,
};

// ============================================================================
// ПОИСК ТРАВНОЙ ПОЛЯНЫ (common, normal)
// ============================================================================

export const scoutHerbGroveCommon: MissionTemplate = {
  id: 'oak_grove_scout_herbs_1',
  locationId: 'oak_grove_outskirts',

  type: 'scout',
  rarity: 'common',
  difficulty: 'normal',

  name: 'Поляна целебных трав',
  description: `Местная травница Агафья просит найти легендарную поляну в глубине рощи. По преданию, там растут редкие травы, которые цветут только в определённые дни. Старые карты указывают примерное место где-то за оврагом, но точное расположение утеряно. Если найти поляну и отметить путь к ней, травница сможет собирать там ценные ингредиенты.`,
  objective: 'Найти поляну редких трав и отметить безопасный путь к ней',

  client: {
    name: 'Травница Агафья',
    type: 'commoner',
    description: 'Пожилая женщина, знахарка из Ольховки',
  },

  duration: {
    base: 3600,           // 1 час
    variance: 0.2,
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
      base: 70,
      variance: 0.2,
      perDifficulty: 35,
      perRarity: 18,
    },
    glory: {
      base: 3,
      variance: 0,
      perDifficulty: 1,
      perRarity: 1,
    },
    experience: {
      base: 35,
      variance: 0.1,
      perDifficulty: 15,
      perRarity: 8,
    },
    warSoul: {
      base: 5,
      variance: 0.2,
      perDifficulty: 3,
      perRarity: 2,
    },
  },

  isRepeatable: true,
  cooldownHours: 8,
};

// ============================================================================
// РАЗВЕДКА ЗАБРОШЕННОЙ ШАХТЫ (uncommon, normal)
// ============================================================================

export const scoutOldMineUncommon: MissionTemplate = {
  id: 'oak_grove_scout_mine_1',
  locationId: 'oak_grove_outskirts',

  type: 'investigate',
  rarity: 'uncommon',
  difficulty: 'normal',

  name: 'Заброшенная штольня',
  description: `Старый шахтёр Трофим рассказал о заброшенной штольне на северо-востоке рощи. Её закрыли decades назад после обвала, но недавно он заметил странный свет, исходящий из вентиляционной шахты. Кто-то или что-то там обитает. Трофим просит разведать, что происходит, но предупреждает — вход может быть опасен.`,
  objective: 'Исследовать заброшенную штольню и выяснить источник странного света',

  client: {
    name: 'Отставной шахтёр Трофим',
    type: 'commoner',
    description: 'Старик, знающий подземелья лучше, чем поверхность',
  },

  duration: {
    base: 4500,           // 1 час 15 мин
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
      base: 5,
      variance: 0,
      perDifficulty: 2,
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
    types: ['wild_boar', 'forest_wolf', 'goblin_scout'],
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

export const oakGroveScoutMissions: MissionTemplate[] = [
  scoutPathsCommon,
  scoutHerbGroveCommon,
  scoutOldMineUncommon,
];
