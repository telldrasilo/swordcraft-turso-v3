/**
 * Обработанный камень
 * Распиленные блоки стабильного размера
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const processedStone: MaterialNode = {
  identity: {
    id: 'processed_stone',
    name: 'Обработанный камень',
    class: 'mineral',
    origin: 'processed',
    tags: ['refined', 'stone', 'blocks', 'construction'],
  },

  physical: {
    density: 5.9,
    hardness: 58,
    toughness: 10,
    elasticity: 7,

    meltingPoint: null,
    ignitionPoint: null,
    thermalConductivity: 6,

    porosity: 8,
    compressiveStrength: 72,
    tensileStrength: 14,
  },

  chemical: {
    reactivity: 6,
    stability: 88,
    corrosionResistance: 85,
    oxidationResistance: 88,
    acidity: 7,
    solubility: 6,
  },

  arcane: {
    conductivity: 5,
    affinity: 6,
    stability: 58,
    resonance: 6,
  },

  processing: {
    workability: 48,
    refineDifficulty: 35,
    purityPotential: 35,
    defectRisk: 4,
    repairability: 60,
  },

  economy: {
    rarity: 28,
    tier: 2,
    baseValue: 22,
    availability: 80,
    discoverability: 88,
  },

  summary: {
    basic: 'Камень после распила и подгонки — предсказуемая геометрия для кладки и кузницы.',
    applied: 'Каменные блоки на складе, основания построек, тяжёлые детали кузницы.',
    strengths: ['Стабильный размер', 'Высокая несущая способность'],
    weaknesses: ['Масса', 'Нужен инструмент для точной подгонки'],
    bestFor: ['Строительные рецепты', 'Крупные навершия'],
  },

  discovery: {
    unlockedBy: [
      { type: 'craft', requiredExpertise: 6 },
    ],
  },

  description:
    'Обработанный камень — распиленные блоки стабильного размера; соответствует складскому ресурсу каменных блоков в игровой экономике.',
  icon: '/icons/resources/stone.png',
  version: 1,
}

export default processedStone
