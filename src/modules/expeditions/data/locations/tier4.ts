/**
 * Локации Tier 4 - Экстремальный уровень
 */

import type { Location } from '../../types';

// ============================================================================
// Локация 10: Драконьи Шрамы
// ============================================================================

export const dragonScars: Location = {
  id: 'dragon_scars',
  name: 'Драконьи Шрамы',
  description: `Горный хребет, где в древности происходила битва между драконами и богами.
Следы того сражения — расщелины, прожжённые до магмы, и ледяные пики, созданные дыханием
ледяных драконов — остались до сих пор. Драконы давно покинули эти места, но их потомки —
дрейки и виверны — всё ещё правят небом.`,

  tier: 4,
  type: 'mountain',
  tags: ['mountain', 'dragon_territory', 'extreme_danger', 'fire_and_ice', 'ancient_battleground', 'legendary_resources'],

  unlockRequirements: {
    guildLevel: 9,
  },

  resources: [
    { materialId: 'iron_ore', baseWeight: 40, rarity: 'common', minQuantity: 1, maxQuantity: 4 },
    { materialId: 'mithril_ore', baseWeight: 50, rarity: 'uncommon', minQuantity: 2, maxQuantity: 5 },
    { materialId: 'gold_ore', baseWeight: 30, rarity: 'uncommon', minQuantity: 1, maxQuantity: 3 },
    { materialId: 'coal', baseWeight: 20, rarity: 'common', minQuantity: 1, maxQuantity: 2 },
    { materialId: 'dragon_bone', baseWeight: 40, rarity: 'rare', minQuantity: 1, maxQuantity: 3 },
    { materialId: 'dragon_scale', baseWeight: 35, rarity: 'rare', minQuantity: 1, maxQuantity: 2 },
    { materialId: 'bloodstone', baseWeight: 55, rarity: 'uncommon', minQuantity: 1, maxQuantity: 4 },
    { materialId: 'star_metal', baseWeight: 15, rarity: 'epic', minQuantity: 1, maxQuantity: 1 },
    { materialId: 'dragon_glass', baseWeight: 12, rarity: 'epic', minQuantity: 1, maxQuantity: 1 },
    { materialId: 'heart_of_flame', baseWeight: 8, rarity: 'epic', minQuantity: 1, maxQuantity: 1 },
  ],

  rarityDistribution: { common: 30, uncommon: 30, rare: 25, epic: 14, legendary: 1 },

  weather: [
    { id: 'fire_wind', name: 'Огненный ветер', chance: 25, effects: [
      { type: 'damage', value: 15, description: 'Горячий воздух с пеплом' }
    ]},
    { id: 'ice_storm', name: 'Ледяной шторм', chance: 20, effects: [
      { type: 'damage', value: 15, description: 'Холод с ледяных пиков' }
    ]},
    { id: 'storm', name: 'Гроза', chance: 20, effects: [
      { type: 'damage', value: 20, description: 'Молнии между пиками' }
    ]},
    { id: 'earthquake', name: 'Землетрясение', chance: 15, effects: [
      { type: 'damage', value: 25, description: 'Дыхание спящего дракона' }
    ]},
    { id: 'clear', name: 'Относительная ясность', chance: 10, effects: [] },
    { id: 'dragon_cry', name: 'Драконий клич', chance: 5, effects: [
      { type: 'special', value: 0, description: 'Все враги бегут или усиливаются' }
    ]},
    { id: 'magic_storm', name: 'Магическая буря', chance: 5, effects: [
      { type: 'magic', value: 40, description: 'Хаотичная магия битвы' }
    ]},
  ],

  npcs: {
    hostile: [
      { id: 'drake', name: 'Дрейк', levelRange: [10, 14], disposition: 'hostile',
        description: 'Младший родственник драконов' },
      { id: 'wyvern', name: 'Виверна', levelRange: [9, 13], disposition: 'hostile',
        description: 'Летающий хищник' },
      { id: 'fire_giant', name: 'Огненный великан', levelRange: [12, 16], disposition: 'hostile',
        description: 'Потомок воинов древней битвы' },
      { id: 'ice_golem', name: 'Ледяной голем', levelRange: [11, 15], disposition: 'hostile',
        description: 'Создан дыханием ледяного дракона' },
      { id: 'dragon_cultist', name: 'Драконий культст', levelRange: [10, 14], disposition: 'hostile',
        description: 'Поклоняется спящему дракону' },
      { id: 'egg_guardian', name: 'Страж яйца', levelRange: [13, 17], disposition: 'hostile',
        description: 'Защищает драконье гнездо' },
    ],
    neutral: [
      { id: 'dragon_researcher', name: 'Драконий исследователь', levelRange: [8, 12], disposition: 'neutral',
        description: 'Изучает следы древних' },
      { id: 'survivor_hunter', name: 'Выживший охотник', levelRange: [10, 14], disposition: 'neutral',
        description: 'Знает повадки дрейков' },
      { id: 'peak_hermit', name: 'Отшельник на пике', levelRange: [6, 10], disposition: 'neutral',
        description: 'Наблюдает за спящим' },
    ],
    friendly: [
      { id: 'dragon_spirit', name: 'Дух дракона', levelRange: [15, 20], disposition: 'friendly',
        description: 'Остаток сознания древнего' },
      { id: 'dragonbone_smith', name: 'Кузнец драконьей кости', levelRange: [12, 18], disposition: 'friendly',
        description: 'Уникальный мастер' },
    ],
  },

  plotHook: `Кузнец драконьей кости Драган рассказывает о "Логове Последнего" — пещере в самом
высоком пике, где спит последний из древних драконов. Говорят, его чешуя — совершенный материал.`,

  presentElements: ['fire', 'blood', 'light', 'lightning'],

  dungeonHook: {
    name: 'Логово Последнего',
    description: `В самом высоком пике находится пещера, где спит дракон старше самого мира.
Его сны создают землетрясения, а дыхание — гейзеры.`,
    entryRequirement: 'dragon_amulet',
    difficulty: 'legendary',
  },
};

