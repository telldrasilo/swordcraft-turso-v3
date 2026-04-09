/**
 * Cross-slice: ремонт оружия (resources + inventory). Кузнец = игрок (`player.level`).
 * Вызывается из game-store-composed; get/set — Zustand API полного стора.
 */

import type { RepairType, ExecuteRepairResult, WeaponRepairCalc } from '@/data/repair-system'
import { describeTechniqueRepairFailureMessage } from '@/lib/weapon-damage/repair-failure-copy'
import type { CraftingCost, Resources, ResourceKey } from '@/store/slices/resources-slice'
import type { RepairTechniqueStageRunState, WeaponInventory } from '@/store/slices/craft-slice'
import type { CraftedWeaponV2 } from '@/types/craft-v2'
import type { ActiveDamageTagEntry } from '@/types/weapon-damage'
import { withRecalculatedPowerScore } from '@/lib/craft/weapon-power-score'
import {
  getRepairOptionsForWeapon,
  craftedWeaponV2ToWeaponRepairCalc,
  mapTechniqueIdsToRepairDiceProfile,
  pickRepairDiceProfileAllowedByTags,
  repairDiceProfileToRepairType,
  assertRepairPlanCostsMet,
  executeRepairWithPlanCosts,
  resolveWeaponRepairPlanEconomy,
  scaleMaterialCostRecord,
} from '@/lib/store-utils/repair-utils'
import type { RepairExecutionRollModifiers } from '@/lib/store-utils/repair-utils'
import {
  buildWeaponRepairPlan,
  getUncoveredActiveTags,
  isRepairTechniqueUnlocked,
  repairPlanUsesOnlyBasicTechniques,
} from '@/lib/weapon-damage/build-repair-plan'
import {
  DURABILITY_MAINTENANCE_TECHNIQUE_ID,
  getRepairTechniqueById,
} from '@/data/weapon-damage/repair-techniques-registry'
import {
  WEAPON_DEEP_INSPECT_DURATION_MS,
  WEAPON_DEEP_INSPECT_MATERIAL_COST,
  REPAIR_WRONG_HYPOTHESIS_SUCCESS_PENALTY_POINTS,
  REPAIR_WORKBENCH_STAGE_SUCCESS_BONUS_CAP,
  REPAIR_WORKBENCH_STAGE_SUCCESS_BONUS_PER_STAGE,
  WEAPON_LEGACY_RESONANCE_BASE_CHANCE,
  WEAPON_LEGACY_RESONANCE_BOND_CAP,
  WEAPON_LEGACY_RESONANCE_BOND_PER_POINT,
  REPAIR_BASIC_SCAR_ON_SUCCESS_CHANCE,
  WEAPON_DURABILITY_MAINTENANCE_RESTORE_MULT,
} from '@/lib/store-utils/constants'
import {
  appendHiddenMark,
  collectDeepInspectSnapshotFromTags,
  ensureWeaponLegacy,
  incrementRepairDiagnosisCountsForTags,
  REPAIR_LEGACY_RESONANCE_ID,
} from '@/lib/weapon-damage/weapon-legacy'
import { incrementScarWeightsFromClearedTags } from '@/lib/weapon-damage/scar-weights'
import type { RepairTechniqueExecutionOptions } from '@/types/repair-execution'
import { diagnosisTierForRemovedTag } from '@/types/repair-execution'

const HEAVY_REPAIR_TYPES: RepairType[] = ['quality', 'restoration', 'enhancement']

type PreparedTechniqueRepair =
  | { ok: false; error: string }
  | {
      ok: true
      weaponId: string
      weapon: CraftedWeaponV2
      techniqueIds: string[]
      opts?: RepairTechniqueExecutionOptions
      playerLevel: number
      materialsForPlan: Record<string, number>
      model: WeaponRepairCalc
      repairType: RepairType
      damageTags: ActiveDamageTagEntry[]
      rollModifiers: RepairExecutionRollModifiers | undefined
      resources: Resources
      materialStash: Record<string, number>
    }

