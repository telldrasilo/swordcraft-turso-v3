/**
 * События Забытых Шахт: Древние механизмы
 *
 * Связаны с древними машинами, стражами и загадками.
 * Включают древние механизмы, запечатанные двери, стражей.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// ДРЕВНИЙ МЕХАНИЗМ
// ============================================================================

export const eventForgottenAncientMachinery: EventTemplate = {
  id: 'event_forgotten_ancient_machinery',
  name: 'Древний механизм',
  type: 'choice',
  category: 'discovery',

  title: 'Гудение из глубины',
  description: `В боковом туннеле раздаётся низкий гул — огромный механизм работает сам по себе, хотя шахта заброшена столетия назад. Шестерни вращаются, поршни качаются, но назначение машины непонятно. На корпусе надписи на неизвестном языке.`,
  flavorText: '"Древние не строили просто так. Каждая машина имела цель..."',

  conditions: {
    locationIds: ['forgotten_mines'],
    minProgress: 25,
    maxProgress: 75,
  },

  choices: [
    {
      id: 'examine',
      text: 'Исследовать механизм',
      effects: [
        {
          type: 'grant_location_material',
          materialRarity: 'uncommon',
          materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+2 uncommon материала (echo_stone)',
        },
        {
          type: 'modify_success_chance',
          modifier: -5,
          chance: 30,
          description: 'Риск: механизм может сработать (30%)',
        },
      ],
      resultText: 'Ты исследуешь механизм и находишь странные компоненты.',
    },
    {
      id: 'activate',
      text: 'Попытаться активировать',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: 5,
          chance: 40,
          description: '+5% к успеху (машина помогает)',
        },
        {
          type: 'modify_duration',
          modifier: 180,
          chance: 60,
          description: '+3 минуты (машина мешает)',
        },
      ],
      resultText: 'Механизм реагирует на твои действия...',
    },
    {
      id: 'leave',
      text: 'Не трогать и уйти',
      effects: [
        {
          type: 'narrative_only',
          description: 'Продолжить путь, не тревожа древнюю машину',
        },
      ],
      resultText: 'Ты оставляешь механизм в покое — некоторые вещи лучше не трогать.',
    },
  ],

  weight: 12,
  icon: '⚙️',
};

// ============================================================================
// ЗАПЕЧАТАННАЯ ДВЕРЬ
// ============================================================================

export const eventForgottenSealedDoor: EventTemplate = {
  id: 'event_forgotten_sealed_door',
  name: 'Запечатанная дверь',
  type: 'choice',
  category: 'treasure',

  title: 'Путь закрыт',
  description: `Туннель заканчивается массивной дверью из неизвестного металла. На ней нет ржавчины, хотя остальная шахта проржавела насквозь. Рядом с дверью — панель с символами и углубление для чего-то. За дверью может быть что угодно.`,
  flavorText: '"Древние запечатали это не просто так..."',

  conditions: {
    locationIds: ['forgotten_mines'],
    minProgress: 30,
    maxProgress: 70,
  },

  choices: [
    {
      id: 'force',
      text: 'Попробовать взломать',
      effects: [
        {
          type: 'grant_location_material',
          materialRarity: 'rare',
          materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
          chance: 30,
          description: 'Шанс найти редкий материал (30%)',
        },
        {
          type: 'modify_duration',
          modifier: 240,
          description: '+4 минуты (попытка взлома)',
        },
        {
          type: 'modify_success_chance',
          modifier: -5,
          chance: 50,
          description: 'Риск ловушки (50%)',
        },
      ],
      resultText: 'Ты пытаешься открыть дверь силой...',
    },
    {
      id: 'examine_symbols',
      text: 'Изучить символы',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: 3,
          description: '+3% к успеху (знание символов)',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+2 славы (древние знания)',
        },
      ],
      resultText: 'Символы рассказывают историю древних...',
    },
    {
      id: 'bypass',
      text: 'Искать другой путь',
      effects: [
        {
          type: 'modify_duration',
          modifier: 120,
          description: '+2 минуты (поиск обхода)',
        },
        {
          type: 'grant_location_material',
          materialRarity: 'common',
          materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
          chance: 40,
          description: 'Шанс найти что-то по пути (40%)',
        },
      ],
      resultText: 'Ты ищешь обходной путь вокруг запечатанной двери.',
    },
  ],

  weight: 10,
  icon: '🚪',
};

// ============================================================================
// ДРЕВНИЙ СТРАЖ
// ============================================================================

export const eventForgottenAncientGuardian: EventTemplate = {
  id: 'event_forgotten_ancient_guardian',
  name: 'Древний страж',
  type: 'negative',
  category: 'combat',

  title: 'Тень оживает',
  description: `Из темноты выступает фигура — не призрак, но и не живое существо. Древний страж, созданный из теней и магии, охраняет запретную зону. Его глаза горят холодным светом, и он явно настроен враждебно.`,
  flavorText: '"Стражи не спят. Они ждут."',

  conditions: {
    locationIds: ['forgotten_mines'],
    minProgress: 35,
    maxProgress: 75,
  },

  effects: [
    {
      type: 'modify_success_chance',
      modifier: -10,
      description: '-10% к успеху (бой со стражем)',
    },
    {
      type: 'modify_duration',
      modifier: 180,
      description: '+3 минуты (схватка или побег)',
    },
  ],

  weight: 10,
  icon: '👤',
};

// ============================================================================
// ЭХО ПРОШЛОГО
// ============================================================================

export const eventForgottenEchoes: EventTemplate = {
  id: 'event_forgotten_echoes',
  name: 'Эхо прошлого',
  type: 'neutral',
  category: 'environment',

  title: 'Голоса из ниоткуда',
  description: `Внезапно слышишь голоса — разговор шахтёров, звон инструментов, команды надсмотрщика. Но шахта пуста уже века. Это эхо прошлого, запечатлённое в камне. Звуки становятся громче, затем резко обрываются.`,
  flavorText: '"Камень помнит всё, что происходило здесь..."',

  conditions: {
    locationIds: ['forgotten_mines'],
    minProgress: 20,
    maxProgress: 80,
  },

  effects: [
    {
      type: 'modify_success_chance',
      modifier: 2,
      description: '+2% к успеху (голоса указали путь)',
    },
    {
      type: 'grant_resource',
      resourceId: 'glory',
      quantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+1 славы (мистический опыт)',
    },
  ],

  weight: 14,
  icon: '🔊',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const forgottenAncientEvents: EventTemplate[] = [
  eventForgottenAncientMachinery,
  eventForgottenSealedDoor,
  eventForgottenAncientGuardian,
  eventForgottenEchoes,
];
