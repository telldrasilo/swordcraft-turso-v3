/**
 * Кремень
 * Твёрдый камень, способный давать искру
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const flint: MaterialNode = {
  identity: {
    id: 'flint',
    name: 'Кремень',
    class: 'mineral',
    origin: 'natural',
    tags: ['natural', 'stone', 'sharp', 'spark-producing', 'brittle'],
  },

  physical: {
    density: 4.5,
    hardness: 72,
    toughness: 3,
    elasticity: 3,

    meltingPoint: null,
    ignitionPoint: null,
    thermalConductivity: 8,

    porosity: 5,
    compressiveStrength: 70,
    tensileStrength: 3,
  },

  chemical: {
    reactivity: 5,
    stability: 80,
    corrosionResistance: 90,
    oxidationResistance: 90,
    acidity: 7,
    solubility: 5,
  },

  arcane: {
    conductivity: 8,
    affinity: 10,
    stability: 60,
    resonance: 5,
  },

  processing: {
    workability: 25,
    refineDifficulty: 40,
    purityPotential: 30,
    defectRisk: 15,
    repairability: 20,
  },

  economy: {
    rarity: 20,
    tier: 1,
    baseValue: 10,
    availability: 90,
    discoverability: 100,
  },

  summary: {
    basic: 'Твёрдый камень, способный давать искру. Можно заточить до бритвенной остроты.',
    applied: 'Используется для создания острого оружия, инструментов для высекания огня и наконечников стрел. Хрупкий, но очень острый.',
    strengths: [
      'Очень острый',
      'Даёт искру',
      'Устойчив к огню',
      'Доступный',
    ],
    weaknesses: [
      'Крайне хрупкий',
      'Трудно обрабатывать',
      'Почти невозможно починить',
    ],
    bestFor: [
      'Острое оружие',
      'Наконечники стрел',
      'Высекание огня',
    ],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 0 },
      { type: 'craft', requiredExpertise: 5 },
    ],
  },

  description: 'Кремень — твёрдый камень, способный давать искру при ударе о сталь. Можно заточить до бритвенной остроты, что делает его отличным материалом для создания острого оружия. Однако он крайне хрупкий и при ударе может расколоться.',
  icon: '/icons/resources/stone.png',
  version: 1,
}

export default flint
