/**
 * События Драконьих Шрамов: Драконы и их потомки
 *
 * Связаны с дрейками, драконами и огнём/льдом.
 * Включают дрейков, драконьи клады, полёты драконов.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// ПОЛЁТ ДРАКОНА
// ============================================================================

export const eventDragonFlight: EventTemplate = {
  id: 'event_dragon_flight',
  name: 'Полёт дракона',
  type: 'negative',
  category: 'danger',

  title: 'Тень на земле',
  description: `Огромная тень накрывает тебя — над головой пролетает дрейк, а может и настоящий дракон. Ветер от крыльев сбивает с ног, а жар или холод обжигает кожу. Нужно укрыться!`,
  flavorText: '"Драконы не охотятся на людей. Люди — слишком мелкая добыча."',

  conditions: {
    locationIds: ['dragon_scars'],
    minProgress: 10,
    maxProgress: 90,
  },

  effects: [
    {
      type: 'modify_success_chance',
      modifier: -8,
      description: '-8% к успеху (нападение с воздуха)',
    },
    {
      type: 'modify_duration',
      modifier: 150,
      description: '+2.5 минуты (укрытие)',
    },
  ],

  weight: 16,
  icon: '🐉',
};

// ============================================================================
// КЛАД ДРАКОНА
// ============================================================================

export const eventDragonHoard: EventTemplate = {
  id: 'event_dragon_hoard',
  name: 'Клад дракона',
  type: 'positive',
  category: 'treasure',

  title: 'Блеск в расщелине',
  description: `В глубокой расщелине замечаешь блеск — золото, драгоценные камни, металлы. Это малая часть клада, возможно, выпавшая при древней битве или забытая дрейком. Риск есть, но награда того стоит.`,
  flavorText: '"Драконы не забывают своё золото. Никогда."',

  conditions: {
    locationIds: ['dragon_scars'],
    minProgress: 25,
    maxProgress: 70,
  },

  effects: [
    {
      type: 'grant_location_material',
      materialRarity: 'rare',
      materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
      description: '+2 dragon_bone',
    },
    {
      type: 'grant_location_material',
      materialRarity: 'epic',
      materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
      chance: 25,
      description: 'Шанс найти dragon_scale (25%)',
    },
    {
      type: 'modify_duration',
      modifier: -60,
      description: '-1 минута (удачная находка)',
    },
  ],

  weight: 8,
  icon: '💰',
};

// ============================================================================
// ДРАКОНЧИК
// ============================================================================

export const eventDragonWyrmling: EventTemplate = {
  id: 'event_dragon_wyrmling',
  name: 'Дракончик',
  type: 'choice',
  category: 'combat',

  title: 'Маленький хищник',
  description: `Из-за камня показывается голова — дракончик, молодой дракон размером с лошадь. Он ещё не умеет летать как следует, но уже опасен. Его глаза следят за каждым твоим движением, оценивая.`,
  flavorText: '"Даже детёныш дракона — смертоносный хищник."',

  conditions: {
    locationIds: ['dragon_scars'],
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
          modifier: -10,
          description: '-10% к успеху (опасный бой)',
        },
        {
          type: 'grant_location_material',
          materialRarity: 'rare',
          materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
          chance: 50,
          description: '+2 dragon_bone (50%)',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 5, variance: 0, perDifficulty: 0, perRarity: 0 },
          chance: 50,
          description: '+5 славы (50%)',
        },
      ],
      resultText: 'Дракончик издаёт пронзительный крик и атакует!',
    },
    {
      id: 'retreat',
      text: 'Отступить медленно',
      effects: [
        {
          type: 'modify_duration',
          modifier: 120,
          description: '+2 минуты (обход)',
        },
        {
          type: 'modify_success_chance',
          modifier: -3,
          chance: 30,
          description: '-3% к успеху (дракончик напал)',
        },
      ],
      resultText: 'Ты отступаешь, не сводя глаз с хищника.',
    },
    {
      id: 'bribe',
      text: 'Предложить блестяшку',
      effects: [
        {
          type: 'modify_duration',
          modifier: -90,
          chance: 60,
          description: '-1.5 минуты (дракончик отвлёкся)',
        },
        {
          type: 'modify_success_chance',
          modifier: -5,
          chance: 40,
          description: '-5% к успеху (дракончик разозлился)',
        },
      ],
      resultText: 'Дракончик принюхивается к подношению...',
    },
  ],

  weight: 12,
  icon: '🐲',
};

// ============================================================================
// ВЫЖЖЕННАЯ ЗЕМЛЯ
// ============================================================================

export const eventDragonScorchedEarth: EventTemplate = {
  id: 'event_dragon_scorched_earth',
  name: 'Выжженная земля',
  type: 'negative',
  category: 'environment',

  title: 'Стекло вместо камня',
  description: `Местность перед тобой превращена в стекло — когда-то здесь дракон извергнул пламя такой силы, что камень расплавился. Поверхность скользкая и горячая, а из трещин всё ещё пробивается жар.`,
  flavorText: '"Огонь дракона горячее любого пламени."',

  conditions: {
    locationIds: ['dragon_scars'],
    minProgress: 20,
    maxProgress: 80,
  },

  effects: [
    {
      type: 'modify_success_chance',
      modifier: -6,
      description: '-6% к успеху (жара и скользкая поверхность)',
    },
    {
      type: 'modify_duration',
      modifier: 120,
      description: '+2 минуты (преодоление препятствия)',
    },
  ],

  weight: 14,
  icon: '🔥',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const dragonScarsDragonEvents: EventTemplate[] = [
  eventDragonFlight,
  eventDragonHoard,
  eventDragonWyrmling,
  eventDragonScorchedEarth,
];
