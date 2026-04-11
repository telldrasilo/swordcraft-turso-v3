/**
 * Пакет 1.3: объединение сегментов вне ядра library/* (мир, квест).
 * Отдельные файлы: `registry-segment-*.ts`.
 * Сегмент pick-моста **5.3–5.4** удалён (ранее пустой реэкспорт).
 */

import { registryQuestMaterialNodes } from './registry-segment-quest'
import { registryWorldMaterialNodes } from './registry-segment-world'
import type { MaterialNode } from '@/types/materials/material-core'

export { registryWorldMaterialNodes } from './registry-segment-world'
export { registryQuestMaterialNodes } from './registry-segment-quest'

export const registrySatelliteMaterialNodes: MaterialNode[] = [
  ...registryWorldMaterialNodes,
  ...registryQuestMaterialNodes,
]
