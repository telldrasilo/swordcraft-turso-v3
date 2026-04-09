'use client'

import { useEffect, useMemo, useState } from 'react'
import { Hammer } from 'lucide-react'
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
import { hasPlannedOrRunningQueueItemOfKind } from '@/lib/workbench/workbench-queue'
import { useGameStore } from '@/store'
import { useSound } from '@/lib/sounds'
import { useToast } from '@/hooks/use-toast'
import { ReforgeCard } from '@/components/forge/reforge-card'

export function ReforgeSection() {
  const weaponInventory = useGameStore((state) => state.weaponInventory)
  const workbenchSelectedWeaponId = useGameStore((state) => state.workbenchSelectedWeaponId)
  const setWorkbenchSelectedWeaponId = useGameStore((state) => state.setWorkbenchSelectedWeaponId)
  const guildLevel = useGameStore((state) => state.guild.level)
  const playerLevel = useGameStore((state) => state.player.level)
  const unlockedMaterialProcessingTechniqueIds = useGameStore(
    (state) => state.unlockedMaterialProcessingTechniqueIds
  )
  const unlockedReforgeTechniqueIds = useGameStore((state) => state.unlockedReforgeTechniqueIds)
  const applyReforgeTechnique = useGameStore((state) => state.applyReforgeTechnique)
  const enqueueWorkbenchReforge = useGameStore((state) => state.enqueueWorkbenchReforge)
  const workbenchQueue = useGameStore((state) => state.workbenchQueue)
  const { toast } = useToast()
  const { play } = useSound()
  const [reforgeDup, setReforgeDup] = useState<{
    techniqueId: string
    kind: 'reforge_buff' | 'reforge_awaken'
  } | null>(null)

  useEffect(() => {
    if (
      workbenchSelectedWeaponId &&
      !weaponInventory.weapons.some((w) => w.id === workbenchSelectedWeaponId)
    ) {
      setWorkbenchSelectedWeaponId(null)
    }
  }, [workbenchSelectedWeaponId, weaponInventory.weapons, setWorkbenchSelectedWeaponId])

  const benchWeapon = useMemo(() => {
    if (!workbenchSelectedWeaponId) return undefined
    return weaponInventory.weapons.find((w) => w.id === workbenchSelectedWeaponId)
  }, [weaponInventory.weapons, workbenchSelectedWeaponId])

  const ctx = useMemo(
    () => ({
      guildLevel,
      playerLevel,
      unlockedMaterialProcessingTechniqueIds,
      unlockedReforgeTechniqueIds,
    }),
    [guildLevel, playerLevel, unlockedMaterialProcessingTechniqueIds, unlockedReforgeTechniqueIds]
  )

  const handleApply = (techniqueId: string) => {
    if (!workbenchSelectedWeaponId || !benchWeapon) return
    const result = applyReforgeTechnique(workbenchSelectedWeaponId, techniqueId)
    if (!result.ok) {
      const labels: Record<string, string> = {
        no_weapon: 'Оружие не найдено.',
        not_on_bench:
          'Перековка доступна только для выбранного клинка на верстаке. Выберите клинок в списке слева.',
        technique_not_found: 'Неизвестная техника.',
        locked_guild: 'Недостаточный уровень гильдии.',
        locked_technique: 'Техника заблокирована.',
        insufficient_war_soul: 'Недостаточно души войны.',
        no_scars: 'Нет шрамов для пробуждения.',
        max_stacks: 'Достигнут лимит усилений.',
        all_scars_awakened: 'Все доступные шрамы уже пробуждены.',
        scar_awakening_already_done:
          'На этом клинке уже было успешное пробуждение шрама (фаза 1 — одно на экземпляр).',
      }
      toast({
        title: 'Перековка',
        description: labels[result.reason] ?? result.reason,
        variant: 'destructive',
      })
      return
    }

    if (result.outcome === 'buff') {
      play('craft_complete')
      const b = result.buff
      let desc = 'Усиление применено.'
      if (b) {
        const tierHint =
          b.baseWarSoulCost != null &&
          b.warSoulCostTierFactor != null &&
          b.warSoulCostTierFactor > 1
            ? ` Списано ${b.warSoulSpent.toLocaleString('ru-RU')} ДВ (база ${b.baseWarSoulCost.toLocaleString('ru-RU')} × ранг ×${b.warSoulCostTierFactor}).`
            : ` Списано ${b.warSoulSpent.toLocaleString('ru-RU')} ДВ.`
        if (b.statKind === 'attack' && b.attackBefore != null && b.attackAfter != null) {
          desc = `Атака: ${b.attackBefore} → ${b.attackAfter} (+${b.buffPercentRolled}% к снимку).${tierHint} Остаток ДВ: ${result.weapon.warSoul.toLocaleString('ru-RU')}.`
        } else if (
          b.statKind === 'maxDurability' &&
          b.maxDurabilityBefore != null &&
          b.maxDurabilityAfter != null
        ) {
          desc = `Макс. прочность: ${b.maxDurabilityBefore} → ${b.maxDurabilityAfter} (+${b.buffPercentRolled}% к снимку).${tierHint} Остаток ДВ: ${result.weapon.warSoul.toLocaleString('ru-RU')}.`
        }
      }
      toast({ title: 'Перековка', description: desc })
    } else if (result.outcome === 'awaken_success') {
      play('craft_complete')
      toast({ title: 'Перековка', description: 'Шрам пробуждён.' })
    } else {
      play('error')
      toast({
        title: 'Перековка',
        description: `Пробуждение не удалось (шанс был ~${result.chance != null ? Math.round(result.chance * 100) : '?'}%). Душа потрачена.`,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4">
      <AlertDialog
        open={reforgeDup != null}
        onOpenChange={(open) => {
          if (!open) setReforgeDup(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Уже есть перековка этого типа</AlertDialogTitle>
            <AlertDialogDescription>
              Для этого клинка уже запланирована или выполняется перековка того же типа (усиление или
              пробуждение). Добавить ещё одну задачу?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (reforgeDup && benchWeapon) {
                  enqueueWorkbenchReforge({
                    weaponId: benchWeapon.id,
                    techniqueId: reforgeDup.techniqueId,
                    kind: reforgeDup.kind,
                  })
                  toast({
                    title: 'В очереди верстака',
                    description:
                      'Перековка добавлена. Запустите сессию кнопкой «Начать работу» в блоке очереди ниже.',
                  })
                }
                setReforgeDup(null)
              }}
            >
              Добавить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {!workbenchSelectedWeaponId || !benchWeapon ? (
        <Card className="card-medieval">
          <CardContent className="p-6 text-center space-y-3">
            <Hammer className="w-12 h-12 mx-auto text-stone-600" />
            <p className="text-stone-400 max-w-md mx-auto">
              Выберите клинок в списке слева или в карусели — тогда станут доступны усиление духом и
              пробуждение наследия. Очередь и «Начать работу» — в блоке ниже.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ReforgeCard
          weapon={benchWeapon}
          ctx={ctx}
          onApply={handleApply}
          blockBuffSectionsForQueue={hasPlannedOrRunningQueueItemOfKind(
            workbenchQueue,
            benchWeapon.id,
            'reforge_buff'
          )}
          blockAwakenSectionForQueue={hasPlannedOrRunningQueueItemOfKind(
            workbenchQueue,
            benchWeapon.id,
            'reforge_awaken'
          )}
          onEnqueueToWorkbench={(techniqueId, kind) => {
            if (hasPlannedOrRunningQueueItemOfKind(workbenchQueue, benchWeapon.id, kind)) {
              setReforgeDup({ techniqueId, kind })
              return
            }
            enqueueWorkbenchReforge({
              weaponId: benchWeapon.id,
              techniqueId,
              kind,
            })
            toast({
              title: 'В очереди верстака',
              description:
                'Перековка добавлена. Запустите сессию кнопкой «Начать работу» в блоке очереди ниже.',
            })
          }}
        />
      )}
    </div>
  )
}
