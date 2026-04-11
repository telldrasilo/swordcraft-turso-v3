/**
 * Типы для раздела «Техники» энциклопедии и Крафтовой линии (roadmap ENC §3–§5, §10–§12).
 */

/** Семейство техники в энциклопедии (один реестр на значение). */
export type EncyclopediaTechniqueKind =
  | 'craft'
  | 'material_processing'
  | 'material_study'
  | 'reforge'
  | 'repair'

/** Составной ключ: нельзя использовать голый id между реестрами. */
export interface EncyclopediaTechniqueRef {
  kind: EncyclopediaTechniqueKind
  id: string
}

const ENC_TECHNIQUE_KINDS_SET = new Set<EncyclopediaTechniqueKind>([
  'craft',
  'material_processing',
  'material_study',
  'reforge',
  'repair',
])

/** Проверка произвольного объекта (например из `navigationTarget` сообщения). */
export function isValidEncyclopediaTechniqueRef(
  value: unknown
): value is EncyclopediaTechniqueRef {
  if (value == null || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    v.id.length > 0 &&
    typeof v.kind === 'string' &&
    ENC_TECHNIQUE_KINDS_SET.has(v.kind as EncyclopediaTechniqueKind)
  )
}

/**
 * Микрозадача внутри техники (ход работы / микроэтап линии).
 * `id` обязателен: стабильный ключ внутри родительской техники (для прогресса, томов, персиста).
 * Глобально уникальность не требуется — в сторе держите составной ключ [`EncyclopediaTechniqueRef` + `id`].
 */
export interface TechniqueMicroTask {
  id: string
  label: string
  hint?: string
  /** Вес длительности относительно других микрозадач этой техники (ENC P5a); при отсутствии — равные доли. */
  durationWeight?: number
}

export interface EncyclopediaTechniqueSummaryRow {
  label: string
  value: string
}

/** Плоская модель карточки техники для UI (без доступа к реестрам в компоненте). */
export interface EncyclopediaTechniqueCardModel {
  ref: EncyclopediaTechniqueRef
  name: string
  description: string
  /** Первый бейдж: «Приём ковки», «Обработка материала», … */
  familyLabel: string
  /** Второй бейдж: источник, tier, роль процесса */
  subLabel?: string
  summaryRows: EncyclopediaTechniqueSummaryRow[]
  /** Короткие строки для сворачиваемого блока деталей */
  detailHintLines?: string[]
  /** Каталожные materialId для будущих чипов (P2) */
  relatedMaterialIds?: string[]
  expertisePercent?: number
  /** Шаги «Ход работы» (§5.5); пусто, если нет данных и fallback не дал шагов */
  workSteps?: readonly TechniqueMicroTask[]
}

export interface EncyclopediaTechniqueSectionModel {
  sectionId: EncyclopediaTechniqueKind
  title: string
  blurb: string
  items: EncyclopediaTechniqueCardModel[]
}
