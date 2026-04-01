/**
 * Селектор событий для экспедиций
 * Логика выбора событий на основе тэгов экспедиции
 */

import type {
  ExpeditionEventTemplate,
  ExpeditionEvent,
  SelectEventsOptions,
  EventGenerationConfig,
  GeneratedEventsResult,
  EventReward,
} from '@/types/expedition-events'
import type { ExpeditionTags } from '@/types/expedition-tags'
import type { ExpeditionTemplate } from '@/data/expedition-templates'
import { ALL_EXPEDITION_EVENTS } from '@/data/expedition-events'
import { DEFAULT_EVENT_CONFIG } from '@/types/expedition-events'

// ================================
// ВЗВЕШЕННЫЙ СЛУЧАЙНЫЙ ВЫБОР
// ================================

/**
 * Выбрать случайный элемент с учётом веса
 */
function weightedRandom<T extends { weight?: number }>(items: T[]): T | null {
  if (items.length === 0) return null

  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 3), 0)
  let random = Math.random() * totalWeight

  for (const item of items) {
    random -= (item.weight || 3)
    if (random <= 0) return item
  }

  return items[items.length - 1]
}

/**
 * Перемешать массив (Fisher-Yates)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// ================================
// ФИЛЬТРАЦИЯ СОБЫТИЙ
// ================================

/**
 * Проверить, подходит ли событие для экспедиции
 */
function matchesExpedition(
  event: ExpeditionEventTemplate,
  expedition: ExpeditionTemplate
): boolean {
  const { conditions } = event

  // Проверка типа экспедиции
  if (conditions.expeditionTypes && conditions.expeditionTypes.length > 0) {
    if (!conditions.expeditionTypes.includes(expedition.type)) {
      return false
    }
  }

  // Проверка сложности
  if (conditions.difficulties && conditions.difficulties.length > 0) {
    if (!conditions.difficulties.includes(expedition.difficulty)) {
      return false
    }
  }

  // Проверка локаций (если у экспедиции есть теги)
  if (conditions.locations && conditions.locations.length > 0) {
    if (!expedition.tags?.locations.some(loc => conditions.locations!.includes(loc))) {
      return false
    }
  }

  // Проверка врагов
  if (conditions.enemies && conditions.enemies.length > 0) {
    if (!expedition.tags?.enemies.some(enemy => conditions.enemies!.includes(enemy))) {
      return false
    }
  }

  // Проверка погоды
  if (conditions.weather && conditions.weather.length > 0) {
    if (!expedition.tags?.weather) return false
    if (!expedition.tags?.weather.some(w => conditions.weather!.includes(w))) {
      return false
    }
  }

  // Проверка особых тэгов
  if (conditions.special && conditions.special.length > 0) {
    if (!expedition.tags?.special) return false
    if (!expedition.tags?.special.some(s => conditions.special!.includes(s))) {
      return false
    }
  }

  // Проверка тем
  if (conditions.themes && conditions.themes.length > 0) {
    if (!expedition.tags?.themes.some(theme => conditions.themes!.includes(theme))) {
      return false
    }
  }

  // Проверка длительности
  if (conditions.minDuration !== undefined) {
    if (expedition.duration < conditions.minDuration) {
      return false
    }
  }
  if (conditions.maxDuration !== undefined) {
    if (expedition.duration > conditions.maxDuration) {
      return false
    }
  }

  // Проверка флагов босса
  if (event.flags?.bossOnly && !expedition.tags?.special?.includes('boss')) {
    return false
  }

  return true
}

// ================================
// РАСЧЁТ КОЛИЧЕСТВА СОБЫТИЙ
// ================================

/**
 * Рассчитать количество событий для экспедиции
 */
function calculateEventCount(
  duration: number,
  config: EventGenerationConfig
): number {
  const extraEvents = Math.floor(duration / config.eventPerSeconds)
  const total = config.baseCount + extraEvents

  return Math.max(config.minCount, Math.min(config.maxCount, total))
}

