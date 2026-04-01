/**
 * Общие события: Путевые
 *
 * События, связанные с передвижением по локации.
 * Включают перекрёстки, броды, короткие пути и препятствия.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// ПЕРЕКРЁСТОК
// ============================================================================

export const eventCommonCrossroads: EventTemplate = {
  id: 'event_common_crossroads',
  name: 'Перекрёсток',
  type: 'neutral',
  category: 'travel',

  title: 'Развилка дорог',
  description: `Тропа разветвляется на несколько направлений. Одна дорога выглядит более протоптанной, другая заросла, но ведёт куда-то вглубь территории. Третья почти скрыта — похоже, её намеренно прятали.`,
  flavorText: 'Каждый выбор — это путь, от которого нельзя отказаться...',

  conditions: {
    minProgress: 15,
    maxProgress: 85,
  },

  effects: [
    {
      type: 'narrative_only',
      description: 'Выбор пути (без игрового эффекта)',
    },
  ],

  weight: 20,
  icon: '🔀',
};

// ============================================================================
// БРОД
// ============================================================================

export const eventCommonFord: EventTemplate = {
  id: 'event_common_ford',
  name: 'Брод',
  type: 'neutral',
  category: 'travel',

  title: 'Переправа через реку',
  description: `На пути река — неглубокая, но широкая. Моста нет, только старые валуны, выступающие из воды. Можно попытаться перебраться по камням или поискать другой путь вверх по течению.`,
  flavorText: 'Вода не любит спешки...',

  conditions: {
    locationTypes: ['forest', 'mountain', 'swamp'],
    minProgress: 20,
    maxProgress: 80,
  },

  effects: [
    {
      type: 'modify_duration',
      modifier: 120,
      description: '+2 минуты к времени (переправа)',
    },
  ],

  weight: 18,
  icon: '🌊',
};

// ============================================================================
// КОРОТКИЙ ПУТЬ
// ============================================================================

export const eventCommonShortcut: EventTemplate = {
  id: 'event_common_shortcut',
  name: 'Короткий путь',
  type: 'positive',
  category: 'travel',

  title: 'Срезая путь',
  description: `Опытный глаз заметил возможность срезать угол — узкая расщелина в скалах или почти незаметная тропка через чащу. Путь рискованный, но может сэкономить много времени.`,
  flavorText: 'Не все короткие пути ведут к цели быстрее...',

  conditions: {
    minProgress: 30,
    maxProgress: 70,
  },

  effects: [
    {
      type: 'modify_duration',
      modifier: -240,
      description: '-4 минуты к времени',
    },
    {
      type: 'modify_success_chance',
      modifier: -3,
      description: '-3% к успеху (рискованный путь)',
    },
  ],

  weight: 15,
  icon: '⚡',
};

// ============================================================================
// ПРЕПЯТСТВИЕ
// ============================================================================

export const eventCommonObstacle: EventTemplate = {
  id: 'event_common_obstacle',
  name: 'Препятствие',
  type: 'negative',
  category: 'travel',

  title: 'Путь преграждён',
  description: `Дорогу преграждает упавшее дерево или обвалившаяся скала. Обход займёт время, а попытка перебраться через препятствие — риск для здоровья и снаряжения.`,
  flavorText: 'Иногда лучший путь — в обход...',

  conditions: {
    locationTypes: ['forest', 'mountain', 'mine'],
    minProgress: 25,
    maxProgress: 75,
  },

  effects: [
    {
      type: 'modify_duration',
      modifier: 180,
      description: '+3 минуты к времени (обход препятствия)',
    },
    {
      type: 'damage_weapon',
      modifier: 3,
      description: '-3% прочности оружия',
    },
  ],

  weight: 18,
  icon: '🚧',
};

// ============================================================================
// ПРЕДЛОЖЕНИЕ ПРОВОДНИКА
// ============================================================================

export const eventCommonGuideOffer: EventTemplate = {
  id: 'event_common_guide_offer',
  name: 'Предложение проводника',
  type: 'choice',
  category: 'travel',

  title: 'Местный проводник',
  description: `На тропе встретился местный житель — измождённый, но со светлыми глазами. Он предлагает провести коротким путём за небольшую плату. Путь опасный, но он знает каждую тропинку.`,
  flavorText: '"Доверься мне, странник. Я хожу здесь с детства."',

  conditions: {
    minProgress: 20,
    maxProgress: 60,
  },

  choices: [
    {
      id: 'accept',
      text: 'Согласиться на проводника',
      effects: [
        {
          type: 'grant_resource',
          resourceId: 'gold',
          quantity: { base: -20, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '-20 золота (плата проводнику)',
        },
        {
          type: 'modify_duration',
          modifier: -300,
          description: '-5 минут к времени (короткий путь)',
        },
        {
          type: 'modify_success_chance',
          modifier: 5,
          description: '+5% к успеху (помощь проводника)',
        },
      ],
      resultText: 'Проводник сдержал слово — путь оказался коротким и безопасным.',
    },
    {
      id: 'decline',
      text: 'Отказаться и идти самостоятельно',
      effects: [
        {
          type: 'narrative_only',
          description: 'Продолжить путь самостоятельно',
        },
      ],
      resultText: 'Вы решили не доверять незнакомцу и продолжить путь одни.',
    },
    {
      id: 'negotiate',
      text: 'Попробовать договориться о меньшей плате',
      effects: [
        {
          type: 'grant_resource',
          resourceId: 'gold',
          quantity: { base: -10, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '-10 золота (удалось сторговаться)',
        },
        {
          type: 'modify_duration',
          modifier: -180,
          description: '-3 минуты к времени',
        },
      ],
      resultText: 'После долгих уговоров проводник согласился на меньшую плату.',
    },
  ],

  weight: 12,
  icon: '🧭',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const commonTravelEvents: EventTemplate[] = [
  eventCommonCrossroads,
  eventCommonFord,
  eventCommonShortcut,
  eventCommonObstacle,
  eventCommonGuideOffer,
];
