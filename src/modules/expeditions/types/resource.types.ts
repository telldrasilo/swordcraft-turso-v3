/**
 * Типы материалов для модуля экспедиций
 */

import { Rarity } from './location.types';

// ============================================================================
// Категории материалов
// ============================================================================

export type MaterialCategory =
  | 'ore'           // Руда
  | 'ingot'         // Слитки
  | 'wood'          // Дерево
  | 'leather'       // Кожа
  | 'stone'         // Камень
  | 'gem'           // Драгоценные камни
  | 'herb'          // Травы
  | 'special'       // Специальные
  | 'component';    // Компоненты для крафта

// ============================================================================
// Материал
// ============================================================================

export interface Material {
  id: string;
  name: string;
  description: string;
  category: MaterialCategory;
  rarity: Rarity;

  // Базовые свойства для крафта
  properties?: MaterialProperties;

  // Где добывается
  sourceLocations?: string[];

  // Для UI
  icon?: string;
  stackSize?: number;
}

export interface MaterialProperties {
  hardness?: number;      // 0-100
  weight?: number;        // Относительный вес
  conductivity?: number;  // Для металлов
  flexibility?: number;   // Для дерева/кожи
  magicAffinity?: number; // Совместимость с магией
}

// ============================================================================
// Базовые ресурсы (из существующего проекта)
// ============================================================================

export type BaseResourceKey =
  // Сырьё
  | 'wood'
  | 'stone'
  | 'iron_ore'
  | 'copper_ore'
  | 'tin_ore'
  | 'silver_ore'
  | 'gold_ore'
  | 'mithril_ore'
  | 'coal'
  // Слитки
  | 'iron_ingot'
  | 'copper_ingot'
  | 'tin_ingot'
  | 'bronze_ingot'
  | 'steel_ingot'
  | 'silver_ingot'
  | 'gold_ingot'
  | 'mithril_ingot'
  // Обработанные
  | 'planks'
  | 'stone_blocks'
  | 'leather'
  | 'tanned_leather'
  // Особые
  | 'soul_essence'
  | 'gold';  // Валюта

// ============================================================================
// Ресурс для стора (количество)
// ============================================================================

export interface ResourceAmount {
  resourceId: string;
  amount: number;
}

// ============================================================================
// Утилиты для работы с материалами
// ============================================================================

export function getMaterialsByRarity(
  materials: Material[],
  rarity: Rarity
): Material[] {
  return materials.filter((m) => m.rarity === rarity);
}

export function getMaterialsByCategory(
  materials: Material[],
  category: MaterialCategory
): Material[] {
  return materials.filter((m) => m.category === category);
}

export function getMaterialsByLocation(
  materials: Material[],
  locationId: string
): Material[] {
  return materials.filter(
    (m) => m.sourceLocations?.includes(locationId)
  );
}