/**
 * Распределить события по временным интервалам
 */
function splitIntoIntervals(
  count: number,
  durationSeconds: number,
  startedAt: number
): number[] {
  if (count === 0) return []
  if (count === 1) {
    // Конвертируем секунды в миллисекунды
    return [startedAt + Math.floor(durationSeconds * 0.5 * 1000)]
  }

  const intervals: number[] = []
  const segmentDurationSeconds = durationSeconds / (count + 1)

  for (let i = 1; i <= count; i++) {
    // Добавляем небольшой случайный разброс (±10%)
    const jitterSeconds = (Math.random() - 0.5) * segmentDurationSeconds * 0.2
    // Конвертируем всё в миллисекунды
    const timestamp = startedAt + Math.floor((i * segmentDurationSeconds + jitterSeconds) * 1000)
    intervals.push(timestamp)
  }

  return intervals
}

// ================================
// ГЕНЕРАЦИЯ НАГРАД (ЗАГЛУШКА)
// ================================

/**
 * Генератор случайных наград для события
 * ПРИМЕЧАНИЕ: Это заглушка для будущего функционала.
 * Система наград пока не реализована - функция возвращает пустой массив.
 *
 * В будущем система должна:
 * 1. Определять вероятность награды на основе типа события
 * 2. Генерировать случайные награды соответствующей редкости
 * 3. Применять модификаторы от характеристик искателя
 * 4. Влиять на результат экспедиции
 *
 * @param event - событие для которого генерируются награды
 * @returns массив наград (пока пустой)
 */
function generateEventRewards(event: ExpeditionEvent): EventReward[] {
  // TODO: Реализовать систему генерации наград
  // Сейчас возвращаем пустой массив - награды не генерируются
  return []

  // Пример будущей реализации:
  /*
  const rewards: EventReward[] = []

  // Определяем вероятность награды на основе типа события
  const rewardChance = getRewardChanceByEventType(event.type)
  if (Math.random() * 100 > rewardChance) {
    return rewards
  }

  // Определяем тип награды
  const rewardType = selectRandomRewardType(event.type)

  // Определяем редкость награды
  const rarity = selectRewardRarity()

  // Генерируем количество/значения
  const amount = calculateRewardAmount(rewardType, rarity)

  rewards.push({
    type: rewardType,
    amount,
    rarity,
    name: generateRewardName(rewardType, rarity),
  })

  return rewards
  */
}

/**
 * Вероятность награды на основе типа события (%)
 * ПРИМЕЧАНИЕ: Заглушка для будущего функционала
 */
