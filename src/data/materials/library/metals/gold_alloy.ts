/**
 * Золотой слиток — канон для goldIngot / склада (не путать с ключом goldOre)
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const goldAlloy: MaterialNode = {
  identity: {
    id: 'gold_alloy',
    name: 'Золотой слиток',
    class: 'metal',
    origin: 'processed',
    tags: ['processed', 'metal', 'gold-bearing', 'precious', 'ingot'],
  },
  physical: {
    density: 19.3,
    hardness: 25,
    toughness: 35,
    elasticity: 30,
    meltingPoint: 1064,
    ignitionPoint: null,
    thermalConductivity: 95,
    porosity: 2,
    compressiveStrength: 50,
    tensileStrength: 40,
  },
  chemical: {
    reactivity: 15,
    stability: 95,
    corrosionResistance: 99,
    oxidationResistance: 99,
    acidity: 6,
    solubility: 2,
  },
  arcane: {
    conductivity: 70,
    affinity: 85,
    stability: 90,
    resonance: 60,
  },
  processing: {
    workability: 85,
    refineDifficulty: 20,
    purityPotential: 95,
    defectRisk: 2,
    repairability: 100,
  },
  economy: {
    rarity: 85,
    tier: 4,
    baseValue: 120,
    availability: 25,
    discoverability: 60,
  },
  summary: {
    basic: 'Драгоценный слиток после плавки золотой руды.',
    applied: 'Инкрустация, магические проводники премиум-класса.',
    strengths: ['Инертность', 'магическая проводимость'],
    weaknesses: ['Очень мягкий', 'дорогой'],
    bestFor: ['Редкие изделия', 'зачарования'],
  },
  discovery: {
    unlockedBy: [
      { type: 'special', requiredExpertise: 40 },
      { type: 'quest', requiredExpertise: 55 },
    ],
  },
  description:
    'Золото в форме слитка для учёта на складе и кузницы; мягкий материал для инкрустации и дорогих работ.',
  icon: '/icons/resources/goldIngot.png',
  version: 1,
}

export default goldAlloy