// ============================================================================
// Локация 11: Глубины Подземелий
// ============================================================================

export const depthsOfTheWorld: Location = {
  id: 'depths_of_the_world',
  name: 'Глубины Подземелий',
  description: `Система пещер и туннелей, уходящая в самое сердце мира. Никто не знает, кто создал их —
может, древние, может, боги, а может, они существовали всегда. Здесь действуют законы, отличные
от поверхностных: время течёт иначе, пространство искажается, а существа, живущие в глубине,
не подчиняются обычной логике.`,

  tier: 4,
  type: 'underground',
  tags: ['underground', 'ancient', 'extreme_danger', 'forbidden', 'eldritch', 'world_core'],

  unlockRequirements: {
    guildLevel: 9,
  },

  resources: [
    { materialId: 'iron_ore', baseWeight: 30, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
    { materialId: 'mithril_ore', baseWeight: 60, rarity: 'uncommon', minQuantity: 2, maxQuantity: 6 },
    { materialId: 'gold_ore', baseWeight: 50, rarity: 'uncommon', minQuantity: 2, maxQuantity: 5 },
    { materialId: 'silver_ore', baseWeight: 40, rarity: 'uncommon', minQuantity: 1, maxQuantity: 4 },
    { materialId: 'coal', baseWeight: 25, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
    { materialId: 'void_crystal', baseWeight: 30, rarity: 'epic', minQuantity: 1, maxQuantity: 2 },
    { materialId: 'soulforge_ember', baseWeight: 25, rarity: 'epic', minQuantity: 1, maxQuantity: 2 },
    { materialId: 'depth_stone', baseWeight: 60, rarity: 'uncommon', minQuantity: 2, maxQuantity: 5 },
    { materialId: 'ancient_metal', baseWeight: 40, rarity: 'rare', minQuantity: 1, maxQuantity: 3 },
    { materialId: 'living_ore', baseWeight: 35, rarity: 'rare', minQuantity: 1, maxQuantity: 2 },
    { materialId: 'heart_of_the_mountain', baseWeight: 5, rarity: 'legendary', minQuantity: 1, maxQuantity: 1 },
  ],

  rarityDistribution: { common: 30, uncommon: 30, rare: 25, epic: 14, legendary: 1 },

  weather: [
    { id: 'space_distortion', name: 'Искажение пространства', chance: 25, effects: [
      { type: 'special', value: 0, description: 'Пути меняются' }
    ]},
    { id: 'temporal_anomaly', name: 'Темпоральная аномалия', chance: 20, effects: [
      { type: 'special', value: 0, description: 'Время течёт иначе' }
    ]},
    { id: 'deep_darkness', name: 'Тьма глубины', chance: 20, effects: [
      { type: 'visibility', value: -100, description: 'Свет не работает' }
    ]},
    { id: 'gravity_shift', name: 'Гравитационный сдвиг', chance: 15, effects: [
      { type: 'special', value: 0, description: 'Гравитация меняется' }
    ]},
    { id: 'stability', name: 'Относительная стабильность', chance: 10, effects: [] },
    { id: 'ancient_awakening', name: 'Пробуждение древних', chance: 5, effects: [
      { type: 'damage', value: 30, description: 'Активация защитных систем' }
    ]},
    { id: 'depth_call', name: 'Зов глубины', chance: 5, effects: [
      { type: 'special', value: 0, description: 'Ментальное воздействие' }
    ]},
  ],

  npcs: {
    hostile: [
      { id: 'deep_horror', name: 'Глубинный ужас', levelRange: [12, 16], disposition: 'hostile',
        description: 'Существо из чистой тьмы' },
      { id: 'ancient_guardian', name: 'Древний страж', levelRange: [14, 18], disposition: 'hostile',
        description: 'Защитник забытых эпох' },
      { id: 'time_eater', name: 'Пожиратель времени', levelRange: [13, 17], disposition: 'hostile',
        description: 'Питается временными линиями' },
      { id: 'stone_leviathan', name: 'Каменный левиафан', levelRange: [15, 19], disposition: 'hostile',
        description: 'Огромное существо из породы' },
      { id: 'echo_of_ancients', name: 'Эхо древних', levelRange: [11, 15], disposition: 'hostile',
        description: 'Голоса ставшие плотью' },
      { id: 'core_guardian', name: 'Страж ядра', levelRange: [16, 20], disposition: 'hostile',
        description: 'Последняя линия защиты' },
      { id: 'world_shadow', name: 'Тень мира', levelRange: [17, 21], disposition: 'hostile',
        description: 'Отражение всего сущего' },
    ],
    neutral: [
      { id: 'lost_explorer', name: 'Потерянный путник', levelRange: [3, 5], disposition: 'neutral',
        description: 'Прошёл сотни лет, думал — дни' },
      { id: 'ancient_golem', name: 'Древний голем', levelRange: [10, 14], disposition: 'neutral',
        description: 'Выполняет забытую программу' },
      { id: 'mad_scholar', name: 'Безумный исследователь', levelRange: [8, 12], disposition: 'neutral',
        description: 'Говорит на мёртвых языках' },
    ],
    friendly: [
      { id: 'depth_spirit', name: 'Дух глубины', levelRange: [15, 20], disposition: 'friendly',
        description: 'Помогает найти путь' },
      { id: 'last_keeper', name: 'Последний хранитель', levelRange: [18, 22], disposition: 'friendly',
        description: 'Охраняет вход к сердцу' },
    ],
  },

  plotHook: `Последний хранитель Эон рассказывает, что Сердце горы — это не просто источник металлов,
а память самого мира. Оно помнит каждый момент истории и может показать будущее тому,
кто достаточно силён, чтобы выдержать это знание.`,

  presentElements: ['space', 'blood', 'skverna', 'darkness', 'arcane'],

  dungeonHook: {
    name: 'Сердце мира',
    description: `В центре всего находится пульсирующий кристалл размером с гору. Он — начало и конец
всех металлов, камней, всей материи. Говорят, что тот, кто коснётся его, увидит рождение и смерть мира.`,
    entryRequirement: 'key_of_ages',
    difficulty: 'legendary',
  },
};
