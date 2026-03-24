/**
 * Гранит
 * Очень прочный камень с зернистой структурой
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const granite: MaterialNode = {
  identity: {
    id: 'granite',
    name: 'Гранит',
    class: 'mineral',
    origin: 'natural',
    tags: ['natural', 'stone', 'durable', 'heavy', 'crystalline'],
  },

  physical: {
    density: 6.2,
    hardness: 78,
    toughness: 2,
    elasticity: 2,

    meltingPoint: null,
    ignitionPoint: null,
    thermalConductivity: 4,

    porosity: 10,
    compressiveStrength: 80,
    tensileStrength: 10,
  },

  chemical: {
    reactivity: 5,
    stability: 90,
    corrosionResistance: 95,
    oxidationResistance: 95,
    acidity: 7,
    solubility: 5,
  },

  arcane: {
    conductivity: 4,
    affinity: 5,
    stability: 70,
    resonance: 5,
  },

  processing: {
    workability: 20,
    refineDifficulty: 50,
    purityPotential: 30,
    defectRisk: 8,
    repairability: 50,
  },

  economy: {
    rarity: 35,
    tier: 2,
    baseValue: 20,
    availability: 75,
    discoverability: 90,
  },

  summary: {
    basic: 'Очень прочный камень с зернистой структурой. Идеален для наверший.',
    applied: 'Используется для строительных работ, фундаментов, наверший и тяжёлых инструментов. Очень прочный, но тяжёлый.',
    strengths: [
      'Очень прочный',
      'Устойчив к огню',
      'Долговечный',
      'Хорошая теплоизоляция',
    ],
    weaknesses: [
      'Очень тяжёлый',
      'Трудно обрабатывать',
      'Низкая гибкость',
    ],
    bestFor: [
      'Навершия',
      'Строительство',
      'Тяжёлые инструменты',
    ],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 0 },
      { type: 'craft', requiredExpertise: 10 },
    ],
  },

  description: 'Гранит — очень прочный камень с зернистой структурой. Идеален для наверший и строительных работ. Очень прочный, но тяжёлый и трудно обрабатывается. Устойчив к огню и долговечен.',
  icon: '/icons/resources/stone.png',
  version: 1,
}

export default granite
