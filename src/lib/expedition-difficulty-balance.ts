/**
 * Единый числовой баланс сложности экспедиций (хост + модуль expeditions).
 * Калькулятор v2, UI тиров и справочник модуля DIFFICULTY_INFO опираются на эти значения.
 */

import type { ExpeditionDifficulty } from '@/types/expedition-domain'

export interface ExpeditionDifficultyBalance {
  failureChance: number
  weaponLossChance: number
  levelRange: [number, number]
  /** Множитель для формул награды в контенте модуля (см. DIFFICULTY_INFO) */
  rewardMultiplier: number
  /** Уровень миссии 1–5 (звёзды / сопоставление с искателем) */
  tier: number
}

export const EXPEDITION_DIFFICULTY_BALANCE: Record<
  ExpeditionDifficulty,
  ExpeditionDifficultyBalance
> = {
  easy: {
    failureChance: 5,
    weaponLossChance: 5,
    levelRange: [1, 10],
    rewardMultiplier: 1.0,
    tier: 1,
  },
  normal: {
    failureChance: 15,
    weaponLossChance: 10,
    levelRange: [8, 20],
    rewardMultiplier: 1.5,
    tier: 2,
  },
  hard: {
    failureChance: 30,
    weaponLossChance: 15,
    levelRange: [18, 30],
    rewardMultiplier: 2.0,
    tier: 3,
  },
  extreme: {
    failureChance: 50,
    weaponLossChance: 20,
    levelRange: [28, 40],
    rewardMultiplier: 3.0,
    tier: 4,
  },
  legendary: {
    failureChance: 70,
    weaponLossChance: 25,
    levelRange: [38, 50],
    rewardMultiplier: 5.0,
    tier: 5,
  },
}
