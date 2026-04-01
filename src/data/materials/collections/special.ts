/**
 * Коллекция: особые материалы (класс other)
 */

import type { MaterialNode } from '@/types/materials/material-core'
import { allMaterials } from '../library'

export const specialMaterialsCollection: MaterialNode[] = allMaterials.filter(
  m => m.identity.class === 'other'
)
