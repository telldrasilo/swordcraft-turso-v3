/**
 * Красное дерево
 * Тяжёлая стабильная древесина люкс-класса
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const mahogany: MaterialNode = {
  identity: {
    id: 'mahogany',
    name: 'Красное дерево',
    class: 'wood',
    origin: 'natural',
    tags: ['natural', 'wood', 'luxury', 'stable', 'heavy'],
  },

  physical: {
    density: 4.2,
    hardness: 46,
    toughness: 50,
    elasticity: 40,

    meltingPoint: null,
    ignitionPoint: 290,
    thermalConductivity: 10,

    porosity: 24,
    compressiveStrength: 56,
    tensileStrength: 54,
  },

  chemical: {
    reactivity: 16,
    stability: 68,
    corrosionResistance: 55,
    oxidationResistance: 58,
    acidity: 5,
    solubility: 7,
  },

  arcane: {
    conductivity: 11,
    affinity: 24,
    stability: 55,
    resonance: 20,
  },

  processing: {
    workability: 58,
    refineDifficulty: 48,
    purityPotential: 48,
    defectRisk: 4,
    repairability: 100,
  },

  economy: {
    rarity: 48,
    tier: 3,
    baseValue: 32,
    availability: 58,
    discoverability: 72,
  },

  summary: {
    basic: 'Красное дерево сочетает плотность, устойчивость к короблению и роскошный тон — избранный материал мастеров.',
    applied: 'Элитные рукояти, тяжёлые гарды, детали для стабильного баланса.',
    strengths: ['Стабильность геометрии', 'Плотность', 'Престиж'],
    weaknesses: ['Тяжелее клёна', 'Дорогой', 'Горит'],
    bestFor: ['Люкс-оружие', 'Нагруженные рукояти', 'Коллекционные изделия'],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 0 },
      { type: 'craft', requiredExpertise: 12 },
    ],
  },

  description:
    'Красное дерево ценится за прочность, устойчивость к деформации и эстетику; узел каталога обеспечивает складской ключ древесины.',
  icon: '/icons/resources/wood.png',
  version: 1,
}

export default mahogany
