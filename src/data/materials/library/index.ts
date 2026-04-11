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
export * from './quest'

export { buildWorldNode, loreSummary } from './build-world-node'

// Реэкспорт фабрики legacy и алиас expeditionMaterialNodes → worldResourceNodes
export * from './expedition'

export { worldResourceNodes } from './world-resource-nodes'

export {
  allMaterials,
  allLeathers,
  allMetals,
  allOres,
  allStones,
  allWoods,
  materialById,
} from './material-registry-manifest'

// Экспорт отдельных материалов
export {
  iron,
  copper,
  tin,
  silver,
  gold,
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
export {
  fieldstone,
  flint,
  granite,
  obsidian,
  bloodstone,
  basicStone,
  marble,
  processedStone,
} from './stones'
export {
  birch,
  oak,
  ash,
  ebony,
  ironwood,
  maple,
  walnut,
  mahogany,
  processedWood,
} from './woods'
export {
  rawLeather,
  tannedLeather,
  bullLeather,
  dragonLeather,
  hardenedLeather,
} from './leathers'
export { ironOre, copperOre, tinOre } from './ores'
