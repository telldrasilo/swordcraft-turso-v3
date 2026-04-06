/**
 * Мифриловый слиток
 * Каноническая стадия для склада (mithrilIngot); абстрактный `mithril` в кузне не выбирается как целевая часть.
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const mithrilAlloy: MaterialNode = {
  identity: {
    id: 'mithril_alloy',
    name: 'Мифриловый слиток',
    class: 'metal',
    origin: 'processed',
    tags: ['processed', 'metal', 'legendary', 'lightweight', 'magical', 'ingot'],
  },

  physical: {
    density: 2.5,
    hardness: 88,
    toughness: 75,
    elasticity: 75,

    meltingPoint: 2500,
    ignitionPoint: null,
    thermalConductivity: 90,

    porosity: 5,
    compressiveStrength: 95,
    tensileStrength: 90,
  },

  chemical: {
    reactivity: 10,
    stability: 90,
    corrosionResistance: 100,
    oxidationResistance: 100,
    acidity: 7,
    solubility: 5,
  },

  arcane: {
    conductivity: 90,
    affinity: 95,
    stability: 90,
    resonance: 80,
  },

  processing: {
    workability: 25,
    refineDifficulty: 90,
    purityPotential: 90,
    defectRisk: 15,
    repairability: 100,
  },

  economy: {
    rarity: 95,
    tier: 5,
    baseValue: 200,
    availability: 5,
    discoverability: 20,
  },

  summary: {
    basic: 'Выплавленный мифрил — легендарный лёгкий металл для высшего оружия.',
    applied: 'Используется для клинков и деталей, требующих магической проводимости и прочности.',
    strengths: ['Легендарная прочность', 'Очень лёгкий', 'Магические свойства'],
    weaknesses: ['Крайне редкий', 'Сложно обрабатывать', 'Очень дорогой'],
    bestFor: ['Легендарное оружие', 'Магические артефакты'],
  },

  discovery: {
    unlockedBy: [
      { type: 'special', requiredExpertise: 80 },
      { type: 'quest', requiredExpertise: 100 },
    ],
  },

  description:
    'Слиток мифрила после плавки — форма, в которой металл хранится на складе и идёт в кузницу.',
  icon: '/icons/resources/mithrilIngot.png',
  version: 1,
}

export default mithrilAlloy
