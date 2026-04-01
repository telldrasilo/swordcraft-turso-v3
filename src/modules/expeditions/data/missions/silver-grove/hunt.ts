/**
 * Боевые миссии для локации "Серебряный Бор"
 *
 * Враги из локации:
 * - Серебряный паук (silver_spider) [3-6 ур.]
 * - Лунный волк (moon_wolf) [4-7 ур., стаи по 3]
 * - Оборотень-одиночка (werewolf_lonely) [5-9 ур.]
 * - Теневой охотник (shadow_hunter) [6-10 ур.]
 *
 * Особенность: ночью враги становятся сильнее
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// ОХОТА НА СЕРЕБРЯНЫХ ПАУКОВ (common, normal)
// ============================================================================

export const huntSilverSpidersCommon: MissionTemplate = {
  id: 'silver_grove_hunt_spiders_1',
  locationId: 'silver_grove',

  type: 'hunt',
  rarity: 'common',
  difficulty: 'normal',

  name: 'Серебряные сети',
  description: `Старый егерь сообщает о серебряных пауках, оплетших северную часть бора. Их сети прочнее стали и блестят в лунном свете. Животные обходят это место стороной, а охотники находят в паутине останки оленей и кабанов. Егерь просит расчистить территорию, прежде чем пауки распространятся дальше.`,
  objective: 'Уничтожить 4-6 серебряных пауков',

  client: {
    name: 'Старый егерь Мартин',
    type: 'commoner',
    description: 'Следит за порядком в бору много лет',
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
      base: 90,
      variance: 0.2,
      perDifficulty: 45,
      perRarity: 23,
    },
    glory: {
      base: 4,
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

  enemies: {
    types: ['silver_spider'],
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
// ОХОТА НА ЛУННЫХ ВОЛКОВ (uncommon, normal)
// ============================================================================

export const huntMoonWolvesUncommon: MissionTemplate = {
  id: 'silver_grove_hunt_wolves_1',
  locationId: 'silver_grove',

  type: 'hunt',
  rarity: 'uncommon',
  difficulty: 'normal',

  name: 'Стая лунных волков',
  description: `Лунные волки — не обычные хищники. Их шерсть отливает серебром, а глаза светятся красным в темноте. Стая обосновалась в центре бора и охотится на всё живое. Серебряных дел мастер беспокоится за свои запасы — волков привлекает запах серебра. Старый егерь говорит, что стаю нужно проредить, иначе они начнут нападать на людей.`,
  objective: 'Уничтожить 5-7 лунных волков из стаи',

  client: {
    name: 'Серебряных дел мастер Ансельм',
    type: 'merchant',
    description: 'Живёт на краю бора, кует изделия из серебра',
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
      base: 120,
      variance: 0.2,
      perDifficulty: 60,
      perRarity: 30,
    },
    glory: {
      base: 6,
      variance: 0,
      perDifficulty: 3,
      perRarity: 2,
    },
    experience: {
      base: 48,
      variance: 0.1,
      perDifficulty: 24,
      perRarity: 12,
    },
    warSoul: {
      base: 20,
      variance: 0.2,
      perDifficulty: 10,
      perRarity: 7,
    },
  },

  enemies: {
    types: ['moon_wolf'],
    count: {
      base: 5,
      variance: 0.2,
      perDifficulty: 2,
      perRarity: 0,
    },
    levelBonus: 1,
  },

  isRepeatable: true,
  cooldownHours: 8,
};

// ============================================================================
// ОХОТА НА ОБОРОТНЯ (rare, hard)
// ============================================================================

export const huntWerewolfRare: MissionTemplate = {
  id: 'silver_grove_hunt_werewolf_1',
  locationId: 'silver_grove',

  type: 'hunt',
  rarity: 'rare',
  difficulty: 'hard',

  name: 'Проклятый бора',
  description: `В глубине Серебряного Бора живёт оборотень-одиночка. Это проклятый человек, не желающий нападать на людей, но не способный контролировать свою звериную суть в полнолуние. Жители ближней деревни терпят его, но после последнего полнолуния он задрал троих. Староста просит положить конец его страданиям — оборотень сам просил об этом в человеческом облике.`,
  objective: 'Найти и убить оборотня',

  client: {
    name: 'Староста деревни Хвойная',
    type: 'farmer',
    description: 'Деревня на краю бора, страдает от нападений',
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
    types: ['werewolf_lonely'],
    count: {
      base: 1,
      variance: 0,
      perDifficulty: 0,
      perRarity: 0,
    },
    levelBonus: 3,
  },

  isRepeatable: true,
  cooldownHours: 12,
};

// ============================================================================
// ТЕНЕВОЙ ОХОТНИК (rare, hard)
// ============================================================================

export const huntShadowHunterRare: MissionTemplate = {
  id: 'silver_grove_hunt_shadow_1',
  locationId: 'silver_grove',

  type: 'hunt',
  rarity: 'rare',
  difficulty: 'hard',

  name: 'Охотник из тени',
  description: `Теневой охотник — существо, появляющееся только ночью. Оно не имеет материальной формы при свете дня, но в темноте становится смертельно опасным. Отшельник-учёный говорит, что это древний дух, охраняющий тайны бора. Охотник начал нападать на всех, кто приближается к Лунной кузнице. Нужно уничтожить его или отогнать.`,
  objective: 'Победить теневого охотника',

  client: {
    name: 'Отшельник-учёный Эдвард',
    type: 'scholar',
    description: 'Изучает лунную магию и тайны бора',
  },

  duration: {
    base: 5400,           // 1.5 часа
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
      base: 210,
      variance: 0.2,
      perDifficulty: 105,
      perRarity: 53,
    },
    glory: {
      base: 14,
      variance: 0,
      perDifficulty: 7,
      perRarity: 5,
    },
    experience: {
      base: 80,
      variance: 0.1,
      perDifficulty: 40,
      perRarity: 20,
    },
    warSoul: {
      base: 40,
      variance: 0.2,
      perDifficulty: 20,
      perRarity: 13,
    },
  },

  enemies: {
    types: ['shadow_hunter'],
    count: {
      base: 1,
      variance: 0,
      perDifficulty: 0,
      perRarity: 0,
    },
    levelBonus: 2,
  },

  isRepeatable: true,
  cooldownHours: 12,
};

// ============================================================================
// ЭКСПОРТ ВСЕХ МИССИЙ
// ============================================================================

export const silverGroveHuntMissions: MissionTemplate[] = [
  huntSilverSpidersCommon,
  huntMoonWolvesUncommon,
  huntWerewolfRare,
  huntShadowHunterRare,
];
