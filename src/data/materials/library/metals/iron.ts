/**
 * Железо
 * Надёжный металл для начинающего кузнеца
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const iron: MaterialNode = {
  identity: {
    id: 'iron',
    name: 'Железо',
    class: 'metal',
    origin: 'natural',
    tags: ['natural', 'metal', 'iron-bearing', 'magnetic', 'basic'],
  },

  physical: {
    density: 5.0,
    hardness: 50,
    toughness: 45,
    elasticity: 25,

    meltingPoint: 1200,
    ignitionPoint: null,
    thermalConductivity: 40,

    porosity: 15,
    compressiveStrength: 60,
    tensileStrength: 30,
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
    conductivity: 15,
    affinity: 20,
    stability: 60,
    resonance: 5,
  },

  processing: {
    workability: 70,
    refineDifficulty: 50,
    purityPotential: 40,
    defectRisk: 10,
    repairability: 100,
  },

  economy: {
    rarity: 25,
    tier: 1,
    baseValue: 15,
    availability: 90,
    discoverability: 100,
  },

  summary: {
    basic: 'Надёжный металл для начинающего кузнеца. Мягкий, легко обрабатывается, не ломается.',
    applied: 'Сырьё для выплавки стали и других сплавов. Широко используется в кузнечном деле.',
    strengths: [
      'Широко распространено',
      'Низкая стоимость',
      'Легко обрабатывать',
      'Не ломается',
    ],
    weaknesses: [
      'Мягкий металл',
      'Низкая твёрдость',
      'Мало магических свойств',
    ],
    bestFor: [
      'Выплавка стали',
      'Производство сплавов',
      'Базовое оружие',
    ],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 0 },
      { type: 'craft', requiredExpertise: 5 },
    ],
  },

  description: 'Железо — один из самых древних и распространённых металлов. Впервые начали использовать ещё доисторические времена. Хороший баланс между прочностью и обрабатываемостью, идеально подходит для обучения кузнецов.',
  icon: '/icons/resources/iron.png',
  version: 1,
}

export default iron
