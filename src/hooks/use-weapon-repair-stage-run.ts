'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { WeaponRepairPlan } from '@/types/weapon-repair'
import { getRepairStageProgressFromElapsed } from '@/lib/weapon-damage/repair-stage-timing'

export type WeaponRepairRunPhase = 'idle' | 'running'

/**
 * Таймер этапов починки по плану; по завершении всех этапов вызывает onStagesComplete один раз.
 * План на время прогона фиксируется в ref при start.
 * `resume` — восстановление после размонтирования UI (смена вкладки кузницы); время старта из store.
 */
export function useWeaponRepairStageRun(options: {
  plan: WeaponRepairPlan | null
  onStagesComplete: () => void
  /** Незавершённый прогон: тот же startedAt, что в `beginRepairTechniqueStageRun` */
  resume?: { startedAt: number } | null
}) {
  const { plan, onStagesComplete, resume } = options
  const [phase, setPhase] = useState<WeaponRepairRunPhase>('idle')
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  /** Замороженный план на время прогона (для подписей этапов в UI) */
  const [displayPlan, setDisplayPlan] = useState<WeaponRepairPlan | null>(null)

  const runningPlanRef = useRef<WeaponRepairPlan | null>(null)
  const completedRef = useRef(false)
  const onCompleteRef = useRef(onStagesComplete)
  const resumeAppliedRef = useRef(false)

  useEffect(() => {
    onCompleteRef.current = onStagesComplete
  }, [onStagesComplete])

  const armRunning = useCallback(
    (p: WeaponRepairPlan, startTime: number) => {
      runningPlanRef.current = p
      setDisplayPlan(p)
      completedRef.current = false
      setPhase('running')
      setStartedAt(startTime)
      setNow(Date.now())
      resumeAppliedRef.current = true
    },
    []
  )

  useLayoutEffect(() => {
    if (!resume?.startedAt || !plan?.stages.length) return
    if (resumeAppliedRef.current) return
    queueMicrotask(() => {
      if (resumeAppliedRef.current) return
      if (!plan?.stages.length) return
      armRunning(plan, resume.startedAt)
    })
  }, [resume?.startedAt, plan, armRunning])

  const start = useCallback(
    (at?: number) => {
      if (!plan?.stages.length) return
      const t = at ?? Date.now()
      armRunning(plan, t)
    },
    [plan, armRunning]
  )

  const cancel = useCallback(() => {
    resumeAppliedRef.current = false
    runningPlanRef.current = null
    setDisplayPlan(null)
    completedRef.current = false
    setPhase('idle')
    setStartedAt(null)
  }, [])

  useEffect(() => {
    if (phase !== 'running' || startedAt === null) return
    const p = runningPlanRef.current
    if (!p) return

    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      const elapsed = t - startedAt
      const view = getRepairStageProgressFromElapsed(p, elapsed)
      if (view.allStagesComplete && !completedRef.current) {
        completedRef.current = true
        runningPlanRef.current = null
        setDisplayPlan(null)
        setPhase('idle')
        setStartedAt(null)
        resumeAppliedRef.current = false
        queueMicrotask(() => onCompleteRef.current())
      }
    }, 100)

    return () => clearInterval(id)
  }, [phase, startedAt])

  const activePlan = displayPlan ?? plan

  const progressView =
    phase === 'running' && startedAt !== null && activePlan
      ? getRepairStageProgressFromElapsed(activePlan, now - startedAt)
      : plan
        ? { stageIndex: 0, progressInStage: 0, allStagesComplete: false }
        : null

  return { phase, start, cancel, progressView, displayPlan }
}
