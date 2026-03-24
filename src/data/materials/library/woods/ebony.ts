/**
 * Эбеновое дерево
 * Редкое тёмное дерево с магическими свойствами
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const ebony: MaterialNode = {
  identity: {
    id: 'ebony',
    name: 'Эбеновое дерево',
    class: 'wood',
    origin: 'natural',
    tags: ['natural', 'wood', 'magical', 'dense', 'rare'],
  },

  physical: {
    density: 4.5,
    hardness: 55,
    toughness: 35,
    elasticity: 35,

    meltingPoint: null,
    ignitionPoint: 300,
    thermalConductivity: 45,

    porosity: 15,
    compressiveStrength: 60,
    tensileStrength: 50,
  },

  chemical: {
    reactivity: 10,
    stability: 70,
    corrosionResistance: 70,
    oxidationResistance: 70,
    acidity: 5,
    solubility: 5,
  },

  arcane: {
    conductivity: 45,
    affinity: 55,
    stability: 60,
    resonance: 35,
  },

  processing: {
    workability: 45,
    refineDifficulty: 60,
    purityPotential: 60,
    defectRisk: 8,
    repairability: 90,
  },

  economy: {
    rarity: 70,
    tier: 3,
    baseValue: 45,
    availability: 35,
    discoverability: 70,
  },

  summary: {
    basic: 'Редкое тёмное дерево с магическими свойствами. Тяжёлое, но мощное.',
    applied: 'Используется для магического оружия, артефактов и рукоятей. Тяжёлое и магически активное дерево.',
    strengths: [
      'Магические свойства',
      'Высокая твёрдость',
      'Красивый внешний вид',
      'Хорошо проводит магию',
    ],
    weaknesses: [
      'Тяжёлое',
      'Сложно обрабатывать',
      'Редкое',
    ],
    bestFor: [
      'Магическое оружие',
      'Артефакты',
      'Рукояти',
    ],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 30 },
      { type: 'craft', requiredExpertise: 40 },
      { type: 'trade', requiredExpertise: 50 },
    ],
  },

  description: 'Эбеновое дерево — редкое тёмное дерево с магическими свойствами. Тяжёлое, но мощное дерево, которое используется для магического оружия, артефактов и рукоятей.',
  icon: '/icons/resources/wood.png',
  version: 1,
}

export default ebony
