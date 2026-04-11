/**
 * Мемоизированные селекторы Zustand
 * Используются для оптимизации производительности и избежания лишних ре-рендеров
 */

import { createSelector } from 'reselect'
import { getAvailableAmountForResourceKey } from '@/lib/craft/inventory-check'
import type { ResourceKey } from '@/store/slices/resources-slice'
import type { GameStore } from '../game-store-composed'

// ================================
// PLAYER SELECTORS
// ================================

export const selectPlayer = (state: GameStore) => state.player
export const selectPlayerLevel = (state: GameStore) => state.player.level
export const selectPlayerExperience = (state: GameStore) => state.player.experience
export const selectPlayerFame = (state: GameStore) => state.player.fame
export const selectPlayerName = (state: GameStore) => state.player.name

export const selectLevelProgress = createSelector(
  [selectPlayer],
  (player) => {
    if (player.experienceToNextLevel === 0) return 100
    return (player.experience / player.experienceToNextLevel) * 100
  }
)

export const selectIsLevelUpAvailable = createSelector(
  [selectPlayer],
  (player) => player.experience >= player.experienceToNextLevel
)

// ================================
// RESOURCES SELECTORS
// ================================

export const selectResources = (state: GameStore) => state.resources
export const selectMaterialStash = (state: GameStore) => state.materialStash
export const selectGold = (state: GameStore) => state.resources.gold
export const selectSoulEssence = (state: GameStore) => state.resources.soulEssence

/** Согласовано с `useFormattedResources`: stash + legacy `resources` для ключей с маппингом. */
export const selectFormattedResources = createSelector(
  [selectResources, selectMaterialStash],
  (resources, materialStash) => {
    const t = (key: ResourceKey) =>
      getAvailableAmountForResourceKey(resources, materialStash, key).toLocaleString('ru-RU')
    return {
      gold: resources.gold.toLocaleString('ru-RU'),
      wood: t('wood'),
      stone: t('stone'),
      iron: t('iron'),
      coal: t('coal'),
      copper: t('copper'),
      tin: t('tin'),
      silver: t('silver'),
      goldOre: t('goldOre'),
      mithril: t('mithril'),
      soulEssence: resources.soulEssence.toLocaleString('ru-RU'),
      planks: t('planks'),
      stoneBlocks: t('stoneBlocks'),
      copperIngot: t('copperIngot'),
      tinIngot: t('tinIngot'),
      bronzeIngot: t('bronzeIngot'),
      ironIngot: t('ironIngot'),
      steelIngot: t('steelIngot'),
      silverIngot: t('silverIngot'),
      goldIngot: t('goldIngot'),
      mithrilIngot: t('mithrilIngot'),
    } as Record<string, string>
  }
)

// ================================
// WORKERS SELECTORS
// ================================

export const selectWorkers = (state: GameStore) => state.workers
export const selectBuildings = (state: GameStore) => state.buildings
export const selectMaxWorkers = (state: GameStore) => state.maxWorkers

export const selectWorkersCount = createSelector(
  [selectWorkers],
  (workers) => workers.length
)

export const selectHiredWorkers = createSelector(
  [selectWorkers],
  (workers) => workers
)

export const selectIdleWorkers = createSelector(
  [selectWorkers],
  (workers) => workers.filter(w => w.assignment === 'rest')
)

export const selectWorkersQuality = createSelector(
  [selectWorkers],
  (workers) => {
    if (workers.length === 0) return 0
    const averageQuality = workers.reduce((sum, w) => sum + w.stats.quality, 0) / workers.length
    return averageQuality
  }
)

// ================================
// CRAFT SELECTORS
// ================================

export const selectWeaponInventory = (state: GameStore) => state.weaponInventory
/** Активный крафт v2 (канон); legacy-поле slice удалено — см. craftV2Persisted. */
export const selectActiveCraft = (state: GameStore) => state.craftV2Persisted.activeCraft
export const selectActiveRefining = (state: GameStore) => state.activeRefining
export const selectUnlockedRecipes = (state: GameStore) => state.unlockedRecipes

export const selectWeapons = createSelector(
  [selectWeaponInventory],
  (inventory) => inventory.weapons
)

export const selectAvailableWeaponSlots = createSelector(
  [selectWeaponInventory],
  (inventory) => Math.max(0, inventory.maxSlots - inventory.weapons.length)
)

