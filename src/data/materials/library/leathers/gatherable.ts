import { shadow_leather } from './shadow_leather'
import { dragon_scale } from './dragon_scale'

import type { MaterialNode } from '@/types/materials/material-core'

export { shadow_leather, dragon_scale }

export const gatherableLeatherNodes: MaterialNode[] = [
  shadow_leather,
  dragon_scale,
]
