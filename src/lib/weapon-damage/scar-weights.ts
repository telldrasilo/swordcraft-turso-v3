/**
 * Шрамы на экземпляре после снятия видимых тегов (SPEC §1.1): топ-3 физ. + топ-3 стих.
 */

import { ELEMENTAL_DAMAGE_TAG_TO_AXIS } from '@/data/weapon-damage/elemental-axes'
import { getPhysicalScarIdForDamageTag } from '@/data/weapon-damage/physical-damage-to-scar'

const TOP_N = 3

function cloneNumMap(m: Record<string, number> | undefined): Record<string, number> {
  return m ? { ...m } : {}
}

/** Оставить не более TOP_N ключей с наибольшим весом; при равенстве — стабильный порядок по ключу. */
export function normalizeTopScarWeights(
  weights: Record<string, number>,
  topN: number = TOP_N
): Record<string, number> {
  const entries = Object.entries(weights).filter(([, v]) => v > 0)
  if (entries.length <= topN) {
    const out: Record<string, number> = {}
    for (const [k, v] of entries) out[k] = Math.floor(v)
    return out
  }
  entries.sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1]
    return a[0].localeCompare(b[0])
  })
  const out: Record<string, number> = {}
  for (let i = 0; i < topN; i++) {
    const entry = entries[i]
    if (!entry) break
    const [k, v] = entry
    out[k] = Math.floor(v)
  }
  return out
}

export interface ScarWeightBuckets {
  physicalScarWeights: Record<string, number>
  elementalScarWeights: Record<string, number>
}

/**
 * После успешного снятия видимых тегов: +1 к соответствующему шраму, затем усечение топ-3 в каждой группе.
 */
export function incrementScarWeightsFromClearedTags(
  prevPhysical: Record<string, number> | undefined,
  prevElemental: Record<string, number> | undefined,
  clearedTagIds: string[]
): ScarWeightBuckets {
  const physical = cloneNumMap(prevPhysical)
  const elemental = cloneNumMap(prevElemental)

  for (const tagId of clearedTagIds) {
    if (tagId.startsWith('elemental_')) {
      const axis = ELEMENTAL_DAMAGE_TAG_TO_AXIS[tagId]
      if (axis) {
        elemental[axis] = (elemental[axis] ?? 0) + 1
      }
      continue
    }
    if (tagId.startsWith('physical_')) {
      const scar = getPhysicalScarIdForDamageTag(tagId)
      if (scar) {
        physical[scar] = (physical[scar] ?? 0) + 1
      }
    }
  }

  return {
    physicalScarWeights: normalizeTopScarWeights(physical),
    elementalScarWeights: normalizeTopScarWeights(elemental),
  }
}
