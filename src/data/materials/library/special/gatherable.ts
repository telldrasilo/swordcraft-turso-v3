import { eternal_ice } from './eternal_ice'
import { primordial_ice } from './primordial_ice'
import { ancient_sap } from './ancient_sap'
import { dragon_bone } from './dragon_bone'
import { heart_of_flame } from './heart_of_flame'
import { soulforge_ember } from './soulforge_ember'
import { heart_of_the_mountain } from './heart_of_the_mountain'

import type { MaterialNode } from '@/types/materials/material-core'

export { eternal_ice, primordial_ice, ancient_sap, dragon_bone, heart_of_flame, soulforge_ember, heart_of_the_mountain }

export const gatherableSpecialResourceNodes: MaterialNode[] = [
  eternal_ice,
  primordial_ice,
  ancient_sap,
  dragon_bone,
  heart_of_flame,
  soulforge_ember,
  heart_of_the_mountain,
]
