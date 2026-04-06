/**
 * Бронза — канон для bronzeIngot / склада
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const bronze: MaterialNode = {
  identity: {
    id: 'bronze',
    name: 'Бронза',
    class: 'metal',
    origin: 'alloy',
    tags: ['refined', 'alloy', 'copper-bearing', 'tin-bearing', 'ingot'],
  },
  physical: {
    density: 8.8,
    hardness: 58,
    toughness: 50,
    elasticity: 38,
    meltingPoint: 950,
    ignitionPoint: null,
    thermalConductivity: 50,
    porosity: 6,
    compressiveStrength: 70,
    tensileStrength: 50,
  },
  chemical: {
    reactivity: 40,
    stability: 75,
    corrosionResistance: 70,
    oxidationResistance: 65,
    acidity: 7,
    solubility: 8,
  },
  arcane: {
    conductivity: 30,
    affinity: 35,
    stability: 65,
    resonance: 22,
  },
  processing: {
    workability: 65,
    refineDifficulty: 40,
    purityPotential: 70,
    defectRisk: 5,
    repairability: 90,
  },
  economy: {
    rarity: 45,
    tier: 2,
    baseValue: 28,
    availability: 70,
    discoverability: 85,
  },
  summary: {
    basic: 'Классический сплав меди и олова — твёрже чистой меди.',
    applied: 'Инструменты, украшения, средний класс оружия.',
    strengths: ['Износостойкость', 'литейность'],
    weaknesses: ['Уступает стали по твёрдости'],
    bestFor: ['Начальный и средний металл урона'],
  },
  discovery: {
    unlockedBy: [{ type: 'craft', requiredExpertise: 10 }],
  },
  description: 'Бронза после выплавки; на складе учитывается как каталожный id bronze.',
  icon: '/icons/resources/bronzeIngot.png',
  version: 1,
}

export default bronze