function prepareTechniqueRepairExecution(
  state: RepairStoreSlice,
  weaponId: string,
  techniqueIds: string[],
  opts?: RepairTechniqueExecutionOptions
): PreparedTechniqueRepair {
  const weapon = state.weaponInventory.weapons.find((w) => w.id === weaponId)
  if (!weapon) {
    return { ok: false, error: 'Оружие не найдено' }
  }

  const damageTags = weapon.activeDamageTags ?? []
  const tagIds = damageTags.map((e) => e.tagId)
  const noTagsSelectedOnlyBasic =
    tagIds.length === 0 &&
    techniqueIds.length > 0 &&
    techniqueIds.every((tid) => {
      const t = getRepairTechniqueById(tid)
      return t?.repairTier === 'basic'
    })

  if (tagIds.length === 0 && !noTagsSelectedOnlyBasic) {
    return {
      ok: false,
      error: 'Без видимых повреждений доступны только базовые техники восстановления',
    }
  }

  const unlockedRepair = state.unlockedRepairTechniqueIds ?? []
  for (const tid of techniqueIds) {
    if (!isRepairTechniqueUnlocked(tid, unlockedRepair)) {
      return {
        ok: false,
        error: 'Техника не разблокирована. Купите её у интенданта гильдии.',
      }
    }
  }

  const plan = buildWeaponRepairPlan(techniqueIds)
  if (!plan) {
    return { ok: false, error: 'Некорректный набор техник' }
  }

  if (tagIds.length > 0) {
    const uncovered = getUncoveredActiveTags(tagIds, techniqueIds)
    if (uncovered.length > 0) {
      return {
        ok: false,
        error: 'Выберите техники, закрывающие все видимые повреждения',
      }
    }
  }

  const playerLevel = Math.max(1, state.player?.level ?? 1)
  const { materials: planMaterialsRaw } = resolveWeaponRepairPlanEconomy(weapon, plan, playerLevel)
  let materialsForPlan = { ...planMaterialsRaw }
  if (opts?.materialCostMultiplier && opts.materialCostMultiplier !== 1) {
    materialsForPlan = scaleMaterialCostRecord(materialsForPlan, opts.materialCostMultiplier)
  }

  const model = craftedWeaponV2ToWeaponRepairCalc(weapon)
  const preferred = mapTechniqueIdsToRepairDiceProfile(techniqueIds)
  const repairType = repairDiceProfileToRepairType(
    pickRepairDiceProfileAllowedByTags(preferred, damageTags)
  )

  let successChanceDelta = 0
  const stageCount = opts?.workbenchCompletedStages
  if (typeof stageCount === 'number' && stageCount > 0) {
    successChanceDelta += Math.min(
      REPAIR_WORKBENCH_STAGE_SUCCESS_BONUS_CAP,
      stageCount * REPAIR_WORKBENCH_STAGE_SUCCESS_BONUS_PER_STAGE
    )
  }
  if (
    opts?.diagnosis?.mode === 'manual_inspection' &&
    tagIds.some((tid) => opts.diagnosis?.hypothesisByTagId?.[tid] === false)
  ) {
    successChanceDelta -= REPAIR_WRONG_HYPOTHESIS_SUCCESS_PENALTY_POINTS
  }

  return {
    ok: true,
    weaponId,
    weapon,
    techniqueIds,
    opts,
    playerLevel,
    materialsForPlan,
    model,
    repairType,
    damageTags,
    rollModifiers: successChanceDelta !== 0 ? { successChanceDelta } : undefined,
    resources: state.resources,
    materialStash: state.materialStash,
  }
}

function manualLegacyResonanceChance(bladeBondBefore: number): number {
  return (
    WEAPON_LEGACY_RESONANCE_BASE_CHANCE +
    Math.min(
      WEAPON_LEGACY_RESONANCE_BOND_CAP,
      bladeBondBefore * WEAPON_LEGACY_RESONANCE_BOND_PER_POINT
    )
  )
}

/** Минимальный контракт стора для блока ремонта (без циклического импорта GameStore). */
export type RepairStoreSlice = {
  unlockedRepairTechniqueIds: string[]
  workbenchQueue: { weaponId: string }[]
  weaponInventory: {
    weapons: import('@/types/craft-v2').CraftedWeaponV2[]
  }
  player: { level: number }
  resources: Resources
  materialStash: Record<string, number>
  spendCraftingCostWithStash: (cost: import('@/store/slices/resources-slice').CraftingCost) => boolean
  canAfford: (cost: Partial<Record<ResourceKey, number>>) => boolean
  spendResource: (resource: ResourceKey, amount: number) => boolean
}

