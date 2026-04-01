/**
 * Боевые миссии для локации "Окраины Дубовой Рощи"
 *
 * Враги из локации:
 * - Дикий кабан (wild_boar) [1-3 ур.]
 * - Лесной волк (forest_wolf) [2-4 ур., стаи по 4]
 * - Бандит-отщепенец (bandit_outcast) [2-5 ур.]
 * - Гоблин-разведчик (goblin_scout) [3-6 ур.]
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// ОХОТА НА КАБАНОВ (common, easy)
// ============================================================================

export const huntBoarsCommon: MissionTemplate = {
  id: 'oak_grove_hunt_boars_1',
  locationId: 'oak_grove_outskirts',

  type: 'hunt',
  rarity: 'common',
  difficulty: 'easy',

  name: 'Охота на кабанов',
  description: `Фермеры из ближней деревни Ольховка жалуются на стаю диких кабанов, которая портит посевы на краю рощи. Животные стали агрессивны и нападают на всех, кто приближается к их территории. Староста просит застрелить несколько зверей, чтобы отпугнуть остальных. Следы ведут в густые заросли у старого ручья, где кабаны устроили лежбище.`,
  objective: 'Убить 3-5 диких кабанов в зарослях у ручья',

  client: {
    name: 'Староста Михей',
    type: 'farmer',
    description: 'Пожилой крестьянин, обеспокоенный сохранностью урожая',
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
      base: 50,
      variance: 0.2,
      perDifficulty: 25,
      perRarity: 15,
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

  enemies: {
    types: ['wild_boar'],
    count: {
      base: 3,
      variance: 0.3,
      perDifficulty: 1,
      perRarity: 0,
    },
    levelBonus: 0,
  },

  isRepeatable: true,
  cooldownHours: 4,
};

// ============================================================================
// ОХОТА НА ВОЛКОВ (common, normal)
// ============================================================================

export const huntWolvesCommon: MissionTemplate = {
  id: 'oak_grove_hunt_wolves_1',
  locationId: 'oak_grove_outskirts',

  type: 'hunt',
  rarity: 'common',
  difficulty: 'normal',

  name: 'Волчья угроза',
  description: `Лесник Виктор сообщил, что в роще объявилась стая волков, которая ведёт себя необычно дерзко. Серые хищники нападают на путников даже днём, что совершенно несвойственно для этих зверей. Возможно, их кто-то потревожил в глубине леса. Требуется найти логово стаи и уничтожить нескольких волков, чтобы прогнать остальных подальше от деревни.`,
  objective: 'Уничтожить 4-6 лесных волков из стаи',

  client: {
    name: 'Лесник Виктор',
    type: 'commoner',
    description: 'Опытный следопыт, много лет охраняющий рощу',
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
      perDifficulty: 15,
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
    types: ['forest_wolf'],
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
// ЗАЧИСТКА БАНДИТОВ (uncommon, normal)
// ============================================================================

export const clearBanditsUncommon: MissionTemplate = {
  id: 'oak_grove_clear_bandits_1',
  locationId: 'oak_grove_outskirts',

  type: 'clear',
  rarity: 'uncommon',
  difficulty: 'normal',

  name: 'Лагерь беглых каторжан',
  description: `Деревенский охотник обнаружил в густой чаще временный лагерь — несколько шалашей, кострище, запасы еды. Судя по следам, здесь прячутся беглые каторжане, сбежавшие с трактовых работ. Они грабят путников на окраинных тропах и могут напасть на деревню. Местный староста просит зачистить лагерь, пока бандиты не набрали сил.`,
  objective: 'Зачистить лагерь бандитов (5-7 человек)',

  client: {
    name: 'Деревенский охотник Глеб',
    type: 'commoner',
    description: 'Мужчина средних лет, знает лес как свои пять пальцев',
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
      base: 120,
      variance: 0.2,
      perDifficulty: 60,
      perRarity: 30,
    },
    glory: {
      base: 5,
      variance: 0,
      perDifficulty: 2,
      perRarity: 2,
    },
    experience: {
      base: 45,
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
    types: ['bandit_outcast'],
    count: {
      base: 5,
      variance: 0.2,
      perDifficulty: 2,
      perRarity: 0,
    },
    levelBonus: 0,
  },

  isRepeatable: true,
  cooldownHours: 8,
};

// ============================================================================
// ОХОТА НА АЛЬФА-ВОЛКА (rare, hard)
// ============================================================================

export const huntAlphaWolfRare: MissionTemplate = {
  id: 'oak_grove_hunt_alpha_wolf_1',
  locationId: 'oak_grove_outskirts',

  type: 'hunt',
  rarity: 'rare',
  difficulty: 'hard',

  name: 'Вожак стаи',
  description: `Стая волков, терроризирующая окраины рощи, имеет вожака — огромного серого зверя со шрамом через всё лицо. Этот волк умнее и опаснее обычных: он координирует атаки стаи и устраивает засады. Местные считают его чуть ли не демоном в зверином обличье. Убийство вожака рассеет стаю и вернёт безопасность тропам. Но волк не будет сражаться в одиночку — его охраняют лучшие охотники стаи.`,
  objective: 'Убить альфа-волка и его охрану (4-6 волков)',

  client: {
    name: 'Староста окрестных деревень',
    type: 'farmer',
    description: 'Представитель нескольких деревень, объединившихся для защиты',
  },

  duration: {
    base: 7200,           // 2 часа
    variance: 0.2,
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
      base: 10,
      variance: 0,
      perDifficulty: 5,
      perRarity: 3,
    },
    experience: {
      base: 80,
      variance: 0.1,
      perDifficulty: 40,
      perRarity: 20,
    },
    warSoul: {
      base: 25,
      variance: 0.2,
      perDifficulty: 15,
      perRarity: 10,
    },
  },

  enemies: {
    types: ['forest_wolf', 'forest_wolf', 'forest_wolf', 'alpha_wolf'], // альфа + охрана
    count: {
      base: 5,
      variance: 0.2,
      perDifficulty: 2,
      perRarity: 0,
    },
    levelBonus: 2,        // Волки на 2 уровня выше базы
  },

  isRepeatable: true,
  cooldownHours: 12,
};

// ============================================================================
// ЗАЧИСТКА ГОБЛИНОВ-РАЗВЕДЧИКОВ (uncommon, normal)
// ============================================================================

export const clearGoblinsUncommon: MissionTemplate = {
  id: 'oak_grove_clear_goblins_1',
  locationId: 'oak_grove_outskirts',

  type: 'clear',
  rarity: 'uncommon',
  difficulty: 'normal',

  name: 'Гоблины на границе',
  description: `Лесник обнаружил следы гоблинов — мелкие ступни, оброненные стрелы с характерным оперением. Это разведчики, изучающие окраины рощи. Обычно гоблины не суются так близко к человеческим землям, но что-то заставило их проявить интерес. Следы ведут к оврагу, где, вероятно, устроен наблюдательный пост. Нужно перехватить разведчиков, пока они не привели основной отряд.`,
  objective: 'Уничтожить 4-6 гоблинов-разведчиков',

  client: {
    name: 'Лесник Виктор',
    type: 'commoner',
    description: 'Заметил первые признаки гоблинской активности',
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
      perDifficulty: 10,
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
      base: 12,
      variance: 0.2,
      perDifficulty: 6,
      perRarity: 4,
    },
  },

  enemies: {
    types: ['goblin_scout'],
    count: {
      base: 4,
      variance: 0.25,
      perDifficulty: 2,
      perRarity: 0,
    },
    levelBonus: 0,
  },

  isRepeatable: true,
  cooldownHours: 8,
};

// ============================================================================
// ЭКСПОРТ ВСЕХ МИССИЙ
// ============================================================================

export const oakGroveHuntMissions: MissionTemplate[] = [
  huntBoarsCommon,
  huntWolvesCommon,
  clearBanditsUncommon,
  huntAlphaWolfRare,
  clearGoblinsUncommon,
];
