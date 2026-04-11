/**
 * Укреплённая кожа
 * Пропитка или прессование для плотности и доспеха
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const hardenedLeather: MaterialNode = {
  identity: {
    id: 'hardened_leather',
    name: 'Укреплённая кожа',
    class: 'leather',
    origin: 'refined',
    tags: ['refined', 'leather', 'tough', 'armor', 'durable'],
  },

  physical: {
    density: 1.25,
    hardness: 26,
    toughness: 72,
    elasticity: 58,

    meltingPoint: null,
    ignitionPoint: 235,
    thermalConductivity: 11,

    porosity: 38,
    compressiveStrength: 28,
    tensileStrength: 38,
  },

  chemical: {
    reactivity: 28,
    stability: 58,
    corrosionResistance: 48,
    oxidationResistance: 48,
    acidity: 5,
    solubility: 12,
  },

  arcane: {
    conductivity: 12,
    affinity: 18,
    stability: 52,
    resonance: 12,
  },

  processing: {
    workability: 64,
    refineDifficulty: 45,
    purityPotential: 48,
    defectRisk: 4,
    repairability: 95,
  },

  economy: {
    rarity: 38,
    tier: 3,
    baseValue: 28,
    availability: 68,
    discoverability: 80,
  },

  summary: {
    basic:
      'Кожа после пропитки или прессования: плотнее выделки, лучше держит форму — типичный шаг к доспеху и тяжёлым рукоятям.',
    applied: 'Поручни, доспехи, накладки на рукоятях, ремни под нагрузку.',
    strengths: ['Высокая вязкость', 'Устойчивость к истиранию', 'Хорош для брони'],
    weaknesses: ['Тяжелее мягкой кожи', 'Горит', 'Дороже обычной выделки'],
    bestFor: ['Лёгкая броня', 'Тяжёлые рукояти', 'Рабочая экипировка'],
  },

  discovery: {
    unlockedBy: [
      { type: 'craft', requiredExpertise: 12 },
    ],
  },

  description:
    'Укреплённая кожа прошла пропитку или прессование, становясь плотнее; id привязан к складскому пулу кожи для крафта и заказов.',
  icon: '/icons/resources/leather.png',
  version: 1,
}

export default hardenedLeather
