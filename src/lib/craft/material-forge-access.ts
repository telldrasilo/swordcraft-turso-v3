/**
 * Доступ материала к кузне v2 по экспертизе (фаза B1).
 */

import type { MaterialNode } from '@/types/materials/material-core'
import type { MaterialKnowledge } from '@/types/materials/knowledge'
import { MIN_MATERIAL_EXPERTISE_FOR_CRAFT } from '@/lib/store-utils/constants'

export function getMaterialForgeExpertise(
  materialId: string,
  knowledge: Record<string, MaterialKnowledge>
): number {
  return knowledge[materialId]?.expertise ?? 0
}

export function isMaterialUnlockedForForge(
  materialId: string,
  knowledge: Record<string, MaterialKnowledge>
): boolean {
  return getMaterialForgeExpertise(materialId, knowledge) >= MIN_MATERIAL_EXPERTISE_FOR_CRAFT
}

/** Фильтр списка кандидатов в планировщике: только материалы с достаточной экспертизой для крафта. */
export function filterForgeExpertiseMaterials(
  materials: MaterialNode[],
  knowledge: Record<string, MaterialKnowledge>
): MaterialNode[] {
  return materials.filter(m => isMaterialUnlockedForForge(m.identity.id, knowledge))
}
