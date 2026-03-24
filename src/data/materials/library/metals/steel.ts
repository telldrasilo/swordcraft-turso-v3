/**
 * Сталь
 * Сплав железа с углеродом
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const steel: MaterialNode = {
  identity: {
    id: 'steel',
    name: 'Сталь',
    class: 'metal',
    origin: 'alloy',
    tags: ['refined', 'alloy', 'iron-bearing', 'carbon', 'versatile'],
  },

  physical: {
    density: 4.6,
    hardness: 72,
    toughness: 45,
    elasticity: 30,

    meltingPoint: 1400,
    ignitionPoint: null,
    thermalConductivity: 50,

    porosity: 10,
    compressiveStrength: 75,
    tensileStrength: 50,
  },

  chemical: {
    reactivity: 30,
    stability: 60,
    corrosionResistance: 40,
    oxidationResistance: 35,
    acidity: 7,
    solubility: 5,
  },

  arcane: {
    conductivity: 20,
    affinity: 25,
    stability: 65,
    resonance: 10,
  },

  processing: {
    workability: 45,
    refineDifficulty: 50,
    purityPotential: 60,
    defectRisk: 5,
    repairability: 100,
  },

  economy: {
    rarity: 50,
    tier: 2,
    baseValue: 30,
    availability: 70,
    discoverability: 90,
  },

  summary: {
    basic: 'Сплав железа с углеродом. Твёрже железа, но требует мастерства и времени.',
    applied: 'Используется для создания оружия, инструментов и доспехов. Широко применяется в кузнечном деле.',
    strengths: [
      'Высокая твёрдость',
      'Хорошая прочность',
      'Устойчив к коррозии',
      'Универсальность',
    ],
    weaknesses: [
      'Требует мастерства',
      'Долго обрабатывать',
      'Хрупкий (может треснуться)',
    ],
    bestFor: [
      'Оружие высокого качества',
      'Доспехи',
      'Инструменты',
    ],
  },

  discovery: {
    unlockedBy: [
      { type: 'craft', requiredExpertise: 5 },
      { type: 'research', requiredExpertise: 20 },
    ],
  },

  recipe: {
    process: 'alloying',
    inputs: [
      { materialId: 'iron', quantity: 2, fraction: 0.9 },
      { materialId: 'coal', quantity: 1, fraction: 0.1 },
    ],
    processModifiers: {
      temperature: 1400,
      duration: 300,
      qualityImpact: 1.1,
    },
    yield: 1.0,
  },

  description: 'Сталь — один из самых важных материалов в человеческой истории. Сплав железа с углеродом. Твёрже и прочнее чистого железа, но требует мастерства и правильной термообработки. Стали разных марок имеют разные свойства: от мягкой инструментальной до твёрдой пружинной.',
  icon: '/icons/resources/steelIngot.png',
  version: 1,
}

export default steel
