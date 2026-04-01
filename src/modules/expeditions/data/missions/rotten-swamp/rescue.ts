/**
 * Миссии спасения для локации "Гнилое Болото"
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// СПАСЕНИЕ ОТ ОТРАВЛЕНИЯ (uncommon, hard)
// ============================================================================

export const rescuePoisonedUncommon: MissionTemplate = {
  id: 'rotten_swamp_rescue_poisoned_1',
  locationId: 'rotten_swamp',

  type: 'rescue',
  rarity: 'uncommon',
  difficulty: 'hard',

  name: 'Отравленный путник',
  description: `Торговец угодил в ядовитую зону болота и получил тяжёлое отравление. Его компаньон сумел выбраться и ищет помощи. Нужно найти торговца и доставить его к болотному целителю, пока токсины не убили его.`,
  objective: 'Найти отравленного торговца и доставить к целителю',

  client: {
    name: 'Компаньон торговца',
    type: 'merchant',
    description: 'Едва выбрался сам, не смог унести друга',
  },

  duration: {
    base: 4500,
    variance: 0.25,
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
      base: 140,
      variance: 0.2,
      perDifficulty: 70,
      perRarity: 35,
    },
    glory: {
      base: 8,
      variance: 0,
      perDifficulty: 4,
      perRarity: 3,
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
    types: ['corpse_worm', 'poison_newt'],
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
// СПАСЕНИЕ ИЗ ЛОВУШКИ (rare, extreme)
// ============================================================================

export const rescueFromTrapRare: MissionTemplate = {
  id: 'rotten_swamp_rescue_trap_1',
  locationId: 'rotten_swamp',

  type: 'rescue',
  rarity: 'rare',
  difficulty: 'extreme',

  name: 'В ловушке лича',
  description: `Группа исследователей попала в ловушку болото-лича — они окружены гнилыми утопленниками и не могут выбраться. Один из них успел отправить сигнал. Нужно пробиться через охрану и вывести людей до того, как лич начнёт свой ритуал.`,
  objective: 'Пробиться к группе и вывести их из зоны опасности',

  client: {
    name: 'Гильдия исследователей',
    type: 'guild',
    description: 'Отправила экспедицию за древними артефактами',
  },

  duration: {
    base: 5400,
    variance: 0.3,
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
      base: 250,
      variance: 0.2,
      perDifficulty: 125,
      perRarity: 63,
    },
    glory: {
      base: 15,
      variance: 0,
      perDifficulty: 8,
      perRarity: 5,
    },
    experience: {
      base: 90,
      variance: 0.1,
      perDifficulty: 45,
      perRarity: 23,
    },
    warSoul: {
      base: 42,
      variance: 0.2,
      perDifficulty: 21,
      perRarity: 14,
    },
  },

  enemies: {
    types: ['rotten_drowned', 'rotten_drowned', 'swamp_lich'],
    count: {
      base: 5,
      variance: 0.25,
      perDifficulty: 2,
      perRarity: 0,
    },
    levelBonus: 1,
  },

  isRepeatable: true,
  cooldownHours: 14,
};

// ============================================================================
// ЭКСПОРТ ВСЕХ МИССИЙ
// ============================================================================

export const rottenSwampRescueMissions: MissionTemplate[] = [
  rescuePoisonedUncommon,
  rescueFromTrapRare,
];
