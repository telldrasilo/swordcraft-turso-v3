/**
 * RepairSection - секция ремонта оружия (один клинок на верстаке)
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Wrench, CheckCircle, Zap, Package } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/store'
import { useSound } from '@/lib/sounds'
import { getSmithMastery } from '@/data/repair-system'
import { RepairCard } from '@/components/ui/repair-card'
import { WeaponInventoryCard } from '@/components/forge/weapon-inventory-card'
import type { RepairResult } from '@/data/repair-system'

export function RepairSection() {
  const weaponInventory = useGameStore((state) => state.weaponInventory)
  const repairBenchWeaponId = useGameStore((state) => state.repairBenchWeaponId)
  const returnWeaponFromRepairBench = useGameStore((state) => state.returnWeaponFromRepairBench)
  const player = useGameStore((state) => state.player)
  const settleAutoRepairForgeVisitReady = useGameStore((state) => state.settleAutoRepairForgeVisitReady)
  const [lastRepair, setLastRepair] = useState<{ weaponName: string; result: RepairResult } | null>(null)
  const { play } = useSound()

  useEffect(() => {
    settleAutoRepairForgeVisitReady()
  }, [settleAutoRepairForgeVisitReady])

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

  const mastery = getSmithMastery(Math.max(1, player.level))

  return (
    <div className="space-y-4">
      <Card className="card-medieval bg-stone-800/50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-stone-300">{player.name}</p>
                <p className="text-xs text-amber-400">
                  {mastery.name} · ур. {player.level}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-green-400">
                <CheckCircle className="w-3 h-3" />
                <span>
                  {mastery.successBonus >= 0 ? '+' : ''}
                  {mastery.successBonus}% к успеху
                </span>
              </div>
              <div className="flex items-center gap-1 text-purple-400">
                <span>{mastery.discountPercent}% скидка на материалы</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {!repairBenchWeaponId || !benchWeapon ? (
        <Card className="card-medieval">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-stone-800/50 flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-stone-600" />
            </div>
            <p className="text-stone-400 font-medium">Верстак свободен</p>
            <p className="text-stone-500 text-sm mt-2 max-w-md mx-auto">
              Во вкладке «Инвентарь» нажмите «Отправить на ремонт» на карточке клинка — он появится здесь.
              Одновременно на верстаке только одно оружие.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-stone-600 text-stone-300 hover:bg-stone-800"
              onClick={() => returnWeaponFromRepairBench()}
            >
              Вернуть в инвентарь
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,22rem)_1fr] gap-4 items-start">
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <WeaponInventoryCard weapon={benchWeapon} context="repairBench" />
            </div>
            <RepairCard
              key={benchWeapon.id}
              variant="repairWorkbench"
              compactWeaponChrome
              weapon={benchWeapon}
              onRepairDone={(weaponName, result) => {
                play('craft_complete')
                setLastRepair({ weaponName, result })
                setTimeout(() => setLastRepair(null), 3000)
              }}
            />
          </div>
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
