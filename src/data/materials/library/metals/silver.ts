/**
 * Серебро (базовый металл каталога; волна 5+ — вынесено из bridge).
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const silver: MaterialNode = {
  identity: {
    id: 'silver',
    name: 'Серебро',
    class: 'metal',
    origin: 'natural',
    tags: ['natural', 'metal', 'silver-bearing', 'precious'],
  },

  physical: {
    density: 10.5,
    hardness: 32,
    toughness: 38,
    elasticity: 36,

    meltingPoint: 962,
    ignitionPoint: null,
    thermalConductivity: 88,

    porosity: 6,
    compressiveStrength: 48,
    tensileStrength: 26,
  },

  chemical: {
    reactivity: 35,
    stability: 62,
    corrosionResistance: 55,
    oxidationResistance: 48,
    acidity: 5,
    solubility: 5,
  },

  arcane: {
    conductivity: 48,
    affinity: 44,
    stability: 55,
    resonance: 38,
  },

  processing: {
    workability: 72,
    refineDifficulty: 48,
    purityPotential: 68,
    defectRisk: 12,
    repairability: 100,
  },

  economy: {
    rarity: 52,
    tier: 2,
    baseValue: 58,
    availability: 52,
    discoverability: 68,
  },

  summary: {
    basic:
      'Драгоценный металл с высокой теплопроводностью и выраженным магическим «блеском» в шкале арканы — мягче меди, ценится в инкрустациях.',
    applied: 'Инкрустации, драгоценные сплавы, обходные магические детали.',
    strengths: ['Сильная теплопроводность', 'Хорошие арканические показатели', 'Благородный внешний вид'],
    weaknesses: ['Низкая твёрдость', 'Дороговизна'],
    bestFor: ['Инкрустации', 'Серебряные сплавы', 'Престижные украшения'],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 0 },
      { type: 'craft', requiredExpertise: 12 },
    ],
  },

  description:
    'Светлый драгоценный металл: мягкий, блестящий, отлично проводит тепло. В лоре кузницы часто связывают с лунной и чистящей символикой; для клинка годится разве что как накладки и инкрустации.',
  icon: '/icons/resources/silverIngot.png',
  version: 1,
}

export default silver
