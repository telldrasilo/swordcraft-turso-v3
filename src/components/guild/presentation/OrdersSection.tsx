/**
 * Orders Section Presentation Component
 * Только UI, бизнес-логика отсутствует
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OrderCard } from '../order-card'
import { RefreshCw, Coins } from 'lucide-react'

import type { NPCOrder } from '@/types/npc-order'
import type { CraftedWeaponV2 } from '@/types/craft-v2'
import { calculateGoldRewardRange } from '@/lib/store-utils/order-utils'

interface OrdersSectionProps {
  activeOrder: NPCOrder | undefined
  availableOrders: NPCOrder[]
  completedOrders: NPCOrder[]
  expiredOrders: NPCOrder[]
  showWeaponSelect: string | null
  suitableWeapons: CraftedWeaponV2[]
  playerLevel?: number  // Для расчета награды
  onAcceptOrder: (orderId: string) => void
  onCancelOrder: (orderId: string) => void
  onCompleteOrder: (weaponId: string) => void
  onCancelWeaponSelect: () => void
  onShowWeaponSelect: (orderId: string) => void
  onRefreshOrders?: () => void  // Новый проп для обновления заказов
}

export function OrdersSection({
  activeOrder,
  availableOrders,
  completedOrders,
  expiredOrders,
  showWeaponSelect,
  suitableWeapons,
  playerLevel = 1,
  onAcceptOrder,
  onCancelOrder,
  onCompleteOrder,
  onCancelWeaponSelect,
  onShowWeaponSelect,
  onRefreshOrders,
}: OrdersSectionProps) {
  // Функция для расчета награды за конкретное оружие
  const getRewardForWeapon = (weapon: CraftedWeaponV2) => {
    if (!activeOrder) return 0
    const range = calculateGoldRewardRange(
      activeOrder.minQuality,
      activeOrder.weaponType,
      activeOrder.material,
      playerLevel
    )
    return range.current(weapon.quality)
  }
  return (
    <div className="space-y-6">
      {activeOrder && (
        <Card className="card-medieval border-green-600/30 bg-green-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-400">Активный заказ</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderCard
              order={activeOrder}
              onSelect={() => onShowWeaponSelect(activeOrder.id)}
              onCancel={() => onCancelOrder(activeOrder.id)}
              isActive
              canAccept={false}
            />

            <AnimatePresence>
              {showWeaponSelect === activeOrder.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 space-y-3"
                >
                  <div className="text-sm text-stone-300 font-medium">
                    Выберите оружие для сдачи заказа:
                  </div>
                  {suitableWeapons.length === 0 ? (
                    <div className="p-4 bg-red-900/20 border border-red-600/30 rounded-md text-center">
                      <p className="text-red-300">Нет подходящего оружия в инвентаре</p>
                      <p className="text-xs text-stone-500 mt-1">
                        Требуется: {activeOrder.weaponType}
                        {activeOrder.material && ` из ${activeOrder.material}`}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {suitableWeapons.map((weapon) => {
                        const reward = getRewardForWeapon(weapon)
                        return (
                          <div
                            key={weapon.id}
                            className="flex items-center gap-2"
                          >
                            <button
                              onClick={() => onCompleteOrder(weapon.id)}
                              className="flex-1 p-3 bg-green-900/20 hover:bg-green-900/40 border border-green-600/30 rounded-md text-left transition-colors"
                            >
                              <div className="font-medium text-green-300 flex items-center justify-between">
                                <span>{weapon.fullName}</span>
                                <span className="text-amber-400 flex items-center gap-1 text-sm">
                                  <Coins className="w-3 h-3" />
                                  {reward} золота
                                </span>
                              </div>
                              <div className="text-xs text-stone-400">
                                Атака: {weapon.stats.attack} | Качество: {weapon.quality}
                              </div>
                            </button>
                            <button
                              onClick={() => onCompleteOrder(weapon.id)}
                              className="px-4 py-3 bg-green-700 hover:bg-green-600 text-white rounded-md transition-colors font-medium whitespace-nowrap"
                            >
                              Сдать
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <button
                    onClick={onCancelWeaponSelect}
                    className="mt-2 w-full px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-300 rounded-md transition-colors"
                  >
                    Отмена
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Доступные заказы с кнопкой обновления */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-200">
            Доступные заказы ({availableOrders.length}/3)
          </h3>
          {onRefreshOrders && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshOrders}
              className="border-stone-600 text-stone-300 hover:bg-stone-800 hover:text-stone-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Обновить список
            </Button>
          )}
        </div>
        
        {availableOrders.length > 0 ? (
          <div className="space-y-3">
            {availableOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onSelect={() => onAcceptOrder(order.id)}
                isActive={false}
                canAccept={true}
              />
            ))}
          </div>
        ) : (
          <div className="p-4 bg-stone-800/50 border border-stone-700 rounded-md text-center">
            <p className="text-stone-400 text-sm mb-2">
              Нет доступных заказов
            </p>
            <p className="text-stone-500 text-xs">
              Нажмите «Обновить список» для генерации новых заказов
            </p>
          </div>
        )}
      </div>

      {completedOrders.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-200">
            Выполненные заказы
          </h3>
          <div className="space-y-3">
            {completedOrders.slice(0, 5).map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onSelect={() => {}}
                isActive={false}
                canAccept={false}
              />
            ))}
          </div>
        </div>
      )}

      {expiredOrders.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-red-400">
            Просроченные заказы
          </h3>
          <div className="space-y-3">
            {expiredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onSelect={() => {}}
                isActive={false}
                canAccept={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
