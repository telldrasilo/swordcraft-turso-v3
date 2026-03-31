/**
 * База знаний (Knowledge Discoveries) для системы loot
 * Знания, которые можно найти во время экспедиций
 */

import type {
  KnowledgeLoot,
  KnowledgeType,
  LocationTag,
  LootRarity,
  KnowledgeDropChance,
} from '../types/expedition-loot.types'

// ================================
// ЗНАНИЯ О ВРАГАХ (ENEMY KNOWLEDGE)
// ================================

/**
 * Слабости врагов
 */
export const ENEMY_WEAKNESS_KNOWLEDGE: KnowledgeLoot[] = [
  {
    id: 'goblin_weakness_fire',
    type: 'enemy',
    name: 'Огненная слабость гоблинов',
    description: 'Гоблины боятся огня. Огненное оружие наносит на 20% больше урона.',
    icon: '🔥',
    details: {
      enemyId: 'goblins',
      extra: {
        weakness: 'fire',
        damageBonus: 0.2,
      },
    },
    level: 1,
    bonuses: {
      goblinDamageBonus: 20,
    },
  },
  {
    id: 'goblin_weakness_poison',
    type: 'enemy',
    name: 'Ядовитая слабость гоблинов',
    description: 'Гоблины слабы к яду. Ядовитое оружие замедляет их на 15%.',
    icon: '☠️',
    details: {
      enemyId: 'goblins',
      extra: {
        weakness: 'poison',
        slow: 0.15,
      },
    },
    level: 1,
    bonuses: {
      goblinSlowChance: 15,
    },
  },
  {
    id: 'undead_weakness_holy',
    type: 'enemy',
    name: 'Святая слабость нежити',
    description: 'Нежить уязвима к святому оружию. Наносит на 30% больше урона.',
    icon: '✨',
    details: {
      enemyId: 'undead',
      extra: {
        weakness: 'holy',
        damageBonus: 0.3,
      },
    },
    level: 2,
    bonuses: {
      undeadDamageBonus: 30,
    },
  },
  {
    id: 'undead_weakness_fire',
    type: 'enemy',
    name: 'Огненное очищение нежити',
    description: 'Огонь сжигает нежить. Огненное оружие наносит на 25% больше урона.',
    icon: '🔥',
    details: {
      enemyId: 'undead',
      extra: {
        weakness: 'fire',
        damageBonus: 0.25,
      },
    },
    level: 2,
    bonuses: {
      undeadFireDamageBonus: 25,
    },
  },
  {
    id: 'wolf_weakness_trap',
    type: 'enemy',
    name: 'Ловчие хитрости против волков',
    description: 'Волки легко попадаются в ловушки. Шанс поймать волка увеличен на 20%.',
    icon: '🪤',
    details: {
      enemyId: 'wolves',
      extra: {
        bonus: 'trap_efficiency',
        value: 0.2,
      },
    },
    level: 1,
    bonuses: {
      wolfTrapChance: 20,
    },
  },
  {
    id: 'dragon_weakness_cold',
    type: 'enemy',
    name: 'Холодная слабость драконов',
    description: 'Драконы уязвимы к холоду. Холодное оружие наносит на 35% больше урона.',
    icon: '❄️',
    details: {
      enemyId: 'dragons',
      extra: {
        weakness: 'cold',
        damageBonus: 0.35,
      },
    },
    level: 5,
    bonuses: {
      dragonColdDamageBonus: 35,
    },
  },
  {
    id: 'troll_weakness_fire',
    type: 'enemy',
    name: 'Огненное оружие против троллей',
    description: 'Тролли не восстанавливаются после удара огненным оружием.',
    icon: '🔥',
    details: {
      enemyId: 'trolls',
      extra: {
        weakness: 'fire',
        preventRegeneration: true,
      },
    },
    level: 3,
    bonuses: {
      trollRegenerationPrevented: true,
    },
  },
  {
    id: 'spider_weakness_light',
    type: 'enemy',
    name: 'Свет против пауков',
    description: 'Пауки слепнут от яркого света. Светящееся оружие ослепляет их на 20%.',
    icon: '💡',
    details: {
      enemyId: 'spiders',
      extra: {
        weakness: 'light',
        blind: 0.2,
      },
    },
    level: 2,
    bonuses: {
      spiderBlindChance: 20,
    },
  },
]

