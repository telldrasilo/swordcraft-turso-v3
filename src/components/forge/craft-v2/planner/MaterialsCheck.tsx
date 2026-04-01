/**
 * Materials Check Component
 * Проверка наличия материалов для крафта
 */

'use client'

import React from 'react'
import { Package, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Resources } from '@/store/slices/resources-slice'
import type { WeaponRecipe } from '@/types/craft-v2'
import { 
  checkInventoryForCraft, 
  type MaterialToBuy,
} from '@/lib/craft/inventory-check'

interface MaterialsCheckProps {
  inventory: Resources
  selectedMaterials: Record<string, string>
  recipe: WeaponRecipe | null
  gold: number
  onBuyMaterials?: (materials: MaterialToBuy[], totalCost: number) => void
  shouldPurchaseMaterials?: boolean // Включена ли галочка закупки
  onTogglePurchaseMaterials?: (checked: boolean) => void // Обработчик изменения галочки
  activeOrderId?: string | null // ID активного заказа
  activeOrder?: {
    goldReward: number
    advanceTaken?: number
  } | null // Данные активного заказа для расчёта аванса
  shouldTakeAdvance?: boolean // Включена ли галочка аванса
  onToggleTakeAdvance?: (checked: boolean) => void // Обработчик изменения галочки аванса
}

export function MaterialsCheck({
  inventory,
  selectedMaterials,
  recipe,
  gold,
  onBuyMaterials: _onBuyMaterials,
  shouldPurchaseMaterials = false,
  onTogglePurchaseMaterials,
  activeOrderId = null,
  activeOrder = null,
  shouldTakeAdvance = false,
  onToggleTakeAdvance,
}: MaterialsCheckProps) {
  if (!recipe) return null
  
  // Преобразуем выбранные материалы в формат для проверки
  const materialAssignment: Record<string, { materialId: string; quantity: number }> = {}
  recipe.parts.forEach(part => {
    const materialId = selectedMaterials[part.id]
    if (materialId) {
      materialAssignment[part.id] = {
        materialId,
        quantity: part.minQuantity,
      }
    }
  })
  
  // Используем систему проверки
  const checkResult = checkInventoryForCraft(recipe, materialAssignment, inventory)
  
  if (checkResult.requirements.length === 0) return null
  
  const canAffordPurchase = gold >= checkResult.totalPurchaseCost
  
  return (
    <Card className={cn(
      "bg-stone-900/50 border-stone-700",
      !checkResult.canCraft && "border-red-500/50"
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Package className={cn(
            "w-4 h-4",
            checkResult.canCraft ? "text-green-400" : "text-red-400"
          )} />
          Материалы
          {!checkResult.canCraft && (
            <Badge variant="destructive" className="ml-auto">
              Не хватает
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Общая потребность в сырье */}
        <div className="space-y-1">
          <p className="text-xs text-stone-500 uppercase tracking-wide">Требуется сырья:</p>
          {checkResult.requirements.map(req => (
            <div key={req.resourceKey} className="flex items-center justify-between text-sm">
              <span className="text-stone-400">{req.resourceName}</span>
              <span className={cn(
                "font-mono",
                req.sufficient ? "text-green-400" : "text-red-400"
              )}>
                {req.available}/{req.quantity}
                {!req.sufficient && ' ❌'}
              </span>
            </div>
          ))}
        </div>
        
        {/* Топливо */}
        {checkResult.fuelRequired && (
          <div className="flex items-center justify-between text-sm pt-2 border-t border-stone-700">
            <span className="text-stone-400">Уголь (топливо)</span>
            <span className={cn(
              "font-mono",
              checkResult.fuelRequired.sufficient ? "text-green-400" : "text-red-400"
            )}>
              {checkResult.fuelRequired.available}/{checkResult.fuelRequired.quantity}
              {!checkResult.fuelRequired.sufficient && ' ❌'}
            </span>
          </div>
        )}
        
        {/* Детализация по частям */}
        <details className="text-sm">
          <summary className="cursor-pointer text-stone-500 hover:text-stone-400 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Детализация по частям
          </summary>
          <div className="mt-2 pl-4 space-y-2 border-l-2 border-stone-700">
            {checkResult.breakdownByPart.map(part => (
              <div key={part.partId}>
                <p className="text-stone-300 font-medium">
                  {part.partName}: <span className="text-amber-400">{part.materialName}</span>
                </p>
                {part.requirements.map((req, i) => (
                  <p key={i} className="text-xs text-stone-500 pl-2">
                    → {req.resourceName}: {req.quantity} ед.
                  </p>
                ))}
              </div>
            ))}
          </div>
        </details>
        
        {/* Галочка и информация о закупке */}
        {!checkResult.canCraft && checkResult.canPurchaseMissing && onTogglePurchaseMaterials && (
          <div className="pt-3 border-t border-stone-700 space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={shouldPurchaseMaterials}
                onChange={(e) => onTogglePurchaseMaterials(e.target.checked)}
                className="w-5 h-5 rounded border-stone-600 bg-stone-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-stone-200">
                  Закупить недостающие материалы
                </p>
                <p className="text-xs text-stone-500">
                  {!canAffordPurchase ? (
                    <span className="text-red-400">
                      ⚠️ Недостаточно золота (нужно {checkResult.totalPurchaseCost}, есть {gold})
                    </span>
                  ) : (
                    <span className="text-amber-400">
                      💰 Стоимость: {checkResult.totalPurchaseCost}
                    </span>
                  )}
                </p>
              </div>
            </label>
            {shouldPurchaseMaterials && (
              <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-3">
                <p className="text-xs text-stone-400 mb-2">К покупке:</p>
                {checkResult.materialsToBuy.map(mat => (
                  <div key={mat.resourceKey} className="flex justify-between text-sm">
                    <span className="text-stone-300">{mat.resourceName} ×{mat.quantity}</span>
                    <span className="text-amber-400 font-mono">{mat.totalPrice} 💰</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Галочка аванса на закупку материалов */}
        {!checkResult.canCraft &&
         checkResult.canPurchaseMissing &&
         activeOrderId &&
         activeOrder &&
         gold < checkResult.totalPurchaseCost &&
         checkResult.materialsToBuy.every(m => m.canBuy) &&
         onToggleTakeAdvance && (
          <div className="pt-3 border-t border-stone-700">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={shouldTakeAdvance}
                onChange={(e) => onToggleTakeAdvance(e.target.checked)}
                className="w-5 h-5 rounded border-stone-600 bg-stone-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-stone-200">
                  💰 Взять аванс на закупку материалов
                </p>
                <p className="text-xs text-stone-500">
                  {(() => {
                    const maxAdvance = Math.min(
                      Math.floor(activeOrder.goldReward * 0.5),
                      checkResult.totalPurchaseCost
                    )
                    const alreadyTaken = activeOrder.advanceTaken || 0
                    const availableAdvance = Math.max(0, maxAdvance - alreadyTaken)

                    if (availableAdvance <= 0) {
                      return <span className="text-red-400">⚠️ Аванс уже взят</span>
                    }

                    return (
                      <span className="text-blue-400">
                        Доступно: {availableAdvance} (50% от награды)
                      </span>
                    )
                  })()}
                </p>
              </div>
            </label>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
