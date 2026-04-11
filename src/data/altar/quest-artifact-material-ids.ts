/** Квестовые артефакты FF v2: на складе помечаются markQuestItem, при старте фазы III не расходуются. */
export const FORGOTTEN_FORGE_ALTAR_QUEST_ARTIFACT_IDS = [
  'resonator_matrix',
  'focusing_chalice',
  'lunar_tuning_fork',
] as const

export type ForgottenForgeAltarQuestArtifactId =
  (typeof FORGOTTEN_FORGE_ALTAR_QUEST_ARTIFACT_IDS)[number]
