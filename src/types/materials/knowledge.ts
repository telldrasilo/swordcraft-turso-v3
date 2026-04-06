/**
 * Система знаний о материалах
 * Экспертиза игрока и влияние на крафт
 */

import type { MaterialNode } from './material-core'

// ================================ ПОРОГИ ЗНАНИЙ

export type KnowledgeThreshold =
  | 'undiscovered'   // 0%
  | 'curious'        // 10%
  | 'familiar'       // 30%
  | 'experienced'    // 50%
  | 'mastered'       // 75%
  | 'legendary'      // 90%
  | 'max'            // 100%

export const KNOWLEDGE_THRESHOLDS: Record<KnowledgeThreshold, number> = {
  undiscovered: 0,
  curious: 10,
  familiar: 30,
  experienced: 50,
  mastered: 75,
  legendary: 90,
  max: 100,
}

export const KNOWLEDGE_LABELS: Record<KnowledgeThreshold, string> = {
  undiscovered: 'Неизвестно',
  curious: 'Любопытство',
  familiar: 'Знакомство',
  experienced: 'Опыт',
  mastered: 'Мастерство',
  legendary: 'Легенда',
  max: 'Абсолют',
}

// ================================ ЗНАНИЯ ИГРОКА

export interface MaterialKnowledge {
  materialId: string
  expertise: number        // 0-100, текущая экспертиза
  discoveredAt: number     // когда открыт (timestamp)
  lastUsedAt: number       // когда последний раз использовали
  totalUses: number        // сколько раз использовали в крафте
  totalResearchTime: number // время исследования (секунды)
}

// ================================ ВЛИЯНИЕ ЭКСПЕРТИЗЫ НА КРАФТ

export interface ExpertiseImpact {
  // Эффективность
  timeMultiplier: number      // множитель времени (0.75 при 100%)
  defectRiskMultiplier: number // множитель риска (0.30 при 100%)
  materialWasteMultiplier: number // множитель отходов (0.20 при 100%)

  // Качество
  qualityBonus: number       // бонус к качеству (+20 при 100%)
  varianceMultiplier: number // множитель разброса (0.0 при 100%)

  // Прогноз
  predictionAccuracy: number  // точность прогноза 50-100%
}

// ================================ ФУНКЦИИ РАСЧЁТА

/**
 * Получить порог знаний по экспертизе
 */
export function getKnowledgeThreshold(expertise: number): KnowledgeThreshold {
  if (expertise < 10) return 'undiscovered'
  if (expertise < 30) return 'curious'
  if (expertise < 50) return 'familiar'
  if (expertise < 75) return 'experienced'
  if (expertise < 90) return 'mastered'
  if (expertise < 100) return 'legendary'
  return 'max'
}

/**
 * Рассчитать влияние экспертизы на крафт
 * Бонусы зависят и от экспертизы игрока, и от свойств материала
 */
export function calculateExpertiseImpact(material: MaterialNode, expertise: number): ExpertiseImpact {
  const { physical, chemical, arcane, processing, economy } = material

  // 1. Скорость крафта (timeMultiplier)
  // Зависит от: обрабатываемости (+), твёрдости (-), сложности переработки (-), теплопроводности (+)
  const baseTimeMultiplier = 1.0 - (expertise * 0.0015) // Экспертиза даёт 15% максимум
  const materialTimeFactor =
    (processing.workability / 100) * 0.35 +      // Обрабатываемость ускоряет (35% веса)
    (physical.hardness / 200) * -0.20 -           // Твёрдость замедляет (20% веса)
    (processing.refineDifficulty / 100) * -0.15 -  // Сложность переработки замедляет (15% веса)
    (physical.thermalConductivity / 100) * 0.30    // Теплопроводность ускоряет (30% веса)
  const timeMultiplier = Math.max(0.2, baseTimeMultiplier * (0.7 + materialTimeFactor * 0.6))

  // 2. Риск дефектов (defectRiskMultiplier)
  // Зависит от: химической стабильности (+), базового риска (-), прочности на разрыв (+), потенциала чистоты (+)
  const baseRiskMultiplier = 1.0 - (expertise * 0.005) // Экспертиза даёт 50% максимум
  const materialRiskFactor =
    (chemical.stability / 100) * 0.25 +        // Химическая стабильность снижает риск (25%)
    (processing.defectRisk / 100) * -0.25 +    // Базовый риск дефектов повышает риск (25%)
    (physical.tensileStrength / 200) * 0.25 +   // Прочность на разрыв снижает риск (25%)
    (processing.purityPotential / 100) * 0.25  // Потенциал чистоты снижает риск (25%)
  const defectRiskMultiplier = Math.max(0.1, baseRiskMultiplier * (0.5 + materialRiskFactor * 1.0))

  // 3. Отходы материала (materialWasteMultiplier)
  // Зависит от: пористости (-), ремонтопригодности (+), обрабатываемости (+), прочности на разрыв (+)
  const baseWasteMultiplier = 1.0 - (expertise * 0.006) // Экспертиза даёт 60% максимум
  const materialWasteFactor =
    (1 - physical.porosity / 100) * 0.30 +    // Меньше пористости = меньше отходы (30%)
    (processing.repairability / 100) * 0.35 + // Выше ремонтопригодность = меньше отходы (35%)
    (processing.workability / 100) * 0.25 +   // Выше обрабатываемость = меньше отходы (25%)
    (physical.tensileStrength / 200) * 0.10    // Выше прочность = меньше отходы (10%)
  const materialWasteMultiplier = Math.max(0.1, baseWasteMultiplier * (0.4 + materialWasteFactor * 1.2))

  // 4. Бонус к качеству (qualityBonus)
  // Зависит от: твёрдости (+), прочности (+), магической проводимости (+), редкости (+)
  const baseQualityBonus = expertise * 0.15 // Экспертиза даёт до +15
  const materialQualityBonus =
    (physical.hardness / 200) * 20 +          // Твёрдость даёт до +20
    (physical.toughness / 200) * 20 +         // Прочность даёт до +20
    (arcane.conductivity / 100) * 10 +        // Магическая проводимость до +10
    (economy.rarity / 200) * 15              // Редкость даёт до +15
  const qualityBonus = Math.min(100, baseQualityBonus + materialQualityBonus)

  // 5. Разброс характеристик (varianceMultiplier)
  // Зависит от: химической и магической стабильности, качества материала (твёрдость + прочность)
  const baseVariance = 1.0 - (expertise * 0.008) // Экспертиза даёт 80% (1.0→0.2)
  const materialStability = (chemical.stability + arcane.stability) / 200 // 0-1
  const materialQuality = (physical.hardness + physical.toughness) / 400    // 0-1
  const varianceMultiplier = Math.max(0, baseVariance * (0.3 + materialStability * 0.35 + materialQuality * 0.35))

  // 6. Точность прогноза (predictionAccuracy)
  // Зависит от: химической стабильности (+), магической стабильности (+), изученности (+)
  const baseAccuracy = 50 + expertise * 0.4 // Экспертиза даёт 40% (50→90)
  const materialAccuracyFactor =
    (chemical.stability / 100) * 20 +       // Стабильность до +20%
    (arcane.stability / 100) * 15 +         // Магическая стабильность до +15%
    (economy.discoverability / 100) * 15    // Изученность до +15%
  const predictionAccuracy = Math.min(100, baseAccuracy + materialAccuracyFactor)

  return {
    timeMultiplier,
    defectRiskMultiplier,
    materialWasteMultiplier,
    qualityBonus,
    varianceMultiplier,
    predictionAccuracy,
  }
}

