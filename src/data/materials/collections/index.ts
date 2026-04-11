/**
 * Коллекции материалов
 * Групповой экспорт по категориям
 */

/** Roadmap **5.2:** полный список legacy-металлов с числами каталога — предпочитать этим импортам прямое чтение `metalMaterials`. */
export { getMetalMaterialRuntimeMerged, getMetalMaterialsRuntimeMerged } from '../metals-runtime-merge'

export * from './metals'
export * from './ores'
export * from './stones'
export * from './woods'
export * from './leathers'
export * from './organics'
export * from './gems'
export * from './special'

// Импорт всех коллекций
import { metalsCollection } from './metals'
import { oresCollection } from './ores'
import { stonesCollection } from './stones'
import { woodsCollection } from './woods'
import { leathersCollection } from './leathers'
import { organicsCollection } from './organics'
import { gemsCollection } from './gems'
import { specialMaterialsCollection } from './special'

// Все коллекции
export const allCollections = {
  metals: metalsCollection,
  ores: oresCollection,
  stones: stonesCollection,
  woods: woodsCollection,
  leathers: leathersCollection,
  organics: organicsCollection,
  gems: gemsCollection,
  special: specialMaterialsCollection,
}
