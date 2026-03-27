/**
 * Автосохранение черновиков экспедиций
 * Сохраняет выбор игрока при настройке экспедиции
 */

import type { ExpeditionTemplate } from '@/data/expedition-templates'
import type { AdventurerExtended } from '@/types/adventurer-extended'
import type { CraftedWeaponV2 } from '@/types/craft-v2'

const DRAFT_KEY = 'expedition_draft'

/**
 * Структура черновика экспедиции
 */
export interface ExpeditionDraft {
  /** ID выбранной экспедиции */
  expeditionId: string | null

  /** ID выбранного искателя */
  adventurerId: string | null

  /** ID выбранного оружия */
  weaponId: string | null

  /** Время создания черновика */
  createdAt: number

  /** Время последнего обновления */
  updatedAt: number

  /** Истек ли черновик (24 часа) */
  isExpired: boolean
}

/**
 * Сохранить черновик экспедиции
 */
export function saveDraft(
  expedition: ExpeditionTemplate | null,
  adventurer: AdventurerExtended | null,
  weapon: CraftedWeaponV2 | null
): void {
  try {
    const draft: ExpeditionDraft = {
      expeditionId: expedition?.id || null,
      adventurerId: adventurer?.id || null,
      weaponId: weapon?.id || null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isExpired: false,
    }

    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch (error) {
    console.warn('Failed to save expedition draft:', error)
  }
}

/**
 * Загрузить черновик экспедиции
 */
export function loadDraft(): ExpeditionDraft | null {
  try {
    const data = localStorage.getItem(DRAFT_KEY)
    if (!data) return null

    const draft: ExpeditionDraft = JSON.parse(data)

    // Проверяем, не истёк ли черновик (24 часа)
    const EXPIRY_TIME = 24 * 60 * 60 * 1000 // 24 часа в мс
    const isExpired = Date.now() - draft.createdAt > EXPIRY_TIME

    if (isExpired) {
      clearDraft()
      return null
    }

    return { ...draft, isExpired }
  } catch (error) {
    console.warn('Failed to load expedition draft:', error)
    return null
  }
}

/**
 * Очистить черновик экспедиции
 */
export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch (error) {
    console.warn('Failed to clear expedition draft:', error)
  }
}

/**
 * Проверить, есть ли сохранённый черновик
 */
export function hasDraft(): boolean {
  const draft = loadDraft()
  return draft !== null && !draft.isExpired
}

/**
 * Получить время создания черновика
 */
export function getDraftCreatedAt(): number | null {
  const draft = loadDraft()
  return draft?.createdAt || null
}

/**
 * Форматировать время черновика для отображения
 */
export function formatDraftTime(createdAt: number): string {
  const diff = Date.now() - createdAt
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}ч ${minutes % 60}м назад`
  } else if (minutes > 0) {
    return `${minutes}м назад`
  } else {
    return 'только что'
  }
}

/**
 * Статус черновика для UI
 */
export interface DraftStatus {
  hasDraft: boolean
  isComplete: boolean
  createdAt: number | null
  formattedTime: string
  missingFields: string[]
}

/**
 * Получить полный статус черновика
 */
export function getDraftStatus(): DraftStatus {
  const draft = loadDraft()

  if (!draft || draft.isExpired) {
    return {
      hasDraft: false,
      isComplete: false,
      createdAt: null,
      formattedTime: '',
      missingFields: [],
    }
  }

  const missingFields: string[] = []
  if (!draft.expeditionId) missingFields.push('экспедиция')
  if (!draft.adventurerId) missingFields.push('искатель')
  if (!draft.weaponId) missingFields.push('оружие')

  const isComplete = missingFields.length === 0

  return {
    hasDraft: true,
    isComplete,
    createdAt: draft.createdAt,
    formattedTime: formatDraftTime(draft.createdAt),
    missingFields,
  }
}

/**
 * Автосохранение при изменении любого поля
 * Используется в компонентах React
 */
export function autoSaveDraft(
  expedition: ExpeditionTemplate | null,
  adventurer: AdventurerExtended | null,
  weapon: CraftedWeaponV2 | null
): void {
  // Сохраняем только если хотя бы одно поле заполнено
  if (expedition || adventurer || weapon) {
    saveDraft(expedition, adventurer, weapon)
  } else {
    clearDraft()
  }
}

/**
 * Восстановить выбор из черновика
 * Возвращает ID которые нужно сопоставить с текущими данными
 */
export function restoreDraft(): {
  expeditionId: string | null
  adventurerId: string | null
  weaponId: string | null
} | null {
  const draft = loadDraft()
  if (!draft || draft.isExpired) return null

  return {
    expeditionId: draft.expeditionId,
    adventurerId: draft.adventurerId,
    weaponId: draft.weaponId,
  }
}

// ================================
// DEBOUNCE УТИЛИТА
// ================================

let saveTimeout: NodeJS.Timeout | null = null
const DEBOUNCE_MS = 500

/**
 * Сохранить с debounce (для использования в onChange)
 */
export function debouncedSaveDraft(
  expedition: ExpeditionTemplate | null,
  adventurer: AdventurerExtended | null,
  weapon: CraftedWeaponV2 | null
): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }

  saveTimeout = setTimeout(() => {
    autoSaveDraft(expedition, adventurer, weapon)
  }, DEBOUNCE_MS)
}
