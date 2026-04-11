import type { ReforgeTechniqueEntry } from '@/data/reforge/reforge-techniques-registry'
import type { MaterialStashDebit } from '@/store/contracts/material-stash-a2-draft'

/** Списание склада по **catalogMaterialSpendIds** (по 1 ед. на id, пока нет количеств в данных). */
export function buildReforgeCatalogMaterialDebit(technique: ReforgeTechniqueEntry): MaterialStashDebit {
  const out: Record<string, number> = {}
  for (const raw of technique.catalogMaterialSpendIds ?? []) {
    const id = raw.trim()
    if (!id) continue
    out[id] = (out[id] ?? 0) + 1
  }
  return out
}
