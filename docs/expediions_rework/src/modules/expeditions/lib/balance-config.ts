/**
 * ГЛОБАЛЬНЫЙ КОНФИГ БАЛАНСИРОВКИ
 *
 * Централизованное управление множителями для:
 * - Балансировки игры
 * - Тестирования
 * - Масштабирования для бесконечного прогресса
 *
 * ИЗМЕНЕНИЕ ЭТИХ ЗНАЧЕНИЙ ВЛИЯЕТ НА ВСЮ ИГРУ!
 */

import type { Rarity } from '../types';

// ============================================================================
// ОСНОВНОЙ КОНФИГ
// ============================================================================

/**
 * Глобальные множители балансировки
 *
 * Использование:
 * 1. Для тестирования: увеличить количество ресурсов, уменьшить время
 * 2. Для балансировки: тонкая настройка экономики
 * 3. Для эндгейма: софткапы для бесконечного прогресса
 */
export const GLOBAL_BALANCE_CONFIG = {
  // ============================================================================
  // МНОЖИТЕЛИ РЕСУРСОВ
  // ============================================================================

  resources: {
    /**
     * Множитель КОЛИЧЕСТВА ресурсов
     * - 1.0 = стандартное количество
     * - 2.0 = вдвое больше ресурсов
     * - 0.5 = вдвое меньше ресурсов
     *
     * Влияет на:
     * - grant_location_material (количество материалов из локации)
     * - grant_resource (золото, слава, опыт)
     * - guaranteedMaterials в миссиях
     */
    quantityMultiplier: 1.0,

    /**
     * Множитель КАЧЕСТВА ресурсов (сдвиг редкости вверх)
     * - 0 = стандартное распределение
     * - 1 = +1 уровень редкости (common → uncommon)
     * - 2 = +2 уровня редкости (common → rare)
     * - -1 = -1 уровень редкости (rare → uncommon)
     *
     * Пример: при qualityShift = 1, uncommon материалы становятся rare
     */
    qualityShift: 0,

    /**
     * Множитель шанса выпадения ресурсов
     * - 1.0 = стандартный шанс
     * - 1.5 = +50% к шансу
     * - 0.5 = -50% к шансу
     *
     * Влияет на эффекты с параметром chance
     */
    dropChanceMultiplier: 1.0,
  },

  // ============================================================================
  // МНОЖИТЕЛИ ВРЕМЕНИ
  // ============================================================================

  duration: {
    /**
     * Множитель длительности МИССИЙ
     * - 1.0 = стандартное время
     * - 0.5 = миссии в 2 раза быстрее
     * - 2.0 = миссии в 2 раза дольше
     *
     * Умножается НА итоговую длительность после всех расчётов
     */
    missionDurationMultiplier: 1.0,

    /**
     * Множитель модификаторов времени в событиях
     * - 1.0 = стандартные модификаторы
     * - 0.5 = события дают в 2 раза меньше времени
     *
     * Влияет на modify_duration эффекты
     */
    eventTimeMultiplier: 1.0,
  },

  // ============================================================================
  // МНОЖИТЕЛИ НАГРАД
  // ============================================================================

  rewards: {
    /**
     * Множитель золота
     * - 1.0 = стандартное золото
     * - 2.0 = вдвое больше золота
     */
    goldMultiplier: 1.0,

    /**
     * Множитель опыта
     * - 1.0 = стандартный опыт
     */
    experienceMultiplier: 1.0,

    /**
     * Множитель славы
     * - 1.0 = стандартная слава
     */
    gloryMultiplier: 1.0,

    /**
     * Множитель Души войны
     * - 1.0 = стандартная Душа войны
     */
    warSoulMultiplier: 1.0,
  },

  // ============================================================================
  // СОФТКАПЫ ДЛЯ БЕСКОНЕЧНОГО ПРОГРЕССА
  // ============================================================================

  softCaps: {
    /**
     * Включить систему софткапов
     * При true применяется формула затухания к ресурсам
     */
    enabled: false,

    /**
     * Точка начала затухания (например, после 100 часов игры)
     */
    decayStartPoint: 100,

    /**
     * Коэффициент затухания
     * Формула: effectiveValue = value / (1 + (progress - startPoint) * decayRate)
     *
     * При decayRate = 0.01:
     * - После startPoint: каждый час даёт на 1% меньше ресурсов
     * - На 200 часах: ресурсы снижены на ~50%
     */
    decayRate: 0.01,

    /**
     * Минимальный множитель (ниже не опускается)
     * - 0.1 = минимум 10% от базового значения
     */
    minMultiplier: 0.1,
  },

  // ============================================================================
  // НАСТРОЙКИ ДЛЯ ТЕСТИРОВАНИЯ
  // ============================================================================

  debug: {
    /**
     * Подробное логирование в консоль
     */
    verboseLogs: false,

    /**
     * Принудительная редкость для всех материалов
     * - null = стандартное распределение
     * - 'rare' = ВСЕ материалы rare
     * - 'epic' = ВСЕ материалы epic
     */
    forceRarity: null as Rarity | null,

    /**
     * Отключить случайность
     * - false = стандартная случайность
     * - true = все variance = 0, всегда base значения
     */
    noRandom: false,

    /**
     * Фиксированный seed для генератора
     * - null = случайный seed
     * - число = детерминированная генерация
     */
    fixedSeed: null as number | null,
  },

  // ============================================================================
  // ПРЕСЕТЫ ДЛЯ БЫСТРОЙ НАСТРОЙКИ
  // ============================================================================

  /**
   * Применить пресет конфигурации
   */
  applyPreset(preset: BalancePreset) {
    const presets: Record<BalancePreset, Partial<typeof GLOBAL_BALANCE_CONFIG>> = {
      // Стандартный баланс
      default: {
        resources: { quantityMultiplier: 1.0, qualityShift: 0, dropChanceMultiplier: 1.0 },
        duration: { missionDurationMultiplier: 1.0, eventTimeMultiplier: 1.0 },
        rewards: { goldMultiplier: 1.0, experienceMultiplier: 1.0, gloryMultiplier: 1.0, warSoulMultiplier: 1.0 },
        softCaps: { enabled: false },
        debug: { verboseLogs: false, forceRarity: null, noRandom: false, fixedSeed: null },
      },

      // Для тестирования: быстрые миссии, много ресурсов
      testing: {
        resources: { quantityMultiplier: 3.0, qualityShift: 1, dropChanceMultiplier: 2.0 },
        duration: { missionDurationMultiplier: 0.25, eventTimeMultiplier: 0.5 },
        rewards: { goldMultiplier: 5.0, experienceMultiplier: 3.0, gloryMultiplier: 3.0, warSoulMultiplier: 3.0 },
        softCaps: { enabled: false },
        debug: { verboseLogs: true, forceRarity: null, noRandom: true, fixedSeed: 42 },
      },

      // Для балансировки: всё видно, стандартные значения
      development: {
        resources: { quantityMultiplier: 1.0, qualityShift: 0, dropChanceMultiplier: 1.0 },
        duration: { missionDurationMultiplier: 1.0, eventTimeMultiplier: 1.0 },
        rewards: { goldMultiplier: 1.0, experienceMultiplier: 1.0, gloryMultiplier: 1.0, warSoulMultiplier: 1.0 },
        softCaps: { enabled: false },
        debug: { verboseLogs: true, forceRarity: null, noRandom: false, fixedSeed: null },
      },

      // Хардкор: мало ресурсов, долгие миссии
      hardcore: {
        resources: { quantityMultiplier: 0.5, qualityShift: -1, dropChanceMultiplier: 0.7 },
        duration: { missionDurationMultiplier: 1.5, eventTimeMultiplier: 1.5 },
        rewards: { goldMultiplier: 0.7, experienceMultiplier: 0.8, gloryMultiplier: 1.5, warSoulMultiplier: 1.2 },
        softCaps: { enabled: false },
        debug: { verboseLogs: false, forceRarity: null, noRandom: false, fixedSeed: null },
      },

      // Эндгейм: включены софткапы
      endgame: {
        resources: { quantityMultiplier: 1.0, qualityShift: 0, dropChanceMultiplier: 1.0 },
        duration: { missionDurationMultiplier: 1.0, eventTimeMultiplier: 1.0 },
        rewards: { goldMultiplier: 1.0, experienceMultiplier: 1.0, gloryMultiplier: 1.0, warSoulMultiplier: 1.0 },
        softCaps: { enabled: true, decayStartPoint: 100, decayRate: 0.01, minMultiplier: 0.1 },
        debug: { verboseLogs: false, forceRarity: null, noRandom: false, fixedSeed: null },
      },
    };

    const presetConfig = presets[preset];
    if (!presetConfig) return;

    // Применяем пресет
    Object.assign(this.resources, presetConfig.resources);
    Object.assign(this.duration, presetConfig.duration);
    Object.assign(this.rewards, presetConfig.rewards);
    Object.assign(this.softCaps, presetConfig.softCaps);
    Object.assign(this.debug, presetConfig.debug);
  },
} as const;

