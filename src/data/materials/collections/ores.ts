/**
 * Коллекция: Руды
 * Групповой экспорт для добычи
 */

import type { MaterialNode } from '@/types/materials/material-core'
import { allMaterials } from '../library'

export const oresCollection: MaterialNode[] = allMaterials.filter(
  m => m.identity.class === 'mineral' && m.identity.tags.includes('ore')
)

// Руды для металлов
export const metalOres = oresCollection.filter(m =>
  m.identity.tags.includes('iron-bearing') ||
  m.identity.tags.includes('copper-bearing') ||
  m.identity.tags.includes('tin-bearing') ||
  m.identity.tags.includes('silver-bearing') ||
  m.identity.tags.includes('gold-bearing') ||
  m.identity.tags.includes('mithril-bearing')
)

// По тиру
export const tier1Ores = oresCollection.filter(m => m.economy.tier === 1)
export const tier2Ores = oresCollection.filter(m => m.economy.tier === 2)
export const tier3Ores = oresCollection.filter(m => m.economy.tier === 3)
