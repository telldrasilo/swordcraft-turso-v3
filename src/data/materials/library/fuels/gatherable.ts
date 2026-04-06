import { coal } from './coal'
import { peat } from './peat'
import { ancient_coal } from './ancient_coal'

import type { MaterialNode } from '@/types/materials/material-core'

export { coal, peat, ancient_coal }

export const gatherableFuelNodes: MaterialNode[] = [
  coal,
  peat,
  ancient_coal,
]
