/**
 * Orders Section Presentation Component
 * Только UI, бизнес-логика отсутствует
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import OrderCard from '../order-card'

import type { NPCOrder } from '@/data/market-data'
import type { CraftedWeapon } from '@/data/weapon-recipes'

interface OrdersSectionProps {
  activeOrder: NPCOrder | undefined
  availableOrders: NPCOrder[]
  completedOrders: NPCOrder[]
  expiredOrders: NPCOrder[]
  showWeaponSelect: string | null
  suitableWeapons: CraftedWeapon[]
  onAcceptOrder: (orderId: string) => void
  onCompleteOrder: (weaponId: string) => void
  onCancelWeaponSelect: () => void
  onShowWeaponSelect: (orderId: string) => void
}

export function OrdersSection({
  activeOrder,
  availableOrders,
  completedOrders,
  expiredOrders,
  showWeaponSelect,
  suitableWeapons,
  onAcceptOrder,
  onCompleteOrder,
  onCancelWeaponSelect,
  onShowWeaponSelect,
}: OrdersSectionProps) {
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
              isActive
              canAccept={false}
            />

            <AnimatePresence>
              {showWeaponSelect === activeOrder.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 space-y-2"
                >
                  <div className="text-sm text-gray-300">
                    Выберите оружие для выполнения заказа:
                  </div>
                  {suitableWeapons.length === 0 ? (
                    <div className="p-4 bg-red-900/20 border border-red-600/30 rounded-md">
                      Нет подходящего оружия в инвентаре
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {suitableWeapons.map((weapon) => (
                        <button
                          key={weapon.id}
                          onClick={() => onCompleteOrder(weapon.id)}
                          className="p-3 bg-green-900/20 hover:bg-green-900/40 border border-green-600/30 rounded-md text-left transition-colors"
                        >
                          <div className="font-medium text-green-300">
                            {weapon.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            Атака: {weapon.attack} | Качество: {weapon.quality}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={onCancelWeaponSelect}
                    className="mt-2 w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md transition-colors"
                  >
                    Отмена
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {availableOrders.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-200">
            Доступные заказы ({availableOrders.length}/3)
          </h3>
          <div className="space-y-3">
            {availableOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onSelect={onAcceptOrder}
                isActive={false}
                canAccept
              />
            ))}
          </div>
        </div>
      )}

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
