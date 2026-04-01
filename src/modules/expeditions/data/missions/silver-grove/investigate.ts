/**
 * Миссии расследования для локации "Серебряный Бор"
 *
 * Расследования — особый тип миссий, связанный с тайнами и загадками
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// ============================================================================
// ИССЛЕДОВАНИЕ ПРОПАВШИХ ПУТНИКОВ (uncommon, normal)
// ============================================================================

export const investigateDisappearancesUncommon: MissionTemplate = {
  id: 'silver_grove_investigate_missing_1',
  locationId: 'silver_grove',

  type: 'investigate',
  rarity: 'uncommon',
  difficulty: 'normal',

  name: 'Следы в серебристой хвое',
  description: `За последний месяц в бору пропало пять путников. Все они шли по официальной тропе, но не добрались до пункта назначения. Егерь нашёл их вещи в стороне от дороги, но тел не обнаружил. Следы ведут вглубь леса и обрываются. Нужно выяснить, что случилось с людьми — и есть ли связь с легендами о Лунной кузнице.`,
  objective: 'Расследовать исчезновения и выяснить судьбу путников',

  client: {
    name: 'Старый егерь Мартин',
    type: 'commoner',
    description: 'Беспокоится за безопасность тропы',
  },

  duration: {
    base: 4500,           // 1 час 15 минут
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
      base: 6,
      variance: 0,
      perDifficulty: 3,
      perRarity: 2,
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

  isRepeatable: true,
  cooldownHours: 10,
};

// ============================================================================
// ТАЙНА ЛУННОЙ МАГИИ (rare, hard)
// ============================================================================

export const investigateLunarMagicRare: MissionTemplate = {
  id: 'silver_grove_investigate_magic_1',
  locationId: 'silver_grove',

  type: 'investigate',
  rarity: 'rare',
  difficulty: 'hard',

  name: 'Серебро луны',
  description: `Отшельник-учёный Эдвард обнаружил странные руны на стволах старых сосен. Надписи появляются только в полнолуние и исчезают на рассвете. Он уверен, что это ключ к пониманию лунной магии, которая пропитывает весь бор. Но чтобы расшифровать руны, нужно собрать их с нескольких деревьев за одну ночь, пока светит полная луна.`,
  objective: 'Собрать данные о лунных рунах и раскрыть тайну магии бора',

  client: {
    name: 'Отшельник-учёный Эдвард',
    type: 'scholar',
    description: 'Посвятил жизнь изучению лунной магии',
  },

  duration: {
    base: 5400,           // 1.5 часа
    variance: 0.3,
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
      base: 180,
      variance: 0.2,
      perDifficulty: 90,
      perRarity: 45,
    },
    glory: {
      base: 10,
      variance: 0,
      perDifficulty: 5,
      perRarity: 3,
    },
    experience: {
      base: 70,
      variance: 0.1,
      perDifficulty: 35,
      perRarity: 18,
    },
    warSoul: {
      base: 30,
      variance: 0.2,
      perDifficulty: 15,
      perRarity: 10,
    },
  },

  enemies: {
    types: ['shadow_hunter', 'moon_wolf'],
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

export const silverGroveInvestigateMissions: MissionTemplate[] = [
  investigateDisappearancesUncommon,
  investigateLunarMagicRare,
];
