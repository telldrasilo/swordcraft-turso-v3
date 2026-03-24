/**
 * Кровавик
 * Тёмно-красный камень с мистическими свойствами
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const bloodstone: MaterialNode = {
  identity: {
    id: 'bloodstone',
    name: 'Кровавик',
    class: 'mineral',
    origin: 'natural',
    tags: ['natural', 'stone', 'magical', 'blood-magic', 'rare'],
  },

  physical: {
    density: 5.0,
    hardness: 55,
    toughness: 8,
    elasticity: 8,

    meltingPoint: null,
    ignitionPoint: null,
    thermalConductivity: 50,

    porosity: 15,
    compressiveStrength: 55,
    tensileStrength: 15,
  },

  chemical: {
    reactivity: 20,
    stability: 60,
    corrosionResistance: 70,
    oxidationResistance: 70,
    acidity: 6,
    solubility: 10,
  },

  arcane: {
    conductivity: 50,
    affinity: 60,
    stability: 50,
    resonance: 40,
  },

  processing: {
    workability: 40,
    refineDifficulty: 50,
    purityPotential: 50,
    defectRisk: 10,
    repairability: 80,
  },

  economy: {
    rarity: 70,
    tier: 3,
    baseValue: 50,
    availability: 30,
    discoverability: 60,
  },

  summary: {
    basic: 'Тёмно-красный камень с мистическими свойствами. Проводит магию крови.',
    applied: 'Используется для создания магического оружия, ритуальных инструментов и артефактов крови. Редкий и опасный материал.',
    strengths: [
      'Хорошая проводимость магии',
      'Магические свойства',
      'Красивый внешний вид',
      'Ритуальные применения',
    ],
    weaknesses: [
      'Низкая твёрдость',
      'Опасный в обращении',
      'Редкий',
    ],
    bestFor: [
      'Магическое оружие',
      'Ритуальные инструменты',
      'Артефакты крови',
    ],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 30 },
      { type: 'craft', requiredExpertise: 40 },
      { type: 'special', requiredExpertise: 50 },
    ],
  },

  description: 'Кровавик — тёмно-красный камень с мистическими свойствами. Проводит магию крови и используется для создания магического оружия и ритуальных инструментов. Редкий и опасный материал, который требует особого мастерства для обработки.',
  icon: '/icons/resources/stone.png',
  version: 1,
}

export default bloodstone
