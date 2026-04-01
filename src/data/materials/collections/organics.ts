/**
 * Коллекция: органика (травы, смолы, компоненты экспедиций)
 */

import type { MaterialNode } from '@/types/materials/material-core'
import { allMaterials } from '../library'

export const organicsCollection: MaterialNode[] = allMaterials.filter(
  m => m.identity.class === 'organic'
)