/**
 * Методы борьбы с врагами
 */
export const ENEMY_COMBAT_KNOWLEDGE: KnowledgeLoot[] = [
  {
    id: 'goblin_swarm_tactics',
    type: 'enemy',
    name: 'Тактика против гоблиньих стай',
    description: 'Гоблины атакуют стаями. Лучше биться в узких проходах.',
    icon: '🗺️',
    details: {
      enemyId: 'goblins',
      extra: {
        tactic: 'narrow_spaces',
      },
    },
    level: 2,
    bonuses: {
      goblinNarrowSpaceBonus: 15,
    },
  },
  {
    id: 'undead_avoid_infection',
    type: 'enemy',
    name: 'Избегание заражения от нежити',
    description: 'Нежить распространяет заразу. Используйте защищённые доспехи.',
    icon: '🛡️',
    details: {
      enemyId: 'undead',
      extra: {
        defence: 'infection_resistance',
      },
    },
    level: 2,
    bonuses: {
      undeadInfectionResistance: 20,
    },
  },
  {
    id: 'dragon_scale_weak_points',
    type: 'enemy',
    name: 'Слабые точки чешуи дракона',
    description: 'Подкрылья и шея дракона менее защищены. Удар туда наносит на 25% больше урона.',
    icon: '🎯',
    details: {
      enemyId: 'dragons',
      extra: {
        weakPoints: ['underwing', 'neck'],
        damageBonus: 0.25,
      },
    },
    level: 4,
    bonuses: {
      dragonCriticalBonus: 25,
    },
  },
]

// ================================
// ЗНАНИЯ О ЛОКАЦИЯХ (LOCATION KNOWLEDGE)
// ================================

/**
 * Секретные пути в локациях
 */
export const LOCATION_SECRET_PATHS_KNOWLEDGE: KnowledgeLoot[] = [
  {
    id: 'forest_hidden_grove',
    type: 'location',
    name: 'Скрытая роща в лесу',
    description: 'В лесу есть скрытая роща с редкими материалами. Кратчайший путь к ней.',
    icon: '🌲',
    details: {
      locationId: 'forest',
      extra: {
        secret: 'hidden_grove',
        resourceBonus: 0.3,
      },
    },
    level: 1,
    bonuses: {
      forestResourceBonus: 30,
    },
  },
  {
    id: 'cave_underground_lake',
    type: 'location',
    name: 'Подземное озеро в пещере',
    description: 'В пещере есть подземное озеро с уникальными материалами.',
    icon: '💧',
    details: {
      locationId: 'cave',
      extra: {
        secret: 'underground_lake',
        materialChance: 0.2,
      },
    },
    level: 2,
    bonuses: {
      caveMaterialBonus: 20,
    },
  },
  {
    id: 'ruins_hidden_chamber',
    type: 'location',
    name: 'Скрытая комната в руинах',
    description: 'В руинах есть скрытая комната с древними артефактами.',
    icon: '🏺',
    details: {
      locationId: 'ruins',
      extra: {
        secret: 'hidden_chamber',
        artifactChance: 0.15,
      },
    },
    level: 3,
    bonuses: {
      ruinsArtifactChance: 15,
    },
  },
  {
    id: 'mountain_ancient_mine',
    type: 'location',
    name: 'Древняя шахта в горах',
    description: 'В горах есть древняя шахта с редкими рудами.',
    icon: '⛏️',
    details: {
      locationId: 'mountain',
      extra: {
        secret: 'ancient_mine',
        oreChance: 0.25,
      },
    },
    level: 3,
    bonuses: {
      mountainOreBonus: 25,
    },
  },
  {
    id: 'swamp_mystic_island',
    type: 'location',
    name: 'Мистический остров в болоте',
    description: 'В центре болота есть мистический остров с редкими материалами.',
    icon: '🏝️',
    details: {
      locationId: 'swamp',
      extra: {
        secret: 'mystic_island',
        essenceChance: 0.15,
      },
    },
    level: 2,
    bonuses: {
      swampEssenceChance: 15,
    },
  },
  {
    id: 'dungeon_secret_passage',
    type: 'location',
    name: 'Скрытый проход в подземелье',
    description: 'В подземелье есть скрытый проход, который ведёт к сокровищам.',
    icon: '🚪',
    details: {
      locationId: 'dungeon',
      extra: {
        secret: 'secret_passage',
        treasureChance: 0.2,
      },
    },
    level: 4,
    bonuses: {
      dungeonTreasureChance: 20,
    },
  },
]

