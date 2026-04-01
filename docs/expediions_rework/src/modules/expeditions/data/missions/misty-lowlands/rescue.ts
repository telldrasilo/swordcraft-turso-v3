/**
 * Миссии спасения для локации "Туманные Низины"
 *
 * Спасательные миссии в опасной болотистой местности
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// СПАСЕНИЕ ЗАБЛУДИВШЕГОСЯ ПУТНИКА (common, normal)
// ============================================================================

export const rescueLostTravelerCommon: MissionTemplate = {
  id: 'misty_lowlands_rescue_traveler_1',
  locationId: 'misty_lowlands',

  type: 'rescue',
  rarity: 'common',
  difficulty: 'normal',

  name: 'Заблудившийся в тумане',
  description: `Торговый караван сообщил о потерявшемся спутнике. Молодой парень отстал в густом тумане и не смог найти дорогу обратно. Его видели на краю низин, но с тех пор прошло несколько часов. Старый рыбак знает эти места и может подсказать направление поиска, но сам идти не может — ноги больные. Нужно найти путника, пока он не забрёл в трясину.`,
  objective: 'Найти и вывести заблудившегося путника из низин',

  client: {
    name: 'Торговец Гюнтер',
    type: 'merchant',
    description: 'Беспокоится за пропавшего работника',
  },

  duration: {
    base: 3600,           // 1 час
    variance: 0.25,
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
      base: 90,
      variance: 0.2,
      perDifficulty: 45,
      perRarity: 23,
    },
    glory: {
      base: 6,
      variance: 0,
      perDifficulty: 3,
      perRarity: 2,
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

  isRepeatable: true,
  cooldownHours: 8,
};

// ============================================================================
// СПАСЕНИЕ ИЗ ТРЯСИНЫ (uncommon, hard)
// ============================================================================

export const rescueFromQuagmireUncommon: MissionTemplate = {
  id: 'misty_lowlands_rescue_quagmire_1',
  locationId: 'misty_lowlands',

  type: 'rescue',
  rarity: 'uncommon',
  difficulty: 'hard',

  name: 'Засасывает в бездну',
  description: `Юный следопыт, ученик старого рыбака, угодил в глубокую трясину. Он подаёт сигналы свистом, но выбраться сам не может — трясина держит его по пояс и медленно затягивает дальше. Старик не может добраться до него — его не хватит вытянуть парня. Нужно спешить, пока трясина не поглотила юношу целиком.`,
  objective: 'Добраться до места и вытащить парня из трясины',

  client: {
    name: 'Старый рыбак Одо',
    type: 'commoner',
    description: 'Учитель попавшего в беду юного следопыта',
  },

  duration: {
    base: 4500,           // 1 час 15 минут
    variance: 0.3,
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
      base: 130,
      variance: 0.2,
      perDifficulty: 65,
      perRarity: 33,
    },
    glory: {
      base: 8,
      variance: 0,
      perDifficulty: 4,
      perRarity: 3,
    },
    experience: {
      base: 50,
      variance: 0.1,
      perDifficulty: 25,
      perRarity: 13,
    },
    warSoul: {
      base: 20,
      variance: 0.2,
      perDifficulty: 10,
      perRarity: 7,
    },
  },

  enemies: {
    types: ['giant_leech', 'bog_walker'],
    count: {
      base: 1,
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
// ЭКСПОРТ ВСЕХ МИССИЙ
// ============================================================================

export const mistyLowlandsRescueMissions: MissionTemplate[] = [
  rescueLostTravelerCommon,
  rescueFromQuagmireUncommon,
];
