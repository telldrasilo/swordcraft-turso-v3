'use client'

import { useEffect, useRef } from 'react'
import { useGameStore } from '@/store'
import { toast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'

/**
 * Одноразовый тост: первые видимые повреждения после миссии или 3-я завершённая экспедиция.
 * Не блокирует UI; закрытие помечает подсказку как показанную.
 */
export function WeaponRepairGuidanceListener() {
  const pending = useGameStore((s) => s.tutorial?.weaponRepairGuidancePending ?? false)
  const consumed = useGameStore((s) => s.tutorial?.weaponRepairGuidanceConsumed ?? false)
  const acknowledge = useGameStore((s) => s.acknowledgeWeaponRepairGuidance)
  const navigateToForgeTab = useGameStore((s) => s.navigateToForgeTab)
  const shownForPendingRef = useRef(false)

  useEffect(() => {
    if (!pending || consumed) {
      shownForPendingRef.current = false
      return
    }
    if (shownForPendingRef.current) return
    shownForPendingRef.current = true

    toast({
      title: 'Уход за клинком',
      description:
        'Повреждения и износ лечатся во вкладке «Ремонт» в кузнице: техники, этапы и ресурсы как при обычном ремонте.',
      action: (
        <ToastAction
          altText="Открыть ремонт"
          onClick={() => {
            acknowledge()
            navigateToForgeTab('repair')
          }}
        >
          Ремонт
        </ToastAction>
      ),
      onOpenChange: (open) => {
        if (!open) acknowledge()
      },
    })
  }, [pending, consumed, acknowledge, navigateToForgeTab])

  return null
}
