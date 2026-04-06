/**
 * Реестр техник получения материала для кузницы (processing / фазы C–D roadmap).
 * Отдельно от боевых `Technique` крафта — влияют на расход, таймлайн и малые бонусы прогноза.
 */

import type { MaterialAssignment, PartMaterialSupplyEntry } from '@/types/craft-v2'
import { getTechniqueById } from '@/data/techniques'
import { getMaterialById } from '@/data/materials'

/** Сырьевые камни, для которых в кузнице используется та же цепочка, что и для `processed_stone`. */
const STONE_IDS_ANCHORED_TO_BLOCK_PROCESSING = new Set([
  'basic_stone',
  'granite',
  'marble',
  'obsidian',
])

/**
 * Целевой каталожный id для поиска техник обработки (плавка/доска/блоки), когда в плане выбрано сырьё
 * (например порода дерева вместо `processed_wood`).
 */
export function resolveCatalogMaterialIdForProcessingTechniques(
  catalogMaterialId: string
): string {
  const m = getMaterialById(catalogMaterialId)
  if (!m) return catalogMaterialId
  if (m.identity.class === 'wood' && catalogMaterialId !== 'processed_wood') {
    return 'processed_wood'
  }
  if (
    catalogMaterialId !== 'processed_stone' &&
    STONE_IDS_ANCHORED_TO_BLOCK_PROCESSING.has(catalogMaterialId)
  ) {
    return 'processed_stone'
  }
  return catalogMaterialId
}

export interface MaterialProcessingTechniqueCraftInsertion {
  /** Вставить этап после первого с таким stageType (если нет — в конец) */
  afterStageType?: string
  beforeStageType?: string
  stageType: string
  /** Длительность в секундах вместо baseDuration из библиотеки этапа */
  durationSeconds?: number
}

/** Модификаторы прогноза/итога (фаза E); поля опциональны. */
export interface MaterialProcessingOutcomeModifiers {
  /** 0..~0.35 — сужает min/max качества в прогнозе */
  forecastSpreadTightness?: number
}

export interface MaterialProcessingTechnique {
  id: string
  name: string
  description: string
  /** Ссылка на `refiningRecipes[].id` для расчёта руды/угля */
  refiningRecipeId: string
  /** Каталожные материалы части (целевая стадия), к которым применима техника */
  targetCatalogMaterialIds: string[]
  /** Если true — доступна без записи в unlockedTechniques (MVP стартовая плавка) */
  unlockedByDefault: boolean
  craftStageInsertions: MaterialProcessingTechniqueCraftInsertion[]
  /** Малый бонус к итоговому качеству при пути «руда в горне» (фаза E MVP) */
  processingQualityBonus?: number
  outcomeModifiers?: MaterialProcessingOutcomeModifiers
  /** ID других техник обработки, несовместимых на том же плане */
  incompatibleWithMaterialProcessingTechniqueIds?: string[]
  /** ID боевых техник крафта (`data/techniques`), несовместимых с этой обработкой */
  incompatibleWithCraftTechniqueIds?: string[]
}

