/**
 * Базовый камень
 * Необработанные куски породы для строительства и грубой обработки
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const basicStone: MaterialNode = {
  identity: {
    id: 'basic_stone',
    name: 'Базовый камень',
    class: 'mineral',
    origin: 'natural',
    tags: ['natural', 'stone', 'basic', 'rough', 'construction'],
  },

  physical: {
    density: 5.6,
    hardness: 52,
    toughness: 8,
    elasticity: 6,

    meltingPoint: null,
    ignitionPoint: null,
    thermalConductivity: 6,

    porosity: 25,
    compressiveStrength: 52,
    tensileStrength: 8,
  },

  chemical: {
    reactivity: 8,
    stability: 78,
    corrosionResistance: 72,
    oxidationResistance: 78,
    acidity: 7,
    solubility: 6,
  },

  arcane: {
    conductivity: 5,
    affinity: 6,
    stability: 55,
    resonance: 5,
  },

  processing: {
    workability: 42,
    refineDifficulty: 28,
    purityPotential: 28,
    defectRisk: 5,
    repairability: 55,
  },

  economy: {
    rarity: 22,
    tier: 1,
    baseValue: 12,
    availability: 92,
    discoverability: 95,
  },

  summary: {
    basic: 'Оголённая порода без тонкой обработки: массивна, дешёва, подходит для зачёски и набросков.',
    applied: 'Стройка, насыпи, грубые блоки до распила.',
    strengths: ['Доступность', 'Хорошая сжимаемость под нагрузкой'],
    weaknesses: ['Неровная форма', 'Средняя обрабатываемость'],
    bestFor: ['Заготовки под блоки', 'Дешёвые навершия'],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 0 },
      { type: 'craft', requiredExpertise: 4 },
    ],
  },

  description:
    'Базовый камень — необработанные куски породы для строительства и грубой обработки; канонический узел для ключа камня в кузне.',
  icon: '/icons/resources/stone.png',
  version: 1,
}

export default basicStone
