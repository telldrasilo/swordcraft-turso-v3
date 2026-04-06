import type { MaterialKnowledge } from '@/types/materials/knowledge'
import { createDiscoveredMaterialKnowledge } from '@/types/materials/knowledge'
import {
  CRAFT_STARTER_KNOWLEDGE_EXPERTISE,
  CRAFT_STARTER_KNOWLEDGE_MATERIAL_IDS,
} from '@/lib/store-utils/constants'

/** §6.1 CRAFT_SYSTEM_ROADMAP: 10% на стартовый набор после туториала */
export function mergeCraftRoadmapStarterKnowledge(
  materialKnowledge: Record<string, MaterialKnowledge>
): Record<string, MaterialKnowledge> {
  const next = { ...materialKnowledge }
  const now = Date.now()
  for (const mid of CRAFT_STARTER_KNOWLEDGE_MATERIAL_IDS) {
    const cur = next[mid] ?? createDiscoveredMaterialKnowledge(mid)
    const expertise = Math.max(cur.expertise, CRAFT_STARTER_KNOWLEDGE_EXPERTISE)
    next[mid] = { ...cur, expertise, lastUsedAt: now }
  }
  return next
}
