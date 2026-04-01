/**
 * Генератор наград для событий экспедиций
 *
 * ПРИМЕЧАНИЕ: Это заглушка для будущего функционала.
 * Система наград пока не реализована полностью.
 *
 * В будущем система должна:
 * 1. Определять вероятность награды на основе типа события
 * 2. Генерировать случайные награды соответствующей редкости
 * 3. Применять модификаторы от характеристик искателя
 * 4. Влиять на результат экспедиции
 * 5. Интегрироваться с системой инвентаря
 */

import type { ExpeditionEvent, EventReward, EventRewardRarity } from '@/types/expedition-events'

// ================================
// ГЕНЕРАЦИЯ НАГРАД
// ================================

/**
 * Сгенерировать случайные награды для события
 *
 * ВАЖНО: Сейчас это заглушка - возвращает пустой массив.
 * Реальную логику нужно будет реализовать когда будут готовы:
 * - Система инвентаря для предметов
 * - Система материалов
 * - Баланс наград
 */
export function generateRandomRewards(_event: ExpeditionEvent): EventReward[] {
  // TODO: Реализовать полноценную генерацию наград
  return []
}

/**
 * Применить награды к состоянию игрока
 *
 * TODO: Реализовать когда будут готовы интеграция с store и инвентарём.
 */
export function applyRewards(_rewards: EventReward[]): {
  gold: number
  warSoul: number
  glory: number
  essence: number
  items: string[]
  materials: string[]
} {
  return {
    gold: 0,
    warSoul: 0,
    glory: 0,
    essence: 0,
    items: [],
    materials: [],
  }
}

/**
 * Получить имя редкости для отображения
 */
export function getRarityName(rarity: EventRewardRarity): string {
  const names: Record<EventRewardRarity, string> = {
    common: 'Обычная',
    rare: 'Редкая',
    epic: 'Эпическая',
    legendary: 'Легендарная',
  }
  return names[rarity]
}

/**
 * Получить цвет редкости для UI
 */
export function getRarityColor(rarity: EventRewardRarity): string {
  const colors: Record<EventRewardRarity, string> = {
    common: 'text-slate-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-yellow-400',
  }
  return colors[rarity]
}
