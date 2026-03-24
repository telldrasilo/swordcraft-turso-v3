/**
 * Холодное железо
 * Особый металл против магических существ
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const coldIron: MaterialNode = {
  identity: {
    id: 'cold_iron',
    name: 'Холодное железо',
    class: 'metal',
    origin: 'natural',
    tags: ['natural', 'metal', 'iron-bearing', 'anti-magic', 'rare'],
  },

  physical: {
    density: 5.2,
    hardness: 65,
    toughness: 35,
    elasticity: 35,

    meltingPoint: 1350,
    ignitionPoint: null,
    thermalConductivity: 5,

    porosity: 20,
    compressiveStrength: 50,
    tensileStrength: 25,
  },

  chemical: {
    reactivity: 30,
    stability: 50,
    corrosionResistance: 20,
    oxidationResistance: 15,
    acidity: 7,
    solubility: 5,
  },

  arcane: {
    conductivity: 10,
    affinity: 15,
    stability: 60,
    resonance: 5,
  },

  processing: {
    workability: 40,
    refineDifficulty: 50,
    purityPotential: 40,
    defectRisk: 8,
    repairability: 100,
  },

  economy: {
    rarity: 30,
    tier: 2,
    baseValue: 20,
    availability: 70,
    discoverability: 80,
  },

  summary: {
    basic: 'Особый металл с низкой магической проводимостью. Эффективен против магических существ.',
    applied: 'Используется для создания оружия для борьбы с магией и магическими существами. Сложно обрабатывать.',
    strengths: [
      'Эффективен против магии',
      'Хорошая прочность',
      'Устойчив к коррозии',
    ],
    weaknesses: [
      'Сложно обрабатывать',
      'Низкая магическая проводимость',
      'Магически нейтрален (плохо для зачарований)',
    ],
    bestFor: [
      'Оружие против магии',
      'Доспехи для магических существ',
    ],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 0 },
      { type: 'craft', requiredExpertise: 10 },
      { type: 'research', requiredExpertise: 30 },
    ],
  },

  description: 'Холодное железо — особый металл, получаемый с помощью древних технологий. Обладает уникальным свойством блокировать магическую энергию. Однако это делает его трудным в обработке и магически нейтральным (плохим для зачарований). Используется для создания оружия для борьбы с магией и магических существ.',
  icon: '/icons/resources/iron.png',
  version: 1,
}

export default coldIron
