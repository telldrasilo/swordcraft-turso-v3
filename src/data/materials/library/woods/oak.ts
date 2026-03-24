/**
 * Дуб
 * Плотное и прочное дерево
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const oak: MaterialNode = {
  identity: {
    id: 'oak',
    name: 'Дуб',
    class: 'wood',
    origin: 'natural',
    tags: ['natural', 'wood', 'durable', 'dense', 'versatile'],
  },

  physical: {
    density: 3.5,
    hardness: 40,
    toughness: 45,
    elasticity: 45,

    meltingPoint: null,
    ignitionPoint: 280,
    thermalConductivity: 12,

    porosity: 30,
    compressiveStrength: 50,
    tensileStrength: 55,
  },

  chemical: {
    reactivity: 20,
    stability: 60,
    corrosionResistance: 50,
    oxidationResistance: 50,
    acidity: 5,
    solubility: 10,
  },

  arcane: {
    conductivity: 12,
    affinity: 20,
    stability: 50,
    resonance: 15,
  },

  processing: {
    workability: 65,
    refineDifficulty: 40,
    purityPotential: 40,
    defectRisk: 2,
    repairability: 100,
  },

  economy: {
    rarity: 30,
    tier: 2,
    baseValue: 15,
    availability: 85,
    discoverability: 95,
  },

  summary: {
    basic: 'Плотное и прочное дерево. Золотая середина для боевого оружия.',
    applied: 'Используется для рукоятей, древков, щитов и инструментов. Прочное и надёжное дерево.',
    strengths: [
      'Хорошая прочность',
      'Баланс твёрдости и гибкости',
      'Надёжное',
      'Доступное',
    ],
    weaknesses: [
      'Тяжелее берёзы',
      'Дольше обрабатывать',
      'Горит',
    ],
    bestFor: [
      'Рукояти оружия',
      'Древки',
      'Щиты',
    ],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 0 },
      { type: 'craft', requiredExpertise: 5 },
    ],
  },

  description: 'Дуб — плотное и прочное дерево, которое представляет золотую середину для боевого оружия. Прочное и надёжное, используется для рукоятей, древков, щитов и инструментов.',
  icon: '/icons/resources/wood.png',
  version: 1,
}

export default oak
