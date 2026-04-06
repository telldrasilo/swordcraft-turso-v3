/**
 * Фаза 1b: приоритетные materialId для материаловедения и проверок
 * (экспедиции, стартовая энциклопедия, узлы из маппинга крафта).
 */

import { materialById } from '@/data/materials/library'
import { CRAFT_MAPPED_MATERIAL_IDS } from '@/lib/craft/inventory-check'
import { LOCATION_REGISTRY } from '@/modules/expeditions/data/locations'
import { MISSION_REGISTRY } from '@/modules/expeditions/data/missions'
import { initialEncyclopediaState } from '@/store/slices/encyclopedia-slice'

/** Уникальные id, отсортированные лексикографически. */
export function collectPhase1bPriorityMaterialIds(): string[] {
  const s = new Set<string>()
  for (const loc of LOCATION_REGISTRY) {
    for (const r of loc.resources) {
      s.add(r.materialId)
    }
  }
  for (const mission of MISSION_REGISTRY) {
    const resources = mission.resources
    if (!resources) continue
    for (const r of resources) {
      s.add(r.materialId)
    }
  }
  for (const id of Object.keys(initialEncyclopediaState.materialKnowledge)) {
    s.add(id)
  }
  for (const id of CRAFT_MAPPED_MATERIAL_IDS) {
    if (materialById[id]) s.add(id)
  }
  return [...s].sort()
}
