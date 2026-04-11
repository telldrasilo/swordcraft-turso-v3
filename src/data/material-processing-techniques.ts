/**
 * Реестр техник получения материала для кузницы (processing / фазы C–D roadmap).
 * Отдельно от боевых `Technique` крафта — влияют на расход, таймлайн и малые бонусы прогноза.
 */

import type { MaterialAssignment, PartMaterialSupplyEntry } from '@/types/craft-v2'
import type { CraftLinePhase } from '@/types/craft-line'
import type { TechniqueMicroTask } from '@/types/encyclopedia-techniques'
import type { ProcessingOperation } from '@/types/materials/processing-operations'
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
  if (catalogMaterialId === 'raw_leather') {
    return 'tanned_leather'
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
  /** Ссылка на `refiningRecipes[].id`; можно не задавать, если id выводится из [`getEffectiveRefiningRecipeId`](../lib/craft/processing-technique-refining-bridge.ts) (операции / I/O). */
  refiningRecipeId?: string
  /** Каталожные материалы части (целевая стадия), к которым применима техника */
  targetCatalogMaterialIds: string[]
  /** Если true — доступна без записи в unlockedTechniques (MVP стартовая плавка) */
  unlockedByDefault: boolean
  /** Если пусто/отсутствует — этапы берутся из [`processingOperations`].`stageTypeHint` ([`process-generator`](../../lib/craft/process-generator.ts)). */
  craftStageInsertions?: MaterialProcessingTechniqueCraftInsertion[]
  /** Малый бонус к итоговому качеству при пути «руда в горне» (фаза E MVP) */
  processingQualityBonus?: number
  outcomeModifiers?: MaterialProcessingOutcomeModifiers
  /** ID других техник обработки, несовместимых на том же плане */
  incompatibleWithMaterialProcessingTechniqueIds?: string[]
  /** ID боевых техник крафта (`data/techniques`), несовместимых с этой обработкой */
  incompatibleWithCraftTechniqueIds?: string[]
  /**
   * Фаза **3.1** roadmap: эталонные операции; id рецепта горна — [`getEffectiveRefiningRecipeId`](../lib/craft/processing-technique-refining-bridge.ts) (поле техники или операций).
   * Валидатор: `material-processing-techniques-operations.test.ts`.
   */
  processingOperations?: ProcessingOperation[]
  /**
   * Фаза **3.4** roadmap: роли процесса ([`MATERIAL_SEMANTIC_PROCESS_ROLES`](../../../docs/MATERIAL_SEMANTIC_PROCESS_ROLES.md));
   * точка расширения для универсальных техник без перечисления всех `targetCatalogMaterialIds`.
   */
  targetSemanticProcessRoles?: readonly string[]
  /** Опционально: явные микрозадачи для энциклопедии и Крафтовой линии; иначе вывод из `processingOperations`. */
  microTasks?: readonly TechniqueMicroTask[]
  /** Фаза Крафтовой линии (ENC §12.3); по умолчанию `material_preparation`. */
  craftLinePhase?: CraftLinePhase
  /** Порядок внутри фазы. */
  craftLineOrder?: number
}

