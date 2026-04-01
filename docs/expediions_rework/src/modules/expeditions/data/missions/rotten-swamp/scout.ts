/**
 * Миссии разведки для локации "Гнилое Болото"
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// ПОИСК БЕЗОПАСНОЙ ТРОПЫ (common, normal)
// ============================================================================

export const scoutSafePathCommon: MissionTemplate = {
  id: 'rotten_swamp_scout_path_1',
  locationId: 'rotten_swamp',

  type: 'scout',
  rarity: 'common',
  difficulty: 'normal',

  name: 'Тропа через яд',
  description: `Выживший в болоте знает тропу, по которой можно пересечь топь безопасно. Но после последнего отравления он забыл часть ориентиров. Нужно пройти по маршруту и обновить метки, чтобы другие могли пользоваться путём.`,
  objective: 'Проложить и отметить безопасную тропу через болото',

  client: {
    name: 'Выживший Торн',
    type: 'commoner',
    description: 'Приспособился к жизни в токсичной среде',
  },

  duration: {
    base: 3600,
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
      base: 85,
      variance: 0.2,
      perDifficulty: 43,
      perRarity: 22,
    },
    glory: {
      base: 4,
      variance: 0,
      perDifficulty: 2,
      perRarity: 1,
    },
    experience: {
      base: 36,
      variance: 0.1,
      perDifficulty: 18,
      perRarity: 9,
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
// ПОИСК ИСТОЧНИКА ТОКСИНОВ (uncommon, hard)
// ============================================================================

export const scoutToxinSourceUncommon: MissionTemplate = {
  id: 'rotten_swamp_scout_toxin_1',
  locationId: 'rotten_swamp',

  type: 'scout',
  rarity: 'uncommon',
  difficulty: 'hard',

  name: 'Сердце гниения',
  description: `Отравитель Скальд слышал легенду о Сердце гниения — источнике всей токсичности болота. Это древний артефакт, который когда-то был оружием. Если найти его, можно изучить его свойства или уничтожить.`,
  objective: 'Найти местоположение Сердца гниения',

  client: {
    name: 'Отравитель Скальд',
    type: 'scholar',
    description: 'Ищет древние яды и их источники',
  },

  duration: {
    base: 5400,
    variance: 0.3,
    perDifficulty: 600,
    perRarity: 300,
  },

  cost: {
    supplies: {
      base: 28,
      variance: 0.1,
      perDifficulty: 14,
      perRarity: 7,
    },
    deposit: {
      base: 55,
      variance: 0.1,
      perDifficulty: 28,
      perRarity: 14,
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
      base: 8,
      variance: 0,
      perDifficulty: 4,
      perRarity: 3,
    },
    experience: {
      base: 58,
      variance: 0.1,
      perDifficulty: 29,
      perRarity: 15,
    },
    warSoul: {
      base: 26,
      variance: 0.2,
      perDifficulty: 13,
      perRarity: 9,
    },
  },

  enemies: {
    types: ['rotten_drowned', 'poison_newt'],
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
// ЧРЕВО ГНИЕНИЯ (rare, extreme)
// ============================================================================

export const scoutWombOfRotRare: MissionTemplate = {
  id: 'rotten_swamp_scout_womb_1',
  locationId: 'rotten_swamp',

  type: 'scout',
  rarity: 'rare',
  difficulty: 'extreme',

  name: 'Чрево гниения',
  description: `В центре болота есть место, где гниение останавливается — тела там не разлагаются, а консервируются в странной жидкости. Это вход в подземелье, охраняемое болото-личом. Дух утопленника просит найти это место, чтобы освободить души, заточённые там.`,
  objective: 'Найти вход в Чрево гниения',

  client: {
    name: 'Дух утопленника',
    type: 'commoner',
    description: 'Хочет освободить других духов',
  },

  duration: {
    base: 7200,
    variance: 0.3,
    perDifficulty: 600,
    perRarity: 300,
  },

  cost: {
    supplies: {
      base: 38,
      variance: 0.1,
      perDifficulty: 19,
      perRarity: 10,
    },
    deposit: {
      base: 75,
      variance: 0.1,
      perDifficulty: 38,
      perRarity: 19,
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
      base: 95,
      variance: 0.1,
      perDifficulty: 48,
      perRarity: 24,
    },
    warSoul: {
      base: 45,
      variance: 0.2,
      perDifficulty: 23,
      perRarity: 15,
    },
  },

  enemies: {
    types: ['swamp_lich', 'rotten_drowned'],
    count: {
      base: 3,
      variance: 0.5,
      perDifficulty: 1,
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

export const rottenSwampScoutMissions: MissionTemplate[] = [
  scoutSafePathCommon,
  scoutToxinSourceUncommon,
  scoutWombOfRotRare,
];
