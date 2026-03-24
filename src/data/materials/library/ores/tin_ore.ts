/**
 * Оловянная руда
 * Природная оловянная руда для производства бронзы
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const tinOre: MaterialNode = {
  identity: {
    id: 'tin_ore',
    name: 'Оловянная руда',
    class: 'mineral',
    origin: 'natural',
    tags: ['natural', 'mineral', 'tin-bearing', 'ore', 'alloy-component'],
  },

  physical: {
    density: 4.0,
    hardness: 30,
    toughness: 35,
    elasticity: 8,

    meltingPoint: 232,
    ignitionPoint: null,
    thermalConductivity: 20,

    porosity: 50,
    compressiveStrength: 40,
    tensileStrength: 20,
  },

  chemical: {
    reactivity: 30,
    stability: 70,
    corrosionResistance: 50,
    oxidationResistance: 45,
    acidity: 7,
    solubility: 8,
  },

  arcane: {
    conductivity: 8,
    affinity: 12,
    stability: 70,
    resonance: 5,
  },

  processing: {
    workability: 50,
    refineDifficulty: 40,
    purityPotential: 50,
    defectRisk: 20,
    repairability: 100,
  },

  economy: {
    rarity: 40,
    tier: 2,
    baseValue: 20,
    availability: 70,
    discoverability: 85,
  },

  summary: {
    basic: 'Природная оловянная руда. Мягкий металл с низкой температурой плавления.',
    applied: 'Компонент для производства бронзы. Редко используется в чистом виде.',
    strengths: [
      'Легко плавится',
      'Устойчив к коррозии',
      'Ключевой компонент бронзы',
    ],
    weaknesses: [
      'Очень мягкий',
      'Редко встречается',
      'Низкая прочность в чистом виде',
    ],
    bestFor: [
      'Производство бронзы',
      'Пайка металлов',
      'Покрытия',
    ],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 0 },
      { type: 'research', requiredExpertise: 10 },
    ],
  },

  description: 'Оловянная руда — источник олова, мягкого металла с очень низкой температурой плавления. Важнейший компонент для производства бронзы при сплавлении с медью.',
  icon: '/icons/resources/tinOre.png',
  version: 1,
}

export default tinOre