/**
 * Ресурсы в локациях
 */
export const LOCATION_RESOURCES_KNOWLEDGE: KnowledgeLoot[] = [
  {
    id: 'forest_ancient_trees',
    type: 'location',
    name: 'Древние деревья в лесу',
    description: 'В лесу растут древние деревья с редкой древесиной.',
    icon: '🌳',
    details: {
      locationId: 'forest',
      extra: {
        resource: 'rare_wood',
        chance: 0.15,
      },
    },
    level: 2,
    bonuses: {
      forestRareWoodChance: 15,
    },
  },
  {
    id: 'cave_crystal_veins',
    type: 'location',
    name: 'Кристаллические жилы в пещере',
    description: 'В пещере есть кристаллические жилы с уникальными камнями.',
    icon: '💎',
    details: {
      locationId: 'cave',
      extra: {
        resource: 'crystals',
        chance: 0.12,
      },
    },
    level: 2,
    bonuses: {
      caveCrystalChance: 12,
    },
  },
  {
    id: 'ruins_artifact_fragments',
    type: 'location',
    name: 'Фрагменты артефактов в руинах',
    description: 'В руинах можно найти фрагменты древних артефактов.',
    icon: '🔮',
    details: {
      locationId: 'ruins',
      extra: {
        resource: 'artifact_fragments',
        chance: 0.1,
      },
    },
    level: 3,
    bonuses: {
      ruinsArtifactFragmentChance: 10,
    },
  },
]

// ================================
// ЗНАНИЯ О КРАФТЕ (CRAFT KNOWLEDGE)
// ================================

/**
 * Новые рецепты
 */
export const CRAFT_RECIPE_KNOWLEDGE: KnowledgeLoot[] = [
  {
    id: 'recipe_cold_iron_sword',
    type: 'craft',
    name: 'Рецепт: Меч из холодного железа',
    description: 'Меч из холодного железа эффективен против нежити.',
    icon: '⚔️',
    details: {
      craftId: 'cold_iron_sword',
      extra: {
        weaponType: 'sword',
        material: 'coldIron',
        bonusVs: 'undead',
        bonusValue: 0.3,
      },
    },
    level: 3,
    bonuses: {
      unlocksRecipe: 'cold_iron_sword',
    },
  },
  {
    id: 'recipe_dragon_scale_armor',
    type: 'craft',
    name: 'Рецепт: Броня из чешуи дракона',
    description: 'Броня из чешуи дракона защищает от огня.',
    icon: '🛡️',
    details: {
      craftId: 'dragon_scale_armor',
      extra: {
        armorType: 'scale',
        material: 'dragonLeather',
        resistance: 'fire',
        resistanceValue: 0.4,
      },
    },
    level: 5,
    bonuses: {
      unlocksRecipe: 'dragon_scale_armor',
    },
  },
  {
    id: 'recipe_mithril_blade',
    type: 'craft',
    name: 'Рецепт: Митриловый клинок',
    description: 'Митриловый клинок невероятно остр и лёгок.',
    icon: '🗡️',
    details: {
      craftId: 'mithril_blade',
      extra: {
        weaponType: 'sword',
        material: 'mithril',
        attackBonus: 0.25,
        weightBonus: -0.3,
      },
    },
    level: 4,
    bonuses: {
      unlocksRecipe: 'mithril_blade',
    },
  },
  {
    id: 'recipe_obsidian_dagger',
    type: 'craft',
    name: 'Рецепт: Обсидиановый кинжал',
    description: 'Обсидиановый кинжал наносит критический урон.',
    icon: '🗡️',
    details: {
      craftId: 'obsidian_dagger',
      extra: {
        weaponType: 'dagger',
        material: 'obsidian',
        criticalBonus: 0.2,
      },
    },
    level: 2,
    bonuses: {
      unlocksRecipe: 'obsidian_dagger',
    },
  },
]