export const allMaterialProcessingTechniques: MaterialProcessingTechnique[] = [
  {
    id: 'forge_basic_iron_smelt',
    name: 'Простая плавка железа',
    description:
      'Получение металлической заготовки из железной руды перед ковкой; расход руды и угля по рецепту плавильни.',
    refiningRecipeId: 'iron_ingot',
    targetCatalogMaterialIds: ['iron_alloy'],
    unlockedByDefault: true,
    craftStageInsertions: [
      {
        afterStageType: 'prep_heating',
        stageType: 'prep_forge_ore_smelting',
        durationSeconds: 25,
      },
    ],
    processingQualityBonus: 0.5,
    outcomeModifiers: { forecastSpreadTightness: 0.04 },
    incompatibleWithMaterialProcessingTechniqueIds: [],
    incompatibleWithCraftTechniqueIds: [],
  },
  {
    id: 'forge_fine_iron_smelt',
    name: 'Тщательная плавка железа',
    description:
      'Медленный прогрев и контроль температуры в горне — ровнее структура заготовки и чуть стабильнее итог ковки.',
    refiningRecipeId: 'iron_ingot',
    targetCatalogMaterialIds: ['iron_alloy'],
    unlockedByDefault: false,
    craftStageInsertions: [
      {
        afterStageType: 'prep_heating',
        stageType: 'prep_forge_ore_smelting',
        durationSeconds: 40,
      },
    ],
    processingQualityBonus: 1.5,
    outcomeModifiers: { forecastSpreadTightness: 0.1 },
    incompatibleWithMaterialProcessingTechniqueIds: [],
    incompatibleWithCraftTechniqueIds: [],
  },
  {
    id: 'forge_basic_copper_smelt',
    name: 'Простая плавка меди',
    description:
      'Переплавка медной руды в горне перед ковкой; расход руды и угля по рецепту плавильни.',
    refiningRecipeId: 'copper_ingot',
    targetCatalogMaterialIds: ['copper_alloy'],
    unlockedByDefault: false,
    craftStageInsertions: [
      {
        afterStageType: 'prep_heating',
        stageType: 'prep_forge_ore_smelting',
        durationSeconds: 28,
      },
    ],
    processingQualityBonus: 0.45,
    outcomeModifiers: { forecastSpreadTightness: 0.035 },
    incompatibleWithMaterialProcessingTechniqueIds: [],
    incompatibleWithCraftTechniqueIds: [],
  },
  {
    id: 'forge_basic_tin_smelt',
    name: 'Простая плавка олова',
    description:
      'Переплавка оловянной руды в горне; расход по рецепту плавильни.',
    refiningRecipeId: 'tin_ingot',
    targetCatalogMaterialIds: ['tin_alloy'],
    unlockedByDefault: false,
    craftStageInsertions: [
      {
        afterStageType: 'prep_heating',
        stageType: 'prep_forge_ore_smelting',
        durationSeconds: 28,
      },
    ],
    processingQualityBonus: 0.45,
    outcomeModifiers: { forecastSpreadTightness: 0.035 },
    incompatibleWithMaterialProcessingTechniqueIds: [],
    incompatibleWithCraftTechniqueIds: [],
  },
  {
    id: 'forge_basic_bronze_smelt',
    name: 'Плавка бронзы в горне',
    description:
      'Сплав меди и олова по рецепту плавильни перед ковкой бронзовых частей.',
    refiningRecipeId: 'bronze_ingot',
    targetCatalogMaterialIds: ['bronze'],
    unlockedByDefault: false,
    craftStageInsertions: [
      {
        afterStageType: 'prep_heating',
        stageType: 'prep_forge_ore_smelting',
        durationSeconds: 38,
      },
    ],
    processingQualityBonus: 0.55,
    outcomeModifiers: { forecastSpreadTightness: 0.042 },
    incompatibleWithMaterialProcessingTechniqueIds: [],
    incompatibleWithCraftTechniqueIds: [],
  },
  {
    id: 'forge_basic_silver_smelt',
    name: 'Простая плавка серебра',
    description:
      'Переплавка серебряной руды перед ковкой; расход по рецепту плавильни.',
    refiningRecipeId: 'silver_ingot',
    targetCatalogMaterialIds: ['silver_alloy'],
    unlockedByDefault: false,
    craftStageInsertions: [
      {
        afterStageType: 'prep_heating',
        stageType: 'prep_forge_ore_smelting',
        durationSeconds: 45,
      },
    ],
    processingQualityBonus: 0.65,
    outcomeModifiers: { forecastSpreadTightness: 0.048 },
    incompatibleWithMaterialProcessingTechniqueIds: [],
    incompatibleWithCraftTechniqueIds: [],
  },
  {
    id: 'forge_basic_steel_smelt',
    name: 'Плавка стали в горне',
    description:
      'Перевод железной заготовки в сталь по рецепту плавильни перед ковкой.',
    refiningRecipeId: 'steel_ingot',
    targetCatalogMaterialIds: ['steel'],
    unlockedByDefault: false,
    craftStageInsertions: [
      {
        afterStageType: 'prep_heating',
        stageType: 'prep_forge_ore_smelting',
        durationSeconds: 48,
      },
    ],
    processingQualityBonus: 0.7,
    outcomeModifiers: { forecastSpreadTightness: 0.05 },
    incompatibleWithMaterialProcessingTechniqueIds: [],
    incompatibleWithCraftTechniqueIds: [],
  },
  {
    id: 'forge_basic_gold_smelt',
    name: 'Простая плавка золота',
    description:
      'Переплавка золотой руды перед ковкой; расход по рецепту плавильни.',
    refiningRecipeId: 'gold_ingot',
    targetCatalogMaterialIds: ['gold_alloy'],
    unlockedByDefault: false,
    craftStageInsertions: [
      {
        afterStageType: 'prep_heating',
        stageType: 'prep_forge_ore_smelting',
        durationSeconds: 58,
      },
    ],
    processingQualityBonus: 0.75,
    outcomeModifiers: { forecastSpreadTightness: 0.052 },
    incompatibleWithMaterialProcessingTechniqueIds: [],
    incompatibleWithCraftTechniqueIds: [],
  },
  {
    id: 'forge_basic_mithril_smelt',
    name: 'Простая плавка мифрила',
    description:
      'Выплавка мифриловой заготовки из руды перед ковкой; расход и время по рецепту плавильни (высокий уровень). Фэнтези-металл.',
    refiningRecipeId: 'mithril_ingot',
    targetCatalogMaterialIds: ['mithril_alloy'],
    unlockedByDefault: false,
    craftStageInsertions: [
      {
        afterStageType: 'prep_heating',
        stageType: 'prep_forge_ore_smelting',
        durationSeconds: 55,
      },
    ],
    processingQualityBonus: 0.8,
    outcomeModifiers: { forecastSpreadTightness: 0.06 },
    incompatibleWithMaterialProcessingTechniqueIds: [],
    incompatibleWithCraftTechniqueIds: [],
  },
  {
    id: 'forge_basic_wood_planks',
    name: 'Заготовка пиломатериала',
    description:
      'Грубый распил по рецепту лесопилки, затем подгонка размеров под деталь рукояти у верстака в мастерской; расход дерева без угля.',
    refiningRecipeId: 'wood_planks',
    targetCatalogMaterialIds: ['processed_wood'],
    unlockedByDefault: true,
    craftStageInsertions: [
      {
        afterStageType: 'prep_heating',
        stageType: 'prep_forge_wood_stock',
        durationSeconds: 12,
      },
    ],
    processingQualityBonus: 0.25,
    outcomeModifiers: { forecastSpreadTightness: 0.02 },
    incompatibleWithMaterialProcessingTechniqueIds: [],
    incompatibleWithCraftTechniqueIds: [],
  },
  {
    id: 'forge_basic_stone_blocks',
    name: 'Обработка каменных блоков',
    description:
      'Распил и обтёс заготовок по рецепту каменоломни, затем подгонка стыков под посадку в оправу.',
    refiningRecipeId: 'stone_blocks',
    targetCatalogMaterialIds: ['processed_stone'],
    unlockedByDefault: true,
    craftStageInsertions: [
      {
        afterStageType: 'prep_heating',
        stageType: 'prep_forge_stone_blocks',
        durationSeconds: 15,
      },
    ],
    processingQualityBonus: 0.28,
    outcomeModifiers: { forecastSpreadTightness: 0.022 },
    incompatibleWithMaterialProcessingTechniqueIds: [],
    incompatibleWithCraftTechniqueIds: [],
  },
]

