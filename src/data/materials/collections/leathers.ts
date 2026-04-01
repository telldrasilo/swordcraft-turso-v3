/**
 * Коллекция: Кожа
 */

import type { MaterialNode } from '@/types/materials/material-core'
import { allMaterials } from '../library'

export const leathersCollection: MaterialNode[] = allMaterials.filter(
  m => m.identity.class === 'leather'
)
