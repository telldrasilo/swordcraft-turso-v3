/**
 * Коллекции материалов
 * Групповой экспорт по категориям
 */

export * from './metals'
export * from './ores'
export * from './stones'
export * from './woods'
export * from './leathers'

// Импорт всех коллекций
import { metalsCollection } from './metals'
import { oresCollection } from './ores'
import { stonesCollection } from './stones'
import { woodsCollection } from './woods'
import { leathersCollection } from './leathers'

// Все коллекции
export const allCollections = {
  metals: metalsCollection,
  ores: oresCollection,
  stones: stonesCollection,
  woods: woodsCollection,
  leathers: leathersCollection,
}
