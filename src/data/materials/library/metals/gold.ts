/**
 * Золото (базовый металл каталога; волна 5+ — вынесено из bridge).
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const gold: MaterialNode = {
  identity: {
    id: 'gold',
    name: 'Золото',
    class: 'metal',
    origin: 'natural',
    tags: ['natural', 'metal', 'gold-bearing', 'precious'],
  },

  physical: {
    density: 19.3,
    hardness: 26,
    toughness: 34,
    elasticity: 48,

    meltingPoint: 1064,
    ignitionPoint: null,
    thermalConductivity: 74,

    porosity: 3,
    compressiveStrength: 42,
    tensileStrength: 22,
  },

  chemical: {
    reactivity: 22,
    stability: 78,
    corrosionResistance: 92,
    oxidationResistance: 90,
    acidity: 4,
    solubility: 4,
  },

  arcane: {
    conductivity: 52,
    affinity: 58,
    stability: 62,
    resonance: 48,
  },

  processing: {
    workability: 90,
    refineDifficulty: 58,
    purityPotential: 82,
    defectRisk: 14,
    repairability: 100,
  },

  economy: {
    rarity: 74,
    tier: 3,
    baseValue: 125,
    availability: 32,
    discoverability: 48,
  },

  summary: {
    basic:
      'Тяжёлый благородный металл: чрезвычайно ковкий, химически инертен, мягок — для лезвия не годится, для престижа и магической «ёмкости» — да.',
    applied: 'Инкрустации, украшения, детали престижного оружия.',
    strengths: ['Высокая коррозионная стойкость', 'Сильные арканические показатели', 'Превосходная ковкость'],
    weaknesses: ['Очень мягкий', 'Высокая цена и вес'],
    bestFor: ['Инкрустации', 'Престижное оружие', 'Дорогие украшения'],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 0 },
      { type: 'craft', requiredExpertise: 18 },
    ],
  },

  description:
    'Золото — классический благородный металл: плотный, мягкий, почти не поддаётся коррозии. В кузне его ценят за магическую податливость и статус, а не за режущие качества.',
  icon: '/icons/resources/goldIngot.png',
  version: 1,
}

export default gold
