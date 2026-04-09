/**
 * Active Orders Section for Forge Screen
 * Показывает активный заказ в кузнице для удобства доступа
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useGameStore } from '@/store'
import type { NPCOrder } from '@/store/slices/orders-slice'

import { useState, useMemo } from 'react'
import { Sword, Star, Coins, AlertTriangle, CheckCircle2, Package } from 'lucide-react'
import { calculateGoldRewardRange } from '@/lib/store-utils/order-utils'
import { shouldPromptExpeditionWorkbenchQueueDialog, countPlannedWorkbenchItemsForWeapon } from '@/lib/workbench/workbench-expedition-guard'
import { WorkbenchPlannedQueueAlert } from '@/components/shared/workbench-planned-queue-alert'

// Названия типов оружия
const weaponTypeNames: Record<string, string> = {
  sword: 'Меч',
  dagger: 'Кинжал',
  axe: 'Топор',
  mace: 'Булава',
  spear: 'Копьё',
  hammer: 'Молот'
}

// Названия материалов
const materialNames: Record<string, string> = {
  iron: 'Железный',
  bronze: 'Бронзовый',
  steel: 'Стальной',
  silver: 'Серебряный',
  gold: 'Золотой',
  mithril: 'Мифриловый'
}


interface ActiveOrdersSectionProps {
  onShowDetails: () => void
}

export function ActiveOrdersSection({ onShowDetails }: ActiveOrdersSectionProps) {
  const activeOrderId = useGameStore((state) => state.activeOrderId)
  const activeOrder = useGameStore((state) => {
    if (!state.activeOrderId) return undefined
    return state.orders.find(o => o.id === state.activeOrderId && o.status === 'in_progress')
  })
  const cancelOrder = useGameStore((state) => state.cancelOrder)
  const completeOrder = useGameStore((state) => state.completeOrder)
  const weapons = useGameStore((state) => state.weaponInventory.weapons)
  const playerLevel = useGameStore((state) => state.player.level)
  const workbenchQueue = useGameStore((state) => state.workbenchQueue)
  const repairTechniqueStageRun = useGameStore((state) => state.repairTechniqueStageRun)
  const removeAllPlannedWorkbenchItemsForWeapon = useGameStore(
    (state) => state.removeAllPlannedWorkbenchItemsForWeapon
  )
  
  const [showCancelDialog, setShowCancelDialog] = useState<NPCOrder | null>(null)
  const [showWeaponSelect, setShowWeaponSelect] = useState(false)
  const [forgeOrderWorkbenchWeaponId, setForgeOrderWorkbenchWeaponId] = useState<string | null>(null)

  // Подходящие оружия для заказа (с использованием hiddenTags)
  const suitableWeapons = useMemo(() => {
    if (!activeOrder) return []
    
    return weapons.filter((w) => {
      // Новая система: проверяем hiddenTags
      if (w.hiddenTags && w.hiddenTags.length > 0) {
        // Проверка типа оружия
        if (!w.hiddenTags.includes(activeOrder.weaponType)) return false
        
        // Проверка материала
        if (activeOrder.material && !w.hiddenTags.includes(activeOrder.material)) return false
      } else {
        // Fallback: старая система
        if (w.type !== activeOrder.weaponType) return false
        if (activeOrder.material && w.recipeId && !w.recipeId.includes(activeOrder.material)) {
          return false
        }
      }
      
      // Общие проверки
      if (w.quality < activeOrder.minQuality) return false
      if (activeOrder.minAttack && w.stats.attack < activeOrder.minAttack) return false
      
      return true
    })
  }, [activeOrder, weapons])

  const hasSuitableWeapons = suitableWeapons.length > 0

  // Если нет активного заказа, не показываем секцию
  if (!activeOrderId || !activeOrder) {
    return null
  }

  const weaponTypeName = weaponTypeNames[activeOrder.weaponType] || activeOrder.weaponType
  const materialName = activeOrder.material ? materialNames[activeOrder.material] : ''
  const requiredWeapon = `${materialName} ${weaponTypeName}`.trim()
  const penalty = Math.floor(activeOrder.goldReward * 0.1)

  const handleCancelClick = () => {
    setShowCancelDialog(activeOrder)
  }

  const handleConfirmCancel = () => {
    if (showCancelDialog) {
      cancelOrder(showCancelDialog.id)
      setShowCancelDialog(null)
    }
  }

  const handleCancelDialog = () => {
    setShowCancelDialog(null)
  }

  const handleCompleteClick = () => {
    setShowWeaponSelect(true)
  }

  const handleWeaponSelect = (weaponId: string) => {
    if (!activeOrderId) return
    if (shouldPromptExpeditionWorkbenchQueueDialog(weaponId, workbenchQueue, repairTechniqueStageRun)) {
      setForgeOrderWorkbenchWeaponId(weaponId)
      return
    }
    completeOrder(activeOrderId, weaponId)
    setShowWeaponSelect(false)
  }

  const handleCancelWeaponSelect = () => {
    setShowWeaponSelect(false)
  }

  const forgeOrderWeaponLabel =
    forgeOrderWorkbenchWeaponId != null
      ? (weapons.find((w) => w.id === forgeOrderWorkbenchWeaponId)?.fullName ?? '')
      : ''

  return (
    <>
      <WorkbenchPlannedQueueAlert
        open={!!forgeOrderWorkbenchWeaponId && !!activeOrderId}
        onOpenChange={(open) => {
          if (!open) setForgeOrderWorkbenchWeaponId(null)
        }}
        weaponLabel={forgeOrderWeaponLabel}
        plannedCount={
          forgeOrderWorkbenchWeaponId
            ? countPlannedWorkbenchItemsForWeapon(forgeOrderWorkbenchWeaponId, workbenchQueue)
            : 0
        }
        contextLabel="сдачи заказа"
        onConfirmClearAndContinue={() => {
          if (!activeOrderId || !forgeOrderWorkbenchWeaponId) return
          removeAllPlannedWorkbenchItemsForWeapon(forgeOrderWorkbenchWeaponId)
          const wid = forgeOrderWorkbenchWeaponId
          setForgeOrderWorkbenchWeaponId(null)
          completeOrder(activeOrderId, wid)
          setShowWeaponSelect(false)
        }}
      />

      <Card className="card-medieval border-amber-600/30 bg-amber-900/10">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-amber-400 flex items-center gap-2">
              <Sword className="w-5 h-5" />
              Активный заказ
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={onShowDetails}
              className="border-amber-600/50 text-amber-300 hover:bg-amber-900/20"
            >
              Подробности
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-900/30 flex items-center justify-center text-2xl flex-shrink-0">
              {activeOrder.clientIcon}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-stone-200">{activeOrder.clientName}</h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-stone-800/50">
                  {activeOrder.clientTitle}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Sword className="w-4 h-4 text-amber-400" />
              <span className="text-stone-300">{requiredWeapon}</span>
              {activeOrder.minQuality > 0 && (
                <Badge variant="outline" className="text-xs text-amber-400 border-amber-600">
                  Качество {activeOrder.minQuality}+
                </Badge>
              )}
              {activeOrder.minAttack && (
                <Badge variant="outline" className="text-xs text-red-400 border-red-600">
                  Атака {activeOrder.minAttack}+
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-amber-400">
                <Coins className="w-4 h-4" />
                <span className="font-semibold">{activeOrder.goldReward}</span>
              </div>
              <div className="flex items-center gap-1 text-purple-400">
                <Star className="w-4 h-4" />
                <span>{activeOrder.fameReward} славы</span>
              </div>
            </div>

            {activeOrder.bonusItems && activeOrder.bonusItems.length > 0 && (
              <div className="p-3 bg-green-900/20 border border-green-600/30 rounded-md">
                <div className="text-xs text-green-400 mb-1">
                  Бонусные предметы: {activeOrder.bonusItems.map(b => `${b.amount} ${b.resource}`).join(', ')}
                </div>
              </div>
            )}

            {activeOrder.materialAdvance && (
              <div className="p-3 bg-amber-900/20 border border-amber-600/30 rounded-md">
                <div className="text-xs text-amber-300 mb-1">
                  Аванс на материалы: {activeOrder.materialAdvance.materials.map(m => `${m.amount} ${m.resource}`).join(', ')}
                </div>
              </div>
            )}

            {/* Статус наличия оружия */}
            <div className={`p-2 rounded-md text-xs ${hasSuitableWeapons 
              ? 'bg-green-900/20 border border-green-600/30 text-green-400' 
              : 'bg-stone-800/50 border border-stone-600/30 text-stone-400'
            }`}>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                {hasSuitableWeapons 
                  ? `В инвентаре: ${suitableWeapons.length} подходящих` 
                  : 'Нет подходящего оружия в инвентаре'
                }
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-stone-700">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-red-600/50 text-red-300 hover:bg-red-900/20"
              onClick={handleCancelClick}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Отменить
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className={`flex-1 ${hasSuitableWeapons 
                ? 'border-green-600/50 text-green-300 hover:bg-green-900/20' 
                : 'border-stone-600/50 text-stone-500 cursor-not-allowed'
              }`}
              onClick={handleCompleteClick}
              disabled={!hasSuitableWeapons}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Сдать заказ
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Диалог подтверждения отмены */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-800 border border-stone-600 rounded-lg max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-stone-200 mb-2">
                  Отменить заказ?
                </h3>
                <p className="text-sm text-stone-300 mb-3">
                  Вы собираетесь отменить заказ от клиента <strong>{showCancelDialog.clientName}</strong>.
                  За отмену будет взыскан штраф в размере <strong>{penalty} золота</strong>.
                </p>
                <div className="bg-red-900/20 border border-red-600/30 rounded-md p-3 mb-3">
                  <div className="text-xs text-red-300 font-medium mb-2">
                    Информация о заказе:
                  </div>
                  <div className="text-xs text-stone-300 space-y-1">
                    <div>Клиент: {showCancelDialog.clientName}</div>
                    <div>Награда: {showCancelDialog.goldReward} золота</div>
                    <div className="text-red-400">Штраф за отмену: {penalty} золота</div>
                  </div>
                </div>
                <p className="text-xs text-stone-400">
                  Заказ вернётся в список доступных заказов.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleCancelDialog}
                className="flex-1 px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-md transition-colors"
              >
                Отмена
              </Button>
              <Button
                onClick={handleConfirmCancel}
                className="flex-1 px-4 py-2 bg-red-700 hover:bg-red-600 text-red-100 rounded-md transition-colors"
              >
                Подтвердить
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Диалог выбора оружия для сдачи заказа */}
      {showWeaponSelect && activeOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-800 border border-stone-600 rounded-lg max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-stone-200">
                Выберите оружие для сдачи
              </h3>
              <button
                onClick={handleCancelWeaponSelect}
                className="text-stone-400 hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-3 bg-amber-900/20 border border-amber-600/30 rounded-md">
              <div className="text-sm text-amber-300 mb-2">
                Требования заказа:
              </div>
              <div className="text-xs text-stone-300 space-y-1">
                <div>Тип: {weaponTypeName}</div>
                {activeOrder.material && <div>Материал: {materialNames[activeOrder.material] || activeOrder.material}</div>}
                <div>Мин. качество: {activeOrder.minQuality}+</div>
                {activeOrder.minAttack && <div>Мин. атака: {activeOrder.minAttack}</div>}
              </div>
            </div>

            {suitableWeapons.length === 0 ? (
              <div className="text-center text-stone-400 py-8">
                Нет подходящего оружия в инвентаре
              </div>
            ) : (
              <div className="space-y-2">
                {suitableWeapons.map((weapon) => {
                  // Рассчитываем награду за это оружие
                  const rewardRange = activeOrder && calculateGoldRewardRange(
                    activeOrder.minQuality,
                    activeOrder.weaponType,
                    activeOrder.material,
                    playerLevel,
                    activeOrder.materialCost
                  )
                  const reward = rewardRange ? rewardRange.current(weapon.quality) : 0
                  
                  return (
                    <div
                      key={weapon.id}
                      className="flex items-center gap-2"
                    >
                      <div className="flex-1 p-3 bg-stone-700/50 border border-stone-600 rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-stone-200">{weapon.fullName}</div>
                            <div className="text-xs text-stone-400">
                              {weaponTypeNames[weapon.type] || weapon.type} • Качество: {weapon.quality} • Атака: {weapon.stats.attack}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-amber-400 font-semibold flex items-center gap-1">
                              <Coins className="w-4 h-4" />
                              {reward} золота
                            </div>
                            <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto mt-1" />
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleWeaponSelect(weapon.id)}
                        className="px-4 py-3 bg-green-700 hover:bg-green-600 text-white rounded-md transition-colors font-medium whitespace-nowrap"
                      >
                        Сдать
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <Button
                onClick={handleCancelWeaponSelect}
                className="flex-1 px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-md transition-colors"
              >
                Отмена
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