/**
 * Техники крафта
 */
export const CRAFT_TECHNIQUE_KNOWLEDGE: KnowledgeLoot[] = [
  {
    id: 'technique_folding_steel',
    type: 'craft',
    name: 'Техника: Складывание стали',
    description: 'Многослойная сталь повышает прочность оружия.',
    icon: '🔧',
    details: {
      craftId: 'steel_folding',
      extra: {
        material: 'steel',
        technique: 'folding',
        durabilityBonus: 0.3,
      },
    },
    level: 2,
    bonuses: {
      steelDurabilityBonus: 30,
    },
  },
  {
    id: 'technique_quenching_ice',
    type: 'craft',
    name: 'Техника: Закалка в льду',
    description: 'Закалка в льду делает оружие более хрупким, но острым.',
    icon: '❄️',
    details: {
      craftId: 'ice_quenching',
      extra: {
        technique: 'ice_quenching',
        attackBonus: 0.15,
        durabilityPenalty: -0.2,
      },
    },
    level: 3,
    bonuses: {
      iceQuenchingAttackBonus: 15,
      iceQuenchingDurabilityPenalty: -20,
    },
  },
  {
    id: 'technique_runed_forging',
    type: 'craft',
    name: 'Техника: Руновая ковка',
    description: 'Нанесение рун на оружие усиливает его магические свойства.',
    icon: '✨',
    details: {
      craftId: 'runed_forging',
      extra: {
        technique: 'runed',
        magicBonus: 0.25,
      },
    },
    level: 4,
    bonuses: {
      runedForgingMagicBonus: 25,
    },
  },
  {
    id: 'technique_dragon_tempering',
    type: 'craft',
    name: 'Техника: Драконья закалка',
    description: 'Использование огня дракона для закалки оружия.',
    icon: '🔥',
    details: {
      craftId: 'dragon_tempering',
      extra: {
        technique: 'dragon_tempering',
        resistanceBonus: 0.2,
      },
    },
    level: 5,
    bonuses: {
      dragonTemperingResistanceBonus: 20,
    },
  },
]

/**
 * Секреты материалов
 */
export const CRAFT_MATERIAL_KNOWLEDGE: KnowledgeLoot[] = [
  {
    id: 'material_mithril_properties',
    type: 'craft',
    name: 'Свойства митрила',
    description: 'Митрил невероятно лёгкий, но прочный металл.',
    icon: '💠',
    details: {
      craftId: 'mithril_properties',
      extra: {
        material: 'mithril',
        properties: {
          weight: 0.4,  // 40% от стали
          strength: 1.5, // 150% стали
        },
      },
    },
    level: 4,
    bonuses: {
      mithrilWeightBonus: 40,
      mithrilStrengthBonus: 50,
    },
  },
  {
    id: 'material_obsidian_edge',
    type: 'craft',
    name: 'Ребро обсидиана',
    description: 'Обсидиан имеет невероятно острое ребро.',
    icon: '🗡️',
    details: {
      craftId: 'obsidian_edge',
      extra: {
        material: 'obsidian',
        properties: {
          sharpness: 1.8, // 180% стали
          brittleness: 1.3, // 130% стали
        },
      },
    },
    level: 2,
    bonuses: {
      obsidianSharpnessBonus: 80,
      obsidianBrittlenessPenalty: -30,
    },
  },
  {
    id: 'material_dragon_scales',
    type: 'craft',
    name: 'Чешуя дракона',
    description: 'Чешуя дракона обладает магическими свойствами и высокой прочностью.',
    icon: '🐉',
    details: {
      craftId: 'dragon_scales',
      extra: {
        material: 'dragonLeather',
        properties: {
          magicResistance: 0.4,
          fireResistance: 0.6,
          durability: 2.0, // 200% кожи
        },
      },
    },
    level: 5,
    bonuses: {
      dragonScaleMagicResistance: 40,
      dragonScaleFireResistance: 60,
      dragonScaleDurabilityBonus: 100,
    },
  },
]

