'use client'

import { useEffect, useMemo } from 'react'
import { Hammer, Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useGameStore } from '@/store'
import { useSound } from '@/lib/sounds'
import { useToast } from '@/hooks/use-toast'
import { WeaponInventoryCard } from '@/components/forge/weapon-inventory-card'
import { ReforgeCard } from '@/components/forge/reforge-card'

export function ReforgeSection() {
  const weaponInventory = useGameStore((state) => state.weaponInventory)
  const repairBenchWeaponId = useGameStore((state) => state.repairBenchWeaponId)
  const returnWeaponFromRepairBench = useGameStore((state) => state.returnWeaponFromRepairBench)
  const guildLevel = useGameStore((state) => state.guild.level)
  const playerLevel = useGameStore((state) => state.player.level)
  const unlockedMaterialProcessingTechniqueIds = useGameStore(
    (state) => state.unlockedMaterialProcessingTechniqueIds
  )
  const unlockedReforgeTechniqueIds = useGameStore((state) => state.unlockedReforgeTechniqueIds)
  const applyReforgeTechnique = useGameStore((state) => state.applyReforgeTechnique)
  const { toast } = useToast()
  const { play } = useSound()

  useEffect(() => {
    if (
      repairBenchWeaponId &&
      !weaponInventory.weapons.some((w) => w.id === repairBenchWeaponId)
    ) {
      returnWeaponFromRepairBench()
    }
  }, [repairBenchWeaponId, weaponInventory.weapons, returnWeaponFromRepairBench])

  const benchWeapon = useMemo(() => {
    if (!repairBenchWeaponId) return undefined
    return weaponInventory.weapons.find((w) => w.id === repairBenchWeaponId)
  }, [weaponInventory.weapons, repairBenchWeaponId])

  const listWeapons = useMemo(
    () => weaponInventory.weapons.filter((w) => w.id !== repairBenchWeaponId),
    [weaponInventory.weapons, repairBenchWeaponId]
  )

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
    if (!repairBenchWeaponId) return
    const result = applyReforgeTechnique(repairBenchWeaponId, techniqueId)
    if (!result.ok) {
      const labels: Record<string, string> = {
        no_weapon: 'Оружие не найдено.',
        not_on_bench:
          'Перековка доступна только для клинка на верстаке. Откройте «Ремонт» и поставьте оружие.',
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
      toast({ title: 'Перековка', description: 'Усиление применено.' })
    } else if (result.outcome === 'awaken_success') {
      play('craft_complete')
      toast({ title: 'Перековка', description: 'Шрам пробуждён.' })
    } else {
      play('error')
      toast({
        title: 'Перековка',
        description: 'Пробуждение не удалось, душа потрачена.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4">
      {!repairBenchWeaponId || !benchWeapon ? (
        <Card className="card-medieval">
          <CardContent className="p-6 text-center space-y-3">
            <Hammer className="w-12 h-12 mx-auto text-stone-600" />
            <p className="text-stone-400">
              Поставьте оружие на верстак во вкладке «Ремонт», затем вернитесь сюда — тот же клинок
              будет доступен для перековки.
            </p>
            <p className="text-xs text-stone-500">
              Вкладка «Перековка» использует слот <code className="text-amber-200/80">repairBenchWeaponId</code>
              , общий с ремонтом.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ReforgeCard weapon={benchWeapon} ctx={ctx} onApply={handleApply} />
      )}

      <Card className="card-medieval bg-stone-800/40">
        <CardContent className="p-3 flex items-center gap-2 text-sm text-stone-400">
          <Package className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            Выберите клинок ниже и отправьте на верстак (как во вкладке «Инвентарь» / «Ремонт»), затем
            откройте «Перековку» снова.
          </span>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {listWeapons.map((w) => (
          <WeaponInventoryCard key={w.id} weapon={w} />
        ))}
      </div>
    </div>
  )
}
