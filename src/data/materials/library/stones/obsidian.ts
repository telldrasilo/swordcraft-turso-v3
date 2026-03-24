/**
 * Обсидиан
 * Вулканическое стекло невероятной остроты
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const obsidian: MaterialNode = {
  identity: {
    id: 'obsidian',
    name: 'Обсидиан',
    class: 'mineral',
    origin: 'natural',
    tags: ['natural', 'stone', 'glass', 'sharp', 'volcanic'],
  },

  physical: {
    density: 4.2,
    hardness: 85,
    toughness: 1,
    elasticity: 1,

    meltingPoint: null,
    ignitionPoint: null,
    thermalConductivity: 20,

    porosity: 0,
    compressiveStrength: 40,
    tensileStrength: 1,
  },

  chemical: {
    reactivity: 5,
    stability: 70,
    corrosionResistance: 80,
    oxidationResistance: 80,
    acidity: 7,
    solubility: 5,
  },

  arcane: {
    conductivity: 20,
    affinity: 25,
    stability: 50,
    resonance: 15,
  },

  processing: {
    workability: 15,
    refineDifficulty: 60,
    purityPotential: 40,
    defectRisk: 25,
    repairability: 10,
  },

  economy: {
    rarity: 60,
    tier: 3,
    baseValue: 40,
    availability: 40,
    discoverability: 70,
  },

  summary: {
    basic: 'Вулканическое стекло невероятной остроты. Режет как бритва, но крошится от удара.',
    applied: 'Используется для создания острого оружия и магических инструментов. Очень острый, но хрупкий.',
    strengths: [
      'Потрясающая острота',
      'Высокая твёрдость',
      'Магические свойства',
      'Красивый внешний вид',
    ],
    weaknesses: [
      'Крайне хрупкий',
      'Крошится от удара',
      'Невозможно починить',
      'Требует мастерства',
    ],
    bestFor: [
      'Острое оружие',
      'Ритуальные ножи',
      'Магические инструменты',
    ],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 20 },
      { type: 'craft', requiredExpertise: 30 },
    ],
  },

  description: 'Обсидиан — вулканическое стекло невероятной остроты. Режет как бритва, но крошится от удара. Очень красивый материал с магическими свойствами. Используется для создания острого оружия и магических инструментов. Требует особого мастерства для обработки.',
  icon: '/icons/resources/stone.png',
  version: 1,
}

export default obsidian
