/**
 * Репутация гильдии по «ступеням» ранга: прогресс внутри текущего уровня,
 * ручное повышение ранга за накопленные очки, без автоповышения и без демоции.
 */

import {
  GUILD_LEVELS,
  getGuildReputationLevel,
  type GuildState,
} from '@/types/guild'

export const MAX_GUILD_LEVEL = 10

/** Порог суммарной репутации (legacy), с которого начинается уровень `level`. */
export function getEntryReputationThresholdForLevel(level: number): number {
  const d = GUILD_LEVELS.find((l) => l.level === level)
  return d?.requiredReputation ?? 0
}

/** Очков нужно накопить в текущем ранге, чтобы открыть кнопку «Повысить ранг». */
export function getRankUpCost(currentLevel: number): number {
  if (currentLevel >= MAX_GUILD_LEVEL) return 0
  const next = GUILD_LEVELS.find((l) => l.level === currentLevel + 1)
  const cur = GUILD_LEVELS.find((l) => l.level === currentLevel)
  if (!next || !cur) return 0
  return next.requiredReputation - cur.requiredReputation
}

/** Верхняя граница прогресса в ранге (для clamp при начислении). На макс. уровне — без потолка. */
export function getReputationCapForCurrentRank(level: number): number {
  if (level >= MAX_GUILD_LEVEL) return Number.MAX_SAFE_INTEGER
  const cap = getRankUpCost(level)
  return cap > 0 ? cap : Number.MAX_SAFE_INTEGER
}

export function clampReputationToRankCap(level: number, reputation: number): number {
  const r = Math.max(0, reputation)
  if (level >= MAX_GUILD_LEVEL) return r
  const cap = getRankUpCost(level)
  if (cap <= 0) return r
  return Math.min(r, cap)
}

/** Сколько ещё очков не хватает до возможности повысить ранг (0 — можно повышать). */
export function getReputationPointsToAffordRankUp(
  level: number,
  reputationInRank: number
): number {
  if (level >= MAX_GUILD_LEVEL) return 0
  const cost = getRankUpCost(level)
  if (cost <= 0) return 0
  return Math.max(0, cost - Math.max(0, reputationInRank))
}

/**
 * Миграция с накопительной репутации (до STORE_VERSION 18) к прогрессу внутри ранга.
 */
export function migrateGuildReputationTierFromLegacy(guild: GuildState): GuildState {
  const oldCumulative = Math.max(0, Number(guild.reputation) || 0)
  const inferredLevel = getGuildReputationLevel(oldCumulative)
  const entry = getEntryReputationThresholdForLevel(inferredLevel)
  let progress = oldCumulative - entry
  if (inferredLevel >= MAX_GUILD_LEVEL) {
    progress = Math.max(0, progress)
  } else {
    progress = clampReputationToRankCap(inferredLevel, progress)
  }

  const levelData = GUILD_LEVELS.find((l) => l.level === inferredLevel)
  return {
    ...guild,
    level: inferredLevel,
    reputation: progress,
    maxKnownAdventurers: levelData?.maxKnownAdventurers ?? guild.maxKnownAdventurers,
  }
}
