import { silver_ore } from './silver_ore'
import { gold_ore } from './gold_ore'
import { mithril_ore } from './mithril_ore'
import { depth_iron } from './depth_iron'
import { bog_iron } from './bog_iron'
import { cold_iron_ore } from './cold_iron_ore'
import { star_metal } from './star_metal'
import { living_ore } from './living_ore'

import type { MaterialNode } from '@/types/materials/material-core'

export { silver_ore, gold_ore, mithril_ore, depth_iron, bog_iron, cold_iron_ore, star_metal, living_ore }

export const gatherableOreNodes: MaterialNode[] = [
  silver_ore,
  gold_ore,
  mithril_ore,
  depth_iron,
  bog_iron,
  cold_iron_ore,
  star_metal,
  living_ore,
]
