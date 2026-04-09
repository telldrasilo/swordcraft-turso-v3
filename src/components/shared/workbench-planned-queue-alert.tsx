'use client'

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

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  weaponLabel: string
  plannedCount: number
  contextLabel: string
  onConfirmClearAndContinue: () => void
}

/** §6.1 / план верстака: снять только «запланированные» пункты и продолжить действие (экспедиция / заказ). */
export function WorkbenchPlannedQueueAlert({
  open,
  onOpenChange,
  weaponLabel,
  plannedCount,
  contextLabel,
  onConfirmClearAndContinue,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-stone-600 bg-stone-900 text-stone-100 sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-amber-100">Очередь верстака</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-stone-300 text-sm text-left">
              <p>
                У <span className="font-medium text-stone-200">{weaponLabel}</span> в очереди верстака запланировано{' '}
                <span className="font-medium text-amber-200/95">
                  {plannedCount} {plannedCount === 1 ? 'действие' : 'действий'}
                </span>
                .
              </p>
              <p>
                Для {contextLabel} эти пункты нужно отменить — они ещё не начаты. Продолжить и очистить план?
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-stone-600 bg-stone-800 text-stone-200 hover:bg-stone-700">
            Назад
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-amber-700 text-amber-50 hover:bg-amber-600"
            onClick={(e) => {
              e.preventDefault()
              onConfirmClearAndContinue()
            }}
          >
            Очистить план и продолжить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
