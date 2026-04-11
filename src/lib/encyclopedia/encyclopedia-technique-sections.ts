/**
 * Сборка секций и карточек техник для энциклопедии (ENC roadmap P0b).
 */

import { allTechniques } from '@/data/techniques'
import { allMaterialProcessingTechniques } from '@/data/material-processing-techniques'
import { MATERIAL_STUDY_TECHNIQUES } from '@/data/material-study-techniques'
import { REFORGE_TECHNIQUES } from '@/data/reforge/reforge-techniques-registry'
import { REPAIR_TECHNIQUE_REGISTRY } from '@/data/weapon-damage/repair-techniques-registry'
import { materialById } from '@/data/materials'
import type {
  EncyclopediaTechniqueCardModel,
  EncyclopediaTechniqueKind,
  EncyclopediaTechniqueRef,
  EncyclopediaTechniqueSectionModel,
} from '@/types/encyclopedia-techniques'
import type { Technique } from '@/types/craft-v2'
import type { MaterialProcessingTechnique } from '@/data/material-processing-techniques'
import type { MaterialStudyTechnique } from '@/types/material-study'
import type { ReforgeTechniqueEntry } from '@/data/reforge/reforge-techniques-registry'
import type { RepairTechniqueDefinition } from '@/types/weapon-repair'
import { appendWorkStepsToEncyclopediaModels } from '@/lib/encyclopedia/expand-technique-display-steps'

export function techniqueRefToStableKey(ref: EncyclopediaTechniqueRef): string {
  return `${ref.kind}:${ref.id}`
}

function materialNames(ids: string[], max = 4): string {
  const names = ids
    .slice(0, max)
    .map(mid => materialById[mid]?.identity.name ?? mid)
    .join(', ')
  const rest = ids.length > max ? ` (+${ids.length - max})` : ''
  return names + rest
}

function craftSourceSubLabel(sourceType: string): string {
  if (sourceType === 'start') return 'Старт'
  if (sourceType === 'guild') return 'Гильдия'
  if (sourceType === 'dungeon') return 'Подземелье'
  return sourceType
}

function formatDurationMs(ms: number): string {
  const m = Math.round(ms / 60_000)
  if (m >= 60) {
    const h = Math.floor(m / 60)
    const mm = m % 60
    return mm > 0 ? `${h} ч ${mm} мин` : `${h} ч`
  }
  return `${m} мин`
}

function craftCard(t: Technique): EncyclopediaTechniqueCardModel {
  const applies = t.effects.appliesTo?.length ? t.effects.appliesTo.join(', ') : '—'
  const rows: EncyclopediaTechniqueCardModel['summaryRows'] = [
    { label: 'Части', value: applies },
    { label: 'Источник', value: craftSourceSubLabel(t.source.type) },
  ]
  if (t.requiredLevel != null) {
    rows.push({ label: 'Уровень', value: String(t.requiredLevel) })
  }
  const bonuses: string[] = []
  if (t.effects.qualityBonus) bonuses.push(`кач. +${t.effects.qualityBonus}`)
  if (t.effects.attackBonus) bonuses.push(`атака +${t.effects.attackBonus}`)
  if (t.effects.durabilityBonus) bonuses.push(`прочн. +${t.effects.durabilityBonus}`)
  if (bonuses.length) rows.push({ label: 'Бонусы', value: bonuses.join(', ') })

  const detail: string[] = []
  if (t.penalties?.durationMultiplier) {
    detail.push(`Время процесса: ×${t.penalties.durationMultiplier}`)
  }
  if (t.penalties?.riskOfFailure) {
    detail.push(`Риск: ${t.penalties.riskOfFailure}%`)
  }

  return {
    ref: { kind: 'craft', id: t.id },
    name: t.name,
    description: t.description,
    familyLabel: 'Приём ковки',
    subLabel: craftSourceSubLabel(t.source.type),
    summaryRows: rows,
    detailHintLines: detail.length ? detail : undefined,
    relatedMaterialIds: t.requiredMaterials?.length ? [...t.requiredMaterials] : undefined,
  }
}

