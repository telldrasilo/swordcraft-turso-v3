/**
 * Модульный пул событий экспедиций
 * Точка входа — объединяет все категории событий
 */

import type {
  ExpeditionEventTemplate,
  ExpeditionEventPool,
} from '@/types/expedition-events'

// Импорт категорий событий
import CORE_EVENTS from './core'
import LOCATION_EVENTS from './locations'
import ENEMY_EVENTS from './enemies'
import SOCIAL_EVENTS from './social'
import DISCOVERY_EVENTS from './discovery'

// ================================
// ОПРЕДЕЛЕНИЕ ПУЛОВ
// ================================

export const EXPEDITION_EVENT_POOLS: ExpeditionEventPool[] = [
  {
    category: 'core',
    description: 'Универсальные события: отдых, путешествие, погода, опасность',
    events: CORE_EVENTS,
  },
  {
    category: 'location',
    description: 'События специфичные для локаций: лес, пещеры, руины и т.д.',
    events: LOCATION_EVENTS,
  },
  {
    category: 'enemy',
    description: 'События связанные с врагами: гоблины, нежить, драконы и т.д.',
    events: ENEMY_EVENTS,
  },
  {
    category: 'social',
    description: 'Социальные взаимодействия: торговцы, NPC, странники',
    events: SOCIAL_EVENTS,
  },
  {
    category: 'discovery',
    description: 'Открытия и находки: сокровища, знания, тайны',
    events: DISCOVERY_EVENTS,
  },
]

// ================================
// ЭКСПОРТЫ
// ================================

export { CORE_EVENTS }
export { LOCATION_EVENTS }
export { ENEMY_EVENTS }
export { SOCIAL_EVENTS }
export { DISCOVERY_EVENTS }

// ================================
// ПОЛНЫЙ ПУЛ СОБЫТИЙ
// ================================

/**
 * Все доступные события экспедиций
 */
export const ALL_EXPEDITION_EVENTS: ExpeditionEventTemplate[] = [
  ...CORE_EVENTS,
  ...LOCATION_EVENTS,
  ...ENEMY_EVENTS,
  ...SOCIAL_EVENTS,
  ...DISCOVERY_EVENTS,
]

/**
 * Получить статистику по пулу событий
 */
export function getEventPoolStats() {
  const byType: Record<string, number> = {}
  const byCategory: Record<string, number> = {}

  for (const pool of EXPEDITION_EVENT_POOLS) {
    byCategory[pool.category] = pool.events.length
    for (const event of pool.events) {
      byType[event.type] = (byType[event.type] || 0) + 1
    }
  }

  return {
    total: ALL_EXPEDITION_EVENTS.length,
    byCategory,
    byType,
    pools: EXPEDITION_EVENT_POOLS.map(p => ({
      name: p.category,
      count: p.events.length,
      description: p.description,
    })),
  }
}

/**
 * Найти событие по ID
 */
export function findEventById(id: string): ExpeditionEventTemplate | undefined {
  return ALL_EXPEDITION_EVENTS.find(e => e.id === id)
}

/**
 * Получить события по категории
 */
export function getEventsByCategory(category: string): ExpeditionEventTemplate[] {
  const pool = EXPEDITION_EVENT_POOLS.find(p => p.category === category)
  return pool?.events || []
}

/**
 * Получить события по типу
 */
export function getEventsByType(type: ExpeditionEventTemplate['type']): ExpeditionEventTemplate[] {
  return ALL_EXPEDITION_EVENTS.filter(e => e.type === type)
}

// Экспорт по умолчанию
export default ALL_EXPEDITION_EVENTS
