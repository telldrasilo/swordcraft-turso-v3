/**
 * Коллекция: Дерево
 * Групповой экспорт для столярного дела
 */

import type { MaterialNode } from '@/types/materials/material-core'
import { allMaterials } from '../library'

export const woodsCollection: MaterialNode[] = allMaterials.filter(
  m => m.identity.class === 'wood'
)

// Мягкие породы
export const softWoods = woodsCollection.filter(m =>
  m.physical.hardness < 35
)

// Твёрдые породы
export const hardWoods = woodsCollection.filter(m =>
  m.physical.hardness >= 35
)

// Магические породы
export const magicalWoods = woodsCollection.filter(m =>
  m.arcane.conductivity >= 30
)
