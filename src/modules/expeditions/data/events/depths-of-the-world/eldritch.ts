/**
 * События Глубин Подземелий: Элдрич и древние
 *
 * Связаны с глубинными ужасами, аномалиями и древними машинами.
 * Включают зов бездны, древние машины, живую породу.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// ШЁПОТ БЕЗДНЫ
// ============================================================================

export const eventDepthsVoidWhisper: EventTemplate = {
  id: 'event_depths_void_whisper',
  name: 'Шёпот бездны',
  type: 'choice',
  category: 'danger',

  title: 'Голос из глубины',
  description: `Из бездны под ногами доносится голос — не звук, а мысль, проникающая прямо в разум. Он предлагает знания, силу, ответы на вопросы. Но цена... цена не называется. Ты чувствуешь, что этот голос древнее самого мира.`,
  flavorText: '"Бездна помнит то, что было до начала. Она хочет рассказать."',

  conditions: {
    locationIds: ['depths_of_the_world'],
    minProgress: 25,
    maxProgress: 75,
  },

  choices: [
    {
      id: 'listen',
      text: 'Прислушаться к голосу',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: 5,
          description: '+5% к успеху (знание бездны)',
        },
        {
          type: 'modify_success_chance',
          modifier: -10,
          chance: 40,
          description: '-10% к успеху (разум повреждён)',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 3, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+3 славы (древнее знание)',
        },
      ],
      resultText: 'Голос наполняет разум образами древности...',
    },
    {
      id: 'resist',
      text: 'Сопротивляться',
      effects: [
        {
          type: 'modify_duration',
          modifier: 120,
          description: '+2 минуты (ментальная борьба)',
        },
        {
          type: 'modify_success_chance',
          modifier: -3,
          description: '-3% к успеху (усталость)',
        },
      ],
      resultText: 'Ты закрываешь разум от голоса бездны.',
    },
    {
      id: 'ask',
      text: 'Задать вопрос',
      effects: [
        {
          type: 'grant_location_material',
          materialRarity: 'epic',
          materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+1 void_crystal (ответ бездны)',
        },
        {
          type: 'modify_success_chance',
          modifier: -5,
          description: '-5% к успеху (цена ответа)',
        },
      ],
      resultText: 'Бездна отвечает... но каждый ответ имеет цену.',
    },
  ],

  weight: 12,
  icon: '🌑',
};

// ============================================================================
// ДРЕВНЯЯ МАШИНА
// ============================================================================

export const eventDepthsAncientMachine: EventTemplate = {
  id: 'event_depths_ancient_machine',
  name: 'Древняя машина',
  type: 'choice',
  category: 'discovery',

  title: 'Механизм эпох',
  description: `В огромной пещере стоит машина — не созданная людьми, не построенная богами. Она работает миллионы лет, выполняя задачу, смысл которой утерян. Может, она создаёт материю, может — разрушает время. Панель управления приглашает.`,
  flavorText: '"Некоторые вещи не были созданы. Они всегда были."',

  conditions: {
    locationIds: ['depths_of_the_world'],
    minProgress: 30,
    maxProgress: 70,
  },

  choices: [
    {
      id: 'activate',
      text: 'Активировать машину',
      effects: [
        {
          type: 'grant_location_material',
          materialRarity: 'epic',
          materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+2 ancient_metal',
        },
        {
          type: 'modify_success_chance',
          modifier: -8,
          chance: 50,
          description: '-8% к успеху (машина нестабильна)',
        },
      ],
      resultText: 'Машина пробуждается, и пространство вокруг искажается...',
    },
    {
      id: 'study',
      text: 'Изучить механизм',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: 4,
          description: '+4% к успеху (понимание машины)',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 3, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+3 славы (знания)',
        },
      ],
      resultText: 'Ты понимаешь принцип работы древнего механизма.',
    },
    {
      id: 'leave',
      text: 'Не трогать',
      effects: [
        {
          type: 'narrative_only',
          description: 'Продолжить путь, не тревожа древнее',
        },
      ],
      resultText: 'Ты оставляешь машину выполнять её вечную задачу.',
    },
  ],

  weight: 10,
  icon: '⚙️',
};

// ============================================================================
// ЖИВАЯ ПОРОДА
// ============================================================================

export const eventDepthsLivingRock: EventTemplate = {
  id: 'event_depths_living_rock',
  name: 'Живая порода',
  type: 'negative',
  category: 'combat',

  title: 'Стена оживает',
  description: `Камень рядом начинает двигаться — формируются конечности, открываются глаза. Живая порода, хищник из глубин, приспособленный охватиться в темноте. Он замечает тебя и начинает нападение.`,
  flavorText: '"В глубине даже камень может быть голоден."',

  conditions: {
    locationIds: ['depths_of_the_world'],
    minProgress: 20,
    maxProgress: 80,
  },

  effects: [
    {
      type: 'modify_success_chance',
      modifier: -10,
      description: '-10% к успеху (нападение живой породы)',
    },
    {
      type: 'modify_duration',
      modifier: 180,
      description: '+3 минуты (бой или побег)',
    },
  ],

  weight: 14,
  icon: '🪨',
};

// ============================================================================
// СЕРДЦЕ ГОРИЦА
// ============================================================================

export const eventDepthsHeartOfMountain: EventTemplate = {
  id: 'event_depths_heart_of_mountain',
  name: 'Сердце горы',
  type: 'positive',
  category: 'treasure',

  title: 'Пульс мира',
  description: `В центре огромной пещеры пульсирует кристалл — Сердце горы, источник всех металлов и камней. Оно излучает тепло и свет, а рядом можно найти редчайшие материалы, сконденсировавшиеся из чистой магии.`,
  flavorText: '"Сердце горы — это память мира в материи."',

  conditions: {
    locationIds: ['depths_of_the_world'],
    minProgress: 40,
    maxProgress: 80,
  },

  effects: [
    {
      type: 'grant_location_material',
      materialRarity: 'epic',
      materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+2 soulforge_ember',
    },
    {
      type: 'grant_location_material',
      materialRarity: 'epic',
      materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
      chance: 10,
      description: 'Шанс найти heart_of_the_mountain (10%)',
    },
    {
      type: 'modify_success_chance',
      modifier: 5,
      description: '+5% к успеху (благословение сердца)',
    },
  ],

  weight: 6,
  icon: '💎',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const depthsEldritchEvents: EventTemplate[] = [
  eventDepthsVoidWhisper,
  eventDepthsAncientMachine,
  eventDepthsLivingRock,
  eventDepthsHeartOfMountain,
];
