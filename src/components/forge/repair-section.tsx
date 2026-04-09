/**
 * Секция ремонта на верстаке (без оболочки очереди — она в WorkbenchScreen).
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Zap, Package } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import { useGameStore } from '@/store'
import { hasPlannedOrRunningQueueItemOfKind } from '@/lib/workbench/workbench-queue'
import type { RepairTechniqueExecutionOptions } from '@/types/repair-execution'
import { RepairCard } from '@/components/ui/repair-card'
import type { RepairResult } from '@/data/repair-system'
import { WorkbenchQueueBlockOverlay } from '@/components/forge/workbench-queue-block-overlay'

export function RepairSection(props: {
  lastRepair: { weaponName: string; result: RepairResult } | null
}) {
  const { lastRepair } = props
  const weaponInventory = useGameStore((state) => state.weaponInventory)
  const workbenchQueue = useGameStore((state) => state.workbenchQueue)
  const workbenchSelectedWeaponId = useGameStore((state) => state.workbenchSelectedWeaponId)
  const upsertRepairQueuePlan = useGameStore((state) => state.upsertRepairQueuePlan)
  const [repairDuplicatePayload, setRepairDuplicatePayload] = useState<{
    weaponId: string
    techniqueIds: string[]
    executionOpts?: RepairTechniqueExecutionOptions
  } | null>(null)

  const benchWeapon = useMemo(() => {
    if (!workbenchSelectedWeaponId) return undefined
    return weaponInventory.weapons.find((w) => w.id === workbenchSelectedWeaponId)
  }, [weaponInventory.weapons, workbenchSelectedWeaponId])

  return (
    <div className="space-y-4">
      <AlertDialog
        open={repairDuplicatePayload != null}
        onOpenChange={(open) => {
          if (!open) setRepairDuplicatePayload(null)
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
                if (repairDuplicatePayload) {
                  upsertRepairQueuePlan(repairDuplicatePayload)
                }
                setRepairDuplicatePayload(null)
              }}
            >
              Добавить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <p className="text-xs text-stone-500">
        Ремонт шрамов и прочности. Очередь верстака и полоса прогресса — в блоке ниже; перековка — во
        вкладке справа.
      </p>

      <AnimatePresence>
        {lastRepair && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-lg bg-green-900/30 border border-green-600/50"
          >
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">{lastRepair.weaponName} отремонтирован!</span>
            </div>
            {lastRepair.result && (
              <div className="text-xs text-green-300 mt-1 flex gap-3">
                <span>Прочность: +{lastRepair.result.durabilityRestored}%</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!benchWeapon ? (
        <Card className="card-medieval">
          <CardContent className="p-6 text-center">
            <Package className="w-12 h-12 mx-auto text-stone-600 mb-3" />
            <p className="text-stone-400 font-medium">Клинок не выбран</p>
            <p className="text-stone-500 text-sm mt-2 max-w-md mx-auto">
              Выберите клинок в узком списке слева (или в карусели на телефоне) — карточка по центру и
              планирование ремонта станут доступны.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative isolate rounded-lg [contain:layout]">
          <RepairCard
            key={benchWeapon.id}
            variant="repairWorkbench"
            compactWeaponChrome
            weapon={benchWeapon}
            onQueueAdd={(payload) => {
              if (hasPlannedOrRunningQueueItemOfKind(workbenchQueue, payload.weaponId, 'repair')) {
                setRepairDuplicatePayload(payload)
                return
              }
              upsertRepairQueuePlan(payload)
            }}
          />
          {hasPlannedOrRunningQueueItemOfKind(workbenchQueue, benchWeapon.id, 'repair') ? (
            <WorkbenchQueueBlockOverlay />
          ) : null}
        </div>
      )}

      <Card className="card-medieval bg-stone-800/30">
        <CardContent className="p-4">
          <h4 className="font-semibold text-stone-300 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Система ремонта
          </h4>
          <ul className="text-xs text-stone-500 space-y-1">
            <li>
              • <strong className="text-amber-400">Техники и этапы</strong> — выбор работы, таймер этапов,
              затем бросок и списание материалов при успехе (без золота).
            </li>
            <li>
              • <strong className="text-green-400">Мастерство</strong> — уровень персонажа влияет на успех,
              скидку на материалы и риски.
            </li>
            <li>
              • <strong className="text-red-400">Риски</strong> — при провале возможна потеря души или
              maxDurability (скрытые параметры наград также могут снизиться).
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
