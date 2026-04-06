/**
 * Медный слиток — канон для copperIngot / склада
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const copperAlloy: MaterialNode = {
  identity: {
    id: 'copper_alloy',
    name: 'Медный слиток',
    class: 'metal',
    origin: 'processed',
    tags: ['processed', 'metal', 'copper-bearing', 'ingot'],
  },
  physical: {
    density: 8.9,
    hardness: 40,
    toughness: 55,
    elasticity: 35,
    meltingPoint: 1085,
    ignitionPoint: null,
    thermalConductivity: 85,
    porosity: 8,
    compressiveStrength: 55,
    tensileStrength: 45,
  },
  chemical: {
    reactivity: 55,
    stability: 60,
    corrosionResistance: 50,
    oxidationResistance: 45,
    acidity: 6,
    solubility: 15,
  },
  arcane: {
    conductivity: 35,
    affinity: 40,
    stability: 55,
    resonance: 20,
  },
  processing: {
    workability: 80,
    refineDifficulty: 35,
    purityPotential: 75,
    defectRisk: 6,
    repairability: 95,
  },
  economy: {
    rarity: 35,
    tier: 1,
    baseValue: 12,
    availability: 85,
    discoverability: 100,
  },
  summary: {
    basic: 'Готовая медная заготовка после плавки руды.',
    applied: 'Проводящие детали, обмотки, простая фурнитура оружия.',
    strengths: ['Гибкий', 'Проводит тепло'],
    weaknesses: ['Мягкий'],
    bestFor: ['Базовые сплавы', 'обмотки'],
  },
  discovery: {
    unlockedBy: [{ type: 'harvest', requiredExpertise: 0 }],
  },
  description: 'Медь после переработки руды в форме слитка для кузницы и склада.',
  icon: '/icons/resources/copperIngot.png',
  version: 1,
}

export default copperAlloy
