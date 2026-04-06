/**
 * Фаза 1b: явные отклонения от пресета роли для материаловедения (physical / chemical / arcane / processing).
 * Подмешиваются в `buildWorldNode` после базы роли и полей из spec.
 * Полный набор id обязателен для всех узлов в `world-resource-nodes.ts` — проверка в `phase1b-material-science.test.ts`.
 */

import type { WorldResourceSpec } from './build-world-node'

export type WorldResourceMaterialScienceOverride = Pick<
  WorldResourceSpec,
  'physical' | 'chemical' | 'arcane' | 'processing'
>

export const WORLD_RESOURCE_MATERIAL_SCIENCE: Record<string, WorldResourceMaterialScienceOverride> = {
  acorns: {
    physical: { hardness: 22, density: 1.55, porosity: 28 },
    chemical: { reactivity: 25, stability: 48, solubility: 18 },
    processing: { workability: 48, defectRisk: 12 },
  },
  ancient_coal: {
    physical: { hardness: 42, density: 4.8, porosity: 18, thermalConductivity: 12 },
    chemical: { reactivity: 18, stability: 72, oxidationResistance: 35 },
    processing: { refineDifficulty: 52, purityPotential: 32 },
  },
  ancient_metal: {
    physical: { hardness: 68, density: 7.8, toughness: 52, meltingPoint: 1480 },
    chemical: { stability: 58, corrosionResistance: 62 },
    arcane: { conductivity: 22, affinity: 35, resonance: 28 },
    processing: { refineDifficulty: 62, workability: 42 },
  },
  ancient_sap: {
    physical: { hardness: 8, ignitionPoint: 240, porosity: 48 },
    chemical: { reactivity: 42, acidity: 6, solubility: 35 },
    arcane: { affinity: 55, resonance: 62 },
    processing: { workability: 58, defectRisk: 28 },
  },
  ash_dust: {
    physical: { hardness: 6, density: 2.2, porosity: 68 },
    chemical: { reactivity: 48, stability: 40 },
    processing: { workability: 35, purityPotential: 22 },
  },
  black_dust: {
    physical: { hardness: 10, porosity: 62, density: 1.9 },
    chemical: { reactivity: 55, solubility: 8 },
    arcane: { conductivity: 28, resonance: 35 },
    processing: { refineDifficulty: 42, defectRisk: 32 },
  },
  bog_iron: {
    physical: { density: 5.1, hardness: 44, porosity: 38 },
    chemical: { reactivity: 42, acidity: 9 },
    processing: { refineDifficulty: 58, purityPotential: 35 },
  },
  bones: {
    physical: { hardness: 28, toughness: 32, density: 2.0 },
    chemical: { stability: 48, acidity: 7 },
    processing: { workability: 45, defectRisk: 15 },
  },
  clay: {
    physical: { hardness: 18, porosity: 42, compressiveStrength: 22 },
    chemical: { solubility: 28, stability: 55 },
    processing: { workability: 68, defectRisk: 8 },
  },
  coal: {
    physical: { hardness: 22, density: 3.8, porosity: 35, thermalConductivity: 12 },
    chemical: { reactivity: 22, stability: 62 },
    processing: { refineDifficulty: 28, purityPotential: 40 },
  },
  cold_iron_ore: {
    physical: { hardness: 52, density: 5.3, thermalConductivity: 18 },
    arcane: { conductivity: 8, stability: 68 },
    processing: { refineDifficulty: 58, defectRisk: 26 },
  },
  cryo_fungi: {
    physical: { hardness: 6, ignitionPoint: null, thermalConductivity: 6 },
    chemical: { reactivity: 38, stability: 35 },
    arcane: { affinity: 40, resonance: 38 },
    processing: { workability: 62, defectRisk: 35 },
  },
  decayed_bones: {
    physical: { hardness: 15, porosity: 58, toughness: 20 },
    chemical: { reactivity: 48, acidity: 8 },
    processing: { workability: 40, repairability: 65 },
  },
  deep_clay: {
    physical: { hardness: 24, compressiveStrength: 28, porosity: 36 },
    chemical: { stability: 58, solubility: 22 },
    processing: { refineDifficulty: 44, workability: 58 },
  },
  depth_iron: {
    physical: { density: 5.6, hardness: 56, toughness: 44 },
    chemical: { stability: 52 },
    processing: { refineDifficulty: 55, purityPotential: 48 },
  },
  depth_stone: {
    physical: { hardness: 62, density: 4.8, compressiveStrength: 72 },
    chemical: { stability: 65 },
    processing: { workability: 32, refineDifficulty: 52 },
  },
  dragon_bone: {
    physical: { hardness: 72, toughness: 48, density: 3.2 },
    arcane: { resonance: 48, stability: 55 },
    processing: { refineDifficulty: 68, workability: 28 },
  },
  dragon_glass: {
    physical: { hardness: 82, toughness: 18, porosity: 4 },
    chemical: { stability: 48 },
    arcane: { conductivity: 45, resonance: 52 },
    processing: { defectRisk: 42, workability: 22 },
  },
  dragon_scale: {
    physical: { hardness: 58, toughness: 62, ignitionPoint: 320 },
    chemical: { corrosionResistance: 62 },
    processing: { workability: 38, refineDifficulty: 55 },
  },
  dream_resin: {
    physical: { hardness: 10, elasticity: 42, ignitionPoint: 200 },
    chemical: { reactivity: 32, stability: 48 },
    arcane: { affinity: 52, resonance: 45 },
    processing: { workability: 60, defectRisk: 22 },
  },
  echo_bark: {
    physical: { hardness: 20, elasticity: 42, porosity: 48 },
    arcane: { resonance: 48, conductivity: 22 },
    processing: { workability: 55, defectRisk: 18 },
  },
  echo_stone: {
    physical: { hardness: 58, density: 4.4 },
    arcane: { resonance: 62, conductivity: 22 },
    processing: { workability: 40, refineDifficulty: 48 },
  },
  eternal_ice: {
    physical: { hardness: 42, toughness: 15, thermalConductivity: 55 },
    chemical: { stability: 70, solubility: 85 },
    arcane: { affinity: 38, resonance: 42 },
    processing: { defectRisk: 38, refineDifficulty: 58 },
  },
  fire_stone: {
    physical: { hardness: 62, thermalConductivity: 48, ignitionPoint: null },
    chemical: { stability: 58, reactivity: 28 },
    arcane: { conductivity: 32, affinity: 40 },
    processing: { workability: 35, defectRisk: 28 },
  },
  forest_moss: {
    physical: { hardness: 8, porosity: 68, density: 1.4 },
    chemical: { reactivity: 30, solubility: 28 },
    processing: { workability: 62, purityPotential: 22 },
  },
  frozen_crystals: {
    physical: { hardness: 52, thermalConductivity: 42, toughness: 18 },
    chemical: { stability: 55, solubility: 40 },
    arcane: { resonance: 58, affinity: 35 },
    processing: { refineDifficulty: 52, defectRisk: 32 },
  },
  gold_ore: {
    physical: { density: 6.2, hardness: 46, porosity: 28 },
    chemical: { corrosionResistance: 62, reactivity: 25 },
    processing: { refineDifficulty: 58, purityPotential: 52 },
  },
  heart_of_flame: {
    physical: { hardness: 70, thermalConductivity: 65, ignitionPoint: null },
    chemical: { reactivity: 55, stability: 35 },
    arcane: { conductivity: 62, affinity: 58, resonance: 55 },
    processing: { defectRisk: 55, refineDifficulty: 72 },
  },
  heart_of_the_mountain: {
    physical: { hardness: 88, density: 6.5, compressiveStrength: 92 },
    chemical: { stability: 78 },
    arcane: { resonance: 72, affinity: 55, conductivity: 40 },
    processing: { refineDifficulty: 85, workability: 22 },
  },
  living_ore: {
    physical: { density: 5.4, hardness: 50, toughness: 42 },
    arcane: { affinity: 48, stability: 45 },
    chemical: { reactivity: 45 },
    processing: { refineDifficulty: 62, defectRisk: 35 },
  },
  memory_leaf: {
    physical: { hardness: 6, porosity: 72, ignitionPoint: 170 },
    arcane: { affinity: 58, resonance: 48 },
    chemical: { stability: 42, reactivity: 32 },
    processing: { workability: 58, defectRisk: 38 },
  },
  mist_herbs: {
    physical: { hardness: 9, porosity: 65 },
    chemical: { reactivity: 35, solubility: 32 },
    arcane: { affinity: 42, resonance: 35 },
    processing: { workability: 60, purityPotential: 32 },
  },
  mithril_ore: {
    physical: { density: 5.2, hardness: 54, toughness: 40 },
    arcane: { conductivity: 28, resonance: 48 },
    processing: { refineDifficulty: 68, purityPotential: 55 },
  },
  moonstone_shards: {
    physical: { hardness: 72, toughness: 24, density: 3.5 },
    arcane: { resonance: 58, affinity: 45, conductivity: 38 },
    processing: { workability: 28, defectRisk: 35 },
  },
  oak_bark: {
    physical: { hardness: 16, porosity: 52, compressiveStrength: 20, tensileStrength: 24 },
    chemical: { reactivity: 22, stability: 58, acidity: 6 },
    processing: { workability: 52, defectRisk: 20 },
  },
  peat: {
    physical: { hardness: 8, density: 1.2, porosity: 78, ignitionPoint: 200 },
    chemical: { reactivity: 38, stability: 40 },
    processing: { workability: 62, refineDifficulty: 25 },
  },
  pine: {
    physical: { density: 3.0, hardness: 35, elasticity: 52 },
    chemical: { stability: 55, reactivity: 22 },
    processing: { workability: 65, defectRisk: 5 },
  },
  pine_resin: {
    physical: { hardness: 8, ignitionPoint: 210, elasticity: 22 },
    chemical: { reactivity: 42, stability: 45 },
    processing: { workability: 58, defectRisk: 15 },
  },
  poison_gland: {
    physical: { hardness: 8, toughness: 15, density: 1.85 },
    chemical: { reactivity: 62, acidity: 12, solubility: 38 },
    processing: { workability: 35, defectRisk: 42, refineDifficulty: 55 },
  },
  primordial_amber: {
    physical: { hardness: 52, toughness: 28, thermalConductivity: 22 },
    chemical: { stability: 48, reactivity: 45 },
    arcane: { conductivity: 48, affinity: 55, resonance: 52 },
    processing: { refineDifficulty: 62, defectRisk: 32 },
  },
  primordial_ice: {
    physical: { hardness: 58, thermalConductivity: 48, toughness: 12 },
    chemical: { stability: 72, solubility: 78 },
    arcane: { resonance: 68, affinity: 42 },
    processing: { refineDifficulty: 72, defectRisk: 45 },
  },
  red_stone: {
    physical: { hardness: 50, density: 4.0, compressiveStrength: 58 },
    chemical: { stability: 58, acidity: 7 },
    processing: { workability: 42, refineDifficulty: 42 },
  },
  rotten_wood: {
    physical: { hardness: 22, porosity: 62, ignitionPoint: 220, toughness: 28 },
    chemical: { reactivity: 48, stability: 32 },
    processing: { workability: 45, defectRisk: 32, repairability: 55 },
  },
  shadow_leather: {
    physical: { hardness: 22, toughness: 58, density: 2.15 },
    arcane: { affinity: 42, conductivity: 18 },
    processing: { workability: 42, refineDifficulty: 52 },
  },
  silver_bark: {
    physical: { hardness: 18, porosity: 48 },
    chemical: { stability: 52 },
    arcane: { conductivity: 25, affinity: 32 },
    processing: { workability: 54, defectRisk: 18 },
  },
  silver_ore: {
    physical: { density: 5.5, hardness: 44, porosity: 30 },
    chemical: { corrosionResistance: 48, reactivity: 28 },
    processing: { refineDifficulty: 50, purityPotential: 48 },
  },
  silvered_pine: {
    physical: { density: 3.45, hardness: 42, elasticity: 48 },
    chemical: { stability: 55 },
    arcane: { conductivity: 22, affinity: 28 },
    processing: { workability: 58, refineDifficulty: 48 },
  },
  soulforge_ember: {
    physical: { hardness: 48, thermalConductivity: 72, ignitionPoint: null },
    chemical: { reactivity: 52, stability: 40 },
    arcane: { conductivity: 58, affinity: 62, resonance: 55 },
    processing: { refineDifficulty: 78, defectRisk: 48 },
  },
  spirit_wood: {
    physical: { density: 3.15, hardness: 44, elasticity: 42 },
    chemical: { stability: 52 },
    arcane: { affinity: 52, resonance: 48, conductivity: 18 },
    processing: { workability: 55, refineDifficulty: 52, defectRisk: 12 },
  },
  star_metal: {
    physical: { density: 6.8, hardness: 62, toughness: 38 },
    arcane: { resonance: 62, conductivity: 35, affinity: 48 },
    chemical: { stability: 58 },
    processing: { refineDifficulty: 72, purityPotential: 58 },
  },
  sulfur: {
    physical: { hardness: 12, density: 2.6, ignitionPoint: 190 },
    chemical: { reactivity: 72, stability: 35, acidity: 6 },
    processing: { workability: 38, defectRisk: 38 },
  },
  swamp_moss: {
    physical: { hardness: 9, porosity: 72, density: 1.35 },
    chemical: { reactivity: 38, solubility: 32 },
    processing: { workability: 58, purityPotential: 26 },
  },
  toxic_moss: {
    physical: { hardness: 10, porosity: 68 },
    chemical: { reactivity: 55, acidity: 10 },
    processing: { workability: 48, defectRisk: 35, refineDifficulty: 42 },
  },
  volcanic_glass: {
    physical: { hardness: 76, toughness: 20, porosity: 6 },
    chemical: { stability: 55 },
    processing: { workability: 26, defectRisk: 38 },
  },
  void_crystal: {
    physical: { hardness: 80, density: 3.6, toughness: 20 },
    arcane: { conductivity: 72, affinity: 55, resonance: 68, stability: 38 },
    chemical: { stability: 48 },
    processing: { refineDifficulty: 75, defectRisk: 48 },
  },
  whisper_moss: {
    physical: { hardness: 7, porosity: 70 },
    arcane: { resonance: 42, affinity: 38 },
    chemical: { reactivity: 28, stability: 45 },
    processing: { workability: 58, defectRisk: 24 },
  },
  wild_herbs: {
    physical: { hardness: 10, porosity: 66, ignitionPoint: 175 },
    chemical: { reactivity: 32, solubility: 35 },
    arcane: { affinity: 35, resonance: 28 },
    processing: { workability: 62, purityPotential: 30 },
  },
}
