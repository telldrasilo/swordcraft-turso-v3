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

// Топливо / самоцветы / органика / особые добываемые (экспедиции)
export * from './fuels'
export * from './gems'
export * from './organics'
export * from './special'

export { buildWorldNode, loreSummary } from './build-world-node'

// Реэкспорт фабрики legacy и алиас expeditionMaterialNodes → worldResourceNodes
export * from './expedition'

export { worldResourceNodes } from './world-resource-nodes'

// Импорт всех материалов для коллекций
import {
  iron,
  ironAlloy,
  copperAlloy,
  tinAlloy,
  goldAlloy,
  bronze,
  steel,
  highCarbonSteel,
  silverAlloy,
  coldIron,
  mithril,
  mithrilAlloy,
} from './metals'
import { fieldstone, flint, granite, obsidian, bloodstone } from './stones'
import { birch, oak, ash, ebony, ironwood } from './woods'
import { rawLeather, tannedLeather, bullLeather, dragonLeather } from './leathers'
import { ironOre, copperOre, tinOre } from './ores'
import { worldResourceNodes } from './world-resource-nodes'
import { inventoryMappedLegacyMaterialNodes } from './bridge/inventory-mapped-legacy-nodes'

// Массивы для быстрого доступа
export const allMetals = [
  iron,
  ironAlloy,
  copperAlloy,
  tinAlloy,
  goldAlloy,
  bronze,
  steel,
  highCarbonSteel,
  silverAlloy,
  coldIron,
  mithril,
  mithrilAlloy,
]
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
  ...inventoryMappedLegacyMaterialNodes,
]

// Карта материалов по ID
export const materialById = Object.fromEntries(
  allMaterials.map(m => [m.identity.id, m])
)

// Экспорт отдельных материалов
export {
  iron,
  ironAlloy,
  copperAlloy,
  tinAlloy,
  goldAlloy,
  bronze,
  steel,
  highCarbonSteel,
  silverAlloy,
  coldIron,
  mithril,
  mithrilAlloy,
} from './metals'
export { fieldstone, flint, granite, obsidian, bloodstone } from './stones'
export { birch, oak, ash, ebony, ironwood } from './woods'
export { rawLeather, tannedLeather, bullLeather, dragonLeather } from './leathers'
export { ironOre, copperOre, tinOre } from './ores'
