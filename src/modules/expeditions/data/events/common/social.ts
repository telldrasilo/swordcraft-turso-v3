/**
 * Общие события: Социальные
 *
 * События, связанные с встречами NPC.
 * 
 * ВАЖНО: Большинство социальных событий происходит на открытом воздухе
 * или у дорог, поэтому они ограничены forest и mountain.
 * В шахтах/подземельях людей почти нет!
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// СТРАННИК (лес, горы - на дорогах)
// ============================================================================

export const eventCommonWanderer: EventTemplate = {
  id: 'event_common_wanderer',
  name: 'Странник',
  type: 'neutral',
  category: 'social',

  title: 'Путник на дороге',
  description: `На тропе появился одинокий путник — старик с посохом, одетый в простые одежды. Он остановился, приветливо кивнул и присел отдохнуть. В его глазах видна мудрость долгих дорог.`,
  flavorText: '"Каждый путь чему-то учит, странник. Даже тот, что не привёл никуда."',

  conditions: {
    locationTypes: ['forest', 'mountain'], // Только на дорогах
    minProgress: 10,
    maxProgress: 90,
  },

  effects: [
    {
      type: 'modify_duration',
      modifier: -60,
      description: '-1 минута к времени (отдых и разговор)',
    },
    {
      type: 'modify_success_chance',
      modifier: 2,
      description: '+2% к успеху (полезный совет)',
    },
  ],

  weight: 18,
  icon: '🧓',
};

// ============================================================================
// БЕЖЕНЕЦ (лес, горы - у дорог)
// ============================================================================

export const eventCommonRefugee: EventTemplate = {
  id: 'event_common_refugee',
  name: 'Беженец',
  type: 'choice',
  category: 'social',

  title: 'Потерявший дом',
  description: `С тропы выбрел оборванный человек — испуганный, грязный, с пустыми глазами. Он рассказал, что его деревню сожгли, а семья погибла. Он просит лишь немного еды и воды, если они есть.`,
  flavorText: 'Война не щадит никого...',

  conditions: {
    locationTypes: ['forest', 'mountain'], // Только на дорогах
    minProgress: 15,
    maxProgress: 70,
  },

  choices: [
    {
      id: 'help',
      text: 'Помочь беженцу едой и водой',
      effects: [
        {
          type: 'modify_duration',
          modifier: 120,
          description: '+2 минуты к времени (помощь)',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 3, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+3 славы за милосердие',
        },
        {
          type: 'modify_success_chance',
          modifier: 2,
          description: '+2% к успеху (благословение)',
        },
      ],
      resultText: 'Вы помогли несчастному. Он благодарно кивнул и указал безопасную тропу.',
    },
    {
      id: 'ignore',
      text: 'Пройти мимо — нет времени',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: -1,
          description: '-1% к успеху (тяжёлые мысли)',
        },
      ],
      resultText: 'Вы прошли мимо, оставив несчастного на произвол судьбы.',
    },
    {
      id: 'share_intel',
      text: 'Расспросить о дороге впереди',
      effects: [
        {
          type: 'modify_duration',
          modifier: 60,
          description: '+1 минута к времени (разговор)',
        },
        {
          type: 'modify_success_chance',
          modifier: 5,
          description: '+5% к успеху (полезная информация)',
        },
      ],
      resultText: 'Беженец рассказал о засаде впереди и указал обходной путь.',
    },
  ],

  weight: 12,
  icon: '😢',
};

// ============================================================================
// БРОДЯЧИЙ ТОРГОВЕЦ (лес, горы - на дорогах с повозкой)
// ============================================================================

export const eventCommonMerchant: EventTemplate = {
  id: 'event_common_merchant',
  name: 'Бродячий торговец',
  type: 'positive',
  category: 'social',

  title: 'Торговец на пути',
  description: `Повозка, нагруженная товарами, стояла на обочине. Хозяин — пухлый человек с хитрыми глазами — предлагал путникам купить что-нибудь полезное. "Всё по честной цене, клянусь своей бабушкой!"`,
  flavorText: 'Каждый торговец — друг, пока не узнаешь его цену.',

  conditions: {
    locationTypes: ['forest', 'mountain'], // Только на дорогах (повозка!)
    minProgress: 10,
    maxProgress: 80,
  },

  effects: [
    {
      type: 'grant_location_material',
      materialRarity: 'common',
      materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+1 ресурс (покупка у торговца)',
    },
    {
      type: 'grant_resource',
      resourceId: 'gold',
      quantity: { base: -10, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '-10 золота (плата)',
    },
  ],

  weight: 15,
  icon: '🧑‍🌾',
};

// ============================================================================
// НИЩИЙ (лес, горы - у дорог)
// ============================================================================

export const eventCommonBeggar: EventTemplate = {
  id: 'event_common_beggar',
  name: 'Нищий',
  type: 'choice',
  category: 'social',

  title: 'Нищий у дороги',
  description: `У обочины сидел старый нищий, протягивая тряпичную шапку для подаяний. Он выглядел жалко, но в глазах светился хитрый ум. "Подайте, добрые люди, кто сколько может..."`,
  flavorText: 'Иногда рука просящего скрывает кинжал...',

  conditions: {
    locationTypes: ['forest', 'mountain'], // Только у дорог
    minProgress: 5,
    maxProgress: 85,
  },

  choices: [
    {
      id: 'give_coin',
      text: 'Подать монету',
      effects: [
        {
          type: 'grant_resource',
          resourceId: 'gold',
          quantity: { base: -5, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '-5 золота (милостыня)',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+1 славы',
        },
      ],
      resultText: 'Нищий благодарно кивнул. "Добрые люди ещё есть на свете..."',
    },
    {
      id: 'ignore',
      text: 'Пройти мимо',
      effects: [
        {
          type: 'narrative_only',
          description: 'Проигнорировать нищего',
        },
      ],
      resultText: 'Вы прошли мимо, не задерживаясь.',
    },
    {
      id: 'share_food',
      text: 'Дать еду вместо монеты',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: 3,
          description: '+3% к успеху (полезный совет нищего)',
        },
      ],
      resultText: 'Нищий оживился и зашептал: "На западной тропе засада, иди восточной..."',
    },
  ],

  weight: 15,
  icon: '🧎',
};

// ============================================================================
// ПОТЕРЯННЫЙ РЕБЁНОК (только лес)
// ============================================================================

export const eventCommonLostChild: EventTemplate = {
  id: 'event_common_lost_child',
  name: 'Потерянный ребёнок',
  type: 'choice',
  category: 'social',

  title: 'Ребёнок в лесу',
  description: `Под деревом сидел маленький ребёнок, испуганно озираясь по сторонам. Он был одет в дорогую одежду — явно из богатой семьи. При виде вас он вскочил и попятился.`,
  flavorText: 'Дети — невинные жертвы взрослых решений.',

  conditions: {
    locationTypes: ['forest'], // Только в лесу
    minProgress: 20,
    maxProgress: 60,
  },

  choices: [
    {
      id: 'help_return',
      text: 'Помочь ребёнку вернуться',
      effects: [
        {
          type: 'modify_duration',
          modifier: 300,
          description: '+5 минут к времени (сопровождение)',
        },
        {
          type: 'grant_resource',
          resourceId: 'gold',
          quantity: { base: 30, variance: 0.5, perDifficulty: 0, perRarity: 0 },
          description: '+30-45 золота (награда родителей)',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 5, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+5 славы',
        },
      ],
      resultText: 'Родители ребёнка были вне себя от радости и щедро наградили вас.',
    },
    {
      id: 'point_direction',
      text: 'Указать направление к деревне',
      effects: [
        {
          type: 'modify_duration',
          modifier: 60,
          description: '+1 минута к времени',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+1 славы',
        },
      ],
      resultText: 'Вы указали ребёнку направление к ближайшей деревне и он убежал.',
    },
    {
      id: 'continue',
      text: 'Продолжить миссию — некогда',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: -3,
          description: '-3% к успеху (муки совести)',
        },
      ],
      resultText: 'Вы оставили ребёнка и продолжили путь. Совесть не давала покоя.',
    },
  ],

  weight: 10,
  icon: '👦',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const commonSocialEvents: EventTemplate[] = [
  eventCommonWanderer,
  eventCommonRefugee,
  eventCommonMerchant,
  eventCommonBeggar,
  eventCommonLostChild,
];
