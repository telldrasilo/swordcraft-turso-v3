/**
 * Cross-slice: старт и завершение экспедиции (guild + resources + craft + player).
 */

import { generateId } from '@/lib/store-utils/generators'
import { expeditionTemplates, type ExpeditionTemplate } from '@/data/expedition-templates'
import { missionModuleToCalculatorTemplate } from '@/lib/expedition-mission-bridge'
import {
  aggregateModuleEventEffectsForCompletion,
  buildExpeditionStartEvents,
} from '@/lib/expedition-module-events-host'
import { calculateExpeditionResult as calculateExpeditionResultV2 } from '@/lib/expedition-calculator-v2'
import { getLocationById, getMissionById } from '@/modules/expeditions'
import {
  CONTRACT_CONFIG,
  type ContractType,
} from '@/modules/expeditions/data/missions/_mission-template'
import { getRouteDurationSeconds } from '@/lib/expedition-contract-economy'
import { getAdventurerFullName } from '@/lib/adventurer-generator'
import type { CraftedWeaponV2 } from '@/types/craft-v2'
import type { WorkbenchQueueItem } from '@/lib/workbench/workbench-queue'
import type { RepairTechniqueStageRunState } from '@/store/slices/craft-slice'
import type { ActiveDamageTagEntry } from '@/types/weapon-damage'
import type { AdventurerExtended } from '@/types/adventurer-extended'
import type {
  Adventurer,
  ActiveExpedition,
  GuildState,
  RecoveryQuest,
  StartExpeditionFullOptions,
} from '@/types/guild'
import { calculateReputationGain } from '@/types/guild'
import { validateExpeditionStart } from '@/lib/expedition-start-validation'
import { buildActiveDamageTagsFromMissionSnapshots } from '@/lib/expedition-post-mission-damage'
import { getDamageTagById } from '@/data/weapon-damage/damage-tag-registry'
import type { ExpeditionResult } from '@/store/slices/guild-slice'
import type { ResourceKey } from '@/store/slices/resources-slice'
import type { GameStatistics, Player } from '@/store/slices/player-slice'
import { getWarSoulTierBonus } from '@/data/war-soul-tiers'
import { convertToExtended } from '@/lib/adventurer-converter'
import { WEAPON_REPAIR_GUIDANCE_EXPEDITION_MILESTONE } from '@/lib/store-utils/constants'
import type { TutorialState } from '@/store/slices/tutorial-slice'
import {
  FORGOTTEN_FORGE_QUEST_ID,
  FORGOTTEN_FORGE_STEP3_INSURANCE_GOLD,
} from '@/data/quests/forgotten-forge'

export type GuildExpeditionStoreDeps = {
  guild: GuildState
  workbenchQueue: WorkbenchQueueItem[]
  repairTechniqueStageRun: RepairTechniqueStageRunState | null
  weaponInventory: { weapons: CraftedWeaponV2[] }
  player: Player
  statistics: GameStatistics
  canAfford: (cost: Partial<Record<ResourceKey, number>>) => boolean
  spendResource: (key: ResourceKey, amount: number) => boolean
  addResource: (key: ResourceKey, amount: number) => void
  addExperience: (amount: number) => void
  updateStatistics: (partial: Partial<GameStatistics>) => void
  removeWeapon: (weaponId: string) => boolean
  addWarSoulToWeapon: (
    weaponId: string,
    points: number,
    durabilityLoss?: number,
    epicGain?: number,
    appendDamageTags?: ActiveDamageTagEntry[]
  ) => boolean
  discoverMaterial?: (materialId: string) => void
  addMaterialExpertise?: (materialId: string, amount: number) => void
  addMaterialToStash?: (materialId: string, amount: number) => void
  addReputation: (amount: number) => void
  tutorial: TutorialState
  /** Квест «Эхо забытой кузни» (опционально, если slice подключён) */
  forgottenForgeQuest?: { step: number; flags: { step3Insurance?: boolean } }
  advanceForgottenForgeAfterExpedition?: (payload: {
    locationId?: string
    success: boolean
    linkedQuestId?: string
  }) => void
}

