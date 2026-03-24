/**
 * Ясень
 * Гибкое и упругое дерево
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const ash: MaterialNode = {
  identity: {
    id: 'ash',
    name: 'Ясень',
    class: 'wood',
    origin: 'natural',
    tags: ['natural', 'wood', 'flexible', 'balanced', 'elastic'],
  },

  physical: {
    density: 3.2,
    hardness: 35,
    toughness: 70,
    elasticity: 70,

    meltingPoint: null,
    ignitionPoint: 270,
    thermalConductivity: 15,

    porosity: 35,
    compressiveStrength: 45,
    tensileStrength: 60,
  },

  chemical: {
    reactivity: 20,
    stability: 55,
    corrosionResistance: 45,
    oxidationResistance: 45,
    acidity: 5,
    solubility: 10,
  },

  arcane: {
    conductivity: 15,
    affinity: 25,
    stability: 55,
    resonance: 20,
  },

  processing: {
    workability: 70,
    refineDifficulty: 35,
    purityPotential: 45,
    defectRisk: 3,
    repairability: 100,
  },

  economy: {
    rarity: 35,
    tier: 2,
    baseValue: 18,
    availability: 80,
    discoverability: 90,
  },

  summary: {
    basic: 'Гибкое и упругое дерево. Идеально для баланса оружия.',
    applied: 'Используется для рукоятей, древков и луков. Гибкое и упругое дерево.',
    strengths: [
      'Высокая гибкость',
      'Хороший баланс',
      'Прочное',
      'Хорошо гнётся',
    ],
    weaknesses: [
      'Мягче дуба',
      'Горит',
    ],
    bestFor: [
      'Рукояти для баланса',
      'Древки',
      'Луки',
    ],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 0 },
      { type: 'craft', requiredExpertise: 10 },
    ],
  },

  description: 'Ясень — гибкое и упругое дерево, которое идеально подходит для баланса оружия. Используется для рукоятей, древков и луков. Гибкое и упругое дерево.',
  icon: '/icons/resources/wood.png',
  version: 1,
}

export default ash
