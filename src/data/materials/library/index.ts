/**
 * Библиотека материалов
 * Центральный экспорт всех материалов
 */

// Металлы
export * from './metals'

// Камни
export * from './stones'

// Дерево
export * from './woods'

// Кожа
export * from './leathers'

// Руды
export * from './ores'

// Ресурсы мира (добыча в т.ч. через экспедиции) — единый каталог MaterialNode
export * from './world-resources'
// Реэкспорт фабрики legacy и алиас expeditionMaterialNodes → worldResourceNodes
export * from './expedition'

// Импорт всех материалов для коллекций
import { iron, steel, highCarbonSteel, silverAlloy, coldIron, mithril } from './metals'
import { fieldstone, flint, granite, obsidian, bloodstone } from './stones'
import { birch, oak, ash, ebony, ironwood } from './woods'
import { rawLeather, tannedLeather, bullLeather, dragonLeather } from './leathers'
import { ironOre, copperOre, tinOre } from './ores'
import { worldResourceNodes } from './world-resources'

// Массивы для быстрого доступа
export const allMetals = [iron, steel, highCarbonSteel, silverAlloy, coldIron, mithril]
export const allStones = [fieldstone, flint, granite, obsidian, bloodstone]
export const allWoods = [birch, oak, ash, ebony, ironwood]
export const allLeathers = [rawLeather, tannedLeather, bullLeather, dragonLeather]
export const allOres = [ironOre, copperOre, tinOre]

// Все материалы
export const allMaterials = [
  ...allMetals,
  ...allStones,
  ...allWoods,
  ...allLeathers,
  ...allOres,
  ...worldResourceNodes,
]

// Карта материалов по ID
export const materialById = Object.fromEntries(
  allMaterials.map(m => [m.identity.id, m])
)

// Экспорт отдельных материалов
export { iron, steel, highCarbonSteel, silverAlloy, coldIron, mithril } from './metals'
export { fieldstone, flint, granite, obsidian, bloodstone } from './stones'
export { birch, oak, ash, ebony, ironwood } from './woods'
export { rawLeather, tannedLeather, bullLeather, dragonLeather } from './leathers'
export { ironOre, copperOre, tinOre } from './ores'
