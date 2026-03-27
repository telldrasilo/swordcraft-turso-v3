/**
 * Forge Screen
 * Главный экран кузницы (контейнер)
 */

'use client'

import { Flame, Package, ShoppingBag, Star } from 'lucide-react'
import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useGameStore } from '@/store'
import { cn } from '@/lib/utils'

// Импорт компонентов
import {
  InventorySection,
  ShopSection,
  ActiveOrdersSection,
} from '@/components/forge'

// Импорт новой системы крафта v2
import { CraftContainerV2 } from '@/components/forge/craft-v2'

// Импорт заглушки ремонта
import { RepairStub } from '@/components/forge/repair-stub'

// Типы вкладок
type MainTab = 'craft' | 'inventory' | 'shop'

export function ForgeScreen() {
  // Используем индивидуальные селекторы
  const player = useGameStore((state) => state.player)
  const weapons = useGameStore((state) => state.weaponInventory.weapons)
  const setCurrentScreen = useGameStore((state) => state.setCurrentScreen)
  
  const [mainTab, setMainTab] = useState<MainTab>('craft')
  
  // Мемоизированные доступные рецепты
  const availableRecipes = useMemo(() => {
    // Получаем рецепты из v2 системы
    const { getAvailableRecipes } = require('@/data/recipes')
    return getAvailableRecipes(player.level, [])
  }, [player.level])
  
  // Количество оружия
  const weaponCount = weapons.length
  
  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 space-y-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-amber-200 flex items-center gap-2">
              <Flame className="w-6 h-6 text-amber-500" />
              Кузница
            </h2>
            <p className="text-stone-500 text-sm">Создавайте легендарное оружие</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-amber-900/30 border-amber-600/50 text-amber-200">
              <Star className="w-3 h-3 mr-1" />
              {availableRecipes.length} рецептов
            </Badge>
            <Badge variant="outline" className="bg-stone-800/50 border-stone-600 text-stone-300">
              <Package className="w-3 h-3 mr-1" />
              {weaponCount} в инвентаре
            </Badge>
          </div>
        </div>
        
        {/* Активный заказ */}
        <ActiveOrdersSection onShowDetails={() => setCurrentScreen('guild')} />

        {/* Основные вкладки */}
        <div className="flex gap-2 border-b border-stone-700 pb-2 overflow-x-auto">
          <Button
            variant="ghost"
            className={cn(
              'rounded-none border-b-2 transition-all whitespace-nowrap',
              mainTab === 'craft' 
                ? 'border-amber-500 text-amber-300 bg-amber-900/20' 
                : 'border-transparent text-stone-500 hover:text-stone-300'
            )}
            onClick={() => setMainTab('craft')}
          >
            <Flame className="w-4 h-4 mr-2" />
            Крафт
          </Button>
          <Button
            variant="ghost"
            className={cn(
              'rounded-none border-b-2 transition-all whitespace-nowrap',
              mainTab === 'inventory' 
                ? 'border-amber-500 text-amber-300 bg-amber-900/20' 
                : 'border-transparent text-stone-500 hover:text-stone-300'
            )}
            onClick={() => setMainTab('inventory')}
          >
            <Package className="w-4 h-4 mr-2" />
            Инвентарь
            {weaponCount > 0 && (
              <Badge className="ml-2 bg-amber-800 text-amber-100 text-xs">
                {weaponCount}
              </Badge>
            )}
          </Button>
          <Button
            variant="ghost"
            className={cn(
              'rounded-none border-b-2 transition-all whitespace-nowrap',
              mainTab === 'shop' 
                ? 'border-amber-500 text-amber-300 bg-amber-900/20' 
                : 'border-transparent text-stone-500 hover:text-stone-300'
            )}
            onClick={() => setMainTab('shop')}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Магазин
          </Button>
        </div>
        
        {/* Контент вкладок */}
        {mainTab === 'inventory' ? (
          <InventorySection />
        ) : mainTab === 'shop' ? (
          <ShopSection />
        ) : mainTab === 'craft' ? (
          <div className="space-y-6">
            {/* Система крафта v2 */}
            <CraftContainerV2
              playerLevel={player.level}
              forgeLevel={1}
              onWeaponCreated={(weapon) => {
                console.log('Weapon created:', weapon)
                // Интегрировано с game-store
              }}
            />
            
            {/* Заглушка ремонта */}
            <RepairStub />
          </div>
        ) : null}
      </div>
    </TooltipProvider>
  )
}
