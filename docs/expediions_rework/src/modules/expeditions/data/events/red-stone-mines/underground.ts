/**
 * События Рудников Красного Камня: Подземные явления
 *
 * События, связанные с шахтами, туннелями и пещерами.
 * Включают обвалы, газы, рудные жилы и затопления.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// ОБВАЛ
// ============================================================================

export const eventMineCaveIn: EventTemplate = {
  id: 'event_mine_cave_in',
  name: 'Обвал',
  type: 'negative',
  category: 'danger',

  title: 'Обвал!',
  description: `Грохот сверху — и потолок туннеля начал осыпаться. Камни и пыль посыпались на голову, пришлось броситься в сторону. Несколько секунд — и всё закончилось, но путь назад был завален.`,
  flavorText: 'Гора не прощает неосторожности...',

  conditions: {
    locationIds: ['red_stone_mines'],
    minProgress: 10,
    maxProgress: 90,
  },

  effects: [
    {
      type: 'damage_adventurer',
      modifier: 15,
      description: '-15% HP (камни)',
    },
    {
      type: 'modify_duration',
      modifier: 240,
      description: '+4 минуты (расчистка пути)',
    },
    {
      type: 'damage_weapon',
      modifier: 8,
      description: '-8% прочности оружия',
    },
  ],

  weight: 14,
  icon: '💥',
};

// ============================================================================
// ГАЗОВЫЙ КАРМАН
// ============================================================================

export const eventMineGasPocket: EventTemplate = {
  id: 'event_mine_gas_pocket',
  name: 'Газовый карман',
  type: 'negative',
  category: 'danger',

  title: 'Удушливый газ',
  description: `Внезапно воздух стал тяжёлым и едким — скопление подземного газа. Голова закружилась, глаза заслезились. Пришлось отступить и искать другой путь, пока лёгкие не отказали.`,
  flavorText: 'То, что нельзя увидеть — может убить быстрее всего...',

  conditions: {
    locationIds: ['red_stone_mines'],
    minProgress: 15,
    maxProgress: 85,
  },

  effects: [
    {
      type: 'damage_adventurer',
      modifier: 10,
      description: '-10% HP (отравление газом)',
    },
    {
      type: 'modify_success_chance',
      modifier: -8,
      description: '-8% к успеху (слабость)',
    },
    {
      type: 'modify_duration',
      modifier: 120,
      description: '+2 минуты (поиск обхода)',
    },
  ],

  weight: 12,
  icon: '☠️',
};

// ============================================================================
// БОГАТАЯ ЖИЛА
// ============================================================================

export const eventMineOreVein: EventTemplate = {
  id: 'event_mine_ore_vein',
  name: 'Богатая жила',
  type: 'positive',
  category: 'treasure',

  title: 'Золотая жила',
  description: `Стена туннеля блеснула — рудная жила, богатая медью и железом. Шахтёры оставили её нетронутой, то ли не заметив, то ли уйдя раньше времени. Несколько минут работы киркой — и карман наполнился ценной рудой.`,
  flavorText: 'Удача улыбается тем, кто смотрит по сторонам...',

  conditions: {
    locationIds: ['red_stone_mines'],
    minProgress: 20,
    maxProgress: 70,
  },

  effects: [
    {
      type: 'grant_location_material',
      materialRarity: 'uncommon',
      materialQuantity: { base: 3, variance: 0.5, perDifficulty: 0, perRarity: 0 },
      description: '+3-4 необычных материала',
    },
    {
      type: 'grant_resource',
      resourceId: 'gold',
      quantity: { base: 20, variance: 0.3, perDifficulty: 0, perRarity: 0 },
      description: '+20-26 золота',
    },
    {
      type: 'modify_duration',
      modifier: 90,
      description: '+1.5 минуты (добыча)',
    },
  ],

  weight: 12,
  icon: '💎',
};

// ============================================================================
// ЗАТОПЛЕННЫЙ ТУННЕЛЬ
// ============================================================================

export const eventMineFloodedTunnel: EventTemplate = {
  id: 'event_mine_flooded_tunnel',
  name: 'Затопленный туннель',
  type: 'choice',
  category: 'travel',

  title: 'Подземное озеро',
  description: `Туннель внезапно оборвался — дальше простиралось тёмное подземное озеро. Вода стояла неподвижно, отражая свет факела. Можно попытаться переплыть или поискать обходной путь по узким штольням.`,
  flavorText: 'Вода хранит секреты лучше камня...',

  conditions: {
    locationIds: ['red_stone_mines'],
    minProgress: 30,
    maxProgress: 70,
  },

  choices: [
    {
      id: 'swim',
      text: 'Переплыть озеро',
      effects: [
        {
          type: 'modify_duration',
          modifier: 60,
          description: '+1 минута (переправа)',
        },
        {
          type: 'grant_location_material',
          materialRarity: 'uncommon',
          materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+1 необычный материал (нашёл на дне)',
        },
        {
          type: 'damage_adventurer',
          modifier: 5,
          description: '-5% HP (холодная вода)',
        },
      ],
      resultText: 'Вы переплыли озеро и нашли на другой стороне что-то ценное.',
    },
    {
      id: 'detour',
      text: 'Искать обходной путь',
      effects: [
        {
          type: 'modify_duration',
          modifier: 180,
          description: '+3 минуты (долгий обход)',
        },
      ],
      resultText: 'После долгих блужданий по узким штольням вы нашли путь дальше.',
    },
    {
      id: 'dive',
      text: 'Нырнуть — возможно, на дне что-то есть',
      effects: [
        {
          type: 'grant_location_material',
          materialRarity: 'uncommon',
          materialQuantity: { base: 2, variance: 0.5, perDifficulty: 0, perRarity: 0 },
          description: '+2-3 uncommon материала (со дна)',
        },
        {
          type: 'modify_duration',
          modifier: 120,
          description: '+2 минуты (ныряние)',
        },
        {
          type: 'damage_adventurer',
          modifier: 8,
          description: '-8% HP (холод и нехватка воздуха)',
        },
      ],
      resultText: 'На дне озера вы нашли остатки старого шахтёрского снаряжения с образцами руды.',
    },
  ],

  weight: 10,
  icon: '🌊',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const redStoneUndergroundEvents: EventTemplate[] = [
  eventMineCaveIn,
  eventMineGasPocket,
  eventMineOreVein,
  eventMineFloodedTunnel,
];
