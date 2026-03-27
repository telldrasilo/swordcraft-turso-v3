/**
 * Типы тэгов для системы экспедиций
 * Используются для категоризации экспедиций и подбора релевантных событий
 */

// ================================
// ЛОКАЦИИ
// ================================

export type LocationTag =
  | 'forest'      // Лес, роща, чаща
  | 'cave'        // Пещера, подземелье
  | 'ruins'       // Руины, развалины
  | 'desert'      // Пустыня, пески
  | 'mountain'    // Гора, перевал
  | 'swamp'       // Болото, трясина
  | 'village'     // Деревня, поселение
  | 'road'        // Дорога, тропа
  | 'dungeon'     // Подземелье, темница
  | 'tavern'      // Таверна, постоялый двор
  | 'castle'      // Замок, крепость
  | 'temple'      // Храм, святилище
  | 'coast'       // Побережье, берег

// ================================
// ВРАГИ
// ================================

export type EnemyTag =
  | 'goblins'     // Гоблины, орки
  | 'wolves'      // Волки, дикие звери
  | 'undead'      // Нежить, призраки
  | 'bandits'     // Разбойники, грабители
  | 'demons'      // Демоны, бесы
  | 'beasts'      // Чудовища, звери
  | 'rats'        // Крысы, грызуны
  | 'trolls'      // Тролли, великаны
  | 'dragons'     // Драконы, виверны
  | 'cultists'    // Культисты, темные жрецы
  | 'spiders'     // Пауки, насекомые
  | 'skeletons'   // Скелеты, мумии

// ================================
// ПОГОДА И ВРЕМЯ
// ================================

export type WeatherTag =
  | 'clear'       // Ясно, солнечно
  | 'rain'        // Дождь, ливень
  | 'storm'       // Гроза, буря
  | 'fog'         // Туман, мгла
  | 'night'       // Ночь, темнота
  | 'snow'        // Снег, метель
  | 'heat'        // Жара, зной
  | 'wind'        // Ветер, шквал

// ================================
// ОСОБЫЕ МЕХАНИКИ
// ================================

export type SpecialTag =
  | 'boss'        // Босс, мини-босс
  | 'treasure'    // Сокровища, клад
  | 'trap'        // Ловушки, западни
  | 'puzzle'      // Головоломки, загадки
  | 'escort'      // Сопровождение, защита
  | 'ambush'      // Засада, внезапная атака
  | 'rescue'      // Спасение, освобождение
  | 'siege'       // Осада, штурм
  | 'investigation' // Расследование, поиск улик
  | 'ritual'      // Ритуал, обряд
  | 'negotiation' // Переговоры, торг

// ================================
// ТЕМЫ
// ================================

export type ThemeTag =
  | 'wilderness'      // Дикая природа
  | 'urban'           // Городская среда
  | 'underground'     // Подземелья
  | 'combat_heavy'    // Много боев
  | 'stealth'         // Скрытность, обход
  | 'social'          // Общение, дипломатия
  | 'exploration'     // Исследование
  | 'horror'          // Ужас, мрак
  | 'mystery'         // Тайна, загадка
  | 'adventure'       // Приключение
  | 'survival'        // Выживание

// ================================
// КОМБИНИРОВАННЫЕ ТЭГИ
// ================================

export interface ExpeditionTags {
  /** Локации, где происходит экспедиция (1-3) */
  locations: LocationTag[]

  /** Враги, с которыми столкнётся искатель (1-3) */
  enemies: EnemyTag[]

  /** Погодные условия (0-2, опционально) */
  weather?: WeatherTag[]

  /** Особые механики (0-3, опционально) */
  special?: SpecialTag[]

  /** Общие темы экспедиции (1-3) */
  themes: ThemeTag[]
}

// ================================
// ТИПЫ ТЭГОВ ДЛЯ СОБЫТИЙ
// ================================

/** Все возможные тэги в одном типе */
export type AnyTag = LocationTag | EnemyTag | WeatherTag | SpecialTag | ThemeTag

/** Тип тэга для проверки условий */
export type TagCategory = 'location' | 'enemy' | 'weather' | 'special' | 'theme'

/** Соответствие категории тэгов */
export const TAG_CATEGORIES: Record<TagCategory, string[]> = {
  location: ['forest', 'cave', 'ruins', 'desert', 'mountain', 'swamp', 'village', 'road', 'dungeon', 'tavern', 'castle', 'temple', 'coast'],
  enemy: ['goblins', 'wolves', 'undead', 'bandits', 'demons', 'beasts', 'rats', 'trolls', 'dragons', 'cultists', 'spiders', 'skeletons'],
  weather: ['clear', 'rain', 'storm', 'fog', 'night', 'snow', 'heat', 'wind'],
  special: ['boss', 'treasure', 'trap', 'puzzle', 'escort', 'ambush', 'rescue', 'siege', 'investigation', 'ritual', 'negotiation'],
  theme: ['wilderness', 'urban', 'underground', 'combat_heavy', 'stealth', 'social', 'exploration', 'horror', 'mystery', 'adventure', 'survival'],
}

/**
 * Проверяет, принадлежит ли тэг к указанной категории
 */
export function getTagCategory(tag: AnyTag): TagCategory | null {
  for (const [category, tags] of Object.entries(TAG_CATEGORIES)) {
    if (tags.includes(tag)) {
      return category as TagCategory
    }
  }
  return null
}

/**
 * Проверяет пересечение тэгов экспедиции с требованиями события
 */
export function hasMatchingTags(
  expeditionTags: ExpeditionTags,
  requiredTags: Partial<ExpeditionTags>
): boolean {
  // Проверка локаций
  if (requiredTags.locations && requiredTags.locations.length > 0) {
    const hasLocation = requiredTags.locations.some(loc =>
      expeditionTags.locations.includes(loc)
    )
    if (!hasLocation) return false
  }

  // Проверка врагов
  if (requiredTags.enemies && requiredTags.enemies.length > 0) {
    const hasEnemy = requiredTags.enemies.some(enemy =>
      expeditionTags.enemies.includes(enemy)
    )
    if (!hasEnemy) return false
  }

  // Проверка погоды
  if (requiredTags.weather && requiredTags.weather.length > 0) {
    if (!expeditionTags.weather) return false
    const hasWeather = requiredTags.weather.some(w =>
      expeditionTags.weather!.includes(w)
    )
    if (!hasWeather) return false
  }

  // Проверка особых тэгов
  if (requiredTags.special && requiredTags.special.length > 0) {
    if (!expeditionTags.special) return false
    const hasSpecial = requiredTags.special.some(s =>
      expeditionTags.special!.includes(s)
    )
    if (!hasSpecial) return false
  }

  // Проверка тем
  if (requiredTags.themes && requiredTags.themes.length > 0) {
    const hasTheme = requiredTags.themes.some(theme =>
      expeditionTags.themes.includes(theme)
    )
    if (!hasTheme) return false
  }

  return true
}
