/**
 * Серебряный сплав
 * Сплав с серебром для борьбы с нечистью
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const silverAlloy: MaterialNode = {
  identity: {
    id: 'silver_alloy',
    name: 'Серебряный сплав',
    class: 'metal',
    origin: 'alloy',
    tags: ['refined', 'alloy', 'silver-bearing', 'magical', 'holy'],
  },

  physical: {
    density: 5.8,
    hardness: 48,
    toughness: 50,
    elasticity: 50,

    meltingPoint: 1000,
    ignitionPoint: null,
    thermalConductivity: 70,

    porosity: 5,
    compressiveStrength: 65,
    tensileStrength: 55,
  },

  chemical: {
    reactivity: 30,
    stability: 70,
    corrosionResistance: 80,
    oxidationResistance: 90,
    acidity: 7,
    solubility: 10,
  },

  arcane: {
    conductivity: 50,
    affinity: 60,
    stability: 75,
    resonance: 30,
  },

  processing: {
    workability: 55,
    refineDifficulty: 40,
    purityPotential: 75,
    defectRisk: 3,
    repairability: 100,
  },

  economy: {
    rarity: 70,
    tier: 3,
    baseValue: 45,
    availability: 50,
    discoverability: 80,
  },

  summary: {
    basic: 'Сплав серебра с другими металлами для борьбы с нечистью. Высокая проводимость, но мягче стали.',
    applied: 'Используется для создания зачарованных вещей, доспехов против магических существ и магического оружия. Хорошо проводит магию, но мягче стали.',
    strengths: [
      'Высокая магическая проводимость',
      'Хорошая прочность',
      'Устойчив к коррозии',
      'Магическое родство',
    ],
    weaknesses: [
      'Мягкий металл',
      'Дорогой',
      'Низкая твёрдость',
    ],
    bestFor: [
      'Зачарования',
      'Магические доспехи',
      'Магическое оружие',
    ],
  },

  discovery: {
    unlockedBy: [
      { type: 'craft', requiredExpertise: 20 },
      { type: 'research', requiredExpertise: 50 },
    ],
  },

  recipe: {
    process: 'alloying',
    inputs: [
      { materialId: 'iron', quantity: 1, fraction: 0.8 },
      { materialId: 'silver_ore', quantity: 2, fraction: 0.2 },
    ],
    processModifiers: {
      temperature: 1000,
      duration: 300,
      qualityImpact: 1.1,
    },
    yield: 1.0,
  },

  description: 'Серебряный сплав — комбинация серебра с другими металлами для получения мягкого, но магически сильного материала. Имеет высокую проводимость магии, но мягче стали. Используется для создания зачарованных вещей, доспехов против магических существ и магического оружия.',
  icon: '/icons/resources/silverIngot.png',
  version: 1,
}

export default silverAlloy
