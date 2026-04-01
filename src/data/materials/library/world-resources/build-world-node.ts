/**
 * Сборка MaterialNode для ресурсов мира (добыча в том числе через экспедиции).
 * Без тега expedition — ресурс един для энциклопедии и склада.
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

export type WorldResourceRole =
  | 'ore'
  | 'stone'
  | 'wood'
  | 'organic'
  | 'metal'
  | 'leather'
  | 'gem'
  | 'special'

export interface WorldResourceSpec {
  id: string
  name: string
  role: WorldResourceRole
  tags?: string[]
  economy: MaterialEconomy
  summary: MaterialSummary
  description: string
  icon?: string
  origin?: MaterialIdentity['origin']
  /** Тонкая настройка поверх профиля роли */
  physical?: Partial<MaterialPhysical>
  chemical?: Partial<MaterialChemical>
  arcane?: Partial<MaterialArcane>
  processing?: Partial<MaterialProcessing>
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

function roleToClass(role: WorldResourceRole): MaterialIdentity['class'] {
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
    case 'special':
      return 'other'
    default:
      return 'other'
  }
}

function baseTags(role: WorldResourceRole): string[] {
  switch (role) {
    case 'ore':
      return ['natural', 'mineral', 'ore']
    case 'stone':
      return ['natural', 'mineral', 'stone']
    case 'gem':
      return ['natural', 'mineral', 'gem']
    case 'wood':
      return ['natural', 'wood']
    case 'organic':
      return ['natural', 'organic', 'herb']
    case 'metal':
      return ['natural', 'metal']
    case 'leather':
      return ['natural', 'leather']
    case 'special':
      return ['exotic', 'special']
    default:
      return ['gatherable']
  }
}

function pickPhysical(role: WorldResourceRole): MaterialPhysical {
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
    case 'special':
      return { ...PHY_GEM }
    default:
      return { ...PHY_STONE }
  }
}

function pickProcessing(role: WorldResourceRole): MaterialProcessing {
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
    default:
      return { ...PROC_STONE }
  }
}

function pickArcane(role: WorldResourceRole, tier: number): MaterialArcane {
  if (role === 'special' || role === 'gem' || tier >= 4) {
    return { ...ARCANE_HIGH }
  }
  return { ...ARCANE_LOW }
}

const ICON_BY_ROLE: Record<WorldResourceRole, string> = {
  ore: '/icons/resources/ironOre.png',
  stone: '/icons/resources/stone.png',
  gem: '/icons/resources/stone.png',
  wood: '/icons/resources/wood.png',
  organic: '/icons/resources/wood.png',
  metal: '/icons/resources/mithrilIngot.png',
  leather: '/icons/resources/leather.png',
  special: '/icons/resources/stone.png',
}

function mergePhysical(base: MaterialPhysical, part?: Partial<MaterialPhysical>): MaterialPhysical {
  return part ? { ...base, ...part } : base
}

function mergeChem(base: MaterialChemical, part?: Partial<MaterialChemical>): MaterialChemical {
  return part ? { ...base, ...part } : base
}

function mergeArcane(base: MaterialArcane, part?: Partial<MaterialArcane>): MaterialArcane {
  return part ? { ...base, ...part } : base
}

function mergeProc(base: MaterialProcessing, part?: Partial<MaterialProcessing>): MaterialProcessing {
  return part ? { ...base, ...part } : base
}

/** Краткое summary с разумными дефолтами для базы знаний */
export function loreSummary(
  basic: string,
  opts?: {
    applied?: string
    strengths?: string[]
    weaknesses?: string[]
    bestFor?: string[]
  }
): MaterialSummary {
  return {
    basic,
    applied: opts?.applied ?? basic,
    strengths: opts?.strengths ?? ['Сырьё широкого применения в кузнице и мастерских'],
    weaknesses: opts?.weaknesses ?? ['Требует подготовки и аккуратного хранения'],
    bestFor: opts?.bestFor ?? ['Плавка', 'Алхимия', 'Усиление снаряжения'],
  }
}

export function buildWorldNode(spec: WorldResourceSpec): MaterialNode {
  const role = spec.role
  const tier = spec.economy.tier
  const tags = [...baseTags(role), ...(spec.tags ?? [])]

  const physical = mergePhysical(pickPhysical(role), spec.physical)
  const chemical = mergeChem({ ...CHEM_DEFAULT }, spec.chemical)
  const arcane = mergeArcane(pickArcane(role, tier), spec.arcane)
  const processing = mergeProc(pickProcessing(role), spec.processing)

  return {
    identity: {
      id: spec.id,
      name: spec.name,
      class: roleToClass(role),
      origin: spec.origin ?? 'natural',
      tags: [...new Set(tags)],
    },
    physical,
    chemical,
    arcane,
    processing,
    economy: { ...spec.economy },
    summary: spec.summary,
    discovery: DISCOVERY_DEFAULT,
    description: spec.description,
    icon: spec.icon ?? ICON_BY_ROLE[role],
    version: 1,
  }
}
