/**
 * Сборка нормализованной Крафтовой линии для UI (ENC P5b, §12.4).
 */

import type { CraftPlan, RecipeStageConfig, Technique, WeaponRecipe } from '@/types/craft-v2'
import { DEFAULT_GAME_CONFIG } from '@/types/craft-v2'
import { getStageById } from '@/data/stages'
import { collectExpandedStageConfigsForCraft } from '@/lib/craft/process-generator'
import type {
  CraftLineBackboneSegment,
  CraftLineColorToken,
  CraftLinePhase,
  CraftLineSegment,
  CraftLineTechniqueSegment,
} from '@/types/craft-line'
import type { EncyclopediaTechniqueRef } from '@/types/encyclopedia-techniques'
import { expandTechniqueToDisplaySteps } from '@/lib/encyclopedia/expand-technique-display-steps'
import {
  compareCraftLineBlockMeta,
  getEffectiveCraftLineMetaForCombatTechnique,
  getEffectiveCraftLineMetaForProcessing,
} from '@/lib/craft/craft-line-meta'
import { allMaterialProcessingTechniques } from '@/data/material-processing-techniques'
import { getTechniqueById } from '@/data/techniques'
import { isCraftLineRecipeBackboneEnabled } from '@/lib/store-utils/constants'

type RawCraftLineItem =
  | {
      source: 'technique'
      rawWeight: number
      techniqueRef: EncyclopediaTechniqueRef
      microTaskIndex: number | null
      colorToken: CraftLineColorToken
      label: string
    }
  | {
      source: 'recipe_backbone'
      rawWeight: number
      recipeId: string
      stageIndex: number
      stableId: string
      colorToken: CraftLineColorToken
      label: string
    }

function phaseToColorToken(phase: CraftLinePhase): CraftLineColorToken {
  if (phase === 'material_preparation') return 'craftLine.material_preparation'
  if (phase === 'recipe_forming') return 'craftLine.recipe_forming'
  return 'craftLine.craft_finishing'
}

function defaultCraftLinePhaseForStageType(stageType: string): CraftLinePhase {
  if (stageType.startsWith('prep_')) return 'material_preparation'
  if (stageType.startsWith('fin_')) return 'craft_finishing'
  return 'recipe_forming'
}

function resolveBlockMeta(ref: EncyclopediaTechniqueRef): ReturnType<typeof getEffectiveCraftLineMetaForProcessing> & {
  sortId: string
} {
  const sortId = `${ref.kind}:${ref.id}`
  if (ref.kind === 'material_processing') {
    const p = allMaterialProcessingTechniques.find(t => t.id === ref.id)
    return { ...getEffectiveCraftLineMetaForProcessing(p), sortId }
  }
  if (ref.kind === 'craft') {
    const t = getTechniqueById(ref.id)
    if (!t) return { phase: 'craft_finishing', order: 0, sortId }
    return { ...getEffectiveCraftLineMetaForCombatTechnique(t), sortId }
  }
  return { phase: 'recipe_forming', order: 0, sortId }
}

function microTaskWeight(w: number | undefined): number {
  if (w == null || !Number.isFinite(w) || w <= 0) return 1
  return w
}

function buildCraftLineRawFromRefs(refs: EncyclopediaTechniqueRef[]): RawCraftLineItem[] {
  const forgeRefs = refs.filter(r => r.kind === 'material_processing' || r.kind === 'craft')
  const sorted = [...forgeRefs].sort((a, b) =>
    compareCraftLineBlockMeta(resolveBlockMeta(a), resolveBlockMeta(b))
  )

  const rawSegs: RawCraftLineItem[] = []

  for (const ref of sorted) {
    const meta = resolveBlockMeta(ref)
    const phase = meta.phase
    let steps = expandTechniqueToDisplaySteps(ref)
    if (steps.length === 0) {
      steps = [{ id: `${ref.kind}_${ref.id}_line_fallback`, label: ref.id }]
    }
    steps.forEach((task, i) => {
      const rw = microTaskWeight(task.durationWeight)
      rawSegs.push({
        source: 'technique',
        techniqueRef: ref,
        microTaskIndex: steps.length > 1 ? i : 0,
        rawWeight: rw,
        colorToken: phaseToColorToken(phase),
        label: task.label,
      })
    })
  }

  return rawSegs
}

function finalizeRawSegments(raw: RawCraftLineItem[]): CraftLineSegment[] {
  const totalW = raw.reduce((s, x) => s + x.rawWeight, 0)
  if (totalW <= 0) return []

  return raw.map(item => {
    const share = item.rawWeight / totalW
    if (item.source === 'technique') {
      const seg: CraftLineTechniqueSegment = {
        source: 'technique',
        techniqueRef: item.techniqueRef,
        microTaskIndex: item.microTaskIndex,
        colorToken: item.colorToken,
        label: item.label,
        durationShare: share,
      }
      return seg
    }
    const seg: CraftLineBackboneSegment = {
      source: 'recipe_backbone',
      recipeId: item.recipeId,
      stageIndex: item.stageIndex,
      stableId: item.stableId,
      colorToken: item.colorToken,
      label: item.label,
      durationShare: share,
    }
    return seg
  })
}

