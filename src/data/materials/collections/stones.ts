/**
 * Коллекция: Камни
 * Групповой экспорт для обработки камня
 */

import type { MaterialNode } from '@/types/materials/material-core'
import {
  fieldstone,
  flint,
  granite,
  obsidian,
  bloodstone,
} from '../library'

export const stonesCollection: MaterialNode[] = [
  fieldstone,
  flint,
  granite,
  obsidian,
  bloodstone,
]

// Обычные камни
export const commonStones = stonesCollection.filter(m => 
  m.economy.tier <= 2
)

// Редкие камни
export const rareStones = stonesCollection.filter(m => 
  m.economy.tier >= 3
)

// Магические камни
export const magicalStones = stonesCollection.filter(m => 
  m.arcane.conductivity >= 30
)