function processingCard(p: MaterialProcessingTechnique): EncyclopediaTechniqueCardModel {
  const targets = materialNames(p.targetCatalogMaterialIds)
  const roles =
    p.targetSemanticProcessRoles?.length && p.targetSemanticProcessRoles.join(', ')
  const rows: EncyclopediaTechniqueCardModel['summaryRows'] = [
    { label: 'Целевые материалы', value: targets || '—' },
    {
      label: 'Доступ',
      value: p.unlockedByDefault ? 'Старт' : 'По разблокировке',
    },
  ]
  if (p.processingQualityBonus != null) {
    rows.push({ label: 'Бонус обработки', value: `+${p.processingQualityBonus}` })
  }
  if (p.outcomeModifiers?.forecastSpreadTightness != null) {
    rows.push({
      label: 'Прогноз',
      value: `сжатие разброса ${(p.outcomeModifiers.forecastSpreadTightness * 100).toFixed(1)}%`,
    })
  }

  const detail: string[] = []
  if (p.incompatibleWithMaterialProcessingTechniqueIds?.length) {
    detail.push(
      `Несовместима с обработкой: ${p.incompatibleWithMaterialProcessingTechniqueIds.join(', ')}`
    )
  }
  if (p.incompatibleWithCraftTechniqueIds?.length) {
    detail.push(`Несовместима с приёмами: ${p.incompatibleWithCraftTechniqueIds.join(', ')}`)
  }
  if (p.refiningRecipeId) {
    detail.push(`Рецепт горна: ${p.refiningRecipeId}`)
  }

  return {
    ref: { kind: 'material_processing', id: p.id },
    name: p.name,
    description: p.description,
    familyLabel: 'Обработка материала',
    subLabel: roles || 'Плавка / подготовка',
    summaryRows: rows,
    detailHintLines: detail.length ? detail : undefined,
    relatedMaterialIds: p.targetCatalogMaterialIds.length ? [...p.targetCatalogMaterialIds] : undefined,
  }
}

function studyCard(s: MaterialStudyTechnique): EncyclopediaTechniqueCardModel {
  const costLine = s.materialCosts
    .map(c => `${materialById[c.materialId]?.identity.name ?? c.materialId} ×${c.quantity}`)
    .join(', ')
  const rows: EncyclopediaTechniqueCardModel['summaryRows'] = [
    { label: 'Длительность', value: formatDurationMs(s.durationMs) },
    { label: 'Расход', value: costLine || '—' },
  ]
  if (s.targetMaterialIds?.length) {
    rows.push({
      label: 'Только для материалов',
      value: materialNames(s.targetMaterialIds, 6),
    })
  }
  const related = [...new Set(s.materialCosts.map(c => c.materialId))]
  return {
    ref: { kind: 'material_study', id: s.id },
    name: s.name,
    description: s.description ?? '',
    familyLabel: 'Изучение в энциклопедии',
    subLabel: 'Сессия изучения',
    summaryRows: rows,
    relatedMaterialIds: related.length ? related : undefined,
  }
}

function reforgeCard(r: ReforgeTechniqueEntry): EncyclopediaTechniqueCardModel {
  const typeLine =
    r.reforgeType === 'buffStat'
      ? `${r.buffStat === 'attack' ? 'Атака' : 'Прочность'} (бафф)`
      : 'Пробуждение шрама'
  const rows: EncyclopediaTechniqueCardModel['summaryRows'] = [
    { label: 'Тип', value: typeLine },
    { label: 'Душа войны', value: String(r.warSoulCost) },
    { label: 'Гильдия (мин. ур.)', value: String(r.minGuildLevel) },
  ]
  if (r.reforgeTier === 'specialized') {
    rows.push({ label: 'Уровень', value: 'Специализированная' })
  }
  const detail: string[] = []
  if (r.sourceCraftTechniqueId) {
    detail.push(`Требует обработку: ${r.sourceCraftTechniqueId}`)
  }
  if (r.catalogMaterialSpendIds?.length) {
    detail.push(`Расход каталога: ${r.catalogMaterialSpendIds.join(', ')}`)
  }

  return {
    ref: { kind: 'reforge', id: r.id },
    name: r.name,
    description: r.description,
    familyLabel: 'Перековка',
    subLabel: r.reforgeTier === 'basic' ? 'Базовая' : 'Специализированная',
    summaryRows: rows,
    detailHintLines: detail.length ? detail : undefined,
    relatedMaterialIds: r.catalogMaterialSpendIds ? [...r.catalogMaterialSpendIds] : undefined,
  }
}

