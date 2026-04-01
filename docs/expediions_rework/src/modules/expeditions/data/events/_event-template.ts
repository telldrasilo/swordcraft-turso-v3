/**
 * ШАБЛОН СЛУЧАЙНОГО СОБЫТИЯ ЭКСПЕДИЦИИ
 *
 * Этот файл содержит шаблон и типы для создания событий.
 *
 * ВАЖНО: События используют ресурсы из локации динамически!
 * При генерации события материалы подставляются из Location.resources[]
 * с учётом редкости и весов.
 *
 * Расположение:
 * src/modules/expeditions/data/events/
 *   ├── _event-template.ts     <- Этот файл (шаблон)
 *   ├── index.ts               <- Реестр событий
 *   ├── common/                <- Общие события (для всех локаций)
 *   └── {location_id}/         <- События для конкретной локации
 */

import type { ScalableValue, MissionType, MissionDifficulty } from '../missions/_mission-template';
import type { Location, Rarity, LocationResource } from '../../types';

// ============================================================================
// ТИПЫ ЭФФЕКТОВ
// ============================================================================

export type EventEffectType =
  | 'grant_resource'           // Выдать ресурс (золото, опыт)
  | 'grant_location_material'  // Найти материал ИЗ ЛОКАЦИИ (динамический)
  | 'damage_weapon'            // Урон оружию (%)
  | 'damage_adventurer'        // Урон искателю (%)
  | 'modify_success_chance'    // Модификатор шанса успеха (%)
  | 'modify_duration'          // Изменить время (секунды)
  | 'modify_gold_reward'       // Модификатор награды (%)
  | 'spawn_enemy'              // Дополнительный враг
  | 'narrative_only';          // Только текст

// ============================================================================
// ТИПЫ СОБЫТИЙ
// ============================================================================

export type EventType = 'positive' | 'negative' | 'neutral' | 'choice';

export const EVENT_TYPE_CONFIG = {
  positive: {
    name: 'Позитивное',
    weight: 35,                // 35% базовый шанс
    icon: '✨',
  },
  negative: {
    name: 'Негативное',
    weight: 25,                // 25% базовый шанс
    icon: '⚠️',
  },
  neutral: {
    name: 'Нейтральное',
    weight: 30,                // 30% базовый шанс
    icon: '💬',
  },
  choice: {
    name: 'С выбором',
    weight: 10,                // 10% базовый шанс
    icon: '❓',
  },
} as const;

// ============================================================================
// ЭФФЕКТ СОБЫТИЯ
// ============================================================================

export interface EventEffect {
  type: EventEffectType;

  // === ДЛЯ grant_resource (фиксированные ресурсы) ===
  resourceId?: 'gold' | 'experience' | 'glory' | 'warSoul';
  quantity?: ScalableValue;

  // === ДЛЯ grant_location_material (динамический из локации) ===
  // materialRarity определяет какую редкость материала выдать
  // Материал выбирается ИЗ ресурсов локации с этой редкостью
  materialRarity?: Rarity;
  materialQuantity?: ScalableValue;

  // === ДЛЯ модификаторов ===
  modifier?: number;           // Значение: +10, -20 и т.д.

  // === ДЛЯ spawn_enemy ===
  enemyType?: string;          // ID врага или 'random_from_location'

  // === ОПИСАНИЕ ДЛЯ UI ===
  description: string;

  // Вес для случайного выбора (если эффектов несколько)
  weight?: number;
}

// ============================================================================
// ШАБЛОН СОБЫТИЯ
// ============================================================================

export interface EventTemplate {
  // === ИДЕНТИФИКАЦИЯ ===
  id: string;
  name: string;

  // === КЛАССИФИКАЦИЯ ===
  type: EventType;
  category: EventCategory;

  // === ТЕКСТ ===
  title: string;               // Заголовок для UI
  description: string;         // Основной текст (2-4 предложения)
  flavorText?: string;         // Дополнительный текст (курсивом)

  // === УСЛОВИЯ ПОЯВЛЕНИЯ ===
  conditions: EventConditions;

  // === ЭФФЕКТЫ ===
  effects: EventEffect[];

  // === ДЛЯ СОБЫТИЙ С ВЫБОРОМ ===
  choices?: EventChoice[];

