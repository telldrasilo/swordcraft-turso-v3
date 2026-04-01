/**
 * События Кряжа Морозного Железа: Холод и лёд
 *
 * Связаны с экстремальным холодом, метелями и ледяными существами.
 * Включают метели, ледяные пещеры, великанов.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// МЕТЕЛЬ
// ============================================================================

export const eventFrostBlizzard: EventTemplate = {
  id: 'event_frost_blizzard',
  name: 'Метель',
  type: 'negative',
  category: 'environment',

  title: 'Белая мгла',
  description: `Ветер усиливается, поднимая снежную пыль, которая бьёт в лицо как иглы. Метель накрывает горы за секунды — видимость падает до нуля, а холод проникает под любую одежду. Нужно срочно найти укрытие.`,
  flavorText: '"В горах зима никогда не заканчивается..."',

  conditions: {
    locationIds: ['frost_iron_ridge'],
    minProgress: 10,
    maxProgress: 90,
  },

  effects: [
    {
      type: 'modify_success_chance',
      modifier: -10,
      description: '-10% к успеху (потеря ориентации)',
    },
    {
      type: 'modify_duration',
      modifier: 240,
      description: '+4 минуты (пережидание метели)',
    },
  ],

  weight: 18,
  icon: '🌨️',
};

// ============================================================================
// ЗАМЁРЗШИЙ ПУТНИК
// ============================================================================

export const eventFrostFrozenTraveler: EventTemplate = {
  id: 'event_frost_frozen_traveler',
  name: 'Замёрзший путник',
  type: 'choice',
  category: 'social',

  title: 'Фигура во льду',
  description: `В ледяной стене видна фигура — человек, замёрзший decades назад. Лёд сохранил его идеально: одежду, оружие, даже выражение лица. Но что-то не так — глаза приоткрыты, и кажется, что они следят за тобой.`,
  flavorText: '"Холод не всегда убивает. Иногда он сохраняет..."',

  conditions: {
    locationIds: ['frost_iron_ridge'],
    minProgress: 20,
    maxProgress: 80,
  },

  choices: [
    {
      id: 'examine',
      text: 'Исследовать тело',
      effects: [
        {
          type: 'grant_location_material',
          materialRarity: 'uncommon',
          materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+2 eternal_ice (из окружающего льда)',
        },
        {
          type: 'modify_success_chance',
          modifier: -5,
          chance: 40,
          description: '-5% к успеху (дух пробудился)',
        },
      ],
      resultText: 'Ты исследуешь замёрзшего путника...',
    },
    {
      id: 'take_equipment',
      text: 'Забрать снаряжение',
      effects: [
        {
          type: 'grant_location_material',
          materialRarity: 'rare',
          materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+1 frost_iron (оружие путника)',
        },
        {
          type: 'modify_success_chance',
          modifier: -8,
          description: '-8% к успеху (проклятие)',
        },
      ],
      resultText: 'Ты берёшь снаряжение, но холод усиливается вокруг тебя.',
    },
    {
      id: 'leave',
      text: 'Оставить в покое',
      effects: [
        {
          type: 'narrative_only',
          description: 'Продолжить путь, не тревожа мертвеца',
        },
      ],
      resultText: 'Ты оставляешь замёрзшего путника в его ледяной гробнице.',
    },
  ],

  weight: 12,
  icon: '🧊',
};

// ============================================================================
// ЛЕДЯНАЯ ПЕЩЕРА
// ============================================================================

export const eventFrostIceCave: EventTemplate = {
  id: 'event_frost_ice_cave',
  name: 'Ледяная пещера',
  type: 'positive',
  category: 'discovery',

  title: 'Укрытие во льдах',
  description: `Сквозь метель замечаешь тёмное пятно — вход в пещеру. Внутри теплее, чем снаружи, а стены украшены кристаллами льда, светящимися в полумраке. Здесь можно передохнуть и даже найти что-то ценное.`,
  flavorText: '"Лёд хранит не только холод, но и тайны..."',

  conditions: {
    locationIds: ['frost_iron_ridge'],
    minProgress: 15,
    maxProgress: 70,
  },

  effects: [
    {
      type: 'grant_location_material',
      materialRarity: 'uncommon',
      materialQuantity: { base: 3, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+3 frozen_crystals',
    },
    {
      type: 'grant_location_material',
      materialRarity: 'rare',
      materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
      chance: 30,
      description: 'Шанс найти frost_iron (30%)',
    },
    {
      type: 'modify_duration',
      modifier: -120,
      description: '-2 минуты (укрытие и отдых)',
    },
  ],

  weight: 12,
  icon: '🧊',
};

// ============================================================================
// СЛЕД ВЕЛИКАНА
// ============================================================================

export const eventFrostGiantTrail: EventTemplate = {
  id: 'event_frost_giant_trail',
  name: 'След великана',
  type: 'neutral',
  category: 'danger',

  title: 'Огромные следы',
  description: `На снегу видны следы — каждый размером с телегу. Морозный великан прошёл здесь недавно, возможно, несколько часов назад. Тебе на пути, или он охотится? Лучше быть осторожнее.`,
  flavorText: '"Великаны не забывают обид, но и помнят добро..."',

  conditions: {
    locationIds: ['frost_iron_ridge'],
    minProgress: 25,
    maxProgress: 75,
  },

  effects: [
    {
      type: 'modify_success_chance',
      modifier: -3,
      description: '-3% к успеху (риск встречи)',
    },
    {
      type: 'modify_duration',
      modifier: 120,
      description: '+2 минуты (обход следов)',
    },
  ],

  weight: 14,
  icon: '👣',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const frostColdEvents: EventTemplate[] = [
  eventFrostBlizzard,
  eventFrostFrozenTraveler,
  eventFrostIceCave,
  eventFrostGiantTrail,
];
