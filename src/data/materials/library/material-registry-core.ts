/**
 * Пакет 1.2: «ядро» каталога — металлы, камни, дерево, кожа, базовые руды из library/*.
 * Новые узлы этих доменов подключать в соответствующих модулях; сюда только re-export списков для manifest.
 */

import {
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
import {
  fieldstone,
  flint,
  granite,
  obsidian,
  bloodstone,
  basicStone,
  marble,
  processedStone,
} from './stones'
import {
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
import {
  rawLeather,
  tannedLeather,
  bullLeather,
  dragonLeather,
  hardenedLeather,
} from './leathers'
import { ironOre, copperOre, tinOre } from './ores'
import type { MaterialNode } from '@/types/materials/material-core'

export const allMetals = [
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
]
export const allStones = [
  fieldstone,
  flint,
  granite,
  basicStone,
  marble,
  obsidian,
  bloodstone,
  processedStone,
]
export const allWoods = [
  birch,
  oak,
  ash,
  ebony,
  ironwood,
  maple,
  walnut,
  mahogany,
  processedWood,
]
export const allLeathers = [
  rawLeather,
  tannedLeather,
  bullLeather,
  dragonLeather,
  hardenedLeather,
]
export const allOres = [ironOre, copperOre, tinOre]

/** Сегмент реестра 1.2 без мира / мостов / квестов. */
export const registryCoreMaterialNodes: MaterialNode[] = [
  ...allMetals,
  ...allStones,
  ...allWoods,
  ...allLeathers,
  ...allOres,
]