  // === ВЕС ===
  weight: number;              // Базовый вес при выборе

  // === ИКОНКА ДЛЯ UI ===
  icon: string;

  // === ПРИВЯЗКА К ЛОКАЦИИ ===
  // Если true — событие привязано к конкретной локации
  locationSpecific?: boolean;
}

export type EventCategory =
  | 'combat'       // Боевые столкновения
  | 'discovery'    // Находки
  | 'travel'       // Путевые события
  | 'social'       // Встречи с NPC
  | 'environment'  // Погода, окружение
  | 'treasure'     // Сокровища
  | 'danger'       // Опасности
  | 'rest';        // Отдых

// ============================================================================
// УСЛОВИЯ ПОЯВЛЕНИЯ
// ============================================================================

export interface EventConditions {
  // === ЛОКАЦИЯ ===
  locationIds?: string[];        // Конкретные локации (['oak_grove_outskirts'])
  locationTypes?: LocationType[]; // Типы: 'forest', 'mine', 'swamp'...
  locationTags?: string[];       // Теги из локации
  locationTiers?: number[];      // Тиры локаций: [1, 2]

  // === МИССИЯ ===
  missionTypes?: MissionType[];
  missionDifficulties?: MissionDifficulty[];
  missionRarities?: string[];

  // === ОКРУЖЕНИЕ ===
  weather?: string[];            // ID погоды из локации
  timeOfDay?: ('day' | 'night' | 'dawn' | 'dusk')[];

  // === ПРОГРЕСС МИССИИ ===
  minProgress?: number;          // Мин. % выполнения (0-100)
  maxProgress?: number;          // Макс. %

  // === ВЕРОЯТНОСТЬ ===
  baseChance?: number;           // Базовый шанс (%)

  // === ТРЕБОВАНИЯ ===
  requiresItems?: string[];
  requiresTraits?: string[];
}

type LocationType = 'forest' | 'mine' | 'swamp' | 'mountain' | 'volcanic' | 'underground' | 'magical';

// ============================================================================
// ВЫБОР В СОБЫТИИ
// ============================================================================

export interface EventChoice {
  id: string;
  text: string;                  // Текст варианта выбора

  // Эффекты при выборе этого варианта
  effects: EventEffect[];

  // Требования для показа/выбора
  requires?: {
    items?: string[];
    traits?: string[];
    gold?: number;
  };

  // Скрытые последствия (показать "?" в UI)
  hiddenOutcome?: boolean;

  // Текст результата (показывается после выбора)
  resultText?: string;
}

// ============================================================================
// СГЕНЕРИРОВАННОЕ СОБЫТИЕ (в активной экспедиции)
// ============================================================================

export interface GeneratedEvent {
  instanceId: string;            // Уникальный ID: 'event_{expeditionId}_{order}'
  templateId: string;            // ID шаблона события

  // === ВРЕМЯ ===
  triggeredAt: number;           // Секунды от начала миссии
  shownAt?: number;              // Реальное время показа
  resolvedAt?: number;           // Реальное время разрешения

  // === ПОРЯДОК ===
  order: number;                 // 1, 2, 3...

  // === СОСТОЯНИЕ ===
  status: 'hidden' | 'visible' | 'resolved';

  // === РЕЗУЛЬТАТ ===
  // Заполненные эффекты (материалы подставлены из локации)
  resolvedEffects?: ResolvedEffect[];

  // Выбор игрока (для choice событий)
  playerChoice?: string;
}

export interface ResolvedEffect {
  type: EventEffectType;
  resourceId?: string;
  materialId?: string;           // Конкретный материал (подставлен из локации)
  quantity: number;
  description: string;
}

// ============================================================================
// КОНФИГУРАЦИЯ КОЛИЧЕСТВА СОБЫТИЙ
// ============================================================================

export const EVENT_COUNT_CONFIG = {
  baseCount: 2,
  perMinuteDuration: 0.03,       // +1 событие на ~33 минуты
  minCount: 2,
  maxCount: 6,

  // Модификаторы
  perLocationTier: 0.3,          // +0.3 за tier локации
  perDifficulty: 0.3,            // +0.3 за уровень сложности
  perRarity: 0.2,                // +0.2 за уровень редкости миссии

  // Бонусы от договора
  contractBonus: {
    exploration: 1,              // +1 событие
    speed: -1,                   // -1 событие
  },
};