export type BalancePreset = 'default' | 'testing' | 'development' | 'hardcore' | 'endgame';

// ============================================================================
// ФУНКЦИИ ПРИМЕНЕНИЯ МНОЖИТЕЛЕЙ
// ============================================================================

/**
 * Применить множитель количества ресурсов
 */
export function applyResourceMultiplier(
  baseQuantity: number,
  resourceType: 'material' | 'gold' | 'experience' | 'glory' | 'warSoul' = 'material'
): number {
  let multiplier = GLOBAL_BALANCE_CONFIG.resources.quantityMultiplier;

  // Дополнительные множители по типу ресурса
  switch (resourceType) {
    case 'gold':
      multiplier *= GLOBAL_BALANCE_CONFIG.rewards.goldMultiplier;
      break;
    case 'experience':
      multiplier *= GLOBAL_BALANCE_CONFIG.rewards.experienceMultiplier;
      break;
    case 'glory':
      multiplier *= GLOBAL_BALANCE_CONFIG.rewards.gloryMultiplier;
      break;
    case 'warSoul':
      multiplier *= GLOBAL_BALANCE_CONFIG.rewards.warSoulMultiplier;
      break;
  }

  const result = Math.floor(baseQuantity * multiplier);

  if (GLOBAL_BALANCE_CONFIG.debug.verboseLogs) {
    console.log(`[BALANCE] ${resourceType}: ${baseQuantity} × ${multiplier.toFixed(2)} = ${result}`);
  }

  return result;
}

