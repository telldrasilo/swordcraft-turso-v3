import { pine } from './pine'
import { silvered_pine } from './silvered_pine'
import { rotten_wood } from './rotten_wood'
import { spirit_wood } from './spirit_wood'

import type { MaterialNode } from '@/types/materials/material-core'

export { pine, silvered_pine, rotten_wood, spirit_wood }

export const gatherableWoodNodes: MaterialNode[] = [
  pine,
  silvered_pine,
  rotten_wood,
  spirit_wood,
]
