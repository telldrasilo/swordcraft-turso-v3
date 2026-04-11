/**
 * Медь (базовый металл каталога; волна 5+ — вынесено из bridge).
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const copper: MaterialNode = {
  identity: {
    id: 'copper',
    name: 'Медь',
    class: 'metal',
    origin: 'natural',
    tags: ['natural', 'metal', 'copper-bearing', 'basic'],
  },

  physical: {
    density: 8.9,
    hardness: 40,
    toughness: 42,
    elasticity: 32,

    meltingPoint: 1085,
    ignitionPoint: null,
    thermalConductivity: 78,

    porosity: 12,
    compressiveStrength: 52,
    tensileStrength: 28,
  },

  chemical: {
    reactivity: 55,
    stability: 48,
    corrosionResistance: 38,
    oxidationResistance: 32,
    acidity: 7,
    solubility: 8,
  },

  arcane: {
    conductivity: 28,
    affinity: 22,
    stability: 58,
    resonance: 12,
  },

  processing: {
    workability: 78,
    refineDifficulty: 42,
    purityPotential: 55,
    defectRisk: 8,
    repairability: 100,
  },

  economy: {
    rarity: 28,
    tier: 1,
    baseValue: 18,
    availability: 88,
    discoverability: 95,
  },

  summary: {
    basic:
      'Мягкий ковкий металл с отличной теплопроводностью; хорош для сплавов и обмоток, уступает железу по твёрдости.',
    applied: 'Бронза, детали теплообмена, декоративные и мелкие кузнечные работы.',
    strengths: ['Легко куётся', 'Сильная теплопроводность', 'Умеренная коррозионная устойчивость'],
    weaknesses: ['Ниже твёрдость, чем у железа', 'Проигрывает стали в износостойкости'],
    bestFor: ['Бронза', 'Инкрустации', 'Обучающие работы'],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 0 },
      { type: 'craft', requiredExpertise: 5 },
    ],
  },

  description:
    'Медь — мягкий ковкий металл, отличный проводник тепла. В кузне служит базой для бронзы и сплавов; по свойствам заметно мягче железа, но проще в обработке.',
  icon: '/icons/resources/copper.png',
  version: 1,
}

export default copper
