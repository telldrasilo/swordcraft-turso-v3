/**
 * Общие события: Боевые столкновения
 *
 * События, связанные с враждебными существами и бойцами.
 * Используют теги для тематического соответствия локациям.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// ОХОТЯЩИЙСЯ ХИЩНИК (лес, горы, болото)
// ============================================================================

export const eventCommonHuntingPredator: EventTemplate = {
  id: 'event_common_hunting_predator',
  name: 'Охотящийся хищник',
  type: 'negative',
  category: 'combat',

  title: 'Хищник на охоте',
  description: `Рычание из кустов — и на тропу вышло массивное животное. Оно явно голодно и видит в вас добычу. Глаза хищника следят за каждым движением, мышцы напряжены перед прыжком. Близость к воде или густым зарослям даёт ему преимущество.`,
  flavorText: '"В дикой природе есть только два типа существ: охотники и добыча."',

  conditions: {
    locationTypes: ['forest', 'mountain', 'swamp'],
    locationTags: ['hunting_grounds', 'dangerous', 'night_danger'],
    minProgress: 20,
    maxProgress: 80,
  },

  effects: [
    {
      type: 'damage_adventurer',
      modifier: 18,
      description: '-18% HP (ранения от хищника)',
    },
    {
      type: 'damage_weapon',
      modifier: 8,
      description: '-8% прочности оружия (сражение)',
    },
    {
      type: 'modify_duration',
      modifier: 120,
      description: '+2 минуты к времени (бой и лечение)',
    },
  ],

  weight: 14,
  icon: '🐅',
};

// ============================================================================
// СТРАЖНИК ТЕРРИТОРИИ (шахты, подземелья, магические локации)
// ============================================================================

export const eventCommonTerritoryGuardian: EventTemplate = {
  id: 'event_common_territory_guardian',
  name: 'Страж территории',
  type: 'choice',
  category: 'combat',

  title: 'Вы вторглись на чужую территорию',
  description: `Из темноты выступила фигура — древний страж, охраняющий это место испокон веков. Он не атакует первым, но преграждает путь. Его глаза горят тусклым светом, а в руках — оружие, которое помнит ещё древних владельцев. Можете попытаться пройти силой или отступить.`,
  flavorText: '"Некоторые двери лучше оставить закрытыми..."',

  conditions: {
    locationTypes: ['mine', 'underground', 'magical'],
    locationTags: ['ancient_structures', 'dangerous', 'deep'],
    minProgress: 30,
    maxProgress: 70,
  },

  choices: [
    {
      id: 'fight',
      text: 'Прорываться силой',
      effects: [
        {
          type: 'damage_adventurer',
          modifier: 25,
          description: '-25% HP (тяжёлый бой)',
        },
        {
          type: 'damage_weapon',
          modifier: 12,
          description: '-12% прочности оружия',
        },
        {
          type: 'grant_location_material',
          materialRarity: 'uncommon',
          materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+2 необычных ресурса (трофеи стража)',
        },
      ],
      resultText: 'После жестокой схватки страж пал. Вы забрали то, что он охранял.',
    },
    {
      id: 'retreat',
      text: 'Отступить и искать другой путь',
      effects: [
        {
          type: 'modify_duration',
          modifier: 300,
          description: '+5 минут к времени (обход)',
        },
        {
          type: 'modify_success_chance',
          modifier: -3,
          description: '-3% к успеху (потеря времени)',
        },
      ],
      resultText: 'Вы отступили и нашли долгий обходной путь вокруг территории стража.',
    },
    {
      id: 'negotiate',
      text: 'Попробовать договориться',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: 5,
          description: '+5% к успеху (пропущен мирным путём)',
        },
        {
          type: 'modify_duration',
          modifier: 60,
          description: '+1 минута к времени (переговоры)',
        },
      ],
      resultText: 'Страж пропустил вас, признав, что вы не несёте угрозы его миссии.',
    },
  ],

  weight: 10,
  icon: '👹',
};

// ============================================================================
// НЕКРОМАНТОВЫ СЛУГИ (болото, подземелья, магические локации)
// ============================================================================

export const eventCommonNecromancerServants: EventTemplate = {
  id: 'event_common_necromancer_servants',
  name: 'Слуги некроманта',
  type: 'negative',
  category: 'combat',

  title: 'Мёртвые восстали',
  description: `Земля разверзлась, и из неё полезли скелеты — неестественно быстрые, с горящими глазами. Некромант где-то рядом, и его слуги чуют живых. Их немного, но они не знают страха и не чувствуют боли.`,
  flavorText: '"Смерть — не конец. Лишь начало вечной службы..."',

  conditions: {
    locationTypes: ['swamp', 'underground', 'magical'],
    locationTags: ['undead', 'corrupted_nature', 'dangerous'],
    minProgress: 25,
    maxProgress: 75,
  },

  effects: [
    {
      type: 'spawn_enemy',
      enemyType: 'random_from_location',
      description: 'Дополнительные враги из локации',
    },
    {
      type: 'damage_adventurer',
      modifier: 15,
      description: '-15% HP (ранения в бою)',
    },
    {
      type: 'modify_success_chance',
      modifier: -5,
      description: '-5% к успеху (истощение)',
    },
  ],

  weight: 12,
  icon: '💀',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const commonCombatEvents: EventTemplate[] = [
  eventCommonHuntingPredator,
  eventCommonTerritoryGuardian,
  eventCommonNecromancerServants,
];
