/**
 * Обработанная древесина
 * Доски и заготовки после пиления и сушки
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const processedWood: MaterialNode = {
  identity: {
    id: 'processed_wood',
    name: 'Обработанная древесина',
    class: 'wood',
    origin: 'processed',
    tags: ['refined', 'wood', 'planks', 'construction'],
  },

  physical: {
    density: 3.2,
    hardness: 36,
    toughness: 40,
    elasticity: 40,

    meltingPoint: null,
    ignitionPoint: 260,
    thermalConductivity: 11,

    porosity: 28,
    compressiveStrength: 44,
    tensileStrength: 48,
  },

  chemical: {
    reactivity: 20,
    stability: 58,
    corrosionResistance: 48,
    oxidationResistance: 48,
    acidity: 5,
    solubility: 10,
  },

  arcane: {
    conductivity: 11,
    affinity: 16,
    stability: 48,
    resonance: 12,
  },

  processing: {
    workability: 68,
    refineDifficulty: 32,
    purityPotential: 35,
    defectRisk: 2,
    repairability: 100,
  },

  economy: {
    rarity: 22,
    tier: 1,
    baseValue: 11,
    availability: 92,
    discoverability: 96,
  },

  summary: {
    basic: 'Доски и брус после пиления — стандартный полуфабрикат под постройки и простые деревянные детали.',
    applied: 'Строительные рецепты, подгонка рукоятей из заготовок, ремонт мебели в кузнице.',
    strengths: ['Предсказуемый размер', 'Доступная цена', 'Универсальность'],
    weaknesses: ['Меньше «характера», чем у цельного бревна', 'Горит'],
    bestFor: ['Постройки', 'Простые рукояти', 'Доски на складе'],
  },

  discovery: {
    unlockedBy: [
      { type: 'craft', requiredExpertise: 3 },
    ],
  },

  description:
    'Обработанная древесина — доски и заготовки после пиления и сушки; соответствует ресурсу досок на складе и рецептам постройки.',
  icon: '/icons/resources/planks.png',
  version: 1,
}

export default processedWood
