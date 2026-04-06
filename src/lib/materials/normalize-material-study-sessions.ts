import type { MaterialStudySession } from '@/types/material-study'

/** Дополняет поля §6.3 для сейвов, созданных до появления `plannedDurationMs` / рабочих. */
export function normalizeMaterialStudySessionsFromSave(
  raw: unknown
): MaterialStudySession[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item): MaterialStudySession => {
    const s = item as MaterialStudySession
    const start = typeof s.startTime === 'number' ? s.startTime : 0
    const end = typeof s.endTime === 'number' ? s.endTime : start
    const planned =
      typeof s.plannedDurationMs === 'number' && s.plannedDurationMs > 0
        ? s.plannedDurationMs
        : Math.max(1, end - start)
    const assigned = Array.isArray(s.assignedWorkerIds) ? s.assignedWorkerIds : undefined
    return {
      ...s,
      plannedDurationMs: planned,
      assignedWorkerIds: assigned?.length ? assigned : undefined,
      log: Array.isArray(s.log) ? s.log : [],
    }
  })
}
