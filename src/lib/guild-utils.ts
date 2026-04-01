/**
 * Утилиты для гильдии
 */

import type { Adventurer, RecoveryQuest, GuildState } from '@/types/guild'
import type { CraftedWeaponV2 } from '@/types/craft-v2'
import type { ExpeditionTemplate } from '@/data/expedition-templates'

// ================================
// Тип результата экспедиции
// ================================

export interface ExpeditionResult {
  success: boolean
  partialSuccess: boolean
  weaponLost: boolean
  commission: number
  warSoul: number
  bonusGold: number
  bonusResources: { resource: string; amount: number }[]
  glory: number
  weaponWear: number
  recoveryQuest?: RecoveryQuest
}

// ================================
// Slice State и Actions
// ================================

export type GuildSliceState = GuildState

export type GuildActions = {
  // Искатели
  refreshAdventurers: () => void
  initializeAdventurers: () => void

  // Экспедиции
  startExpedition: (
    expedition: ExpeditionTemplate,
    adventurer: Adventurer,
    weapon: CraftedWeaponV2
  ) => boolean
  cancelExpedition: (expeditionId: string) => void
  completeExpedition: (expeditionId: string) => ExpeditionResult | null

}

