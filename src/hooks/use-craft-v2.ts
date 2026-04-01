/**
 * Хук для системы крафта v2
 * Управление состоянием крафта с этапами
 * Состояние синхронизируется с Zustand store для персистентности
 * 
 * @see docs/CRAFT_SYSTEM_CONCEPT.md
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type { 
  ActiveCraftV2, 
  CraftPlan, 
  CraftedWeaponV2,
  MaterialAssignment 
} from '@/types/craft-v2'
import { 
  generateCraftStages, 
  createCraftPlan 
} from '@/lib/craft/process-generator'
import { 
  calculateWeapon, 
  type WeaponCalculationResult 
} from '@/lib/craft/calculator'
import { 
  generateWeaponName, 
  type WeaponNameResult 
} from '@/lib/craft/name-generator'
import { getRecipeById } from '@/data/recipes'
import { getMaterialAsLegacy } from '@/data/materials'
import { getTechniqueById } from '@/data/techniques'
import { useGameStore } from '@/store/game-store-composed'
import { getQualityRank } from '@/types/craft-v2'

// ================================
// ТИПЫ
// ================================

export interface CraftV2State {
  /** Текущий план крафта */
  plan: CraftPlan | null
  
  /** Активный процесс */
  activeCraft: ActiveCraftV2 | null
  
  /** Готовое оружие */
  completedWeapon: CraftedWeaponV2 | null
  
  /** Предварительный расчёт */
  preview: WeaponCalculationResult | null
  
  /** Имя оружия */
  weaponName: WeaponNameResult | null
  
  /** Стадия UI */
  stage: 'planning' | 'crafting' | 'completed'
  
  /** Нужно ли закупать материалы */
  shouldPurchaseMaterials: boolean
}

export interface UseCraftV2Return {
  // State
  state: CraftV2State
  
  // Planning actions
  setRecipe: (recipeId: string) => void
  setMaterial: (partId: string, materialId: string, quantity: number) => void
  setTechniques: (techniqueIds: string[]) => void
  calculatePreview: () => void
  
  // Craft actions
  startCraft: () => void
  setShouldPurchaseMaterials: (should: boolean) => void  // Добавил для галочки закупки
  cancelCraft: () => void
  instantComplete: () => void  // Тестовая функция мгновенного завершения
  
  // Result actions
  collectWeapon: () => CraftedWeaponV2 | null
  reset: () => void
}

// ================================
// НАЧАЛЬНОЕ СОСТОЯНИЕ
// ================================

const initialState: CraftV2State = {
  plan: null,
  activeCraft: null,
  completedWeapon: null,
  preview: null,
  weaponName: null,
  stage: 'planning',
  shouldPurchaseMaterials: false,
}

function getRestoredState(): CraftV2State {
  const persisted = useGameStore.getState().craftV2Persisted
  if (!persisted || (!persisted.activeCraft && !persisted.completedWeapon)) {
    return initialState
  }
  return {
    plan: persisted.plan || null,
    activeCraft: persisted.activeCraft || null,
    completedWeapon: persisted.completedWeapon || null,
    preview: persisted.preview || null,
    weaponName: persisted.weaponName || null,
    stage: persisted.stage || 'planning',
    shouldPurchaseMaterials: useGameStore.getState().shouldPurchaseMaterials ?? false,
  }
}

// ================================
// ХУК
// ================================

