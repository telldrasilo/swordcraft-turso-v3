/**
 * Компактное создание MaterialNode для экспедиционных материалов.
 * Ручные эталоны по классам — в library/metals, ores, woods и т.д.; здесь — единый профиль по «роли».
 */

import type {
  MaterialArcane,
  MaterialChemical,
  MaterialDiscovery,
  MaterialEconomy,
  MaterialIdentity,
  MaterialNode,
  MaterialPhysical,
  MaterialProcessing,
  MaterialSummary,
} from '@/types/materials/material-core'
import { WORLD_ROLE_ICON_EMOJI } from '@/lib/ui/resource-emoji'

type Role =
  | 'ore'
  | 'stone'
  | 'wood'
  | 'organic'
  | 'metal'
  | 'leather'
  | 'gem'
  | 'special'
  | 'fuel'

export interface ExpeditionNodeSpec {
  id: string
  name: string
  role: Role
  /** Дополнительные теги (кроме базовых для role) */
  tags?: string[]
  economy: MaterialEconomy
  summary: MaterialSummary
  description: string
  icon?: string
  origin?: MaterialIdentity['origin']
}

const PHY_ORE: MaterialPhysical = {
  density: 5.0,
  hardness: 48,
  toughness: 38,
  elasticity: 14,
  meltingPoint: 1200,
  ignitionPoint: null,
  thermalConductivity: 22,
  porosity: 32,
  compressiveStrength: 52,
  tensileStrength: 28,
}

const PHY_STONE: MaterialPhysical = {
  density: 4.2,
  hardness: 55,
  toughness: 28,
  elasticity: 12,
  meltingPoint: null,
  ignitionPoint: null,
  thermalConductivity: 18,
  porosity: 22,
  compressiveStrength: 62,
  tensileStrength: 22,
}

const PHY_WOOD: MaterialPhysical = {
  density: 3.2,
  hardness: 38,
  toughness: 42,
  elasticity: 48,
  meltingPoint: null,
  ignitionPoint: 260,
  thermalConductivity: 14,
  porosity: 38,
  compressiveStrength: 48,
  tensileStrength: 52,
}

const PHY_ORGANIC: MaterialPhysical = {
  density: 1.8,
  hardness: 12,
  toughness: 25,
  elasticity: 35,
  meltingPoint: null,
  ignitionPoint: 180,
  thermalConductivity: 10,
  porosity: 55,
  compressiveStrength: 15,
  tensileStrength: 28,
}

const PHY_METAL: MaterialPhysical = {
  density: 7.2,
  hardness: 62,
  toughness: 45,
  elasticity: 35,
  meltingPoint: 1400,
  ignitionPoint: null,
  thermalConductivity: 55,
  porosity: 3,
  compressiveStrength: 72,
  tensileStrength: 68,
}

const PHY_LEATHER: MaterialPhysical = {
  density: 2.1,
  hardness: 18,
  toughness: 55,
  elasticity: 58,
  meltingPoint: null,
  ignitionPoint: 220,
  thermalConductivity: 8,
  porosity: 42,
  compressiveStrength: 25,
  tensileStrength: 48,
}

const PHY_GEM: MaterialPhysical = {
  density: 3.8,
  hardness: 78,
  toughness: 22,
  elasticity: 18,
  meltingPoint: null,
  ignitionPoint: null,
  thermalConductivity: 35,
  porosity: 5,
  compressiveStrength: 85,
  tensileStrength: 35,
}

const PHY_FUEL: MaterialPhysical = {
  density: 3.4,
  hardness: 28,
  toughness: 22,
  elasticity: 12,
  meltingPoint: null,
  ignitionPoint: 320,
  thermalConductivity: 14,
  porosity: 38,
  compressiveStrength: 38,
  tensileStrength: 18,
}

const CHEM_DEFAULT: MaterialChemical = {
  reactivity: 35,
  stability: 52,
  corrosionResistance: 35,
  oxidationResistance: 40,
  acidity: 8,
  solubility: 12,
}

const ARCANE_LOW: MaterialArcane = {
  conductivity: 15,
  affinity: 18,
  stability: 55,
  resonance: 20,
}

const ARCANE_HIGH: MaterialArcane = {
  conductivity: 35,
  affinity: 48,
  stability: 42,
  resonance: 55,
}

const PROC_ORE: MaterialProcessing = {
  workability: 32,
  refineDifficulty: 52,
  purityPotential: 42,
  defectRisk: 28,
  repairability: 100,
}

