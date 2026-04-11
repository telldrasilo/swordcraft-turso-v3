/**
 * Микрозадачи для карточки энциклопедии и задел под Крафтовую линию (ENC §10.3, §5.5).
 */

import { allMaterialProcessingTechniques } from '@/data/material-processing-techniques'
import { getTechniqueById } from '@/data/techniques'
import { REPAIR_TECHNIQUE_REGISTRY } from '@/data/weapon-damage/repair-techniques-registry'
import type { MaterialProcessingTechnique } from '@/data/material-processing-techniques'
import type {
  EncyclopediaTechniqueCardModel,
  EncyclopediaTechniqueKind,
  EncyclopediaTechniqueRef,
  TechniqueMicroTask,
} from '@/types/encyclopedia-techniques'

function stepsFromProcessingOperations(
  p: MaterialProcessingTechnique
): TechniqueMicroTask[] {
  const explicit = p.microTasks
  if (explicit?.length) {
    return explicit.map((t, i) => ({
      id: t.id ?? `${p.id}_mt_${i}`,
      label: t.label,
      hint: t.hint,
      durationWeight: t.durationWeight,
    }))
  }
  const ops = p.processingOperations
  if (!ops?.length) return []
  return [...ops]
    .sort((a, b) => a.order - b.order)
    .map((op, i) => ({
      id: op.id,
      label:
        op.refiningRecipeId ||
        op.stageTypeHint?.replace(/^prep_/, '').replace(/_/g, ' ') ||
        `Операция ${i + 1}`,
      durationWeight:
        op.durationSeconds != null && op.durationSeconds > 0 ? op.durationSeconds : undefined,
    }))
}

function stepsFromRepairTechnique(techniqueId: string): TechniqueMicroTask[] {
  const rep = REPAIR_TECHNIQUE_REGISTRY.find(r => r.id === techniqueId)
  if (!rep?.stages.length) return []
  return rep.stages.map(s => ({
    id: s.id,
    label: s.name,
  }))
}

function workStepsForRef(
  kind: EncyclopediaTechniqueKind,
  id: string
): TechniqueMicroTask[] {
  if (kind === 'material_processing') {
    const p = allMaterialProcessingTechniques.find(t => t.id === id)
    return p ? stepsFromProcessingOperations(p) : []
  }
  if (kind === 'craft') {
    const t = getTechniqueById(id)
    if (!t) return []
    const explicit = t.microTasks
    if (explicit?.length) {
      return explicit.map((x, i) => ({
        id: x.id ?? `${id}_mt_${i}`,
        label: x.label,
        hint: x.hint,
        durationWeight: x.durationWeight,
      }))
    }
    return [{ id: `${id}_line`, label: t.name }]
  }
  if (kind === 'repair') {
    return stepsFromRepairTechnique(id)
  }
  return []
}

/**
 * Шаги «Ход работы» для карточки ENC и будущей Крафтовой линии (§10.3).
 * Для обработки — из `microTasks` или fallback по `processingOperations`;
 * для ремонта — из этапов техники; остальные семейства — пока пусто.
 */
export function expandTechniqueToDisplaySteps(ref: EncyclopediaTechniqueRef): TechniqueMicroTask[] {
  return workStepsForRef(ref.kind, ref.id)
}

/**
 * Дополняет модели полем `workSteps`, если удалось вывести шаги.
 */
export function appendWorkStepsToEncyclopediaModels(
  byKind: Record<EncyclopediaTechniqueKind, EncyclopediaTechniqueCardModel[]>
): void {
  for (const kind of Object.keys(byKind) as EncyclopediaTechniqueKind[]) {
    for (const model of byKind[kind]) {
      const steps = expandTechniqueToDisplaySteps(model.ref)
      if (steps.length > 0) {
        model.workSteps = steps
      }
    }
  }
}
