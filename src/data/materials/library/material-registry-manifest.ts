/**
 * Единая сборка каталога MaterialNode (пакеты 1.1–1.3 roadmap).
 * Сегменты: см. `material-registry-core.ts`, `material-registry-satellites.ts`.
 */

import { registryCoreMaterialNodes } from './material-registry-core'
import { registrySatelliteMaterialNodes } from './material-registry-satellites'
import type { MaterialNode } from '@/types/materials/material-core'

export {
  allLeathers,
  allMetals,
  allOres,
  allStones,
  allWoods,
} from './material-registry-core'
export {
  registryQuestMaterialNodes,
  registrySatelliteMaterialNodes,
  registryWorldMaterialNodes,
} from './material-registry-satellites'

/** Полный реестр узлов материалов для ENC, контракта и склада по `materialId`. */
export const allMaterials: MaterialNode[] = [
  ...registryCoreMaterialNodes,
  ...registrySatelliteMaterialNodes,
]

export const materialById = Object.fromEntries(allMaterials.map((m) => [m.identity.id, m])) as Record<
  string,
  MaterialNode
>
