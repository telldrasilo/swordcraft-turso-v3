/**
 * Высокоуглеродистая сталь
 * Сталь с высоким содержанием углерода
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const highCarbonSteel: MaterialNode = {
  identity: {
    id: 'high_carbon_steel',
    name: 'Высокоуглеродистая сталь',
    class: 'metal',
    origin: 'alloy',
    tags: ['refined', 'alloy', 'iron-bearing', 'carbon', 'sharp'],
  },

  physical: {
    density: 4.7,
    hardness: 85,
    toughness: 40,
    elasticity: 20,

    meltingPoint: 1450,
    ignitionPoint: null,
    thermalConductivity: 40,

    porosity: 8,
    compressiveStrength: 70,
    tensileStrength: 45,
  },

  chemical: {
    reactivity: 25,
    stability: 55,
    corrosionResistance: 30,
    oxidationResistance: 25,
    acidity: 7,
    solubility: 5,
  },

  arcane: {
    conductivity: 15,
    affinity: 20,
    stability: 60,
    resonance: 10,
  },

  processing: {
    workability: 35,
    refineDifficulty: 70,
    purityPotential: 70,
    defectRisk: 12,
    repairability: 80,
  },

  economy: {
    rarity: 70,
    tier: 3,
    baseValue: 50,
    availability: 40,
    discoverability: 80,
  },

  summary: {
    basic: 'Сталь с высоким содержанием углерода. Очень острая, но хрупкая — требует осторожности.',
    applied: 'Используется для создания острого оружия, которое быстро портится. Нужна для опытных кузнецов.',
    strengths: [
      'Очень острая',
      'Высокая твёрдость',
      'Прочная при правильной закалке',
    ],
    weaknesses: [
      'Хрупкая',
      'Быстро портится',
      'Сложно обрабатывать',
    ],
    bestFor: [
      'Острое оружие',
      'Топоры для стрел',
      'Лезвии для мечей',
    ],
  },

  discovery: {
    unlockedBy: [
      { type: 'craft', requiredExpertise: 15 },
      { type: 'research', requiredExpertise: 40 },
      { type: 'special', requiredExpertise: 50 },
    ],
  },

  recipe: {
    process: 'alloying',
    inputs: [
      { materialId: 'iron', quantity: 2, fraction: 0.98 },
      { materialId: 'coal', quantity: 3, fraction: 0.02 },
    ],
    processModifiers: {
      temperature: 1450,
      duration: 400,
      qualityImpact: 1.2,
    },
    yield: 0.9,
  },

  description: 'Высокоуглеродистая сталь — сплав железа с большим количеством углерода. Очень острая и твёрдая, но хрупкая — при ударе по камню может расколоться. Используется для создания лезвий мечей и наконечников стрел, где важна острота, но не прочность. Требует особой техники закалки.',
  icon: '/icons/resources/steelIngot.png',
  version: 1,
}

export default highCarbonSteel
