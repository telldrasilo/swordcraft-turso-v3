/**
 * Железное дерево
 * Невероятно плотное дерево
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const ironwood: MaterialNode = {
  identity: {
    id: 'ironwood',
    name: 'Железное дерево',
    class: 'wood',
    origin: 'natural',
    tags: ['natural', 'wood', 'dense', 'durable', 'rare'],
  },

  physical: {
    density: 5.5,
    hardness: 70,
    toughness: 20,
    elasticity: 20,

    meltingPoint: null,
    ignitionPoint: 350,
    thermalConductivity: 8,

    porosity: 10,
    compressiveStrength: 75,
    tensileStrength: 60,
  },

  chemical: {
    reactivity: 5,
    stability: 80,
    corrosionResistance: 75,
    oxidationResistance: 75,
    acidity: 5,
    solubility: 5,
  },

  arcane: {
    conductivity: 8,
    affinity: 10,
    stability: 70,
    resonance: 5,
  },

  processing: {
    workability: 30,
    refineDifficulty: 70,
    purityPotential: 50,
    defectRisk: 12,
    repairability: 70,
  },

  economy: {
    rarity: 75,
    tier: 4,
    baseValue: 60,
    availability: 25,
    discoverability: 60,
  },

  summary: {
    basic: 'Невероятно плотное дерево. Тяжёлое, почти как металл.',
    applied: 'Используется для боевых рукоятей, древков и дубин. Очень прочное и тяжёлое дерево.',
    strengths: [
      'Очень прочное',
      'Высокая твёрдость',
      'Устойчиво к огню',
      'Долговечное',
    ],
    weaknesses: [
      'Очень тяжёлое',
      'Очень трудно обрабатывать',
      'Низкая гибкость',
    ],
    bestFor: [
      'Боевые рукояти',
      'Дубины',
      'Тяжёлые древки',
    ],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 50 },
      { type: 'craft', requiredExpertise: 60 },
    ],
  },

  description: 'Железное дерево — невероятно плотное дерево, которое почти как металл. Очень прочное и тяжёлое, используется для боевых рукоятей, древков и дубин.',
  icon: '/icons/resources/wood.png',
  version: 1,
}

export default ironwood
