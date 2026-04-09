/**
 * Сборка плана ремонта из выбранных техник (чистые функции, без store).
 */

import {
  DURABILITY_MAINTENANCE_TECHNIQUE_ID,
  REPAIR_TECHNIQUE_REGISTRY,
  getRepairTechniqueById,
} from '@/data/weapon-damage/repair-techniques-registry'
import type {
  MergedRepairStage,
  RepairTechniqueDefinition,
  WeaponRepairPlan,
} from '@/types/weapon-repair'

/** Базовая техника или куплена у интенданта — можно выбрать в плане. */
export function isRepairTechniqueUnlocked(
  techniqueId: string,
  unlockedRepairTechniqueIds: readonly string[]
): boolean {
  const t = getRepairTechniqueById(techniqueId)
  if (!t) return false
  if (t.repairTier === 'basic') return true
  return unlockedRepairTechniqueIds.includes(techniqueId)
}

/** Все техники в плане базовые — при успехе шрамы с вероятностью (см. REPAIR_BASIC_SCAR_ON_SUCCESS_CHANCE). */
export function repairPlanUsesOnlyBasicTechniques(techniqueIds: readonly string[]): boolean {
  if (techniqueIds.length === 0) return true
  return techniqueIds.every((id) => getRepairTechniqueById(id)?.repairTier === 'basic')
}

/** Оставить только разблокированные для игрока. */
export function filterRepairTechniquesByUnlock(
  techniques: readonly RepairTechniqueDefinition[],
  unlockedRepairTechniqueIds: readonly string[]
): RepairTechniqueDefinition[] {
  return techniques.filter((t) => isRepairTechniqueUnlocked(t.id, unlockedRepairTechniqueIds))
}

/** Применимые к тегам + фильтр по разблокировкам (интендант). */
export function getApplicableRepairTechniquesForTagsUnlocked(
  activeTagIds: readonly string[],
  unlockedRepairTechniqueIds: readonly string[]
): RepairTechniqueDefinition[] {
  return filterRepairTechniquesByUnlock(
    getApplicableRepairTechniquesForTags(activeTagIds),
    unlockedRepairTechniqueIds
  )
}

/** Техники, у которых есть пересечение clearsTagIds с активными тегами оружия */
export function getApplicableRepairTechniquesForTags(
  activeTagIds: readonly string[]
): RepairTechniqueDefinition[] {
  if (activeTagIds.length === 0) {
    return REPAIR_TECHNIQUE_REGISTRY.filter((t) => t.repairTier === 'basic')
  }
  const set = new Set(activeTagIds)
  return REPAIR_TECHNIQUE_REGISTRY.filter(
    (t) =>
      t.id !== DURABILITY_MAINTENANCE_TECHNIQUE_ID &&
      t.clearsTagIds.some((cid) => set.has(cid))
  )
}

/**
 * Слияние этапов в порядке выбора техник; порядок этапов — сквозная нумерация.
 * Дубликаты id техник в входе схлопываются (первое вхождение).
 */
export function buildWeaponRepairPlan(
  selectedTechniqueIds: readonly string[]
): WeaponRepairPlan | null {
  const unique = [...new Set(selectedTechniqueIds)]
  if (unique.length === 0) return null

  const techniques: RepairTechniqueDefinition[] = []
  for (const id of unique) {
    const t = getRepairTechniqueById(id)
    if (!t) return null
    techniques.push(t)
  }

  let order = 0
  const stages: MergedRepairStage[] = []
  for (const tech of techniques) {
    for (const st of tech.stages) {
      order += 1
      stages.push({
        order,
        stageTemplateId: st.id,
        name: st.name,
        baseDurationSec: st.baseDurationSec,
        category: st.category,
        sourceTechniqueId: tech.id,
        sourceTechniqueName: tech.name,
      })
    }
  }

  const mergedMaterials: Record<string, number> = {}
  let totalGold = 0
  for (const tech of techniques) {
    totalGold += tech.goldCost
    for (const [k, v] of Object.entries(tech.materials)) {
      mergedMaterials[k] = (mergedMaterials[k] ?? 0) + v
    }
  }

  return {
    techniqueIds: unique,
    stages,
    totalGold,
    mergedMaterials,
  }
}

/** Активные теги, которые ни одна из выбранных техник не закрывает */
export function getUncoveredActiveTags(
  activeTagIds: readonly string[],
  selectedTechniqueIds: readonly string[]
): string[] {
  const covered = new Set<string>()
  for (const id of new Set(selectedTechniqueIds)) {
    const t = getRepairTechniqueById(id)
    if (!t) continue
    for (const cid of t.clearsTagIds) covered.add(cid)
  }
  return activeTagIds.filter((tid) => !covered.has(tid))
}