function getRewardChanceByEventType(eventType: string): number {
  const chances: Record<string, number> = {
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
  return chances[eventType] || 20
}

// ================================
// ГЛАВНАЯ ФУНКЦИЯ ВЫБОРА
// ================================

/**
 * Выбрать события для экспедиции
 *
 * @param expedition - шаблон экспедиции
 * @param startedAt - время начала экспедиции (timestamp)
 * @param options - опции выбора событий
 * @param includeRewards - включить ли генерацию наград (пока заглушка)
 * @param config - конфигурация генерации событий
 */
export function selectEventsForExpedition(
  expedition: ExpeditionTemplate,
  startedAt: number,
  options?: SelectEventsOptions,
  includeRewards: boolean = false,
  config: EventGenerationConfig = DEFAULT_EVENT_CONFIG
): GeneratedEventsResult {
  // Фильтруем подходящие события
  let matchingEvents = ALL_EXPEDITION_EVENTS.filter(event =>
    matchesExpedition(event, expedition)
  )

  // Исключаем указанные ID
  if (options?.excludeIds && options.excludeIds.length > 0) {
    const excludeSet = new Set(options.excludeIds)
    matchingEvents = matchingEvents.filter(e => !excludeSet.has(e.id))
  }

  // Проверяем требования по типам
  const requiredTypes = options?.requireTypes || {}
  const selectedByType: Record<string, ExpeditionEventTemplate[]> = {}

  for (const [type, count] of Object.entries(requiredTypes)) {
    const typeEvents = matchingEvents.filter(e => e.type === type)
    const needed = Math.min(count, typeEvents.length)

    selectedByType[type] = []
    for (let i = 0; i < needed; i++) {
      const selected = weightedRandom(typeEvents)
      if (selected) {
        selectedByType[type].push(selected)
        // Удаляем из общего пула чтобы не дублировать
        const index = matchingEvents.findIndex(e => e.id === selected.id)
        if (index > -1) matchingEvents.splice(index, 1)
      }
    }
  }

  // Собираем все предвыбранные по типам
  let selectedEvents: ExpeditionEventTemplate[] = Object.values(selectedByType).flat()

  // Добираем оставшиеся события
  const targetCount = calculateEventCount(expedition.duration, config)
  const remainingCount = targetCount - selectedEvents.length

  if (remainingCount > 0 && matchingEvents.length > 0) {
    // Перемешиваем для случайности
    const shuffled = shuffleArray(matchingEvents)

    // Выбираем с учётом веса
    for (let i = 0; i < remainingCount && shuffled.length > 0; i++) {
      const selected = weightedRandom(shuffled)
      if (selected) {
        selectedEvents.push(selected)
        // Удаляем выбранное событие из пула
        const index = shuffled.findIndex(e => e.id === selected.id)
        if (index > -1) shuffled.splice(index, 1)
      }
    }
  }

  // Перемешиваем финальный список
  selectedEvents = shuffleArray(selectedEvents)

  // Распределяем по времени
  const intervals = splitIntoIntervals(
    selectedEvents.length,
    expedition.duration,
    startedAt
  )

  // Создаём финальные события с instanceId и timestamps
  const finalEvents: ExpeditionEvent[] = selectedEvents.map((template, index) => {
    const event: ExpeditionEvent = {
      ...template,
      instanceId: `${expedition.id}_${index}_${Date.now()}`,
      triggeredAt: intervals[index],
      order: index + 1,
    }

    // Генерируем награды если включено
    if (includeRewards) {
      event.rewards = generateEventRewards(event)
      event.rewardTriggered = false
    }

    return event
  })

  return {
    events: finalEvents,
    count: finalEvents.length,
    intervals,
  }
}

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================

/**
 * Получить все доступные события для экспедиции (для превью)
 */
export function getAvailableEventsForExpedition(
  expedition: ExpeditionTemplate
): ExpeditionEventTemplate[] {
  return ALL_EXPEDITION_EVENTS.filter(event => matchesExpedition(event, expedition))
}

/**
 * Посчитать статистику доступных событий
 */
export function getEventStatsForExpedition(expedition: ExpeditionTemplate): {
  total: number
  byType: Record<string, number>
  byCategory: Record<string, number>
} {
  const available = getAvailableEventsForExpedition(expedition)

  const byType: Record<string, number> = {}
  const byCategory: Record<string, number> = {}

  for (const event of available) {
    byType[event.type] = (byType[event.type] || 0) + 1
    // Категорию можно определить по ID префиксу или другой логикой
    const category = event.id.split('_')[0] || 'unknown'
    byCategory[category] = (byCategory[category] || 0) + 1
  }

  return {
    total: available.length,
    byType,
    byCategory,
  }
}

/**
 * Предварительный просмотр событий (без создания instanceId)
 */
export function previewEventsForExpedition(
  expedition: ExpeditionTemplate,
  startedAt: number,
  options?: SelectEventsOptions
): GeneratedEventsResult {
  const result = selectEventsForExpedition(expedition, startedAt, options)

  // Можно вернуть результат как есть или с дополнительной информацией
  return result
}

// ================================
// ЭКСПОРТ
// ================================

export { splitIntoIntervals }
export { calculateEventCount }
export { weightedRandom }