/**
 * Применить сдвиг редкости
 */
export function applyQualityShift(baseRarity: Rarity): Rarity {
  const forceRarity = GLOBAL_BALANCE_CONFIG.debug.forceRarity;
  if (forceRarity) return forceRarity;

  const shift = GLOBAL_BALANCE_CONFIG.resources.qualityShift;
  if (shift === 0) return baseRarity;

  const rarityOrder: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const currentIndex = rarityOrder.indexOf(baseRarity);
  const newIndex = Math.max(0, Math.min(rarityOrder.length - 1, currentIndex + shift));

  const result = rarityOrder[newIndex];

  if (GLOBAL_BALANCE_CONFIG.debug.verboseLogs && currentIndex !== newIndex) {
    console.log(`[BALANCE] Rarity shift: ${baseRarity} → ${result}`);
  }

  return result;
}

/**
 * Применить множитель шанса выпадения
 */
export function applyDropChanceMultiplier(baseChance: number): number {
  const multiplier = GLOBAL_BALANCE_CONFIG.resources.dropChanceMultiplier;
  return Math.min(100, Math.floor(baseChance * multiplier));
}

/**
 * Применить множитель длительности миссии
 */
export function applyDurationMultiplier(baseDuration: number): number {
  const multiplier = GLOBAL_BALANCE_CONFIG.duration.missionDurationMultiplier;
  const result = Math.floor(baseDuration * multiplier);

  if (GLOBAL_BALANCE_CONFIG.debug.verboseLogs) {
    console.log(`[BALANCE] Duration: ${baseDuration}s × ${multiplier} = ${result}s`);
  }

  return result;
}

/**
 * Применить множитель времени события
 */
export function applyEventTimeMultiplier(timeModifier: number): number {
  const multiplier = GLOBAL_BALANCE_CONFIG.duration.eventTimeMultiplier;
  return Math.floor(timeModifier * multiplier);
}

/**
 * Применить софткап (если включён)
 *
 * @param baseValue - Базовое значение
 * @param progress - Текущий прогресс игрока (часы, уровень и т.д.)
 */
export function applySoftCap(baseValue: number, progress: number): number {
  const { softCaps } = GLOBAL_BALANCE_CONFIG;

  if (!softCaps.enabled) return baseValue;

  if (progress <= softCaps.decayStartPoint) return baseValue;

  const excessProgress = progress - softCaps.decayStartPoint;
  const decayFactor = 1 + excessProgress * softCaps.decayRate;
  const multiplier = Math.max(softCaps.minMultiplier, 1 / decayFactor);

  const result = Math.floor(baseValue * multiplier);

  if (GLOBAL_BALANCE_CONFIG.debug.verboseLogs) {
    console.log(`[BALANCE] SoftCap: ${baseValue} × ${multiplier.toFixed(3)} = ${result} (progress: ${progress})`);
  }

  return result;
}

/**
 * Получить случайное значение с учётом настроек дебага
 *
 * @param base - Базовое значение
 * @param variance - Вариативность (0.2 = ±20%)
 */
export function getRandomValue(base: number, variance: number): number {
  // Если noRandom = true, возвращаем базовое значение
  if (GLOBAL_BALANCE_CONFIG.debug.noRandom) {
    return base;
  }

  // Используем фиксированный seed если задан
  if (GLOBAL_BALANCE_CONFIG.debug.fixedSeed !== null) {
    const seed = GLOBAL_BALANCE_CONFIG.debug.fixedSeed;
    const random = seededRandom(seed);
    const variation = base * variance * (random * 2 - 1);
    return Math.floor(base + variation);
  }

  // Стандартная случайность
  const variation = base * variance * (Math.random() * 2 - 1);
  return Math.floor(base + variation);
}

/**
 * Seeded random для детерминированной генерации
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ============================================================================
// УТИЛИТАРНЫЕ ФУНКЦИИ
// ============================================================================

/**
 * Получить текущий конфиг (для UI или сохранения)
 */
export function getBalanceConfig(): typeof GLOBAL_BALANCE_CONFIG {
  return GLOBAL_BALANCE_CONFIG;
}

/**
 * Сбросить конфиг к стандартным значениям
 */
export function resetBalanceConfig(): void {
  GLOBAL_BALANCE_CONFIG.applyPreset('default');
}

/**
 * Проверить, включён ли режим тестирования
 */
export function isTestingMode(): boolean {
  return GLOBAL_BALANCE_CONFIG.debug.noRandom || GLOBAL_BALANCE_CONFIG.debug.forceRarity !== null;
}
