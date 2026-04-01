/**
 * События Окраин Дубовой Рощи: Дикая природа
 *
 * События, связанные с животными и охотой.
 * Включают волков, кабанов, оленей и охотничьи находки.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// ВОЛЧИЙ ВОЙ
// ============================================================================

export const eventOakWolfHowl: EventTemplate = {
  id: 'event_oak_wolf_howl',
  name: 'Волчий вой',
  type: 'negative',
  category: 'danger',

  title: 'Стая близко',
  description: `Пронзительный вой разорвал тишину леса — совсем близко, возможно, в сотне метров. Ответные завывания донеслись слева и справа. Стая волков шла на охоту, и вы оказались на их территории.`,
  flavorText: 'Когда волки воют, лес затихает...',

  conditions: {
    locationIds: ['oak_grove_outskirts'],
    minProgress: 15,
    maxProgress: 85,
  },

  effects: [
    {
      type: 'modify_duration',
      modifier: 180,
      description: '+3 минуты (обход волчьей территории)',
    },
    {
      type: 'modify_success_chance',
      modifier: -5,
      description: '-5% к успеху (нервозность)',
    },
  ],

  weight: 16,
  icon: '🐺',
};

// ============================================================================
// КАБАНЬЯ АТАКА
// ============================================================================

export const eventOakBoarCharge: EventTemplate = {
  id: 'event_oak_boar_charge',
  name: 'Кабанья атака',
  type: 'negative',
  category: 'combat',

  title: 'Кабан!',
  description: `Из кустов с хрюканьем вылетел массивный кабан, нацелив клыки на незваного гостя. Зверь был разъярён — вероятно, защищал потомство или территорию. Уклониться не удалось, пришлось принять бой.`,
  flavorText: 'Кабан не знает страха. Он — сама ярость леса.',

  conditions: {
    locationIds: ['oak_grove_outskirts'],
    minProgress: 10,
    maxProgress: 80,
  },

  effects: [
    {
      type: 'spawn_enemy',
      enemyType: 'wild_boar',
      description: 'Дополнительный дикий кабан',
    },
    {
      type: 'damage_adventurer',
      modifier: 12,
      description: '-12% HP (клыки кабана)',
    },
    {
      type: 'damage_weapon',
      modifier: 5,
      description: '-5% прочности оружия',
    },
  ],

  weight: 14,
  icon: '🐗',
};

// ============================================================================
// ЛОСЬ НА ТРОПЕ
// ============================================================================

export const eventOakDeerSighting: EventTemplate = {
  id: 'event_oak_deer_sighting',
  name: 'Лось на тропе',
  type: 'neutral',
  category: 'travel',

  title: 'Величественный лось',
  description: `На тропе стоял огромный лось, спокойно пережёвывая листья. Его рога напоминали корону, а глаза смотрели с царственным спокойствием. Зверь не проявлял страха или агрессии — просто ждал, когда вы пройдёте.`,
  flavorText: 'Лось — король леса. Он не бежит — он решает.',

  conditions: {
    locationIds: ['oak_grove_outskirts'],
    minProgress: 20,
    maxProgress: 70,
  },

  effects: [
    {
      type: 'modify_duration',
      modifier: 60,
      description: '+1 минута (ожидание)',
    },
    {
      type: 'grant_location_material',
      materialRarity: 'common',
      materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+1 обычный материал (потерянный лосем)',
    },
  ],

  weight: 15,
  icon: '🦌',
};

// ============================================================================
// ДОБЫЧА ОХОТНИКА
// ============================================================================

export const eventOakHuntedPrey: EventTemplate = {
  id: 'event_oak_hunted_prey',
  name: 'Добыча охотника',
  type: 'positive',
  category: 'discovery',

  title: 'Чужая добыча',
  description: `Под деревом лежала туша оленя, свежая, но уже обработанная. Охотник оставил свою добычу — возможно, ушёл за подмогой или спешил по другим делам. Часть мяса была срезана, но шкура и рога остались нетронутыми.`,
  flavorText: 'Чужая удача — находка для другого.',

  conditions: {
    locationIds: ['oak_grove_outskirts'],
    minProgress: 25,
    maxProgress: 65,
  },

  effects: [
    {
      type: 'grant_location_material',
      materialRarity: 'common',
      materialQuantity: { base: 2, variance: 0.5, perDifficulty: 0, perRarity: 0 },
      description: '+2-3 обычных материала (шкура, рога)',
    },
    {
      type: 'modify_duration',
      modifier: 60,
      description: '+1 минута (сбор ресурсов)',
    },
  ],

  weight: 12,
  icon: '🥩',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const oakGroveWildlifeEvents: EventTemplate[] = [
  eventOakWolfHowl,
  eventOakBoarCharge,
  eventOakDeerSighting,
  eventOakHuntedPrey,
];
