/**
 * Мрамор
 * Плотная известковая порода с хорошей полируемостью
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const marble: MaterialNode = {
  identity: {
    id: 'marble',
    name: 'Мрамор',
    class: 'mineral',
    origin: 'natural',
    tags: ['natural', 'stone', 'crystalline', 'decorative', 'polished'],
  },

  physical: {
    density: 5.8,
    hardness: 62,
    toughness: 6,
    elasticity: 5,

    meltingPoint: null,
    ignitionPoint: null,
    thermalConductivity: 5,

    porosity: 12,
    compressiveStrength: 68,
    tensileStrength: 12,
  },

  chemical: {
    reactivity: 6,
    stability: 85,
    corrosionResistance: 80,
    oxidationResistance: 88,
    acidity: 7,
    solubility: 12,
  },

  arcane: {
    conductivity: 6,
    affinity: 10,
    stability: 62,
    resonance: 12,
  },

  processing: {
    workability: 35,
    refineDifficulty: 42,
    purityPotential: 40,
    defectRisk: 6,
    repairability: 58,
  },

  economy: {
    rarity: 42,
    tier: 2,
    baseValue: 32,
    availability: 62,
    discoverability: 78,
  },

  summary: {
    basic: 'Холодный камень с мелким зерном: хорошо полируется, ценится в декоре и представительских деталях.',
    applied: 'Навершия, подставки, контрастные вставки у молота и гарды.',
    strengths: ['Эстетика', 'Достаточная прочность', 'Ровная обработка'],
    weaknesses: ['Тяжелее дерева', 'Чувствителен к ударам по кромке'],
    bestFor: ['Декоративные элементы оружия', 'Престижные навершия'],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 0 },
      { type: 'craft', requiredExpertise: 10 },
    ],
  },

  description:
    'Мрамор — плотная известняковая порода с хорошей полируемостью; в каталоге поддерживает расход декоративных и массивных деталей.',
  icon: '/icons/resources/stone.png',
  version: 1,
}

export default marble
