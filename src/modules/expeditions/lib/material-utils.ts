/**
 * УТИЛИТЫ ДЛЯ УПРАВЛЕНИЯ МАТЕРИАЛАМИ
 *
 * Этот файл содержит функции для добавления и изменения материалов в системе.
 * Используйте эти утилиты для расширения контента.
 *
 * АРХИТЕКТУРА:
 * ┌─────────────────┐     ┌─────────────────────┐
 * │ MATERIAL_REGISTRY│     │ Location.resources  │
 * │ (все материалы) │     │ (ссылки + веса)     │
 * └────────┬────────┘     └──────────┬──────────┘
 *          │                         │
 *          │  materialId             │ materialId
 *          ▼                         ▼
 * ┌─────────────────────────────────────────────┐
 * │           СОБЫТИЯ И МИССИИ                   │
 * │   Выбирают материалы динамически по редкости │
 * │   materialRarity: 'common' → материал из     │
 * │   Location.resources с этой редкостью        │
 * └─────────────────────────────────────────────┘
 */

import type { Material, MaterialCatalogRarity, Location, Rarity, LocationResource } from '../types';

function catalogRarityToLocationRarity(r: MaterialCatalogRarity): Rarity {
  return r === 'unique' ? 'legendary' : r
}

// ============================================================================
// ТИПЫ
// ============================================================================

interface RarityDistribution {
  common: number;
  uncommon: number;
  rare: number;
  epic: number;
  legendary: number;
}

// ============================================================================
// 1. ДОБАВИТЬ НОВЫЙ МАТЕРИАЛ В РЕЕСТР
// ============================================================================

/**
 * Добавить новый материал в реестр
 *
 * @example
 * const newMaterial = {
 *   id: 'ancient_amber',
 *   name: 'Древний янтарь',
 *   description: 'Окаменелая смола древних деревьев',
 *   category: 'gem',
 *   rarity: 'epic',
 *   sourceLocations: ['whispering_forest', 'depths_of_the_world'],
 * };
 * const updatedRegistry = addMaterialToRegistry(MATERIAL_REGISTRY, newMaterial);
 */
export function addMaterialToRegistry(
  registry: Material[],
  material: Material
): Material[] {
  if (registry.some(m => m.id === material.id)) {
    console.warn(`Material "${material.id}" already exists in registry`);
    return registry;
  }

  return [...registry, material];
}

/**
 * Массовое добавление материалов
 */
export function addMaterialsToRegistry(
  registry: Material[],
  materials: Material[]
): Material[] {
  return materials.reduce(
    (acc, material) => addMaterialToRegistry(acc, material),
    registry
  );
}

// ============================================================================
// 2. ДОБАВИТЬ МАТЕРИАЛ В ЛОКАЦИЮ
// ============================================================================

/**
 * Добавить материал в локацию
 *
 * @example
 * const updatedLocation = addResourceToLocation(
 *   oakGroveOutskirts,
 *   {
 *     materialId: 'rare_mushroom',
 *     baseWeight: 15,
 *     rarity: 'uncommon',
 *     minQuantity: 1,
 *     maxQuantity: 3,
 *   }
 * );
 */
export function addResourceToLocation(
  location: Location,
  resource: LocationResource
): Location {
  if (location.resources.some(r => r.materialId === resource.materialId)) {
    console.warn(`Resource "${resource.materialId}" already in location "${location.id}"`);
    return location;
  }

  const newResources = [...location.resources, resource];
  const newDistribution = recalculateRarityDistribution(newResources);

  return {
    ...location,
    resources: newResources,
    rarityDistribution: newDistribution,
  };
}

/**
 * Массовое добавление ресурсов в локацию
 */
export function addResourcesToLocation(
  location: Location,
  resources: LocationResource[]
): Location {
  return resources.reduce(
    (loc, resource) => addResourceToLocation(loc, resource),
    location
  );
}

// ============================================================================
// 3. ОБНОВИТЬ МАТЕРИАЛ В ЛОКАЦИИ
// ============================================================================

/**
 * Обновить параметры ресурса в локации (вес, количество)
 *
 * @example
 * const updatedLocation = updateResourceInLocation(
 *   oakGroveOutskirts,
 *   'wild_herbs',
 *   { baseWeight: 50, minQuantity: 2 }
 * );
 */
export function updateResourceInLocation(
  location: Location,
  materialId: string,
  updates: Partial<LocationResource>
): Location {
  const newResources = location.resources.map(r =>
    r.materialId === materialId ? { ...r, ...updates } : r
  );

  const newDistribution = recalculateRarityDistribution(newResources);

  return {
    ...location,
    resources: newResources,
    rarityDistribution: newDistribution,
  };
}

// ============================================================================
// 4. УДАЛИТЬ МАТЕРИАЛ ИЗ ЛОКАЦИИ
// ============================================================================

/**
 * Удалить материал из локации
 */
export function removeResourceFromLocation(
  location: Location,
  materialId: string
): Location {
  const newResources = location.resources.filter(r => r.materialId !== materialId);
  const newDistribution = recalculateRarityDistribution(newResources);

  return {
    ...location,
    resources: newResources,
    rarityDistribution: newDistribution,
  };
}