/**
 * Рассчитать количество событий для миссии
 */
export function calculateEventCount(
  missionDurationSeconds: number,
  locationTier: number,
  missionDifficulty: MissionDifficulty,
  missionRarity: string,
  contractType: 'exploration' | 'speed'
): number {
  const durationMinutes = missionDurationSeconds / 60;

  const diffLevel = { easy: 0, normal: 1, hard: 2, extreme: 3 }[missionDifficulty];
  const rarityLevel = { common: 0, uncommon: 1, rare: 2, epic: 3 }[missionRarity] ?? 0;

  let count = EVENT_COUNT_CONFIG.baseCount;
  count += durationMinutes * EVENT_COUNT_CONFIG.perMinuteDuration;
  count += locationTier * EVENT_COUNT_CONFIG.perLocationTier;
  count += diffLevel * EVENT_COUNT_CONFIG.perDifficulty;
  count += rarityLevel * EVENT_COUNT_CONFIG.perRarity;
  count += EVENT_COUNT_CONFIG.contractBonus[contractType];

  return Math.max(
    EVENT_COUNT_CONFIG.minCount,
    Math.min(EVENT_COUNT_CONFIG.maxCount, Math.round(count))
  );
}

// ============================================================================
// СИСТЕМА ВЫБОРА МАТЕРИАЛОВ ИЗ ЛОКАЦИИ
// ============================================================================

/**
 * Выбрать случайный материал из ресурсов локации с учётом редкости
 */
export function selectMaterialFromLocation(
  locationResources: LocationResource[],
  targetRarity: Rarity | 'any',
  seed?: number
): LocationResource | null {
  // Фильтруем по целевой редкости
  const candidates = targetRarity === 'any'
    ? locationResources
    : locationResources.filter(r => r.rarity === targetRarity);

  if (candidates.length === 0) return null;

  // Сортируем по весу и выбираем
  const totalWeight = candidates.reduce((sum, r) => sum + r.baseWeight, 0);
  let random = (seed ? seededRandom(seed) : Math.random()) * totalWeight;

  for (const resource of candidates) {
    random -= resource.baseWeight;
    if (random <= 0) return resource;
  }

  return candidates[0];
}

/**
 * Получить материалы локации по редкости
 */
export function getMaterialsByRarityFromLocation(
  locationResources: LocationResource[],
  rarity: Rarity
): LocationResource[] {
  return locationResources.filter(r => r.rarity === rarity);
}

/**
 * Seeded random для детерминированной генерации
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// ============================================================================
// РАСПРЕДЕЛЕНИЕ СОБЫТИЙ ПО ВРЕМЕНИ
// ============================================================================

/**
 * Распределить события по времени миссии
 */
export function distributeEventsByTime(
  eventCount: number,
  missionDurationSeconds: number,
  seed?: number
): number[] {
  const times: number[] = [];
  const segment = missionDurationSeconds / (eventCount + 1);

  for (let i = 1; i <= eventCount; i++) {
    // Базовое время: i-й сегмент
    const baseTime = segment * i;
    // Добавляем случайность ±20% от сегмента
    const variance = segment * 0.2;
    const random = seed ? seededRandom(seed + i) : Math.random();
    const time = baseTime + (random - 0.5) * 2 * variance;

    times.push(Math.max(0, Math.min(missionDurationSeconds - 60, time)));
  }

  return times.sort((a, b) => a - b);
}

// ============================================================================
// ПРИМЕРЫ СОБЫТИЙ
// ============================================================================

/**
 * Пример позитивного события с динамическим материалом из локации
 */
