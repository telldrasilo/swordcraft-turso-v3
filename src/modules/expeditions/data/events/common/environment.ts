/**
 * Общие события: Окружение
 *
 * События, связанные с природными явлениями и атмосферой.
 * Используют теги для тематического соответствия локациям.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// ЗЛОВЕЩАЯ ТИШИНА (подземелья, шахты)
// ============================================================================

export const eventCommonEerieSilence: EventTemplate = {
  id: 'event_common_eerie_silence',
  name: 'Зловещая тишина',
  type: 'neutral',
  category: 'environment',

  title: 'Тишина, от которой холодеет кровь',
  description: `Внезапно все звуки исчезли — даже шаги стали беззвучными. Это место словно вымерло, или же что-то поглотило все звуки разом. Воздух стал плотным и неподвижным. Такое чувство, что за тобой наблюдают из темноты.`,
  flavorText: '"В тишине подземелий рождается безумие..."',

  conditions: {
    locationTypes: ['mine', 'underground'],
    locationTags: ['deep', 'ancient_structures', 'abandoned'],
    minProgress: 15,
    maxProgress: 85,
  },

  effects: [
    {
      type: 'modify_duration',
      modifier: 120,
      description: '+2 минуты к времени (остановился прислушаться)',
    },
    {
      type: 'modify_success_chance',
      modifier: -3,
      description: '-3% к успеху (нервное напряжение)',
    },
  ],

  weight: 15,
  icon: '🔇',
};

// ============================================================================
// ПАДАЮЩИЕ ЗВЁЗДЫ (лес, горы, магические локации)
// ============================================================================

export const eventCommonFallingStars: EventTemplate = {
  id: 'event_common_falling_stars',
  name: 'Падающие звёзды',
  type: 'positive',
  category: 'environment',

  title: 'Звёздный дождь',
  description: `Небо разорвали огненные полосы — метеоритный дождь невиданной красоты. Один из осколков упал совсем рядом, светясь мягким голубоватым светом. Это редкая удача — найти упавшую звезду.`,
  flavorText: '"Каждая упавшая звезда — это чьё-то желание, исполнившееся в другом мире."',

  conditions: {
    locationTypes: ['forest', 'mountain', 'magical'],
    locationTags: ['ancient_trees', 'lunar_magic', 'ancient_runes'],
    minProgress: 20,
    maxProgress: 80,
  },

  effects: [
    {
      type: 'grant_location_material',
      materialRarity: 'rare',
      materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+1 редкий материал из локации',
    },
    {
      type: 'grant_resource',
      resourceId: 'glory',
      quantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+2 славы (находка)',
    },
  ],

  weight: 8,
  icon: '🌠',
};

// ============================================================================
// ГУСТОЙ ТУМАН (болото, лес, магические локации)
// ============================================================================

export const eventCommonDenseFog: EventTemplate = {
  id: 'event_common_dense_fog',
  name: 'Густой туман',
  type: 'negative',
  category: 'environment',

  title: 'Стена тумана',
  description: `Туман сгустился настолько, что не видно собственной руки. Влага пропитала одежду, а каждый звук искажается и кажется ближе, чем есть на самом деле. Придётся двигаться почти на ощупь.`,
  flavorText: '"В тумане легко потерять направление. И рассудок..."',

  conditions: {
    locationTypes: ['swamp', 'forest', 'magical'],
    locationTags: ['toxic', 'decay', 'whispering'],
    minProgress: 10,
    maxProgress: 90,
  },

  effects: [
    {
      type: 'modify_duration',
      modifier: 240,
      description: '+4 минуты к времени (медленное продвижение)',
    },
    {
      type: 'modify_success_chance',
      modifier: -5,
      description: '-5% к успеху (дезориентация)',
    },
    {
      type: 'damage_adventurer',
      modifier: 3,
      description: '-3% HP (сырость и холод)',
    },
  ],

  weight: 16,
  icon: '🌫️',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const commonEnvironmentEvents: EventTemplate[] = [
  eventCommonEerieSilence,
  eventCommonFallingStars,
  eventCommonDenseFog,
];
