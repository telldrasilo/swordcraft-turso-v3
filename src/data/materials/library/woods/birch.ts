/**
 * Берёза
 * Лёгкое и мягкое дерево
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const birch: MaterialNode = {
  identity: {
    id: 'birch',
    name: 'Берёза',
    class: 'wood',
    origin: 'natural',
    tags: ['natural', 'wood', 'lightweight', 'soft', 'common'],
  },

  physical: {
    density: 2.5,
    hardness: 25,
    toughness: 55,
    elasticity: 55,

    meltingPoint: null,
    ignitionPoint: 250,
    thermalConductivity: 10,

    porosity: 40,
    compressiveStrength: 30,
    tensileStrength: 40,
  },

  chemical: {
    reactivity: 30,
    stability: 40,
    corrosionResistance: 30,
    oxidationResistance: 30,
    acidity: 5,
    solubility: 15,
  },

  arcane: {
    conductivity: 10,
    affinity: 15,
    stability: 40,
    resonance: 10,
  },

  processing: {
    workability: 90,
    refineDifficulty: 20,
    purityPotential: 30,
    defectRisk: 0,
    repairability: 100,
  },

  economy: {
    rarity: 10,
    tier: 1,
    baseValue: 8,
    availability: 100,
    discoverability: 100,
  },

  summary: {
    basic: 'Лёгкое и мягкое дерево. Быстро обрабатывается, но менее прочно.',
    applied: 'Используется для рукоятей, декоративных элементов и простых инструментов. Легко обрабатывается, но не очень прочно.',
    strengths: [
      'Очень лёгкое',
      'Легко обрабатывать',
      'Быстро работать',
      'Дешёвое',
    ],
    weaknesses: [
      'Низкая прочность',
      'Мягкое',
      'Горит',
    ],
    bestFor: [
      'Рукояти',
      'Декоративные элементы',
      'Простые инструменты',
    ],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 0 },
    ],
  },

  description: 'Берёза — лёгкое и мягкое дерево, которое легко обрабатывается. Быстро работать с ним, но оно не очень прочно. Используется для рукоятей, декоративных элементов и простых инструментов.',
  icon: '/icons/resources/wood.png',
  version: 1,
}

export default birch
