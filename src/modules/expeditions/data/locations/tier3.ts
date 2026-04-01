/**
 * Локации Tier 3 - Опасный уровень
 */

import type { Location } from '../../types';

// ============================================================================
// Локация 7: Кряж Морозного Железа
// ============================================================================

export const frostIronRidge: Location = {
  id: 'frost_iron_ridge',
  name: 'Кряж Морозного Железа',
  description: `Горный хребет на севере, где температура никогда не поднимается выше нуля.
Здесь добывают морозное железо — металл, который можно ковать только раскалённым,
но который навсегда сохраняет холод после закалки.`,

  tier: 3,
  type: 'mountain',
  tags: ['mountain', 'ice', 'cold_iron', 'extreme_conditions', 'frozen', 'ancient_mines'],

  unlockRequirements: {
    guildLevel: 6,
  },

  resources: [
    { materialId: 'iron_ore', baseWeight: 60, rarity: 'common', minQuantity: 2, maxQuantity: 5 },
    { materialId: 'coal', baseWeight: 30, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
    { materialId: 'fieldstone', baseWeight: 80, rarity: 'common', minQuantity: 3, maxQuantity: 8 },
    { materialId: 'cold_iron_ore', baseWeight: 70, rarity: 'uncommon', minQuantity: 2, maxQuantity: 5 },
    { materialId: 'cold_iron', baseWeight: 25, rarity: 'rare', minQuantity: 1, maxQuantity: 3 },
    { materialId: 'eternal_ice', baseWeight: 40, rarity: 'uncommon', minQuantity: 1, maxQuantity: 4 },
    { materialId: 'frozen_crystals', baseWeight: 20, rarity: 'rare', minQuantity: 1, maxQuantity: 2 },
    { materialId: 'cryo_fungi', baseWeight: 35, rarity: 'uncommon', minQuantity: 1, maxQuantity: 3 },
    { materialId: 'primordial_ice', baseWeight: 8, rarity: 'epic', minQuantity: 1, maxQuantity: 1 },
  ],

  rarityDistribution: { common: 50, uncommon: 25, rare: 20, epic: 5, legendary: 0 },

  weather: [
    { id: 'blizzard', name: 'Метель', chance: 35, effects: [
      { type: 'visibility', value: -30 },
      { type: 'damage', value: 15, description: 'Урон от холода' }
    ]},
    { id: 'severe_frost', name: 'Сильный мороз', chance: 30, effects: [
      { type: 'speed', value: -20 },
      { type: 'damage', value: 10, description: 'Замерзание' }
    ]},
    { id: 'cloudy', name: 'Облачно', chance: 15, effects: [] },
    { id: 'aurora', name: 'Полярное сияние', chance: 10, effects: [
      { type: 'magic', value: 20, description: 'Магические эффекты усилены' }
    ]},
    { id: 'avalanche_threat', name: 'Лавинная угроза', chance: 5, effects: [
      { type: 'damage', value: 40, description: 'Риск схода лавины' }
    ]},
    { id: 'white_blindness', name: 'Белая слепота', chance: 5, effects: [
      { type: 'visibility', value: -100, description: 'Полная потеря ориентации' }
    ]},
  ],

  npcs: {
    hostile: [
      { id: 'ice_elemental', name: 'Ледяной элементаль', levelRange: [7, 11], disposition: 'hostile',
        description: 'Существо из чистого холода' },
      { id: 'frost_giant', name: 'Морозный великан', levelRange: [9, 13], disposition: 'hostile',
        description: 'Древний страж гор' },
      { id: 'frozen_traveler', name: 'Замёрзший путник', levelRange: [6, 9], disposition: 'hostile',
        description: 'Призраки погибших' },
      { id: 'white_wolf', name: 'Белый волк', levelRange: [5, 8], disposition: 'hostile',
        description: 'Стая из 4-6 особей', groupSize: 5 },
    ],
    neutral: [
      { id: 'mountain_guide', name: 'Горный проводник', levelRange: [8, 12], disposition: 'neutral',
        description: 'Знает безопасные перевалы' },
      { id: 'ice_hermit', name: 'Ледяной отшельник', levelRange: [6, 10], disposition: 'neutral',
        description: 'Живёт в пещере, торгует картами' },
      { id: 'frost_smith', name: 'Кузнец морозного железа', levelRange: [10, 15], disposition: 'neutral',
        description: 'Учит работать с холодным металлом' },
    ],
    friendly: [
      { id: 'mountain_spirit', name: 'Дух горы', levelRange: [12, 18], disposition: 'friendly',
        description: 'Помогает заблудившимся' },
      { id: 'old_miner', name: 'Старый горняк', levelRange: [8, 12], disposition: 'friendly',
        description: 'Последний из древней артели' },
    ],
  },

  plotHook: `Кузнец морозного железа Торин рассказывает о "Ледяной кузнице" — месте,
где морозное железо ковали древние. Говорят, там можно найти секрет работы с первозданным льдом.`,

  dungeonHook: {
    name: 'Сердце зимы',
    description: `В глубине ледников есть пещера, где время остановилось. Лёд там — не замёрзшая вода,
а застывшие мгновения.`,
    entryRequirement: 'icicle_key',
    difficulty: 'extreme',
  },
};

// ============================================================================
// Локация 8: Пепельные Пустоши
// ============================================================================

export const ashWastes: Location = {
  id: 'ash_wastes',
  name: 'Пепельные Пустоши',
  description: `Земля, когда-то процветавшая, теперь покрыта слоем пепла толщиной в человеческий рост.
Вулканическая катастрофа столетия назад превратила эту местность в ад на земле — раскалённые трещины,
ядовитые газы, пепельные бури. Но в этом пепле находят вулканическое стекло.`,

  tier: 3,
  type: 'volcanic',
  tags: ['volcanic', 'ash', 'fire', 'extreme_heat', 'ruins', 'corrupted_land'],

  unlockRequirements: {
    guildLevel: 6,
  },

  resources: [
    { materialId: 'iron_ore', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 4 },
    { materialId: 'coal', baseWeight: 80, rarity: 'common', minQuantity: 3, maxQuantity: 8 },
    { materialId: 'fieldstone', baseWeight: 60, rarity: 'common', minQuantity: 2, maxQuantity: 6 },
    { materialId: 'volcanic_glass', baseWeight: 35, rarity: 'rare', minQuantity: 1, maxQuantity: 3 },
    { materialId: 'ash_dust', baseWeight: 70, rarity: 'uncommon', minQuantity: 2, maxQuantity: 6 },
    { materialId: 'obsidian', baseWeight: 50, rarity: 'uncommon', minQuantity: 1, maxQuantity: 4 },
    { materialId: 'sulfur', baseWeight: 90, rarity: 'common', minQuantity: 3, maxQuantity: 8 },
    { materialId: 'fire_stone', baseWeight: 20, rarity: 'rare', minQuantity: 1, maxQuantity: 2 },
    { materialId: 'primordial_amber', baseWeight: 8, rarity: 'epic', minQuantity: 1, maxQuantity: 1 },
  ],

  rarityDistribution: { common: 50, uncommon: 25, rare: 20, epic: 5, legendary: 0 },

  weather: [
    { id: 'ash_storm', name: 'Пепельная буря', chance: 35, effects: [
      { type: 'visibility', value: -40 },
      { type: 'damage', value: 10, description: 'Урон снаряжению' }
    ]},
    { id: 'heat', name: 'Жара', chance: 25, effects: [
      { type: 'speed', value: -15 },
      { type: 'damage', value: 10, description: 'Тепловой удар' }
    ]},
    { id: 'poison_fog', name: 'Ядовитый туман', chance: 20, effects: [
      { type: 'damage', value: 20, description: 'Урон от газов' }
    ]},
    { id: 'clear', name: 'Относительная ясность', chance: 10, effects: [] },
    { id: 'volcanic_eruption', name: 'Вулканический выброс', chance: 5, effects: [
      { type: 'damage', value: 50, description: 'Критическая опасность' }
    ]},
    { id: 'fire_rain', name: 'Огненный дождь', chance: 5, effects: [
      { type: 'damage', value: 30, description: 'Раскалённые камни с неба' }
    ]},
  ],

  npcs: {
    hostile: [
      { id: 'fire_elemental', name: 'Огненный элементаль', levelRange: [7, 11], disposition: 'hostile',
        description: 'Существо из пламени' },
      { id: 'ash_golem', name: 'Пепельный голем', levelRange: [8, 12], disposition: 'hostile',
        description: 'Ожившая куча пепла' },
      { id: 'burned_ghost', name: 'Обгоревший призрак', levelRange: [6, 9], disposition: 'hostile',
        description: 'Душа погибшего в катастрофе' },
      { id: 'lava_worm', name: 'Лавовый червь', levelRange: [9, 13], disposition: 'hostile',
        description: 'Существо из магмы' },
    ],
    neutral: [
      { id: 'obsidian_seeker', name: 'Искатель обсидиана', levelRange: [6, 10], disposition: 'neutral',
        description: 'Добывает вулканическое стекло' },
      { id: 'fireproof_merchant', name: 'Огнеупорный торговец', levelRange: [5, 8], disposition: 'neutral',
        description: 'Появляется редко, редкие товары' },
      { id: 'mad_prophet', name: 'Безумный пророк', levelRange: [4, 6], disposition: 'neutral',
        description: 'Говорит о "возвращении огня"' },
    ],
    friendly: [
      { id: 'fire_smith', name: 'Кузнец огня', levelRange: [10, 15], disposition: 'friendly',
        description: 'Работает с вулканическими материалами' },
      { id: 'catastrophe_spirit', name: 'Дух катастрофы', levelRange: [12, 16], disposition: 'friendly',
        description: 'Хочет предупредить о будущем' },
    ],
  },

  plotHook: `Кузнец огня Игнис рассказывает о "Городе под пеплом" — столице региона, погребённой
за одну ночь. Говорят, её библиотека уцелела, и там хранятся знания о "сердце вулкана".`,

  dungeonHook: {
    name: 'Погребённый город Ирис',
    description: `Под слоем пепла лежит город, который был столицей цивилизации.
Его жители нашли способ пережить извержение — превратили себя в нечто иное.`,
    entryRequirement: 'coal_key',
    difficulty: 'extreme',
  },
};

// ============================================================================
// Локация 9: Шепчущий Лес
// ============================================================================

export const whisperingForest: Location = {
  id: 'whispering_forest',
  name: 'Шепчущий Лес',
  description: `Лес, где деревья помнят всё и шепчут свои воспоминания каждому, кто проходит мимо.
Голоса здесь — не просто звуки, а магия, проникающая в разум. Центр леса — запретная зона,
куда никто не возвращается. Говорят, там стоит дерево, которое было первым.`,

  tier: 3,
  type: 'magical',
  tags: ['forest', 'magical', 'spirits', 'whispers', 'ancient_trees', 'dangerous_magic'],

  unlockRequirements: {
    guildLevel: 6,
  },

  resources: [
    { materialId: 'iron_ore', baseWeight: 20, rarity: 'common', minQuantity: 1, maxQuantity: 2 },
    { materialId: 'coal', baseWeight: 30, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
    { materialId: 'spirit_wood', baseWeight: 45, rarity: 'rare', minQuantity: 1, maxQuantity: 4 },
    { materialId: 'whisper_moss', baseWeight: 60, rarity: 'uncommon', minQuantity: 2, maxQuantity: 5 },
    { materialId: 'echo_bark', baseWeight: 50, rarity: 'uncommon', minQuantity: 1, maxQuantity: 4 },
    { materialId: 'memory_leaf', baseWeight: 30, rarity: 'rare', minQuantity: 1, maxQuantity: 3 },
    { materialId: 'dream_resin', baseWeight: 40, rarity: 'uncommon', minQuantity: 1, maxQuantity: 4 },
    { materialId: 'ancient_sap', baseWeight: 10, rarity: 'epic', minQuantity: 1, maxQuantity: 1 },
  ],

  rarityDistribution: { common: 50, uncommon: 25, rare: 20, epic: 5, legendary: 0 },

  weather: [
    { id: 'whisper_fog', name: 'Шёпот (магический туман)', chance: 40, effects: [
      { type: 'special', value: 0, description: 'Голоса влияют на разум' }
    ]},
    { id: 'cloudy', name: 'Пасмурно', chance: 20, effects: [] },
    { id: 'fog', name: 'Туман', chance: 20, effects: [
      { type: 'stealth', value: 20 },
      { type: 'special', value: 0, description: 'Усиливает шёпот' }
    ]},
    { id: 'storm', name: 'Гроза', chance: 10, effects: [
      { type: 'damage', value: 20, description: 'Деревья кричат от молний' }
    ]},
    { id: 'clear', name: 'Ясно', chance: 5, effects: [] },
    { id: 'magic_storm', name: 'Магическая буря', chance: 5, effects: [
      { type: 'magic', value: 50, description: 'Голоса становятся визгом' }
    ]},
  ],

  npcs: {
    hostile: [
      { id: 'tree_spirit', name: 'Древесный дух', levelRange: [7, 11], disposition: 'hostile',
        description: 'Существо из коры и листьев' },
      { id: 'whispering_shadow', name: 'Шепчущая тень', levelRange: [8, 12], disposition: 'hostile',
        description: 'Призрак, повторяющий голоса' },
      { id: 'possessed_traveler', name: 'Одержимый путник', levelRange: [6, 9], disposition: 'hostile',
        description: 'Сошедший с ума от голосов' },
      { id: 'root_guardian', name: 'Корневой страж', levelRange: [9, 13], disposition: 'hostile',
        description: 'Защитник Первого Древа' },
    ],
    neutral: [
      { id: 'deaf_hermit', name: 'Глухой отшельник', levelRange: [4, 6], disposition: 'neutral',
        description: 'Не слышит голосов, безопасен' },
      { id: 'silence_seeker', name: 'Искатель тишины', levelRange: [6, 10], disposition: 'neutral',
        description: 'Ищет путь к центру' },
      { id: 'lost_child', name: 'Заблудший ребёнок', levelRange: [1, 2], disposition: 'neutral',
        description: 'Слышит только хорошие голоса' },
    ],
    friendly: [
      { id: 'ancient_druid', name: 'Древний друид', levelRange: [12, 18], disposition: 'friendly',
        description: 'Защищает от голосов' },
      { id: 'friendly_tree_spirit', name: 'Дух дерева-друга', levelRange: [8, 12], disposition: 'friendly',
        description: 'Помогает ориентироваться' },
    ],
  },

  plotHook: `Друид Элара рассказывает о "Первом Древе" — дереве, которое было посажено в начале мира.
Оно вбирает в себя все голоса и воспоминания, но взамен может дать ответ на любой вопрос.`,

  dungeonHook: {
    name: 'Корни Первого Древа',
    description: `Под лесом — не земля, а корни, уходящие в бесконечность. Говорят, они пронизывают
весь мир, и в месте, где они собираются вместе, можно услышать голос самого мира.`,
    entryRequirement: 'first_tree_fruit',
    difficulty: 'extreme',
  },
};
