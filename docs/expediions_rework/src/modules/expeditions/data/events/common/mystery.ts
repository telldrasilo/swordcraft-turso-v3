/**
 * Общие события: Загадки и тайны
 *
 * События, связанные с древними артефактами и необъяснимыми явлениями.
 * Используют теги для тематического соответствия локациям.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// СТРАННЫЙ ТОТЕМ (лес, болото - древние структуры)
// ============================================================================

export const eventCommonStrangeTotem: EventTemplate = {
  id: 'event_common_strange_totem',
  name: 'Странный тотем',
  type: 'choice',
  category: 'discovery',

  title: 'Древний страж леса',
  description: `В тени деревьев возвышается странный тотем — высеченное из почерневшего дерева изваяние с множеством лиц. Каждое лицо выражает разные эмоции: боль, радость, гнев, покой. У подножия тотема лежат засохшие цветы и несколько монет.`,
  flavorText: '"Древние боги не умирают — они лишь ждут..."',

  conditions: {
    locationTypes: ['forest', 'swamp'],
    locationTags: ['ancient_structures', 'ancient_trees', 'corrupted_nature'],
    minProgress: 20,
    maxProgress: 80,
  },

  choices: [
    {
      id: 'leave_offering',
      text: 'Оставить подношение',
      effects: [
        {
          type: 'grant_resource',
          resourceId: 'gold',
          quantity: { base: -5, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '-5 золота (подношение)',
        },
        {
          type: 'modify_success_chance',
          modifier: 5,
          description: '+5% к успеху (благословение тотема)',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+1 славы',
        },
      ],
      resultText: 'Вы оставили монеты у тотема. Лица на мгновение словно ожили, и чувство покоя снизошло на вас.',
    },
    {
      id: 'examine',
      text: 'Внимательно осмотреть тотем',
      effects: [
        {
          type: 'modify_duration',
          modifier: 180,
          description: '+3 минуты к времени (осмотр)',
        },
        {
          type: 'grant_location_material',
          materialRarity: 'uncommon',
          materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+1 необычный ресурс (нашли в тайнике)',
        },
      ],
      resultText: 'В основании тотема обнаружился скрытый отсек с древними подношениями.',
    },
    {
      id: 'pass_by',
      text: 'Пройти мимо, не тревожа древности',
      effects: [
        {
          type: 'narrative_only',
          description: 'Оставить тотем в покое',
        },
      ],
      resultText: 'Вы обошли тотем стороной. Лица на нём словно провожали вас взглядом.',
    },
  ],

  weight: 12,
  icon: '🗿',
};

// ============================================================================
// ШЕПЧУЩИЙ ВЕТЕР (лес, магические локации, горы)
// ============================================================================

export const eventCommonWhisperingWind: EventTemplate = {
  id: 'event_common_whispering_wind',
  name: 'Шепчущий ветер',
  type: 'neutral',
  category: 'discovery',

  title: 'Голоса в ветре',
  description: `Ветер принёс странные звуки — словно обрывки разговоров, шёпот на непонятном языке, обрывки мелодии. На мгновение показалось, что ветер пытается что-то сказать, предупредить о чём-то важном. Но смысл ускользает.`,
  flavorText: '"Ветер помнит всё, что было, и шепчет о том, что будет..."',

  conditions: {
    locationTypes: ['forest', 'mountain', 'magical'],
    locationTags: ['whispering', 'lunar_magic', 'ancient_runes'],
    minProgress: 15,
    maxProgress: 85,
  },

  effects: [
    {
      type: 'modify_duration',
      modifier: 60,
      description: '+1 минута к времени (прислушивание)',
    },
    {
      type: 'modify_success_chance',
      modifier: 3,
      description: '+3% к успеху (предчувствие опасности)',
    },
  ],

  weight: 18,
  icon: '💨',
};

// ============================================================================
// РУНОВАЯ МЕТКА (шахты, подземелья, магические локации)
// ============================================================================

export const eventCommonRuneMarking: EventTemplate = {
  id: 'event_common_rune_marking',
  name: 'Руновая метка',
  type: 'choice',
  category: 'discovery',

  title: 'Древние руны',
  description: `На стене туннеля вырезаны странные символы — руны, светящиеся слабым голубоватым светом. Они не похожи ни на один известный алфавит, но от них веет древней магией. Рядом с рунами — следы когтей на полу.`,
  flavorText: '"Некоторые слова лучше не читать вслух..."',

  conditions: {
    locationTypes: ['mine', 'underground', 'magical'],
    locationTags: ['ancient_structures', 'dangerous', 'deep'],
    minProgress: 25,
    maxProgress: 75,
  },

  choices: [
    {
      id: 'touch_rune',
      text: 'Коснуться руны',
      effects: [
        {
          type: 'grant_resource',
          resourceId: 'experience',
          quantity: { base: 15, variance: 0, perDifficulty: 5, perRarity: 0 },
          description: '+15-20 опыта (древнее знание)',
        },
        {
          type: 'damage_adventurer',
          modifier: 8,
          description: '-8% HP (магический разряд)',
        },
      ],
      resultText: 'При касании руна вспыхнула! Боль пронзила руку, но с ней пришло видение — карта этих мест.',
    },
    {
      id: 'copy_rune',
      text: 'Перерисовать руны в блокнот',
      effects: [
        {
          type: 'modify_duration',
          modifier: 240,
          description: '+4 минуты к времени (тщательная работа)',
        },
        {
          type: 'modify_success_chance',
          modifier: 4,
          description: '+4% к успеху (информация о месте)',
        },
      ],
      resultText: 'Вы аккуратно скопировали руны. Они могут пригодиться учёным в городе.',
    },
    {
      id: 'avoid',
      text: 'Обойти стороной — магия опасна',
      effects: [
        {
          type: 'narrative_only',
          description: 'Не тревожить древнюю магию',
        },
      ],
      resultText: 'Вы поспешно прошли мимо. Руны едва слышно загудели вам вслед.',
    },
  ],

  weight: 14,
  icon: '🔮',
};

// ============================================================================
// СВЕЖИЕ СЛЕДЫ (лес, горы, болото)
// ============================================================================

export const eventCommonFreshTracks: EventTemplate = {
  id: 'event_common_fresh_tracks',
  name: 'Свежие следы',
  type: 'neutral',
  category: 'discovery',

  title: 'Кто-то был здесь недавно',
  description: `На земле отчётливо видны следы — не звериные, человеческие. Судя по глубине, человек нёс тяжёлый груз. Следы ведут в сторону, но можно попытаться проследить, куда они ведут, или просто принять к сведению.`,
  flavorText: '"Следы — это история, написанная в грязи..."',

  conditions: {
    locationTypes: ['forest', 'mountain', 'swamp'],
    locationTags: ['hunting_grounds', 'civilization_border', 'safe_zone'],
    minProgress: 10,
    maxProgress: 90,
  },

  effects: [
    {
      type: 'modify_success_chance',
      modifier: 2,
      description: '+2% к успеху (информация о местности)',
    },
    {
      type: 'modify_duration',
      modifier: -60,
      description: '-1 минута к времени (нашли более быстрый путь)',
    },
  ],

  weight: 20,
  icon: '👣',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const commonMysteryEvents: EventTemplate[] = [
  eventCommonStrangeTotem,
  eventCommonWhisperingWind,
  eventCommonRuneMarking,
  eventCommonFreshTracks,
];
