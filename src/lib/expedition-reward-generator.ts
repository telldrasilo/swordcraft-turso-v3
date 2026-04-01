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

import type { ExpeditionEvent, EventReward, EventRewardType, EventRewardRarity } from '@/types/expedition-events'

// ================================
// КОНФИГУРАЦИЯ НАГРАД
// ================================

/**
 * Вероятности наград для разных типов событий (%)
 * В будущем можно сделать настраиваемыми
 */
const REWARD_CHANCES: Record<string, number> = {
  combat: 30,      // Бой - шанс найти добычу
  discovery: 50,    // Открытие - высокая вероятность награды
  social: 20,       // Встреча - низкая вероятность
  travel: 10,       // Путь - очень низкая
  danger: 25,       // Угроза - средняя
  rest: 5,          // Отдых - почти нет наград
  mystery: 40,      // Тайна - высокая
  weather: 15,      // Погода - низкая
  treasure: 100,     // Сокровище - всегда награда
}

/**
 * Вероятности редкости наград (%)
 * Сумма должна быть 100
 */
const RARITY_CHANCES: Record<EventRewardRarity, number> = {
  common: 60,
  rare: 25,
  epic: 12,
  legendary: 3,
}

/**
 * Диапазоны значений для золота
 */
const GOLD_RANGES: Record<EventRewardRarity, { min: number; max: number }> = {
  common: { min: 5, max: 20 },
  rare: { min: 20, max: 50 },
  epic: { min: 50, max: 100 },
  legendary: { min: 100, max: 250 },
}

/**
 * Диапазоны значений для душ войны
 */
const WARSOUL_RANGES: Record<EventRewardRarity, { min: number; max: number }> = {
  common: { min: 1, max: 3 },
  rare: { min: 3, max: 6 },
  epic: { min: 6, max: 12 },
  legendary: { min: 12, max: 25 },
}

/**
 * Диапазоны значений для славы
 */
const GLORY_RANGES: Record<EventRewardRarity, { min: number; max: number }> = {
  common: { min: 1, max: 3 },
  rare: { min: 3, max: 6 },
  epic: { min: 6, max: 10 },
  legendary: { min: 10, max: 20 },
}

/**
 * Диапазоны значений для эссенции
 */
const ESSENCE_RANGES: Record<EventRewardRarity, { min: number; max: number }> = {
  common: { min: 1, max: 2 },
  rare: { min: 2, max: 4 },
  epic: { min: 4, max: 8 },
  legendary: { min: 8, max: 15 },
}

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
 *
 * @param event - событие для которого генерируются награды
 * @returns массив наград (пока пустой)
 */
export function generateRandomRewards(event: ExpeditionEvent): EventReward[] {
  // TODO: Реализовать полноценную генерацию наград
  // Сейчас возвращаем пустой массив - награды не выдаются

  // === ПРИМЕР БУДУЩЕЙ РЕАЛИЗАЦИИ ===
  /*
  const rewards: EventReward[] = []

  // Проверяем вероятность награды
  const rewardChance = REWARD_CHANCES[event.type] || 20
  if (Math.random() * 100 > rewardChance) {
    return rewards // Награда не выпала
  }

  // Определяем количество наград (обычно 1-2)
  const rewardCount = Math.random() < 0.2 ? 2 : 1

  for (let i = 0; i < rewardCount; i++) {
    const reward = generateSingleReward(event.type)
    if (reward) {
      rewards.push(reward)
    }
  }

  return rewards
  */

  return []
}

/**
 * Сгенерировать одну награду
 *
 * @param eventType - тип события (влияет на типы возможных наград)
 * @returns награда или null если не удалось сгенерировать
 */
function generateSingleReward(eventType: string): EventReward | null {
  // Выбираем редкость
  const rarity = selectRandomRarity()

  // Выбираем тип награды на основе типа события
  const rewardType = selectRewardType(eventType)

  // Генерируем значение
  const reward = generateRewardValue(rewardType, rarity)

  return reward
}

/**
 * Выбрать случайную редкость с учётом вероятностей
 */
