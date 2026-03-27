/**
 * Reputation Notification Component
 * Всплывающее уведомление о получении репутации
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, TrendingUp, Crown, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

interface ReputationNotificationProps {
  amount: number
  source: 'craft' | 'expedition' | 'dungeon'
  onClose: () => void
}

function ReputationNotification({ amount, source, onClose }: ReputationNotificationProps) {
  const getSourceText = () => {
    switch (source) {
      case 'craft':
        return 'Заказ на крафт'
      case 'expedition':
        return 'Экспедиция'
      case 'dungeon':
        return 'Подземелье'
      default:
        return 'Деятельность'
    }
  }

  const getSourceIcon = () => {
    switch (source) {
      case 'craft':
        return <Trophy className="w-5 h-5 text-amber-400" />
      case 'expedition':
        return <TrendingUp className="w-5 h-5 text-green-400" />
      case 'dungeon':
        return <Crown className="w-5 h-5 text-purple-400" />
      default:
        return <Trophy className="w-5 h-5 text-amber-400" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-4 right-4 z-50 max-w-sm"
    >
      <Card className="bg-gradient-to-r from-amber-900/80 to-yellow-900/80 border-amber-500/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              {getSourceIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="font-semibold text-amber-200 text-sm">
                  {getSourceText()}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-white"
                  onClick={onClose}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-amber-100 font-bold text-lg">
                +{amount} репутации
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function ReputationNotificationContainer() {
  const [notifications, setNotifications] = useState<Array<{
    id: number
    amount: number
    source: 'craft' | 'expedition' | 'dungeon'
  }>>([])

  const addNotification = (amount: number, source: 'craft' | 'expedition' | 'dungeon') => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, amount, source }])
    
    // Автоматически скрываем через 4 секунды
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 4000)
  }

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Слушаем события репутации через custom event
  useEffect(() => {
    const handleReputationGained = (event: Event) => {
      const customEvent = event as CustomEvent<{ amount: number; source: 'craft' | 'expedition' | 'dungeon' }>
      addNotification(customEvent.detail.amount, customEvent.detail.source)
    }

    window.addEventListener('reputation-gained', handleReputationGained as EventListener)

    return () => {
      window.removeEventListener('reputation-gained', handleReputationGained as EventListener)
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence mode="popLayout">
        {notifications.map(notification => (
          <motion.div
            key={notification.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          >
            <ReputationNotification
              amount={notification.amount}
              source={notification.source}
              onClose={() => removeNotification(notification.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Хелпер для отправки уведомлений
export function showReputationNotification(amount: number, source: 'craft' | 'expedition' | 'dungeon') {
  const event = new CustomEvent('reputation-gained', {
    detail: { amount, source }
  })
  window.dispatchEvent(event)
}