const byId = new Map(allMaterialProcessingTechniques.map(t => [t.id, t]))

export function getMaterialProcessingTechniqueById(
  id: string
): MaterialProcessingTechnique | undefined {
  return byId.get(id)
}

export function getMaterialProcessingTechniquesForCatalogMaterial(
  catalogMaterialId: string
): MaterialProcessingTechnique[] {
  const anchor = resolveCatalogMaterialIdForProcessingTechniques(catalogMaterialId)
  return allMaterialProcessingTechniques.filter(t =>
    t.targetCatalogMaterialIds.includes(anchor)
  )
}

/** Фильтр по разблокировкам игрока (фаза D). */
export function getAvailableMaterialProcessingTechniques(
  catalogMaterialId: string,
  unlockedTechniqueIds: string[]
): MaterialProcessingTechnique[] {
  const set = new Set(unlockedTechniqueIds)
  return getMaterialProcessingTechniquesForCatalogMaterial(catalogMaterialId).filter(
    t => t.unlockedByDefault || set.has(t.id)
  )
}

export function resolveProcessingTechniqueForPart(
  _partId: string,
  catalogMaterialId: string,
  entry?: PartMaterialSupplyEntry,
  unlockedTechniqueIds: string[] = []
): MaterialProcessingTechnique | undefined {
  if (!entry || entry.mode !== 'ore_smelt') return undefined
  const anchor = resolveCatalogMaterialIdForProcessingTechniques(catalogMaterialId)
  if (entry.processingTechniqueId) {
    const t = getMaterialProcessingTechniqueById(entry.processingTechniqueId)
    if (t?.targetCatalogMaterialIds.includes(anchor)) return t
  }
  const list = getAvailableMaterialProcessingTechniques(
    catalogMaterialId,
    unlockedTechniqueIds
  )
  return list[0]
}

