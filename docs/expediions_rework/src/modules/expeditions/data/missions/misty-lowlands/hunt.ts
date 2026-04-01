/**
 * Боевые миссии для локации "Туманные Низины"
 *
 * Враги из локации:
 * - Гигантская пиявка (giant_leech) [1-3 ур.]
 * - Болтоходец (bog_walker) [2-5 ур.]
 * - Туманный призрак (mist_ghost) [3-6 ур.]
 * - Трясинная гидра (swamp_hydra) [4-8 ур.]
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// ОХОТА НА ПИЯВОК (common, easy)
// ============================================================================

export const huntLeechesCommon: MissionTemplate = {
  id: 'misty_lowlands_hunt_leeches_1',
  locationId: 'misty_lowlands',

  type: 'hunt',
  rarity: 'common',
  difficulty: 'easy',

  name: 'Кровососы трясины',
  description: `Местный рыбак жалуется на гигантских пиявок, которые расплодились в его любимом месте лова. Твари размером с руку присасываются к любому, кто войдёт в воду, и высасывают кровь до обморока. Старик боится за внуков, которые иногда приходят с ним на рыбалку. Нужно уничтожить пиявок в мелководном заливе, чтобы сделать место безопасным.`,
  objective: 'Уничтожить 4-6 гигантских пиявок в заливе',

  client: {
    name: 'Старый рыбак Одо',
    type: 'commoner',
    description: 'Пожилой мужчина, знающий болото лучше всех',
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
    types: ['giant_leech'],
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
// ОХОТА НА БОЛТОХОДЦЕВ (common, normal)
// ============================================================================

export const huntBogWalkersCommon: MissionTemplate = {
  id: 'misty_lowlands_hunt_walkers_1',
  locationId: 'misty_lowlands',

  type: 'hunt',
  rarity: 'common',
  difficulty: 'normal',

  name: 'Восставшие из трясины',
  description: `Путники сообщают о болтоходцах — зомбиподобных существах, поднимающихся из топи. Они бродят по низинам в поисках живой плоти, их тела покрыты тиной и болотным мхом. Местные говорят, что это утопленники, не нашедшие покоя. Тропа через низины становится опасной, и торговцы просят зачистить территорию.`,
  objective: 'Уничтожить 4-5 болтоходцев в низинах',

  client: {
    name: 'Торговец Гюнтер',
    type: 'merchant',
    description: 'Регулярно провозит товары через низины',
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
    types: ['bog_walker'],
    count: {
      base: 4,
      variance: 0.25,
      perDifficulty: 1,
      perRarity: 0,
    },
    levelBonus: 0,
  },

  isRepeatable: true,
  cooldownHours: 6,
};

// ============================================================================
// ТУМАННЫЕ ПРИЗРАКИ (uncommon, normal)
// ============================================================================

export const huntMistGhostsUncommon: MissionTemplate = {
  id: 'misty_lowlands_hunt_ghosts_1',
  locationId: 'misty_lowlands',

  type: 'hunt',
  rarity: 'uncommon',
  difficulty: 'normal',

  name: 'Голоса в тумане',
  description: `Туманные призраки стали агрессивны в последнее время. Полупрозрачные фигуры скользят сквозь мглу, их взгляд замораживает кровь, а прикосновение высасывает жизненные силы. Болотная ведьма говорит, что призраки чем-то потревожены — возможно, кто-то потревожил их покой в затонувшем городе. Нужно успокоить несколько духов, пока они не напали на деревню.`,
  objective: 'Уничтожить 3-5 туманных призраков',

  client: {
    name: 'Болотная ведьма Марга',
    type: 'scholar',
    description: 'Знает тайны низин, живёт в хижине на сваях',
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
    types: ['mist_ghost'],
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
// ТРЯСИННАЯ ГИДРА (rare, hard)
// ============================================================================

export const huntSwampHydraRare: MissionTemplate = {
  id: 'misty_lowlands_hunt_hydra_1',
  locationId: 'misty_lowlands',

  type: 'hunt',
  rarity: 'rare',
  difficulty: 'hard',

  name: 'Многоголовая тварь',
  description: `В глубине болота объявилась трясинная гидра — чудовище с несколькими головами на длинных шеях. Она обитает в глубокой заводи и выбирается на охоту ночью. Тварь уже утащила несколько коров с пастбищ на краю низин, и староста ближней деревни опасается, что следующими будут люди. Гидра опасна — отрубленная голова отрастает заново, если не прижечь рану огнём.`,
  objective: 'Убить трясинную гидру и её отродей',

  client: {
    name: 'Староста деревни Ольховка',
    type: 'farmer',
    description: 'Объединил несколько деревень для награды за убийство чудовища',
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
    types: ['swamp_hydra', 'giant_leech', 'giant_leech'],
    count: {
      base: 4,
      variance: 0.2,
      perDifficulty: 2,
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

export const mistyLowlandsHuntMissions: MissionTemplate[] = [
  huntLeechesCommon,
  huntBogWalkersCommon,
  huntMistGhostsUncommon,
  huntSwampHydraRare,
];
