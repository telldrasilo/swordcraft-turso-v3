/**
 * Клён
 * Лёгкая однородная древесина
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const maple: MaterialNode = {
  identity: {
    id: 'maple',
    name: 'Клён',
    class: 'wood',
    origin: 'natural',
    tags: ['natural', 'wood', 'light', 'versatile', 'even-grain'],
  },

  physical: {
    density: 3.2,
    hardness: 38,
    toughness: 42,
    elasticity: 52,

    meltingPoint: null,
    ignitionPoint: 275,
    thermalConductivity: 13,

    porosity: 32,
    compressiveStrength: 46,
    tensileStrength: 52,
  },

  chemical: {
    reactivity: 22,
    stability: 58,
    corrosionResistance: 48,
    oxidationResistance: 48,
    acidity: 5,
    solubility: 10,
  },

  arcane: {
    conductivity: 14,
    affinity: 18,
    stability: 48,
    resonance: 14,
  },

  processing: {
    workability: 72,
    refineDifficulty: 36,
    purityPotential: 38,
    defectRisk: 2,
    repairability: 100,
  },

  economy: {
    rarity: 28,
    tier: 2,
    baseValue: 14,
    availability: 86,
    discoverability: 92,
  },

  summary: {
    basic: 'Относительно лёгкая и ровная по волокнам древесина — приятна в шлифовке и удобна для рукоятей.',
    applied: 'Рукояти, облегчённые древки, детали с чистой геометрией.',
    strengths: ['Хорошая эластичность', 'Ровная текстура', 'Лёгкий вес'],
    weaknesses: ['Мягче дуба', 'Горит'],
    bestFor: ['Рукояти', 'Учебные заготовки', 'Декоративная инкрустация'],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 0 },
      { type: 'craft', requiredExpertise: 5 },
    ],
  },

  description:
    'Клён даёт относительно лёгкую и однородную древесину, удобную для рукоятей; материал включён в каталог для полного покрытия маппинга.',
  icon: '/icons/resources/wood.png',
  version: 1,
}

export default maple
