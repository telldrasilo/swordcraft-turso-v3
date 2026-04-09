'use client'

import { useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { RepairCard } from '@/components/ui/repair-card'
import { ReforgeCard } from '@/components/forge/reforge-card'
import { useGameStore } from '@/store'
import { useToast } from '@/hooks/use-toast'
import { hasPlannedOrRunningQueueItemOfKind } from '@/lib/workbench/workbench-queue'
import type { WorkbenchQueueItem } from '@/lib/workbench/workbench-queue'
import type { CraftedWeaponV2 } from '@/types/craft-v2'
import type { RepairTechniqueExecutionOptions } from '@/types/repair-execution'

export type WorkbenchTaskEditorTaskKind = 'repair' | 'reforge_buff' | 'reforge_awaken'

export function WorkbenchTaskEditor(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  taskKind: WorkbenchTaskEditorTaskKind
  weapon: CraftedWeaponV2 | null
  /** Только для `mode === 'edit'`, статус `planned`. */
  existingQueueItem?: WorkbenchQueueItem | null
}) {
  const { open, onOpenChange, mode, taskKind, weapon, existingQueueItem } = props
  const { toast } = useToast()

  const workbenchQueue = useGameStore((state) => state.workbenchQueue)
  const upsertRepairQueuePlan = useGameStore((state) => state.upsertRepairQueuePlan)
  const updateWorkbenchPlannedItem = useGameStore((state) => state.updateWorkbenchPlannedItem)
  const enqueueWorkbenchReforge = useGameStore((state) => state.enqueueWorkbenchReforge)
  const guildLevel = useGameStore((state) => state.guild.level)
  const playerLevel = useGameStore((state) => state.player.level)
  const unlockedMaterialProcessingTechniqueIds = useGameStore(
    (state) => state.unlockedMaterialProcessingTechniqueIds
  )
  const unlockedReforgeTechniqueIds = useGameStore((state) => state.unlockedReforgeTechniqueIds)

  const [repairDup, setRepairDup] = useState<{
    weaponId: string
    techniqueIds: string[]
    executionOpts?: RepairTechniqueExecutionOptions
  } | null>(null)

  const [reforgeDup, setReforgeDup] = useState<{
    techniqueId: string
    kind: 'reforge_buff' | 'reforge_awaken'
  } | null>(null)

  const ctx = useMemo(
    () => ({
      guildLevel,
      playerLevel,
      unlockedMaterialProcessingTechniqueIds,
      unlockedReforgeTechniqueIds,
    }),
    [guildLevel, playerLevel, unlockedMaterialProcessingTechniqueIds, unlockedReforgeTechniqueIds]
  )

  const dialogTitle =
    taskKind === 'repair'
      ? mode === 'edit'
        ? 'Изменить задачу ремонта'
        : 'Задача ремонта'
      : mode === 'edit'
        ? 'Изменить задачу перековки'
        : 'Задача перековки'

  const initialRepairTechniqueIds =
    mode === 'edit' && existingQueueItem?.kind === 'repair' ? existingQueueItem.techniqueIds : null

  const finishRepairCreate = (payload: {
    weaponId: string
    techniqueIds: string[]
    executionOpts?: RepairTechniqueExecutionOptions
  }) => {
    upsertRepairQueuePlan(payload)
    toast({
      title: 'В очереди верстака',
      description: 'Добавьте работу или нажмите «Начать работу».',
    })
    onOpenChange(false)
  }

  const handleRepairQueueAdd = (payload: {
    weaponId: string
    techniqueIds: string[]
    executionOpts?: RepairTechniqueExecutionOptions
  }) => {
    if (!weapon) return
    if (mode === 'edit' && existingQueueItem?.kind === 'repair') {
      const r = updateWorkbenchPlannedItem(existingQueueItem.queueItemId, {
        kind: 'repair',
        techniqueIds: payload.techniqueIds,
        executionOpts: payload.executionOpts,
      })
      if (r.success) {
        toast({ title: 'Задача обновлена', description: 'План ремонта в очереди изменён.' })
        onOpenChange(false)
      } else {
        toast({
          title: 'Не удалось сохранить',
          description: r.error ?? 'Неизвестная ошибка',
          variant: 'destructive',
        })
      }
      return
    }

    if (hasPlannedOrRunningQueueItemOfKind(workbenchQueue, payload.weaponId, 'repair')) {
      setRepairDup(payload)
      return
    }
    finishRepairCreate(payload)
  }

  const handleReforgeEnqueue = (techniqueId: string, kind: 'reforge_buff' | 'reforge_awaken') => {
    if (!weapon) return

    if (mode === 'edit' && existingQueueItem && existingQueueItem.kind === kind) {
      const r = updateWorkbenchPlannedItem(existingQueueItem.queueItemId, {
        kind,
        techniqueId,
      })
      if (r.success) {
        toast({ title: 'Задача обновлена', description: 'Перековка в очереди изменена.' })
        onOpenChange(false)
      } else {
        toast({
          title: 'Не удалось сохранить',
          description: r.error ?? 'Неизвестная ошибка',
          variant: 'destructive',
        })
      }
      return
    }

    if (hasPlannedOrRunningQueueItemOfKind(workbenchQueue, weapon.id, kind)) {
      setReforgeDup({ techniqueId, kind })
      return
    }

    enqueueWorkbenchReforge({
      weaponId: weapon.id,
      techniqueId,
      kind,
    })
    toast({
      title: 'В очереди верстака',
      description: 'Запустите сессию кнопкой «Начать работу».',
    })
    onOpenChange(false)
  }

  return (
    <>
      <AlertDialog
        open={repairDup != null}
        onOpenChange={(o) => {
          if (!o) setRepairDup(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Уже есть ремонт в очереди</AlertDialogTitle>
            <AlertDialogDescription>
              Для этого клинка уже запланирован или выполняется ремонт. Добавить ещё один план ремонта?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (repairDup) finishRepairCreate(repairDup)
                setRepairDup(null)
              }}
            >
              Добавить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={reforgeDup != null}
        onOpenChange={(o) => {
          if (!o) setReforgeDup(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Уже есть перековка этого типа</AlertDialogTitle>
            <AlertDialogDescription>
              Для этого клинка уже запланирована или выполняется перековка того же типа. Добавить ещё одну
              задачу?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (reforgeDup && weapon) {
                  enqueueWorkbenchReforge({
                    weaponId: weapon.id,
                    techniqueId: reforgeDup.techniqueId,
                    kind: reforgeDup.kind,
                  })
                  toast({
                    title: 'В очереди верстака',
                    description: 'Запустите сессию кнопкой «Начать работу».',
                  })
                  onOpenChange(false)
                }
                setReforgeDup(null)
              }}
            >
              Добавить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto border-stone-700 bg-stone-950">
          <DialogHeader>
            <DialogTitle className="text-stone-200">{dialogTitle}</DialogTitle>
          </DialogHeader>
          {weapon && taskKind === 'repair' ? (
            <RepairCard
              key={mode === 'edit' && existingQueueItem ? existingQueueItem.queueItemId : `new-${weapon.id}`}
              weapon={weapon}
              variant="repairWorkbench"
              compactWeaponChrome
              initialTechniqueIds={initialRepairTechniqueIds}
              onQueueAdd={handleRepairQueueAdd}
            />
          ) : null}
          {weapon && taskKind !== 'repair' ? (
            <ReforgeCard
              key={mode === 'edit' && existingQueueItem ? existingQueueItem.queueItemId : `reforge-${weapon.id}`}
              weapon={weapon}
              ctx={ctx}
              workbenchQueueOnly
              onApply={() => {
                toast({
                  title: 'Только очередь',
                  description: 'В этой форме доступна только постановка в очередь верстака.',
                })
              }}
              onEnqueueToWorkbench={handleReforgeEnqueue}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