/**
 * Рассчитать прирост экспертизы
 * Закон убывающей отдачи: чем выше экспертиза, тем сложнее набрать
 */
export function calculateKnowledgeGain(
  action: 'craft' | 'research' | 'special' | 'use',
  currentExpertise: number,
  amount: number = 1
): number {
  // Закон убывающей отдачи
  const diminishingFactor = 1 - (currentExpertise / 150)

  const baseGain = {
    craft: 0.5,      // +0.5% за использование в крафте
    research: 2.0,   // +2.0% в час исследования
    special: 10.0,   // +10% за особое событие
    use: 0.1,        // +0.1% за перекрёстное использование
  }[action] || 0

  const finalGain = baseGain * amount * diminishingFactor

  return Math.max(0.01, finalGain)
}

/**
 * Создать начальные знания о материале
 */
export function createMaterialKnowledge(materialId: string): MaterialKnowledge {
  return {
    materialId,
    expertise: 0,
    discoveredAt: Date.now(),
    lastUsedAt: Date.now(),
    totalUses: 0,
    totalResearchTime: 0,
  }
}

/**
 * Запись при первом «открытии» материала (ENC / склад без порога кузницы).
 * Экспертиза 1% — видно в справочнике; для кузницы v2 нужен порог отдельно (см. MIN_MATERIAL_EXPERTISE_FOR_CRAFT).
 */
export function createDiscoveredMaterialKnowledge(materialId: string): MaterialKnowledge {
  const now = Date.now()
  return {
    materialId,
    expertise: 1,
    discoveredAt: now,
    lastUsedAt: now,
    totalUses: 0,
    totalResearchTime: 0,
  }
}

/**
 * Добавить экспертизу к материалу
 */
export function addExpertise(
  knowledge: MaterialKnowledge,
  action: 'craft' | 'research' | 'special' | 'use',
  amount: number = 1
): MaterialKnowledge {
  const gain = calculateKnowledgeGain(action, knowledge.expertise, amount)
  const newExpertise = Math.min(100, knowledge.expertise + gain)

  return {
    ...knowledge,
    expertise: newExpertise,
    lastUsedAt: Date.now(),
    totalUses: knowledge.totalUses + (action === 'craft' ? amount : 0),
    totalResearchTime: knowledge.totalResearchTime + (action === 'research' ? amount : 0),
  }
}

/**
 * Проверить, что материал открыт (экспертиза > 0)
 */
export function isMaterialDiscovered(knowledge: MaterialKnowledge | undefined): boolean {
  return knowledge !== undefined && knowledge.expertise > 0
}

/**
 * Получить процент отображения для UI
 */
export function getExpertisePercent(knowledge: MaterialKnowledge | undefined): number {
  if (!knowledge) return 0
  return Math.round(knowledge.expertise)
}

/**
 * Проверить, доступен ли уровень детализации
 */
export function isDetailLevelAvailable(
  knowledge: MaterialKnowledge | undefined,
  requiredThreshold: KnowledgeThreshold
): boolean {
  if (!knowledge) return false

  const currentThreshold = getKnowledgeThreshold(knowledge.expertise)
  const thresholds: KnowledgeThreshold[] = [
    'undiscovered', 'curious', 'familiar', 'experienced', 'mastered', 'legendary', 'max'
  ]

  return thresholds.indexOf(currentThreshold) >= thresholds.indexOf(requiredThreshold)
}

// ================================ СОСТОЯНИЕ ЭНЦИКЛОПЕДИИ

export interface EncyclopediaState {
  materialKnowledge: Record<string, MaterialKnowledge>
  searchQuery: string
  selectedCategory: string
}

export const INITIAL_ENCYCLOPEDIA_STATE: EncyclopediaState = {
  materialKnowledge: {},
  searchQuery: '',
  selectedCategory: 'all',
}
