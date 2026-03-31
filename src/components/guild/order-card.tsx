/**
 * Order Card Component
 * Карточка заказа NPC
 */

'use client'

import { motion } from 'framer-motion'
import { 
  Sword, 
  Coins, 
  CheckCircle, 
  AlertTriangle, 
  Package,
  ArrowRight,
  Star
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useGameStore } from '@/store'
import type { NPCOrder } from '@/data/market-data'
import { calculateGoldRewardRange } from '@/lib/store-utils/order-utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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

interface OrderCardProps {
  order: NPCOrder
  onSelect: () => void
  onCancel?: () => void
  isActive: boolean
  canAccept: boolean
}

export function OrderCard({ order, onSelect, onCancel, isActive, canAccept }: OrderCardProps) {
  const player = useGameStore((state) => state.player)
  const weaponInventory = useGameStore((state) => state.weaponInventory)
  
  const weaponTypeName = weaponTypeNames[order.weaponType] || order.weaponType
  const materialName = order.material ? materialNames[order.material] : ''
  const requiredWeapon = `${materialName} ${weaponTypeName}`.trim()
  
  // Рассчитываем диапазон награды (используем сохраненную стоимость материалов если есть)
  const rewardRange = calculateGoldRewardRange(
    order.minQuality,
    order.weaponType,
    order.material,
    player.level,
    order.materialCost // Передаем точную стоимость для расчета
  )
  
  const suitableWeapons = weaponInventory.weapons.filter(w => {
    if (w.type !== order.weaponType) return false
    if (w.quality < order.minQuality) return false
    if (order.minAttack && w.stats.attack < order.minAttack) return false
    if (order.material && w.recipeId && !w.recipeId.includes(order.material)) return false
    return true
  })
  
  return (
    <TooltipProvider>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <Card className={cn(
        'card-medieval transition-all',
        isActive && 'border-green-600/50 bg-green-900/20'
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-900/30 flex items-center justify-center text-2xl flex-shrink-0">
                {order.clientIcon}
              </div>
              <div>
                <h4 className="font-semibold text-stone-200">{order.clientName}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-stone-800/50">
                    {order.clientTitle}
                  </Badge>
                </div>
              </div>
            </div>
            {order.status === 'completed' && (
              <Badge className="bg-green-800 text-green-100">
                <CheckCircle className="w-3 h-3 mr-1" />
                Выполнен
              </Badge>
            )}
            {order.status === 'expired' && (
              <Badge className="bg-red-800 text-red-100">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Просрочен
              </Badge>
            )}
          </div>
          
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Sword className="w-4 h-4 text-amber-400" />
              <span className="text-stone-300">{requiredWeapon}</span>
              {order.minQuality > 0 && (
                <Badge variant="outline" className="text-xs text-amber-400 border-amber-600">
                  Качество {order.minQuality}+
                </Badge>
              )}
              {order.minAttack && (
                <Badge variant="outline" className="text-xs text-red-400 border-red-600">
                  Атака {order.minAttack}+
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-amber-400 cursor-help">
                    <Coins className="w-4 h-4" />
                    <span className="font-semibold">{rewardRange.min} - {rewardRange.max}</span>
                    <span className="text-xs text-stone-500">золота</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-amber-300">Награда зависит от качества оружия:</p>
                    <p>• Качество {order.minQuality}: {rewardRange.min} золота</p>
                    <p>• Качество 50: {rewardRange.current(50)} золота</p>
                    <p>• Качество 100: {rewardRange.max} золота</p>
                    <p className="text-stone-400 mt-1">Чем лучше меч — тем выше награда!</p>
                  </div>
                </TooltipContent>
              </Tooltip>
              {order.advanceTaken && order.advanceTaken > 0 && (
                <div className="flex items-center gap-1 text-blue-400 text-xs">
                  <span>💸 Взято авансом: {order.advanceTaken}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-purple-400">
                <Star className="w-4 h-4" />
                <span>{order.fameReward} славы</span>
              </div>
            </div>
            
            {order.bonusItems && order.bonusItems.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <Package className="w-3 h-3 text-green-400" />
                <span className="text-green-400">
                  +{order.bonusItems.map(b => `${b.amount} ${b.resource}`).join(', ')}
                </span>
              </div>
            )}

            {order.materialAdvance && (
              <div className="mt-2 p-3 bg-amber-900/20 border border-amber-600/30 rounded-md">
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-amber-300 text-sm">Аванс на материалы</div>
                    <div className="text-xs text-stone-300 mt-1">
                      У вас нет материалов для выполнения заказа. Клиент предоставит аванс,
                      который будет вычтен из награды ({order.materialAdvance.totalCost} золота).
                    </div>
                  </div>
                </div>
                <div className="text-xs text-stone-400">
                  Материалы: {order.materialAdvance.materials.map(m => `${m.amount} ${m.resource}`).join(', ')}
                </div>
              </div>
            )}
          </div>
          
          {order.status === 'in_progress' && (
            <div>
              {/* Информация об авансе */}
              {order.advanceTaken && order.advanceTaken > 0 && (
                <div className="mb-3 p-2 bg-blue-900/20 border border-blue-600/30 rounded-md">
                  <p className="text-xs text-blue-300">
                    💸 Взято авансом: <span className="font-semibold">{order.advanceTaken} золота</span>
                  </p>
                  <p className="text-xs text-stone-400 mt-1">
                    Чистая награда: <span className="font-semibold text-green-400">{order.goldReward - order.advanceTaken} золота</span>
                  </p>
                </div>
              )}

              {suitableWeapons.length > 0 && (
                <div className="mt-2 p-2 rounded bg-green-900/30 border border-green-600/30">
                  <p className="text-xs text-green-400 mb-2">
                    Найдено {suitableWeapons.length} подходящего оружия
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {suitableWeapons.map((weapon) => (
                      <button
                        key={weapon.id}
                        onClick={() => onSelect()}
                        className="p-3 bg-green-900/20 hover:bg-green-900/40 border border-green-600/30 rounded-md text-left transition-colors"
                      >
                        <div className="font-medium text-green-300">
                          {weapon.fullName}
                        </div>
                        <div className="text-xs text-gray-400">
                          Атака: {weapon.stats.attack} | Качество: {weapon.quality}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-2 p-3 bg-red-900/20 border border-red-600/30 rounded-md">
                <p className="text-xs text-red-400 mb-2">
                  Штраф за отмену: {Math.floor(order.goldReward * 0.1)} золота
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-600/50 text-red-300 hover:bg-red-900/20"
                    onClick={onCancel}
                  >
                    Отменить заказ
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {order.status === 'available' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-700 hover:to-amber-800 text-amber-100"
                disabled={!canAccept}
                onClick={onSelect}
              >
                Принять заказ
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
    </TooltipProvider>
  )
}