export const selectWeaponsByQuality = createSelector(
  [selectWeapons],
  (weapons) => {
    return {
      legendary: weapons.filter(w => w.qualityGrade === 'legendary'),
      masterpiece: weapons.filter(w => w.qualityGrade === 'masterpiece'),
      excellent: weapons.filter(w => w.qualityGrade === 'excellent'),
      good: weapons.filter(w => w.qualityGrade === 'good'),
      common: weapons.filter(w => w.qualityGrade === 'common'),
      poor: weapons.filter(w => w.qualityGrade === 'poor'),
    }
  }
)

export const selectWeaponsByType = createSelector(
  [selectWeapons],
  (weapons) => {
    return {
      sword: weapons.filter(w => w.type === 'sword'),
      dagger: weapons.filter(w => w.type === 'dagger'),
      axe: weapons.filter(w => w.type === 'axe'),
      mace: weapons.filter(w => w.type === 'mace'),
      spear: weapons.filter(w => w.type === 'spear'),
      hammer: weapons.filter(w => w.type === 'hammer'),
      bow: weapons.filter(w => w.type === 'bow'),
      staff: weapons.filter(w => w.type === 'staff'),
    }
  }
)

function weaponMatchesMaterialTag(w: { hiddenTags?: string[]; recipeId?: string }, tag: string): boolean {
  if (w.hiddenTags?.includes(tag)) return true
  return w.recipeId?.includes(tag) ?? false
}

export const selectWeaponsByMaterial = createSelector(
  [selectWeapons],
  (weapons) => {
    return {
      iron: weapons.filter(w => weaponMatchesMaterialTag(w, 'iron')),
      bronze: weapons.filter(w => weaponMatchesMaterialTag(w, 'bronze')),
      steel: weapons.filter(w => weaponMatchesMaterialTag(w, 'steel')),
      silver: weapons.filter(w => weaponMatchesMaterialTag(w, 'silver')),
      gold: weapons.filter(w => weaponMatchesMaterialTag(w, 'gold')),
      mithril: weapons.filter(w => weaponMatchesMaterialTag(w, 'mithril')),
    }
  }
)

// ================================
// GUILD SELECTORS
// ================================

export const selectOrders = (state: GameStore) => state.orders
export const selectActiveOrderId = (state: GameStore) => state.activeOrderId
export const selectGuild = (state: GameStore) => state.guild
export const selectKnownAdventurers = (state: GameStore) => state.knownAdventurers

export const selectAvailableOrders = createSelector(
  [selectOrders],
  (orders) => orders.filter(o => o.status === 'available')
)

export const selectActiveOrder = createSelector(
  [selectOrders, selectActiveOrderId],
  (orders, activeOrderId) => orders.find(o => o.id === activeOrderId)
)

export const selectCompletedOrders = createSelector(
  [selectOrders],
  (orders) => orders.filter(o => o.status === 'completed')
)

export const selectExpiredOrders = createSelector(
  [selectOrders],
  (orders) => orders.filter(o => o.status === 'expired')
)

export const selectInProgressOrders = createSelector(
  [selectOrders],
  (orders) => orders.filter(o => o.status === 'in_progress')
)

export const selectGuildLevel = createSelector(
  [selectGuild],
  (guild) => guild.level
)

export const selectGuildGlory = createSelector(
  [selectGuild],
  (guild) => guild.glory
)

// ================================
// UTILITY SELECTORS
// ================================

export const selectCurrentScreen = (state: GameStore) => state.currentScreen
export const selectPlayTime = (state: GameStore) => state.statistics.playTime
/** Версия формата облачного сейва; в Zustand не хранится, только в API payload. */
export const selectSaveVersion = (_state: GameStore) => 3

export const selectTutorial = (state: GameStore) => state.tutorial

export const selectIsTutorialActive = createSelector(
  [selectTutorial],
  (tutorial) => tutorial.isActive
)

export const selectTutorialCurrentStep = createSelector(
  [selectTutorial],
  (tutorial) => tutorial.currentStep
)

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Создает мемоизированный селектор для хука
 * @param selectorFn Функция селектора
 * @returns Мемоизированный селектор
 */
export function createMemoizedSelector<T, R>(
  selectorFn: (state: T) => R
): (state: T) => R {
  return selectorFn
}
