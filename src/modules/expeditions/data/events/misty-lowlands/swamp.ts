/**
 * События Туманных Низин: Болото и трясина
 *
 * Связаны с топями, болотными существами и опасностями местности.
 * Включают зыбучие пески, болтоходцев, пиявок.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// ЗЫБУЧИЕ ПЕСКИ
// ============================================================================

export const eventMistyQuicksand: EventTemplate = {
  id: 'event_misty_quicksand',
  name: 'Зыбучие пески',
  type: 'negative',
  category: 'danger',

  title: 'Почва уходит из-под ног',
  description: `Ты не заметил, как ступил на предательскую почву — земля под ногами превращается в вязкую жижу. Трясина затягивает медленно, но неумолимо. Паника только ускорит погружение.`,
  flavorText: '"В болоте спешка — верная смерть."',

  conditions: {
    locationIds: ['misty_lowlands'],
    minProgress: 10,
    maxProgress: 90,
  },

  effects: [
    {
      type: 'modify_duration',
      modifier: 180,
      description: '+3 минуты (выбираешься из трясины)',
    },
    {
      type: 'modify_success_chance',
      modifier: -8,
      description: '-8% к успеху (потеря сил)',
    },
  ],

  weight: 15,
  icon: '⚠️',
};

// ============================================================================
// БОЛТОХОДЕЦ
// ============================================================================

export const eventMistyBogWalker: EventTemplate = {
  id: 'event_misty_bog_walker',
  name: 'Болтоходец',
  type: 'choice',
  category: 'combat',

  title: 'Что-то поднимается из трясины',
  description: `Из трясины медленно поднимается фигура — покрытая тиной, с мёртвыми глазами. Болтоходец издаёт булькающий звук и начинает двигаться в твою сторону. Эти создания — бывшие путники, поглощённые болотом.`,
  flavorText: '"Они возвращаются... всегда возвращаются..."',

  conditions: {
    locationIds: ['misty_lowlands'],
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
          modifier: -5,
          description: '-5% к успеху (опасный противник)',
        },
        {
          type: 'grant_location_material',
          materialRarity: 'common',
          materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
          chance: 60,
          description: '+2 обычных материала при победе (60%)',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
          chance: 60,
          description: '+2 славы при победе (60%)',
        },
      ],
      resultText: 'Болтоходец атакует с неестественной силой!',
    },
    {
      id: 'flee',
      text: 'Бежать',
      effects: [
        {
          type: 'modify_duration',
          modifier: 120,
          description: '+2 минуты (побег)',
        },
        {
          type: 'modify_success_chance',
          modifier: -3,
          chance: 40,
          description: '-3% к успеху (болтоходец схватил)',
        },
      ],
      resultText: 'Ты бросаешься бежать сквозь туман!',
    },
    {
      id: 'fire',
      text: 'Использовать огонь (требуется факел)',
      effects: [
        {
          type: 'modify_duration',
          modifier: -30,
          description: '-0.5 минуты (болтоходец отступает)',
        },
        {
          type: 'modify_success_chance',
          modifier: 3,
          description: '+3% к успеху (безопасный путь)',
        },
      ],
      resultText: 'Болтоходец боится огня и отступает обратно в трясину.',
    },
  ],

  weight: 12,
  icon: '🧟',
};

// ============================================================================
// ХИЖИНА НА СВАЯХ
// ============================================================================

export const eventMistyHerbalistHut: EventTemplate = {
  id: 'event_misty_herbalist_hut',
  name: 'Хижина на сваях',
  type: 'positive',
  category: 'social',

  title: 'Признаки жилья',
  description: `Сквозь туман проступают очертания хижины на сваях. Из трубы идёт дым — здесь живёт кто-то, кто знает эти места. Травник-отшельник или, может быть, болотная ведьма.`,
  flavorText: '"В болоте каждый выживает по-своему..."',

  conditions: {
    locationIds: ['misty_lowlands'],
    minProgress: 25,
    maxProgress: 75,
  },

  effects: [
    {
      type: 'grant_location_material',
      materialRarity: 'uncommon',
      materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+2 необычных материала (mist_herbs)',
    },
    {
      type: 'grant_location_material',
      materialRarity: 'common',
      materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+2 обычных материала (swamp_moss)',
    },
    {
      type: 'modify_duration',
      modifier: -120,
      description: '-2 минуты (отдых и указания)',
    },
  ],

  weight: 10,
  icon: '🛖',
};

// ============================================================================
// ЗАСАДА ПИЯВОК
// ============================================================================

export const eventMistyLeechAmbush: EventTemplate = {
  id: 'event_misty_leech_ambush',
  name: 'Засада пиявок',
  type: 'negative',
  category: 'danger',

  title: 'Кровососы',
  description: `Проходя через мелководье, ты чувствуешь присасывание — гигантские пиявки атакуют со всех сторон! Их десятки, и каждая высасывает драгоценную кровь. Придётся потратить время, чтобы снять их.`,
  flavorText: '"В болоте вода нечистая... и не только вода."',

  conditions: {
    locationIds: ['misty_lowlands'],
    minProgress: 15,
    maxProgress: 85,
  },

  effects: [
    {
      type: 'modify_duration',
      modifier: 120,
      description: '+2 минуты (снимаешь пиявок)',
    },
    {
      type: 'modify_success_chance',
      modifier: -6,
      description: '-6% к успеху (потеря крови)',
    },
  ],

  weight: 14,
  icon: '🩸',
};

// ============================================================================
// РУКОЯТЬ РАЗБУХЛА ОТ ВЛАГИ
// ============================================================================

export const eventMistySwollenHaft: EventTemplate = {
  id: 'event_misty_swollen_haft',
  name: 'Рукоять от влаги',
  type: 'negative',
  category: 'environment',

  title: 'Дерево ведёт себя чужо',
  description: `Постоянная влага и туман добрались до рукояти: дерево разбухло, кольца потрескались — клинок сидит в посадке иначе, чем вчера. Удар по эфесу в спешке мог окончательно пустить трещину по волокнам.`,
  flavorText: '"Болото не любит сухих договоров с металлом."',

  conditions: {
    locationIds: ['misty_lowlands'],
    minProgress: 20,
    maxProgress: 88,
  },

  effects: [
    {
      type: 'damage_weapon',
      modifier: 6,
      description: '-6% прочности оружия (трещина рукояти и посадки)',
    },
    {
      type: 'modify_success_chance',
      modifier: -4,
      description: '-4% к успеху (непривычный баланс)',
    },
  ],

  weight: 12,
  icon: '🪵',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const mistySwampEvents: EventTemplate[] = [
  eventMistyQuicksand,
  eventMistyBogWalker,
  eventMistyHerbalistHut,
  eventMistyLeechAmbush,
  eventMistySwollenHaft,
];
