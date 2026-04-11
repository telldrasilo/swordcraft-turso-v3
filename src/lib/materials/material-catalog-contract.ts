/**
 * Контракт каталога материалов: потребители ссылаются только на id из реестра (B ⊆ A).
 * @see docs/MATERIALS_SINGLE_SOURCE_ROADMAP.md §8
 *
 * **Пакет 0.2 / ремонт и перековка:** сканер **`collectRepairReforgeCatalogMaterialIds`** — пул по **`ResourceKey`** плюс опциональные **`catalogMaterialSpendIds`** в [`repair-system`](../../data/repair-system.ts) и реестре перековки.
 */

import {
  ALTAR_PHASE1_MATERIAL_DISPLAY_HINTS,
  ALTAR_PHASE1_REQUIRED_MATERIALS,
  ALTAR_PHASE2_REQUIRED_MATERIALS,
  ALTAR_PHASE3_REQUIRED_MATERIALS,
  ALTAR_PHASE4_REQUIRED_MATERIALS,
  ALTAR_PHASE5_REQUIRED_MATERIALS,
} from '@/data/altar/altar-phase-material-balance'
import { allMaterialProcessingTechniques } from '@/data/material-processing-techniques'
import { collectShopOfferCatalogMaterialIds } from '@/data/material-shop'
import { expeditionTemplates } from '@/data/expedition-templates'
import { allMaterials } from '@/data/materials/library'
import { refiningRecipes, REFINING_INPUT_STAGE_MATERIAL_ID } from '@/data/refining-recipes'
import type { ResourceKey } from '@/store/slices/resources-slice'
import {
  CRAFT_ALLOY_MATERIAL_IDS,
  CRAFT_MAPPED_MATERIAL_IDS,
  RESOURCE_GRANT_STASH_FALLBACK_MATERIAL_IDS,
  getCatalogMaterialIdsForResourceKey,
  getGrantTargetMaterialId,
} from '@/lib/craft/inventory-check'
import { PRIMARY_LOOT_MATERIAL_IDS } from '@/modules/expeditions/data/events/_event-template'
import { LOCATION_REGISTRY } from '@/modules/expeditions/data/locations'
import { MISSION_REGISTRY } from '@/modules/expeditions/data/missions'
import { collectRepairTemplateCatalogMaterialIds } from '@/data/repair-system'
import { collectReforgeRegistryCatalogMaterialIds } from '@/data/reforge/reforge-techniques-registry'
import { MATERIAL_STUDY_TECHNIQUES } from '@/data/material-study-techniques'
import { allTechniques } from '@/data/techniques'
import { materialById } from '@/data/materials'
import { collectMaterialProcessingOutputIndexMaterialIds } from '@/lib/materials/material-processing-output-index'

/** Id без повторов; заблокированные офферы лавки тоже входят (контракт данных). */
const ALLOWLIST_UNKNOWN_MATERIAL_IDS = new Set<string>([])

export function getRegistryMaterialIds(): Set<string> {
  return new Set(allMaterials.map((m) => m.identity.id))
}

export function collectMaterialProcessingTechniqueTargetIds(): string[] {
  const s = new Set<string>()
  for (const t of allMaterialProcessingTechniques) {
    for (const id of t.targetCatalogMaterialIds) s.add(id)
  }
  return [...s]
}

/** I/O операций обработки (напр. кожа): B ⊆ A вместе с `targetCatalogMaterialIds`. */
export function collectMaterialProcessingTechniqueOperationMaterialIds(): string[] {
  const s = new Set<string>()
  for (const t of allMaterialProcessingTechniques) {
    for (const op of t.processingOperations ?? []) {
      for (const mid of Object.keys(op.inputMaterialIds ?? {})) s.add(mid)
      for (const mid of Object.keys(op.outputMaterialIds ?? {})) s.add(mid)
    }
  }
  return [...s].sort()
}

/** Сессии изучения в энциклопедии: расход и целевые `materialId` (0.2). */
export function collectMaterialStudyTechniqueCatalogMaterialIds(): string[] {
  const s = new Set<string>()
  for (const t of MATERIAL_STUDY_TECHNIQUES) {
    for (const c of t.materialCosts) s.add(c.materialId)
    for (const id of t.targetMaterialIds ?? []) s.add(id)
  }
  return [...s].sort()
}

/**
 * Боевые техники: `requiredMaterials`, которые совпадают с узлом реестра (0.2).
 * Id вне каталога (лор / будущий контент) не включаются — не раздувают B и не дают ложных error.
 */
export function collectCombatTechniqueRequiredCatalogMaterialIds(): string[] {
  const s = new Set<string>()
  for (const t of allTechniques) {
    for (const id of t.requiredMaterials ?? []) {
      if (materialById[id] != null) s.add(id)
    }
  }
  return [...s].sort()
}

