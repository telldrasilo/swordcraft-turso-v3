/**
 * События Серебряного Бора: Серебро и лес
 *
 * Связаны с сереброносными жилами, древними деревьями и мастерами.
 * Включают серебряные находки, мастеров, лесных духов.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// СЕРЕБРЯНАЯ ЖИЛА
// ============================================================================

export const eventSilverOreVein: EventTemplate = {
  id: 'event_silver_ore_vein',
  name: 'Серебряная жила',
  type: 'positive',
  category: 'discovery',

  title: 'Блеск в земле',
  description: `У корней огромной сосны замечаешь странный блеск — серебряная жила выходит прямо на поверхность. Деревья здесь впитывают металл, отчего их хвоя отливает серебром. Это удачная находка!`,
  flavorText: '"Серебро растёт в этом лесу как корни..."',

  conditions: {
    locationIds: ['silver_grove'],
    minProgress: 15,
    maxProgress: 75,
  },

  effects: [
    {
      type: 'grant_location_material',
      materialRarity: 'common',
      materialQuantity: { base: 5, variance: 2, perDifficulty: 0, perRarity: 0 },
      description: '+5-7 silver_ore',
    },
    {
      type: 'grant_location_material',
      materialRarity: 'uncommon',
      materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
      chance: 40,
      description: 'Шанс найти silver_bark (40%)',
    },
    {
      type: 'modify_duration',
      modifier: 120,
      description: '+2 минуты (добыча)',
    },
  ],

  weight: 15,
  icon: '💎',
};

// ============================================================================
// СЕРЕБРЯНЫХ ДЕЛ МАСТЕР
// ============================================================================

export const eventSilverSilversmith: EventTemplate = {
  id: 'event_silver_silversmith',
  name: 'Серебряных дел мастер',
  type: 'choice',
  category: 'social',

  title: 'Одинокая кузница',
  description: `В глубине бора виднеется дымок — небольшая кузница, встроенная прямо в ствол огромного дерева. Серебряных дел мастер Ансельм живёт здесь в уединении, куя украшения из местного серебра. Он замечает тебя, но не выказывает враждебности.`,
  flavorText: '"Серебро требует одиночества и тишины..."',

  conditions: {
    locationIds: ['silver_grove'],
    minProgress: 25,
    maxProgress: 70,
  },

  choices: [
    {
      id: 'trade',
      text: 'Предложить обмен',
      effects: [
        {
          type: 'grant_location_material',
          materialRarity: 'uncommon',
          materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+2 необычных материала (мастер делится)',
        },
        {
          type: 'modify_duration',
          modifier: -90,
          description: '-1.5 минуты (мастер указал путь)',
        },
      ],
      resultText: 'Мастер оценивает товары и предлагает честный обмен.',
    },
    {
      id: 'ask_about_forge',
      text: 'Спросить о Лунной кузнице',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: 3,
          description: '+3% к успеху (знание о кузнице)',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+2 славы (легенда о кузнице)',
        },
      ],
      resultText: 'Мастер рассказывает о легендарной Лунной кузнице в глубине бора.',
    },
    {
      id: 'leave',
      text: 'Не беспокоить и идти дальше',
      effects: [
        {
          type: 'narrative_only',
          description: 'Продолжить путь, не нарушая уединение мастера',
        },
      ],
      resultText: 'Ты оставляешь мастера в покое и продолжаешь путь.',
    },
  ],

  weight: 10,
  icon: '⚒️',
};

// ============================================================================
// СЕРЕБРЯНЫЙ ПАУК
// ============================================================================

export const eventSilverSpider: EventTemplate = {
  id: 'event_silver_spider',
  name: 'Серебряный паук',
  type: 'negative',
  category: 'danger',

  title: 'Серебряные сети',
  description: `Не заметив в полумраке, ты попадаешь в паутину — она блестит как серебряная нить и липнет сильнее обычной. Где-то над головой раздаётся шуршание — хозяин сети уже спускается.`,
  flavorText: '"В этом лесу даже пауки прядут серебро..."',

  conditions: {
    locationIds: ['silver_grove'],
    minProgress: 20,
    maxProgress: 80,
  },

  effects: [
    {
      type: 'modify_success_chance',
      modifier: -6,
      description: '-6% к успеху (паутина сковывает)',
    },
    {
      type: 'modify_duration',
      modifier: 150,
      description: '+2.5 минуты (выбираешься из сети)',
    },
  ],

  weight: 14,
  icon: '🕷️',
};

// ============================================================================
// ЛЕСНАЯ ДЕВА
// ============================================================================

export const eventSilverForestMaiden: EventTemplate = {
  id: 'event_silver_forest_maiden',
  name: 'Лесная дева',
  type: 'positive',
  category: 'social',

  title: 'Дух бора',
  description: `Среди стволов появляется фигура — женщина в платье из лунного света и серебряной хвои. Лесная дева, дух Серебряного Бора, смотрит с добрым любопытством. Она явно настроена помочь заблудившемуся путнику.`,
  flavorText: '"Бор охраняет тех, кто уважает его законы..."',

  conditions: {
    locationIds: ['silver_grove'],
    minProgress: 30,
    maxProgress: 70,
  },

  effects: [
    {
      type: 'grant_location_material',
      materialRarity: 'rare',
      materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+1 silvered_pine (дар духа)',
    },
    {
      type: 'grant_location_material',
      materialRarity: 'uncommon',
      materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+2 moonstone_shards',
    },
    {
      type: 'modify_duration',
      modifier: -180,
      description: '-3 минуты (дева указала безопасный путь)',
    },
    {
      type: 'modify_success_chance',
      modifier: 5,
      description: '+5% к успеху (благословение духа)',
    },
  ],

  weight: 6,
  icon: '🧚',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const silverForestEvents: EventTemplate[] = [
  eventSilverOreVein,
  eventSilverSilversmith,
  eventSilverSpider,
  eventSilverForestMaiden,
];
