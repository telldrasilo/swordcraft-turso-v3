/**
 * Ёмкость параллельных сессий изучения от прогрессии зданий (CRAFT_SYSTEM_ROADMAP §6.3).
 */

import type { ProductionBuilding } from '@/store/slices/workers-slice'
import {
  MATERIAL_STUDY_BASE_SLOTS,
  MATERIAL_STUDY_BUILDING_LEVELS_PER_EXTRA_SLOT,
  MATERIAL_STUDY_MAX_CONCURRENT_SLOTS,
} from '@/lib/store-utils/constants'

export function sumUnlockedBuildingLevels(buildings: ProductionBuilding[]): number {
  return buildings.filter(b => b.unlocked).reduce((s, b) => s + b.level, 0)
}

export function computeMaterialStudySlotCapacity(buildings: ProductionBuilding[]): number {
  const sum = sumUnlockedBuildingLevels(buildings)
  const extra = Math.floor(sum / MATERIAL_STUDY_BUILDING_LEVELS_PER_EXTRA_SLOT)
  return Math.min(MATERIAL_STUDY_MAX_CONCURRENT_SLOTS, MATERIAL_STUDY_BASE_SLOTS + extra)
}
