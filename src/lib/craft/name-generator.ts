/**
 * Генератор имён оружия
 * Создаёт имя по формуле: [РанговыйПрефикс] [Материал] [База] [Суффикс]
 * Пример: "Обычный Стальной меч остроты II"
 * 
 * @see docs/CRAFT_SYSTEM_CONCEPT.md - секция 8.1 Система именования
 */

import type { 
  Material, 
  WeaponRecipe, 
  DominantPropertyType,
  QualityRank 
} from '@/types/craft-v2'
import { 
  SUFFIX_RULES, 
  ROMAN_NUMERALS, 
  calculateSuffixLevel,
  getQualityRank,
  getQualityRankPrefix 
} from '@/types/craft-v2'

/**
 * Результат генерации имени
 */
export interface WeaponNameResult {
  prefix: string              // "Стальной" (от материала)
  baseName: string            // "меч"
  suffix: string             // "остроты II"
  fullName: string           // "Обычный Стальной меч остроты II"
  qualityRank: QualityRank   // "C"
  qualityPrefix: string      // "Хороший"
}

/**
 * Сгенерировать имя оружия
 * 
 * @param recipe Рецепт оружия
 * @param combatMaterial Материал боевой части (лезвие для меча)
 * @param quality Качество оружия (0-100) для определения ранга
 */
export function generateWeaponName(
  recipe: WeaponRecipe,
  combatMaterial: Material | null,
  quality: number = 50
): WeaponNameResult {
  // 1. База — всегда из рецепта
  const baseName = recipe.name
  
  // 2. Префикс материала — из материала боевой части
  const materialPrefix = combatMaterial?.adjective || ''
  
  // 3. Суффикс — из доминирующего свойства материала
  const suffix = generateSuffix(combatMaterial)
  
  // 4. Ранговый префикс от качества
  const qualityRank = getQualityRank(quality)
  const qualityPrefix = getQualityRankPrefix(qualityRank)
  
  // 5. Полное имя: [РанговыйПрефикс] [Материал] [База] [Суффикс]
  const parts = [qualityPrefix, materialPrefix, baseName, suffix].filter(Boolean)
  const fullName = parts.join(' ')
  
  return {
    prefix: materialPrefix,
    baseName,
    suffix,
    fullName,
    qualityRank,
    qualityPrefix,
  }
}

/**
 * Сгенерировать суффикс
 */
function generateSuffix(material: Material | null): string {
  if (!material?.dominantProperty) return ''
  
  const { type, value } = material.dominantProperty
  
  // Находим правило для этого свойства
  const rule = SUFFIX_RULES.find(r => r.property === type)
  if (!rule) return ''
  
  // Проверяем порог
  if (value < rule.threshold) return ''
  
  // Рассчитываем уровень
  const level = calculateSuffixLevel(value, rule.threshold, rule.levelStep)
  if (level < 1) return ''
  
  // Формируем суффикс
  const numeral = ROMAN_NUMERALS[level - 1] || ''
  return `${rule.name} ${numeral}`
}

/**
 * Получить уровень суффикса (для отображения в UI)
 */
export function getSuffixLevel(material: Material | null): number {
  if (!material?.dominantProperty) return 0
  
  const { type, value } = material.dominantProperty
  const rule = SUFFIX_RULES.find(r => r.property === type)
  if (!rule) return 0
  
  return calculateSuffixLevel(value, rule.threshold, rule.levelStep)
}

/**
 * Получить описание суффикса
 */
export function getSuffixDescription(type: DominantPropertyType): string {
  const descriptions: Record<DominantPropertyType, string> = {
    sharpness: 'Увеличивает урон оружия',
    durability: 'Увеличивает прочность оружия',
    balance: 'Улучшает баланс и эффективность',
    conductivity: 'Усиливает магические свойства',
    lightness: 'Уменьшает вес оружия',
  }
  return descriptions[type] || ''
}

const nameGeneratorDefaultExport = {
  generateWeaponName,
  getSuffixLevel,
  getSuffixDescription,
}
export default nameGeneratorDefaultExport
