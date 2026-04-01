/**
 * События Окраин Дубовой Рощи: Лесные явления
 *
 * Магические и атмосферные события леса.
 * Включают духов, древние деревья, ведьмины круги.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// ДУХ ЛЕСА
// ============================================================================

export const eventOakForestSpirit: EventTemplate = {
  id: 'event_oak_forest_spirit',
  name: 'Дух леса',
  type: 'choice',
  category: 'discovery',

  title: 'Хранитель рощи',
  description: `Среди стволов мелькнула полупрозрачная фигура — древний дух леса, хранитель этой рощи. Он смотрел с любопытством, не проявляя враждебности. Его голос прозвучал как шелест листвы: "Зачем тревожишь мой дом, путник?"`,
  flavorText: '"Деревья помнят всё. Даже то, что люди забыли."',

  conditions: {
    locationIds: ['oak_grove_outskirts'],
    minProgress: 20,
    maxProgress: 80,
  },

  choices: [
    {
      id: 'greet',
      text: 'Почтительно поздороваться',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: 5,
          description: '+5% к успеху (благословение духа)',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+2 славы',
        },
      ],
      resultText: 'Дух кивнул и растворился в листве, оставив чувство спокойствия.',
    },
    {
      id: 'ask_help',
      text: 'Попросить о помощи',
      effects: [
        {
          type: 'grant_location_material',
          materialRarity: 'uncommon',
          materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+1 необычный материал (дар духа)',
        },
        {
          type: 'modify_duration',
          modifier: -120,
          description: '-2 минуты (дух указал короткий путь)',
        },
      ],
      resultText: 'Дух улыбнулся и указал тропу, скрытую в зарослях.',
    },
    {
      id: 'ignore',
      text: 'Пройти мимо, не обращая внимания',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: -3,
          description: '-3% к успеху (дух обиделся)',
        },
      ],
      resultText: 'Дух исчез, но лес словно стал холоднее к вам.',
    },
  ],

  weight: 12,
  icon: '🌿',
};

// ============================================================================
// ДРЕВНЕЕ ДЕРЕВО
// ============================================================================

export const eventOakAncientTree: EventTemplate = {
  id: 'event_oak_ancient_tree',
  name: 'Древнее дерево',
  type: 'positive',
  category: 'discovery',

  title: 'Вековой дуб',
  description: `В центре небольшой поляны возвышался дуб, возраст которого исчислялся столетиями. Его ствол был настолько толст, что десять человек не смогли бы его обхватить. В дупле у корней виднелись подношения — монеты, ленты, высохшие цветы. Местные считают это дерево священным.`,
  flavorText: 'Корни уходят в глубину веков, крона касается небес...',

  conditions: {
    locationIds: ['oak_grove_outskirts'],
    minProgress: 15,
    maxProgress: 70,
  },

  effects: [
    {
      type: 'grant_location_material',
      materialRarity: 'uncommon',
      materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+1 необычный материал (из подношений)',
    },
    {
      type: 'modify_duration',
      modifier: -60,
      description: '-1 минута (отдых у священного дерева)',
    },
    {
      type: 'modify_success_chance',
      modifier: 3,
      description: '+3% к успеху (благословение)',
    },
  ],

  weight: 15,
  icon: '🌳',
};

// ============================================================================
// ВЕДЬМИН КРУГ
// ============================================================================

export const eventOakFairyRing: EventTemplate = {
  id: 'event_oak_fairy_ring',
  name: 'Ведьмин круг',
  type: 'choice',
  category: 'environment',

  title: 'Круг грибов',
  description: `На поляне темнел идеальный круг из бледных грибов — ведьмин круг, как говорят в народе. Трава внутри была неестественно зелёной, а воздух — странно тихим. Старые легенды гласят, что входить внутрь опасно, но некоторые утверждают, что там можно найти магические дары.`,
  flavorText: '"Не ступай в круг, не то танцевать будешь до рассвета..."',

  conditions: {
    locationIds: ['oak_grove_outskirts'],
    minProgress: 25,
    maxProgress: 75,
  },

  choices: [
    {
      id: 'enter',
      text: 'Войти в круг',
      effects: [
        {
          type: 'grant_location_material',
          materialRarity: 'uncommon',
          materialQuantity: { base: 2, variance: 0.5, perDifficulty: 0, perRarity: 0 },
          description: '+2-3 необычных материала (магия фей)',
        },
        {
          type: 'modify_duration',
          modifier: 120,
          description: '+2 минуты (головокружение)',
        },
      ],
      resultText: 'Голова закружилась, но когда вы пришли в себя, в руках были странные дары.',
    },
    {
      id: 'circumvent',
      text: 'Обойти стороной',
      effects: [
        {
          type: 'narrative_only',
          description: 'Продолжить путь безопасно',
        },
      ],
      resultText: 'Вы обошли круг стороной, не рискуя тревожить древнюю магию.',
    },
    {
      id: 'take_mushroom',
      text: 'Сорвать гриб с края круга',
      effects: [
        {
          type: 'grant_location_material',
          materialRarity: 'common',
          materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+1 обычный материал (гриб)',
        },
        {
          type: 'modify_success_chance',
          modifier: -2,
          description: '-2% к успеху (неудача)',
        },
      ],
      resultText: 'Гриб оказался горьким и бесполезным, а ощущение чужого взгляда не покидало.',
    },
  ],

  weight: 10,
  icon: '🍄',
};

// ============================================================================
// СЛЕДЫ ЗВЕРЕЙ
// ============================================================================

export const eventOakAnimalSigns: EventTemplate = {
  id: 'event_oak_animal_signs',
  name: 'Следы зверей',
  type: 'neutral',
  category: 'travel',

  title: 'Звериная тропа',
  description: `Земля была изрыта множеством следов — кабаны, волки, олени проходили здесь. Судя по свежести отпечатков, звериная тропа использовалась активно. Можно попытаться идти по ней — это может ускорить путь или привести к опасности.`,
  flavorText: 'Звери знают лес лучше любого человека...',

  conditions: {
    locationIds: ['oak_grove_outskirts'],
    minProgress: 10,
    maxProgress: 90,
  },

  effects: [
    {
      type: 'modify_duration',
      modifier: -90,
      description: '-1.5 минуты (быстрая тропа)',
    },
    {
      type: 'modify_success_chance',
      modifier: -2,
      description: '-2% к успеху (риск встречи со зверем)',
    },
  ],

  weight: 18,
  icon: '🐾',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const oakGroveForestEvents: EventTemplate[] = [
  eventOakForestSpirit,
  eventOakAncientTree,
  eventOakFairyRing,
  eventOakAnimalSigns,
];