function selectRandomRarity(): EventRewardRarity {
  const roll = Math.random() * 100
  let cumulative = 0

  for (const [rarity, chance] of Object.entries(RARITY_CHANCES)) {
    cumulative += chance
    if (roll <= cumulative) {
      return rarity as EventRewardRarity
    }
  }

  return 'common'
}

/**
 * Выбрать тип награды на основе типа события
 */
function selectRewardType(eventType: string): EventRewardType {
  // Разные типы событий имеют разные типы наград
  const typeWeights: Partial<Record<EventRewardType, number>> = {
    gold: 40,
    warSoul: 25,
    glory: 15,
    essence: 10,
    item: 5,
    material: 5,
  }

  // Специфичные настройки для типов событий
  if (eventType === 'combat') {
    typeWeights.gold = 50
    typeWeights.warSoul = 35
    typeWeights.glory = 15
  } else if (eventType === 'discovery') {
    typeWeights.gold = 35
    typeWeights.item = 25
    typeWeights.material = 20
    typeWeights.warSoul = 20
  } else if (eventType === 'treasure') {
    typeWeights.gold = 60
    typeWeights.item = 30
    typeWeights.essence = 10
  }

  // Взвешенный случайный выбор
  const totalWeight = Object.values(typeWeights).reduce((a, b) => a + b, 0)
  let roll = Math.random() * totalWeight

  for (const [type, weight] of Object.entries(typeWeights)) {
    roll -= weight
    if (roll <= 0) {
      return type as EventRewardType
    }
  }

  return 'gold' // По умолчанию
}

/**
 * Сгенерировать значение награды
 */
function generateRewardValue(
  type: EventRewardType,
  rarity: EventRewardRarity
): EventReward | null {
  switch (type) {
    case 'gold':
      return generateGoldReward(rarity)
    case 'warSoul':
      return generateWarSoulReward(rarity)
    case 'glory':
      return generateGloryReward(rarity)
    case 'essence':
      return generateEssenceReward(rarity)
    case 'item':
      // TODO: Реализовать генерацию предметов когда будет система инвентаря
      return null
    case 'material':
      // TODO: Реализовать генерацию материалов когда будет система материалов
      return null
    default:
      return null
  }
}

/**
 * Сгенерировать награду золотом
 */
function generateGoldReward(rarity: EventRewardRarity): EventReward {
  const range = GOLD_RANGES[rarity]
  const amount = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min

  return {
    type: 'gold',
    amount,
    rarity,
    name: `Золото`,
    description: `${amount} золотых монет`,
  }
}

/**
 * Сгенерировать награду душами войны
 */
function generateWarSoulReward(rarity: EventRewardRarity): EventReward {
  const range = WARSOUL_RANGES[rarity]
  const amount = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min

  return {
    type: 'warSoul',
    amount,
    rarity,
    name: `Души войны`,
    description: `${amount} душ войны`,
  }
}

/**
 * Сгенерировать награду славой
 */
function generateGloryReward(rarity: EventRewardRarity): EventReward {
  const range = GLORY_RANGES[rarity]
  const amount = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min

  return {
    type: 'glory',
    amount,
    rarity,
    name: `Слава`,
    description: `${amount} славы`,
  }
}

/**
 * Сгенерировать награду эссенцией
 */
function generateEssenceReward(rarity: EventRewardRarity): EventReward {
  const range = ESSENCE_RANGES[rarity]
  const amount = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min

  return {
    type: 'essence',
    amount,
    rarity,
    name: `Эссенция`,
    description: `${amount} эссенции`,
  }
}

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================

/**
 * Применить награды к состоянию игрока
 *
 * TODO: Реализовать когда будут готовы:
 * - Интеграция с game store
 * - Обновление ресурсов
 * - Добавление предметов в инвентарь
 *
 * @param rewards - массив наград для применения
 * @returns объект с результатом применения
 */
export function applyRewards(rewards: EventReward[]): {
  gold: number
  warSoul: number
  glory: number
  essence: number
  items: string[]
  materials: string[]
} {
  // TODO: Реализовать применение наград к store
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

// ================================
// ЭКСПОРТ КОНФИГУРАЦИИ
// ================================

export { REWARD_CHANCES, RARITY_CHANCES }
export { GOLD_RANGES, WARSOUL_RANGES, GLORY_RANGES, ESSENCE_RANGES }
