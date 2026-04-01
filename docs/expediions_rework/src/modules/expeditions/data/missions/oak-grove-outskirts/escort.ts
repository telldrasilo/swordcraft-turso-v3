/**
 * Миссии сопровождения для локации "Окраины Дубовой Рощи"
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// ПРовожоженный торговца (common, easy)
// ============================================================================

export const escortMerchantCommon: MissionTemplate = {
  id: 'oak_grove_escort_merchant_1',
  locationId: 'oak_grove_outskirts',

  type: 'escort',
  rarity: 'common',
  difficulty: 'easy',

  name: 'Провести торговца',
  description: `Бродячий торговец Фома просит сопроводить его через рощу до тракта. Он слышал о волках и разбойниках и боится идти один, но готов хорошо заплатить за охрану. Караван небольшой — всего одна повозка с товарами, но Путь неблизкий, но если поторопиться
 успеем засветло.`,
  objective: 'Сопроводить торговца до тракта, отразив возможные нападения',

  client: {
    name: 'Торговец Фома',
    type: 'merchant',
    description: 'Невысокий полный человек с хитрыми глазами',
  },

  duration: {
    base: 2400,           // 40 минут
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
      base: 60,
      variance: 0.2,
      perDifficulty: 30,
      perRarity: 15,
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
      base: 6,
      variance: 0.2,
      perDifficulty: 4,
      perRarity: 2,
    },
  },

  enemies: {
    types: ['wild_boar', 'forest_wolf', 'bandit_outcast'],
    count: {
      base: 2,
      variance: 0.5,
      perDifficulty: 1,
      perRarity: 0,
    },
    levelBonus: 0,
  },

  isRepeatable: true,
  cooldownHours: 6,
};

// ============================================================================
// ПРовожожен лесника (common, normal)
// ============================================================================

export const escortHerbalistCommon: MissionTemplate = {
  id: 'oak_grove_escort_herbalist_1',
  locationId: 'oak_grove_outskirts',

  type: 'escort',
  rarity: 'common',
  difficulty: 'normal',

  name: 'Проводник для травницы',
  description: `Травница Агафья собралась собирать редкие травы в глубине рощи и нашла легендарную поляну. о которой говорится, что её отец был тяжёлой день и не может ходить сам — нужен сопровождающий. Сама она уже не молода, но уверенно ориентируется в лесу. Дорога неблизкая, а нужно провести её до нужного места и тщательно выбирать травы.`,
  objective: 'Доставить травницу Агафью на поляну и вернуть вместе',

  client: {
    name: 'Травница Агафья',
    type: 'commoner',
    description: 'Пожилая знахарка, знает лесные тропы',
  },

  duration: {
    base: 3000,           // 50 минут
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
      perRarity: 11,
    },
    glory: {
      base: 2,
      variance: 0,
      perDifficulty: 1,
      perRarity: 1,
    },
    experience: {
      base: 30,
      variance: 0.1,
      perDifficulty: 15,
      perRarity: 8,
    },
    warSoul: {
      base: 4,
      variance: 0.2,
      perDifficulty: 2,
      perRarity: 1,
    },
  },

  isRepeatable: true,
  cooldownHours: 6,
};

// ============================================================================
// ЭКСПОРТ ВСЕХ МИССий
// ============================================================================

export const oakGroveEscortMissions: MissionTemplate[] = [
  escortMerchantCommon,
  escortHerbalistCommon,
];