function repairCard(rep: RepairTechniqueDefinition): EncyclopediaTechniqueCardModel {
  const rows: EncyclopediaTechniqueCardModel['summaryRows'] = [
    {
      label: 'Повреждения',
      value: rep.clearsTagIds.length ? `${rep.clearsTagIds.length} тип(ов) тегов` : 'Только сервис',
    },
    { label: 'Этапов', value: String(rep.stages.length) },
    { label: 'Золото', value: String(rep.goldCost) },
  ]
  const matKeys = Object.keys(rep.materials)
  if (matKeys.length) {
    rows.push({
      label: 'Материалы',
      value: matKeys.map(k => `${k} ×${rep.materials[k]}`).join(', '),
    })
  }

  /** Чипы навигации только для каталожных id (legacy ключи без `materialById` — только текст в сводке). */
  const relatedCatalogIds = matKeys.filter(k => materialById[k] != null)

  return {
    ref: { kind: 'repair', id: rep.id },
    name: rep.name,
    description: rep.description,
    familyLabel: 'Ремонт',
    subLabel: rep.repairTier === 'basic' ? 'Базовая' : 'Специализированная',
    summaryRows: rows,
    detailHintLines:
      rep.clearsTagIds.length > 0 && rep.clearsTagIds.length <= 8
        ? [`Теги: ${rep.clearsTagIds.join(', ')}`]
        : rep.clearsTagIds.length > 8
          ? [`Теги: ${rep.clearsTagIds.length} шт. (см. реестр)`]
          : undefined,
    relatedMaterialIds: relatedCatalogIds.length ? relatedCatalogIds : undefined,
  }
}

export const ENCYCLOPEDIA_TECHNIQUE_SECTION_META: Record<
  EncyclopediaTechniqueKind,
  { title: string; blurb: string }
> = {
  craft: {
    title: 'Приёмы ковки',
    blurb:
      'Модификаторы процесса крафта оружия (качество, этапы, части). Отдельно от обработки сырья и плавки.',
  },
  material_processing: {
    title: 'Обработка материала',
    blurb:
      'Плавка руды, заготовки дерева, камня, кожи и т.д. Обычно идёт раньше формообразования клинка в крафтовой линии.',
  },
  material_study: {
    title: 'Изучение в энциклопедии',
    blurb: 'Таймерные сессии для роста экспертизы по материалам; расход материалов по данным сессии.',
  },
  reforge: {
    title: 'Перековка',
    blurb: 'Техники до алтаря: усиление статов и пробуждение шрамов; связь с душой войны и гильдией.',
  },
  repair: {
    title: 'Ремонт',
    blurb: 'Многоэтапное восстановление оружия по тегам повреждений; базовые и узкие техники.',
  },
}

/** Порядок под-вкладок в разделе «Техники» (ENC P2d). */
export const ENCYCLOPEDIA_TECHNIQUE_KIND_TAB_ORDER: EncyclopediaTechniqueKind[] = [
  'material_processing',
  'craft',
  'material_study',
  'reforge',
  'repair',
]

export const DEFAULT_TECHNIQUE_KIND_TAB: EncyclopediaTechniqueKind =
  ENCYCLOPEDIA_TECHNIQUE_KIND_TAB_ORDER[0]

const ENC_KIND_TAB_SET = new Set<EncyclopediaTechniqueKind>(ENCYCLOPEDIA_TECHNIQUE_KIND_TAB_ORDER)

export function isEncyclopediaTechniqueKindTab(value: unknown): value is EncyclopediaTechniqueKind {
  return typeof value === 'string' && ENC_KIND_TAB_SET.has(value as EncyclopediaTechniqueKind)
}

/**
 * Собирает пять секций энциклопедии техник из реестров проекта.
 * Подмешивает «Ход работы» через {@link appendWorkStepsToEncyclopediaModels}.
 */
export function buildEncyclopediaTechniqueSections(): EncyclopediaTechniqueSectionModel[] {
  const byKind: Record<EncyclopediaTechniqueKind, EncyclopediaTechniqueCardModel[]> = {
    craft: allTechniques.map(craftCard),
    material_processing: allMaterialProcessingTechniques.map(processingCard),
    material_study: MATERIAL_STUDY_TECHNIQUES.map(studyCard),
    reforge: REFORGE_TECHNIQUES.map(reforgeCard),
    repair: REPAIR_TECHNIQUE_REGISTRY.map(repairCard),
  }

  appendWorkStepsToEncyclopediaModels(byKind)

  return ENCYCLOPEDIA_TECHNIQUE_KIND_TAB_ORDER.map(kind => ({
    sectionId: kind,
    title: ENCYCLOPEDIA_TECHNIQUE_SECTION_META[kind].title,
    blurb: ENCYCLOPEDIA_TECHNIQUE_SECTION_META[kind].blurb,
    items: byKind[kind],
  }))
}

export function flattenEncyclopediaTechniqueModels(
  sections: EncyclopediaTechniqueSectionModel[]
): EncyclopediaTechniqueCardModel[] {
  return sections.flatMap(s => s.items)
}