/** Множитель «раз в 20 меньше» к формуле репутации за экспедицию (до применения addReputation). */
const EXPEDITION_GUILD_REPUTATION_DIVISOR = 20

export function buildGuildExpeditionCrossSlice<S extends GuildExpeditionStoreDeps>(
  set: (
    updater:
      | Partial<{ guild: GuildState; tutorial: TutorialState }>
      | ((s: S) => Partial<{ guild: GuildState; tutorial: TutorialState }>)
  ) => void,
  get: () => S
) {
  return {
    startExpeditionFull: (
      expedition: ExpeditionTemplate,
      adventurer: Adventurer,
      weapon: CraftedWeaponV2,
      extendedAdventurer?: AdventurerExtended,
      options?: StartExpeditionFullOptions
    ): boolean => {
      const state = get()

      const startCheck = validateExpeditionStart({
        expedition,
        adventurer,
        weapon,
        guildLevel: state.guild.level,
        activeExpeditions: state.guild.activeExpeditions,
        workbenchEligibility: {
          workbenchQueue: state.workbenchQueue ?? [],
          repairTechniqueStageRun: state.repairTechniqueStageRun ?? null,
        },
      })
      if (!startCheck.can) return false

      if (
        options?.linkedQuestId === FORGOTTEN_FORGE_QUEST_ID &&
        state.forgottenForgeQuest?.step === 3 &&
        state.forgottenForgeQuest.flags.step3Insurance === true
      ) {
        if (!state.spendResource('gold', FORGOTTEN_FORGE_STEP3_INSURANCE_GOLD)) return false
      }

      const startedAt = Date.now()
      const expeditionForEvents: ExpeditionTemplate =
        options?.contractOverride != null
          ? { ...expedition, moduleContractType: options.contractOverride }
          : expedition
      const eventResult = buildExpeditionStartEvents(expeditionForEvents, startedAt)

      const durMult = Math.max(0.1, options?.devBalance?.durationMultiplier ?? 1)
      const contractKey: ContractType =
        options?.contractOverride ?? expedition.moduleContractType ?? 'exploration'
      const routeSec = getRouteDurationSeconds(expedition.duration, contractKey)
      const wallMs = Math.max(1000, Math.round((routeSec * 1000) / durMult))

      const db = options?.devBalance
      const eventGold = db?.eventGoldMultiplier ?? db?.quantityMultiplier ?? 1
      const matQty = db?.materialQuantityMultiplier ?? 1
      const matRare = db?.materialRarityMultiplier ?? 1
      const devBalanceTweaks =
        db &&
        (db.durationMultiplier !== 1 ||
          eventGold !== 1 ||
          db.qualityShift !== 0 ||
          matQty !== 1 ||
          matRare !== 1)
          ? db
          : undefined

      const newExpedition: ActiveExpedition = {
        id: generateId(),
        expeditionId: expedition.id,
        expeditionName: expedition.name,
        expeditionIcon: expedition.icon,
        adventurerId: adventurer.id,
        adventurerName: getAdventurerFullName(adventurer),
        adventurerData: adventurer,
        adventurerExtended: extendedAdventurer,
        weaponId: weapon.id,
        weaponName: weapon.fullName,
        weaponData: weapon,
        startedAt: startedAt,
        endsAt: startedAt + wallMs,
        deposit: expedition.cost.deposit,
        suppliesCost: expedition.cost.supplies,
        events: eventResult.events,
        locationId: eventResult.locationId,
        missionTemplateId: eventResult.missionTemplateId,
        contractType: eventResult.contractType,
        moduleEventSnapshots:
          eventResult.moduleEventSnapshots.length > 0
            ? eventResult.moduleEventSnapshots
            : undefined,
        devBalanceTweaks,
        linkedQuestId: options?.linkedQuestId,
      }

      set((s) => ({
        guild: {
          ...s.guild,
          activeExpeditions: [...s.guild.activeExpeditions, newExpedition],
        },
      }))

      return true
    },

    skipExpeditionToNextEvent: (expeditionId: string): void => {
      const state = get()
      const ex = state.guild.activeExpeditions.find((e) => e.id === expeditionId)
      if (!ex?.events?.length) return

      const now = Date.now()
      const sorted = [...ex.events].sort((a, b) => a.triggeredAt - b.triggeredAt)
      const next = sorted.find((e) => e.triggeredAt > now)
      if (!next) return

      const delta = next.triggeredAt - now
      set((s) => ({
        guild: {
          ...s.guild,
          activeExpeditions: s.guild.activeExpeditions.map((e) => {
            if (e.id !== expeditionId) return e
            const newEnds = Math.max(now, e.endsAt - delta)
            return {
              ...e,
              endsAt: newEnds,
              events: e.events!.map((ev) => ({ ...ev, triggeredAt: ev.triggeredAt - delta })),
            }
          }),
        },
      }))
    },

    skipExpeditionTimelineToEnd: (expeditionId: string): void => {
      const state = get()
      const ex = state.guild.activeExpeditions.find((e) => e.id === expeditionId)
      if (!ex) return

      const now = Date.now()
      set((s) => ({
        guild: {
          ...s.guild,
          activeExpeditions: s.guild.activeExpeditions.map((e) => {
            if (e.id !== expeditionId) return e
            return {
              ...e,
              endsAt: now,
              events: e.events?.map((ev) => ({
                ...ev,
                triggeredAt: Math.min(ev.triggeredAt, now),
              })),
            }
          }),
        },
      }))
    },

    completeExpeditionFull: (expeditionId: string): ExpeditionResult | null => {
      const state = get()
      const expedition = state.guild.activeExpeditions.find((e) => e.id === expeditionId)
      if (!expedition) return null

      let template = expeditionTemplates.find((t) => t.id === expedition.expeditionId)
      if (!template) {
        const mission = getMissionById(expedition.expeditionId)
        if (!mission) return null
        template = missionModuleToCalculatorTemplate(mission)
      }

      const weapon = state.weaponInventory.weapons.find((w) => w.id === expedition.weaponId)
      if (!weapon) return null

      const adventurerForCalc: AdventurerExtended | undefined =
        expedition.adventurerExtended ??
        (expedition.adventurerData ? convertToExtended(expedition.adventurerData) : undefined)

      if (!adventurerForCalc) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            '[completeExpeditionFull] Нет adventurerExtended и adventurerData — завершение отменено',
            expedition.id
          )
        }
        return null
      }

      const activeContract: ContractType = expedition.contractType ?? 'exploration'

      const calculation = calculateExpeditionResultV2(
        adventurerForCalc,
        template,
        state.guild.level,
        weapon.stats.attack,
        weapon.currentDurability,
        weapon.type as never,
        weapon.id,
        weapon.qualityRank,
        weapon.epicMultiplier,
        weapon.combatMaterialId,
        weapon.quality,
        activeContract
      )

      let successChanceBonus = 0
      let moduleBonusGold = 0
      const mergedMaterialGrants: Array<{ materialId: string; quantity: number }> = []
      if (expedition.locationId && expedition.moduleEventSnapshots?.length) {
        const location = getLocationById(expedition.locationId)
        if (location) {
          const seedBase = Math.floor(expedition.startedAt % 2147483647)
          const agg = aggregateModuleEventEffectsForCompletion(
            expedition.moduleEventSnapshots,
            location,
            seedBase
          )
          successChanceBonus = agg.successChanceDelta
          moduleBonusGold = agg.bonusGold
          const byId = new Map<string, number>()
          for (const g of agg.materialGrants) {
            byId.set(g.materialId, (byId.get(g.materialId) ?? 0) + g.quantity)
          }
          mergedMaterialGrants.push(
            ...[...byId.entries()].map(([materialId, quantity]) => ({ materialId, quantity }))
          )
        }
      }

      const tweaks = expedition.devBalanceTweaks
      const eventGoldMult = tweaks?.eventGoldMultiplier ?? tweaks?.quantityMultiplier ?? 1
      const matQtyMult = tweaks?.materialQuantityMultiplier ?? 1
      const matRareMult = tweaks?.materialRarityMultiplier ?? 1
      if (tweaks) {
        successChanceBonus += tweaks.qualityShift
        moduleBonusGold = Math.floor(moduleBonusGold * eventGoldMult)
      }

      const matContractMult = CONTRACT_CONFIG[activeContract].materialFindMultiplier
      const adjustedMaterialGrants = mergedMaterialGrants.map((g) => ({
        materialId: g.materialId,
        quantity: Math.max(
          1,
          Math.floor(g.quantity * matContractMult * matQtyMult * matRareMult)
        ),
      }))

      const adjustedSuccessChance = Math.min(
        100,
        Math.max(0, calculation.successChance + successChanceBonus)
      )

      const roll = Math.random() * 100
      const success = roll < adjustedSuccessChance
      const isCrit = success && Math.random() * 100 < calculation.critChance

      const commission = success
        ? Math.floor(calculation.commission * (isCrit ? 1.5 : 1))
        : 0
      // Бонус тира к душе; отдельные модификаторы миссии (ивенты, контракты) — позже, см. war-soul-tiers.
      const tierSoulPct = getWarSoulTierBonus(weapon.warSoul, weapon.maxWarSoul).warSoulBonus
      const warSoulTierMult = 1 + tierSoulPct / 100
      const soulPotentialMult = weapon.soulPotential ?? 1
      const warSoul = success
        ? Math.floor(
            calculation.warSoul * soulPotentialMult * warSoulTierMult * (isCrit ? 1.5 : 1)
          )
        : 0
      const glory = success
        ? Math.floor(calculation.guildGloryOnSuccess * (isCrit ? 1.5 : 1))
        : 0

      const weaponWear = calculation.weaponWear

      const weaponLossChance = calculation.weaponLossChance
      const weaponLost = !success && Math.random() * 100 < weaponLossChance

      const eventLootGold = success ? moduleBonusGold : 0
      const rawReputation = success
        ? calculateReputationGain('expedition', template.reward.baseGold, state.player.level)
        : 0
      const reputationGain =
        success && rawReputation > 0
          ? Math.max(1, Math.floor(rawReputation / EXPEDITION_GUILD_REPUTATION_DIVISOR))
          : 0

      const result: ExpeditionResult = {
        success,
        commission,
        warSoul,
        bonusGold: eventLootGold,
        glory,
        reputation: reputationGain,
        weaponWear,
        weaponLost,
        isCrit,
        materialsGained:
          success && adjustedMaterialGrants.length > 0 ? adjustedMaterialGrants : undefined,
      }

      let expeditionAppliedVisibleTags = false

      if (result.commission > 0) {
        state.addResource('gold', result.commission)
      }
      if (result.bonusGold > 0) {
        state.addResource('gold', result.bonusGold)
      }

      const discover = state.discoverMaterial
      const addExpertise = state.addMaterialExpertise
      const addToStash = state.addMaterialToStash
      if (
        success &&
        (discover || addToStash || adjustedMaterialGrants.length > 0)
      ) {
        for (const { materialId, quantity } of adjustedMaterialGrants) {
          discover?.(materialId)
          addToStash?.(materialId, quantity)
          const expertiseGain = Math.min(50, Math.max(1, Math.round(Math.sqrt(quantity) * 3)))
          addExpertise?.(materialId, expertiseGain)
        }
      }
      if (weapon && !result.weaponLost) {
        const baseEpicGain = 0.05
        const successBonus = result.success ? 0.03 : 0
        const critBonus = result.isCrit ? 0.05 : 0
        const epicGain =
          result.warSoul > 0
            ? baseEpicGain + successBonus + critBonus + Math.random() * 0.02
            : 0.02

        const completedAtMs = Date.now()
        const locationForTags =
          expedition.locationId != null ? getLocationById(expedition.locationId) : undefined
        const presentElementsForTags = locationForTags?.presentElements ?? []
        const missionRisk = Math.max(0, Math.min(1, 1 - adjustedSuccessChance / 100))
        const missionDamageTags = expedition.moduleEventSnapshots?.length
          ? buildActiveDamageTagsFromMissionSnapshots({
              snapshots: expedition.moduleEventSnapshots,
              weaponWear: result.weaponWear,
              completedAtMs,
              presentElements: presentElementsForTags,
              expeditionStartedAtMs: expedition.startedAt,
              currentDurability: weapon.currentDurability ?? weapon.stats.maxDurability,
              maxDurability: weapon.stats.maxDurability,
              existingDamageTagsCount: weapon.activeDamageTags?.length ?? 0,
              missionRisk,
            })
          : []
        const damageTagLabelsApplied =
          missionDamageTags.length > 0
            ? missionDamageTags.map((t) => getDamageTagById(t.tagId)?.label ?? t.tagId)
            : undefined

        expeditionAppliedVisibleTags = missionDamageTags.length > 0

        state.addWarSoulToWeapon(
          weapon.id,
          result.warSoul,
          result.weaponWear,
          epicGain,
          missionDamageTags.length > 0 ? missionDamageTags : undefined
        )
        if (damageTagLabelsApplied) {
          result.damageTagLabelsApplied = damageTagLabelsApplied
        }
      }
      if (reputationGain > 0) {
        state.addReputation(reputationGain)
      }

      if (result.glory) {
        set((s) => ({
          guild: {
            ...s.guild,
            glory: s.guild.glory + result.glory,
          },
        }))
      }

      if (result.weaponLost) {
        const recoveryQuest: RecoveryQuest = {
          id: generateId(),
          lostWeaponId: weapon.id,
          lostWeaponData: weapon,
          originalExpeditionId: expedition.expeditionId,
          originalExpeditionName: expedition.expeditionName,
          cost: Math.max(
            50,
            Math.floor(((template.reward?.baseGold ?? expedition.suppliesCost) || 100) * 0.35)
          ),
          duration: template.duration * 2,
          status: 'available',
        }
        set((s) => ({
          guild: {
            ...s.guild,
            recoveryQuests: [...s.guild.recoveryQuests, recoveryQuest],
          },
        }))
        state.removeWeapon(weapon.id)
      }

      state.addExperience(result.success ? 20 : 5)

      const prevTotalExpeditions = state.statistics.totalExpeditions ?? 0
      const nextTotalExpeditions = prevTotalExpeditions + 1
      const hitRepairHintMilestone =
        prevTotalExpeditions < WEAPON_REPAIR_GUIDANCE_EXPEDITION_MILESTONE &&
        nextTotalExpeditions >= WEAPON_REPAIR_GUIDANCE_EXPEDITION_MILESTONE

      state.updateStatistics({
        totalExpeditions: nextTotalExpeditions,
      })

      if (
        !state.tutorial.weaponRepairGuidanceConsumed &&
        (expeditionAppliedVisibleTags || hitRepairHintMilestone)
      ) {
        set({
          tutorial: {
            ...get().tutorial,
            weaponRepairGuidancePending: true,
          },
        })
      }

      set((s) => {
        const prev = s.guild.stats
        const stats = {
          ...prev,
          totalExpeditions: prev.totalExpeditions + 1,
          successfulExpeditions: result.success
            ? prev.successfulExpeditions + 1
            : prev.successfulExpeditions,
          failedExpeditions: result.success
            ? prev.failedExpeditions
            : prev.failedExpeditions + 1,
          weaponsLost: result.weaponLost ? prev.weaponsLost + 1 : prev.weaponsLost,
          totalCommission: prev.totalCommission + result.commission,
          totalWarSoul: prev.totalWarSoul + result.warSoul,
          totalGlory: prev.totalGlory + result.glory,
        }
        return {
          guild: {
            ...s.guild,
            stats,
            activeExpeditions: s.guild.activeExpeditions.filter((e) => e.id !== expeditionId),
            history: [
              ...s.guild.history,
              {
                id: generateId(),
                expeditionName: expedition.expeditionName,
                expeditionIcon: expedition.expeditionIcon,
                adventurerName: expedition.adventurerName,
                adventurerData: expedition.adventurerData,
                adventurerExtended: expedition.adventurerExtended,
                weaponName: expedition.weaponName,
                completedAt: Date.now(),
                success: result.success,
                commission: result.commission,
                warSoul: result.warSoul,
                glory: result.glory,
                weaponLost: result.weaponLost,
                isCrit: result.isCrit,
              },
            ],
          },
        }
      })

      get().advanceForgottenForgeAfterExpedition?.({
        locationId: expedition.locationId,
        success: result.success,
        linkedQuestId: expedition.linkedQuestId,
      })

      return result
    },
  }
}
