/**
 * Олово (базовый металл каталога; волна 5+ — вынесено из bridge).
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const tin: MaterialNode = {
  identity: {
    id: 'tin',
    name: 'Олово',
    class: 'metal',
    origin: 'natural',
    tags: ['natural', 'metal', 'tin-bearing', 'basic'],
  },

  physical: {
    density: 7.3,
    hardness: 18,
    toughness: 28,
    elasticity: 42,

    meltingPoint: 232,
    ignitionPoint: null,
    thermalConductivity: 52,

    porosity: 8,
    compressiveStrength: 35,
    tensileStrength: 18,
  },

  chemical: {
    reactivity: 42,
    stability: 55,
    corrosionResistance: 48,
    oxidationResistance: 42,
    acidity: 6,
    solubility: 6,
  },

  arcane: {
    conductivity: 18,
    affinity: 15,
    stability: 62,
    resonance: 8,
  },

  processing: {
    workability: 90,
    refineDifficulty: 35,
    purityPotential: 50,
    defectRisk: 6,
    repairability: 95,
  },

  economy: {
    rarity: 26,
    tier: 1,
    baseValue: 16,
    availability: 85,
    discoverability: 92,
  },

  summary: {
    basic:
      'Очень лёгкоплавкий мягкий металл: почти не держит режущую кромку, зато идеален как компонент бронзы и мягких соединений.',
    applied: 'Бронза, припой, простые литые формы.',
    strengths: ['Низкая температура плавления', 'Высокая податливость', 'Дружелюбен новичку в обработке'],
    weaknesses: ['Низкая твёрдость', 'Хрупкость холодного олова'],
    bestFor: ['Бронза', 'Пайка', 'Литьё простых деталей'],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 0 },
      { type: 'craft', requiredExpertise: 5 },
    ],
  },

  description:
    'Олово — классический компонент бронзы, крайне лёгкоплавкое и мягкое. В оружейном деле редко идёт основой клинка, но незаменимо в сплавах и соединительных работах.',
  icon: '/icons/resources/tinIngot.png',
  version: 1,
}

export default tin
