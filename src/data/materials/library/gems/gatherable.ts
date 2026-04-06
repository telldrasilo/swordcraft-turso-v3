import { moonstone_shards } from './moonstone_shards'
import { echo_stone } from './echo_stone'
import { frozen_crystals } from './frozen_crystals'
import { volcanic_glass } from './volcanic_glass'
import { fire_stone } from './fire_stone'
import { primordial_amber } from './primordial_amber'
import { dragon_glass } from './dragon_glass'
import { void_crystal } from './void_crystal'

import type { MaterialNode } from '@/types/materials/material-core'

export { moonstone_shards, echo_stone, frozen_crystals, volcanic_glass, fire_stone, primordial_amber, dragon_glass, void_crystal }

export const gatherableGemNodes: MaterialNode[] = [
  moonstone_shards,
  echo_stone,
  frozen_crystals,
  volcanic_glass,
  fire_stone,
  primordial_amber,
  dragon_glass,
  void_crystal,
]
