/**
 * Драконья кожа
 * Легендарный материал
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const dragonLeather: MaterialNode = {
  identity: {
    id: 'dragon_leather',
    name: 'Драконья кожа',
    class: 'leather',
    origin: 'natural',
    tags: ['natural', 'leather', 'legendary', 'fireproof', 'magical'],
  },

  physical: {
    density: 1.2,
    hardness: 35,
    toughness: 50,
    elasticity: 50,

    meltingPoint: null,
    ignitionPoint: null,
    thermalConductivity: 60,

    porosity: 25,
    compressiveStrength: 45,
    tensileStrength: 55,
  },

  chemical: {
    reactivity: 10,
    stability: 80,
    corrosionResistance: 90,
    oxidationResistance: 90,
    acidity: 5,
    solubility: 5,
  },

  arcane: {
    conductivity: 60,
    affinity: 70,
    stability: 70,
    resonance: 50,
  },

  processing: {
    workability: 40,
    refineDifficulty: 80,
    purityPotential: 70,
    defectRisk: 15,
    repairability: 100,
  },

  economy: {
    rarity: 95,
    tier: 5,
    baseValue: 150,
    availability: 5,
    discoverability: 20,
  },

  summary: {
    basic: 'Легендарный материал. Огнеупорная, прочная, с магическими свойствами.',
    applied: 'Используется для создания легендарного оружия, доспехов и артефактов. Огнеупорная и магически активная кожа.',
    strengths: [
      'Огнеупорная',
      'Очень прочная',
      'Магические свойства',
      'Легендарная',
    ],
    weaknesses: [
      'Крайне редкая',
      'Очень дорогая',
      'Трудно обрабатывать',
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
      { type: 'harvest', requiredExpertise: 80 },
      { type: 'special', requiredExpertise: 100 },
    ],
  },

  description: 'Драконья кожа — легендарный материал, который добывается с драконов. Огнеупорная, прочная, с магическими свойствами. Используется для создания легендарного оружия, доспехов и артефактов.',
  icon: '/icons/resources/leather.png',
  version: 1,
}

export default dragonLeather
