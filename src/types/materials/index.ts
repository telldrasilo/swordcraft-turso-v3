/**
 * Система материалов
 * Экспорт всех типов
 */

// Ядро материала
export type {
  MaterialClass,
  MaterialOrigin,
  MaterialIdentity,
  MaterialPhysical,
  MaterialChemical,
  MaterialArcane,
  MaterialProcessing,
  MaterialEconomy,
  ProcessType,
  MaterialRecipeInput,
  MaterialProcessModifiers,
  MaterialRecipe,
  MaterialSummary,
  DiscoveryType,
  DiscoveryRequirement,
  DiscoveryPath,
  MaterialDiscovery,
  MaterialNode,
  MaterialDisplayCategory,
  MaterialRarity,
} from './material-core'

export {
  MATERIAL_CATEGORIES,
  getDisplayCategory,
  getMaterialRarity,
  RARITY_COLORS,
  RARITY_BG_COLORS,
  RARITY_LABELS,
} from './material-core'

// Знания и экспертиза
export type {
  KnowledgeThreshold,
  MaterialKnowledge,
  ExpertiseImpact,
  EncyclopediaState,
} from './knowledge'

export {
  KNOWLEDGE_THRESHOLDS,
  KNOWLEDGE_LABELS,
  getKnowledgeThreshold,
  calculateExpertiseImpact,
  calculateKnowledgeGain,
  createMaterialKnowledge,
  createDiscoveredMaterialKnowledge,
  addExpertise,
  isMaterialDiscovered,
  getExpertisePercent,
  isDetailLevelAvailable,
  INITIAL_ENCYCLOPEDIA_STATE,
} from './knowledge'

// Смысловые роли в процессах (docs/MATERIAL_SEMANTIC_PROCESS_ROLES.md)
export type {
  MaterialProcessKind,
  MaterialProcessFacet,
  MaterialProcessContributionSource,
  MaterialProcessContribution,
} from './material-process'
