/**
 * Коллекция: минералы с тегом gem (кристаллы, осколки)
 */

import type { MaterialNode } from '@/types/materials/material-core'
import { allMaterials } from '../library'

export const gemsCollection: MaterialNode[] = allMaterials.filter(m =>
  m.identity.tags.includes('gem')
)