function recipeStageSlotKey(s: RecipeStageConfig): string {
  const part = s.material ?? s.target ?? ''
  return `${s.stageType}:${part}`
}

function sameRecipePhysicalSlot(cfg: RecipeStageConfig, rs: RecipeStageConfig): boolean {
  return (cfg.material ?? cfg.target ?? '') === (rs.material ?? rs.target ?? '')
}

/** Соответствие строки развёрнутого таймлайна слоту `recipe.stages[recipePtr]` с учётом replaceStage материалов. */
function expandedConsumesRecipePtr(
  cfg: RecipeStageConfig,
  recipe: WeaponRecipe,
  recipePtr: number
): boolean {
  if (recipePtr >= recipe.stages.length) return false
  const rs = recipe.stages[recipePtr]
  if (!rs) return false
  if (recipeStageSlotKey(cfg) === recipeStageSlotKey(rs)) return true
  if (!sameRecipePhysicalSlot(cfg, rs)) return false
  if (cfg.stageType === rs.stageType) return true
  return Boolean(rs.material ?? rs.target)
}

function syntheticBackboneRawItems(
  cfg: RecipeStageConfig,
  recipeId: string,
  expandedIndex: number,
  label: string
): RawCraftLineItem[] {
  const phase = defaultCraftLinePhaseForStageType(cfg.stageType)
  return [
    {
      source: 'recipe_backbone',
      rawWeight: 1,
      recipeId,
      stageIndex: expandedIndex,
      stableId: `${recipeId}_exp_${expandedIndex}_${cfg.stageType}`,
      colorToken: phaseToColorToken(phase),
      label,
    },
  ]
}

function buildBackboneRawForStage(recipe: WeaponRecipe, stageIndex: number): RawCraftLineItem[] {
  const st = recipe.stages[stageIndex]
  if (!st) return []
  const phase = st.craftLinePhase ?? defaultCraftLinePhaseForStageType(st.stageType)
  const steps = st.craftLineMicroSteps
  if (!steps?.length) return []

  return steps.map(step => ({
    source: 'recipe_backbone' as const,
    rawWeight: microTaskWeight(step.durationWeight),
    recipeId: recipe.id,
    stageIndex,
    stableId: step.id,
    colorToken: phaseToColorToken(phase),
    label: step.label,
  }))
}

/**
 * Только хребет рецепта (микроэтапы); сумма долей = 1.
 */
export function buildBackboneSegmentsFromRecipe(recipe: WeaponRecipe): CraftLineBackboneSegment[] {
  const raw: RawCraftLineItem[] = []
  for (let si = 0; si < recipe.stages.length; si++) {
    raw.push(...buildBackboneRawForStage(recipe, si))
  }
  const finalized = finalizeRawSegments(raw)
  return finalized.filter((s): s is CraftLineBackboneSegment => s.source === 'recipe_backbone')
}

/**
 * Упорядочивает техники по фазе линии и разворачивает микрозадачи в плоские сегменты с долями длительности (сумма = 1).
 */
export function buildCraftLine(refs: EncyclopediaTechniqueRef[]): CraftLineSegment[] {
  return finalizeRawSegments(buildCraftLineRawFromRefs(refs))
}

export function collectProcessingRefsFromPlan(plan: CraftPlan): EncyclopediaTechniqueRef[] {
  const refs: EncyclopediaTechniqueRef[] = []
  const seenProc = new Set<string>()
  for (const entry of Object.values(plan.partMaterialSupply ?? {})) {
    if (
      entry.mode === 'ore_smelt' &&
      entry.processingTechniqueId != null &&
      entry.processingTechniqueId.length > 0 &&
      !seenProc.has(entry.processingTechniqueId)
    ) {
      seenProc.add(entry.processingTechniqueId)
      refs.push({ kind: 'material_processing', id: entry.processingTechniqueId })
    }
  }
  return refs
}

export function collectCombatTechniqueRefsFromPlan(plan: CraftPlan): EncyclopediaTechniqueRef[] {
  return plan.techniques.map(tid => ({ kind: 'craft' as const, id: tid }))
}

/** Собирает ссылки на техники из плана: уникальные плавки, затем боевые приёмы в порядке выбора. */
export function collectCraftLineRefsFromPlan(plan: CraftPlan): EncyclopediaTechniqueRef[] {
  return [...collectProcessingRefsFromPlan(plan), ...collectCombatTechniqueRefsFromPlan(plan)]
}

/** Legacy: только техники плана (без хребта рецепта). */
export function buildCraftLineFromPlanLegacy(plan: CraftPlan): CraftLineSegment[] {
  return buildCraftLine(collectCraftLineRefsFromPlan(plan))
}

export function buildCraftLineFromPlan(plan: CraftPlan): CraftLineSegment[] {
  return buildCraftLineFromPlanLegacy(plan)
}