// ================================
// ВСЕ ЗНАНИЯ
// ================================

/**
 * Все знания сгруппированы по типам
 */
export const ALL_KNOWLEDGE: Record<KnowledgeType, KnowledgeLoot[]> = {
  enemy: [
    ...ENEMY_WEAKNESS_KNOWLEDGE,
    ...ENEMY_COMBAT_KNOWLEDGE,
  ],
  location: [
    ...LOCATION_SECRET_PATHS_KNOWLEDGE,
    ...LOCATION_RESOURCES_KNOWLEDGE,
  ],
  craft: [
    ...CRAFT_RECIPE_KNOWLEDGE,
    ...CRAFT_TECHNIQUE_KNOWLEDGE,
    ...CRAFT_MATERIAL_KNOWLEDGE,
  ],
}

/**
 * Все знания в одном массиве
 */
export const KNOWLEDGE_LIST: KnowledgeLoot[] = [
  ...ALL_KNOWLEDGE.enemy,
  ...ALL_KNOWLEDGE.location,
  ...ALL_KNOWLEDGE.craft,
]

// ================================
// ТАБЛИЦЫ ДРОПА ЗНАНИЙ
// ================================

/**
 * Вероятности дропа знаний для разных локаций
 */
export const KNOWLEDGE_DROP_TABLES: Record<LocationTag, KnowledgeDropChance[]> = {
  forest: [
    {
      knowledgeId: 'forest_hidden_grove',
      chance: 25,
      minRarity: 'common',
      maxRarity: 'rare',
      conditions: {
        eventType: ['discovery'],
      },
    },
    {
      knowledgeId: 'forest_ancient_trees',
      chance: 20,
      minRarity: 'common',
      maxRarity: 'rare',
      conditions: {
        eventType: ['discovery'],
      },
    },
    {
      knowledgeId: 'goblin_weakness_fire',
      chance: 15,
      minRarity: 'common',
      maxRarity: 'common',
      conditions: {
        eventType: ['discovery', 'treasure'],
      },
    },
    {
      knowledgeId: 'wolf_weakness_trap',
      chance: 15,
      minRarity: 'common',
      maxRarity: 'common',
      conditions: {
        eventType: ['discovery'],
      },
    },
    {
      knowledgeId: 'technique_folding_steel',
      chance: 10,
      minRarity: 'rare',
      maxRarity: 'epic',
      conditions: {
        adventurerLevel: { min: 15 },
        eventType: ['treasure'],
      },
    },
  ],
  cave: [
    {
      knowledgeId: 'cave_underground_lake',
      chance: 25,
      minRarity: 'common',
      maxRarity: 'rare',
      conditions: {
        eventType: ['discovery'],
      },
    },
    {
      knowledgeId: 'cave_crystal_veins',
      chance: 20,
      minRarity: 'common',
      maxRarity: 'rare',
      conditions: {
        eventType: ['discovery'],
      },
    },
    {
      knowledgeId: 'undead_weakness_holy',
      chance: 15,
      minRarity: 'common',
      maxRarity: 'rare',
      conditions: {
        eventType: ['discovery', 'treasure'],
      },
    },
    {
      knowledgeId: 'undead_weakness_fire',
      chance: 15,
      minRarity: 'common',
      maxRarity: 'rare',
      conditions: {
        eventType: ['discovery'],
      },
    },
    {
      knowledgeId: 'material_obsidian_edge',
      chance: 12,
      minRarity: 'rare',
      maxRarity: 'epic',
      conditions: {
        adventurerLevel: { min: 20 },
        eventType: ['treasure'],
      },
    },
  ],
  ruins: [
    {
      knowledgeId: 'ruins_hidden_chamber',
      chance: 25,
      minRarity: 'rare',
      maxRarity: 'epic',
      conditions: {
        eventType: ['discovery'],
      },
    },
    {
      knowledgeId: 'ruins_artifact_fragments',
      chance: 20,
      minRarity: 'rare',
      maxRarity: 'rare',
      conditions: {
        eventType: ['discovery'],
      },
    },
    {
      knowledgeId: 'recipe_cold_iron_sword',
      chance: 15,
      minRarity: 'rare',
      maxRarity: 'epic',
      conditions: {
        adventurerLevel: { min: 20 },
        eventType: ['treasure'],
      },
    },
    {
      knowledgeId: 'technique_quenching_ice',
      chance: 12,
      minRarity: 'rare',
      maxRarity: 'epic',
      conditions: {
        adventurerLevel: { min: 25 },
        eventType: ['treasure'],
      },
    },
  ],
  mountain: [
    {
      knowledgeId: 'mountain_ancient_mine',
      chance: 25,
      minRarity: 'rare',
      maxRarity: 'epic',
      conditions: {
        eventType: ['discovery'],
      },
    },
    {
      knowledgeId: 'technique_dragon_tempering',
      chance: 8,
      minRarity: 'epic',
      maxRarity: 'legendary',
      conditions: {
        adventurerLevel: { min: 40 },
        eventType: ['treasure'],
      },
    },
    {
      knowledgeId: 'dragon_weakness_cold',
      chance: 10,
      minRarity: 'rare',
      maxRarity: 'epic',
      conditions: {
        adventurerLevel: { min: 35 },
        eventType: ['discovery'],
      },
    },
    {
      knowledgeId: 'material_mithril_properties',
      chance: 12,
      minRarity: 'epic',
      maxRarity: 'legendary',
      conditions: {
        adventurerLevel: { min: 35 },
        eventType: ['treasure'],
      },
    },
  ],
  swamp: [
    {
      knowledgeId: 'swamp_mystic_island',
      chance: 25,
      minRarity: 'common',
      maxRarity: 'rare',
      conditions: {
        eventType: ['discovery'],
      },
    },
    {
      knowledgeId: 'goblin_swarm_tactics',
      chance: 15,
      minRarity: 'common',
      maxRarity: 'rare',
      conditions: {
        eventType: ['discovery'],
      },
    },
    {
      knowledgeId: 'goblin_weakness_poison',
      chance: 15,
      minRarity: 'common',
      maxRarity: 'rare',
      conditions: {
        eventType: ['discovery'],
      },
    },
    {
      knowledgeId: 'recipe_obsidian_dagger',
      chance: 12,
      minRarity: 'rare',
      maxRarity: 'rare',
      conditions: {
        adventurerLevel: { min: 15 },
        eventType: ['treasure'],
      },
    },
  ],
  dungeon: [
    {
      knowledgeId: 'dungeon_secret_passage',
      chance: 20,
      minRarity: 'rare',
      maxRarity: 'epic',
      conditions: {
        eventType: ['discovery'],
      },
    },
    {
      knowledgeId: 'undead_avoid_infection',
      chance: 15,
      minRarity: 'rare',
      maxRarity: 'epic',
      conditions: {
        eventType: ['discovery'],
      },
    },
    {
      knowledgeId: 'troll_weakness_fire',
      chance: 12,
      minRarity: 'rare',
      maxRarity: 'epic',
      conditions: {
        adventurerLevel: { min: 25 },
        eventType: ['discovery'],
      },
    },
    {
      knowledgeId: 'recipe_mithril_blade',
      chance: 10,
      minRarity: 'epic',
      maxRarity: 'legendary',
      conditions: {
        adventurerLevel: { min: 35 },
        eventType: ['treasure'],
      },
    },
    {
      knowledgeId: 'technique_runed_forging',
      chance: 8,
      minRarity: 'epic',
      maxRarity: 'legendary',
      conditions: {
        adventurerLevel: { min: 40 },
        eventType: ['treasure'],
      },
    },
  ],
  castle: [
    {
      knowledgeId: 'dragon_scale_weak_points',
      chance: 12,
      minRarity: 'epic',
      maxRarity: 'legendary',
      conditions: {
        adventurerLevel: { min: 40 },
        eventType: ['discovery'],
      },
    },
    {
      knowledgeId: 'material_dragon_scales',
      chance: 8,
      minRarity: 'legendary',
      maxRarity: 'legendary',
      conditions: {
        adventurerLevel: { min: 45 },
        eventType: ['treasure'],
      },
    },
    {
      knowledgeId: 'recipe_dragon_scale_armor',
      chance: 10,
      minRarity: 'legendary',
      maxRarity: 'legendary',
      conditions: {
        adventurerLevel: { min: 45 },
        eventType: ['treasure'],
      },
    },
  ],
  // Остальные локации имеют меньше знаний
  village: [],
  road: [],
  coast: [
    {
      knowledgeId: 'spider_weakness_light',
      chance: 15,
      minRarity: 'common',
      maxRarity: 'rare',
      conditions: {
        eventType: ['discovery'],
        weather: ['fog'],
      },
    },
  ],
  temple: [
    {
      knowledgeId: 'recipe_mithril_blade',
      chance: 10,
      minRarity: 'epic',
      maxRarity: 'legendary',
      conditions: {
        adventurerLevel: { min: 35 },
        eventType: ['treasure'],
      },
    },
  ],
  desert: [
    {
      knowledgeId: 'technique_folding_steel',
      chance: 15,
      minRarity: 'rare',
      maxRarity: 'epic',
      conditions: {
        adventurerLevel: { min: 20 },
        eventType: ['treasure'],
      },
    },
  ],
}

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================

