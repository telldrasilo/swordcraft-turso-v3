/**
 * Orders Section Container
 * Подключает OrdersSection к store и обрабатывает бизнес-логику
 */

'use client'

import { useState, useEffect } from 'react'
import { useGameStore } from '@/store'
import OrdersSection from '../presentation/OrdersSection'

export function OrdersSectionContainer() {
  // Store selectors
  const player = useGameStore((state) => state.player)
  const orders = useGameStore((state) => state.orders)
  const activeOrderId = useGameStore((state) => state.activeOrderId)
  const generateOrder = useGameStore((state) => state.generateOrder)
  const acceptOrder = useGameStore((state) => state.acceptOrder)
  const completeOrder = useGameStore((state) => state.completeOrder)
  const expireOrder = useGameStore((state) => state.expireOrder)
  const weaponInventory = useGameStore((state) => state.weaponInventory)

  // Local state
  const [showWeaponSelect, setShowWeaponSelect] = useState<string | null>(null)

  // Эффект: проверка истечения сроков заказов
  useEffect(() => {
    orders.forEach((order) => {
      if (order.status === 'in_progress' && order.acceptedAt) {
        const deadline = order.acceptedAt + order.deadline * 1000
        if (Date.now() > deadline) {
          expireOrder(order.id)
        }
      }
    })
  }, [orders, expireOrder])

  // Эффект: генерация новых заказов
  useEffect(() => {
    const availableOrdersCount = orders.filter((o) => o.status === 'available').length
    if (availableOrdersCount < 3) {
      import('@/data/market-data').then(({ npcOrders }) => {
        const availableOrders = npcOrders.filter(
          (o) => o.requiredLevel <= player.level && o.requiredFame <= player.fame
        )
        const numOrders = Math.min(
          3 - availableOrdersCount,
          availableOrders.length
        )
        for (let i = 0; i < numOrders; i++) {
          generateOrder()
        }
      })
    }
  }, [player.level, player.fame, orders.length, generateOrder])

  // Вычисленные значения
  const availableOrders = orders.filter((o) => o.status === 'available')
  const activeOrder = orders.find((o) => o.id === activeOrderId)
  const completedOrders = orders.filter((o) => o.status === 'completed')
  const expiredOrders = orders.filter((o) => o.status === 'expired')

  const suitableWeapons = showWeaponSelect
    ? weaponInventory.weapons.filter((w) => {
        const order = orders.find((o) => o.id === showWeaponSelect)
        if (!order || order.status !== 'in_progress') return false
        if (w.type !== order.weaponType) return false
        if (w.quality < order.minQuality) return false
        if (order.minAttack && w.attack < order.minAttack) return false
        if (order.material && w.recipeId && !w.recipeId.includes(order.material))
          return false
        return true
      })
    : []

  // Обработчики событий
  const handleAcceptOrder = (orderId: string) => {
    acceptOrder(orderId)
  }

  const handleCompleteOrder = (weaponId: string) => {
    if (showWeaponSelect) {
      completeOrder(showWeaponSelect, weaponId)
      setShowWeaponSelect(null)
    }
  }

  const handleCancelWeaponSelect = () => {
    setShowWeaponSelect(null)
  }

  return (
    <OrdersSection
      activeOrder={activeOrder}
      availableOrders={availableOrders}
      completedOrders={completedOrders}
      expiredOrders={expiredOrders}
      showWeaponSelect={showWeaponSelect}
      suitableWeapons={suitableWeapons}
      onAcceptOrder={handleAcceptOrder}
      onCompleteOrder={handleCompleteOrder}
      onCancelWeaponSelect={handleCancelWeaponSelect}
      onShowWeaponSelect={setShowWeaponSelect}
    />
  )
}