export function aggregateProcessingQualityDelta(
  partSupply: Record<string, PartMaterialSupplyEntry> | undefined,
  materials: MaterialAssignment,
  unlockedTechniqueIds: string[] = []
): number {
  if (!partSupply) return 0
  let sum = 0
  for (const [partId, assign] of Object.entries(materials)) {
    const entry = partSupply[partId]
    const tech = resolveProcessingTechniqueForPart(
      partId,
      assign.materialId,
      entry,
      unlockedTechniqueIds
    )
    if (tech?.processingQualityBonus) sum += tech.processingQualityBonus
  }
  return sum
}

/**
 * Максимум «сжатия» разброса прогноза от outcomeModifiers выбранных техник обработки.
 */
export function aggregateProcessingForecastSpreadTightness(
  partSupply: Record<string, PartMaterialSupplyEntry> | undefined,
  materials: MaterialAssignment,
  unlockedTechniqueIds: string[] = []
): number {
  if (!partSupply) return 0
  let maxT = 0
  for (const [partId, assign] of Object.entries(materials)) {
    const entry = partSupply[partId]
    const tech = resolveProcessingTechniqueForPart(
      partId,
      assign.materialId,
      entry,
      unlockedTechniqueIds
    )
    const t = tech?.outcomeModifiers?.forecastSpreadTightness ?? 0
    if (t > maxT) maxT = t
  }
  return Math.min(0.35, maxT)
}

export type MaterialProcessingPlanValidation =
  | { ok: true }
  | { ok: false; reason: string }

/**
 * Проверка несовместимости техник обработки друг с другом и с выбранными боевыми техниками.
 */
export function validateMaterialProcessingPlan(
  materials: MaterialAssignment,
  partSupply: Record<string, PartMaterialSupplyEntry> | undefined,
  craftTechniqueIds: string[],
  unlockedTechniqueIds: string[]
): MaterialProcessingPlanValidation {
  if (!partSupply || Object.keys(partSupply).length === 0) return { ok: true }

  const resolved: { partId: string; techId: string; tech: MaterialProcessingTechnique }[] = []
  for (const [partId, assign] of Object.entries(materials)) {
    const entry = partSupply[partId]
    if (!entry || entry.mode !== 'ore_smelt') continue
    const tech = resolveProcessingTechniqueForPart(
      partId,
      assign.materialId,
      entry,
      unlockedTechniqueIds
    )
    if (tech) resolved.push({ partId, techId: tech.id, tech })
  }

  for (let i = 0; i < resolved.length; i++) {
    for (let j = i + 1; j < resolved.length; j++) {
      const a = resolved[i].tech
      const b = resolved[j].tech
      if (a.incompatibleWithMaterialProcessingTechniqueIds?.includes(b.id)) {
        return {
          ok: false,
          reason: `Техника «${a.name}» несовместима с «${b.name}» для разных частей.`,
        }
      }
      if (b.incompatibleWithMaterialProcessingTechniqueIds?.includes(a.id)) {
        return {
          ok: false,
          reason: `Техника «${b.name}» несовместима с «${a.name}».`,
        }
      }
    }
  }

  const craftSet = new Set(craftTechniqueIds)
  for (const { tech } of resolved) {
    const bad = tech.incompatibleWithCraftTechniqueIds?.find(id => craftSet.has(id))
    if (bad) {
      const ct = getTechniqueById(bad)
      return {
        ok: false,
        reason: `Техника плавки «${tech.name}» не сочетается с приёмом «${ct?.name ?? bad}».`,
      }
    }
  }

  return { ok: true }
}
