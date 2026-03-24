/**
 * Сырая кожа
 * Неприятный запах, но дёшево и сердито
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const rawLeather: MaterialNode = {
  identity: {
    id: 'raw_leather',
    name: 'Сырая кожа',
    class: 'leather',
    origin: 'natural',
    tags: ['natural', 'leather', 'basic', 'flexible', 'common'],
  },

  physical: {
    density: 0.8,
    hardness: 5,
    toughness: 85,
    elasticity: 85,

    meltingPoint: null,
    ignitionPoint: 200,
    thermalConductivity: 8,

    porosity: 60,
    compressiveStrength: 10,
    tensileStrength: 20,
  },

  chemical: {
    reactivity: 50,
    stability: 30,
    corrosionResistance: 20,
    oxidationResistance: 20,
    acidity: 6,
    solubility: 20,
  },

  arcane: {
    conductivity: 8,
    affinity: 10,
    stability: 30,
    resonance: 5,
  },

  processing: {
    workability: 95,
    refineDifficulty: 10,
    purityPotential: 20,
    defectRisk: 0,
    repairability: 60,
  },

  economy: {
    rarity: 5,
    tier: 1,
    baseValue: 5,
    availability: 100,
    discoverability: 100,
  },

  summary: {
    basic: 'Неприятный запах, но дёшево и сердито. Быстро надевается.',
    applied: 'Используется для простых рукоятей, обмотки и дешёвой экипировки. Быстро надевается, но быстро изнашивается.',
    strengths: [
      'Очень гибкая',
      'Очень легко работать',
      'Быстро надевается',
      'Дешёвая',
    ],
    weaknesses: [
      'Неприятный запах',
      'Быстро изнашивается',
      'Низкая прочность',
      'Горит',
    ],
    bestFor: [
      'Простые рукояти',
      'Обмотка',
      'Дешёвая экипировка',
    ],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 0 },
    ],
  },

  description: 'Сырая кожа — необработанная кожа животных. Неприятный запах, но дёшево и сердито. Быстро надевается, но быстро изнашивается.',
  icon: '/icons/resources/leather.png',
  version: 1,
}

export default rawLeather