/**
 * Хребет и обработка в порядке развёрнутого таймлайна (`collectExpandedStageConfigsForCraft` = те же правила, что `generateCraftStages`),
 * плюс вставки боевых приёмов по `craftLineAnchorAfterStageIndex` (индекс в **базовом** `recipe.stages`).
 */
export function buildCraftLineFromPlanV2(plan: CraftPlan, recipe: WeaponRecipe): CraftLineSegment[] {
  const techniques = plan.techniques
    .map(id => getTechniqueById(id))
    .filter((t): t is Technique => Boolean(t))

  const expanded = collectExpandedStageConfigsForCraft(
    recipe,
    plan.materials,
    techniques,
    1,
    1,
    DEFAULT_GAME_CONFIG,
    plan.shouldPurchaseMaterials,
    plan.partMaterialSupply,
    {}
  )

  const combatSorted = plan.techniques.map((tid, order) => ({
    tid,
    order,
    anchor: getTechniqueById(tid)?.craftLineAnchorAfterStageIndex ?? Number.POSITIVE_INFINITY,
  })).sort((a, b) => {
    if (a.anchor !== b.anchor) return a.anchor - b.anchor
    return a.order - b.order
  })

  const merged: RawCraftLineItem[] = []
  let recipePtr = 0
  let c = 0

  for (let ei = 0; ei < expanded.length; ei++) {
    const cfg = expanded[ei]
    if (cfg.stageSource === 'processing_technique' && cfg.techniqueId) {
      merged.push(
        ...buildCraftLineRawFromRefs([{ kind: 'material_processing', id: cfg.techniqueId }])
      )
      continue
    }

    if (expandedConsumesRecipePtr(cfg, recipe, recipePtr)) {
      merged.push(...buildBackboneRawForStage(recipe, recipePtr))
      for (;;) {
        const entry = combatSorted[c]
        if (entry == null || entry.anchor !== recipePtr) break
        merged.push(...buildCraftLineRawFromRefs([{ kind: 'craft', id: entry.tid }]))
        c++
      }
      recipePtr++
      continue
    }

    const stMeta = getStageById(cfg.stageType)
    merged.push(
      ...syntheticBackboneRawItems(cfg, recipe.id, ei, stMeta?.name ?? cfg.stageType)
    )
  }

  while (c < combatSorted.length) {
    const entry = combatSorted[c]
    if (entry != null) {
      merged.push(...buildCraftLineRawFromRefs([{ kind: 'craft', id: entry.tid }]))
    }
    c++
  }

  return finalizeRawSegments(merged)
}

export function buildCraftLineFromPlanWithRecipe(
  plan: CraftPlan,
  recipe: WeaponRecipe | undefined,
  opts?: { useRecipeBackbone?: boolean }
): CraftLineSegment[] {
  const use =
    opts?.useRecipeBackbone ??
    (isCraftLineRecipeBackboneEnabled() && recipe != null && recipe.stages.length > 0)

  if (!use || recipe == null) {
    return buildCraftLineFromPlanLegacy(plan)
  }

  const hasBackbone = recipe.stages.some(s => (s.craftLineMicroSteps?.length ?? 0) > 0)
  if (!hasBackbone) {
    return buildCraftLineFromPlanLegacy(plan)
  }

  try {
    const next = buildCraftLineFromPlanV2(plan, recipe)
    if (next.length === 0) return buildCraftLineFromPlanLegacy(plan)
    return next
  } catch {
    return buildCraftLineFromPlanLegacy(plan)
  }
}

/** Доля глобального прогресса [0,1] до начала сегмента `index`. */
export function craftLineCumulativeShareBefore(segments: CraftLineSegment[], index: number): number {
  let s = 0
  for (let i = 0; i < index && i < segments.length; i++) {
    s += segments[i].durationShare
  }
  return s
}

/**
 * Индекс активного сегмента и локальный прогресс внутри него по доле общего времени крафта.
 */
export function resolveCraftLinePosition(
  segments: CraftLineSegment[],
  overallProgress01: number
): { segmentIndex: number; withinSegment01: number } | null {
  if (!segments.length) return null
  const p = Math.min(1, Math.max(0, overallProgress01))
  let acc = 0
  for (let i = 0; i < segments.length; i++) {
    const share = segments[i].durationShare
    const next = acc + share
    if (p <= next || i === segments.length - 1) {
      const within = share > 0 ? Math.min(1, Math.max(0, (p - acc) / share)) : 1
      return { segmentIndex: i, withinSegment01: within }
    }
    acc = next
  }
  return { segmentIndex: segments.length - 1, withinSegment01: 1 }
}

/** Подпись для прогресса (ENC P5d): активная микрозадача. */
export function craftLineCaptionAtOverallProgress(
  segments: CraftLineSegment[],
  overallProgress01: number
): string | null {
  const pos = resolveCraftLinePosition(segments, overallProgress01)
  if (!pos) return null
  return segments[pos.segmentIndex]?.label ?? null
}
