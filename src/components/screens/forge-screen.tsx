/**
 * Forge Screen
 * Главный экран кузницы (контейнер)
 */

'use client'

import { Flame, Hammer, Package, Sparkles, Star, Wrench } from 'lucide-react'
import { useMemo, useEffect } from 'react'
import { getAvailableRecipes } from '@/data/recipes'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/store'
import { cn } from '@/lib/utils'

// Импорт компонентов
import { InventorySection, ActiveOrdersSection } from '@/components/forge'

// Импорт новой системы крафта v2
import { CraftContainerV2 } from '@/components/forge/craft-v2'

import { RepairSection } from '@/components/forge/repair-section'
import { ReforgeSection } from '@/components/forge/reforge-section'
import { AltarForgeSection } from '@/components/forge/altar-forge-section'

export function ForgeScreen() {
  // Используем индивидуальные селекторы
  const player = useGameStore((state) => state.player)
  const weapons = useGameStore((state) => state.weaponInventory.weapons)
  const repairBenchWeaponId = useGameStore((state) => state.repairBenchWeaponId)
  const setCurrentScreen = useGameStore((state) => state.setCurrentScreen)
  const forgeTabRequest = useGameStore((state) => state.forgeTabRequest)
  const clearForgeTabRequest = useGameStore((state) => state.clearForgeTabRequest)
  const mainTab = useGameStore((state) => state.forgeMainTab)
  const setForgeMainTab = useGameStore((state) => state.setForgeMainTab)
  const altarUnlockedByForgottenForgeQuest = useGameStore(
    (state) => state.altarUnlockedByForgottenForgeQuest
  )

  useEffect(() => {
    if (mainTab === 'altar' && !altarUnlockedByForgottenForgeQuest) {
      setForgeMainTab('craft')
    }
  }, [mainTab, altarUnlockedByForgottenForgeQuest, setForgeMainTab])

  useEffect(() => {
    if (!forgeTabRequest) return
    queueMicrotask(() => {
      clearForgeTabRequest()
    })
  }, [forgeTabRequest, clearForgeTabRequest])
  
  // Мемоизированные доступные рецепты
  const availableRecipes = useMemo(
    () => getAvailableRecipes(player.level, []),
    [player.level]
  )
  
  const weaponCount = weapons.filter((w) => w.id !== repairBenchWeaponId).length
  
  return (
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
            onClick={() => setForgeMainTab('craft')}
          >
            <Flame className="w-4 h-4 mr-2" />
            Крафт
          </Button>
          {altarUnlockedByForgottenForgeQuest ? (
            <Button
              type="button"
              variant="ghost"
              className={cn(
                'rounded-none border-b-2 transition-all whitespace-nowrap',
                mainTab === 'altar'
                  ? 'border-amber-500 text-amber-300 bg-amber-900/20'
                  : 'border-transparent text-stone-500 hover:text-stone-300'
              )}
              onClick={() => setForgeMainTab('altar')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Алтарь
            </Button>
          ) : null}
          <Button
            variant="ghost"
            className={cn(
              'rounded-none border-b-2 transition-all whitespace-nowrap',
              mainTab === 'inventory' 
                ? 'border-amber-500 text-amber-300 bg-amber-900/20' 
                : 'border-transparent text-stone-500 hover:text-stone-300'
            )}
            onClick={() => setForgeMainTab('inventory')}
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
              mainTab === 'repair'
                ? 'border-amber-500 text-amber-300 bg-amber-900/20'
                : 'border-transparent text-stone-500 hover:text-stone-300'
            )}
            onClick={() => setForgeMainTab('repair')}
          >
            <Wrench className="w-4 h-4 mr-2" />
            Ремонт
            {repairBenchWeaponId != null && (
              <Badge className="ml-2 bg-amber-800 text-amber-100 text-xs">1</Badge>
            )}
          </Button>
          <Button
            type="button"
            data-tutorial="reforge-tab"
            variant="ghost"
            className={cn(
              'rounded-none border-b-2 transition-all whitespace-nowrap',
              mainTab === 'reforge'
                ? 'border-amber-500 text-amber-300 bg-amber-900/20'
                : 'border-transparent text-stone-500 hover:text-stone-300'
            )}
            onClick={() => setForgeMainTab('reforge')}
          >
            <Hammer className="w-4 h-4 mr-2" />
            Перековка
            {repairBenchWeaponId != null && (
              <Badge className="ml-2 bg-amber-800 text-amber-100 text-xs">1</Badge>
            )}
          </Button>
        </div>
        
        {/* Контент вкладок */}
        {mainTab === 'inventory' ? (
          <InventorySection />
        ) : mainTab === 'repair' ? (
          <RepairSection />
        ) : mainTab === 'reforge' ? (
          <ReforgeSection />
        ) : mainTab === 'altar' ? (
          <AltarForgeSection />
        ) : mainTab === 'craft' ? (
          <div className="space-y-6">
            <CraftContainerV2 playerLevel={player.level} forgeLevel={1} />
          </div>
        ) : null}
      </div>
  )
}
