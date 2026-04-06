/**
 * Железный слиток
 * Каноническая стадия для кузницы и склада (ironIngot); см. inventory-check, RESOURCE_TRANSFORMATION_MAP.
 */

import type { MaterialNode } from '@/types/materials/material-core'

export const ironAlloy: MaterialNode = {
  identity: {
    id: 'iron_alloy',
    name: 'Железный слиток',
    class: 'metal',
    origin: 'processed',
    tags: ['processed', 'metal', 'iron-bearing', 'magnetic', 'ingot', 'basic'],
  },

  physical: {
    density: 5.0,
    hardness: 50,
    toughness: 45,
    elasticity: 25,

    meltingPoint: 1200,
    ignitionPoint: null,
    thermalConductivity: 40,

    porosity: 15,
    compressiveStrength: 60,
    tensileStrength: 30,
  },

  chemical: {
    reactivity: 45,
    stability: 50,
    corrosionResistance: 20,
    oxidationResistance: 15,
    acidity: 7,
    solubility: 5,
  },

  arcane: {
    conductivity: 15,
    affinity: 20,
    stability: 60,
    resonance: 5,
  },

  processing: {
    workability: 70,
    refineDifficulty: 50,
    purityPotential: 40,
    defectRisk: 10,
    repairability: 100,
  },

  economy: {
    rarity: 25,
    tier: 1,
    baseValue: 15,
    availability: 90,
    discoverability: 100,
  },

  summary: {
    basic: 'Готовое к ковке железо после плавки. Надёжный материал для начинающего кузнеца.',
    applied: 'Основа простых клинков, гард и наверший. Широко используется в кузнечном деле.',
    strengths: ['Широко распространено', 'Низкая стоимость', 'Легко обрабатывать', 'Не ломается'],
    weaknesses: ['Мягкий металл', 'Низкая твёрдость', 'Мало магических свойств'],
    bestFor: ['Базовое оружие', 'Обучение', 'Ремонтные заготовки'],
  },

  discovery: {
    unlockedBy: [
      { type: 'harvest', requiredExpertise: 0 },
      { type: 'craft', requiredExpertise: 5 },
    ],
  },

  description:
    'Слиток железа после переработки руды — та форма, в которой металл приходит в кузницу и списывается со склада.',
  icon: '/icons/resources/iron.png',
  version: 1,
}

export default ironAlloy
