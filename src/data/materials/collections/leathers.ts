/**
 * Коллекция: Кожа
 * Групповой экспорт для кожевенного дела
 */

import type { MaterialNode } from '@/types/materials/material-core'
import {
  rawLeather,
  tannedLeather,
  bullLeather,
  dragonLeather,
} from '../library'

export const leathersCollection: MaterialNode[] = [
  rawLeather,
  tannedLeather,
  bullLeather,
  dragonLeather,
]

// Базовые кожи
export const basicLeathers = leathersCollection.filter(m => 
  m.identity.origin === 'natural'
)

// Обработанные кожи
export const refinedLeathers = leathersCollection.filter(m => 
  m.identity.origin === 'refined'
)

// По тиру
export const tier1Leathers = leathersCollection.filter(m => m.economy.tier === 1)
export const tier2Leathers = leathersCollection.filter(m => m.economy.tier === 2)
export const tier5Leathers = leathersCollection.filter(m => m.economy.tier === 5)
