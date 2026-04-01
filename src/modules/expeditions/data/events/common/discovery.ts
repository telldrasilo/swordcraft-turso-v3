/**
 * Общие события: Находки
 *
 * Позитивные события о обнаружении тайников, схронов и других ценностей.
 * 
 * ВАЖНО: Каждое событие должно иметь locationTypes!
 * События без locationTypes могут появляться в неподходящих местах
 * (например, "кусты" в шахте).
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// ТАЙНИК С РЕСУРСАМИ (только лес и горы - на открытом воздухе)
// ============================================================================

export const eventCommonResourceCache: EventTemplate = {
  id: 'event_common_resource_cache',
  name: 'Тайник с ресурсами',
  type: 'positive',
  category: 'discovery',

  title: 'Вы обнаружили тайник',
  description: `Где-то здесь должен быть спрятанный схрон — вы заметили странные отметины, явный знак, оставленный кем-то раньше. После недолгих поисков удалось найти тайник с припасами. Судя по всему, здесь давно никто не был, но содержимое хорошо сохранилось.`,
  flavorText: 'Старый тайник хранит свои секреты...',

  conditions: {
    locationTypes: ['forest', 'mountain'], // Только на открытом воздухе
    minProgress: 10,
    maxProgress: 90,
  },

  effects: [
    {
      type: 'grant_location_material',
      materialRarity: 'common',
      materialQuantity: { base: 2, variance: 0.5, perDifficulty: 0, perRarity: 0 },
      description: '+2-3 ресурса из локации',
    },
    {
      type: 'grant_resource',
      resourceId: 'gold',
      quantity: { base: 15, variance: 0.3, perDifficulty: 5, perRarity: 3 },
      description: '+15-20 золота',
    },
  ],

  weight: 25,
  icon: '📦',
};

// ============================================================================
// ЗАБЫТЫЙ СХРОН (универсальный - может быть где угодно)
// ============================================================================

export const eventCommonForgottenCache: EventTemplate = {
  id: 'event_common_forgotten_cache',
  name: 'Забытый схрон',
  type: 'positive',
  category: 'treasure',

  title: 'Схрон забытого путешественника',
  description: `В укромном месте обнаружился старый мешок, полуистлевший от времени. Внутри — остатки провизии, несколько монет и записка с неразборчивым текстом. Кто-то давно спешил и не вернулся за своим имуществом.`,
  flavorText: '"Если читаешь это — значит, я не вернулся. Возьми всё, оно тебе нужнее."',

  conditions: {
    // Универсальное - может быть в любой локации
    minProgress: 5,
    maxProgress: 70,
  },

  effects: [
    {
      type: 'grant_location_material',
      materialRarity: 'uncommon',
      materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+1 необычный ресурс из локации',
    },
    {
      type: 'grant_resource',
      resourceId: 'gold',
      quantity: { base: 25, variance: 0.4, perDifficulty: 10, perRarity: 5 },
      description: '+25-35 золота',
    },
  ],

  weight: 15,
  icon: '💰',
};

// ============================================================================
// ЗАБРОШЕННЫЙ ЛАГЕРЬ (только лес и горы)
// ============================================================================

export const eventCommonAbandonedCamp: EventTemplate = {
  id: 'event_common_abandoned_camp',
  name: 'Заброшенный лагерь',
  type: 'neutral',
  category: 'discovery',

  title: 'Следы стоянки',
  description: `Вы наткнулись на следы старого лагеря — погасший костёр, разбитая палатка, разбросанные вещи. Судя по всему, люди ушли в спешке, оставив многое из снаряжения. Огонь давно погас, но угли ещё хранят тепло.`,
  flavorText: 'Иногда поспешное бегство спасает жизнь...',

  conditions: {
    locationTypes: ['forest', 'mountain'], // Только на открытом воздухе
    minProgress: 15,
    maxProgress: 85,
  },

  effects: [
    {
      type: 'modify_duration',
      modifier: -180,
      description: '-3 минуты к времени (отдых)',
    },
    {
      type: 'grant_resource',
      resourceId: 'gold',
      quantity: { base: 10, variance: 0.5, perDifficulty: 0, perRarity: 0 },
      description: '+10-15 золота (мелочь из лагеря)',
    },
  ],

  weight: 20,
  icon: '🏕️',
};

// ============================================================================
// СТАРАЯ МОГИЛА (лес, горы, болото)
// ============================================================================

export const eventCommonOldGrave: EventTemplate = {
  id: 'event_common_old_grave',
  name: 'Старая могила',
  type: 'neutral',
  category: 'discovery',

  title: 'Забытая могила',
  description: `Неприметный холмик у дороги — древнее захоронение. Каменная плита почти полностью ушла в землю, надпись стёрлась. На месте погребения лежат высохшие цветы и несколько монет — подношения давно умерших родных.`,
  flavorText: 'Мёртвые не жалуются. Но и не благодарят.',

  conditions: {
    locationTypes: ['forest', 'mountain', 'swamp'],
    minProgress: 20,
    maxProgress: 80,
  },

  effects: [
    {
      type: 'grant_resource',
      resourceId: 'gold',
      quantity: { base: 5, variance: 0.5, perDifficulty: 0, perRarity: 0 },
      description: '+5-8 золота (монеты с могилы)',
    },
    {
      type: 'modify_success_chance',
      modifier: -2,
      description: '-2% к успеху (дурная примета)',
    },
  ],

  weight: 15,
  icon: '🪦',
};

// ============================================================================
// СКРЫТЫЙ ПРОХОД (лес, горы, шахты, подземелья)
// ============================================================================

export const eventCommonHiddenPassage: EventTemplate = {
  id: 'event_common_hidden_passage',
  name: 'Скрытый проход',
  type: 'positive',
  category: 'discovery',

  title: 'Тайная тропа',
  description: `Острый глаз заметил едва различимую тропу, уходящую в сторону от основного маршрута. Судя по всему, её использовали контрабандисты или беглые преступники — она ведёт коротким путём через труднопроходимую местность.`,
  flavorText: 'Не все дороги отмечены на картах...',

  conditions: {
    locationTypes: ['forest', 'mountain', 'mine', 'underground'],
    minProgress: 25,
    maxProgress: 75,
  },

  effects: [
    {
      type: 'modify_duration',
      modifier: -300,
      description: '-5 минут к времени (короткий путь)',
    },
    {
      type: 'modify_success_chance',
      modifier: 3,
      description: '+3% к успеху (избегли опасных мест)',
    },
  ],

  weight: 18,
  icon: '🚪',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const commonDiscoveryEvents: EventTemplate[] = [
  eventCommonResourceCache,
  eventCommonForgottenCache,
  eventCommonAbandonedCamp,
  eventCommonOldGrave,
  eventCommonHiddenPassage,
];
