/**
 * Общие события: Отдых и восстановление
 *
 * Позитивные события, связанные с возможностью передохнуть.
 * Используют теги для тематического соответствия локациям.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// БЛАГОПРИЯТНАЯ ПОЛЯНА (лес, горы)
// ============================================================================

export const eventCommonPeacefulGlade: EventTemplate = {
  id: 'event_common_peaceful_glade',
  name: 'Благоприятная поляна',
  type: 'positive',
  category: 'rest',

  title: 'Место силы и покоя',
  description: `Среди густых зарослей открылась небольшая поляна — удивительно спокойное место. Трава мягкая, ручей журчит рядом, а воздух наполнен ароматами цветов. Здесь можно перевести дух и восстановить силы. Кажется, само место излучает умиротворение.`,
  flavorText: '"В гуще опасностей — островки покоя. Они редки, но бесценны."',

  conditions: {
    locationTypes: ['forest', 'mountain'],
    locationTags: ['safe_zone', 'ancient_trees', 'hunting_grounds'],
    minProgress: 20,
    maxProgress: 80,
  },

  effects: [
    {
      type: 'modify_duration',
      modifier: -180,
      description: '-3 минуты к времени (отдых)',
    },
    {
      type: 'modify_success_chance',
      modifier: 5,
      description: '+5% к успеху (восстановление)',
    },
    {
      type: 'grant_resource',
      resourceId: 'glory',
      quantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+1 славы (нашли место силы)',
    },
  ],

  weight: 12,
  icon: '🌿',
};

// ============================================================================
// СТАРЫЙ КОЛОДЕЦ (лес, горы, около цивилизации)
// ============================================================================

export const eventCommonOldWell: EventTemplate = {
  id: 'event_common_old_well',
  name: 'Старый колодец',
  type: 'positive',
  category: 'rest',

  title: 'Чистая вода',
  description: `У заброшенной дороги стоит старый колодец — каменная кладка поросла мхом, но вода внутри чистая и холодная. Кто-то когда-то построил его для путников, и он всё ещё служит своему назначению. Можно наполнить фляги и передохнуть в тени.`,
  flavorText: '"Добрые дела живут дольше тех, кто их совершил."',

  conditions: {
    locationTypes: ['forest', 'mountain'],
    locationTags: ['civilization_border', 'safe_zone'],
    minProgress: 15,
    maxProgress: 85,
  },

  effects: [
    {
      type: 'modify_duration',
      modifier: -120,
      description: '-2 минуты к времени (отдых у колодца)',
    },
    {
      type: 'modify_success_chance',
      modifier: 3,
      description: '+3% к успеху (свежие силы)',
    },
    {
      type: 'grant_resource',
      resourceId: 'gold',
      quantity: { base: 5, variance: 0.5, perDifficulty: 0, perRarity: 0 },
      description: '+5-8 золота (монеты на дне колодца)',
    },
  ],

  weight: 16,
  icon: '🪣',
};

// ============================================================================
// ЗАБРОШЕННОЕ УКРЫТИЕ (шахты, подземелья)
// ============================================================================

export const eventCommonAbandonedShelter: EventTemplate = {
  id: 'event_common_abandoned_shelter',
  name: 'Заброшенное укрытие',
  type: 'choice',
  category: 'rest',

  title: 'Кто-то жил здесь раньше',
  description: `В глубине туннеля обнаружилась выбитая в камне комната — явно жилище кого-то, кто скрывался здесь долгое время. Старая кровать, погасший очаг, несколько полок с посудой. Места чистые, сухие — можно устроить привал.`,
  flavorText: '"Убежище — это не стены, а чувство безопасности."',

  conditions: {
    locationTypes: ['mine', 'underground'],
    locationTags: ['abandoned', 'deep', 'ancient_structures'],
    minProgress: 25,
    maxProgress: 75,
  },

  choices: [
    {
      id: 'rest_here',
      text: 'Устроить привал',
      effects: [
        {
          type: 'modify_duration',
          modifier: -240,
          description: '-4 минуты к времени (отдых)',
        },
        {
          type: 'modify_success_chance',
          modifier: 4,
          description: '+4% к успеху (восстановление)',
        },
        {
          type: 'grant_location_material',
          materialRarity: 'common',
          materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+1 ресурс (нашли в укрытии)',
        },
      ],
      resultText: 'Вы отлично отдохнули в заброшенном укрытии и нашли несколько полезных вещей.',
    },
    {
      id: 'search_thoroughly',
      text: 'Тщательно обыскать укрытие',
      effects: [
        {
          type: 'modify_duration',
          modifier: 60,
          description: '+1 минута к времени (обыск)',
        },
        {
          type: 'grant_location_material',
          materialRarity: 'uncommon',
          materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+1 необычный ресурс (тайник)',
        },
        {
          type: 'grant_resource',
          resourceId: 'gold',
          quantity: { base: 20, variance: 0.3, perDifficulty: 0, perRarity: 0 },
          description: '+20-25 золота',
        },
      ],
      resultText: 'В тайнике под полом вы нашли припасы и монеты.',
    },
    {
      id: 'continue_quickly',
      text: 'Продолжить путь без задержек',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: -2,
          description: '-2% к успеху (усталость)',
        },
      ],
      resultText: 'Вы прошли мимо укрытия. Усталость накапливается...',
    },
  ],

  weight: 14,
  icon: '🏚️',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const commonRestEvents: EventTemplate[] = [
  eventCommonPeacefulGlade,
  eventCommonOldWell,
  eventCommonAbandonedShelter,
];
