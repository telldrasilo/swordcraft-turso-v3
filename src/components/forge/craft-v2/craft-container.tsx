/**
 * Craft Container V2
 * Главный контейнер для системы крафта v2
 * Обновлён: передаёт знания и цены материалов в CraftPlanner
 * 
 * @see docs/CRAFT_SYSTEM_CONCEPT.md
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { 
  Hammer, ArrowLeft,
  HelpCircle, Sparkles
} from 'lucide-react'

import { useCraftV2 } from '@/hooks/use-craft-v2'
import { useGameStore } from '@/store/game-store-composed'
import { CraftPlanner } from './craft-planner'
import { CraftProgress } from './craft-progress'
import { CraftResult } from './craft-result'
import type { MaterialToBuy } from '@/lib/craft/inventory-check'
import { getRecipeById } from '@/data/recipes'
import { getCraftingCost, checkInventoryForCraft } from '@/lib/craft/inventory-check'
import { getMaterialPrice } from '@/data/material-shop'
import type { ResourceKey } from '@/types/resources'

// ================================
// КОНСТАНТЫ
// ================================

// Базовые доступные материалы для начала игры
const DEFAULT_AVAILABLE_MATERIALS = [
  'iron',        // Железо
  'steel',       // Сталь
  'birch',       // Берёза
  'oak',         // Дуб
  'raw_leather', // Сырая кожа
  'tanned_leather', // Выделанная кожа
]

const DEFAULT_UNLOCKED_TECHNIQUES = [
  'basic_forging',
  'balanced_design',
]

const DEFAULT_UNLOCKED_RECIPES = [
  'basic_sword',
  'basic_dagger',
  'basic_axe',
]

// ================================
// КОМПОНЕНТ СПРАВКИ
// ================================

function CraftHelpInfo() {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <Card className="bg-blue-900/20 border-blue-600/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-blue-900/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-400" />
          <span className="font-medium text-blue-200">Как работает крафт</span>
        </div>
        <span className="text-xs text-blue-400">
          {expanded ? 'Свернуть' : 'Подробнее'}
        </span>
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <CardContent className="p-4 pt-0 text-sm text-stone-300 space-y-2">
              <p><strong>1. Выберите рецепт</strong> — схему оружия, которое хотите создать.</p>
              <p><strong>2. Выберите материалы</strong> — для каждой части можно использовать разные материалы.</p>
              <p><strong>3. Выберите техники</strong> — особые приёмы, влияющие на процесс и результат.</p>
              <p><strong>4. Запустите крафт</strong> — и наблюдайте за процессом создания!</p>
              <p className="text-amber-400 mt-3">
                💡 Чем лучше материалы и выше навык кузнеца — тем качественнее результат!
              </p>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

// ================================
// ОСНОВНОЙ КОМПОНЕНТ
// ================================

interface CraftContainerV2Props {
  playerLevel?: number
  forgeLevel?: number
  availableMaterials?: string[]
  unlockedRecipes?: string[]
  unlockedTechniques?: string[]
  onWeaponCreated?: (weapon: {
    id: string
    fullName: string
    quality: number
    qualityGrade: string
    attack: number
    sellPrice: number
  }) => void
  onBack?: () => void
}

export function CraftContainerV2({
  playerLevel = 1,
  forgeLevel = 1,
  availableMaterials = DEFAULT_AVAILABLE_MATERIALS,
  unlockedRecipes = DEFAULT_UNLOCKED_RECIPES,
  unlockedTechniques = DEFAULT_UNLOCKED_TECHNIQUES,
  onWeaponCreated,
  onBack,
}: CraftContainerV2Props) {
  // Получаем инвентарь из store
  const inventory = useGameStore(state => state.resources)
  const gold = useGameStore(state => state.resources.gold)
  const spendResources = useGameStore(state => state.spendResources)
  const spendResource = useGameStore(state => state.spendResource)
  const addResource = useGameStore(state => state.addResource)
  const addWeaponV2 = useGameStore(state => state.addWeaponV2)
  const addExperience = useGameStore(state => state.addExperience)

  // Получаем активный заказ
  const activeOrderId = useGameStore(state => state.activeOrderId)
  const activeOrder = useGameStore(state => state.orders.find(o => o.id === activeOrderId))

  // Получаем функцию взятия аванса
  const takeAdvance = useGameStore(state => state.takeAdvance)
  
  // Получаем знания о материалах из энциклопедии
  const materialKnowledge = useGameStore(state => state.materialKnowledge)
  
  // Получаем функцию установки галочки закупки
  const setShouldPurchaseMaterials = useGameStore(state => state.setShouldPurchaseMaterials)
  
  const {
    state,
    setRecipe,
    setMaterial,
    setTechniques,
    calculatePreview,
    startCraft,
    cancelCraft,
    instantComplete,
    collectWeapon,
    reset,
  } = useCraftV2(playerLevel, forgeLevel)
  
  // Обработчик запуска крафта
  const handleStartCraft = useCallback((plan: {
    recipeId: string
    materials: Record<string, { materialId: string; quantity: number }>
    techniques: string[]
    shouldPurchaseMaterials?: boolean
    shouldTakeAdvance?: boolean
  }) => {
    // Получаем рецепт
    const recipe = getRecipeById(plan.recipeId)
    if (!recipe) return

    // Устанавливаем галочку закупки перед запуском
    if (plan.shouldPurchaseMaterials) {
      setShouldPurchaseMaterials(true)
    }

    // Если нужно купить материалы и взять аванс
    if (plan.shouldTakeAdvance && plan.shouldPurchaseMaterials && activeOrder) {
      // Рассчитываем стоимость материалов для закупки
      const materialAssignment: Record<string, { materialId: string; quantity: number }> = {}
      Object.entries(plan.materials).forEach(([partId, { materialId, quantity }]) => {
        materialAssignment[partId] = { materialId, quantity }
      })

      const checkResult = checkInventoryForCraft(recipe, materialAssignment, inventory)

      if (checkResult.canPurchaseMissing && checkResult.materialsToBuy.length > 0) {
        const totalCost = checkResult.totalPurchaseCost

        // Берём аванс (максимум 50% от награды или сколько нужно для закупки)
        const advanceAmount = Math.min(totalCost, Math.floor(activeOrder.goldReward * 0.5))
        const advanceResult = takeAdvance(activeOrder.id, advanceAmount)

        if (advanceResult.success && advanceResult.taken > 0) {
          console.warn(`Взят аванс: ${advanceResult.taken} золота`)
        }
      }
    }

    // Если нужно купить материалы
    if (plan.shouldPurchaseMaterials) {
      // Преобразуем выбранные материалы в формат для проверки
      const materialAssignment: Record<string, { materialId: string; quantity: number }> = {}
      Object.entries(plan.materials).forEach(([partId, { materialId, quantity }]) => {
        materialAssignment[partId] = { materialId, quantity }
      })

      // Проверяем инвентарь
      const checkResult = checkInventoryForCraft(recipe, materialAssignment, inventory)

      // Покупаем недостающие материалы
      if (checkResult.canPurchaseMissing && checkResult.materialsToBuy.length > 0) {
        const totalCost = checkResult.totalPurchaseCost

        // Получаем актуальное количество золота из store (после взятия аванса)
        const state = useGameStore.getState()
        const currentGold = state.resources.gold

        if (currentGold >= totalCost) {
          spendResource('gold', totalCost)
          checkResult.materialsToBuy.forEach(mat => {
            addResource(mat.resourceKey, mat.quantity)
          })
          console.warn(`Куплено материалов на ${totalCost} золота`)
        } else {
          console.warn(`Недостаточно золота для закупки: нужно ${totalCost}, есть ${currentGold}`)
        }
      }
    }

    // Рассчитываем стоимость материалов
    const cost = getCraftingCost(recipe, plan.materials)

    // Списываем материалы
    const spent = spendResources(cost)
    if (!spent) {
      console.error('Не удалось списать материалы')
      return
    }

    // Устанавливаем план
    setRecipe(plan.recipeId)

    Object.entries(plan.materials).forEach(([partId, { materialId, quantity }]) => {
      setMaterial(partId, materialId, quantity)
    })

    setTechniques(plan.techniques)

    // Рассчитываем превью
    setTimeout(() => {
      calculatePreview()
      // Запускаем крафт
      startCraft()
    }, 100)
  }, [setRecipe, setMaterial, setTechniques, calculatePreview, startCraft, spendResources, spendResource, addResource, inventory, setShouldPurchaseMaterials, activeOrder, takeAdvance])
  
  // Обработчик получения оружия
  const handleCollectWeapon = useCallback(() => {
    if (state.completedWeapon) {
      // Добавляем оружие в инвентарь (новый формат v2)
      addWeaponV2(state.completedWeapon)
      
      // Начисляем опыт кузнецу
      const expGain = Math.floor(state.completedWeapon.quality / 5) + 5
      addExperience(expGain)
      
      if (onWeaponCreated) {
        onWeaponCreated({
          id: state.completedWeapon.id,
          fullName: state.completedWeapon.fullName,
          quality: state.completedWeapon.quality,
          qualityGrade: state.completedWeapon.qualityGrade,
          attack: state.completedWeapon.stats.attack,
          sellPrice: state.completedWeapon.sellPrice,
        })
      }
    }
    
    collectWeapon()
    reset()
  }, [state.completedWeapon, collectWeapon, reset, onWeaponCreated, addWeaponV2, addExperience])
  
  // Обработчик продолжения крафта
  const handleContinue = useCallback(() => {
    reset()
  }, [reset])
  
  // Подготовить цены материалов для Popover
  const materialPrices = useMemo(() => {
    // Создаём объект цен для всех доступных материалов
    const prices: Record<string, number> = {}
    
    for (const materialId of availableMaterials) {
      prices[materialId] = getMaterialPrice(materialId as ResourceKey, 1, 1.1)
    }
    
    return prices
  }, [availableMaterials])
  
  // Обработчик покупки материалов
  const handleBuyMaterials = useCallback((materials: MaterialToBuy[], totalCost: number) => {
    // Проверяем, хватает ли золота
    if (gold < totalCost) return
    
    // Списываем золото
    spendResource('gold', totalCost)
    
    // Добавляем материалы в инвентарь
    materials.forEach(mat => {
      addResource(mat.resourceKey, mat.quantity)
    })
    
    console.warn(`Куплено материалов на ${totalCost} золота`)
  }, [gold, spendResource, addResource])
  
  // Рендер по состоянию
  const renderContent = () => {
    switch (state.stage) {
      case 'planning':
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Справка */}
            <CraftHelpInfo />
            
            {/* Планировщик */}
            <CraftPlanner
              playerLevel={playerLevel}
              inventory={inventory}
              gold={gold}
              availableMaterials={availableMaterials}
              unlockedRecipes={unlockedRecipes}
              unlockedTechniques={unlockedTechniques}
              materialKnowledge={materialKnowledge}
              materialPrices={materialPrices}
              activeOrderId={activeOrderId}
              activeOrder={activeOrder ? {
                goldReward: activeOrder.goldReward,
                advanceTaken: activeOrder.advanceTaken,
              } : null}
              onStartCraft={handleStartCraft}
              onBuyMaterials={handleBuyMaterials}
            />
          </motion.div>
        )
        
      case 'crafting':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Заголовок */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-stone-200 flex items-center gap-2">
                <Hammer className="w-5 h-5 text-amber-400 animate-pulse" />
                Крафт в процессе
              </h2>
              {onBack && (
                <Button variant="ghost" size="sm" onClick={cancelCraft}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Отмена
                </Button>
              )}
            </div>
            
            {/* Прогресс */}
            {state.activeCraft && (
              <CraftProgress
                activeCraft={state.activeCraft}
                onCancel={cancelCraft}
                onInstantComplete={instantComplete}
              />
            )}
          </motion.div>
        )
        
      case 'completed':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Заголовок */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-green-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Оружие готово!
              </h2>
            </div>
            
            {/* Результат */}
            {state.completedWeapon && (
              <CraftResult
                weapon={state.completedWeapon}
                onCollect={handleCollectWeapon}
                onContinue={handleContinue}
              />
            )}
          </motion.div>
        )
        
      default:
        return null
    }
  }
  
  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  )
}

export default CraftContainerV2
