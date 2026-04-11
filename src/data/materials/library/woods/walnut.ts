/**
 * Орех
 * Плотная древесина с выразительным рисунком волокон
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const walnut: MaterialNode = {
  identity: {
    id: 'walnut',
    name: 'Орех',
    class: 'wood',
    origin: 'natural',
    tags: ['natural', 'wood', 'dense', 'premium', 'figured'],
  },

  physical: {
    density: 3.9,
    hardness: 44,
    toughness: 48,
    elasticity: 42,

    meltingPoint: null,
    ignitionPoint: 285,
    thermalConductivity: 11,

    porosity: 26,
    compressiveStrength: 54,
    tensileStrength: 56,
  },

  chemical: {
    reactivity: 18,
    stability: 62,
    corrosionResistance: 52,
    oxidationResistance: 52,
    acidity: 5,
    solubility: 8,
  },

  arcane: {
    conductivity: 12,
    affinity: 22,
    stability: 52,
    resonance: 18,
  },

  processing: {
    workability: 62,
    refineDifficulty: 44,
    purityPotential: 45,
    defectRisk: 3,
    repairability: 100,
  },

  economy: {
    rarity: 40,
    tier: 2,
    baseValue: 22,
    availability: 72,
    discoverability: 82,
  },

  summary: {
    basic: 'Плотная древесина с узором — ценится за стабильность формы и аккуратный внешний вид.',
    applied: 'Премиальные рукояти, навершия, детали с акцентом на тактильность.',
    strengths: ['Стабильность', 'Презентабельный рисунок', 'Хороший баланс жёсткости'],
    weaknesses: ['Дороже клёна', 'Горит', 'Требует аккуратной сушки'],
    bestFor: ['Премиальные рукояти', 'Навершия', 'Подарочное оружие'],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 0 },
      { type: 'craft', requiredExpertise: 8 },
    ],
  },

  description:
    'Орех — плотная древесина с характерным рисунком волокон; применяется там, где нужна стабильность формы и аккуратный внешний вид.',
  icon: '/icons/resources/wood.png',
  version: 1,
}

export default walnut
