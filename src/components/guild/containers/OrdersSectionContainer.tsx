/**
 * Orders Section Container
 * Подключает OrdersSection к store и обрабатывает бизнес-логику
 */

'use client'

import { useState, useEffect } from 'react'
import { useGameStore } from '@/store'
import { OrdersSection } from '../presentation/OrdersSection'
import { AlertTriangle } from 'lucide-react'
import type { NPCOrder } from '@/types/npc-order'
import { type OrderGenerationContext } from '@/lib/store-utils/order-achievable-utils'
import { hiddenTagsSatisfyOrderMaterial } from '@/lib/craft/weapon-display-meta'
import { shouldPromptExpeditionWorkbenchQueueDialog, countPlannedWorkbenchItemsForWeapon } from '@/lib/workbench/workbench-expedition-guard'
import { WorkbenchPlannedQueueAlert } from '@/components/shared/workbench-planned-queue-alert'

export function OrdersSectionContainer() {
  // Store selectors
  const player = useGameStore((state) => state.player)
  const orders = useGameStore((state) => state.orders)
  const activeOrderId = useGameStore((state) => state.activeOrderId)
  const generateOrder = useGameStore((state) => state.generateOrder)
  const acceptOrder = useGameStore((state) => state.acceptOrder)
  const cancelOrder = useGameStore((state) => state.cancelOrder)
  const completeOrder = useGameStore((state) => state.completeOrder)
  const refreshOrders = useGameStore((state) => state.refreshOrders)
  const weaponInventory = useGameStore((state) => state.weaponInventory)
  const workbenchQueue = useGameStore((state) => state.workbenchQueue)
  const repairTechniqueStageRun = useGameStore((state) => state.repairTechniqueStageRun)
  const removeAllPlannedWorkbenchItemsForWeapon = useGameStore(
    (state) => state.removeAllPlannedWorkbenchItemsForWeapon
  )
  const resources = useGameStore((state) => state.resources)
  const unlockedRecipes = useGameStore((state) => state.unlockedRecipes)

  // Local state
  const [showWeaponSelect, setShowWeaponSelect] = useState<string | null>(null)
  const [orderWorkbenchWeaponId, setOrderWorkbenchWeaponId] = useState<string | null>(null)
  const [showAdvanceDialog, setShowAdvanceDialog] = useState<NPCOrder | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState<NPCOrder | null>(null)

  // Эффект: генерация новых заказов
  useEffect(() => {
    const availableOrdersCount = orders.filter((o) => o.status === 'available').length
    console.warn('[OrdersSection] Available orders:', availableOrdersCount, 'Total orders:', orders.length, 'Unlocked recipes:', unlockedRecipes.weaponRecipes)
    
    if (availableOrdersCount < 3) {
      // Создаём контекст для генерации
      const generationContext: OrderGenerationContext = {
        playerLevel: player.level,
        playerFame: player.fame,
        playerResources: resources,
        unlockedRecipes: unlockedRecipes,
        existingClients: orders.filter(o => o.status === 'available').map(o => o.clientName)
      }

      const numOrders = 3 - availableOrdersCount
      console.warn('[OrdersSection] Generating', numOrders, 'orders')

      for (let i = 0; i < numOrders; i++) {
        console.warn('[OrdersSection] Generating order', i + 1, 'of', numOrders)
        const result = generateOrder(generationContext)
        console.warn('[OrdersSection] Order generation result:', result ? 'success' : 'failed')
      }
    }
  }, [player.level, player.fame, orders, generateOrder, resources, unlockedRecipes])

  // Вычисленные значения
  const availableOrders = orders.filter((o) => o.status === 'available')
  const activeOrder = orders.find((o) => o.id === activeOrderId)
  const completedOrders = orders.filter((o) => o.status === 'completed')
  const expiredOrders = orders.filter((o) => o.status === 'expired')

  const suitableWeapons = showWeaponSelect
    ? weaponInventory.weapons.filter((w) => {
        const order = orders.find((o) => o.id === showWeaponSelect)
        if (!order || order.status !== 'in_progress') return false
        
        // Новая система: проверяем hiddenTags
        if (w.hiddenTags && w.hiddenTags.length > 0) {
          // Проверка типа оружия
          if (!w.hiddenTags.includes(order.weaponType)) return false
          
          if (order.material && !hiddenTagsSatisfyOrderMaterial(w.hiddenTags, order.material)) {
            return false
          }
        } else {
          // Fallback: старая система
          if (w.type !== order.weaponType) return false
          if (order.material && w.recipeId && !w.recipeId.includes(order.material)) {
            return false
          }
        }
        
        // Общие проверки
        if (w.quality < order.minQuality) return false
        if (order.minAttack && w.stats.attack < order.minAttack) return false
        
        return true
      })
    : []

  // Обработчики событий
  const handleAcceptOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return

    if (order.materialAdvance) {
      // Показать диалог подтверждения аванса
      setShowAdvanceDialog(order)
    } else {
      acceptOrder(orderId)
    }
  }

  const handleAcceptWithAdvance = () => {
    if (showAdvanceDialog) {
      acceptOrder(showAdvanceDialog.id)
      setShowAdvanceDialog(null)
    }
  }

  const handleCancelAdvance = () => {
    setShowAdvanceDialog(null)
  }

  const finishOrderWithWeapon = (orderId: string, weaponId: string) => {
    completeOrder(orderId, weaponId)
    setShowWeaponSelect(null)
  }

  const handleCompleteOrder = (weaponId: string) => {
    if (!showWeaponSelect) return
    if (
      shouldPromptExpeditionWorkbenchQueueDialog(weaponId, workbenchQueue, repairTechniqueStageRun)
    ) {
      setOrderWorkbenchWeaponId(weaponId)
      return
    }
    finishOrderWithWeapon(showWeaponSelect, weaponId)
  }

  const handleCancelWeaponSelect = () => {
    setShowWeaponSelect(null)
  }

  const handleCancelOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return
    setShowCancelDialog(order)
  }

  const handleConfirmCancel = () => {
    if (showCancelDialog) {
      cancelOrder(showCancelDialog.id)
      setShowCancelDialog(null)
    }
  }

  const orderWorkbenchWeaponLabel =
    orderWorkbenchWeaponId != null
      ? (weaponInventory.weapons.find((w) => w.id === orderWorkbenchWeaponId)?.fullName ?? '')
      : ''

  return (
    <>
      <OrdersSection
        activeOrder={activeOrder}
        availableOrders={availableOrders}
        completedOrders={completedOrders}
        expiredOrders={expiredOrders}
        showWeaponSelect={showWeaponSelect}
        suitableWeapons={suitableWeapons}
        playerLevel={player.level}
        onAcceptOrder={handleAcceptOrder}
        onCancelOrder={handleCancelOrder}
        onCompleteOrder={handleCompleteOrder}
        onCancelWeaponSelect={handleCancelWeaponSelect}
        onShowWeaponSelect={setShowWeaponSelect}
        onRefreshOrders={refreshOrders}
      />

      {/* Диалог подтверждения аванса материалов */}
      {showAdvanceDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-800 border border-stone-600 rounded-lg max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-stone-200 mb-2">
                  Аванс на материалы
                </h3>
                <p className="text-sm text-stone-300 mb-3">
                  У вас нет материалов для выполнения этого заказа. Клиент предоставит аванс,
                  который будет вычтен из награды ({showAdvanceDialog.materialAdvance?.totalCost} золота).
                </p>
                <div className="bg-amber-900/20 border border-amber-600/30 rounded-md p-3 mb-3">
                  <div className="text-xs text-amber-300 font-medium mb-2">
                    Материалы, которые вы получите:
                  </div>
                  <div className="text-xs text-stone-300">
                    {showAdvanceDialog.materialAdvance?.materials.map(m => (
                      <div key={m.resource} className="flex justify-between">
                        <span>{m.resource}:</span>
                        <span className="font-medium">{m.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-stone-400">
                  Итоговая награда: {showAdvanceDialog.goldReward} золота
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelAdvance}
                className="flex-1 px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-md transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleAcceptWithAdvance}
                className="flex-1 px-4 py-2 bg-green-700 hover:bg-green-600 text-green-100 rounded-md transition-colors"
              >
                Принять с авансом
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Диалог подтверждения отмены заказа */}
      <WorkbenchPlannedQueueAlert
        open={!!orderWorkbenchWeaponId && !!showWeaponSelect}
        onOpenChange={(open) => {
          if (!open) setOrderWorkbenchWeaponId(null)
        }}
        weaponLabel={orderWorkbenchWeaponLabel}
        plannedCount={
          orderWorkbenchWeaponId
            ? countPlannedWorkbenchItemsForWeapon(orderWorkbenchWeaponId, workbenchQueue)
            : 0
        }
        contextLabel="сдачи заказа"
        onConfirmClearAndContinue={() => {
          if (!showWeaponSelect || !orderWorkbenchWeaponId) return
          removeAllPlannedWorkbenchItemsForWeapon(orderWorkbenchWeaponId)
          const oid = showWeaponSelect
          const wid = orderWorkbenchWeaponId
          setOrderWorkbenchWeaponId(null)
          finishOrderWithWeapon(oid, wid)
        }}
      />

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
                  Вы собираетесь отменить заказ от клиента {showCancelDialog.clientName}.
                  За отмену будет взыскан штраф в размере {Math.floor(showCancelDialog.goldReward * 0.1)} золота.
                </p>
                <div className="bg-red-900/20 border border-red-600/30 rounded-md p-3 mb-3">
                  <div className="text-xs text-red-300 font-medium mb-2">
                    Награда заказа: {showCancelDialog.goldReward} золота
                  </div>
                  <div className="text-xs text-red-400">
                    Штраф за отмену: {Math.floor(showCancelDialog.goldReward * 0.1)} золота
                  </div>
                </div>
                <p className="text-xs text-stone-400">
                  Заказ вернётся в список доступных заказов.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelDialog(null)}
                className="flex-1 px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-md transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 px-4 py-2 bg-red-700 hover:bg-red-600 text-red-100 rounded-md transition-colors"
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
