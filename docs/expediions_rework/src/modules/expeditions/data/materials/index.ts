/**
 * Реестр материалов
 * Включает базовые материалы из проекта и новые материалы для локаций
 */

import type { Material, MaterialCategory, Rarity } from '../../types';

// ============================================================================
// Базовые материалы (из существующего проекта)
// ============================================================================

const BASE_MATERIALS: Material[] = [
  // Руда
  { id: 'iron_ore', name: 'Железная руда', description: 'Основной металл для кузни', category: 'ore', rarity: 'common' },
  { id: 'copper_ore', name: 'Медная руда', description: 'Мягкий металл для сплавов', category: 'ore', rarity: 'common' },
  { id: 'tin_ore', name: 'Оловянная руда', description: 'Для бронзы и припоев', category: 'ore', rarity: 'common' },
  { id: 'silver_ore', name: 'Серебряная руда', description: 'Благородный металл', category: 'ore', rarity: 'uncommon' },
  { id: 'gold_ore', name: 'Золотая руда', description: 'Редкий благородный металл', category: 'ore', rarity: 'uncommon' },
  { id: 'mithril_ore', name: 'Мифриловая руда', description: 'Легчайший и прочнейший металл', category: 'ore', rarity: 'rare' },

  // Слитки
  { id: 'iron_ingot', name: 'Железный слиток', description: 'Очищенное железо', category: 'ingot', rarity: 'common' },
  { id: 'copper_ingot', name: 'Медный слиток', description: 'Чистая медь', category: 'ingot', rarity: 'common' },
  { id: 'tin_ingot', name: 'Оловянный слиток', description: 'Чистое олово', category: 'ingot', rarity: 'common' },
  { id: 'bronze_ingot', name: 'Бронзовый слиток', description: 'Сплав меди и олова', category: 'ingot', rarity: 'common' },
  { id: 'steel_ingot', name: 'Стальной слиток', description: 'Железо с углеродом', category: 'ingot', rarity: 'uncommon' },
  { id: 'silver_ingot', name: 'Серебряный слиток', description: 'Чистое серебро', category: 'ingot', rarity: 'uncommon' },
  { id: 'gold_ingot', name: 'Золотой слиток', description: 'Чистое золото', category: 'ingot', rarity: 'uncommon' },
  { id: 'mithril_ingot', name: 'Мифриловый слиток', description: 'Очищенный мифрил', category: 'ingot', rarity: 'rare' },

  // Дерево
  { id: 'oak_wood', name: 'Дубовая древесина', description: 'Крепкое дерево для рукоятей', category: 'wood', rarity: 'common' },
  { id: 'birch_wood', name: 'Берёзовая древесина', description: 'Гибкое дерево', category: 'wood', rarity: 'common' },
  { id: 'pine_wood', name: 'Сосновая древесина', description: 'Смолистое лёгкое дерево', category: 'wood', rarity: 'common' },
  { id: 'planks', name: 'Доски', description: 'Обработанная древесина', category: 'wood', rarity: 'common' },

  // Камень
  { id: 'stone', name: 'Камень', description: 'Строительный материал', category: 'stone', rarity: 'common' },
  { id: 'stone_blocks', name: 'Каменные блоки', description: 'Обработанный камень', category: 'stone', rarity: 'common' },
  { id: 'flint', name: 'Кремень', description: 'Для огнива и оружия', category: 'stone', rarity: 'common' },
  { id: 'coal', name: 'Уголь', description: 'Топливо для кузни', category: 'stone', rarity: 'common' },

  // Кожа
  { id: 'raw_leather', name: 'Сырая кожа', description: 'Необработанная кожа', category: 'leather', rarity: 'common' },
  { id: 'leather', name: 'Кожа', description: 'Обработанная кожа', category: 'leather', rarity: 'common' },
  { id: 'tanned_leather', name: 'Дублёная кожа', description: 'Прочная кожа', category: 'leather', rarity: 'uncommon' },
];

// ============================================================================
// Новые материалы для локаций
// ============================================================================