export function collectAltarPhaseMaterialIds(): string[] {
  const s = new Set<string>()
  const tables = [
    ALTAR_PHASE1_REQUIRED_MATERIALS,
    ALTAR_PHASE2_REQUIRED_MATERIALS,
    ALTAR_PHASE3_REQUIRED_MATERIALS,
    ALTAR_PHASE4_REQUIRED_MATERIALS,
    ALTAR_PHASE5_REQUIRED_MATERIALS,
  ]
  for (const t of tables) {
    for (const k of Object.keys(t)) s.add(k)
  }
  for (const h of Object.values(ALTAR_PHASE1_MATERIAL_DISPLAY_HINTS)) {
    if (h?.labelMaterialId) s.add(h.labelMaterialId)
  }
  return [...s]
}

export function collectInventoryCheckContractMaterialIds(): string[] {
  return [
    ...new Set([
      ...CRAFT_MAPPED_MATERIAL_IDS,
      ...CRAFT_ALLOY_MATERIAL_IDS,
      ...RESOURCE_GRANT_STASH_FALLBACK_MATERIAL_IDS,
      ...Object.values(REFINING_INPUT_STAGE_MATERIAL_ID),
    ]),
  ]
}

export function collectExpeditionLocationTableMaterialIds(): string[] {
  const s = new Set<string>()
  for (const loc of LOCATION_REGISTRY) {
    for (const r of loc.resources) {
      s.add(r.materialId)
    }
  }
  return [...s]
}

/** Награды миссий: guaranteedMaterials + цели gather (`resources`). */
export function collectExpeditionMissionTemplateMaterialIds(): string[] {
  const s = new Set<string>()
  for (const mission of MISSION_REGISTRY) {
    for (const row of mission.reward.guaranteedMaterials ?? []) {
      s.add(row.materialId)
    }
    for (const target of mission.resources ?? []) {
      s.add(target.materialId)
    }
  }
  return [...s]
}

/** Фиксированный набор id «базового лута» для весов событий `grant_location_material`. */
export function collectExpeditionEventPrimaryLootCatalogMaterialIds(): string[] {
  return [...PRIMARY_LOOT_MATERIAL_IDS]
}

/**
 * Калькулятор v2: `ExpeditionTemplate.reward.bonusResources[].resource`.
 * Сейчас шаблоны из `MISSION_REGISTRY` не задают поле (только gold/warSoul); сканер страхует будущие правки — строка должна быть каноническим `materialId`.
 */
export function collectExpeditionCalculatorTemplateBonusResourceIds(): string[] {
  const s = new Set<string>()
  for (const t of expeditionTemplates) {
    for (const row of t.reward.bonusResources ?? []) {
      const id = row.resource?.trim()
      if (id) s.add(id)
    }
  }
  return [...s]
}

/**
 * Полный проход `refining-recipes`: входы через `REFINING_INPUT_STAGE_MATERIAL_ID`, выходы и уголь через `getGrantTargetMaterialId` (каталожные id для stash).
 */
/** Ключи пула склада, которые `getRepairMaterials` / ремонт могут затронуть (аналогично крафту). */
const REPAIR_SCAN_RESOURCE_KEYS: ResourceKey[] = [
  'wood',
  'stone',
  'iron',
  'coal',
  'copper',
  'tin',
  'silver',
  'goldOre',
  'mithril',
  'ironIngot',
  'copperIngot',
  'tinIngot',
  'bronzeIngot',
  'steelIngot',
  'silverIngot',
  'goldIngot',
  'mithrilIngot',
  'planks',
  'stoneBlocks',
  'leather',
]

/**
 * Ремонт: стоимости задаются **`ResourceKey`** от снимка оружия; дополнительно — **`REPAIR_TYPES[*].catalogMaterialSpendIds`**.
 * Перековка: **`REFORGE_TECHNIQUES[*].catalogMaterialSpendIds`** при появлении расходов в данных.
 */
export function collectRepairReforgeCatalogMaterialIds(): string[] {
  const s = new Set<string>()
  for (const key of REPAIR_SCAN_RESOURCE_KEYS) {
    for (const mid of getCatalogMaterialIdsForResourceKey(key)) {
      s.add(mid)
    }
    const grant = getGrantTargetMaterialId(key)
    if (grant) s.add(grant)
  }
  for (const id of collectRepairTemplateCatalogMaterialIds()) s.add(id)
  for (const id of collectReforgeRegistryCatalogMaterialIds()) s.add(id)
  return [...s].sort()
}

