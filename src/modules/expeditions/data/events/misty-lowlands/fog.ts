/**
 * События Туманных Низин: Туман и мистика
 *
 * Связаны с густым туманом, призраками и загадочными явлениями.
 * Включают голоса, видения, встречи с призраками.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// ГОЛОСА В ТУМАНЕ
// ============================================================================

export const eventMistyFogVoices: EventTemplate = {
  id: 'event_misty_fog_voices',
  name: 'Голоса в тумане',
  type: 'choice',
  category: 'environment',

  title: 'Шёпот из ниоткуда',
  description: `Туман сгущается вокруг, и ты слышишь голоса — они зовут по имени, шепчут что-то непонятное. Кажется, они доносятся откуда-то слева, но при попытке прислушаться звук перемещается. Туманные духи пытаются запутать путника.`,
  flavorText: '"Голоса болота никогда не лгут... но и правды не говорят."',

  conditions: {
    locationIds: ['misty_lowlands'],
    minProgress: 15,
    maxProgress: 85,
  },

  choices: [
    {
      id: 'follow_voices',
      text: 'Последовать за голосами',
      effects: [
        {
          type: 'modify_duration',
          modifier: 180,
          description: '+3 минуты (блуждание в тумане)',
        },
        {
          type: 'grant_location_material',
          materialRarity: 'uncommon',
          materialQuantity: { base: 1, variance: 0.5, perDifficulty: 0, perRarity: 0 },
          chance: 40,
          description: 'Шанс найти что-то ценное (40%)',
        },
        {
          type: 'modify_success_chance',
          modifier: -5,
          chance: 60,
          description: '-5% к успеху (заблудился)',
        },
      ],
      resultText: 'Голоса привели тебя кругами... или к тайнику?',
    },
    {
      id: 'ignore_voices',
      text: 'Игнорировать и идти дальше',
      effects: [
        {
          type: 'narrative_only',
          description: 'Продолжить путь, не поддаваясь на провокацию',
        },
      ],
      resultText: 'Ты продолжаешь путь, стараясь не обращать внимания на шёпот.',
    },
    {
      id: 'use_light',
      text: 'Зажечь факел и развеять туман (требуется факел)',
      effects: [
        {
          type: 'modify_duration',
          modifier: -120,
          description: '-2 минуты (свет отпугивает духов)',
        },
        {
          type: 'modify_success_chance',
          modifier: 5,
          description: '+5% к успеху (безопасная тропа)',
        },
      ],
      resultText: 'Свет отпугивает туманных духов — ты видишь безопасную тропу.',
    },
  ],

  weight: 15,
  icon: '👁️',
};

// ============================================================================
// ТУМАННЫЙ ПРИЗРАК
// ============================================================================

export const eventMistyGhostEncounter: EventTemplate = {
  id: 'event_misty_ghost_encounter',
  name: 'Туманный призрак',
  type: 'choice',
  category: 'combat',

  title: 'Полупрозрачная фигура',
  description: `Из тумана выплывает фигура — полупрозрачная, с провалами вместо глаз. Она не атакует, но её взгляд пронзает холодом. Призрак словно чего-то ждёт. Это один из духов, населяющих Туманные Низины.`,
  flavorText: '"Мёртвые не спят в болоте. Они ждут."',

  conditions: {
    locationIds: ['misty_lowlands'],
    minProgress: 25,
    maxProgress: 75,
  },

  choices: [
    {
      id: 'attack_ghost',
      text: 'Атаковать призрака',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: -10,
          description: '-10% к успеху (призрак опасен)',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 3, variance: 0, perDifficulty: 0, perRarity: 0 },
          chance: 50,
          description: '+3 славы при победе (50%)',
        },
        {
          type: 'grant_location_material',
          materialRarity: 'uncommon',
          materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
          chance: 50,
          description: 'Шанс получить необычный материал (50%)',
        },
      ],
      resultText: 'Призрак отвечает на агрессию леденящим прикосновением!',
    },
    {
      id: 'speak_ghost',
      text: 'Попытаться заговорить',
      effects: [
        {
          type: 'modify_duration',
          modifier: -60,
          chance: 50,
          description: '-1 минута (призрак указал путь)',
        },
        {
          type: 'modify_success_chance',
          modifier: -3,
          chance: 50,
          description: '-3% к успеху (леденящий вопль)',
        },
      ],
      resultText: 'Призрак молчит... или отвечает?',
    },
    {
      id: 'offer_item',
      text: 'Предложить подношение (требуется mist_herbs)',
      effects: [
        {
          type: 'grant_location_material',
          materialRarity: 'common',
          materialQuantity: { base: 3, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+3 обычных материала (дар призрака)',
        },
        {
          type: 'modify_success_chance',
          modifier: 5,
          description: '+5% к успеху (благосклонность духа)',
        },
      ],
      resultText: 'Призрак принимает подношение и указывает на тайник.',
    },
  ],

  weight: 12,
  icon: '👻',
};

// ============================================================================
// ПРОСВЕТ В ТУМАНЕ
// ============================================================================

export const eventMistyFogClearing: EventTemplate = {
  id: 'event_misty_fog_clearing',
  name: 'Просвет в тумане',
  type: 'positive',
  category: 'discovery',

  title: 'Неожиданная ясность',
  description: `Туман внезапно расступается, открывая небольшую поляну. Здесь растут редкие травы, которые обычно скрыты от глаз. Это место похоже на оазис посреди вечного тумана — почти невероятная удача.`,
  flavorText: 'Иногда болото дарит путнику передышку...',

  conditions: {
    locationIds: ['misty_lowlands'],
    minProgress: 20,
    maxProgress: 70,
  },

  effects: [
    {
      type: 'grant_location_material',
      materialRarity: 'uncommon',
      materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+2 необычных материала (mist_herbs)',
    },
    {
      type: 'grant_location_material',
      materialRarity: 'common',
      materialQuantity: { base: 3, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+3 обычных материала (swamp_moss)',
    },
    {
      type: 'modify_duration',
      modifier: -60,
      description: '-1 минута (отдых на поляне)',
    },
  ],

  weight: 10,
  icon: '✨',
};

// ============================================================================
// ЗАТОНУВШИЕ КОЛОКОЛА
// ============================================================================

export const eventMistySubmergedBells: EventTemplate = {
  id: 'event_misty_submerged_bells',
  name: 'Затонувшие колокола',
  type: 'neutral',
  category: 'environment',

  title: 'Гул из глубин',
  description: `Из глубин болота доносится глухой колокольный звон. Говорят, это колокола затонувшего города Ильтар. Звон гипнотизирует и тянет к себе, обещая тайны древности. В эти моменты туман становится гуще.`,
  flavorText: '"Колокола Ильтара звонят только тем, кто готов услышать..."',

  conditions: {
    locationIds: ['misty_lowlands'],
    minProgress: 30,
    maxProgress: 70,
  },

  effects: [
    {
      type: 'modify_success_chance',
      modifier: 2,
      description: '+2% к успеху (знание о затонувшем городе)',
    },
    {
      type: 'grant_resource',
      resourceId: 'glory',
      quantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+1 славы (мистический опыт)',
    },
  ],

  weight: 8,
  icon: '🔔',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const mistyFogEvents: EventTemplate[] = [
  eventMistyFogVoices,
  eventMistyGhostEncounter,
  eventMistyFogClearing,
  eventMistySubmergedBells,
];
