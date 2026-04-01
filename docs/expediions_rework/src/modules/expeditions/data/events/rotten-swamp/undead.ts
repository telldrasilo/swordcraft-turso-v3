/**
 * События Гнилого Болога: Нежить
 *
 * Связаны с утопленниками, мертвецами и некромантией.
 * Включают гнилых утопленников, трупоедов, болото-личей.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// ГНИЛОЙ УТОПЛЕННИК
// ============================================================================

export const eventRottenDrowned: EventTemplate = {
  id: 'event_rotten_drowned',
  name: 'Гнилой утопленник',
  type: 'choice',
  category: 'combat',

  title: 'Всплытие',
  description: `Поверхность трясины вздымается — из неё поднимается раздутый труп, облепленный пиявками и тиной. Гнилой утопленник, восставший из мёртвых, тянется к тебе разлагающимися руками. Его глаза горят мёртвым светом.`,
  flavorText: '"Болото не отпускает своих мертвецов..."',

  conditions: {
    locationIds: ['rotten_swamp'],
    minProgress: 15,
    maxProgress: 85,
  },

  choices: [
    {
      id: 'fight',
      text: 'Принять бой',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: -6,
          description: '-6% к успеху (опасный противник)',
        },
        {
          type: 'grant_location_material',
          materialRarity: 'common',
          materialQuantity: { base: 3, variance: 0, perDifficulty: 0, perRarity: 0 },
          chance: 50,
          description: '+3 decayed_bones (50%)',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 3, variance: 0, perDifficulty: 0, perRarity: 0 },
          chance: 50,
          description: '+3 славы (50%)',
        },
      ],
      resultText: 'Утопленник атакует с неестественной силой!',
    },
    {
      id: 'fire',
      text: 'Использовать огонь (требуется факел)',
      effects: [
        {
          type: 'modify_duration',
          modifier: 60,
          description: '+1 минута (сожжение трупа)',
        },
        {
          type: 'modify_success_chance',
          modifier: 3,
          description: '+3% к успеху (утопленник уничтожен)',
        },
      ],
      resultText: 'Огонь очищает гниющую плоть — утопленник падает обратно в трясину.',
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
          modifier: -4,
          chance: 40,
          description: '-4% к успеху (утопленник догнал)',
        },
      ],
      resultText: 'Ты бросаешься бежать по зыбкой почве!',
    },
  ],

  weight: 14,
  icon: '🧟',
};

// ============================================================================
// ТРУПОЕД
// ============================================================================

export const eventRottenCorpseEater: EventTemplate = {
  id: 'event_rotten_corpse_eater',
  name: 'Трупоед',
  type: 'neutral',
  category: 'social',

  title: 'Коллекционер останков',
  description: `На островке суши сидит сгорбленная фигура, перебирающая кости. Трупоед — изгой, живущий за счёт мёртвых. Он не агрессивен, но смотрит с голодным интересом. Рядом с ним — гора "сокровищ", собранных с тел.`,
  flavorText: '"Мёртвым это уже не нужно..."',

  conditions: {
    locationIds: ['rotten_swamp'],
    minProgress: 20,
    maxProgress: 70,
  },

  effects: [
    {
      type: 'grant_location_material',
      materialRarity: 'common',
      materialQuantity: { base: 3, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+3 decayed_bones (из коллекции трупоеда)',
    },
    {
      type: 'modify_duration',
      modifier: -60,
      description: '-1 минута (трупоед указал путь)',
    },
  ],

  weight: 10,
  icon: '💀',
};

// ============================================================================
// БОЛОТО-ЛИЧ
// ============================================================================

export const eventRottenSwampLich: EventTemplate = {
  id: 'event_rotten_swamp_lich',
  name: 'Болото-лич',
  type: 'negative',
  category: 'combat',

  title: 'Повелитель гниения',
  description: `Туман расступается, и ты видишь его — некроманта, слившегося с болотом. Его тело — гниющая плоть, одежда — тина, посох — кость древнего существа. Болото-лич заметил тебя и готовит заклятие.`,
  flavorText: '"Смерть здесь — только начало..."',

  conditions: {
    locationIds: ['rotten_swamp'],
    minProgress: 40,
    maxProgress: 80,
  },

  effects: [
    {
      type: 'modify_success_chance',
      modifier: -12,
      description: '-12% к успеху (мощный противник)',
    },
    {
      type: 'modify_duration',
      modifier: 240,
      description: '+4 минуты (бой или побег)',
    },
  ],

  weight: 8,
  icon: '👹',
};

// ============================================================================
// ДУХ УТОПЛЕННИКА
// ============================================================================

export const eventRottenDrownedSpirit: EventTemplate = {
  id: 'event_rotten_drowned_spirit',
  name: 'Дух утопленника',
  type: 'choice',
  category: 'social',

  title: 'Плач с воды',
  description: `Над трясиной раздаётся плач — полупрозрачная фигура склонилась над водой. Дух утопленника, застрявший между мирами. Он смотрит на тебя с мольбой — возможно, ты можешь помочь ему обрести покой.`,
  flavorText: '"Некоторые смерти требуют искупления..."',

  conditions: {
    locationIds: ['rotten_swamp'],
    minProgress: 25,
    maxProgress: 75,
  },

  choices: [
    {
      id: 'help',
      text: 'Попытаться помочь духу',
      effects: [
        {
          type: 'grant_location_material',
          materialRarity: 'rare',
          materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+1 shadow_leather (дар духа)',
        },
        {
          type: 'modify_success_chance',
          modifier: 5,
          description: '+5% к успеху (благословение)',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 3, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+3 славы (освобождение духа)',
        },
      ],
      resultText: 'Дух обретает покой, оставляя тебе благодарность.',
    },
    {
      id: 'listen',
      text: 'Прислушаться к его истории',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: 2,
          description: '+2% к успеху (знание о болоте)',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+1 славы',
        },
      ],
      resultText: 'Дух рассказывает о своей жизни и смерти в этом проклятом месте.',
    },
    {
      id: 'leave',
      text: 'Оставить духа в покое',
      effects: [
        {
          type: 'narrative_only',
          description: 'Продолжить путь',
        },
      ],
      resultText: 'Ты оставляешь духа продолжать его вечный плач.',
    },
  ],

  weight: 10,
  icon: '👻',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const rottenUndeadEvents: EventTemplate[] = [
  eventRottenDrowned,
  eventRottenCorpseEater,
  eventRottenSwampLich,
  eventRottenDrownedSpirit,
];