export function useCraftV2(
  blacksmithLevel: number = 1,
  forgeLevel: number = 1
): UseCraftV2Return {
  const [state, setStateRaw] = useState<CraftV2State>(() => getRestoredState())
  const setCraftV2Persisted = useGameStore(s => s.setCraftV2Persisted)
  
  const setState = useCallback((updater: CraftV2State | ((prev: CraftV2State) => CraftV2State)) => {
    setStateRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      return next
    })
  }, [])

  // Принудительная синхронизация перед закрытием страницы
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  })
  useEffect(() => {
    const handleBeforeUnload = () => {
      const s = stateRef.current
      useGameStore.getState().setCraftV2Persisted({
        activeCraft: s.activeCraft,
        plan: s.plan,
        completedWeapon: s.completedWeapon,
        stage: s.stage,
        preview: s.preview,
        weaponName: s.weaponName,
      })
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Синхронизация состояния в Zustand при изменении stage или completedWeapon
  // НЕ синхронизируем activeCraft каждые 100мс (это вызвало бы лишние ре-рендеры)
  // Вместо этого синхронизируем только при смене стадии
  const prevStageRef = useRef(state.stage)
  useEffect(() => {
    const stageChanged = prevStageRef.current !== state.stage
    prevStageRef.current = state.stage

    if (stageChanged || !state.activeCraft) {
      setCraftV2Persisted({
        activeCraft: state.activeCraft,
        plan: state.plan,
        completedWeapon: state.completedWeapon,
        stage: state.stage,
        preview: state.preview,
        weaponName: state.weaponName,
      })
    }
  }, [state.stage, state.completedWeapon, state.activeCraft, state.plan, state.preview, state.weaponName, setCraftV2Persisted])

  // Refs для отложенных обновлений
  const materialsRef = useRef<MaterialAssignment>(
    state.plan?.materials || {}
  )
  const techniquesRef = useRef<string[]>(
    state.plan?.techniques || []
  )
  const recipeIdRef = useRef<string | null>(
    state.plan?.recipeId || null
  )
  
  // ================================
  // PLANNING ACTIONS
  // ================================
  
  const setRecipe = useCallback((recipeId: string) => {
    recipeIdRef.current = recipeId
    materialsRef.current = {}
    techniquesRef.current = []
    
    const recipe = getRecipeById(recipeId)
    if (!recipe) {
      setState(prev => ({ ...prev, plan: null, preview: null, weaponName: null }))
      return
    }
    
    const emptyPlan: CraftPlan = {
      recipeId,
      materials: {},
      techniques: [],
      shouldPurchaseMaterials: false,
      estimatedTime: 0,
      estimatedStats: {
        attack: 0,
        durability: 0,
        maxDurability: 0,
        weight: 0,
        balance: 0,
        soulCapacity: 0,
        repairPotential: 1,
        enchantSlots: 0,
        enchantPower: 1,
      },
      estimatedQuality: 'common',
    }
    
    setState(prev => ({
      ...prev,
      plan: { ...emptyPlan, shouldPurchaseMaterials: prev.shouldPurchaseMaterials },
      preview: null,
      weaponName: null,
      stage: 'planning',
    }))
  }, [setState])
  
  const setMaterial = useCallback((partId: string, materialId: string, quantity: number) => {
    materialsRef.current = {
      ...materialsRef.current,
      [partId]: { materialId, quantity },
    }
    
    setState(prev => {
      if (!prev.plan) return prev
      
      const updatedPlan = {
        ...prev.plan,
        materials: materialsRef.current,
      }
      
      return { ...prev, plan: updatedPlan }
    })
  }, [setState])
  
  const setTechniques = useCallback((techniqueIds: string[]) => {
    techniquesRef.current = techniqueIds
    
    setState(prev => {
      if (!prev.plan) return prev
      
      const updatedPlan = {
        ...prev.plan,
        techniques: techniqueIds,
      }
      
      return { ...prev, plan: updatedPlan }
    })
  }, [setState])
  
  const calculatePreview = useCallback(() => {
    const recipeId = recipeIdRef.current
    const materials = materialsRef.current
    const techniqueIds = techniquesRef.current
    
    if (!recipeId || Object.keys(materials).length === 0) {
      setState(prev => ({ ...prev, preview: null, weaponName: null }))
      return
    }
    
    const recipe = getRecipeById(recipeId)
    if (!recipe) return
    
    const techniques = techniqueIds
      .map(id => getTechniqueById(id))
      .filter((t): t is NonNullable<typeof t> => t !== undefined)
    
    const combatPart = recipe.combatPart
    const combatMaterialId = materials[combatPart]?.materialId
    const combatMaterial = combatMaterialId ? getMaterialAsLegacy(combatMaterialId) : null
    
    const preview = calculateWeapon(recipe, materials, techniques, blacksmithLevel)
    const weaponName = generateWeaponName(recipe, combatMaterial || null, preview.quality)
    
    const stages = generateCraftStages(recipe, materials, techniques, blacksmithLevel, forgeLevel)
    const estimatedTime = stages.reduce((sum, s) => sum + s.calculatedDuration, 0)
    
    setState(prev => ({
      ...prev,
      preview,
      weaponName,
      plan: prev.plan ? {
        ...prev.plan,
        materials,
        techniques: techniqueIds,
        estimatedTime,
        estimatedStats: preview.stats,
        estimatedQuality: preview.qualityGrade,
      } : null,
    }))
  }, [blacksmithLevel, forgeLevel, setState])
  
  // ================================
  // CRAFT ACTIONS
  // ================================
  
  const startCraft = useCallback(() => {
    const recipeId = recipeIdRef.current
    const materials = materialsRef.current
    const techniqueIds = techniquesRef.current
    const shouldPurchase = state.shouldPurchaseMaterials

    if (!recipeId || Object.keys(materials).length === 0) {
      console.warn('Cannot start craft: missing recipe or materials')
      return
    }

    const recipe = getRecipeById(recipeId)
    if (!recipe) return

    const techniques = techniqueIds
      .map(id => getTechniqueById(id))
      .filter((t): t is NonNullable<typeof t> => t !== undefined)

    const stages = generateCraftStages(recipe, materials, techniques, blacksmithLevel, forgeLevel, undefined, shouldPurchase)
    const plan = createCraftPlan(recipeId, materials, techniqueIds, blacksmithLevel, forgeLevel, shouldPurchase)
    
    const activeCraft: ActiveCraftV2 = {
      id: `craft_${Date.now()}`,
      plan,
      stages,
      currentStageIndex: 0,
      startTime: Date.now(),
      totalDuration: stages.reduce((sum, s) => sum + s.calculatedDuration, 0),
      elapsedTime: 0,
      status: 'running',
      log: [{
        timestamp: Date.now(),
        stageId: 'start',
        stageName: 'Начало крафта',
        message: `Начинаю создание ${recipe.name}`,
        type: 'start',
      }],
    }
    
    if (stages.length > 0) {
      stages[0].status = 'in_progress'
      stages[0].startTime = Date.now()
    }
    
    setState(prev => ({
      ...prev,
      activeCraft,
      stage: 'crafting',
    }))
  }, [blacksmithLevel, forgeLevel, setState, state.shouldPurchaseMaterials])
  
  const setShouldPurchaseMaterials = useCallback((should: boolean) => {
    setState(prev => ({ ...prev, shouldPurchaseMaterials: should }))
  }, [setState])

  const cancelCraft = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeCraft: null,
      stage: 'planning',
    }))
  }, [setState])
  
  // ================================
  // INSTANT COMPLETE (для тестирования)
  // ================================
  
  const instantComplete = useCallback(() => {
    if (state.stage !== 'crafting' || !state.activeCraft) return
    
    // Устанавливаем elapsedTime больше totalDuration для мгновенного завершения
    const totalDurationMs = state.activeCraft.totalDuration * 1000
    
    setState(prev => {
      if (!prev.activeCraft || prev.stage !== 'crafting') return prev
      
      const craft = { ...prev.activeCraft }
      craft.elapsedTime = totalDurationMs + 1000 // +1 секунда для гарантии
      craft.status = 'completed'
      
      // Помечаем все этапы как завершенные
      craft.stages = craft.stages.map(stage => ({
        ...stage,
        status: 'completed' as const,
        progress: 100,
      }))
      craft.currentStageIndex = craft.stages.length - 1
      
      // Создаем оружие если есть данные
      if (prev.preview && prev.weaponName && prev.plan) {
        const recipe = getRecipeById(prev.plan.recipeId)
        
        // Генерируем уникальный ID: w_timestamp_random
        const uniqueId = `w_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
        
        // Получаем combatMaterialId для hiddenTags
        const recipeData = getRecipeById(prev.plan.recipeId)
        const combatPart = recipeData?.combatPart || 'blade'
        const combatMatId = prev.plan.materials[combatPart]?.materialId || 'unknown'
        
        // Генерируем hiddenTags
        const hiddenTags = [
          recipe?.type || 'sword',
          combatMatId,
          `q:${Math.floor(prev.preview.quality)}`,
          `rank:${prev.weaponName.qualityRank || 'F'}`,
        ]
        
        const completedWeapon: CraftedWeaponV2 = {
          id: uniqueId,
          recipeId: prev.plan.recipeId,
          prefix: prev.weaponName.prefix,
          baseName: prev.weaponName.baseName,
          suffix: prev.weaponName.suffix,
          fullName: prev.weaponName.fullName,
          type: recipe?.type || 'sword',
          tier: recipe?.baseStats ? Math.ceil(prev.preview.stats.attack / 20) : 1,
          materials: prev.preview.materials,
          stats: prev.preview.stats,
          quality: prev.preview.quality,
          qualityGrade: prev.preview.qualityGrade,
          qualityRank: prev.weaponName.qualityRank || getQualityRank(prev.preview.quality),
          warSoul: 0,
          maxWarSoul: prev.preview.stats.soulCapacity,
          createdAt: Date.now(),
          adventureCount: 0,
          sellPrice: prev.preview.sellPrice,
          hiddenTags,
          combatMaterialId: combatMatId,
          currentDurability: prev.preview.stats.durability,
          epicMultiplier: 1.0,
          techniquesUsed: prev.plan.techniques,
        }
        
        return {
          ...prev,
          activeCraft: null,
          completedWeapon,
          stage: 'completed' as const,
        }
      }
      
      return prev
    })
  }, [state.stage, state.activeCraft, setState])
  
  // ================================
  // RESULT ACTIONS
  // ================================
  
  const collectWeapon = useCallback(() => {
    const { completedWeapon, preview, weaponName, plan } = state
    
    if (!completedWeapon || !preview || !weaponName || !plan) return null
    
    setState(prev => ({
      ...prev,
      completedWeapon: null,
      stage: 'planning',
    }))
    
    return completedWeapon
  }, [state, setState])
  
  const reset = useCallback(() => {
    materialsRef.current = {}
    techniquesRef.current = []
    recipeIdRef.current = null
    setState(initialState)
  }, [setState])
  
  // ================================
  // GAME LOOP (для прогресса крафта)
  // ================================
  
  useEffect(() => {
    if (state.stage !== 'crafting' || !state.activeCraft) return
    
    const interval = setInterval(() => {
      setState(prev => {
        if (!prev.activeCraft || prev.stage !== 'crafting') return prev
        
        const craft = { ...prev.activeCraft }
        const elapsed = Date.now() - craft.startTime
        craft.elapsedTime = elapsed
        
        let accumulatedTime = 0
        let currentStageFound = false
        
        for (let i = 0; i < craft.stages.length; i++) {
          const stage = craft.stages[i]
          const stageDuration = stage.calculatedDuration * 1000
          
          if (accumulatedTime + stageDuration > elapsed) {
            craft.currentStageIndex = i
            
            const elapsedInStage = elapsed - accumulatedTime
            craft.stages = [...craft.stages]
            craft.stages[i] = {
              ...stage,
              progress: Math.min(100, (elapsedInStage / stageDuration) * 100),
            }
            currentStageFound = true
            break
          }
          
          if (stage.status !== 'completed') {
            craft.stages = [...craft.stages]
            craft.stages[i] = {
              ...stage,
              status: 'completed',
              progress: 100,
            }
          }
          
          accumulatedTime += stageDuration
        }
        
        if (!currentStageFound && craft.stages.length > 0) {
          craft.status = 'completed'
          
          if (prev.preview && prev.weaponName && prev.plan) {
            const recipe = getRecipeById(prev.plan.recipeId)
            
            // Генерируем уникальный ID: w_timestamp_random
            const uniqueId = `w_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
            
            // Получаем combatMaterialId для hiddenTags
            const recipeData = getRecipeById(prev.plan.recipeId)
            const combatPart = recipeData?.combatPart || 'blade'
            const combatMatId = prev.plan.materials[combatPart]?.materialId || 'unknown'
            
            // Генерируем hiddenTags
            const hiddenTags = [
              recipe?.type || 'sword',                              // тип оружия
              combatMatId,                                          // материал combatPart
              `q:${Math.floor(prev.preview.quality)}`,              // качество числом
              `rank:${prev.weaponName.qualityRank || 'F'}`,         // ранг качества
            ]
            
            const completedWeapon: CraftedWeaponV2 = {
              id: uniqueId,
              recipeId: prev.plan.recipeId,
              prefix: prev.weaponName.prefix,
              baseName: prev.weaponName.baseName,
              suffix: prev.weaponName.suffix,
              fullName: prev.weaponName.fullName,
              type: recipe?.type || 'sword',
              tier: recipe?.baseStats ? Math.ceil(prev.preview.stats.attack / 20) : 1,
              materials: prev.preview.materials,
              stats: prev.preview.stats,
              quality: prev.preview.quality,
              qualityGrade: prev.preview.qualityGrade,
              qualityRank: prev.weaponName.qualityRank || getQualityRank(prev.preview.quality),
              warSoul: 0,
              maxWarSoul: prev.preview.stats.soulCapacity,
              createdAt: Date.now(),
              adventureCount: 0,
              sellPrice: prev.preview.sellPrice,
              // Скрытые теги для системы заказов
              hiddenTags,
              combatMaterialId: combatMatId,
              // Runtime-поля
              currentDurability: prev.preview.stats.durability,
              epicMultiplier: 1.0,
              techniquesUsed: prev.plan.techniques,
            }
            
            return {
              ...prev,
              activeCraft: null,
              completedWeapon,
              stage: 'completed' as const,
            }
          }
        }
        
        return { ...prev, activeCraft: craft }
      })
    }, 100)
    
    return () => clearInterval(interval)
  }, [state.stage, state.activeCraft, setState])
  
  // ================================
  // RETURN
  // ================================
  
  return {
    state,
    setRecipe,
    setMaterial,
    setTechniques,
    calculatePreview,
    startCraft,
    setShouldPurchaseMaterials,
    cancelCraft,
    instantComplete,  // Тестовая функция мгновенного завершения
    collectWeapon,
    reset,
  }
}

export default useCraftV2
