/**
 * Коллекция: Руды
 * Групповой экспорт для добычи
 */

import type { MaterialNode } from '@/types/materials/material-core'
import {
  ironOre,
  copperOre,
  tinOre,
} from '../library'

export const oresCollection: MaterialNode[] = [
  ironOre,
  copperOre,
  tinOre,
]

// Руды для металлов
export const metalOres = oresCollection.filter(m => 
  m.identity.tags.includes('iron-bearing') || 
  m.identity.tags.includes('copper-bearing') || 
  m.identity.tags.includes('tin-bearing')
)

// По тиру
export const tier1Ores = oresCollection.filter(m => m.economy.tier === 1)
export const tier2Ores = oresCollection.filter(m => m.economy.tier === 2)