const NEW_MATERIALS: Material[] = [
  // --- Tier 1: Окраины Дубовой Рощи ---
  { id: 'oak_bark', name: 'Кора дуба', description: 'Для дубления кожи и красителей', category: 'component', rarity: 'common', sourceLocations: ['oak_grove_outskirts'] },
  { id: 'acorns', name: 'Желуди', description: 'Для корма и крафта', category: 'herb', rarity: 'common', sourceLocations: ['oak_grove_outskirts'] },
  { id: 'forest_moss', name: 'Лесной мох', description: 'Для набивки и медицины', category: 'herb', rarity: 'common', sourceLocations: ['oak_grove_outskirts', 'misty_lowlands'] },
  { id: 'wild_herbs', name: 'Дикие травы', description: 'Целебные и ароматические', category: 'herb', rarity: 'uncommon', sourceLocations: ['oak_grove_outskirts'] },

  // --- Tier 1: Рудники Красного Камня ---
  { id: 'red_stone', name: 'Красный камень', description: 'Декоративный камень', category: 'stone', rarity: 'common', sourceLocations: ['red_stone_mines'] },
  { id: 'clay', name: 'Глина', description: 'Для керамики', category: 'stone', rarity: 'common', sourceLocations: ['red_stone_mines', 'misty_lowlands'] },
  { id: 'copper_nuggets', name: 'Медные самородки', description: 'Чистая медь без переплавки', category: 'ore', rarity: 'uncommon', sourceLocations: ['red_stone_mines'] },

  // --- Tier 1: Туманные Низины ---
  { id: 'peat', name: 'Торф', description: 'Горючий материал', category: 'component', rarity: 'common', sourceLocations: ['misty_lowlands'] },
  { id: 'bones', name: 'Кости животных', description: 'Для костяных изделий', category: 'component', rarity: 'common', sourceLocations: ['misty_lowlands'] },
  { id: 'swamp_moss', name: 'Болотный мох', description: 'Для перевязок', category: 'herb', rarity: 'common', sourceLocations: ['misty_lowlands'] },
  { id: 'mist_herbs', name: 'Туманные травы', description: 'Растут только в тумане', category: 'herb', rarity: 'uncommon', sourceLocations: ['misty_lowlands'] },

  // --- Tier 2: Серебряный Бор ---
  { id: 'pine_resin', name: 'Сосновая смола', description: 'Для пропитки и клеящих смесей', category: 'component', rarity: 'common', sourceLocations: ['silver_grove'] },
  { id: 'silver_bark', name: 'Серебряная кора', description: 'Кора деревьев над жилами', category: 'component', rarity: 'uncommon', sourceLocations: ['silver_grove'] },
  { id: 'moonstone_shards', name: 'Осколки лунного камня', description: 'Светящиеся камни', category: 'gem', rarity: 'uncommon', sourceLocations: ['silver_grove'] },
  { id: 'silvered_pine', name: 'Серебристая сосна', description: 'Дерево, впитавшее серебро', category: 'wood', rarity: 'rare', sourceLocations: ['silver_grove'] },

  // --- Tier 2: Забытые Шахты ---
  { id: 'deep_clay', name: 'Глубинная глина', description: 'Особая плотность', category: 'stone', rarity: 'common', sourceLocations: ['forgotten_mines'] },
  { id: 'ancient_coal', name: 'Древний уголь', description: 'Горит дольше и жарче', category: 'stone', rarity: 'uncommon', sourceLocations: ['forgotten_mines'] },
  { id: 'echo_stone', name: 'Эхо-камень', description: 'Отражает звуки необычным образом', category: 'stone', rarity: 'uncommon', sourceLocations: ['forgotten_mines'] },
  { id: 'black_dust', name: 'Чёрная пыль', description: 'Алхимический ингредиент', category: 'component', rarity: 'uncommon', sourceLocations: ['forgotten_mines'] },
  { id: 'depth_iron', name: 'Глубинное железо', description: 'Железо из глубоких уровней', category: 'ore', rarity: 'rare', sourceLocations: ['forgotten_mines'] },

  // --- Tier 2: Гнилое Болото ---
  { id: 'bog_iron', name: 'Болотное железо', description: 'Железо, пропитанное токсинами', category: 'ore', rarity: 'uncommon', sourceLocations: ['rotten_swamp'] },
  { id: 'rotten_wood', name: 'Гнилое дерево', description: 'Испорченная древесина', category: 'wood', rarity: 'common', sourceLocations: ['rotten_swamp'] },
  { id: 'poison_gland', name: 'Ядовитая железа', description: 'От местных существ', category: 'component', rarity: 'uncommon', sourceLocations: ['rotten_swamp'] },
  { id: 'decayed_bones', name: 'Гнилые кости', description: 'Для некоторых рецептов', category: 'component', rarity: 'common', sourceLocations: ['rotten_swamp'] },
  { id: 'shadow_leather', name: 'Теневая кожа', description: 'Кожа существ из тьмы', category: 'leather', rarity: 'rare', sourceLocations: ['rotten_swamp'] },
  { id: 'toxic_moss', name: 'Токсичный мох', description: 'Источник ядов', category: 'herb', rarity: 'uncommon', sourceLocations: ['rotten_swamp'] },

  // --- Tier 3: Кряж Морозного Железа ---
  { id: 'cold_iron_ore', name: 'Морозная руда', description: 'Руда с естественным холодом', category: 'ore', rarity: 'uncommon', sourceLocations: ['frost_iron_ridge'] },
  { id: 'frost_iron', name: 'Морозное железо', description: 'Кованый металл вечного холода', category: 'ingot', rarity: 'rare', sourceLocations: ['frost_iron_ridge'] },
  { id: 'eternal_ice', name: 'Вечный лёд', description: 'Лёд, который не тает', category: 'special', rarity: 'uncommon', sourceLocations: ['frost_iron_ridge'] },
  { id: 'frozen_crystals', name: 'Ледяные кристаллы', description: 'Для магических изделий', category: 'gem', rarity: 'rare', sourceLocations: ['frost_iron_ridge'] },
  { id: 'cryo_fungi', name: 'Крио-грибы', description: 'Растут в тепле от холода', category: 'herb', rarity: 'uncommon', sourceLocations: ['frost_iron_ridge'] },
  { id: 'primordial_ice', name: 'Первозданный лёд', description: 'Лёд возрастом миллионы лет', category: 'special', rarity: 'epic', sourceLocations: ['frost_iron_ridge'] },

  // --- Tier 3: Пепельные Пустоши ---
  { id: 'volcanic_glass', name: 'Вулканическое стекло', description: 'Острее любой стали', category: 'gem', rarity: 'rare', sourceLocations: ['ash_wastes'] },
  { id: 'ash_dust', name: 'Пепельная пыль', description: 'Для укрепляющих смесей', category: 'component', rarity: 'uncommon', sourceLocations: ['ash_wastes'] },
  { id: 'obsidian_shard', name: 'Осколок обсидиана', description: 'Для режущих инструментов', category: 'gem', rarity: 'uncommon', sourceLocations: ['ash_wastes'] },
  { id: 'sulfur', name: 'Сера', description: 'Для пороха и алхимии', category: 'component', rarity: 'common', sourceLocations: ['ash_wastes'] },
  { id: 'fire_stone', name: 'Огненный камень', description: 'Сохраняет тепло недели', category: 'stone', rarity: 'rare', sourceLocations: ['ash_wastes'] },
  { id: 'primordial_amber', name: 'Первозданный янтарь', description: 'Древний янтарь из-под пепла', category: 'gem', rarity: 'epic', sourceLocations: ['ash_wastes'] },

  // --- Tier 3: Шепчущий Лес ---
  { id: 'spirit_wood', name: 'Древесина духов', description: 'Поглощает магию', category: 'wood', rarity: 'rare', sourceLocations: ['whispering_forest'] },
  { id: 'whisper_moss', name: 'Шепчущий мох', description: 'Для магических чернил', category: 'herb', rarity: 'uncommon', sourceLocations: ['whispering_forest'] },
  { id: 'echo_bark', name: 'Эхо-кора', description: 'Отражает звуки', category: 'component', rarity: 'uncommon', sourceLocations: ['whispering_forest'] },
  { id: 'memory_leaf', name: 'Лист памяти', description: 'Сохраняет воспоминания', category: 'herb', rarity: 'rare', sourceLocations: ['whispering_forest'] },
  { id: 'dream_resin', name: 'Смола снов', description: 'Для зелий сна', category: 'component', rarity: 'uncommon', sourceLocations: ['whispering_forest'] },
  { id: 'ancient_sap', name: 'Древний сок', description: 'Сок Первого Древа', category: 'special', rarity: 'epic', sourceLocations: ['whispering_forest'] },

  // --- Tier 4: Драконьи Шрамы ---
  { id: 'dragon_bone', name: 'Драконья кость', description: 'Легче стали, твёрже мифрила', category: 'component', rarity: 'rare', sourceLocations: ['dragon_scars'] },
  { id: 'dragon_scale', name: 'Драконья чешуя', description: 'Несгораемая броня', category: 'component', rarity: 'rare', sourceLocations: ['dragon_scars'] },
  { id: 'blood_stone', name: 'Кровавый камень', description: 'Алхимический катализатор', category: 'gem', rarity: 'uncommon', sourceLocations: ['dragon_scars'] },
  { id: 'star_metal', name: 'Звёздный металл', description: 'Упавший с неба в битве', category: 'ore', rarity: 'epic', sourceLocations: ['dragon_scars'] },
  { id: 'dragon_glass', name: 'Драконье стекло', description: 'Создано дыханием дракона', category: 'gem', rarity: 'epic', sourceLocations: ['dragon_scars'] },
  { id: 'heart_of_flame', name: 'Сердце пламени', description: 'Кристаллизованное дыхание', category: 'special', rarity: 'epic', sourceLocations: ['dragon_scars'] },

  // --- Tier 4: Глубины Подземелий ---
  { id: 'void_crystal', name: 'Кристалл пустоты', description: 'Вбирает в себя всё', category: 'gem', rarity: 'epic', sourceLocations: ['depths_of_the_world'] },
  { id: 'soulforge_ember', name: 'Уголь душеплавильни', description: 'Горит вечным огнём', category: 'special', rarity: 'epic', sourceLocations: ['depths_of_the_world'] },
  { id: 'depth_stone', name: 'Камень глубины', description: 'Твёрже обычного камня', category: 'stone', rarity: 'uncommon', sourceLocations: ['depths_of_the_world'] },
  { id: 'ancient_metal', name: 'Древний металл', description: 'Сплав неизвестной эпохи', category: 'ingot', rarity: 'rare', sourceLocations: ['depths_of_the_world'] },
  { id: 'living_ore', name: 'Живая руда', description: 'Руда, которая растёт', category: 'ore', rarity: 'rare', sourceLocations: ['depths_of_the_world'] },
  { id: 'heart_of_the_mountain', name: 'Сердце горы', description: 'Источник всех металлов', category: 'special', rarity: 'legendary', sourceLocations: ['depths_of_the_world'] },
];

// ============================================================================
// Полный реестр материалов
// ============================================================================

export const MATERIAL_REGISTRY: Material[] = [...BASE_MATERIALS, ...NEW_MATERIALS];

// ============================================================================
// Утилиты для работы с материалами
// ============================================================================

/**
 * Получить материал по ID
 */
export function getMaterialById(id: string): Material | undefined {
  return MATERIAL_REGISTRY.find((mat) => mat.id === id);
}

/**
 * Получить материалы по редкости
 */
export function getMaterialsByRarity(rarity: Rarity): Material[] {
  return MATERIAL_REGISTRY.filter((mat) => mat.rarity === rarity);
}

/**
 * Получить материалы по категории
 */
export function getMaterialsByCategory(category: MaterialCategory): Material[] {
  return MATERIAL_REGISTRY.filter((mat) => mat.category === category);
}

/**
 * Получить материалы для локации
 */
export function getMaterialsForLocation(locationId: string): Material[] {
  return MATERIAL_REGISTRY.filter(
    (mat) => mat.sourceLocations?.includes(locationId)
  );
}

/**
 * Получить названия материалов для UI
 */
export function getMaterialName(materialId: string): string {
  return getMaterialById(materialId)?.name ?? materialId;
}
