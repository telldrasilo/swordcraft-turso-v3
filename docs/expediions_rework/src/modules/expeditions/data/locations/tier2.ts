/**
 * Локации Tier 2 - Средний уровень
 */

import type { Location } from '../../types';

// ============================================================================
// Локация 4: Серебряный Бор
// ============================================================================

export const silverGrove: Location = {
  id: 'silver_grove',
  name: 'Серебряный Бор',
  description: `Сосновый бор, выросший на сереброносных жилах. Деревья здесь выше обычных,
их хвоя отливает серебром в лунном свете. Местные говорят, что ночью лес меняется —
появляются существа, которых нет днём, а тропы ведут не туда, куда вели вчера.`,

  tier: 2,
  type: 'forest',
  tags: ['forest', 'silver_deposit', 'night_danger', 'lunar_magic', 'ancient_trees'],

  unlockRequirements: {
    guildLevel: 3,
  },

  resources: [
    { materialId: 'silver_ore', baseWeight: 100, rarity: 'common', minQuantity: 4, maxQuantity: 10 },
    { materialId: 'iron_ore', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 4 },
    { materialId: 'coal', baseWeight: 40, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
    { materialId: 'pine_resin', baseWeight: 80, rarity: 'common', minQuantity: 2, maxQuantity: 6 },
    { materialId: 'pine_wood', baseWeight: 90, rarity: 'common', minQuantity: 3, maxQuantity: 8 },
    { materialId: 'silver_bark', baseWeight: 35, rarity: 'uncommon', minQuantity: 1, maxQuantity: 3 },
    { materialId: 'moonstone_shards', baseWeight: 20, rarity: 'uncommon', minQuantity: 1, maxQuantity: 2 },
    { materialId: 'silvered_pine', baseWeight: 10, rarity: 'rare', minQuantity: 1, maxQuantity: 1 },
  ],

  rarityDistribution: { common: 70, uncommon: 20, rare: 10, epic: 0, legendary: 0 },

  weather: [
    { id: 'clear_day', name: 'Ясно (день)', chance: 25, effects: [] },
    { id: 'cloudy', name: 'Пасмурно', chance: 20, effects: [] },
    { id: 'clear_night', name: 'Ясно (ночь)', chance: 20, effects: [
      { type: 'magic', value: 15, description: 'Магические эффекты усилены' }
    ]},
    { id: 'moonlight', name: 'Лунный свет', chance: 20, effects: [
      { type: 'magic', value: 25, description: 'Существа становятся сильнее' }
    ]},
    { id: 'fog', name: 'Туман', chance: 10, effects: [
      { type: 'stealth', value: 15 }
    ]},
    { id: 'storm', name: 'Гроза', chance: 5, effects: [
      { type: 'damage', value: 20, description: 'Серебро притягивает молнии' }
    ]},
  ],

  npcs: {
    hostile: [
      { id: 'moon_wolf', name: 'Лунный волк', levelRange: [4, 7], disposition: 'hostile',
        description: 'Серебристая шерсть, красные глаза', groupSize: 3 },
      { id: 'silver_spider', name: 'Серебряный паук', levelRange: [3, 6], disposition: 'hostile',
        description: 'Плетёт серебряные сети' },
      { id: 'werewolf_lonely', name: 'Оборотень-одиночка', levelRange: [5, 9], disposition: 'hostile',
        description: 'Проклятый, живущий в бору' },
      { id: 'shadow_hunter', name: 'Теневой охотник', levelRange: [6, 10], disposition: 'hostile',
        description: 'Существо, появляющееся только ночью' },
    ],
    neutral: [
      { id: 'silversmith', name: 'Серебряных дел мастер', levelRange: [8, 12], disposition: 'neutral',
        description: 'Живёт в уединении, кует из серебра' },
      { id: 'sleepwalker', name: 'Следопыт-лунатик', levelRange: [4, 6], disposition: 'neutral',
        description: 'Ходит во сне, но знает безопасные пути' },
      { id: 'old_ranger', name: 'Старый егерь', levelRange: [6, 10], disposition: 'neutral',
        description: 'Охраняет бор от браконьеров' },
    ],
    friendly: [
      { id: 'forest_maiden', name: 'Лесная дева', levelRange: [10, 15], disposition: 'friendly',
        description: 'Дух бора, помогает заблудившимся' },
      { id: 'hermit_scholar', name: 'Отшельник-учёный', levelRange: [5, 8], disposition: 'friendly',
        description: 'Изучает лунную магию' },
    ],
  },

  plotHook: `Серебряных дел мастер Ансельм говорит о "Лунной кузнице" — легендарном месте
где-то в глубине бора. Говорят, там серебро можно ковать при лунном свете,
и оно приобретает свойства, недоступные обычному огню.`,

  dungeonHook: {
    name: 'Лунная кузница',
    description: `В глубине бора, под корнями самого старого дерева, находится вход в пещеру,
где серебро растёт как коралл. Древние называли это место "Лунной кузницей".`,
    entryRequirement: 'silver_moon_key',
    difficulty: 'extreme',
  },
};

// ============================================================================
// Локация 5: Забытые Шахты
// ============================================================================

export const forgottenMines: Location = {
  id: 'forgotten_mines',
  name: 'Забытые Шахты',
  description: `Система древних шахт, забытых настолько давно, что даже имя тех, кто их строил,
утеряно. Туннели уходят глубоко в землю, соединяя естественные пещеры с выработками.
В глубине слышен гул, как от работы огромных машин, хотя ничего живого там не должно быть.`,

  tier: 2,
  type: 'mine',
  tags: ['mine', 'underground', 'abandoned', 'deep', 'ancient_structures', 'dangerous'],

  unlockRequirements: {
    guildLevel: 3,
  },

  resources: [
    { materialId: 'tin_ore', baseWeight: 100, rarity: 'common', minQuantity: 4, maxQuantity: 10 },
    { materialId: 'coal', baseWeight: 90, rarity: 'common', minQuantity: 3, maxQuantity: 8 },
    { materialId: 'iron_ore', baseWeight: 60, rarity: 'common', minQuantity: 2, maxQuantity: 5 },
    { materialId: 'copper_ore', baseWeight: 40, rarity: 'common', minQuantity: 1, maxQuantity: 4 },
    { materialId: 'deep_clay', baseWeight: 70, rarity: 'common', minQuantity: 2, maxQuantity: 5 },
    { materialId: 'ancient_coal', baseWeight: 35, rarity: 'uncommon', minQuantity: 1, maxQuantity: 3 },
    { materialId: 'echo_stone', baseWeight: 25, rarity: 'uncommon', minQuantity: 1, maxQuantity: 2 },
    { materialId: 'black_dust', baseWeight: 30, rarity: 'uncommon', minQuantity: 1, maxQuantity: 3 },
    { materialId: 'depth_iron', baseWeight: 12, rarity: 'rare', minQuantity: 1, maxQuantity: 2 },
  ],

  rarityDistribution: { common: 70, uncommon: 20, rare: 10, epic: 0, legendary: 0 },

  weather: [
    { id: 'dry_air', name: 'Сухой воздух', chance: 30, effects: [] },
    { id: 'humidity', name: 'Влажность', chance: 30, effects: [
      { type: 'speed', value: -5 },
    ]},
    { id: 'strange_hum', name: 'Странный гул', chance: 20, effects: [
      { type: 'special', value: 0, description: 'Психологическое давление' }
    ]},
    { id: 'gas_pockets', name: 'Газовые карманы', chance: 10, effects: [
      { type: 'damage', value: 20, description: 'Опасность взрыва' }
    ]},
    { id: 'earthquake', name: 'Землетрясение', chance: 5, effects: [
      { type: 'damage', value: 30, description: 'Обвальная угроза' }
    ]},
    { id: 'silence', name: 'Тишина', chance: 5, effects: [
      { type: 'special', value: 0, description: 'Полное отсутствие звуков — пугает' }
    ]},
  ],

  npcs: {
    hostile: [
      { id: 'deep_crawler', name: 'Глубинный ползун', levelRange: [4, 7], disposition: 'hostile',
        description: 'Слепое существо, охотится на звук' },
      { id: 'ancient_miner_ghost', name: 'Древний шахтёр', levelRange: [5, 8], disposition: 'hostile',
        description: 'Призрак старого рабочего' },
      { id: 'shadow_guard', name: 'Теневой страж', levelRange: [6, 10], disposition: 'hostile',
        description: 'Охраняет запретные зоны' },
      { id: 'echo_beast', name: 'Эхо-тварь', levelRange: [7, 11], disposition: 'hostile',
        description: 'Копирует голоса жертв' },
    ],
    neutral: [
      { id: 'speleologist', name: 'Спелеолог', levelRange: [4, 8], disposition: 'neutral',
        description: 'Исследует пещеры из любопытства' },
      { id: 'old_smuggler', name: 'Старый контрабандист', levelRange: [6, 10], disposition: 'neutral',
        description: 'Знает тайные ходы' },
      { id: 'lost_miner', name: 'Потерянный шахтёр', levelRange: [2, 4], disposition: 'neutral',
        description: 'Пропал год назад, не помнит как' },
    ],
    friendly: [
      { id: 'ghost_guide', name: 'Карта-призрак', levelRange: [5, 8], disposition: 'friendly',
        description: 'Дух показывает путь за помощь' },
      { id: 'survivor', name: 'Уцелевший исследователь', levelRange: [6, 10], disposition: 'friendly',
        description: 'Делится знаниями о шахте' },
    ],
  },

  plotHook: `Спелеолог Арнис нашёл странные механизмы глубоко в шахтах — не человеческого производства.
Они тихо гудят и вибрируют, хотя никого рядом нет. На стенах рядом надписи: "НЕ ПРОБУЖДАЙТЕ".`,

  dungeonHook: {
    name: 'Кузня древних',
    description: `В самом низу шахт находится огромный зал с машинами, работающими сами по себе.
Древние, построившие это место, не были людьми — и они не ушли, а заснули.`,
    entryRequirement: 'ancient_gear',
    difficulty: 'extreme',
  },
};

// ============================================================================
// Локация 6: Гнилое Болото
// ============================================================================

export const rottenSwamp: Location = {
  id: 'rotten_swamp',
  name: 'Гнилое Болото',
  description: `Огромное болото, где гниение — основа жизни. Воздух здесь токсичен, вода — ядовита,
а существа приспособились к условиям, смертельным для обычного человека. Но именно здесь
добывают болотное железо — редкий металл, приобретающий уникальные свойства.`,

  tier: 2,
  type: 'swamp',
  tags: ['swamp', 'toxic', 'decay', 'poison', 'undead', 'corrupted_nature'],

  unlockRequirements: {
    guildLevel: 3,
  },

  resources: [
    { materialId: 'iron_ore', baseWeight: 40, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
    { materialId: 'raw_leather', baseWeight: 50, rarity: 'common', minQuantity: 2, maxQuantity: 4 },
    { materialId: 'bog_iron', baseWeight: 60, rarity: 'uncommon', minQuantity: 2, maxQuantity: 5 },
    { materialId: 'rotten_wood', baseWeight: 80, rarity: 'common', minQuantity: 3, maxQuantity: 7 },
    { materialId: 'poison_gland', baseWeight: 35, rarity: 'uncommon', minQuantity: 1, maxQuantity: 3 },
    { materialId: 'decayed_bones', baseWeight: 60, rarity: 'common', minQuantity: 2, maxQuantity: 5 },
    { materialId: 'shadow_leather', baseWeight: 15, rarity: 'rare', minQuantity: 1, maxQuantity: 2 },
    { materialId: 'toxic_moss', baseWeight: 40, rarity: 'uncommon', minQuantity: 1, maxQuantity: 4 },
  ],

  rarityDistribution: { common: 70, uncommon: 20, rare: 10, epic: 0, legendary: 0 },

  weather: [
    { id: 'poison_fog', name: 'Ядовитый туман', chance: 40, effects: [
      { type: 'damage', value: 20, description: '-20% HP в час без защиты' }
    ]},
    { id: 'thick_smog', name: 'Густой смог', chance: 25, effects: [
      { type: 'visibility', value: -15 },
      { type: 'damage', value: 10, description: '+10% токсичность' }
    ]},
    { id: 'acid_rain', name: 'Кислотный дождь', chance: 15, effects: [
      { type: 'damage', value: 25, description: 'Урон снаряжению' }
    ]},
    { id: 'rotten_stench', name: 'Гнилое зловоние', chance: 15, effects: [
      { type: 'speed', value: -10, description: 'Ускоренное гниение' }
    ]},
    { id: 'relative_clear', name: 'Относительная ясность', chance: 5, effects: [] },
  ],

  npcs: {
    hostile: [
      { id: 'rotten_drowned', name: 'Гнилой утопленник', levelRange: [5, 8], disposition: 'hostile',
        description: 'Восставший труп из трясины' },
      { id: 'poison_newt', name: 'Ядовитый тритон', levelRange: [4, 7], disposition: 'hostile',
        description: 'Амфибия с токсичной кожей' },
      { id: 'corpse_worm', name: 'Трупный червь', levelRange: [3, 6], disposition: 'hostile',
        description: 'Огромный червь-падальщик' },
      { id: 'swamp_lich', name: 'Болото-лич', levelRange: [7, 11], disposition: 'hostile',
        description: 'Некромант, слившийся с болотом' },
    ],
    neutral: [
      { id: 'corpse_eater', name: 'Трупоед', levelRange: [4, 6], disposition: 'neutral',
        description: 'Собирает останки, торгует информацией' },
      { id: 'poisoner', name: 'Отравитель-отшельник', levelRange: [6, 10], disposition: 'neutral',
        description: 'Создаёт яды, ищет ингредиенты' },
      { id: 'survivor', name: 'Выживший', levelRange: [3, 5], disposition: 'neutral',
        description: 'Приспособился к токсинам' },
    ],
    friendly: [
      { id: 'swamp_healer', name: 'Болотный целитель', levelRange: [5, 8], disposition: 'friendly',
        description: 'Знает противоядия' },
      { id: 'drowned_spirit', name: 'Дух утопленника', levelRange: [4, 6], disposition: 'friendly',
        description: 'Просит освободить от проклятия' },
    ],
  },

  plotHook: `Отравитель-отшельник Скальд рассказывает о "Сердце гниения" — источнике всей токсичности
болота. Говорят, это древний артефакт, который когда-то был оружием в войне, давно забытой.`,

  dungeonHook: {
    name: 'Чрево гниения',
    description: `В центре болота есть место, где гниение останавливается. Тела там не разлагаются,
а консервируются в странной жидкости.`,
    entryRequirement: 'dead_amulet',
    difficulty: 'extreme',
  },
};
