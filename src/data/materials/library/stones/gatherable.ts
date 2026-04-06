import { red_stone } from './red_stone'
import { clay } from './clay'
import { deep_clay } from './deep_clay'
import { sulfur } from './sulfur'
import { depth_stone } from './depth_stone'

import type { MaterialNode } from '@/types/materials/material-core'

export { red_stone, clay, deep_clay, sulfur, depth_stone }

export const gatherableStoneNodes: MaterialNode[] = [
  red_stone,
  clay,
  deep_clay,
  sulfur,
  depth_stone,
]
