/**
 * События Рудников Красного Камня: Шахтёры
 *
 * События, связанные с людьми шахт.
 * Включают призраков, брошенное снаряжение и trapped шахтёров.
 */

import type { EventTemplate } from '../_event-template';

// ============================================================================
// ПРИЗРАК ШАХТЁРА
// ============================================================================

export const eventMineGhostMiner: EventTemplate = {
  id: 'event_mine_ghost_miner',
  name: 'Призрак шахтёра',
  type: 'neutral',
  category: 'social',

  title: 'Тень в темноте',
  description: `В глубине туннеля мелькнула полупрозрачная фигура — призрак шахтёра в старой робе, с киркой на плече. Он не выглядел враждебным, лишь печальным. Прошёл сквозь стену, оставив холодок на коже.`,
  flavorText: 'Некоторые туннели помнят тех, кто в них остался навсегда...',

  conditions: {
    locationIds: ['red_stone_mines'],
    minProgress: 20,
    maxProgress: 80,
  },

  effects: [
    {
      type: 'modify_duration',
      modifier: -30,
      description: '-30 секунд (призрак указал путь)',
    },
    {
      type: 'modify_success_chance',
      modifier: 2,
      description: '+2% к успеху (подсказка призрака)',
    },
  ],

  weight: 12,
  icon: '👻',
};

// ============================================================================
// БРОШЕННОЕ СНАРЯЖЕНИЕ
// ============================================================================

export const eventMineAbandonedEquipment: EventTemplate = {
  id: 'event_mine_abandoned_equipment',
  name: 'Брошенное снаряжение',
  type: 'positive',
  category: 'discovery',

  title: 'Забытая штольня',
  description: `В боковом ответвлении туннеля обнаружилась заброшенная штольня — инструменты, верёвки, несколько лопат. Шахтёры ушли в спешке, но оставили кое-что полезное. Судя по всему, это было давно — всё покрыто слоем пыли.`,
  flavorText: 'Чужая неудача — твоя находка...',

  conditions: {
    locationIds: ['red_stone_mines'],
    minProgress: 15,
    maxProgress: 75,
  },

  effects: [
    {
      type: 'grant_location_material',
      materialRarity: 'common',
      materialQuantity: { base: 2, variance: 0.5, perDifficulty: 0, perRarity: 0 },
      description: '+2-3 обычных материала',
    },
    {
      type: 'narrative_only',
      description: 'Инструменты могут пригодиться позже',
    },
  ],

  weight: 15,
  icon: '⛏️',
};

// ============================================================================
// ЗАВАЛЕННЫЙ ШАХТЁР
// ============================================================================

export const eventMineTrappedMiner: EventTemplate = {
  id: 'event_mine_trapped_miner',
  name: 'Заваленный шахтёр',
  type: 'choice',
  category: 'social',

  title: 'Крик из-под земли',
  description: `Из-под завала доносились слабые крики о помощи. Судя по голосу, там был живой человек — шахтёр, попавший под обвал. Можно попытаться его откопать или продолжить свой путь — время не ждёт.`,
  flavorText: 'В темноте каждый крик звучит громче...',

  conditions: {
    locationIds: ['red_stone_mines'],
    minProgress: 25,
    maxProgress: 65,
  },

  choices: [
    {
      id: 'rescue',
      text: 'Откопать шахтёра',
      effects: [
        {
          type: 'modify_duration',
          modifier: 300,
          description: '+5 минут (спасательные работы)',
        },
        {
          type: 'grant_resource',
          resourceId: 'gold',
          quantity: { base: 30, variance: 0.3, perDifficulty: 0, perRarity: 0 },
          description: '+30-39 золота (награда)',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 5, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+5 славы',
        },
        {
          type: 'modify_success_chance',
          modifier: 3,
          description: '+3% к успеху (указал безопасный путь)',
        },
      ],
      resultText: 'Шахтёр был спасён и в благодарность указал безопасный путь через рудник.',
    },
    {
      id: 'ignore',
      text: 'Продолжить миссию — некогда',
      effects: [
        {
          type: 'modify_success_chance',
          modifier: -5,
          description: '-5% к успеху (крики преследовали)',
        },
      ],
      resultText: 'Вы оставили крики позади, но они преследовали вас до конца пути.',
    },
    {
      id: 'call_help',
      text: 'Позвать на помощь и отметить место',
      effects: [
        {
          type: 'modify_duration',
          modifier: 60,
          description: '+1 минута (подготовка сигнала)',
        },
        {
          type: 'grant_resource',
          resourceId: 'glory',
          quantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: '+2 славы',
        },
      ],
      resultText: 'Вы оставили метку и послали сигнал — спасатели найдут его позже.',
    },
  ],

  weight: 8,
  icon: '🆘',
};

// ============================================================================
// СТАРЫЙ ЛАГЕРЬ
// ============================================================================

export const eventMineOldCamp: EventTemplate = {
  id: 'event_mine_old_camp',
  name: 'Старый лагерь',
  type: 'neutral',
  category: 'rest',

  title: 'Место отдыха',
  description: `В расширении туннеля обнаружился старый лагерь шахтёров — остатки костра, деревянные нары, пара сломанных лопат. Место было заброшено, но ещё хранило остатки человеческого тепла. Можно передохнуть здесь.`,
  flavorText: 'Даже в темноте люди ищут место для костра...',

  conditions: {
    locationIds: ['red_stone_mines'],
    minProgress: 30,
    maxProgress: 60,
  },

  effects: [
    {
      type: 'modify_duration',
      modifier: -120,
      description: '-2 минуты (отдых и восстановление)',
    },
    {
      type: 'narrative_only',
      description: 'Отдых восстановил силы',
    },
  ],

  weight: 14,
  icon: '🔥',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export const redStoneMinersEvents: EventTemplate[] = [
  eventMineGhostMiner,
  eventMineAbandonedEquipment,
  eventMineTrappedMiner,
  eventMineOldCamp,
];