/**
 * Получить все знания для локации
 */
export function getKnowledgeForLocation(location: LocationTag): KnowledgeDropChance[] {
  return KNOWLEDGE_DROP_TABLES[location] || []
}

/**
 * Получить знания по типу
 */
export function getKnowledgeByType(type: KnowledgeType): KnowledgeLoot[] {
  return ALL_KNOWLEDGE[type] || []
}

/**
 * Получить знания по ID
 */
export function getKnowledgeById(id: string): KnowledgeLoot | undefined {
  return KNOWLEDGE_LIST.find(k => k.id === id)
}

/**
 * Получить все знания
 */
export function getAllKnowledge(): KnowledgeLoot[] {
  return KNOWLEDGE_LIST
}

/**
 * Проверить, можно ли получить знание в локации
 */
export function isKnowledgeAvailableInLocation(
  knowledgeId: string,
  location: LocationTag
): boolean {
  const knowledgeDrops = getKnowledgeForLocation(location)
  return knowledgeDrops.some(drop => drop.knowledgeId === knowledgeId)
}

// ================================
// ЭКСПОРТЫ
// ================================

export {
  ENEMY_WEAKNESS_KNOWLEDGE,
  ENEMY_COMBAT_KNOWLEDGE,
  LOCATION_SECRET_PATHS_KNOWLEDGE,
  LOCATION_RESOURCES_KNOWLEDGE,
  CRAFT_RECIPE_KNOWLEDGE,
  CRAFT_TECHNIQUE_KNOWLEDGE,
  CRAFT_MATERIAL_KNOWLEDGE,
}
