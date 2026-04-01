/**
 * Локация 2: Рудники Красного Камня
 * Tier 1 - Стартовая локация
 */

import type { Location } from '../../types';

export const redStoneMines: Location = {
  id: 'red_stone_mines',
  name: 'Рудники Красного Камня',
  description: `Старые медные и железные рудники, названные так из-за красноватого оттенка
окружающих скал. Шахты разрабатывались несколько столетий, и верхние уровни давно истощены.
Однако рабочие всё ещё находят жилы глубже, а некоторые штольни ведут к естественным пещерам.`,

  tier: 1,
  type: 'mine',
  tags: ['mine', 'underground', 'industrial', 'mineral_deposits', 'workers_territory'],

  unlockRequirements: {
    guildLevel: 1,
  },

  resources: [
    // Базовые материалы
    { materialId: 'iron_ore', baseWeight: 100, rarity: 'common', minQuantity: 4, maxQuantity: 10 },
    { materialId: 'copper_ore', baseWeight: 90, rarity: 'common', minQuantity: 3, maxQuantity: 8 },
    { materialId: 'tin_ore', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 4 },
    { materialId: 'coal', baseWeight: 80, rarity: 'common', minQuantity: 2, maxQuantity: 6 },
    { materialId: 'stone', baseWeight: 120, rarity: 'common', minQuantity: 5, maxQuantity: 15 },
    // Новые материалы
    { materialId: 'red_stone', baseWeight: 85, rarity: 'common', minQuantity: 2, maxQuantity: 7 },
    { materialId: 'flint', baseWeight: 70, rarity: 'common', minQuantity: 1, maxQuantity: 5 },
    { materialId: 'clay', baseWeight: 60, rarity: 'common', minQuantity: 2, maxQuantity: 6 },
    { materialId: 'copper_nuggets', baseWeight: 25, rarity: 'uncommon', minQuantity: 1, maxQuantity: 3 },
  ],

  rarityDistribution: { common: 90, uncommon: 10, rare: 0, epic: 0, legendary: 0 },

  weather: [
    { id: 'dry_air', name: 'Сухой воздух', chance: 40, effects: [] },
    { id: 'humidity', name: 'Влажность', chance: 30, effects: [
      { type: 'speed', value: -5 },
    ]},
    { id: 'gas_pockets', name: 'Газовые карманы', chance: 15, effects: [
      { type: 'damage', value: 15, description: 'Опасно с открытым огнём' }
    ]},
    { id: 'dust', name: 'Пыльная взвесь', chance: 10, effects: [
      { type: 'visibility', value: -10 }
    ]},
    { id: 'collapse_threat', name: 'Обвальная угроза', chance: 5, effects: [
      { type: 'damage', value: 20, description: 'Риск случайного урона' }
    ]},
  ],

  npcs: {
    hostile: [
      { id: 'cave_spider', name: 'Пещерный паук', levelRange: [1, 3], disposition: 'hostile',
        description: 'Плетёт сети в заброшенных штольнях' },
      { id: 'spider_queen', name: 'Королева пауков', levelRange: [5, 8], disposition: 'hostile',
        description: 'Древняя матка пауков размером с лошадь' },
      { id: 'ore_rat', name: 'Рудокрыс', levelRange: [2, 4], disposition: 'hostile',
        description: 'Огромные крысы размером с кошку' },
      { id: 'lost_miner', name: 'Заблудший шахтёр', levelRange: [3, 6], disposition: 'hostile',
        description: 'Призрачная фигура в темноте' },
      { id: 'mushroom_man', name: 'Грибной человек', levelRange: [4, 7], disposition: 'hostile',
        description: 'Существо из спор и плоти' },
    ],
    neutral: [
      { id: 'shift_supervisor', name: 'Старший смены', levelRange: [5, 8], disposition: 'neutral',
        description: 'Руководит работами, даёт задания' },
      { id: 'foreman', name: 'Бригадир', levelRange: [4, 6], disposition: 'neutral',
        description: 'Нанимает охрану для сопровождения' },
      { id: 'veteran_miner', name: 'Шахтёр-ветеран', levelRange: [6, 10], disposition: 'neutral',
        description: 'Знает все туннели наизусть' },
    ],
    friendly: [
      { id: 'master_blaster', name: 'Мастер-взрывник', levelRange: [8, 12], disposition: 'friendly',
        description: 'Учит работать с порохом' },
      { id: 'mine_cook', name: 'Повар из столовой', levelRange: [1, 3], disposition: 'friendly',
        description: 'Кормит рабочих, продаёт еду' },
    ],
  },

  plotHook: `Бригадир Харальд рассказывает о "глубокой штольне", которую нашли на нижнем уровне.
Рабочие пробили стену и обнаружили древний туннель, явно не естественного происхождения.
Стены там гладкие, как полированное стекло, а воздух холодный, как в могиле.
Двое рабочих уже пропали, когда попытались исследовать проход.`,

  dungeonHook: {
    name: 'Зеркальные залы',
    description: `За пробитой стеной открывается система залов, где стены отражают не то,
что перед ними стоит. Древние говорили о "племени зеркал", которое жило в толще камня
задолго до людей.`,
    entryRequirement: 'miner_lockpick',
    difficulty: 'hard',
  },
};

export default redStoneMines;
