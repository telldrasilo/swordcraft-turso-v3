/**
 * Миссии разведки для локации "Забытые Шахты"
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// КАРТА ВЕРХНИХ УРОВНЕЙ (common, normal)
// ============================================================================

export const scoutUpperLevelsCommon: MissionTemplate = {
  id: 'forgotten_mines_scout_upper_1',
  locationId: 'forgotten_mines',

  type: 'scout',
  rarity: 'common',
  difficulty: 'normal',

  name: 'Карта забытого',
  description: `Спелеолог Арнис хочет составить карту верхних уровней шахты. Древние туннели простираются на многие мили, и без карты легко заблудиться. Карта поможет будущим исследователям и спасателям ориентироваться в лабиринте штолен.`,
  objective: 'Исследовать и нанести на карту верхние уровни шахты',

  client: {
    name: 'Спелеолог Арнис',
    type: 'scholar',
    description: 'Документирует древние подземные сооружения',
  },

  duration: {
    base: 3600,
    variance: 0.25,
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

  isRepeatable: true,
  cooldownHours: 6,
};

// ============================================================================
// ПОИСК ЗАПЕЧАТАННОЙ ДВЕРИ (uncommon, hard)
// ============================================================================

export const scoutSealedDoorUncommon: MissionTemplate = {
  id: 'forgotten_mines_scout_door_1',
  locationId: 'forgotten_mines',

  type: 'scout',
  rarity: 'uncommon',
  difficulty: 'hard',

  name: 'Запечатанный вход',
  description: `Старый контрабандист Рурк слышал о запечатанной двери где-то в глубине шахты. Надписи на ней гласят: "НЕ ПРОБУЖДАЙТЕ". За дверью слышен тихий гул. Рурк хочет узнать, что там находится, но сам идти боится.`,
  objective: 'Найти запечатанную дверь и оценить её состояние',

  client: {
    name: 'Старый контрабандист Рурк',
    type: 'merchant',
    description: 'Любопытство перевешивает страх',
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
      base: 130,
      variance: 0.2,
      perDifficulty: 65,
      perRarity: 33,
    },
    glory: {
      base: 7,
      variance: 0,
      perDifficulty: 4,
      perRarity: 2,
    },
    experience: {
      base: 52,
      variance: 0.1,
      perDifficulty: 26,
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
    types: ['deep_crawler', 'ancient_miner_ghost'],
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
// КУЗНЯ ДРЕВНИХ (rare, hard)
// ============================================================================

export const scoutAncientForgeRare: MissionTemplate = {
  id: 'forgotten_mines_scout_forge_1',
  locationId: 'forgotten_mines',

  type: 'scout',
  rarity: 'rare',
  difficulty: 'hard',

  name: 'Машины глубин',
  description: `В самой глубокой части шахт находится огромный зал с машинами, работающими сами по себе. Древние, построившие это место, не были людьми. Спелеолог Арнис мечтает увидеть эти машины и понять их назначение. Но путь туда лежит через самые опасные зоны шахты.`,
  objective: 'Добраться до кузни древних и вернуться с информацией',

  client: {
    name: 'Спелеолог Арнис',
    type: 'scholar',
    description: 'Посвятил жизнь изучению этого места',
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
    types: ['shadow_guard', 'echo_beast'],
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

export const forgottenMinesScoutMissions: MissionTemplate[] = [
  scoutUpperLevelsCommon,
  scoutSealedDoorUncommon,
  scoutAncientForgeRare,
];
