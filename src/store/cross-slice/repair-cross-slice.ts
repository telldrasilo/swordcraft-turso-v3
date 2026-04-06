/**
 * Cross-slice: ремонт оружия (resources + inventory). Кузнец = игрок (`player.level`).
 * Вызывается из game-store-composed; get/set — Zustand API полного стора.
 */

import type { RepairType, ExecuteRepairResult } from '@/data/repair-system'
import type { CraftingCost, Resources, ResourceKey } from '@/store/slices/resources-slice'
import type { RepairTechniqueStageRunState, WeaponInventory } from '@/store/slices/craft-slice'
import type { CraftedWeaponV2 } from '@/types/craft-v2'
import { getWeaponAutoRepairGoldCost } from '@/lib/store-utils/repair-balance'
import {
  getRepairOptionsForWeapon,
  craftedWeaponV2ToWeaponRepairCalc,
  mapTechniqueIdsToRepairDiceProfile,
  pickRepairDiceProfileAllowedByTags,
  repairDiceProfileToRepairType,
  executeRepairWithPlanCosts,
  resolveWeaponRepairPlanEconomy,
  scaleMaterialCostRecord,
} from '@/lib/store-utils/repair-utils'
import {
  buildWeaponRepairPlan,
  getUncoveredActiveTags,
  isRepairTechniqueUnlocked,
  repairPlanUsesOnlyBasicTechniques,
} from '@/lib/weapon-damage/build-repair-plan'
import { DURABILITY_MAINTENANCE_TECHNIQUE_ID } from '@/data/weapon-damage/repair-techniques-registry'
import {
  WEAPON_AUTO_REPAIR_DURABILITY_RESTORE_RATIO,
  WEAPON_AUTO_REPAIR_EPIC_MULTIPLIER,
  WEAPON_AUTO_REPAIR_LEGACY_RESONANCE_BASE,
  WEAPON_AUTO_REPAIR_LEGACY_RESONANCE_BOND_CAP,
  WEAPON_AUTO_REPAIR_LEGACY_RESONANCE_BOND_PER_POINT,
  WEAPON_DEEP_INSPECT_DURATION_MS,
  WEAPON_DEEP_INSPECT_MATERIAL_COST,
  REPAIR_WRONG_HYPOTHESIS_SUCCESS_PENALTY_POINTS,
  WEAPON_LEGACY_RESONANCE_BASE_CHANCE,
  WEAPON_LEGACY_RESONANCE_BOND_CAP,
  WEAPON_LEGACY_RESONANCE_BOND_PER_POINT,
  REPAIR_BASIC_SCAR_ON_SUCCESS_CHANCE,
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

function manualLegacyResonanceChance(bladeBondBefore: number): number {
  return (
    WEAPON_LEGACY_RESONANCE_BASE_CHANCE +
    Math.min(
      WEAPON_LEGACY_RESONANCE_BOND_CAP,
      bladeBondBefore * WEAPON_LEGACY_RESONANCE_BOND_PER_POINT
    )
  )
}

function autoLegacyResonanceChance(bladeBondBefore: number): number {
  return (
    WEAPON_AUTO_REPAIR_LEGACY_RESONANCE_BASE +
    Math.min(
      WEAPON_AUTO_REPAIR_LEGACY_RESONANCE_BOND_CAP,
      bladeBondBefore * WEAPON_AUTO_REPAIR_LEGACY_RESONANCE_BOND_PER_POINT
    )
  )
}

/** Минимальный контракт стора для блока ремонта (без циклического импорта GameStore). */
export type RepairStoreSlice = {
  unlockedRepairTechniqueIds: string[]
  repairBenchWeaponId: string | null
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
    executeWeaponRepairByTechniques: (
      weaponId: string,
      techniqueIds: string[],
      opts?: RepairTechniqueExecutionOptions
    ): ExecuteRepairResult => {
      const state = get()
      const weapon = state.weaponInventory.weapons.find((w) => w.id === weaponId)
      if (!weapon) {
        return { success: false, error: 'Оружие не найдено' }
      }

      const damageTags = weapon.activeDamageTags ?? []
      const tagIds = damageTags.map((e) => e.tagId)
      const noTagsDurabilityOk =
        tagIds.length === 0 &&
        techniqueIds.length === 1 &&
        techniqueIds[0] === DURABILITY_MAINTENANCE_TECHNIQUE_ID

      if (tagIds.length === 0 && !noTagsDurabilityOk) {
        return {
          success: false,
          error: 'Без видимых повреждений доступна только техника восстановления прочности',
        }
      }

      const unlockedRepair = get().unlockedRepairTechniqueIds ?? []
      for (const tid of techniqueIds) {
        if (!isRepairTechniqueUnlocked(tid, unlockedRepair)) {
          return {
            success: false,
            error: 'Техника не разблокирована. Купите её у интенданта гильдии.',
          }
        }
      }

      const plan = buildWeaponRepairPlan(techniqueIds)
      if (!plan) {
        return { success: false, error: 'Некорректный набор техник' }
      }

      if (tagIds.length > 0) {
        const uncovered = getUncoveredActiveTags(tagIds, techniqueIds)
        if (uncovered.length > 0) {
          return {
            success: false,
            error: 'Выберите техники, закрывающие все видимые повреждения',
          }
        }
      }

      const playerLevel = Math.max(1, state.player?.level ?? 1)
      const { materials: planMaterialsRaw } = resolveWeaponRepairPlanEconomy(
        weapon,
        plan,
        playerLevel
      )
      let materialsForPlan = { ...planMaterialsRaw }
      if (opts?.materialCostMultiplier && opts.materialCostMultiplier !== 1) {
        materialsForPlan = scaleMaterialCostRecord(
          materialsForPlan,
          opts.materialCostMultiplier
        )
      }

      const model = craftedWeaponV2ToWeaponRepairCalc(weapon)
      const preferred = mapTechniqueIdsToRepairDiceProfile(techniqueIds)
      const repairType = repairDiceProfileToRepairType(
        pickRepairDiceProfileAllowedByTags(preferred, damageTags)
      )

      let successChanceDelta = 0
      if (
        opts?.diagnosis?.mode === 'manual_inspection' &&
        tagIds.some((tid) => opts.diagnosis?.hypothesisByTagId?.[tid] === false)
      ) {
        successChanceDelta -= REPAIR_WRONG_HYPOTHESIS_SUCCESS_PENALTY_POINTS
      }

      const result = executeRepairWithPlanCosts(
        model,
        repairType,
        playerLevel,
        state.resources,
        state.materialStash,
        damageTags,
        materialsForPlan,
        successChanceDelta !== 0 ? { successChanceDelta } : undefined
      )

      const roll = result.result
      if (result.success && roll) {
        const cost: CraftingCost = { ...materialsForPlan }
        if (!get().spendCraftingCostWithStash(cost)) {
          return { success: false, error: 'Не удалось списать ресурсы' }
        }
      }

      if (roll) {
        set(
          (s: {
            weaponInventory: WeaponInventory
            repairBenchWeaponId: string | null
            repairBenchTechniqueDraft: { weaponId: string; techniqueIds: string[] } | null
            repairTechniqueStageRun: RepairTechniqueStageRunState | null
          }) => {
            const clearBench = roll.success && s.repairBenchWeaponId === weaponId
            return {
              repairBenchWeaponId: clearBench ? null : s.repairBenchWeaponId,
              repairBenchTechniqueDraft: clearBench ? null : s.repairBenchTechniqueDraft,
              repairTechniqueStageRun: clearBench ? null : s.repairTechniqueStageRun,
              weaponInventory: {
                ...s.weaponInventory,
                weapons: s.weaponInventory.weapons.map((w) => {
                  if (w.id !== weaponId) return w
                  const cur = w.currentDurability ?? w.stats.durability
              const newDur = Math.min(
                roll.maxDurabilityAfter,
                Math.max(0, cur + roll.durabilityRestored)
              )
              let nextLegacy = ensureWeaponLegacy(w.weaponLegacy)
              const bladeBondBefore = nextLegacy.bladeBondRepairCount ?? 0
              let bladeBondRepairCount = bladeBondBefore
              if (roll.success && HEAVY_REPAIR_TYPES.includes(repairType)) {
                bladeBondRepairCount = bladeBondBefore + 1
              }
              if (roll.success && Math.random() < manualLegacyResonanceChance(bladeBondBefore)) {
                nextLegacy = appendHiddenMark(nextLegacy, REPAIR_LEGACY_RESONANCE_ID)
              }
              const prevTagIds = damageTags.map((e) => e.tagId)
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
              return {
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
                  }
                })
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
     * Очередь «готово при следующем заходе в кузницу» (`settleAutoRepairForgeVisitReady`).
     * Быстрый авто-ремонт — только через `claimWeaponAutoRepair` за золото (без таймера).
     */
    scheduleWeaponAutoRepair: (
      weaponId: string,
      opts?: { mode?: 'next_visit' }
    ): { success: boolean; error?: string } => {
      const mode = opts?.mode ?? 'next_visit'
      const state = get()
      const weapon = state.weaponInventory.weapons.find((w) => w.id === weaponId)
      if (!weapon) return { success: false, error: 'Оружие не найдено' }
      if (mode !== 'next_visit') {
        return { success: false, error: 'Доступна только очередь «при следующем заходе в кузницу»' }
      }
      if (weapon.autoRepairAwaitingForgeVisit) {
        return { success: false, error: 'Уже в очереди (ожидание кузницы)' }
      }
      const cur = weapon.currentDurability ?? weapon.stats.durability
      const maxD = weapon.stats.maxDurability
      const tags = weapon.activeDamageTags ?? []
      if (tags.length === 0 && cur >= maxD) {
        return { success: false, error: 'Нечего чинить' }
      }
      set((s: { weaponInventory: WeaponInventory }) => ({
        weaponInventory: {
          ...s.weaponInventory,
          weapons: s.weaponInventory.weapons.map((w: CraftedWeaponV2) =>
            w.id === weaponId
              ? { ...w, autoRepairAwaitingForgeVisit: true, autoRepairReadyAt: undefined }
              : w
          ),
        },
      }))
      return { success: true }
    },

    /** Вызывать при открытии кузницы: переводит «ожидание захода» в готовность к `claim`. */
    settleAutoRepairForgeVisitReady: () => {
      set((s: { weaponInventory: WeaponInventory }) => ({
        weaponInventory: {
          ...s.weaponInventory,
          weapons: s.weaponInventory.weapons.map((w: CraftedWeaponV2) => {
            if (!w.autoRepairAwaitingForgeVisit) return w
            return {
              ...w,
              autoRepairAwaitingForgeVisit: false,
              autoRepairReadyAt: Date.now(),
            }
          }),
        },
      }))
    },

    /**
     * Мгновенный авто-ремонт за золото: частичная прочность, снятие тегов, мягкий штраф к эпичности;
     * мета диагностики — skipped (как раньше).
     */
    claimWeaponAutoRepair: (weaponId: string): { success: boolean; error?: string } => {
      const state = get()
      const weapon = state.weaponInventory.weapons.find((w) => w.id === weaponId)
      if (!weapon) return { success: false, error: 'Оружие не найдено' }
      if (weapon.autoRepairAwaitingForgeVisit) {
        return {
          success: false,
          error: 'Сначала зайдите в кузницу — очередь обновится на вкладке ремонта',
        }
      }
      const tags = weapon.activeDamageTags ?? []
      const cur = weapon.currentDurability ?? weapon.stats.durability
      const maxD = weapon.stats.maxDurability
      if (tags.length === 0 && cur >= maxD) {
        set((s: { weaponInventory: WeaponInventory }) => ({
          weaponInventory: {
            ...s.weaponInventory,
            weapons: s.weaponInventory.weapons.map((w: CraftedWeaponV2) =>
              w.id === weaponId
                ? { ...w, autoRepairReadyAt: undefined, autoRepairAwaitingForgeVisit: undefined }
                : w
            ),
          },
        }))
        return { success: true }
      }
      const goldCost = getWeaponAutoRepairGoldCost(weapon)
      if (goldCost > 0) {
        if (!state.canAfford({ gold: goldCost })) {
          return { success: false, error: 'Недостаточно золота для авто-ремонта' }
        }
        if (!get().spendResource('gold', goldCost)) {
          return { success: false, error: 'Не удалось списать золото' }
        }
      }
      const gap = maxD - cur
      const restored = gap > 0 ? Math.max(0, Math.floor(gap * WEAPON_AUTO_REPAIR_DURABILITY_RESTORE_RATIO)) : 0
      const newDur = Math.min(maxD, cur + restored)
      let nextLegacy = ensureWeaponLegacy(weapon.weaponLegacy)
      const bladeBondBefore = nextLegacy.bladeBondRepairCount ?? 0
      if (Math.random() < autoLegacyResonanceChance(bladeBondBefore)) {
        nextLegacy = appendHiddenMark(nextLegacy, REPAIR_LEGACY_RESONANCE_ID)
      }
      const autoN = (nextLegacy.autoRepairCompletedCount ?? 0) + 1
      const newEpic = Math.max(1, weapon.epicMultiplier * WEAPON_AUTO_REPAIR_EPIC_MULTIPLIER)
      const prevTagIds = tags.map((e) => e.tagId)
      if (prevTagIds.length > 0) {
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
        nextLegacy = incrementRepairDiagnosisCountsForTags(nextLegacy, prevTagIds, 'skipped')
        const scars = incrementScarWeightsFromClearedTags(
          nextLegacy.physicalScarWeights,
          nextLegacy.elementalScarWeights,
          prevTagIds
        )
        nextLegacy = {
          ...nextLegacy,
          physicalScarWeights: scars.physicalScarWeights,
          elementalScarWeights: scars.elementalScarWeights,
        }
      }
      set((s: { weaponInventory: WeaponInventory }) => ({
        weaponInventory: {
          ...s.weaponInventory,
          weapons: s.weaponInventory.weapons.map((w: CraftedWeaponV2) => {
            if (w.id !== weaponId) return w
            return {
              ...w,
              currentDurability: newDur,
              stats: { ...w.stats, durability: newDur },
              activeDamageTags: [],
              repairCondition: 'ok',
              epicMultiplier: newEpic,
              autoRepairReadyAt: undefined,
              autoRepairAwaitingForgeVisit: undefined,
              weaponLegacy: { ...nextLegacy, autoRepairCompletedCount: autoN },
            }
          }),
        },
      }))
      return { success: true }
    },

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
