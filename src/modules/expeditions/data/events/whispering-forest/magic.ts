/**
 * События Шепчущего Леса: Магия и голоса
 *
 * Связаны с голосами деревьев, магией и духами.
 * Включают голоса леса, древних друидов, древо памяти.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// ГОЛОСА ЛЕСА
// ============================================================================

export const eventWhisperVoices: EventTemplate = {
  id: 'event_whisper_voices',
  name: 'Голоса леса',
  type: 'choice',
  category: 'environment',

  title: 'Шёпот со всех сторон',
  description: `Деревья вокруг начинают шептать — голоса накладываются друг на друга, рассказывая тысячи историй одновременно. Некоторые — радостные, некоторые — ужасающие. Шёпот проникает в разум, и становится сложно отличить свои мысли от чужих.`,
  flavorText: '"Лес помнит всё. Вопрос — что он расскажет тебе?"',

  conditions: {
    locationIds: ['whispering_forest'],
    minProgress: 15,
    maxProgress: 85,
  },

  choices: [
    {
      id: 'listen',
      text: 'Прислушаться к голосам',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: 3,
          chance: 50,
          description: '+3% к успеху (полезные знания)',
        },
        {
          type: 'modify_success_chance',
          modifier: -5,
          chance: 50,
          description: '-5% к успеху (переполнение разума)',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+2 славы (древние знания)',
        },
      ],
      resultText: 'Голоса наполняют разум образами прошлого...',
    },
    {
      id: 'block',
      text: 'Закрыть разум (требуется сила воли)',
      effects: [
        {
          type: 'modify_duration',
          modifier: 60,
          description: '+1 минута (концентрация)',
        },
        {
          type: 'modify_success_chance',
          modifier: -2,
          description: '-2% к успеху (напряжение)',
        },
      ],
      resultText: 'Ты блокируешь голоса, но чувствуешь усталость.',
    },
    {
      id: 'embrace',
      text: 'Отдаться голосам',
      effects: [
        {
          type: 'grant_location_material',
          materialRarity: 'rare',
          materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+2 memory_leaf (дар леса)',
        },
        {
          type: 'modify_success_chance',
          modifier: -8,
          description: '-8% к успеху (потеря себя)',
        },
      ],
      resultText: 'Голоса принимают тебя и показывают сокровенное...',
    },
  ],

  weight: 16,
  icon: '🗣️',
};

// ============================================================================
// ДРЕВНИЙ ДРУИД
// ============================================================================

export const eventWhisperAncientDruid: EventTemplate = {
  id: 'event_whisper_ancient_druid',
  name: 'Древний друид',
  type: 'positive',
  category: 'social',

  title: 'Страж леса',
  description: `На поляне стоит фигура в плаще из листьев и коры — друид, древний как сам лес. Его глаза полны мудрости тысячелетий. Он не атакует, а жестом приглашает подойти. Элара — один из немногих, кто может защитить от голосов.`,
  flavorText: '"Я был здесь, когда деревья были ростками. Я останусь, когда они станут прахом."',

  conditions: {
    locationIds: ['whispering_forest'],
    minProgress: 25,
    maxProgress: 75,
  },

  effects: [
    {
      type: 'grant_location_material',
      materialRarity: 'rare',
      materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+2 spirit_wood',
    },
    {
      type: 'grant_location_material',
      materialRarity: 'uncommon',
      materialQuantity: { base: 3, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+3 dream_resin',
    },
    {
      type: 'modify_success_chance',
      modifier: 5,
      description: '+5% к успеху (благословение друида)',
    },
    {
      type: 'modify_duration',
      modifier: -120,
      description: '-2 минуты (друид указал путь)',
    },
  ],

  weight: 8,
  icon: '🧙',
};

// ============================================================================
// ДРЕВО ПАМЯТИ
// ============================================================================

export const eventWhisperMemoryTree: EventTemplate = {
  id: 'event_whisper_memory_tree',
  name: 'Древо памяти',
  type: 'positive',
  category: 'discovery',

  title: 'Самое старое дерево',
  description: `В центре поляны возвышается дуб, возраст которого исчисляется тысячелетиями. Его кора покрыта символами, а корни уходят в бесконечность. Древо помнит всё, что произошло под его кроной, и готово поделиться памятью.`,
  flavorText: '"Каждый лист — воспоминание. Каждая ветвь — история."',

  conditions: {
    locationIds: ['whispering_forest'],
    minProgress: 30,
    maxProgress: 70,
  },

  effects: [
    {
      type: 'grant_location_material',
      materialRarity: 'rare',
      materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+2 memory_leaf',
    },
    {
      type: 'grant_location_material',
      materialRarity: 'epic',
      materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
      chance: 25,
      description: 'Шанс найти ancient_sap (25%)',
    },
    {
      type: 'modify_success_chance',
      modifier: 4,
      description: '+4% к успеху (знание прошлого)',
    },
  ],

  weight: 10,
  icon: '🌳',
};

// ============================================================================
// ТЕНЕВОЕ "Я"
// ============================================================================

export const eventWhisperShadowSelf: EventTemplate = {
  id: 'event_whisper_shadow_self',
  name: 'Теневое "я"',
  type: 'choice',
  category: 'danger',

  title: 'Двойник',
  description: `Из тени дерева выходит фигура — точная копия тебя. Она двигается синхронно, но с небольшой задержкой. Теневое "я" — отражение, созданное голосами леса из твоих страхов и сомнений. Оно улыбается твоей улыбкой.`,
  flavorText: '"Лес показывает всем их истинное лицо. Готов ли ты встретиться с собой?"',

  conditions: {
    locationIds: ['whispering_forest'],
    minProgress: 35,
    maxProgress: 75,
  },

  choices: [
    {
      id: 'accept',
      text: 'Принять своё отражение',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: 5,
          description: '+5% к успеху (примирение с собой)',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 3, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+3 славы (преодоление)',
        },
      ],
      resultText: 'Тень растворяется, принимая тебя таким, какой ты есть.',
    },
    {
      id: 'fight',
      text: 'Атаковать двойника',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: -6,
          description: '-6% к успеху (бой с собой)',
        },
        {
          type: 'modify_duration',
          modifier: 180,
          description: '+3 минуты (сражение)',
        },
      ],
      resultText: 'Тень отвечает ударом на удар — это бой без победителя.',
    },
    {
      id: 'deny',
      text: 'Отрицать его существование',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: -3,
          description: '-3% к успеху (тень следует за тобой)',
        },
        {
          type: 'modify_duration',
          modifier: 60,
          description: '+1 минута (уход)',
        },
      ],
      resultText: 'Тень не исчезает — она следует за тобой.',
    },
  ],

  weight: 10,
  icon: '👤',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const whisperingMagicEvents: EventTemplate[] = [
  eventWhisperVoices,
  eventWhisperAncientDruid,
  eventWhisperMemoryTree,
  eventWhisperShadowSelf,
];
