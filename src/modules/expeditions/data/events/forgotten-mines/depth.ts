/**
 * События Забытых Шахт: Глубины и существа
 *
 * Связаны с глубинными существами, ползунами и опасностями шахты.
 * Включают глубинных ползунов, эхо-тварей, призраков шахтёров.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// ГЛУБИННЫЙ ПОЛЗУН
// ============================================================================

export const eventForgottenDeepCrawler: EventTemplate = {
  id: 'event_forgotten_deep_crawler',
  name: 'Глубинный ползун',
  type: 'negative',
  category: 'combat',

  title: 'Что-то в темноте',
  description: `Слепое существо, приспособленное к вечной темноте глубин, почувствовало твоё присутствие. Глубинный ползун охотится на звук и движение — он уже направляется в твою сторону, хоть и не видит тебя.`,
  flavorText: '"В глубине глаза — лишняя роскошь. Там правят другие чувства."',

  conditions: {
    locationIds: ['forgotten_mines'],
    minProgress: 15,
    maxProgress: 85,
  },

  effects: [
    {
      type: 'modify_success_chance',
      modifier: -6,
      description: '-6% к успеху (нападение ползуна)',
    },
    {
      type: 'modify_duration',
      modifier: 120,
      description: '+2 минуты (сражение или прятки)',
    },
  ],

  weight: 14,
  icon: '🐛',
};

// ============================================================================
// ЭХО-ТВАРЬ
// ============================================================================

export const eventForgottenEchoBeast: EventTemplate = {
  id: 'event_forgotten_echo_beast',
  name: 'Эхо-тварь',
  type: 'choice',
  category: 'danger',

  title: 'Голос из тени',
  description: `Из тёмного туннеля доносится голос — чей-то крик о помощи. Но когда ты прислушиваешься, замечаешь что-то странное: голос звучит идеально, слишком идеально. Это эхо-тварь, подражающая голосам жертв.`,
  flavorText: '"В шахтах не все голоса принадлежат людям..."',

  conditions: {
    locationIds: ['forgotten_mines'],
    minProgress: 25,
    maxProgress: 75,
  },

  choices: [
    {
      id: 'investigate',
      text: 'Пойти на голос',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: -8,
          description: '-8% к успеху (засада эхо-твари)',
        },
        {
          type: 'grant_location_material',
          materialRarity: 'uncommon',
          materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
          chance: 40,
          description: 'Шанс найти трофеи (40%)',
        },
      ],
      resultText: 'Ты идёшь на голос и встречаешь эхо-тварь!',
    },
    {
      id: 'shout_back',
      text: 'Крикнуть в ответ',
      effects: [
        {
          type: 'modify_duration',
          modifier: 60,
          description: '+1 минута (тварь в замешательстве)',
        },
        {
          type: 'modify_success_chance',
          modifier: 3,
          description: '+3% к успеху (тварь ушла)',
        },
      ],
      resultText: 'Тварь сбита с толку — твой голос сбивает её с толку.',
    },
    {
      id: 'ignore',
      text: 'Игнорировать и идти другой дорогой',
      effects: [
        {
          type: 'modify_duration',
          modifier: 150,
          description: '+2.5 минуты (обход)',
        },
        {
          type: 'narrative_only',
          description: 'Безопасный путь',
        },
      ],
      resultText: 'Ты обходишь туннель стороной, не поддаваясь на провокацию.',
    },
  ],

  weight: 12,
  icon: '👹',
};

// ============================================================================
// ПРИЗРАК ДРЕВНЕГО ШАХТЁРА
// ============================================================================

export const eventForgottenGhostMiner: EventTemplate = {
  id: 'event_forgotten_ghost_miner',
  name: 'Призрак древнего шахтёра',
  type: 'choice',
  category: 'social',

  title: 'Полупрозрачная фигура',
  description: `В глубине туннеля мерцает фигура — призрак шахтёра в древней одежде. Он не агрессивен, просто продолжает свою работу, пытаясь поднять киркой породу. Заметив тебя, он поворачивается с вопросом во взгляде.`,
  flavorText: '"Некоторые так и не поняли, что умерли..."',

  conditions: {
    locationIds: ['forgotten_mines'],
    minProgress: 20,
    maxProgress: 70,
  },

  choices: [
    {
      id: 'speak',
      text: 'Заговорить с призраком',
      effects: [
        {
          type: 'modify_duration',
          modifier: -90,
          chance: 50,
          description: '-1.5 минуты (призрак указал путь)',
        },
        {
          type: 'modify_success_chance',
          modifier: -3,
          chance: 50,
          description: '-3% к успеху (холод могилы)',
        },
      ],
      resultText: 'Призрак отвечает... или молчит?',
    },
    {
      id: 'offer_help',
      text: 'Предложить закончить его работу',
      effects: [
        {
          type: 'grant_location_material',
          materialRarity: 'uncommon',
          materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+2 uncommon материала (дар призрака)',
        },
        {
          type: 'modify_success_chance',
          modifier: 3,
          description: '+3% к успеху (благодарность духа)',
        },
      ],
      resultText: 'Призрак с благодарностью указывает на тайник.',
    },
    {
      id: 'leave',
      text: 'Оставить в покое',
      effects: [
        {
          type: 'narrative_only',
          description: 'Пройти мимо, не тревожа духа',
        },
      ],
      resultText: 'Ты оставляешь призрака продолжать его вечную работу.',
    },
  ],

  weight: 12,
  icon: '👻',
};

// ============================================================================
// ОБВАЛ
// ============================================================================

export const eventForgottenCaveIn: EventTemplate = {
  id: 'event_forgotten_cave_in',
  name: 'Обвал',
  type: 'negative',
  category: 'danger',

  title: 'Потолок рушится!',
  description: `Древние крепления не выдерживают — потолок туннеля начинает осыпаться. Камни падают вокруг, пыль застилает обзор. Нужно срочно выбираться!`,
  flavorText: '"Шахта помнит своих..."',

  conditions: {
    locationIds: ['forgotten_mines'],
    minProgress: 10,
    maxProgress: 90,
  },

  effects: [
    {
      type: 'modify_duration',
      modifier: 180,
      description: '+3 минуты (выбираешься из завала)',
    },
    {
      type: 'modify_success_chance',
      modifier: -5,
      description: '-5% к успеху (раны и усталость)',
    },
    {
      type: 'damage_weapon',
      modifier: 10,
      description: '-10% прочности оружия (камни по клинку и гарде)',
    },
  ],

  weight: 15,
  icon: '💥',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const forgottenDepthEvents: EventTemplate[] = [
  eventForgottenDeepCrawler,
  eventForgottenEchoBeast,
  eventForgottenGhostMiner,
  eventForgottenCaveIn,
];