export function collectRefiningRecipesCatalogMaterialIds(): string[] {
  const s = new Set<string>()
  for (const id of Object.values(REFINING_INPUT_STAGE_MATERIAL_ID)) {
    s.add(id)
  }
  for (const recipe of refiningRecipes) {
    if (recipe.stashInputsPerBatch) {
      for (const mid of Object.keys(recipe.stashInputsPerBatch)) {
        s.add(mid)
      }
    }
    for (const inp of recipe.inputs) {
      s.add(REFINING_INPUT_STAGE_MATERIAL_ID[inp.resource])
    }
    const outId =
      recipe.stashOutputMaterialId ??
      getGrantTargetMaterialId(recipe.output.resource as ResourceKey)
    if (outId) s.add(outId)
    if ((recipe.extraCost?.coal ?? 0) > 0) {
      const coalId = getGrantTargetMaterialId('coal')
      if (coalId) s.add(coalId)
    }
  }
  return [...s]
}

export interface CatalogContractViolation {
  source: string
  unknownIds: string[]
}

export function diffUnknownToRegistry(
  registry: Set<string>,
  consumerIds: Iterable<string>,
  sourceLabel: string
): CatalogContractViolation | null {
  const unknown = [...new Set(consumerIds)].filter(
    (id) => id.length > 0 && !registry.has(id) && !ALLOWLIST_UNKNOWN_MATERIAL_IDS.has(id)
  )
  if (unknown.length === 0) return null
  return { source: sourceLabel, unknownIds: [...unknown].sort() }
}

const SCANNERS: { label: string; collect: () => string[] }[] = [
  {
    label: 'material-processing-techniques (targetCatalogMaterialIds)',
    collect: collectMaterialProcessingTechniqueTargetIds,
  },
  {
    label: 'material-processing-techniques (processingOperations input/output materialId)',
    collect: collectMaterialProcessingTechniqueOperationMaterialIds,
  },
  {
    label:
      'material-study-techniques (materialCosts[].materialId, targetMaterialIds)',
    collect: collectMaterialStudyTechniqueCatalogMaterialIds,
  },
  {
    label:
      'data/techniques combat: requiredMaterials[] ∩ materialById (каталог)',
    collect: collectCombatTechniqueRequiredCatalogMaterialIds,
  },
  {
    label: 'material-processing-output-index (выходы техник; §10)',
    collect: collectMaterialProcessingOutputIndexMaterialIds,
  },
  { label: 'altar-phase-material-balance + display hints', collect: collectAltarPhaseMaterialIds },
  { label: 'material-shop (all offers)', collect: collectShopOfferCatalogMaterialIds },
  {
    label:
      'inventory-check (CRAFT_MAPPED + ALLOY + RESOURCE_GRANT_STASH_FALLBACK) + REFINING_INPUT_STAGE_MATERIAL_ID',
    collect: collectInventoryCheckContractMaterialIds,
  },
  { label: 'expeditions LOCATION_REGISTRY.resources[].materialId', collect: collectExpeditionLocationTableMaterialIds },
  {
    label:
      'expeditions MISSION_REGISTRY (reward.guaranteedMaterials[].materialId, resources[].materialId)',
    collect: collectExpeditionMissionTemplateMaterialIds,
  },
  {
    label: 'expeditions PRIMARY_LOOT_MATERIAL_IDS (event grant_location_material weights)',
    collect: collectExpeditionEventPrimaryLootCatalogMaterialIds,
  },
  {
    label:
      'expedition-templates (ExpeditionReward.bonusResources[].resource → materialId для калькулятора)',
    collect: collectExpeditionCalculatorTemplateBonusResourceIds,
  },
  {
    label: 'refining-recipes (inputs REFINING_INPUT_STAGE + outputs/extraCost.coal via grant target)',
    collect: collectRefiningRecipesCatalogMaterialIds,
  },
  {
    label: 'repair-system / reforge (ResourceKey scan + catalogMaterialSpendIds в шаблонах)',
    collect: collectRepairReforgeCatalogMaterialIds,
  },
]

/** Список нарушений B ⊆ A по всем зарегистрированным сканерам (пустой = ОК). */
export function runMaterialCatalogContractChecks(): CatalogContractViolation[] {
  const A = getRegistryMaterialIds()
  return SCANNERS.map(({ label, collect }) => diffUnknownToRegistry(A, collect(), label)).filter(
    (v): v is CatalogContractViolation => v != null
  )
}

/** Дубликаты identity.id в allMaterials (иначе materialById молча перезаписывает). */
export function findDuplicateRegistryMaterialIds(): string[] {
  const seen = new Map<string, number>()
  for (const m of allMaterials) {
    const id = m.identity.id
    seen.set(id, (seen.get(id) ?? 0) + 1)
  }
  return [...seen.entries()].filter(([, n]) => n > 1).map(([id]) => id).sort()
}
