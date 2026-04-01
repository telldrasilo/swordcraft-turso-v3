/**
 * Общие события: Сокровища
 *
 * События, связанные с находкой ценностей и тайников.
 * Используют теги для тематического соответствия локациям.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// СКРЫТЫЙ ТАЙНИК (лес, горы, подземелья)
// ============================================================================

export const eventCommonHiddenStash: EventTemplate = {
  id: 'event_common_hidden_stash',
  name: 'Скрытый тайник',
  type: 'positive',
  category: 'treasure',

  title: 'Чьё-то сокровище',
  description: `В расщелине скалы, под корнями упавшего дерева или за выступом камня обнаружился тайник. Содержимое спрятано давно — судя по пыли и паутине, сюда никто не заглядывал годы. Внутри лежат аккуратно упакованные ценности.`,
  flavorText: '"Чужое добро не в убыток, если хозяина нет в живых..."',

  conditions: {
    locationTypes: ['forest', 'mountain', 'underground'],
    locationTags: ['abandoned', 'ancient_structures', 'deep'],
    minProgress: 25,
    maxProgress: 75,
  },

  effects: [
    {
      type: 'grant_location_material',
      materialRarity: 'uncommon',
      materialQuantity: { base: 2, variance: 0.5, perDifficulty: 0, perRarity: 0 },
      description: '+2-3 необычных ресурса из локации',
    },
    {
      type: 'grant_resource',
      resourceId: 'gold',
      quantity: { base: 35, variance: 0.3, perDifficulty: 10, perRarity: 5 },
      description: '+35-45 золота',
    },
  ],

  weight: 12,
  icon: '💎',
};

// ============================================================================
// СТАРЫЙ СУНДУК (шахты, подземелья - с выбором)
// ============================================================================

export const eventCommonOldChest: EventTemplate = {
  id: 'event_common_old_chest',
  name: 'Старый сундук',
  type: 'choice',
  category: 'treasure',

  title: 'Древний сундук',
  description: `В глубине туннеля, в нише стены стоит сундук из потемневшего от времени дерева, окованный ржавым железом. Он закрыт на ржавый замок, но выглядит целым. Рядком валяется скелет — видимо, прошлый искатель сокровищ.`,
  flavorText: '"Не все сокровища стоит открывать..."',

  conditions: {
    locationTypes: ['mine', 'underground'],
    locationTags: ['abandoned', 'ancient_structures', 'dangerous'],
    minProgress: 30,
    maxProgress: 70,
  },

  choices: [
    {
      id: 'open_force',
      text: 'Взломать замок силой',
      effects: [
        {
          type: 'grant_location_material',
          materialRarity: 'uncommon',
          materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+2 необычных ресурса из локации',
        },
        {
          type: 'grant_resource',
          resourceId: 'gold',
          quantity: { base: 40, variance: 0.4, perDifficulty: 15, perRarity: 5 },
          description: '+40-55 золота',
        },
        {
          type: 'damage_adventurer',
          modifier: 15,
          description: '-15% HP (ржавые шипы из крышки)',
        },
      ],
      resultText: 'Сундук открылся, но из крышки выстрелили ржавые шипы!',
    },
    {
      id: 'open_careful',
      text: 'Попробовать открыть осторожно',
      effects: [
        {
          type: 'grant_location_material',
          materialRarity: 'common',
          materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+1 обычный ресурс',
        },
        {
          type: 'grant_resource',
          resourceId: 'gold',
          quantity: { base: 15, variance: 0.3, perDifficulty: 0, perRarity: 0 },
          description: '+15-20 золота',
        },
        {
          type: 'modify_duration',
          modifier: 120,
          description: '+2 минуты к времени (осторожность)',
        },
      ],
      resultText: 'Осторожный подход принёс скромную, но безопасную добычу.',
    },
    {
      id: 'leave',
      text: 'Оставить сундук и пройти мимо',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: 2,
          description: '+2% к успеху (осмотрительность)',
        },
      ],
      resultText: 'Вы решили не рисковать и прошли мимо. Возможно, мудро.',
    },
  ],

  weight: 10,
  icon: '🗃️',
};

// ============================================================================
// РАЗГРАБЛЕННЫЙ КАРАВАН (лес, горы - у дорог)
// ============================================================================

export const eventCommonLootedCaravan: EventTemplate = {
  id: 'event_common_looted_caravan',
  name: 'Разграбленный караван',
  type: 'neutral',
  category: 'treasure',

  title: 'Следы трагедии',
  description: `Разбитая повозка, валяющиеся ящики, мёртвые лошади — всё, что осталось от торгового каравана. Грабители уже побывали здесь и забрали самое ценное, но в спешке кое-что упустили. Среди обломков можно найти уцелевшие товары.`,
  flavorText: '"Торговля — рискованное дело на этих дорогах..."',

  conditions: {
    locationTypes: ['forest', 'mountain'],
    locationTags: ['civilization_border', 'hunting_grounds', 'safe_zone'],
    minProgress: 10,
    maxProgress: 60,
  },

  effects: [
    {
      type: 'grant_location_material',
      materialRarity: 'common',
      materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+1 обычный ресурс из локации',
    },
    {
      type: 'grant_resource',
      resourceId: 'gold',
      quantity: { base: 12, variance: 0.5, perDifficulty: 0, perRarity: 0 },
      description: '+12-18 золота (мелочь из обломков)',
    },
    {
      type: 'modify_success_chance',
      modifier: -2,
      description: '-2% к успеху (гнетущее зрелище)',
    },
  ],

  weight: 14,
  icon: '🛒',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const commonTreasureEvents: EventTemplate[] = [
  eventCommonHiddenStash,
  eventCommonOldChest,
  eventCommonLootedCaravan,
];
