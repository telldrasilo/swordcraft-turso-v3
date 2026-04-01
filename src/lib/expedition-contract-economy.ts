/**
 * Экономика миссии модуля expeditions: оплата заказчика, комиссия гильдии, доли кузнеца и авантюриста.
 */

import {
  CONTRACT_CONFIG,
  GUILD_COMMISSION,
  type ContractType,
} from '@/modules/expeditions/data/missions/_mission-template'

export interface MissionGoldSplit {
  clientGrossGold: number
  guildFeeGold: number
  poolAfterGuild: number
  blacksmithGold: number
  adventurerGold: number
}

export function splitMissionClientPayment(
  clientGrossGold: number,
  guildLevel: number,
  contractType: ContractType
): MissionGoldSplit {
  const gross = Math.max(0, Math.floor(clientGrossGold))
  const commissionPct = GUILD_COMMISSION.calculate(guildLevel)
  const guildFeeGold = Math.floor((gross * commissionPct) / 100)
  const poolAfterGuild = gross - guildFeeGold
  const cfg = CONTRACT_CONFIG[contractType]
  const blacksmithGold = Math.floor((poolAfterGuild * cfg.blacksmithGoldPercent) / 100)
  const adventurerGold = poolAfterGuild - blacksmithGold
  return {
    clientGrossGold: gross,
    guildFeeGold,
    poolAfterGuild,
    blacksmithGold,
    adventurerGold,
  }
}

/** Эффективная длительность маршрута (секунды) с учётом типа договора */
export function getRouteDurationSeconds(
  baseDurationSeconds: number,
  contractType: ContractType
): number {
  const mult = CONTRACT_CONFIG[contractType].durationMultiplier
  return Math.max(60, Math.round(baseDurationSeconds * mult))
}
