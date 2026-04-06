/**
 * Техники изучения материалов в энциклопедии (фаза B1).
 */

export interface MaterialStudyTechnique {
  id: string
  name: string
  description?: string
  /** Базовая длительность в миллисекундах (до `getMaterialStudyBalanceModifiers().durationMultiplier`). */
  durationMs: number
  /** Устарело: прирост задаётся через `rollMaterialStudyExpertiseGain` в slice. Оставлено для обратной совместимости данных. */
  expertiseGain?: number
  /** Расход материалов каталога при старте */
  materialCosts: { materialId: string; quantity: number }[]
  /** Если задано — техника доступна только для этих материалов; иначе для любого */
  targetMaterialIds?: string[]
}

export type MaterialStudySessionStatus = 'running' | 'completed' | 'cancelled'

export interface MaterialStudySession {
  id: string
  materialId: string
  techniqueId: string
  startTime: number
  endTime: number
  /** Базовая длительность шага (после глобальных модификаторов длительности), до деления на фактор рабочих. */
  plannedDurationMs: number
  /** Рабочие с назначением `material_study:<sessionId>` */
  assignedWorkerIds?: string[]
  status: MaterialStudySessionStatus
  /** Лента событий сессии */
  log: { ts: number; message: string }[]
  /**
   * Битовая маска промежуточных сообщений в ленту: 1 = ~25%, 2 = ~50%, 4 = ~75% прогресса.
   */
  progressMessageBits?: number
}
