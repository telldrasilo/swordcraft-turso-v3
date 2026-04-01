/**
 * Cross-slice: старт и завершение экспедиции (guild + resources + craft + player).
 */

import { generateId } from '@/lib/store-utils/generators'
import { expeditionTemplates, type ExpeditionTemplate } from '@/data/expedition-templates'
import { selectEventsForExpedition } from '@/lib/expedition-event-selector'
import { calculateExpeditionResult as calculateExpeditionResultV2 } from '@/lib/expedition-calculator-v2'
import { getAdventurerFullName } from '@/lib/adventurer-generator'
import type { CraftedWeaponV2 } from '@/types/craft-v2'
import type { AdventurerExtended } from '@/types/adventurer-extended'
import type {
  Adventurer,
  ActiveExpedition,
  GuildState,
  RecoveryQuest,
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
      extendedAdventurer?: AdventurerExtended
    ): boolean => {
      const state = get()

      const maxActive = getMaxActiveExpeditions(state.guild.level)
      if (state.guild.activeExpeditions.length >= maxActive) {
        return false
      }

      const totalCost = expedition.cost.supplies + expedition.cost.deposit
      if (!state.canAfford({ gold: totalCost })) return false

      if (weapon.currentDurability <= 10) return false
      if (weapon.stats.attack < expedition.minWeaponAttack) return false

      state.spendResource('gold', totalCost)

      const startedAt = Date.now()
      const eventResult = selectEventsForExpedition(expedition, startedAt)

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
        endsAt: startedAt + expedition.duration * 1000,
        deposit: expedition.cost.deposit,
        suppliesCost: expedition.cost.supplies,
        events: eventResult.events,
      }

      set((s) => ({
        guild: {
          ...s.guild,
          activeExpeditions: [...s.guild.activeExpeditions, newExpedition],
        },
      }))

      return true
    },

    completeExpeditionFull: (expeditionId: string): ExpeditionResult | null => {
      const state = get()
      const expedition = state.guild.activeExpeditions.find((e) => e.id === expeditionId)
      if (!expedition) return null

      const template = expeditionTemplates.find((t) => t.id === expedition.expeditionId)
      if (!template) return null

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
        weapon.quality
      )

      const roll = Math.random() * 100
      const success = roll < calculation.successChance
      const isCrit = success && Math.random() * 100 < calculation.critChance

      const commission = Math.floor(calculation.commission * (isCrit ? 1.5 : 1))
      const warSoul = Math.floor(calculation.warSoul * (isCrit ? 1.5 : 1))
      const glory = Math.floor(
        (template.reward.baseWarSoul * 0.1 + (success ? 5 : 2)) * (isCrit ? 1.5 : 1)
      )

      const weaponWear = calculation.weaponWear

      const weaponLossChance = calculation.weaponLossChance
      const weaponLost = !success && Math.random() * 100 < weaponLossChance

      const result: ExpeditionResult = {
        success,
        commission,
        warSoul,
        bonusGold: 0,
        glory,
        reputation: success
          ? calculateReputationGain('expedition', template.reward.baseGold, state.player.level)
          : 0,
        weaponWear,
        weaponLost,
        isCrit,
      }

      if (result.commission > 0) {
        state.addResource('gold', result.commission)
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
          cost: Math.floor(expedition.deposit * 0.5),
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
