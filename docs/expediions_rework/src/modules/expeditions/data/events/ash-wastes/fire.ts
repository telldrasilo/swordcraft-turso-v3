/**
 * События Пепельных Пустошей: Огонь и пепел
 *
 * Связаны с вулканами, жарой и огненными существами.
 * Включают извержения, элементалей, погребённые города.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// ИЗВЕРЖЕНИЕ
// ============================================================================

export const eventAshEruption: EventTemplate = {
  id: 'event_ash_eruption',
  name: 'Извержение',
  type: 'negative',
  category: 'danger',

  title: 'Земля дрожит',
  description: `Земля под ногами вздрагивает, и вдалеке поднимается столб дыма. Вулкан просыпается! Раскалённые камни начинают падать с неба, а воздух наполняется пеплом. Нужно срочно уходить.`,
  flavorText: '"Огонь не прощает медлительности..."',

  conditions: {
    locationIds: ['ash_wastes'],
    minProgress: 10,
    maxProgress: 90,
  },

  effects: [
    {
      type: 'modify_success_chance',
      modifier: -12,
      description: '-12% к успеху (извержение)',
    },
    {
      type: 'modify_duration',
      modifier: 180,
      description: '+3 минуты (побег от извержения)',
    },
  ],

  weight: 14,
  icon: '🌋',
};

// ============================================================================
// ОГНЕННЫЙ ЭЛЕМЕНТАЛЬ
// ============================================================================

export const eventAshFireElemental: EventTemplate = {
  id: 'event_ash_fire_elemental',
  name: 'Огненный элементаль',
  type: 'choice',
  category: 'combat',

  title: 'Пламя обретает форму',
  description: `Из раскалённой трещины в земле поднимается существо из чистого огня — огненный элементаль. Его тело — живое пламя, а глаза горят древней злобой. Оно замечает тебя и начинает двигаться.`,
  flavorText: '"Огонь — это жизнь. Но не для нас..."',

  conditions: {
    locationIds: ['ash_wastes'],
    minProgress: 20,
    maxProgress: 80,
  },

  choices: [
    {
      id: 'fight',
      text: 'Принять бой',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: -8,
          description: '-8% к успеху (опасный противник)',
        },
        {
          type: 'grant_location_material',
          materialRarity: 'rare',
          materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
          chance: 50,
          description: '+1 fire_stone (50%)',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 4, variance: 0, perDifficulty: 0, perRarity: 0 },
          chance: 50,
          description: '+4 славы (50%)',
        },
      ],
      resultText: 'Элементаль атакует волной пламени!',
    },
    {
      id: 'water',
      text: 'Использовать воду (если есть)',
      effects: [
        {
          type: 'modify_duration',
          modifier: 60,
          description: '+1 минута (элементаль ослаб)',
        },
        {
          type: 'modify_success_chance',
          modifier: 3,
          description: '+3% к успеху (элементаль отступил)',
        },
      ],
      resultText: 'Вода ослабляет элементаля, и он отступает в трещину.',
    },
    {
      id: 'flee',
      text: 'Бежать',
      effects: [
        {
          type: 'modify_duration',
          modifier: 150,
          description: '+2.5 минуты (побег)',
        },
        {
          type: 'modify_success_chance',
          modifier: -5,
          chance: 40,
          description: '-5% к успеху (ожоги)',
        },
      ],
      resultText: 'Ты бросаешься бежать от огненного существа!',
    },
  ],

  weight: 12,
  icon: '🔥',
};

// ============================================================================
// ПОГРЕБЁННЫЙ ГОРОД
// ============================================================================

export const eventAshBuriedCity: EventTemplate = {
  id: 'event_ash_buried_city',
  name: 'Погребённый город',
  type: 'positive',
  category: 'discovery',

  title: 'Крыши под пеплом',
  description: `Ветер выдул слой пепла, обнажив верхушки строений — древний город, погребённый под вулканическим пеплом. Здесь можно найти что-то ценное, если повезёт не наткнуться на обрушение.`,
  flavorText: '"Города умирают, но их сокровища остаются..."',

  conditions: {
    locationIds: ['ash_wastes'],
    minProgress: 20,
    maxProgress: 70,
  },

  effects: [
    {
      type: 'grant_location_material',
      materialRarity: 'rare',
      materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+2 volcanic_glass',
    },
    {
      type: 'grant_location_material',
      materialRarity: 'uncommon',
      materialQuantity: { base: 3, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+3 obsidian_shard',
    },
    {
      type: 'modify_duration',
      modifier: -90,
      description: '-1.5 минуты (находки)',
    },
  ],

  weight: 10,
  icon: '🏛️',
};

// ============================================================================
// ЖАРА
// ============================================================================

export const eventAshHeatWave: EventTemplate = {
  id: 'event_ash_heat_wave',
  name: 'Жара',
  type: 'negative',
  category: 'environment',

  title: 'Раскалённый воздух',
  description: `Температура поднимается до невыносимой. Воздух дрожит от жара, а дыхание обжигает лёгкие. Тепловой удар может убить быстрее, чем любой монстр. Нужно найти тень или уйти отсюда.`,
  flavorText: '"В Пепельных Пустошах солнце — враг..."',

  conditions: {
    locationIds: ['ash_wastes'],
    minProgress: 15,
    maxProgress: 85,
  },

  effects: [
    {
      type: 'modify_success_chance',
      modifier: -7,
      description: '-7% к успеху (тепловой удар)',
    },
    {
      type: 'modify_duration',
      modifier: 150,
      description: '+2.5 минуты (поиск укрытия)',
    },
  ],

  weight: 16,
  icon: '🥵',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const ashFireEvents: EventTemplate[] = [
  eventAshEruption,
  eventAshFireElemental,
  eventAshBuriedCity,
  eventAshHeatWave,
];
