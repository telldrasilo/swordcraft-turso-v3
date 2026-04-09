'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useGameStore } from '@/store'
import { useSound } from '@/lib/sounds'
import { buildWeaponRepairPlan } from '@/lib/weapon-damage/build-repair-plan'
import { buildReforgeWeaponWorkbenchPlan } from '@/lib/reforge/reforge-workbench-plan'
import { useWeaponRepairStageRun } from '@/hooks/use-weapon-repair-stage-run'
import {
  findNextWorkbenchQueueItemIndex,
  findNextWorkbenchQueueItemIndexAfterFailure,
  findNextPlannedWorkbenchQueueItemIndex,
  type WorkbenchQueueItem,
} from '@/lib/workbench/workbench-queue'
import { mergeWorkbenchQueueRepairFinaleOpts } from '@/lib/workbench/workbench-queue-repair-opts'
import { freezeWorkbenchBarBaseline } from '@/lib/workbench/workbench-bar-baseline'
import type { RepairResult } from '@/data/repair-system'

const REPAIR_INSTANT_DEV = process.env.NODE_ENV === 'development'

export function useWorkbenchQueueRuntime() {
  const weaponInventory = useGameStore((state) => state.weaponInventory)
  const returnWeaponFromRepairBench = useGameStore((state) => state.returnWeaponFromRepairBench)
  const workbenchQueue = useGameStore((state) => state.workbenchQueue)
  const repairTechniqueStageRun = useGameStore((state) => state.repairTechniqueStageRun)
  const clearRepairTechniqueStageRun = useGameStore((state) => state.clearRepairTechniqueStageRun)
  const workbenchBarBaseline = useGameStore((state) => state.workbenchBarBaseline)
  const setWorkbenchBarBaseline = useGameStore((state) => state.setWorkbenchBarBaseline)

  const [lastRepair, setLastRepair] = useState<{ weaponName: string; result: RepairResult } | null>(
    null
  )
  const [queueRunReport, setQueueRunReport] = useState<string | null>(null)
  const { play } = useSound()

  const activeQueueIndexRef = useRef(-1)
  const pendingQueueStartRef = useRef(false)
  const beginQueueItemStageRunRef = useRef<
    (s: ReturnType<typeof useGameStore.getState>, item: WorkbenchQueueItem, index: number) => void
  >(() => {})

  useLayoutEffect(() => {
    const run = useGameStore.getState().repairTechniqueStageRun
    if (run?.source !== 'queue') return
    const q = useGameStore.getState().workbenchQueue
    const idx = run.activeQueueItemId
      ? q.findIndex((i) => i.queueItemId === run.activeQueueItemId)
      : q.findIndex((i) => i.weaponId === run.weaponId)
    activeQueueIndexRef.current = idx >= 0 ? idx : -1
  }, [])

  useEffect(() => {
    const ids = new Set(weaponInventory.weapons.map((w) => w.id))
    for (const item of workbenchQueue) {
      if (!ids.has(item.weaponId)) returnWeaponFromRepairBench(item.weaponId)
    }
  }, [workbenchQueue, weaponInventory.weapons, returnWeaponFromRepairBench])

  const techniquePlanForQueueHook = useMemo(() => {
    if (repairTechniqueStageRun?.source !== 'queue') return null
    const run = repairTechniqueStageRun
    const qItem =
      (run.activeQueueItemId
        ? workbenchQueue.find((i) => i.queueItemId === run.activeQueueItemId)
        : undefined) ??
      workbenchQueue.find((i) => i.weaponId === run.weaponId)
    if (!qItem) return null
    if (qItem.kind === 'repair') {
      if (!qItem.techniqueIds.length) return null
      return buildWeaponRepairPlan(qItem.techniqueIds)
    }
    return buildReforgeWeaponWorkbenchPlan(qItem.techniqueId)
  }, [repairTechniqueStageRun, workbenchQueue])

  const resumeForQueueHook = useMemo(() => {
    if (repairTechniqueStageRun?.source !== 'queue') return null
    return { startedAt: repairTechniqueStageRun.startedAt }
  }, [repairTechniqueStageRun])

  const beginQueueItemStageRun = useCallback(
    (s: ReturnType<typeof useGameStore.getState>, item: WorkbenchQueueItem, index: number) => {
      if (item.kind === 'repair' && item.techniqueIds.length > 0) {
        const pre = s.preflightWeaponRepairByTechniques(
          item.weaponId,
          item.techniqueIds,
          item.executionOpts
        )
        if (!pre.success) {
          s.setWorkbenchQueueItemStatus(item.queueItemId, 'error', pre.error ?? 'Ошибка')
          queueMicrotask(() => {
            const s2 = useGameStore.getState()
            if (s2.workbenchQueueAdvanceBlocked) {
              useGameStore.getState().setWorkbenchQueueAdvanceBlocked(false)
              setQueueRunReport('Очередь остановлена.')
              return
            }
            const plan = s2.workbenchQueue
            const nextIdx = findNextPlannedWorkbenchQueueItemIndex(plan, index)
            if (nextIdx < 0) {
              setQueueRunReport('Очередь завершена.')
              return
            }
            const nextItem = plan[nextIdx]
            beginQueueItemStageRunRef.current(s2, nextItem, nextIdx)
          })
          return
        }
      }
      activeQueueIndexRef.current = index
      s.setWorkbenchQueueItemStatus(item.queueItemId, 'running')
      if (item.kind === 'repair') {
        s.beginRepairTechniqueStageRun({
          weaponId: item.weaponId,
          techniqueIds: item.techniqueIds,
          executionOpts: item.executionOpts,
          source: 'queue',
          activeQueueItemId: item.queueItemId,
        })
      } else {
        s.beginRepairTechniqueStageRun({
          weaponId: item.weaponId,
          techniqueIds: [item.techniqueId],
          source: 'queue',
          activeQueueItemId: item.queueItemId,
          workbenchReforge: {
            kind: item.kind === 'reforge_buff' ? 'reforge_buff' : 'reforge_awaken',
            techniqueId: item.techniqueId,
          },
        })
      }
      pendingQueueStartRef.current = true
    },
    []
  )

  const enqueueNextQueueItem = useCallback(
    (completedIndex: number, success: boolean) => {
      const s = useGameStore.getState()
      if (s.workbenchQueueAdvanceBlocked) {
        useGameStore.getState().setWorkbenchQueueAdvanceBlocked(false)
        setQueueRunReport('Очередь остановлена.')
        return
      }
      const plan = s.workbenchQueue
      const nextIdx = success
        ? findNextWorkbenchQueueItemIndex(plan, completedIndex)
        : findNextWorkbenchQueueItemIndexAfterFailure(plan, completedIndex)
      if (nextIdx < 0) {
        setQueueRunReport('Очередь завершена.')
        return
      }
      const nextItem = plan[nextIdx]
      beginQueueItemStageRun(s, nextItem, nextIdx)
    },
    [beginQueueItemStageRun]
  )

  useLayoutEffect(() => {
    beginQueueItemStageRunRef.current = beginQueueItemStageRun
  })

  const handleQueueStagesComplete = useCallback(() => {
    const s = useGameStore.getState()
    const run = s.repairTechniqueStageRun
    if (!run || run.source !== 'queue') return
    const completedIndex = activeQueueIndexRef.current
    const queueItemId = run.activeQueueItemId
    const weaponMeta = s.weaponInventory.weapons.find((x) => x.id === run.weaponId)
    const weaponName = weaponMeta?.fullName ?? run.weaponId

    if (run.workbenchReforge) {
      const r = s.applyReforgeTechnique(run.weaponId, run.workbenchReforge.techniqueId)
      s.clearRepairTechniqueStageRun()
      if (r.ok && queueItemId) {
        s.setWorkbenchQueueItemStatus(queueItemId, 'done')
        play('craft_complete')
        enqueueNextQueueItem(completedIndex, true)
      } else if (!r.ok && queueItemId) {
        const msg =
          r.reason === 'insufficient_war_soul'
            ? 'Недостаточно души войны'
            : r.reason === 'max_stacks'
              ? 'Лимит усилений'
              : r.reason === 'no_scars'
                ? 'Нет шрамов'
                : r.reason === 'locked_technique'
                  ? 'Техника недоступна'
                  : String(r.reason ?? 'Ошибка')
        s.setWorkbenchQueueItemStatus(queueItemId, 'error', msg)
        enqueueNextQueueItem(completedIndex, false)
      }
      return
    }

    const result = s.executeWeaponRepairByTechniques(
      run.weaponId,
      run.techniqueIds,
      mergeWorkbenchQueueRepairFinaleOpts(run.techniqueIds, run.executionOpts)
    )
    s.clearRepairTechniqueStageRun()

    if (result.success) {
      if (queueItemId) s.setWorkbenchQueueItemStatus(queueItemId, 'done')
      if (result.result) {
        play('craft_complete')
        setLastRepair({ weaponName, result: result.result })
        setTimeout(() => setLastRepair(null), 3000)
      }
      // Сначала старт следующего пункта, потом returnWeaponFromRepairBench: иначе тот фильтром
      // выкидывает все задачи этого weaponId из очереди и ломает индекс findNext.
      enqueueNextQueueItem(completedIndex, true)
      s.returnWeaponFromRepairBench(run.weaponId)
    } else {
      if (queueItemId) {
        s.setWorkbenchQueueItemStatus(queueItemId, 'error', result.error ?? 'Ошибка выполнения')
      }
      enqueueNextQueueItem(completedIndex, false)
    }
  }, [enqueueNextQueueItem, play])

  const { start, cancel, progressView, displayPlan, phase: queueRepairPhase } =
    useWeaponRepairStageRun({
      plan: techniquePlanForQueueHook,
      resume: resumeForQueueHook,
      onStagesComplete: handleQueueStagesComplete,
    })

  useEffect(() => {
    if (!pendingQueueStartRef.current) return
    if (!techniquePlanForQueueHook?.stages.length) return
    pendingQueueStartRef.current = false
    start()
  }, [techniquePlanForQueueHook, start])

  useEffect(() => {
    if (workbenchQueue.length > 0) return
    const run = useGameStore.getState().repairTechniqueStageRun
    if (run?.source !== 'queue') return
    cancel()
    clearRepairTechniqueStageRun()
  }, [workbenchQueue.length, cancel, clearRepairTechniqueStageRun])

  const startRepairQueue = useCallback(() => {
    const s = useGameStore.getState()
    s.setWorkbenchQueueAdvanceBlocked(false)
    const plan = s.workbenchQueue
    const idx = findNextWorkbenchQueueItemIndex(plan, -1)
    if (idx < 0) {
      setQueueRunReport('Нет запланированных позиций для запуска.')
      return
    }
    if (!s.workbenchBarBaseline) {
      s.setWorkbenchBarBaseline(freezeWorkbenchBarBaseline(plan))
    }
    const item = plan[idx]
    beginQueueItemStageRun(s, item, idx)
    setQueueRunReport(null)
  }, [beginQueueItemStageRun])

  const instantRepairDev = useCallback(() => {
    if (!REPAIR_INSTANT_DEV) return
    const s = useGameStore.getState()
    const run = s.repairTechniqueStageRun

    if (run?.source === 'queue') {
      const completedIndex = activeQueueIndexRef.current
      const s2 = useGameStore.getState()
      const run2 = s2.repairTechniqueStageRun
      if (!run2 || run2.source !== 'queue') return
      const qid = run2.activeQueueItemId

      if (run2.workbenchReforge) {
        const r = s2.applyReforgeTechnique(run2.weaponId, run2.workbenchReforge.techniqueId)
        s2.clearRepairTechniqueStageRun()
        if (r.ok && qid) {
          s2.setWorkbenchQueueItemStatus(qid, 'done')
          play('craft_complete')
          enqueueNextQueueItem(completedIndex, true)
        } else if (qid) {
          s2.setWorkbenchQueueItemStatus(qid, 'error', String(!r.ok ? r.reason : 'Ошибка'))
          enqueueNextQueueItem(completedIndex, false)
        }
      } else {
        const weaponMeta = s2.weaponInventory.weapons.find((x) => x.id === run2.weaponId)
        const weaponName = weaponMeta?.fullName ?? run2.weaponId
        const result = s2.executeWeaponRepairByTechniques(
          run2.weaponId,
          run2.techniqueIds,
          mergeWorkbenchQueueRepairFinaleOpts(run2.techniqueIds, run2.executionOpts)
        )
        s2.clearRepairTechniqueStageRun()
        if (result.success) {
          if (qid) s2.setWorkbenchQueueItemStatus(qid, 'done')
          if (result.result) {
            play('craft_complete')
            setLastRepair({ weaponName, result: result.result })
            setTimeout(() => setLastRepair(null), 3000)
          }
          enqueueNextQueueItem(completedIndex, true)
          s2.returnWeaponFromRepairBench(run2.weaponId)
        } else {
          if (qid) {
            s2.setWorkbenchQueueItemStatus(qid, 'error', result.error ?? 'Ошибка выполнения')
          }
          enqueueNextQueueItem(completedIndex, false)
        }
      }
      cancel()
      return
    }

    const plan = s.workbenchQueue
    const idx = findNextWorkbenchQueueItemIndex(plan, -1)
    if (idx < 0) {
      return
    }
    const item = plan[idx]
    if (item.kind === 'repair') {
      const weaponMeta = s.weaponInventory.weapons.find((x) => x.id === item.weaponId)
      const weaponName = weaponMeta?.fullName ?? item.weaponId
      s.setWorkbenchQueueItemStatus(item.queueItemId, 'running')
      const result = s.executeWeaponRepairByTechniques(
        item.weaponId,
        item.techniqueIds,
        mergeWorkbenchQueueRepairFinaleOpts(item.techniqueIds, item.executionOpts)
      )
      if (result.success) {
        s.setWorkbenchQueueItemStatus(item.queueItemId, 'done')
        if (result.result) {
          play('craft_complete')
          setLastRepair({ weaponName, result: result.result })
          setTimeout(() => setLastRepair(null), 3000)
        }
        enqueueNextQueueItem(idx, true)
        s.returnWeaponFromRepairBench(item.weaponId)
      } else {
        s.setWorkbenchQueueItemStatus(item.queueItemId, 'error', result.error ?? 'Ошибка выполнения')
        enqueueNextQueueItem(idx, false)
      }
    } else {
      s.setWorkbenchQueueItemStatus(item.queueItemId, 'running')
      const r = s.applyReforgeTechnique(item.weaponId, item.techniqueId)
      if (r.ok) {
        s.setWorkbenchQueueItemStatus(item.queueItemId, 'done')
        play('craft_complete')
        enqueueNextQueueItem(idx, true)
      } else {
        s.setWorkbenchQueueItemStatus(item.queueItemId, 'error', String(r.reason ?? 'Ошибка'))
        enqueueNextQueueItem(idx, false)
      }
    }
  }, [cancel, enqueueNextQueueItem, play])

  const showQueueStagePanel = Boolean(
    repairTechniqueStageRun?.source === 'queue' &&
      queueRepairPhase === 'running' &&
      displayPlan &&
      progressView
  )

  const canClickStartQueue =
    workbenchQueue.some((item) => item.status === 'planned' || item.status === 'error') &&
    !workbenchQueue.some((item) => item.status === 'running')

  const activeQueueItemId = useMemo(() => {
    const run = repairTechniqueStageRun
    if (run?.source === 'queue' && run.activeQueueItemId) return run.activeQueueItemId
    const running = workbenchQueue.find((i) => i.status === 'running')
    return running?.queueItemId ?? null
  }, [repairTechniqueStageRun, workbenchQueue])

  const weaponNameById = useMemo(
    () => Object.fromEntries(weaponInventory.weapons.map((w) => [w.id, w.fullName] as const)),
    [weaponInventory.weapons]
  )

  const showWorkbenchBar =
    workbenchQueue.length > 0 &&
    (repairTechniqueStageRun?.source === 'queue' || workbenchQueue.some((i) => i.status === 'running'))

  useEffect(() => {
    if (!showWorkbenchBar) {
      setWorkbenchBarBaseline(null)
    }
  }, [showWorkbenchBar, setWorkbenchBarBaseline])

  const cancelRunningWorkbenchStage = useCallback(() => {
    cancel()
    useGameStore.getState().cancelActiveWorkbenchStageRun()
  }, [cancel])

  const requestWorkbenchQueueStop = useCallback(() => {
    useGameStore.getState().setWorkbenchQueueAdvanceBlocked(true)
  }, [])

  return {
    lastRepair,
    queueRunReport,
    workbenchQueue,
    workbenchBarBaseline,
    weaponNameById,
    activeQueueItemId,
    showWorkbenchBar,
    showQueueStagePanel,
    displayPlan,
    progressView,
    canClickStartQueue,
    startRepairQueue,
    instantRepairDev,
    repairInstantDevEnabled: REPAIR_INSTANT_DEV,
    cancelRunningWorkbenchStage,
    requestWorkbenchQueueStop,
  }
}
