'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useGameStore } from '@/store'
import { RepairStageProgressPanel } from '@/components/ui/repair-stage-progress-panel'
import { getRepairTechniqueById } from '@/data/weapon-damage/repair-techniques-registry'
import { getReforgeTechniqueById } from '@/data/reforge/reforge-techniques-registry'
import type { WorkbenchQueueItem } from '@/lib/workbench/workbench-queue'
import type { WeaponRepairPlan } from '@/types/weapon-repair'
import type { RepairStageProgressView } from '@/lib/weapon-damage/repair-stage-timing'

export function WorkbenchQueuePanel(props: {
  workbenchQueue: readonly WorkbenchQueueItem[]
  queueRunReport: string | null
  showQueueStagePanel: boolean
  displayPlan: WeaponRepairPlan | null
  progressView: RepairStageProgressView | null
  canClickStartQueue: boolean
  startRepairQueue: () => void
  instantRepairDev: () => void
  repairInstantDevEnabled: boolean
  cancelRunningWorkbenchStage?: () => void
  requestWorkbenchQueueStop?: () => void
  /** Редактирование planned-задачи в модалке. */
  onEditPlannedWorkbenchItem?: (item: WorkbenchQueueItem) => void
}) {
  const {
    workbenchQueue,
    queueRunReport,
    showQueueStagePanel,
    displayPlan,
    progressView,
    canClickStartQueue,
    startRepairQueue,
    instantRepairDev,
    repairInstantDevEnabled,
    cancelRunningWorkbenchStage,
    requestWorkbenchQueueStop,
    onEditPlannedWorkbenchItem,
  } = props

  const weaponInventory = useGameStore((state) => state.weaponInventory)
  const removeWorkbenchPlannedItem = useGameStore((state) => state.removeWorkbenchPlannedItem)
  const clearRepairQueuePlan = useGameStore((state) => state.clearRepairQueuePlan)
  const reorderWorkbenchQueue = useGameStore((state) => state.reorderWorkbenchQueue)

  return (
    <div className="rounded-lg border border-stone-700/70 bg-stone-900/35 p-2.5 space-y-1">
      <p className="text-xs text-stone-400 mb-1">Очередь верстака</p>
      {queueRunReport ? (
        <p className="text-xs text-stone-400 rounded border border-stone-700 bg-stone-900/35 px-2 py-1.5 mb-2">
          {queueRunReport}
        </p>
      ) : null}
      {workbenchQueue.length > 0 ? (
        <>
          {workbenchQueue.map((item, idx) => {
            const w = weaponInventory.weapons.find((x) => x.id === item.weaponId)
            const statusLabel =
              item.status === 'running'
                ? 'В работе'
                : item.status === 'done'
                  ? 'Готово'
                  : item.status === 'error'
                    ? 'Ошибка'
                    : 'Запланировано'
            const opLabel =
              item.kind === 'repair'
                ? 'Ремонт'
                : item.kind === 'reforge_buff'
                  ? 'Перековка (усиление)'
                  : 'Перековка (пробуждение)'
            return (
              <div key={item.queueItemId} className="rounded border border-stone-700/60 bg-stone-900/35 p-2">
                <div className="grid grid-cols-[minmax(0,1fr)_7.5rem_10.5rem] items-center gap-x-2 gap-y-0 text-xs">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="min-w-0 text-left text-stone-300 truncate hover:text-stone-100"
                      >
                        {idx + 1}. {w?.fullName ?? item.weaponId}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-sm">
                      <div className="space-y-1 text-xs">
                        <p className="font-medium text-stone-200">{w?.fullName ?? item.weaponId}</p>
                        <p>Атака: {w?.stats.attack ?? '—'}</p>
                        <p>
                          Прочность: {w?.currentDurability ?? '—'}/{w?.stats.maxDurability ?? '—'}
                        </p>
                        <p>Качество: {w?.qualityGrade ?? '—'}</p>
                        <p>Тегов: {w?.activeDamageTags?.length ?? 0}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex justify-center">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border text-center leading-tight ${
                        item.status === 'running'
                          ? 'border-amber-600 text-amber-300'
                          : item.status === 'done'
                            ? 'border-green-700 text-green-300'
                            : item.status === 'error'
                              ? 'border-red-700 text-red-300'
                              : 'border-stone-600 text-stone-400'
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-0.5 min-w-0">
                    {item.status === 'planned' ? (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-stone-400"
                          aria-label="Выше в очереди"
                          disabled={idx === 0}
                          onClick={() => reorderWorkbenchQueue(idx, idx - 1)}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-stone-400"
                          aria-label="Ниже в очереди"
                          disabled={idx >= workbenchQueue.length - 1}
                          onClick={() => reorderWorkbenchQueue(idx, idx + 1)}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </>
                    ) : null}
                    {item.status === 'planned' && onEditPlannedWorkbenchItem && w ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-amber-200/85 shrink-0"
                        onClick={() => onEditPlannedWorkbenchItem(item)}
                      >
                        изменить
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-stone-400 shrink-0"
                      disabled={item.status !== 'planned'}
                      onClick={() => removeWorkbenchPlannedItem(item.queueItemId)}
                    >
                      убрать
                    </Button>
                  </div>
                </div>
                <p className="text-[10px] text-stone-500 mt-0.5">{opLabel}</p>
                <div className="mt-1 pl-1 space-y-0.5">
                  {item.kind === 'repair' ? (
                    item.techniqueIds.map((tid) => (
                      <p key={`${item.queueItemId}-${tid}`} className="text-[10px] text-stone-500">
                        • {getRepairTechniqueById(tid)?.name ?? tid}
                      </p>
                    ))
                  ) : (
                    <p className="text-[10px] text-stone-500">
                      • {getReforgeTechniqueById(item.techniqueId)?.name ?? item.techniqueId}
                    </p>
                  )}
                  {item.status === 'error' && item.errorMessage ? (
                    <p className="text-[10px] text-red-300/90 mt-0.5">{item.errorMessage}</p>
                  ) : null}
                </div>
              </div>
            )
          })}
          <div className="space-y-2 pt-2">
            {showQueueStagePanel && displayPlan && progressView ? (
              <RepairStageProgressPanel displayPlan={displayPlan} progressView={progressView} />
            ) : null}
            <div className="flex flex-wrap items-center justify-end gap-2">
              {showQueueStagePanel && cancelRunningWorkbenchStage ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-stone-600 text-stone-300"
                  onClick={cancelRunningWorkbenchStage}
                >
                  Отменить этап
                </Button>
              ) : null}
              {requestWorkbenchQueueStop ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-amber-900/60 text-amber-200/90"
                  onClick={requestWorkbenchQueueStop}
                >
                  Стоп очереди
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                className="bg-amber-800 hover:bg-amber-700 text-amber-100"
                disabled={!canClickStartQueue}
                onClick={startRepairQueue}
              >
                Начать работу
              </Button>
              {repairInstantDevEnabled ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-orange-900/70 text-orange-200/90 hover:bg-orange-950/40"
                  onClick={instantRepairDev}
                >
                  Починить мгновенно (dev)
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-stone-500"
                onClick={() => clearRepairQueuePlan()}
              >
                Очистить план
              </Button>
            </div>
          </div>
        </>
      ) : (
        <p className="text-xs text-stone-500">
          Очередь пуста: выберите клинок в списке, поставьте на верстак и добавьте работу в очередь.
        </p>
      )}
    </div>
  )
}
