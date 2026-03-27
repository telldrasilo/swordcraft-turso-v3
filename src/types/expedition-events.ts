/**
 * Типы для системы событий экспедиций
 */

import type {
  ExpeditionType,
  ExpeditionDifficulty,
} from '@/data/expedition-templates'
import type { ExpeditionTags } from './expedition-tags'

// ================================
// ТИПЫ СОБЫТИЙ
// ================================

export type ExpeditionEventType =
  | 'combat'      // Бой, стычка, атака
  | 'discovery'   // Находка, открытие
  | 'social'      // Встреча с NPC, разговор
  | 'travel'      // Передвижение, путь
  | 'danger'      // Угроза, опасность
  | 'rest'        // Отдых, привал
  | 'mystery'     // Загадка, тайна
  | 'weather'     // Погодные условия
  | 'treasure'    // Сокровища, находки

// ================================
// ШАБЛОН СОБЫТИЯ
// ================================

export interface ExpeditionEventTemplate {
  /** Уникальный ID события */
  id: string

  /** Текст события (для отображения) */
  text: string

  /** Тип события (влияет на иконку и стиль) */
  type: ExpeditionEventType

  /** Иконка события (emoji или Lucide icon name) */
  icon: string

  /** Условия для появления события */
  conditions: ExpeditionEventConditions

  /** Вес для случайного выбора (1-10, по умолчанию 3) */
  weight?: number

  /** Флаги дополнительных условий */
  flags?: {
    /** Только для экспедиций с боссом */
    bossOnly?: boolean
    /** Только ночью */
    nightOnly?: boolean
    /** Только в определённую погоду */
    weatherSpecific?: boolean
  }
}

/**
 * Условия для появления события
 * Все поля опциональны — если не указаны, подходят любые
 */
export interface ExpeditionEventConditions {
  /** Типы экспедиций (пусто = любой) */
  expeditionTypes?: ExpeditionType[]

  /** Сложности экспедиции (пусто = любая) */
  difficulties?: ExpeditionDifficulty[]

  /** Требуемые локации (пусто = любая) */
  locations?: ExpeditionTags['locations']

  /** Требуемые враги (пусто = любые) */
  enemies?: ExpeditionTags['enemies']

  /** Требуемая погода (пусто = любая) */
  weather?: ExpeditionTags['weather']

  /** Требуемые особые тэги (пусто = любые) */
  special?: ExpeditionTags['special']

  /** Требуемые темы (пусто = любые) */
  themes?: ExpeditionTags['themes']

  /** Минимальная длительность экспедиции в секундах */
  minDuration?: number

  /** Максимальная длительность экспедиции в секундах */
  maxDuration?: number
}

// ================================
// НАГРАДЫ СОБЫТИЙ
// ================================

/**
 * Типы наград, которые могут давать события
 */
export type EventRewardType =
  | 'gold'        // Золото
  | 'warSoul'     // Души войны
  | 'glory'       // Слава
  | 'item'        // Предмет (оружие, броня и т.д.)
  | 'material'    // Материал для создания
  | 'essence'     // Эссенция
  | 'buff'        // Временный бафф
  | 'debuff'      // Временный дебафф

/**
 * Редкость награды (влияет на значения)
 */
export type EventRewardRarity = 'common' | 'rare' | 'epic' | 'legendary'

/**
 * Награда от события
 * Примечание: система наград пока в разработке, заглушка для будущего функционала
 */
export interface EventReward {
  /** Тип награды */
  type: EventRewardType

  /** Количество (для gold, warSoul, glory, essence) */
  amount?: number

  /** ID предмета (для item, material) */
  itemId?: string

  /** Данные предмета (полный объект, для item) */
  itemData?: any

  /** Редкость награды (влияет на количество/качество) */
  rarity?: EventRewardRarity

  /** Название награды (для отображения) */
  name?: string

  /** Описание награды (для отображения) */
  description?: string

  /** Длительность эффекта (для buff, debuff в секундах) */
  duration?: number
}

// ================================
// АКТИВНОЕ СОБЫТИЕ (в экспедиции)
// ================================

export interface ExpeditionEvent extends ExpeditionEventTemplate {
  /** Уникальный ID инстанса события */
  instanceId: string

  /** Когда событие должно произойти (timestamp) */
  triggeredAt: number

  /** Когда событие было показано игроку (timestamp, опционально) */
  shownAt?: number

  /** Порядковый номер события в экспедиции */
  order: number

  /** Награды от события (пока заглушка для будущего функционала) */
  rewards?: EventReward[]

  /** Была ли награда уже применена */
  rewardTriggered?: boolean
}

// ================================
// КОНФИГУРАЦИЯ ГЕНЕРАЦИИ СОБЫТИЙ
// ================================

export interface EventGenerationConfig {
  /** Базовое количество событий */
  baseCount: number

  /** +1 событие каждые N секунд */
  eventPerSeconds: number

  /** Минимальное количество событий */
  minCount: number

  /** Максимальное количество событий */
  maxCount: number
}

/** Конфигурация по умолчанию */
export const DEFAULT_EVENT_CONFIG: EventGenerationConfig = {
  baseCount: 2,
  eventPerSeconds: 300, // +1 событие каждые 5 минут
  minCount: 2,
  maxCount: 6,
}

// ================================
// ПУЛ СОБЫТИЙ
// ================================

export interface ExpeditionEventPool {
  /** Название категории */
  category: string

  /** Описание категории */
  description: string

  /** События в категории */
  events: ExpeditionEventTemplate[]
}

// ================================
// РЕЗУЛЬТАТ ГЕНЕРАЦИИ
// ================================

export interface GeneratedEventsResult {
  /** Сгенерированные события */
  events: ExpeditionEvent[]

  /** Общее количество */
  count: number

  /** Распределение по времени */
  intervals: number[]
}

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ТИПЫ
// ================================

/** Опции для функции выбора событий */
export interface SelectEventsOptions {
  /** Предпочтительные категории */
  preferCategories?: string[]

  /** Исключить события с этими ID */
  excludeIds?: string[]

  /** Минимальное количество событий определённого типа */
  requireTypes?: Partial<Record<ExpeditionEventType, number>>
}

/** Статистика событий */
export interface EventStatistics {
  /** Всего событий */
  total: number

  /** По категориям */
  byCategory: Record<string, number>

  /** По типам */
  byType: Record<ExpeditionEventType, number>
}
