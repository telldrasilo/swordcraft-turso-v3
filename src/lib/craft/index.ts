/**
 * Система крафта v2
 * Экспорт всех модулей
 */

// Генератор процесса
export { 
  generateCraftStages, 
  createCraftPlan, 
  createActiveCraft 
} from './process-generator'

// Калькулятор характеристик
export { 
  calculateWeapon,
  getQualityInfo,
  calculateForecast,
  calculateAverageExpertise,
  rollWeaponOutcome,
  computeSellPriceForWeapon,
} from './calculator'
export type { WeaponCalculationResult } from './calculator'

export * from './constants'
export * from './formulas'
export {
  getQualityWithinGradeDisplay,
  describeQualityRange,
} from './quality-display'
export type { QualityWithinGradeDisplay } from './quality-display'

// Генератор имён
export {
  generateWeaponName,
  getSuffixLevel,
  getSuffixDescription,
} from './name-generator'
export type { WeaponNameResult } from './name-generator'

// Типы
export type {
  Material,
  CraftStageInstance,
  Technique,
  WeaponRecipe,
  CraftPlan,
  ActiveCraftV2,
  WeaponStats,
  QualityGrade,
  MaterialAssignment,
} from '@/types/craft-v2'
