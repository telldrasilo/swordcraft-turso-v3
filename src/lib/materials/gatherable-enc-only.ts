/**
 * Добываемые `materialId` без маппинга на `ResourceKey` (аудит MATERIALS_UNIFICATION_AUDIT §4.1, TD-INV-2).
 * Дроп экспедиций копится в `materialStash`; без записи в мосте материал не участвует в горне / крафте v2 / лавке.
 *
 * После контент-волны TD-INV-2 (2026-04-01) реестр **пуст**: все бывшие ENC-only id мапятся в
 * [`world-resource-inventory-bridge.ts`](./world-resource-inventory-bridge.ts). Новые добываемые id без маппинга
 * снова добавляют сюда по политике **TD-DOC-1** (см. `docs/data/MATERIALS_ADDING.md`).
 *
 * При подключении маппинга — убрать id отсюда и обновить мост / §4.1 / RESOURCE_TRANSFORMATION_MAP + семантику TD-SEM-4.
 */

export const GATHERABLE_ENC_ONLY_MATERIAL_IDS = [] as const

export type GatherableEncOnlyMaterialId = (typeof GATHERABLE_ENC_ONLY_MATERIAL_IDS)[number]

const ENC_ONLY_SET = new Set<string>(GATHERABLE_ENC_ONLY_MATERIAL_IDS)

export function isGatherableEncOnlyMaterialId(materialId: string): boolean {
  return ENC_ONLY_SET.has(materialId)
}
