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
import type { AdventurerExtended } from '@/types/adventurer-extended'
import type {
  Adventurer,
  ActiveExpedition,
  GuildState,
  RecoveryQuest,
  StartExpeditionFullOptions,
} from '@/types/guild'
import { getMaxActiveExpeditions, calculateReputationGain } from '@/types/guild'
import type { ExpeditionResult } from '@/store/slices/guild-slice'
import type { ResourceKey } from '@/store/slices/resources-slice'
import type { GameStatistics, Player } from '@/store/slices/player-slice'

export type GuildExpeditionStoreDeps = {
  guild: GuildState
  weaponInventory: { weapons: CraftedWeaponV2[] }
  player: Player
  statistics: GameStatistics
  canAfford: (cost: Partial<Record<ResourceKey, number>>) => boolean
  spendResource: (key: ResourceKey, amount: number) => void
  addResource: (key: ResourceKey, amount: number) => void
  addExperience: (amount: number) => void
  updateStatistics: (partial: Partial<GameStatistics>) => void
  removeWeapon: (weaponId: string) => boolean
  addWarSoulToWeapon: (
    weaponId: string,
    points: number,
    durabilityLoss?: number,
    epicGain?: number
  ) => boolean
  discoverMaterial?: (materialId: string) => void
  addMaterialExpertise?: (materialId: string, amount: number) => void
  addMaterialToStash?: (materialId: string, amount: number) => void
}

export function buildGuildExpeditionCrossSlice<S extends GuildExpeditionStoreDeps>(
  set: (fn: (s: S) => { guild: GuildState }) => void,
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

      const maxActive = getMaxActiveExpeditions(state.guild.level)
      if (state.guild.activeExpeditions.length >= maxActive) {
        return false
      }

      if (weapon.currentDurability <= 10) return false
      if (weapon.stats.attack < expedition.minWeaponAttack) return false

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

      const adventurerExtended = expedition.adventurerExtended

      const fallbackExtended: AdventurerExtended = {
        id: expedition.adventurerId,
        identity: {
          firstName: expedition.adventurerName,
          lastName: '',
          gender: 'male',
          portraitId: 0,
        },
        combat: {
          level: 10,
          rarity: 'common',
          power: 25,
          precision: 25,
          endurance: 25,
          luck: 25,
          combatStyle: 'berserker',
          preferredWeapons: [],
          avoidedWeapons: [],
        },
        personality: {
          primaryTrait: 'brave',
          secondaryTrait: 'honourable',
          motivations: ['gold'],
          socialTags: [],
          riskTolerance: 'balanced',
        },
        traits: [],
        uniqueBonuses: [],
        strengths: [],
        weaknesses: [],
        requirements: { minAttack: 0 },
        createdAt: Date.now(),
        expiresAt: Date.now() + 86400000,
      }

      const activeContract: ContractType = expedition.contractType ?? 'exploration'

      const calculation = calculateExpeditionResultV2(
        adventurerExtended ?? fallbackExtended,
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

      const commission = Math.floor(calculation.commission * (isCrit ? 1.5 : 1))
      const warSoul = Math.floor(calculation.warSoul * (isCrit ? 1.5 : 1))
      const glory = Math.floor(
        (template.reward.baseWarSoul * 0.1 + (success ? 5 : 2)) * (isCrit ? 1.5 : 1)
      )

      const weaponWear = calculation.weaponWear

      const weaponLossChance = calculation.weaponLossChance
      const weaponLost = !success && Math.random() * 100 < weaponLossChance

      const eventLootGold = success ? moduleBonusGold : 0
      const result: ExpeditionResult = {
        success,
        commission,
        warSoul,
        bonusGold: eventLootGold,
        glory,
        reputation: success
          ? calculateReputationGain('expedition', template.reward.baseGold, state.player.level)
          : 0,
        weaponWear,
        weaponLost,
        isCrit,
        materialsGained:
          success && adjustedMaterialGrants.length > 0 ? adjustedMaterialGrants : undefined,
      }

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
      if (result.warSoul > 0 && weapon) {
        const baseEpicGain = 0.05
        const successBonus = result.success ? 0.03 : 0
        const critBonus = result.isCrit ? 0.05 : 0
        const epicGain = baseEpicGain + successBonus + critBonus + Math.random() * 0.02

        state.addWarSoulToWeapon(weapon.id, result.warSoul, result.weaponWear, epicGain)
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

      state.updateStatistics({
        totalExpeditions: (state.statistics.totalExpeditions ?? 0) + 1,
      })

      set((s) => ({
        guild: {
          ...s.guild,
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
      }))

      return result
    },
  }
}
