/**
 * Общие события: Опасности
 *
 * Негативные события о ловушках, засадах и природных угрозах.
 * Применимы к большинству локаций.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// ЛОВУШКА
// ============================================================================

export const eventCommonTrap: EventTemplate = {
  id: 'event_common_trap',
  name: 'Ловушка',
  type: 'negative',
  category: 'danger',

  title: 'Ловушка!',
  description: `Неосторожный шаг — и под ногой щёлкнул скрытый механизм. Старая ловушка, установленная браконьерами или беглыми преступниками, всё ещё работает. Придётся потратить время и силы, чтобы освободиться.`,
  flavorText: 'Осторожность — лучшая защита от тех, кто был здесь до тебя.',

  conditions: {
    locationTypes: ['forest', 'mine', 'swamp'],
    minProgress: 5,
    maxProgress: 95,
  },

  effects: [
    {
      type: 'damage_adventurer',
      modifier: 10,
      description: '-10% HP искателя',
    },
    {
      type: 'damage_weapon',
      modifier: 5,
      description: '-5% прочности оружия',
    },
    {
      type: 'modify_duration',
      modifier: 120,
      description: '+2 минуты к времени миссии',
    },
  ],

  weight: 20,
  icon: '⚠️',
};

// ============================================================================
// ЗАСАДА
// ============================================================================

export const eventCommonAmbush: EventTemplate = {
  id: 'event_common_ambush',
  name: 'Засада',
  type: 'negative',
  category: 'combat',

  title: 'Нападение из засады!',
  description: `Тишина взорвалась криками и лязгом оружия. Прятавшиеся в тени разбойники напали внезапно, рассчитывая на лёгкую добычу. Их было трое — оборванные, но опытные в грязных делишках люди.`,
  flavorText: 'В этих местах каждый — добыча для кого-то.',

  conditions: {
    locationTypes: ['forest', 'mountain'],
    minProgress: 15,
    maxProgress: 85,
  },

  effects: [
    {
      type: 'spawn_enemy',
      enemyType: 'random_from_location',
      description: 'Дополнительный враг из локации',
    },
    {
      type: 'damage_adventurer',
      modifier: 15,
      description: '-15% HP от внезапной атаки',
    },
  ],

  weight: 15,
  icon: '⚔️',
};

// ============================================================================
// НЕУСТОЙЧИВАЯ ПОЧВА
// ============================================================================

export const eventCommonUnstableGround: EventTemplate = {
  id: 'event_common_unstable_ground',
  name: 'Неустойчивая почва',
  type: 'negative',
  category: 'danger',

  title: 'Трясина!',
  description: `Земля внезапно ушла из-под ног — скрытый провал или топкое место. С трудом удалось выбраться на твёрдую поверхность, но снаряжение пострадало, а одежда промокла насквозь.`,
  flavorText: 'Земля здесь ненадёжна — она помнит древние катастрофы.',

  conditions: {
    locationTypes: ['swamp', 'forest', 'mine'],
    minProgress: 10,
    maxProgress: 90,
  },

  effects: [
    {
      type: 'modify_duration',
      modifier: 180,
      description: '+3 минуты к времени (выбирался)',
    },
    {
      type: 'damage_weapon',
      modifier: 8,
      description: '-8% прочности оружия',
    },
    {
      type: 'modify_success_chance',
      modifier: -5,
      description: '-5% к успеху (промокшее снаряжение)',
    },
  ],

  weight: 18,
  icon: '🕳️',
};

// ============================================================================
// ВНЕЗАПНЫЙ ШТОРМ
// ============================================================================

export const eventCommonSuddenStorm: EventTemplate = {
  id: 'event_common_sudden_storm',
  name: 'Внезапный шторм',
  type: 'negative',
  category: 'environment',

  title: 'Буря налетела внезапно',
  description: `Небо, ещё минуту назад чистое, затянуло тучами. Ветер взвыл, неся с собой пыль и мелкие камни. Пришлось искать укрытие и пережидать непогоду — идти дальше было бы безумием.`,
  flavorText: 'Природа не спрашивает разрешения...',

  conditions: {
    minProgress: 20,
    maxProgress: 80,
  },

  effects: [
    {
      type: 'modify_duration',
      modifier: 300,
      description: '+5 минут к времени (пережидание бури)',
    },
    {
      type: 'damage_adventurer',
      modifier: 5,
      description: '-5% HP (переохлаждение)',
    },
  ],

  weight: 12,
  icon: '🌪️',
};

// ============================================================================
// ЯДОВИТОЕ РАСТЕНИЕ
// ============================================================================

export const eventCommonPoisonousPlant: EventTemplate = {
  id: 'event_common_poisonous_plant',
  name: 'Ядовитое растение',
  type: 'negative',
  category: 'danger',

  title: 'Яд!',
  description: `Неосторожное прикосновение к красивому цветку обернулось бедой — руки покрылись сыпью, а по телу разлилась слабость. Растение оказалось одним из тех, что лучше обходить стороной.`,
  flavorText: 'Не всё, что красиво — безопасно...',

  conditions: {
    locationTypes: ['forest', 'swamp', 'magical'],
    minProgress: 10,
    maxProgress: 90,
  },

  effects: [
    {
      type: 'damage_adventurer',
      modifier: 12,
      description: '-12% HP (отравление)',
    },
    {
      type: 'modify_success_chance',
      modifier: -8,
      description: '-8% к успеху (слабость от яда)',
    },
  ],

  weight: 16,
  icon: '☠️',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const commonDangerEvents: EventTemplate[] = [
  eventCommonTrap,
  eventCommonAmbush,
  eventCommonUnstableGround,
  eventCommonSuddenStorm,
  eventCommonPoisonousPlant,
];
