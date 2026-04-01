/**
 * События Гнилого Болога: Токсины и отравы
 *
 * Связаны с ядовитым туманом, токсинами и болезнями.
 * Включают ядовитый туман, болезни, отравителей.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// ЯДОВИТЫЙ ТУМАН
// ============================================================================

export const eventRottenPoisonFog: EventTemplate = {
  id: 'event_rotten_poison_fog',
  name: 'Ядовитый туман',
  type: 'negative',
  category: 'danger',

  title: 'Зелёная мгла',
  description: `Туман сгущается, приобретая болезненный зелёный оттенок. Воздух становится тяжёлым, обжигает лёгкие. Ядовитые испарения от гниющей растительности скапливаются в низинах — и ты попал прямо в одно из таких мест.`,
  flavorText: '"В Гнилом Бологе воздух сам по себе — оружие."',

  conditions: {
    locationIds: ['rotten_swamp'],
    minProgress: 10,
    maxProgress: 90,
  },

  effects: [
    {
      type: 'modify_success_chance',
      modifier: -8,
      description: '-8% к успеху (отравление)',
    },
    {
      type: 'modify_duration',
      modifier: 120,
      description: '+2 минуты (выбираешься из тумана)',
    },
  ],

  weight: 16,
  icon: '☠️',
};

// ============================================================================
// БОЛЕЗНЬ
// ============================================================================

export const eventRottenDisease: EventTemplate = {
  id: 'event_rotten_disease',
  name: 'Болезнь',
  type: 'negative',
  category: 'danger',

  title: 'Лихорадка',
  description: `После нескольких часов в болоте чувствуешь слабость — кожа бледнеет, выступает холодный пот. Болотная лихорадка, болезнь, поражающая всех, кто проводит здесь слишком долго. Нужно найти лекарство или выйти поскорее.`,
  flavorText: '"Болото пьёт жизнь медленно, но верно..."',

  conditions: {
    locationIds: ['rotten_swamp'],
    minProgress: 40,
    maxProgress: 90,
  },

  effects: [
    {
      type: 'modify_success_chance',
      modifier: -10,
      description: '-10% к успеху (лихорадка)',
    },
    {
      type: 'modify_duration',
      modifier: 180,
      description: '+3 минуты (слабость)',
    },
  ],

  weight: 12,
  icon: '🤒',
};

// ============================================================================
// СХРОН АЛХИМИКА
// ============================================================================

export const eventRottenAlchemistCache: EventTemplate = {
  id: 'event_rotten_alchemist_cache',
  name: 'Схрон алхимика',
  type: 'positive',
  category: 'treasure',

  title: 'Спрятанные припасы',
  description: `Среди гнилых пней замечаешь свежие метки — кто-то спрятал здесь ящик. Внутри склянки с зельями, ингредиенты и записки. Алхимик или отравитель оставил здесь свой тайник.`,
  flavorText: '"Даже в самом гиблом месте можно найти что-то ценное..."',

  conditions: {
    locationIds: ['rotten_swamp'],
    minProgress: 20,
    maxProgress: 70,
  },

  effects: [
    {
      type: 'grant_location_material',
      materialRarity: 'uncommon',
      materialQuantity: { base: 3, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+3 poison_gland (ядовитые железы)',
    },
    {
      type: 'grant_location_material',
      materialRarity: 'uncommon',
      materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+2 toxic_moss',
    },
    {
      type: 'modify_duration',
      modifier: -60,
      description: '-1 минута (карта тайника)',
    },
  ],

  weight: 10,
  icon: '🧪',
};

// ============================================================================
// ОТРАВИТЕЛЬ-ОТШЕЛЬНИК
// ============================================================================

export const eventRottenPoisoner: EventTemplate = {
  id: 'event_rotten_poisoner',
  name: 'Отравитель-отшельник',
  type: 'choice',
  category: 'social',

  title: 'Хижина в гнили',
  description: `Посреди болота, на островке твёрдой земли, стоит хижина, сложенная из костей и гнилого дерева. Перед ней сидит человек в маске — отравитель-отшельник, мастер ядов. Он не атакует, но смотрит настороженно.`,
  flavorText: '"Яды — это искусство. А болото — лучшая мастерская."',

  conditions: {
    locationIds: ['rotten_swamp'],
    minProgress: 25,
    maxProgress: 75,
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
          description: '+2 poison_gland',
        },
        {
          type: 'modify_duration',
          modifier: -90,
          description: '-1.5 минуты (указал безопасный путь)',
        },
      ],
      resultText: 'Отравитель оценивает предложение и делится своими запасами.',
    },
    {
      id: 'ask_about_heart',
      text: 'Спросить о Сердце гниения',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: 3,
          description: '+3% к успеху (знание о Сердце)',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+2 славы (легенда о Сердце)',
        },
      ],
      resultText: 'Отравитель рассказывает о древнем артефакте в центре болота.',
    },
    {
      id: 'leave',
      text: 'Уйти, не тревожа',
      effects: [
        {
          type: 'narrative_only',
          description: 'Продолжить путь, не привлекая внимания',
        },
      ],
      resultText: 'Ты оставляешь отравителя в покое.',
    },
  ],

  weight: 10,
  icon: '🧪',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const rottenToxicEvents: EventTemplate[] = [
  eventRottenPoisonFog,
  eventRottenDisease,
  eventRottenAlchemistCache,
  eventRottenPoisoner,
];
