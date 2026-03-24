/**
 * Бычья кожа
 * Плотная и толстая кожа
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const bullLeather: MaterialNode = {
  identity: {
    id: 'bull_leather',
    name: 'Бычья кожа',
    class: 'leather',
    origin: 'refined',
    tags: ['refined', 'leather', 'thick', 'durable', 'grip'],
  },

  physical: {
    density: 1.4,
    hardness: 20,
    toughness: 60,
    elasticity: 60,

    meltingPoint: null,
    ignitionPoint: 230,
    thermalConductivity: 10,

    porosity: 40,
    compressiveStrength: 30,
    tensileStrength: 40,
  },

  chemical: {
    reactivity: 25,
    stability: 55,
    corrosionResistance: 45,
    oxidationResistance: 45,
    acidity: 5,
    solubility: 10,
  },

  arcane: {
    conductivity: 10,
    affinity: 15,
    stability: 50,
    resonance: 10,
  },

  processing: {
    workability: 70,
    refineDifficulty: 40,
    purityPotential: 40,
    defectRisk: 3,
    repairability: 100,
  },

  economy: {
    rarity: 40,
    tier: 2,
    baseValue: 20,
    availability: 75,
    discoverability: 85,
  },

  summary: {
    basic: 'Плотная и толстая кожа. Надёжный хват для тяжёлого оружия.',
    applied: 'Используется для рукоятей тяжёлого оружия, доспехов и экипировки. Плотная и надёжная кожа.',
    strengths: [
      'Плотная',
      'Надёжный хват',
      'Хорошая прочность',
      'Долговечная',
    ],
    weaknesses: [
      'Тяжелее обычной кожи',
      'Менее гибкая',
      'Горит',
    ],
    bestFor: [
      'Рукояти тяжёлого оружия',
      'Доспехи',
      'Экипировка',
    ],
  },

  discovery: {
    unlockedBy: [
      { type: 'craft', requiredExpertise: 15 },
    ],
  },

  recipe: {
    process: 'tanning',
    inputs: [
      { materialId: 'raw_leather', quantity: 2, fraction: 1.0 },
    ],
    processModifiers: {
      temperature: 60,
      duration: 180,
      qualityImpact: 1.15,
    },
    yield: 1.0,
  },

  description: 'Бычья кожа — плотная и толстая кожа, которая обеспечивает надёжный хват для тяжёлого оружия. Используется для рукоятей, доспехов и экипировки.',
  icon: '/icons/resources/leather.png',
  version: 1,
}

export default bullLeather
