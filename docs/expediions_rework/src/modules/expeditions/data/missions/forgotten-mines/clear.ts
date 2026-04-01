/**
 * Миссии зачистки для локации "Забытые Шахты"
 *
 * Зачистка — освобождение территорий от врагов для последующего использования
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// ЗАЧИСТКА ВЕРХНЕЙ ШТОЛЬНИ (uncommon, hard)
// ============================================================================

export const clearUpperShaftUncommon: MissionTemplate = {
  id: 'forgotten_mines_clear_upper_1',
  locationId: 'forgotten_mines',

  type: 'clear',
  rarity: 'uncommon',
  difficulty: 'hard',

  name: 'Освобождение штольни',
  description: `Группа исследователей хочет использовать верхнюю штольню как базу для экспедиций вглубь шахты. Но туннель заполонили глубинные ползуны и древние призраки. Нужно зачистить территорию и сделать её безопасной для обустройства лагеря.`,
  objective: 'Зачистить верхнюю штольню от всех врагов',

  client: {
    name: 'Экспедиционный корпус',
    type: 'guild',
    description: 'Организует научные экспедиции в шахты',
  },

  duration: {
    base: 5400,
    variance: 0.25,
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
      base: 160,
      variance: 0.2,
      perDifficulty: 80,
      perRarity: 40,
    },
    glory: {
      base: 9,
      variance: 0,
      perDifficulty: 5,
      perRarity: 3,
    },
    experience: {
      base: 60,
      variance: 0.1,
      perDifficulty: 30,
      perRarity: 15,
    },
    warSoul: {
      base: 28,
      variance: 0.2,
      perDifficulty: 14,
      perRarity: 9,
    },
  },

  enemies: {
    types: ['deep_crawler', 'ancient_miner_ghost'],
    count: {
      base: 6,
      variance: 0.2,
      perDifficulty: 2,
      perRarity: 0,
    },
    levelBonus: 0,
  },

  isRepeatable: true,
  cooldownHours: 10,
};

// ============================================================================
// ЗАЧИСТКА ЗАПРЕТНОЙ ЗОНЫ (rare, extreme)
// ============================================================================

export const clearForbiddenZoneRare: MissionTemplate = {
  id: 'forgotten_mines_clear_forbidden_1',
  locationId: 'forgotten_mines',

  type: 'clear',
  rarity: 'rare',
  difficulty: 'extreme',

  name: 'Врата древних',
  description: `Глубоко в шахте есть зона, которую древние запечатали millennia назад. Теневые стражи охраняют подступы, а эхо-тварь охотится в туннелях. Если зачистить эту зону, можно будет изучить машины древних и, возможно, найти вход в их кузницу.`,
  objective: 'Зачистить запретную зону от всех стражей',

  client: {
    name: 'Уцелевший исследователь Карл',
    type: 'scholar',
    description: 'Хочет вернуться и закончить исследования',
  },

  duration: {
    base: 7200,
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
      base: 320,
      variance: 0.2,
      perDifficulty: 160,
      perRarity: 80,
    },
    glory: {
      base: 18,
      variance: 0,
      perDifficulty: 9,
      perRarity: 6,
    },
    experience: {
      base: 110,
      variance: 0.1,
      perDifficulty: 55,
      perRarity: 28,
    },
    warSoul: {
      base: 55,
      variance: 0.2,
      perDifficulty: 28,
      perRarity: 18,
    },
  },

  enemies: {
    types: ['shadow_guard', 'shadow_guard', 'echo_beast'],
    count: {
      base: 4,
      variance: 0.25,
      perDifficulty: 2,
      perRarity: 0,
    },
    levelBonus: 2,
  },

  isRepeatable: true,
  cooldownHours: 16,
};

// ============================================================================
// ЭКСПОРТ ВСЕХ МИССИЙ
// ============================================================================

export const forgottenMinesClearMissions: MissionTemplate[] = [
  clearUpperShaftUncommon,
  clearForbiddenZoneRare,
];
