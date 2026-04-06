/**
 * Оловянный слиток — канон для tinIngot / склада
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const tinAlloy: MaterialNode = {
  identity: {
    id: 'tin_alloy',
    name: 'Оловянный слиток',
    class: 'metal',
    origin: 'processed',
    tags: ['processed', 'metal', 'tin-bearing', 'ingot'],
  },
  physical: {
    density: 7.3,
    hardness: 35,
    toughness: 30,
    elasticity: 40,
    meltingPoint: 232,
    ignitionPoint: null,
    thermalConductivity: 35,
    porosity: 10,
    compressiveStrength: 40,
    tensileStrength: 35,
  },
  chemical: {
    reactivity: 40,
    stability: 70,
    corrosionResistance: 85,
    oxidationResistance: 70,
    acidity: 6,
    solubility: 8,
  },
  arcane: {
    conductivity: 25,
    affinity: 30,
    stability: 60,
    resonance: 15,
  },
  processing: {
    workability: 90,
    refineDifficulty: 25,
    purityPotential: 80,
    defectRisk: 4,
    repairability: 90,
  },
  economy: {
    rarity: 40,
    tier: 1,
    baseValue: 14,
    availability: 80,
    discoverability: 95,
  },
  summary: {
    basic: 'Мягкий металл в виде слитка после плавки.',
    applied: 'Лужение, бронза, декоративные элементы.',
    strengths: ['Коррозионная стойкость', 'лёгкий плав'],
    weaknesses: ['Низкая твёрдость'],
    bestFor: ['Сплавы', 'покрытия'],
  },
  discovery: {
    unlockedBy: [{ type: 'harvest', requiredExpertise: 0 }],
  },
  description:
    'Олово после переработки руды — учёт на складе кузницы; база для бронзы и лужения.',
  icon: '/icons/resources/tinIngot.png',
  version: 1,
}

export default tinAlloy
