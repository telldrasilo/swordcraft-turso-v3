/**
 * Система знаний о материалах
 * Экспертиза игрока и влияние на крафт
 */

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
 */
export function calculateExpertiseImpact(expertise: number): ExpertiseImpact {
  // 1. Эффективность
  // Время: 0% = 1.0, 100% = 0.75 (на 25% быстрее)
  const timeMultiplier = 1.0 - (expertise * 0.0025)

  // Риск дефектов: 0% = 1.0, 100% = 0.30 (на 70% меньше)
  const defectRiskMultiplier = 1.0 - (expertise * 0.007)

  // Отходы материала: 0% = 1.0, 100% = 0.20 (на 80% меньше)
  const materialWasteMultiplier = 1.0 - (expertise * 0.008)

  // 2. Качество
  // Бонус к качеству: 0% = 0, 100% = 20
  const qualityBonus = expertise * 0.2

  // Разброс характеристик: 0% = 1.0, 100% = 0.0 (полная предсказуемость)
  const varianceMultiplier = 1.0 - (expertise * 0.01)

  // 3. Прогноз
  // Точность прогноза: 0% = 50%, 100% = 100%
  const predictionAccuracy = Math.min(100, 50 + expertise * 0.5)

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
