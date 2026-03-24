/**
 * Выделанная кожа
 * Качественно обработанная кожа
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const tannedLeather: MaterialNode = {
  identity: {
    id: 'tanned_leather',
    name: 'Выделанная кожа',
    class: 'leather',
    origin: 'refined',
    tags: ['refined', 'leather', 'quality', 'flexible', 'durable'],
  },

  physical: {
    density: 1.0,
    hardness: 12,
    toughness: 75,
    elasticity: 75,

    meltingPoint: null,
    ignitionPoint: 220,
    thermalConductivity: 12,

    porosity: 50,
    compressiveStrength: 20,
    tensileStrength: 30,
  },

  chemical: {
    reactivity: 30,
    stability: 50,
    corrosionResistance: 40,
    oxidationResistance: 40,
    acidity: 5,
    solubility: 15,
  },

  arcane: {
    conductivity: 12,
    affinity: 15,
    stability: 45,
    resonance: 10,
  },

  processing: {
    workability: 80,
    refineDifficulty: 30,
    purityPotential: 35,
    defectRisk: 1,
    repairability: 90,
  },

  economy: {
    rarity: 25,
    tier: 2,
    baseValue: 12,
    availability: 90,
    discoverability: 95,
  },

  summary: {
    basic: 'Качественно обработанная кожа. Хороший хват, приятная на ощупь.',
    applied: 'Используется для рукоятей, обмотки, доспехов и экипировки. Качественная и надёжная кожа.',
    strengths: [
      'Хороший хват',
      'Приятная на ощупь',
      'Хорошая прочность',
      'Надёжная',
    ],
    weaknesses: [
      'Дороже сырой кожи',
      'Горит',
      'Требует обработки',
    ],
    bestFor: [
      'Рукояти',
      'Обмотка',
      'Доспехи',
    ],
  },

  discovery: {
    unlockedBy: [
      { type: 'craft', requiredExpertise: 5 },
    ],
  },

  recipe: {
    process: 'tanning',
    inputs: [
      { materialId: 'raw_leather', quantity: 1, fraction: 1.0 },
    ],
    processModifiers: {
      temperature: 50,
      duration: 120,
      qualityImpact: 1.1,
    },
    yield: 1.0,
  },

  description: 'Выделанная кожа — качественно обработанная кожа животных. Хороший хват, приятная на ощупь. Используется для рукоятей, обмотки, доспехов и экипировки.',
  icon: '/icons/resources/leather.png',
  version: 1,
}

export default tannedLeather