export const allMaterialProcessingTechniques: MaterialProcessingTechnique[] = [
  {
    id: 'forge_basic_iron_smelt',
    name: 'Простая плавка железа',
    description:
      'Получение металлической заготовки из железной руды перед ковкой; расход руды и угля по рецепту плавильни.',
    targetCatalogMaterialIds: ['iron_alloy'],
    unlockedByDefault: true,
    processingQualityBonus: 0.5,
    outcomeModifiers: { forecastSpreadTightness: 0.04 },
    incompatibleWithMaterialProcessingTechniqueIds: [],
    incompatibleWithCraftTechniqueIds: [],
    targetSemanticProcessRoles: ['refining_smelting'],
    microTasks: [
      { id: 'iron_smelt_charge', label: 'Загрузка шихты и прогрев горна', durationWeight: 1 },
      { id: 'iron_smelt_tap', label: 'Плавка и слив заготовки', durationWeight: 2 },
    ],
    processingOperations: [
      {
        id: 'forge_basic_iron_smelt_op0',
        order: 0,
        refiningRecipeId: 'iron_ingot',
        stageTypeHint: 'prep_forge_ore_smelting',
        durationSeconds: 25,
      },
    ],
  },
  {
    id: 'forge_fine_iron_smelt',
    name: 'Тщательная плавка железа',
    description:
      'Медленный прогрев и контроль температуры в горне — ровнее структура заготовки и чуть стабильнее итог ковки.',
    targetCatalogMaterialIds: ['iron_alloy'],
    unlockedByDefault: false,
    processingQualityBonus: 1.5,
    outcomeModifiers: { forecastSpreadTightness: 0.1 },
    incompatibleWithMaterialProcessingTechniqueIds: [],
    incompatibleWithCraftTechniqueIds: [],
    targetSemanticProcessRoles: ['refining_smelting'],
    microTasks: [
      { id: 'fine_iron_slow', label: 'Медленный прогрев и выдержка температуры', durationWeight: 2 },
      { id: 'fine_iron_tap', label: 'Контролируемый слив и зачистка шлака', durationWeight: 2 },
    ],
    processingOperations: [
      {
        id: 'forge_fine_iron_smelt_op0',
        order: 0,
        refiningRecipeId: 'iron_ingot',
        stageTypeHint: 'prep_forge_ore_smelting',
        durationSeconds: 40,
      },
    ],
  },
  {
    id: 'forge_basic_copper_smelt',
    name: 'Простая плавка меди',
    description:
      'Переплавка медной руды в горне перед ковкой; расход руды и угля по рецепту плавильни.',
    targetCatalogMaterialIds: ['copper_alloy'],
    unlockedByDefault: false,
    processingQualityBonus: 0.45,
    outcomeModifiers: { forecastSpreadTightness: 0.035 },
    incompatibleWithMaterialProcessingTechniqueIds: [],
    incompatibleWithCraftTechniqueIds: [],
    targetSemanticProcessRoles: ['refining_smelting'],
    microTasks: [
      { id: 'cu_charge', label: 'Раскладка руды и поддув', durationWeight: 1 },
      { id: 'cu_smelt', label: 'Переплавка в медную заготовку', durationWeight: 2 },
    ],
    processingOperations: [
      {
        id: 'forge_basic_copper_smelt_op0',
        order: 0,
        refiningRecipeId: 'copper_ingot',
        stageTypeHint: 'prep_forge_ore_smelting',
        durationSeconds: 28,
      },
    ],
  },
  {
    id: 'forge_basic_tin_smelt',
    name: 'Простая плавка олова',
    description:
      'Переплавка оловянной руды в горне; расход по рецепту плавильни.',
    targetCatalogMaterialIds: ['tin_alloy'],
    unlockedByDefault: false,
    processingQualityBonus: 0.45,
    outcomeModifiers: { forecastSpreadTightness: 0.035 },
    incompatibleWithMaterialProcessingTechniqueIds: [],
    incompatibleWithCraftTechniqueIds: [],
    targetSemanticProcessRoles: ['refining_smelting'],
    microTasks: [
      { id: 'sn_charge', label: 'Загрузка оловянной руды', durationWeight: 1 },
      { id: 'sn_smelt', label: 'Плавка оловянной заготовки', durationWeight: 2 },
    ],
    processingOperations: [
      {
        id: 'forge_basic_tin_smelt_op0',
        order: 0,
        refiningRecipeId: 'tin_ingot',
        stageTypeHint: 'prep_forge_ore_smelting',
        durationSeconds: 28,
      },
    ],
  },
  {
    id: 'forge_basic_bronze_smelt',
    name: 'Плавка бронзы в горне',
    description:
      'Сплав меди и олова по рецепту плавильни перед ковкой бронзовых частей.',
    targetCatalogMaterialIds: ['bronze'],
    unlockedByDefault: false,
    processingQualityBonus: 0.55,
    outcomeModifiers: { forecastSpreadTightness: 0.042 },
    incompatibleWithMaterialProcessingTechniqueIds: [],
    incompatibleWithCraftTechniqueIds: [],
    targetSemanticProcessRoles: ['refining_smelting'],
    microTasks: [
      { id: 'br_mix', label: 'Сборка шихты Cu/Sn', durationWeight: 1 },
      { id: 'br_smelt', label: 'Плавка бронзы в горне', durationWeight: 2 },
    ],
    processingOperations: [
      {
        id: 'forge_basic_bronze_smelt_op0',
        order: 0,
        refiningRecipeId: 'bronze_ingot',
        stageTypeHint: 'prep_forge_ore_smelting',
        durationSeconds: 38,
      },
    ],
  },
  {
    id: 'forge_basic_silver_smelt',
    name: 'Простая плавка серебра',
    description:
      'Переплавка серебряной руды перед ковкой; расход по рецепту плавильни.',
    targetCatalogMaterialIds: ['silver_alloy'],
    unlockedByDefault: false,
    processingQualityBonus: 0.65,
    outcomeModifiers: { forecastSpreadTightness: 0.048 },
    incompatibleWithMaterialProcessingTechniqueIds: [],
    incompatibleWithCraftTechniqueIds: [],
    targetSemanticProcessRoles: ['refining_smelting'],
    microTasks: [
      { id: 'ag_charge', label: 'Аккуратная загрузка серебряной руды', durationWeight: 1 },
      { id: 'ag_smelt', label: 'Тихая плавка и слив слитка', durationWeight: 2 },
    ],
    processingOperations: [
      {
        id: 'forge_basic_silver_smelt_op0',
        order: 0,
        refiningRecipeId: 'silver_ingot',
        stageTypeHint: 'prep_forge_ore_smelting',
        durationSeconds: 45,
      },
    ],
  },
  {
    id: 'forge_basic_steel_smelt',
    name: 'Плавка стали в горне',
    description:
      'Перевод железной заготовки в сталь по рецепту плавильни перед ковкой.',
    targetCatalogMaterialIds: ['steel'],
    unlockedByDefault: false,
    processingQualityBonus: 0.7,
    outcomeModifiers: { forecastSpreadTightness: 0.05 },
    incompatibleWithMaterialProcessingTechniqueIds: [],
    incompatibleWithCraftTechniqueIds: [],
    targetSemanticProcessRoles: ['refining_smelting'],
    microTasks: [
      { id: 'steel_carburize', label: 'Набор углерода и перемешивание ванны', durationWeight: 2 },
      { id: 'steel_tap', label: 'Выпуск стальной заготовки', durationWeight: 2 },
    ],
    processingOperations: [
      {
        id: 'forge_basic_steel_smelt_op0',
        order: 0,
        refiningRecipeId: 'steel_ingot',
        stageTypeHint: 'prep_forge_ore_smelting',
        durationSeconds: 48,
      },
    ],
  },
  {
    id: 'forge_basic_gold_smelt',
    name: 'Простая плавка золота',
    description:
      'Переплавка золотой руды перед ковкой; расход по рецепту плавильни.',
    targetCatalogMaterialIds: ['gold_alloy'],
    unlockedByDefault: false,
    processingQualityBonus: 0.75,
    outcomeModifiers: { forecastSpreadTightness: 0.052 },
    incompatibleWithMaterialProcessingTechniqueIds: [],
    incompatibleWithCraftTechniqueIds: [],
    targetSemanticProcessRoles: ['refining_smelting'],
    microTasks: [
      { id: 'au_heat', label: 'Осторожный прогрев благородного металла', durationWeight: 2 },
      { id: 'au_cast', label: 'Переплав и формовка заготовки', durationWeight: 2 },
    ],
    processingOperations: [
      {
        id: 'forge_basic_gold_smelt_op0',
        order: 0,
        refiningRecipeId: 'gold_ingot',
        stageTypeHint: 'prep_forge_ore_smelting',
        durationSeconds: 58,
      },
    ],
  },
  {
    id: 'forge_basic_mithril_smelt',
    name: 'Простая плавка мифрила',
    description:
      'Выплавка мифриловой заготовки из руды перед ковкой; расход и время по рецепту плавильни (высокий уровень). Фэнтези-металл.',
    targetCatalogMaterialIds: ['mithril_alloy'],
    unlockedByDefault: false,
    processingQualityBonus: 0.8,
    outcomeModifiers: { forecastSpreadTightness: 0.06 },
    incompatibleWithMaterialProcessingTechniqueIds: [],
    incompatibleWithCraftTechniqueIds: [],
    targetSemanticProcessRoles: ['refining_smelting'],
    microTasks: [
      { id: 'mi_ward', label: 'Стабилизация фаз и защита от перегрева', durationWeight: 2 },
      { id: 'mi_smelt', label: 'Выплавка мифриловой заготовки', durationWeight: 2 },
    ],
    processingOperations: [
      {
        id: 'forge_basic_mithril_smelt_op0',
        order: 0,
        refiningRecipeId: 'mithril_ingot',
        stageTypeHint: 'prep_forge_ore_smelting',
        durationSeconds: 55,
      },
    ],
  },
  {
    id: 'forge_basic_wood_planks',
    name: 'Заготовка пиломатериала',
    description:
      'Грубый распил по рецепту лесопилки, затем подгонка размеров под деталь рукояти у верстака в мастерской; расход дерева без угля.',
    targetCatalogMaterialIds: ['processed_wood'],
    unlockedByDefault: true,
    processingQualityBonus: 0.25,
    outcomeModifiers: { forecastSpreadTightness: 0.02 },
    incompatibleWithMaterialProcessingTechniqueIds: [],
    incompatibleWithCraftTechniqueIds: [],
    targetSemanticProcessRoles: ['refining_smelting'],
    microTasks: [
      { id: 'wood_rip', label: 'Распил брёвен по рецепту', durationWeight: 1 },
      { id: 'wood_trim', label: 'Подгонка пиломатериала под деталь', durationWeight: 2 },
    ],
    processingOperations: [
      {
        id: 'forge_basic_wood_planks_op0',
        order: 0,
        refiningRecipeId: 'wood_planks',
        stageTypeHint: 'prep_forge_wood_stock',
        durationSeconds: 12,
      },
    ],
  },
  {
    id: 'forge_basic_stone_blocks',
    name: 'Обработка каменных блоков',
    description:
      'Распил и обтёс заготовок по рецепту каменоломни, затем подгонка стыков под посадку в оправу.',
    targetCatalogMaterialIds: ['processed_stone'],
    unlockedByDefault: true,
    processingQualityBonus: 0.28,
    outcomeModifiers: { forecastSpreadTightness: 0.022 },
    incompatibleWithMaterialProcessingTechniqueIds: [],
    incompatibleWithCraftTechniqueIds: [],
    targetSemanticProcessRoles: ['refining_smelting'],
    microTasks: [
      { id: 'stone_cut', label: 'Распил и обтёс блоков', durationWeight: 2 },
      { id: 'stone_fit', label: 'Подгонка стыков под посадку', durationWeight: 2 },
    ],
    processingOperations: [
      {
        id: 'forge_basic_stone_blocks_op0',
        order: 0,
        refiningRecipeId: 'stone_blocks',
        stageTypeHint: 'prep_forge_stone_blocks',
        durationSeconds: 15,
      },
    ],
  },
  {
    id: 'forge_basic_leather_tan',
    name: 'Выделка кожи для рукояти',
    description:
      'Дубление сырой кожи до плотной заготовки по рецепту кожевенной постройки; расход сырья без угля.',
    targetCatalogMaterialIds: ['tanned_leather'],
    unlockedByDefault: true,
    processingQualityBonus: 0.22,
    outcomeModifiers: { forecastSpreadTightness: 0.018 },
    incompatibleWithMaterialProcessingTechniqueIds: [],
    incompatibleWithCraftTechniqueIds: [],
    targetSemanticProcessRoles: ['refining_tanning'],
    microTasks: [
      { id: 'proc_raw_tan_soak', label: 'Пропитка и дубление сырья', durationWeight: 2 },
      { id: 'proc_raw_tan_press', label: 'Дожим и сушка заготовки', durationWeight: 1 },
    ],
    processingOperations: [
      {
        id: 'forge_basic_leather_tan_op0',
        order: 0,
        durationSeconds: 12,
        inputMaterialIds: { raw_leather: 1 },
        outputMaterialIds: { tanned_leather: 1 },
        stageTypeHint: 'prep_forge_leather_tan',
      },
    ],
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
