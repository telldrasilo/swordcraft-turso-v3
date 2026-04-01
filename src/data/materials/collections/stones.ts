/**
 * Коллекция: Камни (минералы без тегов ore/gem)
 */

import type { MaterialNode } from '@/types/materials/material-core'
import { allMaterials } from '../library'

export const stonesCollection: MaterialNode[] = allMaterials.filter(
  m =>
    m.identity.class === 'mineral' &&
    !m.identity.tags.includes('ore') &&
    !m.identity.tags.includes('gem')
)
