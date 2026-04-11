/**
 * Квестовые артефакты «Эхо забытой кузни» (фаза III алтаря).
 * Не расходуются при старте фазы; отображаются на складе с редкостью «уникальный».
 */

import type { MaterialNode } from '@/types/materials/material-core'

const arcaneRelicBase: Pick<
  MaterialNode,
  'physical' | 'chemical' | 'arcane' | 'processing' | 'version'
> = {
  physical: {
    density: 4.0,
    hardness: 40,
    toughness: 35,
    elasticity: 20,
    meltingPoint: null,
    ignitionPoint: null,
    thermalConductivity: 18,
    porosity: 8,
    compressiveStrength: 45,
    tensileStrength: 30,
  },
  chemical: {
    reactivity: 22,
    stability: 78,
    corrosionResistance: 55,
    oxidationResistance: 50,
    acidity: 4,
    solubility: 6,
  },
  arcane: {
    conductivity: 72,
    affinity: 85,
    stability: 62,
    resonance: 88,
  },
  processing: {
    workability: 15,
    refineDifficulty: 95,
    purityPotential: 70,
    defectRisk: 40,
    repairability: 25,
  },
  version: 1,
}

function questArtifact(
  spec: Pick<MaterialNode, 'identity' | 'economy' | 'summary' | 'discovery' | 'description' | 'icon'>
): MaterialNode {
  return { ...arcaneRelicBase, ...spec }
}

export const resonatorMatrix: MaterialNode = questArtifact({
  identity: {
    id: 'resonator_matrix',
    name: 'Резонаторная матрица',
    class: 'other',
    origin: 'composite',
    tags: ['quest', 'forgotten_forge', 'altar', 'artifact', 'arcane'],
  },
  economy: {
    rarity: 205,
    tier: 4,
    baseValue: 0,
    availability: 0,
    discoverability: 0,
  },
  summary: {
    basic: 'Кристаллическая решётка, собирающая и выравнивающая магический резонанс.',
    applied: 'Ключевой узел алтаря зачарований в линии забытой кузни.',
    strengths: ['Высокая резонансная стабильность'],
    weaknesses: ['Требует точной настройки и чистой среды'],
    bestFor: ['Настройка алтаря', 'Связь с кузней'],
  },
  discovery: {
    unlockedBy: [{ type: 'research', requiredExpertise: 0 }],
  },
  description:
    'Артефакт из цепочки «Эхо забытой кузни»: хранится на складе и нужен для фазы III строительства алтаря.',
  icon: '🔷',
})

export const focusingChalice: MaterialNode = questArtifact({
  identity: {
    id: 'focusing_chalice',
    name: 'Фокусирующая чаша',
    class: 'other',
    origin: 'composite',
    tags: ['quest', 'forgotten_forge', 'altar', 'artifact', 'arcane'],
  },
  economy: {
    rarity: 206,
    tier: 4,
    baseValue: 0,
    availability: 0,
    discoverability: 0,
  },
  summary: {
    basic: 'Сосуд, собирающий и направляющий поток энергии в узкий канал.',
    applied: 'Используется при сборке алтаря для стабилизации потоков.',
    strengths: ['Фокусировка магической энергии'],
    weaknesses: ['Хрупкость при резких перегрузках'],
    bestFor: ['Фокус узла алтаря'],
  },
  discovery: {
    unlockedBy: [{ type: 'research', requiredExpertise: 0 }],
  },
  description:
    'Квестовый артефакт архивариуса: фокусирующая чаша для обрядовой части алтаря.',
  icon: '🏆',
})

export const lunarTuningFork: MaterialNode = questArtifact({
  identity: {
    id: 'lunar_tuning_fork',
    name: 'Лунный камертон',
    class: 'other',
    origin: 'composite',
    tags: ['quest', 'forgotten_forge', 'altar', 'artifact', 'arcane'],
  },
  economy: {
    rarity: 207,
    tier: 4,
    baseValue: 0,
    availability: 0,
    discoverability: 0,
  },
  summary: {
    basic: 'Инструмент точной подстройки под лунные фазы и ночной резонанс.',
    applied: 'Завершает триаду артефактов для настройки алтаря.',
    strengths: ['Точная подстройка резонанса'],
    weaknesses: ['Зависимость от внешних циклов'],
    bestFor: ['Финальная настройка алтаря'],
  },
  discovery: {
    unlockedBy: [{ type: 'research', requiredExpertise: 0 }],
  },
  description: 'Лунный камертон из задания «Эхо забытой кузни» — настройка резонанса алтаря.',
  icon: '🌙',
})

export const forgottenForgeQuestArtifactNodes: MaterialNode[] = [
  resonatorMatrix,
  focusingChalice,
  lunarTuningFork,
]