export const EXAMPLE_POSITIVE_EVENT: EventTemplate = {
  id: 'event_discovery_resource_cache',
  name: 'Находка ресурсов',
  type: 'positive',
  category: 'discovery',

  title: 'Вы обнаружили тайник',
  description: `Среди густых зарослей искатель заметил странные отметины на дереве —
явный знак, оставленный кем-то раньше. После недолгих поисков удалось найти
спрятанный схрон с припасами. Судя по всему, здесь давно никто не был.`,
  flavorText: 'Старый тайник хранит свои секреты...',

  conditions: {
    locationTypes: ['forest', 'mountain', 'mine'],
    minProgress: 10,
    maxProgress: 90,
  },

  effects: [
    {
      type: 'grant_location_material',
      materialRarity: 'common',       // Взять обычный материал из локации
      materialQuantity: { base: 2, variance: 0.5, perDifficulty: 0, perRarity: 0 },
      description: '+2-3 ресурса из локации',
    },
    {
      type: 'grant_resource',
      resourceId: 'gold',
      quantity: { base: 15, variance: 0.3, perDifficulty: 5, perRarity: 3 },
      description: '+15-20 золота',
    },
  ],

  weight: 25,
  icon: '📦',
};

/**
 * Пример негативного события
 */
export const EXAMPLE_NEGATIVE_EVENT: EventTemplate = {
  id: 'event_danger_trap',
  name: 'Ловушка',
  type: 'negative',
  category: 'danger',

  title: 'Ловушка!',
  description: `Неосторожный шаг — и под ногой щёлкнул скрытый механизм.
Старая ловушка, установленная браконьерами или беглыми преступниками,
всё ещё работает. Придётся потратить время и силы, чтобы освободиться.`,

  conditions: {
    locationTypes: ['forest', 'mine', 'swamp'],
    minProgress: 5,
    maxProgress: 95,
  },

  effects: [
    {
      type: 'damage_adventurer',
      modifier: 10,
      description: '-10% HP искателя',
    },
    {
      type: 'damage_weapon',
      modifier: 5,
      description: '-5% прочности оружия',
    },
    {
      type: 'modify_duration',
      modifier: 120,             // +2 минуты
      description: '+2 минуты к времени миссии',
    },
  ],

  weight: 20,
  icon: '⚠️',
};

/**
 * Пример события с выбором
 */
export const EXAMPLE_CHOICE_EVENT: EventTemplate = {
  id: 'event_choice_investigate_ruins',
  name: 'Руины',
  type: 'choice',
  category: 'discovery',

  title: 'Древние руины',
  description: `На пути возникли развалины какого-то строения — возможно,
древняя сторожевая башня или охотничий домик. Стены поросли мхом,
но внутри можно разглядеть что-то блестящее. Исследовать или обойти?`,

  conditions: {
    locationTypes: ['forest', 'mountain'],
    missionTypes: ['scout', 'investigate', 'hunt'],
    baseChance: 25,
  },

  choices: [
    {
      id: 'search',
      text: 'Обыскать руины',
      effects: [
        {
          type: 'grant_location_material',
          materialRarity: 'uncommon',   // Попытка найти необычный материал
          materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: 'Найти необычный материал',
        },
        {
          type: 'grant_resource',
          resourceId: 'gold',
          quantity: { base: 25, variance: 0.4, perDifficulty: 10, perRarity: 5 },
          description: '+25-35 золота',
        },
        {
          type: 'damage_adventurer',
          modifier: 15,
          description: 'Риск ловушки: -15% HP',
        },
      ],
      resultText: 'Вы обыскали руины и кое-что нашли, хотя не обошлось без неприятностей.',
    },
    {
      id: 'bypass',
      text: 'Обойти стороной',
      effects: [
        {
          type: 'narrative_only',
          description: 'Продолжить путь без приключений',
        },
      ],
      resultText: 'Вы решили не рисковать и обошли руины стороной.',
    },
    {
      id: 'quick_look',
      text: 'Бросить быстрый взгляд',
      requires: { traits: ['cautious', 'scout', 'perceptive'] },
      effects: [
        {
          type: 'grant_location_material',
          materialRarity: 'common',
          materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: 'Найти что-то полезное',
        },
        {
          type: 'modify_success_chance',
          modifier: 5,
          description: 'Полезная информация: +5% к успеху',
        },
      ],
      resultText: 'Быстрый осмотр принёс кое-какие находки и полезную информацию.',
    },
  ],

  weight: 15,
  icon: '🏚️',
};

// ============================================================================
// ЭКСПОРТ
// ============================================================================

// Все экспорты уже сделаны inline выше
