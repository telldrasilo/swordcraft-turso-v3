/**
 * Полевой камень
 * Обычный камень, найденный повсюду
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const fieldstone: MaterialNode = {
  identity: {
    id: 'fieldstone',
    name: 'Полевой камень',
    class: 'mineral',
    origin: 'natural',
    tags: ['natural', 'stone', 'common', 'heavy', 'basic'],
  },

  physical: {
    density: 5.5,
    hardness: 40,
    toughness: 5,
    elasticity: 5,

    meltingPoint: null,
    ignitionPoint: null,
    thermalConductivity: 5,

    porosity: 30,
    compressiveStrength: 40,
    tensileStrength: 5,
  },

  chemical: {
    reactivity: 10,
    stability: 70,
    corrosionResistance: 60,
    oxidationResistance: 70,
    acidity: 7,
    solubility: 5,
  },

  arcane: {
    conductivity: 5,
    affinity: 5,
    stability: 50,
    resonance: 5,
  },

  processing: {
    workability: 35,
    refineDifficulty: 20,
    purityPotential: 20,
    defectRisk: 5,
    repairability: 40,
  },

  economy: {
    rarity: 5,
    tier: 1,
    baseValue: 5,
    availability: 100,
    discoverability: 100,
  },

  summary: {
    basic: 'Обычный камень, найденный повсюду. Тяжёлый, непритязательный.',
    applied: 'Используется для строительных работ, фундаментов, простых наверший и грубых инструментов.',
    strengths: [
      'Очень распространён',
      'Дешёвый',
      'Устойчив к огню',
      'Хорошая теплоизоляция',
    ],
    weaknesses: [
      'Низкая твёрдость',
      'Тяжёлый',
      'Хрупкий',
      'Плохо держит форму',
    ],
    bestFor: [
      'Строительство',
      'Навершия',
      'Грубые инструменты',
    ],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 0 },
    ],
  },

  description: 'Полевой камень — самый обычный камень, который можно найти повсюду. Тяжёлый и непритязательный, но дешёвый и доступный. Используется для строительных работ, фундаментов и простых наверший. Не требует особого мастерства для добычи и обработки.',
  icon: '/icons/resources/stone.png',
  version: 1,
}

export default fieldstone
