/**
 * Мифрил
 * Легендарный эльфийский металл
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const mithril: MaterialNode = {
  identity: {
    id: 'mithril',
    name: 'Мифрил',
    class: 'metal',
    origin: 'natural',
    tags: ['natural', 'metal', 'legendary', 'lightweight', 'magical'],
  },

  physical: {
    density: 2.5,
    hardness: 88,
    toughness: 75,
    elasticity: 75,

    meltingPoint: 2500,
    ignitionPoint: null,
    thermalConductivity: 90,

    porosity: 5,
    compressiveStrength: 95,
    tensileStrength: 90,
  },

  chemical: {
    reactivity: 10,
    stability: 90,
    corrosionResistance: 100,
    oxidationResistance: 100,
    acidity: 7,
    solubility: 5,
  },

  arcane: {
    conductivity: 90,
    affinity: 95,
    stability: 90,
    resonance: 80,
  },

  processing: {
    workability: 25,
    refineDifficulty: 90,
    purityPotential: 90,
    defectRisk: 15,
    repairability: 100,
  },

  economy: {
    rarity: 95,
    tier: 5,
    baseValue: 200,
    availability: 5,
    discoverability: 20,
  },

  summary: {
    basic: 'Легендарный эльфийский металл. Лёгкий, прочный, идеально сбалансированный.',
    applied: 'Используется для создания оружия, доспехов и магических артефактов высшего качества. Редкий и очень дорогой материал.',
    strengths: [
      'Легендарная прочность',
      'Очень лёгкий',
      'Идеальный баланс',
      'Магические свойства',
      'Не ржавеет',
    ],
    weaknesses: [
      'Крайне редкий',
      'Сложно обрабатывать',
      'Очень дорогой',
      'Требует великого мастерства',
    ],
    bestFor: [
      'Легендарное оружие',
      'Магические доспехи',
      'Артефакты',
    ],
  },

  discovery: {
    unlockedBy: [
      { type: 'special', requiredExpertise: 80 },
      { type: 'quest', requiredExpertise: 100 },
    ],
  },

  description: 'Мифрил — легендарный эльфийский металл, который редко встречается в природе. Лёгкий, прочный, идеально сбалансированный и обладает магическими свойствами. Используется для создания оружия, доспехов и магических артефактов высшего качества. Редкий и очень дорогой материал, который требует великого мастерства для обработки.',
  icon: '/icons/resources/mithrilIngot.png',
  version: 1,
}

export default mithril
