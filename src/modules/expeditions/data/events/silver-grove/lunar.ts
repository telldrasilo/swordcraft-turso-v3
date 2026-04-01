/**
 * События Серебряного Бора: Лунная магия
 *
 * Связаны с лунным светом, ночными превращениями и магическими явлениями.
 * Включают оборотней, лунных волков, теневых охотников.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// ЛУННЫЙ ВОЛК
// ============================================================================

export const eventSilverMoonWolf: EventTemplate = {
  id: 'event_silver_moon_wolf',
  name: 'Лунный волк',
  type: 'choice',
  category: 'combat',

  title: 'Серебристая тень',
  description: `Из-за деревьев появляются жёлтые глаза — один за другим. Лунные волки окружают тебя, их серебристая шерсть светится в полумраке. Они не атакуют сразу, оценивая добычу. Стая насчитывает не меньше пяти особей.`,
  flavorText: '"В Серебряном Бору даже хищники носят серебро..."',

  conditions: {
    locationIds: ['silver_grove'],
    minProgress: 20,
    maxProgress: 80,
  },

  choices: [
    {
      id: 'fight',
      text: 'Принять бой',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: -8,
          description: '-8% к успеху (стая опасна)',
        },
        {
          type: 'grant_location_material',
          materialRarity: 'uncommon',
          materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
          chance: 50,
          description: '+2 необычных материала при победе (50%)',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 4, variance: 0, perDifficulty: 0, perRarity: 0 },
          chance: 50,
          description: '+4 славы при победе (50%)',
        },
      ],
      resultText: 'Лунные волки атакуют слаженной стаей!',
    },
    {
      id: 'fire',
      text: 'Развести костёр (требуется трут)',
      effects: [
        {
          type: 'modify_duration',
          modifier: 120,
          description: '+2 минуты (разведение огня)',
        },
        {
          type: 'modify_success_chance',
          modifier: 3,
          description: '+3% к успеху (волки боятся огня)',
        },
      ],
      resultText: 'Огонь отпугивает волков — они отступают в темноту.',
    },
    {
      id: 'submit',
      text: 'Опустить голову и не смотреть в глаза',
      effects: [
        {
          type: 'modify_duration',
          modifier: 180,
          description: '+3 минуты (ждёшь, пока уйдут)',
        },
        {
          type: 'modify_success_chance',
          modifier: -2,
          description: '-2% к успеху (потеря времени)',
        },
      ],
      resultText: 'Волки оценивают тебя и решают, что не стоишь усилий.',
    },
  ],

  weight: 14,
  icon: '🐺',
};

// ============================================================================
// ТЕНЕВОЙ ОХОТНИК
// ============================================================================

export const eventSilverShadowHunter: EventTemplate = {
  id: 'event_silver_shadow_hunter',
  name: 'Теневой охотник',
  type: 'negative',
  category: 'danger',

  title: 'Нечто из тени',
  description: `Тени вокруг удлиняются, сгущаются в неестественные формы. Из темноты появляется существо — полупрозрачное, с горящими глазами. Теневой охотник выходит на охоту, и ты — его добыча. Оно появляется только ночью.`,
  flavorText: '"В Серебряном Бору тени имеют зубы..."',

  conditions: {
    locationIds: ['silver_grove'],
    minProgress: 30,
    maxProgress: 70,
  },

  effects: [
    {
      type: 'modify_success_chance',
      modifier: -10,
      description: '-10% к успеху (атака теневого охотника)',
    },
    {
      type: 'modify_duration',
      modifier: 120,
      description: '+2 минуты (побег или схватка)',
    },
  ],

  weight: 10,
  icon: '👤',
};

// ============================================================================
// ЛУННЫЙ СВЕТ
// ============================================================================

export const eventSilverMoonlight: EventTemplate = {
  id: 'event_silver_moonlight',
  name: 'Лунное озарение',
  type: 'positive',
  category: 'discovery',

  title: 'Лучи сквозь ветви',
  description: `Лунный свет пробивается сквозь кроны серебряных сосен, создавая дорожки на лесной подстилке. В этом свете обычные вещи кажутся другими — можно заметить то, что скрыто днём. Хвоя отливает настоящим серебром.`,
  flavorText: '"Луна раскрывает истинную природу вещей..."',

  conditions: {
    locationIds: ['silver_grove'],
    minProgress: 20,
    maxProgress: 70,
  },

  effects: [
    {
      type: 'grant_location_material',
      materialRarity: 'uncommon',
      materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+2 moonstone_shards (найдены в лунном свете)',
    },
    {
      type: 'grant_location_material',
      materialRarity: 'rare',
      materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
      chance: 30,
      description: 'Шанс найти silvered_pine (30%)',
    },
    {
      type: 'modify_duration',
      modifier: -60,
      description: '-1 минута (лунные тропы)',
    },
  ],

  weight: 12,
  icon: '🌙',
};

// ============================================================================
// ОБОРОТЕНЬ
// ============================================================================

export const eventSilverWerewolf: EventTemplate = {
  id: 'event_silver_werewewolf',
  name: 'Оборотень-одиночка',
  type: 'choice',
  category: 'combat',

  title: 'Проклятый',
  description: `На поляне стоит человек — или то, что было человеком. Его тело изгибается неестественно, кости хрустят, превращаясь. Оборотень замечает тебя и издаёт вой — полускрежет, полурык. Превращение почти завершено.`,
  flavorText: '"Серебро — единственное, что может его остановить..."',

  conditions: {
    locationIds: ['silver_grove'],
    minProgress: 25,
    maxProgress: 75,
  },

  choices: [
    {
      id: 'silver_weapon',
      text: 'Использовать серебряное оружие',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: 5,
          description: '+5% к успеху (серебро эффективно)',
        },
        {
          type: 'grant_location_material',
          materialRarity: 'uncommon',
          materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+2 необычных материала (трофеи)',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 5, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+5 славы (победа над оборотнем)',
        },
      ],
      resultText: 'Серебро обжигает оборотня, ослабляя его!',
    },
    {
      id: 'flee',
      text: 'Бежать, пока превращение не завершилось',
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
          description: '-4% к успеху (оборвотень догнал)',
        },
      ],
      resultText: 'Ты бросаешься бежать, слыша за спиной вой!',
    },
    {
      id: 'wait',
      text: 'Остаться на месте и не двигаться',
      effects: [
        {
          type: 'modify_duration',
          modifier: 120,
          description: '+2 минуты (ожидание)',
        },
        {
          type: 'narrative_only',
          chance: 60,
          description: 'Оборотень теряет интерес (60%)',
        },
        {
          type: 'modify_success_chance',
          modifier: -8,
          chance: 40,
          description: '-8% к успеху (нападение)',
        },
      ],
      resultText: 'Оборотень принюхивается, оценивая...',
    },
  ],

  weight: 10,
  icon: '🐺',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const silverLunarEvents: EventTemplate[] = [
  eventSilverMoonWolf,
  eventSilverShadowHunter,
  eventSilverMoonlight,
  eventSilverWerewolf,
];