// ============================================================================
// 5. ПЕРЕРАСЧЁТ РАСПРЕДЕЛЕНИЯ РЕДКОСТИ
// ============================================================================

/**
 * Пересчитать распределение редкости на основе ресурсов
 *
 * Автоматически вызывается при добавлении/удалении ресурсов
 */
export function recalculateRarityDistribution(
  resources: LocationResource[]
): RarityDistribution {
  const distribution: RarityDistribution = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  };

  // Считаем веса по редкости
  const weightsByRarity: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  };

  for (const resource of resources) {
    weightsByRarity[resource.rarity] += resource.baseWeight;
  }

  const totalWeight = Object.values(weightsByRarity).reduce((a, b) => a + b, 0);

  if (totalWeight === 0) return distribution;

  // Конвертируем в проценты
  for (const rarity of Object.keys(weightsByRarity) as Rarity[]) {
    distribution[rarity] = Math.round(
      (weightsByRarity[rarity] / totalWeight) * 100
    );
  }

  return distribution;
}

// ============================================================================
// 6. ВАЛИДАЦИЯ
// ============================================================================

/**
 * Валидация: все ли материалы локации существуют в реестре
 *
 * Запускать при билде или тестах
 */
export function validateLocationMaterials(
  location: Location,
  registry: Material[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const resource of location.resources) {
    const material = registry.find(m => m.id === resource.materialId);

    if (!material) {
      errors.push(
        `Location "${location.id}": Material "${resource.materialId}" not found in registry`
      );
    } else if (material.rarity !== resource.rarity) {
      errors.push(
        `Location "${location.id}": Material "${resource.materialId}" has rarity "${material.rarity}" in registry but "${resource.rarity}" in location`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Валидация всех локаций
 */
export function validateAllLocations(
  locations: Location[],
  registry: Material[]
): { valid: boolean; errors: string[] } {
  const allErrors: string[] = [];

  for (const location of locations) {
    const result = validateLocationMaterials(location, registry);
    allErrors.push(...result.errors);
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}

// ============================================================================
// 7. СПЕЦИАЛЬНЫЕ УТИЛИТЫ
// ============================================================================

/**
 * Получить все локации, где встречается материал
 */
export function getLocationsWithMaterial(
  materialId: string,
  locations: Location[]
): Location[] {
  return locations.filter(loc =>
    loc.resources.some(r => r.materialId === materialId)
  );
}

/**
 * Клонировать материал из реестра в локацию
 *
 * @example
 * // Добавить мифрил в новую локацию
 * const updatedLocation = cloneMaterialToLocation(
 *   newLocation,
 *   'mithril_ore',
 *   MATERIAL_REGISTRY,
 *   { baseWeight: 80, rarity: 'uncommon' }
 * );
 */
export function cloneMaterialToLocation(
  targetLocation: Location,
  sourceMaterialId: string,
  registry: Material[],
  overrides?: Partial<LocationResource>
): Location {
  const material = registry.find(m => m.id === sourceMaterialId);

  if (!material) {
    console.warn(`Material "${sourceMaterialId}" not found in registry`);
    return targetLocation;
  }

  const newResource: LocationResource = {
    materialId: material.id,
    baseWeight: overrides?.baseWeight ?? 50,
    rarity: overrides?.rarity ?? catalogRarityToLocationRarity(material.rarity),
    minQuantity: overrides?.minQuantity ?? 1,
    maxQuantity: overrides?.maxQuantity ?? 3,
  };

  return addResourceToLocation(targetLocation, newResource);
}

// ============================================================================
// ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ
// ============================================================================

/**
 * ПРИМЕР 1: Добавить новый материал в реестр и локацию
 *
 * // 1. Создаём новый материал
 * const crystalRose: Material = {
 *   id: 'crystal_rose',
 *   name: 'Хрустальная роза',
 *   description: 'Редкий цветок, растущий только в магических лесах',
 *   category: 'herb',
 *   rarity: 'rare',
 *   sourceLocations: ['whispering_forest'],
 * };
 *
 * // 2. Добавляем в реестр
 * const newRegistry = addMaterialToRegistry(MATERIAL_REGISTRY, crystalRose);
 *
 * // 3. Добавляем в локацию
 * const updatedForest = addResourceToLocation(whisperingForest, {
 *   materialId: 'crystal_rose',
 *   baseWeight: 20,
 *   rarity: 'rare',
 *   minQuantity: 1,
 *   maxQuantity: 2,
 * });
 *
 * // 4. Готово! События автоматически начнут выдавать этот материал
 * // при materialRarity: 'rare' в локации whispering_forest
 */

/**
 * ПРИМЕР 2: Изменить вес материала (баланс)
 *
 * const updatedLocation = updateResourceInLocation(
 *   oakGroveOutskirts,
 *   'wild_herbs',
 *   { baseWeight: 50 }  // Было 30, стало 50 — чаще попадается
 * );
 */

/**
 * ПРИМЕР 3: Валидация при билде
 *
 * const result = validateAllLocations(LOCATION_REGISTRY, MATERIAL_REGISTRY);
 * if (!result.valid) {
 *   console.error('Material validation errors:', result.errors);
 * }
 */
