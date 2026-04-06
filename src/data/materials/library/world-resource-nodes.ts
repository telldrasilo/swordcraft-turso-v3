import { coal } from './fuels/coal'
import { red_stone } from './stones/red_stone'
import { clay } from './stones/clay'
import { oak_bark } from './organics/oak_bark'
import { acorns } from './organics/acorns'
import { forest_moss } from './organics/forest_moss'
import { wild_herbs } from './organics/wild_herbs'
import { peat } from './fuels/peat'
import { bones } from './organics/bones'
import { swamp_moss } from './organics/swamp_moss'
import { mist_herbs } from './organics/mist_herbs'
import { pine } from './woods/pine'
import { pine_resin } from './organics/pine_resin'
import { silver_bark } from './organics/silver_bark'
import { moonstone_shards } from './gems/moonstone_shards'
import { silvered_pine } from './woods/silvered_pine'
import { silver_ore } from './ores/silver_ore'
import { gold_ore } from './ores/gold_ore'
import { mithril_ore } from './ores/mithril_ore'
import { deep_clay } from './stones/deep_clay'
import { ancient_coal } from './fuels/ancient_coal'
import { echo_stone } from './gems/echo_stone'
import { black_dust } from './organics/black_dust'
import { depth_iron } from './ores/depth_iron'
import { bog_iron } from './ores/bog_iron'
import { rotten_wood } from './woods/rotten_wood'
import { poison_gland } from './organics/poison_gland'
import { decayed_bones } from './organics/decayed_bones'
import { shadow_leather } from './leathers/shadow_leather'
import { toxic_moss } from './organics/toxic_moss'
import { cold_iron_ore } from './ores/cold_iron_ore'
import { eternal_ice } from './special/eternal_ice'
import { frozen_crystals } from './gems/frozen_crystals'
import { cryo_fungi } from './organics/cryo_fungi'
import { primordial_ice } from './special/primordial_ice'
import { volcanic_glass } from './gems/volcanic_glass'
import { ash_dust } from './organics/ash_dust'
import { sulfur } from './stones/sulfur'
import { fire_stone } from './gems/fire_stone'
import { primordial_amber } from './gems/primordial_amber'
import { spirit_wood } from './woods/spirit_wood'
import { whisper_moss } from './organics/whisper_moss'
import { echo_bark } from './organics/echo_bark'
import { memory_leaf } from './organics/memory_leaf'
import { dream_resin } from './organics/dream_resin'
import { ancient_sap } from './special/ancient_sap'
import { dragon_bone } from './special/dragon_bone'
import { dragon_scale } from './leathers/dragon_scale'
import { star_metal } from './ores/star_metal'
import { dragon_glass } from './gems/dragon_glass'
import { heart_of_flame } from './special/heart_of_flame'
import { void_crystal } from './gems/void_crystal'
import { soulforge_ember } from './special/soulforge_ember'
import { depth_stone } from './stones/depth_stone'
import { ancient_metal } from './metals/ancient_metal'
import { living_ore } from './ores/living_ore'
import { heart_of_the_mountain } from './special/heart_of_the_mountain'

import type { MaterialNode } from '@/types/materials/material-core'

/**
 * Каталог добываемых узлов (экспедиции, мир). Порядок — GATHER_MATERIAL_ORDER в scripts/gather-material-config.mjs.
 */
export const worldResourceNodes: MaterialNode[] = [
  coal,
  red_stone,
  clay,
  oak_bark,
  acorns,
  forest_moss,
  wild_herbs,
  peat,
  bones,
  swamp_moss,
  mist_herbs,
  pine,
  pine_resin,
  silver_bark,
  moonstone_shards,
  silvered_pine,
  silver_ore,
  gold_ore,
  mithril_ore,
  deep_clay,
  ancient_coal,
  echo_stone,
  black_dust,
  depth_iron,
  bog_iron,
  rotten_wood,
  poison_gland,
  decayed_bones,
  shadow_leather,
  toxic_moss,
  cold_iron_ore,
  eternal_ice,
  frozen_crystals,
  cryo_fungi,
  primordial_ice,
  volcanic_glass,
  ash_dust,
  sulfur,
  fire_stone,
  primordial_amber,
  spirit_wood,
  whisper_moss,
  echo_bark,
  memory_leaf,
  dream_resin,
  ancient_sap,
  dragon_bone,
  dragon_scale,
  star_metal,
  dragon_glass,
  heart_of_flame,
  void_crystal,
  soulforge_ember,
  depth_stone,
  ancient_metal,
  living_ore,
  heart_of_the_mountain,
]
