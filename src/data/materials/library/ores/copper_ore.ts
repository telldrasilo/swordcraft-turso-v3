/**
 * Медная руда
 * Природная медная руда с характерным красноватым оттенком
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const copperOre: MaterialNode = {
  identity: {
    id: 'copper_ore',
    name: 'Медная руда',
    class: 'mineral',
    origin: 'natural',
    tags: ['natural', 'mineral', 'copper-bearing', 'ore', 'decorative'],
  },

  physical: {
    density: 4.5,
    hardness: 35,
    toughness: 40,
    elasticity: 10,

    meltingPoint: 1085,
    ignitionPoint: null,
    thermalConductivity: 30,

    porosity: 45,
    compressiveStrength: 50,
    tensileStrength: 30,
  },

  chemical: {
    reactivity: 40,
    stability: 60,
    corrosionResistance: 30,
    oxidationResistance: 25,
    acidity: 6.5,
    solubility: 10,
  },

  arcane: {
    conductivity: 15,
    affinity: 20,
    stability: 65,
    resonance: 10,
  },

  processing: {
    workability: 40,
    refineDifficulty: 45,
    purityPotential: 45,
    defectRisk: 25,
    repairability: 100,
  },

  economy: {
    rarity: 30,
    tier: 1,
    baseValue: 15,
    availability: 85,
    discoverability: 95,
  },

  summary: {
    basic: 'Природная медная руда. Мягкий металл с характерным красноватым оттенком.',
    applied: 'Сырьё для выплавки меди и бронзы. Используется в украшениях.',
    strengths: [
      'Легко плавится',
      'Красивый цвет',
      'Подходит для украшений',
    ],
    weaknesses: [
      'Мягкий металл',
      'Быстро окисляется',
      'Низкая прочность',
    ],
    bestFor: [
      'Выплавка меди',
      'Производство бронзы',
      'Украшения',
    ],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 0 },
      { type: 'craft', requiredExpertise: 5 },
    ],
  },

  description: 'Медная руда содержит соединения меди с характерным красновато-бурым цветом. Один из первых металлов, освоенных человечеством. Легко плавится и обрабатывается.',
  icon: '/icons/resources/copperOre.png',
  version: 1,
}

export default copperOre
