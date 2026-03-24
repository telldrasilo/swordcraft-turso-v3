/**
 * Железная руда
 * Природная железная руда для выплавки железа
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const ironOre: MaterialNode = {
  identity: {
    id: 'iron_ore',
    name: 'Железная руда',
    class: 'mineral',
    origin: 'natural',
    tags: ['natural', 'mineral', 'iron-bearing', 'ore', 'common'],
  },

  physical: {
    density: 5.2,
    hardness: 45,
    toughness: 40,
    elasticity: 15,

    meltingPoint: 1538,
    ignitionPoint: null,
    thermalConductivity: 25,

    porosity: 35,
    compressiveStrength: 55,
    tensileStrength: 25,
  },

  chemical: {
    reactivity: 45,
    stability: 50,
    corrosionResistance: 20,
    oxidationResistance: 15,
    acidity: 7,
    solubility: 5,
  },

  arcane: {
    conductivity: 10,
    affinity: 15,
    stability: 60,
    resonance: 5,
  },

  processing: {
    workability: 35,
    refineDifficulty: 50,
    purityPotential: 40,
    defectRisk: 30,
    repairability: 100,
  },

  economy: {
    rarity: 25,
    tier: 1,
    baseValue: 10,
    availability: 90,
    discoverability: 100,
  },

  summary: {
    basic: 'Природная железная руда. Требует переработки для получения чистого металла.',
    applied: 'Сырьё для выплавки железа. Широко используется в кузнечном деле.',
    strengths: [
      'Широко распространена',
      'Низкая стоимость',
      'Основа металлургии',
    ],
    weaknesses: [
      'Требует переработки',
      'Низкая чистота',
      'Много примесей',
    ],
    bestFor: [
      'Выплавка железа',
      'Производство стали',
      'Базовое оружие',
    ],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 0 },
      { type: 'craft', requiredExpertise: 5 },
    ],
  },

  description: 'Железная руда — основной источник железа. Встречается в шахтах и горных районах. Содержит оксиды железа с примесями породы. Требует выплавки в печи для получения металла.',
  icon: '/icons/resources/ironOre.png',
  version: 1,
}

export default ironOre