const PROC_STONE: MaterialProcessing = {
  workability: 38,
  refineDifficulty: 45,
  purityPotential: 35,
  defectRisk: 22,
  repairability: 100,
}

const PROC_WOOD: MaterialProcessing = {
  workability: 62,
  refineDifficulty: 38,
  purityPotential: 38,
  defectRisk: 6,
  repairability: 100,
}

const PROC_ORGANIC: MaterialProcessing = {
  workability: 55,
  refineDifficulty: 30,
  purityPotential: 28,
  defectRisk: 18,
  repairability: 80,
}

const PROC_METAL: MaterialProcessing = {
  workability: 48,
  refineDifficulty: 55,
  purityPotential: 58,
  defectRisk: 22,
  repairability: 92,
}

const DISCOVERY_DEFAULT: MaterialDiscovery = {
  unlockedBy: [
    { type: 'harvest', requiredExpertise: 5 },
    { type: 'craft', requiredExpertise: 10 },
  ],
}

function roleToClass(role: Role): MaterialIdentity['class'] {
  switch (role) {
    case 'ore':
    case 'stone':
    case 'gem':
      return 'mineral'
    case 'wood':
      return 'wood'
    case 'organic':
      return 'organic'
    case 'metal':
      return 'metal'
    case 'leather':
      return 'leather'
    case 'fuel':
    case 'special':
      return 'other'
    default:
      return 'other'
  }
}

function baseTags(role: Role): string[] {
  switch (role) {
    case 'ore':
      return ['natural', 'mineral', 'ore', 'expedition']
    case 'stone':
      return ['natural', 'mineral', 'stone', 'expedition']
    case 'gem':
      return ['natural', 'mineral', 'gem', 'expedition']
    case 'wood':
      return ['natural', 'wood', 'expedition']
    case 'organic':
      return ['natural', 'organic', 'herb', 'expedition']
    case 'metal':
      return ['natural', 'metal', 'expedition']
    case 'leather':
      return ['natural', 'leather', 'expedition']
    case 'fuel':
      return ['natural', 'fuel', 'expedition']
    case 'special':
      return ['exotic', 'special', 'expedition']
    default:
      return ['expedition']
  }
}

function pickPhysical(role: Role): MaterialPhysical {
  switch (role) {
    case 'ore':
      return { ...PHY_ORE }
    case 'stone':
      return { ...PHY_STONE }
    case 'gem':
      return { ...PHY_GEM }
    case 'wood':
      return { ...PHY_WOOD }
    case 'organic':
      return { ...PHY_ORGANIC }
    case 'metal':
      return { ...PHY_METAL }
    case 'leather':
      return { ...PHY_LEATHER }
    case 'fuel':
      return { ...PHY_FUEL }
    case 'special':
      return { ...PHY_GEM }
    default:
      return { ...PHY_STONE }
  }
}

function pickProcessing(role: Role): MaterialProcessing {
  switch (role) {
    case 'ore':
      return { ...PROC_ORE }
    case 'stone':
    case 'gem':
    case 'special':
      return { ...PROC_STONE }
    case 'wood':
      return { ...PROC_WOOD }
    case 'organic':
      return { ...PROC_ORGANIC }
    case 'metal':
      return { ...PROC_METAL }
    case 'leather':
      return { ...PROC_ORGANIC }
    case 'fuel':
      return { ...PROC_ORGANIC }
    default:
      return { ...PROC_STONE }
  }
}

function pickArcane(role: Role, tier: number): MaterialArcane {
  if (role === 'special' || role === 'gem' || tier >= 4) {
    return { ...ARCANE_HIGH }
  }
  return { ...ARCANE_LOW }
}

const ICON_BY_ROLE = WORLD_ROLE_ICON_EMOJI as Record<Role, string>

export function expeditionNode(spec: ExpeditionNodeSpec): MaterialNode {
  const role = spec.role
  const tier = spec.economy.tier
  const tags = [...baseTags(role), ...(spec.tags ?? [])]

  return {
    identity: {
      id: spec.id,
      name: spec.name,
      class: roleToClass(role),
      origin: spec.origin ?? 'natural',
      tags,
    },
    physical: pickPhysical(role),
    chemical: { ...CHEM_DEFAULT },
    arcane: pickArcane(role, tier),
    processing: pickProcessing(role),
    economy: { ...spec.economy },
    summary: spec.summary,
    discovery: DISCOVERY_DEFAULT,
    description: spec.description,
    icon: spec.icon ?? ICON_BY_ROLE[role],
    version: 1,
  }
}
