/**
 * Общие события: Сверхъестественные явления
 *
 * Загадочные и мистические события с магическим подтекстом.
 * Используют теги для тематического соответствия локациям.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// ПРИЗРАЧНЫЙ ОГОНЬ (болото, магические локации)
// ============================================================================

export const eventCommonGhostlyFire: EventTemplate = {
  id: 'event_common_ghostly_fire',
  name: 'Призрачный огонь',
  type: 'choice',
  category: 'environment',

  title: 'Блуждающие огни',
  description: `Среди тумана засветились блуждающие огни — бледные, холодные, они притягивают взор. Одни говорят, что это духи заблудших, другие — что это природный газ. Но все сходятся в одном: они могут вести туда, куда лучше не ходить.`,
  flavorText: '"Не всякий свет ведёт к спасению..."',

  conditions: {
    locationTypes: ['swamp', 'magical'],
    locationTags: ['undead', 'decay', 'lunar_magic'],
    minProgress: 15,
    maxProgress: 85,
  },

  choices: [
    {
      id: 'follow',
      text: 'Проследовать за огнями',
      effects: [
        {
          type: 'modify_duration',
          modifier: 180,
          description: '+3 минуты к времени (плутание)',
        },
        {
          type: 'damage_adventurer',
          modifier: 10,
          description: '-10% HP (опасная тропа)',
        },
        {
          type: 'grant_location_material',
          materialRarity: 'uncommon',
          materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+1 необычный ресурс (нашли в глухомани)',
        },
      ],
      resultText: 'Огни привели вас через опасные места к чему-то ценному... но путь был труден.',
    },
    {
      id: 'ignore',
      text: 'Игнорировать огни и идти своим путём',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: 2,
          description: '+2% к успеху (не поддались искушению)',
        },
      ],
      resultText: 'Вы не поддались искушению и продолжили намеченный маршрут.',
    },
    {
      id: 'banish',
      text: 'Развеять огни заклинанием/молитвой',
      effects: [
        {
          type: 'modify_duration',
          modifier: 60,
          description: '+1 минута к времени (ритуал)',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+2 славы (изгнали злых духов)',
        },
      ],
      resultText: 'Огни рассеялись, и на мгновение показалось, что кто-то шепнул "спасибо"... или проклял вас.',
    },
  ],

  weight: 12,
  icon: '👻',
};

// ============================================================================
// ВРЕМЕННАЯ ПЕТЛЯ (подземелья, древние структуры)
// ============================================================================

export const eventCommonTimeLoop: EventTemplate = {
  id: 'event_common_time_loop',
  name: 'Временная петля',
  type: 'negative',
  category: 'environment',

  title: 'Время сломалось',
  description: `Шаг, другой — и пейзаж повторился. Знакомый камень, тот же поворот. Вы попали в ловушку древней магии — место, где время идёт по кругу. Каждая попытка выйти возвращает к началу. Нужен другой подход.`,
  flavorText: '"Некоторые места существуют вне времени. И не все из них можно покинуть..."',

  conditions: {
    locationTypes: ['underground', 'magical'],
    locationTags: ['ancient_structures', 'deep', 'dangerous'],
    minProgress: 30,
    maxProgress: 70,
  },

  effects: [
    {
      type: 'modify_duration',
      modifier: 360,
      description: '+6 минут к времени (плутание в петле)',
    },
    {
      type: 'damage_adventurer',
      modifier: 8,
      description: '-8% HP (истощение от магии)',
    },
    {
      type: 'modify_success_chance',
      modifier: -5,
      description: '-5% к успеху (потеря ориентации)',
    },
  ],

  weight: 8,
  icon: '⏳',
};

// ============================================================================
// ГОЛОС ИЗ ГЛУБИНЫ (шахты, подземелья, глубины)
// ============================================================================

export const eventCommonVoiceFromDeep: EventTemplate = {
  id: 'event_common_voice_from_deep',
  name: 'Голос из глубины',
  type: 'choice',
  category: 'discovery',

  title: 'Что-то говорит из тьмы',
  description: `Из самых глубин донёсся голос — древний, нечеловеческий, но понимающий вашу речь. Он предлагает знание в обмен на... что-то. Службу? Душу? Или просто обещание? Голос не угрожает, он просит.`,
  flavorText: '"Древние не лгут. Они лишь говорят правду, которую невозможно понять..."',

  conditions: {
    locationTypes: ['mine', 'underground'],
    locationTags: ['deep', 'ancient_structures', 'dangerous'],
    minProgress: 40,
    maxProgress: 80,
  },

  choices: [
    {
      id: 'listen',
      text: 'Прислушаться к голосу',
      effects: [
        {
          type: 'grant_resource',
          resourceId: 'experience',
          quantity: { base: 25, variance: 0, perDifficulty: 10, perRarity: 0 },
          description: '+25-35 опыта (древнее знание)',
        },
        {
          type: 'modify_success_chance',
          modifier: -3,
          description: '-3% к успеху (тревожные мысли)',
        },
      ],
      resultText: 'Голос поведал вам тайны этого места. Но цена ещё не названа...',
    },
    {
      id: 'ignore',
      text: 'Игнорировать и ускорить шаг',
      effects: [
        {
          type: 'modify_duration',
          modifier: -120,
          description: '-2 минуты к времени (ускорились)',
        },
        {
          type: 'modify_success_chance',
          modifier: -2,
          description: '-2% к успеху (голос в голове)',
        },
      ],
      resultText: 'Вы поспешили прочь, но голос продолжал шептать на краю сознания.',
    },
    {
      id: 'respond',
      text: 'Ответить голосу',
      effects: [
        {
          type: 'grant_location_material',
          materialRarity: 'rare',
          materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+1 редкий материал (дар глубин)',
        },
        {
          type: 'modify_success_chance',
          modifier: 3,
          description: '+3% к успеху (покровительство)',
        },
      ],
      resultText: 'Голос удовлетворённо затих, и в тишине вы нашли то, что было утеряно веками.',
    },
  ],

  weight: 10,
  icon: '🗣️',
};

// ============================================================================
// ЗАБЫТОЕ БОЖЕСТВО (лес, болото, магические локации)
// ============================================================================

export const eventCommonForgottenDeity: EventTemplate = {
  id: 'event_common_forgotten_deity',
  name: 'Забытое божество',
  type: 'neutral',
  category: 'discovery',

  title: 'Древний алтарь',
  description: `В укромном месте стоит алтарь — старый, заброшенный, но всё ещё хранящий следы поклонения. Статуя божества почти стёрлась, но от места веет силой. Кто-то молился здесь тысячи лет. Божество забыто, но не исчезло.`,
  flavorText: '"Боги умирают только когда о них перестают помнить."',

  conditions: {
    locationTypes: ['forest', 'swamp', 'magical'],
    locationTags: ['ancient_structures', 'corrupted_nature', 'lunar_magic'],
    minProgress: 20,
    maxProgress: 80,
  },

  effects: [
    {
      type: 'modify_duration',
      modifier: 60,
      description: '+1 минута к времени (осмотр)',
    },
    {
      type: 'modify_success_chance',
      modifier: 2,
      description: '+2% к успеху (благословение забытым богом)',
    },
    {
      type: 'grant_resource',
      resourceId: 'glory',
      quantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+2 славы (нашли святыню)',
    },
  ],

  weight: 14,
  icon: '🛕',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const commonSupernaturalEvents: EventTemplate[] = [
  eventCommonGhostlyFire,
  eventCommonTimeLoop,
  eventCommonVoiceFromDeep,
  eventCommonForgottenDeity,
];
