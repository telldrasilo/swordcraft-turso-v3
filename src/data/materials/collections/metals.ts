/**
 * Коллекция: Металлы и сплавы
 * Групповой экспорт для кузнечного дела
 */

import type { MaterialNode } from '@/types/materials/material-core'
import { allMaterials } from '../library'

export const metalsCollection: MaterialNode[] = allMaterials.filter(
  m => m.identity.class === 'metal'
)

// Базовые металлы
export const basicMetals = metalsCollection.filter(m =>
  m.identity.origin === 'natural'
)

// Сплавы
export const alloyMetals = metalsCollection.filter(m =>
  m.identity.origin === 'alloy'
)

// По тиру
export const tier1Metals = metalsCollection.filter(m => m.economy.tier === 1)
export const tier2Metals = metalsCollection.filter(m => m.economy.tier === 2)
export const tier3Metals = metalsCollection.filter(m => m.economy.tier === 3)
export const tier4Metals = metalsCollection.filter(m => m.economy.tier === 4)
export const tier5Metals = metalsCollection.filter(m => m.economy.tier === 5)