export function buildRepairCrossSlice(
  set: (partial: unknown) => void,
  get: () => RepairStoreSlice
) {
  return {
    preflightWeaponRepairByTechniques: (
      weaponId: string,
      techniqueIds: string[],
      opts?: RepairTechniqueExecutionOptions
    ): ExecuteRepairResult => {
      const prep = prepareTechniqueRepairExecution(get(), weaponId, techniqueIds, opts)
      if (!prep.ok) return { success: false, error: prep.error }
      const gate = assertRepairPlanCostsMet(
        prep.model,
        prep.repairType,
        prep.playerLevel,
        prep.resources,
        prep.materialStash,
        prep.damageTags,
        prep.materialsForPlan
      )
      if (!gate.ok) return { success: false, error: gate.error }
      return { success: true }
    },

    executeWeaponRepairByTechniques: (
      weaponId: string,
      techniqueIds: string[],
      opts?: RepairTechniqueExecutionOptions
    ): ExecuteRepairResult => {
      const prep = prepareTechniqueRepairExecution(get(), weaponId, techniqueIds, opts)
      if (!prep.ok) return { success: false, error: prep.error }

      const rawExec = executeRepairWithPlanCosts(
        prep.model,
        prep.repairType,
        prep.playerLevel,
        prep.resources,
        prep.materialStash,
        prep.damageTags,
        prep.materialsForPlan,
        prep.rollModifiers
      )

      let result: ExecuteRepairResult = rawExec
      if (!rawExec.success && rawExec.result) {
        result = {
          ...rawExec,
          error: describeTechniqueRepairFailureMessage({
            repairCalc: prep.model,
            roll: rawExec.result,
            opts,
            activeTagIds: prep.damageTags.map((e) => e.tagId),
            workbenchQueueFinale: (opts?.workbenchCompletedStages ?? 0) > 0,
          }),
        }
      }

      const roll = result.result
      if (result.success && roll) {
        const cost: CraftingCost = { ...prep.materialsForPlan }
        if (!get().spendCraftingCostWithStash(cost)) {
          return { success: false, error: 'Не удалось списать ресурсы' }
        }
      }

      if (roll) {
        const isDurabilityOnlyMaintenance =
          techniqueIds.length === 1 && techniqueIds[0] === DURABILITY_MAINTENANCE_TECHNIQUE_ID
        const durabilityRestoredApplied = isDurabilityOnlyMaintenance
          ? Math.max(
              0,
              Math.floor(roll.durabilityRestored * WEAPON_DURABILITY_MAINTENANCE_RESTORE_MULT)
            )
          : roll.durabilityRestored
        set(
          (s: {
            weaponInventory: WeaponInventory
            repairBenchTechniqueDraft: { weaponId: string; techniqueIds: string[] } | null
            repairTechniqueStageRun: RepairTechniqueStageRunState | null
          }) => {
            const stageRun = s.repairTechniqueStageRun
            const clearAdhocRun =
              roll.success &&
              stageRun?.weaponId === weaponId &&
              stageRun.source !== 'queue'
            const clearDraft =
              roll.success && s.repairBenchTechniqueDraft?.weaponId === weaponId
            return {
              repairBenchTechniqueDraft: clearDraft ? null : s.repairBenchTechniqueDraft,
              repairTechniqueStageRun: clearAdhocRun ? null : s.repairTechniqueStageRun,
              weaponInventory: {
                ...s.weaponInventory,
                weapons: s.weaponInventory.weapons.map((w) => {
                  if (w.id !== weaponId) return w
                  const cur = w.currentDurability ?? w.stats.durability
              const newDur = Math.min(
                roll.maxDurabilityAfter,
                Math.max(0, cur + durabilityRestoredApplied)
              )
              let nextLegacy = ensureWeaponLegacy(w.weaponLegacy)
              const bladeBondBefore = nextLegacy.bladeBondRepairCount ?? 0
              let bladeBondRepairCount = bladeBondBefore
              if (roll.success && HEAVY_REPAIR_TYPES.includes(prep.repairType)) {
                bladeBondRepairCount = bladeBondBefore + 1
              }
              if (roll.success && Math.random() < manualLegacyResonanceChance(bladeBondBefore)) {
                nextLegacy = appendHiddenMark(nextLegacy, REPAIR_LEGACY_RESONANCE_ID)
              }
              const prevTagIds = prep.damageTags.map((e) => e.tagId)
              if (roll.success && prevTagIds.length > 0) {
                const counts = { ...(nextLegacy.repairResolveCountByTagId ?? {}) }
                const archived = [...(nextLegacy.archivedDamageTagIds ?? [])]
                for (const tid of prevTagIds) {
                  counts[tid] = (counts[tid] ?? 0) + 1
                  if (!archived.includes(tid)) archived.push(tid)
                }
                nextLegacy = {
                  ...nextLegacy,
                  repairResolveCountByTagId: counts,
                  archivedDamageTagIds: archived,
                }
                if (opts?.diagnosis) {
                  for (const tid of prevTagIds) {
                    const tier = diagnosisTierForRemovedTag(tid, opts.diagnosis)
                    if (tier !== null) {
                      nextLegacy = incrementRepairDiagnosisCountsForTags(
                        nextLegacy,
                        [tid],
                        tier
                      )
                    }
                  }
                }
                const tagsForScarRoll = repairPlanUsesOnlyBasicTechniques(techniqueIds)
                  ? prevTagIds.filter(() => Math.random() < REPAIR_BASIC_SCAR_ON_SUCCESS_CHANCE)
                  : prevTagIds
                const scars = incrementScarWeightsFromClearedTags(
                  nextLegacy.physicalScarWeights,
                  nextLegacy.elementalScarWeights,
                  tagsForScarRoll
                )
                nextLegacy = {
                  ...nextLegacy,
                  physicalScarWeights: scars.physicalScarWeights,
                  elementalScarWeights: scars.elementalScarWeights,
                }
              }
              return withRecalculatedPowerScore({
                ...w,
                currentDurability: newDur,
                stats: {
                  ...w.stats,
                  durability: newDur,
                  maxDurability: roll.maxDurabilityAfter,
                  attack: Math.max(1, w.stats.attack - roll.attackLost),
                },
                warSoul: Math.max(0, w.warSoul - roll.soulLost),
                epicMultiplier: Math.max(1, w.epicMultiplier - roll.epicLost),
                activeDamageTags: roll.success ? [] : w.activeDamageTags,
                repairCondition: roll.success ? 'ok' : w.repairCondition,
                autoRepairReadyAt: roll.success ? undefined : w.autoRepairReadyAt,
                autoRepairAwaitingForgeVisit: roll.success
                  ? undefined
                  : w.autoRepairAwaitingForgeVisit,
                weaponLegacy: {
                  ...nextLegacy,
                  bladeBondRepairCount,
                },
              })
                }),
              },
            }
          }
        )
      }

      return result
    },

    getRepairOptions: (weaponId: string) => {
      const state = get()
      const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
      if (!weapon) return []

      const playerLevel = Math.max(1, state.player?.level ?? 1)
      const model = craftedWeaponV2ToWeaponRepairCalc(weapon)
      return getRepairOptionsForWeapon(model, playerLevel, weapon.activeDamageTags ?? [])
    },

    /** Уровень персонажа игрока — основа мастерства починки (см. `getSmithMastery`). */
    getPlayerLevelForRepair: () => Math.max(1, get().player?.level ?? 1),

    /**
     * Старт глубокого осмотра: списание материалов, таймер на экземпляре (`deepInspectReadyAt`).
     */
    startWeaponDeepInspect: (weaponId: string): { success: boolean; error?: string } => {
      const state = get()
      const weapon = state.weaponInventory.weapons.find((w) => w.id === weaponId)
      if (!weapon) return { success: false, error: 'Оружие не найдено' }
      const prev = ensureWeaponLegacy(weapon.weaponLegacy)
      if (prev.deepInspectReadyAt != null && Date.now() < prev.deepInspectReadyAt) {
        return { success: false, error: 'Осмотр уже идёт' }
      }
      const matCost = { ...WEAPON_DEEP_INSPECT_MATERIAL_COST } as CraftingCost
      if (!state.canAfford(matCost)) {
        return { success: false, error: 'Недостаточно материалов для осмотра' }
      }
      if (!get().spendCraftingCostWithStash(matCost)) {
        return { success: false, error: 'Не удалось списать материалы' }
      }
      const readyAt = Date.now() + WEAPON_DEEP_INSPECT_DURATION_MS
      set((s: { weaponInventory: WeaponInventory }) => ({
        weaponInventory: {
          ...s.weaponInventory,
          weapons: s.weaponInventory.weapons.map((w: CraftedWeaponV2) => {
            if (w.id !== weaponId) return w
            const leg = ensureWeaponLegacy(w.weaponLegacy)
            return {
              ...w,
              weaponLegacy: { ...leg, deepInspectReadyAt: readyAt },
            }
          }),
        },
      }))
      return { success: true }
    },

    /** Завершить осмотр после `deepInspectReadyAt` — снимок подсказок по тегам. */
    completeWeaponDeepInspect: (weaponId: string): { success: boolean; error?: string } => {
      const state = get()
      const weapon = state.weaponInventory.weapons.find((w) => w.id === weaponId)
      if (!weapon) return { success: false, error: 'Оружие не найдено' }
      const leg = ensureWeaponLegacy(weapon.weaponLegacy)
      if (leg.deepInspectReadyAt == null || Date.now() < leg.deepInspectReadyAt) {
        return { success: false, error: 'Осмотр ещё не завершён' }
      }
      const at = Date.now()
      set((s: { weaponInventory: WeaponInventory }) => ({
        weaponInventory: {
          ...s.weaponInventory,
          weapons: s.weaponInventory.weapons.map((w: CraftedWeaponV2) => {
            if (w.id !== weaponId) return w
            const prev = ensureWeaponLegacy(w.weaponLegacy)
            const { notes, tagIds } = collectDeepInspectSnapshotFromTags(w.activeDamageTags ?? [])
            const next: typeof prev = {
              ...prev,
              lastDeepInspectAt: at,
              deepInspectReadyAt: undefined,
            }
            if (notes.length > 0) {
              next.deepInspectNotes = notes
              next.deepInspectTagIds = tagIds
            }
            return {
              ...w,
              weaponLegacy: next,
            }
          }),
        },
      }))
      return { success: true }
    },
  }
}
