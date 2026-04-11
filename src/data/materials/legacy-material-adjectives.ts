/**
 * Прилагательные для `adaptMaterialNodeToMaterial` — из legacy `Material` (craft-v2).
 * Металлы: строки из [`metalMaterials`](./metals.ts) (те же id, что и у [`getMetalMaterialsRuntimeMerged`](./metals-runtime-merge.ts)),
 * без импорта merge — иначе цикл **merge → adapter → этот файл → merge**.
 */

import { metalMaterials } from './metals'
import { stoneMaterials } from './stone'
import { woodMaterials, leatherMaterials } from './organic'

/** id → русский прилагательный префикс для нейминга оружия. */
export const LEGACY_MATERIAL_ADJECTIVES: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (const m of [
    ...metalMaterials,
    ...stoneMaterials,
    ...woodMaterials,
    ...leatherMaterials,
  ]) {
    if (m.adjective) map[m.id] = m.adjective
  }
  return map
})()
