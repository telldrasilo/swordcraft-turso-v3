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
  MaterialAssignment,
  PartMaterialSupplyEntry,
} from '@/types/craft-v2'
import { 
  generateCraftStages, 
  createCraftPlan 
} from '@/lib/craft/process-generator'
import { 
  calculateWeapon, 
  calculateForecast,
  rollWeaponOutcome,
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
import type { WeaponForecast } from '@/types/forecast'
import type { MaterialKnowledge } from '@/types/materials/knowledge'
import { buildCompletedWeaponV2 } from '@/hooks/use-craft-v2-helpers'
import { isMaterialUnlockedForForge } from '@/lib/craft/material-forge-access'
import {
  applyCraftExpertiseGainRows,
  buildCraftExpertiseGainRows,
  type CraftExpertiseGainRow,
} from '@/lib/craft/craft-expertise-from-craft'
import {
  aggregateProcessingForecastSpreadTightness,
  aggregateProcessingQualityDelta,
  validateMaterialProcessingPlan,
} from '@/data/material-processing-techniques'
import { getPlannerUnlockedTechniqueIds } from '@/lib/craft/planner-unlocked-techniques'
import { isForgottenForgeAltarRecipe } from '@/lib/craft/altar-construction'
import { gameEvents } from '@/lib/game-events'

function buildExpertiseMap(
  knowledge: Record<string, MaterialKnowledge> | undefined
): Record<string, number> {
  const m: Record<string, number> = {}
  if (!knowledge || typeof knowledge !== 'object') return m
  Object.entries(knowledge).forEach(([id, k]) => {
    m[id] = k?.expertise ?? 0
  })
  return m
}

function getMaterialProcessingUnlockIdsFromStore(): string[] {
  const s = useGameStore.getState()
  return getPlannerUnlockedTechniqueIds({
    playerLevel: s.player.level,
    unlockedMaterialProcessingTechniqueIds: s.unlockedMaterialProcessingTechniqueIds ?? [],
  })
}

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
  
  /** Предварительный расчёт (ожидаемые характеристики до броска) */
  preview: WeaponCalculationResult | null

  /** Диапазоны min–max для итогового крафта */
  forecast: WeaponForecast | null
  
  /** Имя оружия */
  weaponName: WeaponNameResult | null
  
  /** Стадия UI */
  stage: 'planning' | 'crafting' | 'completed'
  
  /** Нужно ли закупать материалы */
  shouldPurchaseMaterials: boolean

  /** Прирост экспертизы по материалам после завершения крафта (для UI при заборе) */
  lastCraftExpertiseGains: CraftExpertiseGainRow[] | null

  /**
   * Последняя ошибка запуска крафта (не персистится).
   * Дублирует часть console.warn для отображения в UI (вкладка «Алтарь» и др.).
   */
  lastStartCraftError: string | null
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

  /** Путь снабжения частей (руда + плавка) перед стартом крафта из контейнера */
  setPartMaterialSupply: (supply: Record<string, PartMaterialSupplyEntry>) => void

  clearLastStartCraftError: () => void
}

// ================================
// НАЧАЛЬНОЕ СОСТОЯНИЕ
// ================================

const initialState: CraftV2State = {
  plan: null,
  activeCraft: null,
  completedWeapon: null,
  preview: null,
  forecast: null,
  weaponName: null,
  stage: 'planning',
  shouldPurchaseMaterials: false,
  lastCraftExpertiseGains: null,
  lastStartCraftError: null,
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
    forecast: persisted.forecast ?? null,
    weaponName: persisted.weaponName || null,
    stage: persisted.stage || 'planning',
    shouldPurchaseMaterials: useGameStore.getState().shouldPurchaseMaterials ?? false,
    lastCraftExpertiseGains: null,
    lastStartCraftError: null,
  }
}

function finalizeCompletedCraftV2(
  prev: CraftV2State,
  blacksmithLevel: number
): CraftV2State | null {
  if (!prev.preview || !prev.plan) return null

  if (isForgottenForgeAltarRecipe(prev.plan.recipeId)) {
    const gains = buildCraftExpertiseGainRows(prev.plan.materials, {
      getExpertise: id =>
        useGameStore.getState().materialKnowledge[id]?.expertise ?? 0,
      getMaterialDisplayName: id => getMaterialAsLegacy(id)?.name ?? id,
    })
    if (gains.length > 0) {
      queueMicrotask(() => {
        applyCraftExpertiseGainRows(gains, (id, d) => {
          useGameStore.getState().addMaterialExpertise(id, d)
        })
      })
    }
    queueMicrotask(() => {
      useGameStore.getState().setCraftV2Persisted({
        activeCraft: null,
        plan: null,
        completedWeapon: null,
        stage: 'planning',
        preview: null,
        forecast: null,
        weaponName: null,
      })
    })
    return {
      ...prev,
      activeCraft: null,
      completedWeapon: null,
      weaponName: null,
      preview: null,
      forecast: null,
      plan: null,
      stage: 'planning',
      lastCraftExpertiseGains: gains.length > 0 ? gains : null,
      lastStartCraftError: null,
    }
  }

  const recipe = getRecipeById(prev.plan.recipeId)
  if (!recipe) return null

  const techniques = prev.plan.techniques
    .map(id => getTechniqueById(id))
    .filter((t): t is NonNullable<typeof t> => t !== undefined)

  const expertiseMap = buildExpertiseMap(useGameStore.getState().materialKnowledge)
  const unlockProc = getMaterialProcessingUnlockIdsFromStore()
  const pq = aggregateProcessingQualityDelta(
    prev.plan.partMaterialSupply,
    prev.plan.materials,
    unlockProc
  )
  const spreadT = aggregateProcessingForecastSpreadTightness(
    prev.plan.partMaterialSupply,
    prev.plan.materials,
    unlockProc
  )
  const forecast =
    prev.forecast ??
    calculateForecast(
      recipe,
      prev.plan.materials,
      techniques,
      blacksmithLevel,
      expertiseMap,
      pq,
      spreadT
    )

  const rolled = rollWeaponOutcome(prev.preview, forecast)
  const combatPart = recipe.combatPart || 'blade'
  const combatMatId = prev.plan.materials[combatPart]?.materialId
  const combatMaterial = combatMatId ? getMaterialAsLegacy(combatMatId) ?? null : null
  const weaponName = generateWeaponName(recipe, combatMaterial, rolled.quality)
  const completedWeapon = buildCompletedWeaponV2(prev.plan, rolled, weaponName, recipe)

  const gains = buildCraftExpertiseGainRows(prev.plan.materials, {
    getExpertise: id =>
      useGameStore.getState().materialKnowledge[id]?.expertise ?? 0,
    getMaterialDisplayName: id => getMaterialAsLegacy(id)?.name ?? id,
  })
  // Нельзя вызывать addMaterialExpertise внутри updater'а useState (React 19 / concurrent).
  if (gains.length > 0) {
    queueMicrotask(() => {
      applyCraftExpertiseGainRows(gains, (id, d) => {
        useGameStore.getState().addMaterialExpertise(id, d)
      })
    })
  }

  const rid = prev.plan.recipeId
  queueMicrotask(() => {
    gameEvents.emit('craft:completed', { recipeId: rid })
  })

  return {
    ...prev,
    activeCraft: null,
    completedWeapon,
    weaponName,
    stage: 'completed',
    lastCraftExpertiseGains: gains.length > 0 ? gains : null,
    lastStartCraftError: null,
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
  const materialKnowledge = useGameStore(s => s.materialKnowledge)
  
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
        forecast: s.forecast,
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
        forecast: state.forecast,
        weaponName: state.weaponName,
      })
    }
  }, [state.stage, state.completedWeapon, state.activeCraft, state.plan, state.preview, state.forecast, state.weaponName, setCraftV2Persisted])

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
  const partMaterialSupplyRef = useRef<Record<string, PartMaterialSupplyEntry>>({})

  const setPartMaterialSupply = useCallback(
    (supply: Record<string, PartMaterialSupplyEntry>) => {
      partMaterialSupplyRef.current = supply
    },
    []
  )
  
  // ================================
  // PLANNING ACTIONS
  // ================================
  
  const setRecipe = useCallback((recipeId: string) => {
    recipeIdRef.current = recipeId
    materialsRef.current = {}
    techniquesRef.current = []
    partMaterialSupplyRef.current = {}
    
    const recipe = getRecipeById(recipeId)
    if (!recipe) {
      setState(prev => ({
        ...prev,
        plan: null,
        preview: null,
        forecast: null,
        weaponName: null,
        lastStartCraftError: null,
      }))
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
        soulPotential: 1,
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
      forecast: null,
      weaponName: null,
      stage: 'planning',
      lastStartCraftError: null,
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
      setState(prev => ({ ...prev, preview: null, forecast: null, weaponName: null }))
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
    
    const expertiseMap = buildExpertiseMap(materialKnowledge)
    const unlockProc = getMaterialProcessingUnlockIdsFromStore()
    const pq = aggregateProcessingQualityDelta(
      partMaterialSupplyRef.current,
      materials,
      unlockProc
    )
    const spreadT = aggregateProcessingForecastSpreadTightness(
      partMaterialSupplyRef.current,
      materials,
      unlockProc
    )
    const preview = calculateWeapon(
      recipe,
      materials,
      techniques,
      blacksmithLevel,
      pq,
      expertiseMap
    )
    const forecast = calculateForecast(
      recipe,
      materials,
      techniques,
      blacksmithLevel,
      expertiseMap,
      pq,
      spreadT
    )
    const weaponName = generateWeaponName(recipe, combatMaterial || null, preview.quality)
    
    const supply =
      Object.keys(partMaterialSupplyRef.current).length > 0
        ? { ...partMaterialSupplyRef.current }
        : undefined
    const stages = generateCraftStages(
      recipe,
      materials,
      techniques,
      blacksmithLevel,
      forgeLevel,
      undefined,
      false,
      supply,
      expertiseMap
    )
    const estimatedTime = stages.reduce((sum, s) => sum + s.calculatedDuration, 0)
    
    setState(prev => ({
      ...prev,
      preview,
      forecast,
      weaponName,
      plan: prev.plan
        ? {
            ...prev.plan,
            materials,
            techniques: techniqueIds,
            estimatedTime,
            estimatedStats: preview.stats,
            estimatedQuality: preview.qualityGrade,
            partMaterialSupply: supply,
          }
        : null,
    }))
  }, [blacksmithLevel, forgeLevel, materialKnowledge, setState])
  
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
      setState(prev => ({
        ...prev,
        lastStartCraftError:
          'Выберите рецепт и материалы для всех частей перед запуском.',
      }))
      return
    }

    const recipe = getRecipeById(recipeId)
    if (!recipe) {
      setState(prev => ({
        ...prev,
        lastStartCraftError: 'Рецепт недоступен. Обновите экран кузницы.',
      }))
      return
    }

    const know = useGameStore.getState().materialKnowledge
    for (const part of recipe.parts) {
      const a = materials[part.id]
      if (!a?.materialId) continue
      if (!isMaterialUnlockedForForge(a.materialId, know)) {
        console.warn('Cannot start craft: material below forge expertise threshold', a.materialId)
        const label = getMaterialAsLegacy(a.materialId)?.name ?? a.materialId
        setState(prev => ({
          ...prev,
          lastStartCraftError: `Недостаточно знаний по материалу «${label}» для крафта в кузнице (нужна экспертиза в энциклопедии).`,
        }))
        return
      }
    }

    const techniques = techniqueIds
      .map(id => getTechniqueById(id))
      .filter((t): t is NonNullable<typeof t> => t !== undefined)

    const supply =
      Object.keys(partMaterialSupplyRef.current).length > 0
        ? { ...partMaterialSupplyRef.current }
        : undefined

    const unlockProc = getMaterialProcessingUnlockIdsFromStore()
    const procVal = validateMaterialProcessingPlan(
      materials,
      supply,
      techniqueIds,
      unlockProc
    )
    if (!procVal.ok) {
      console.warn(procVal.reason)
      setState(prev => ({
        ...prev,
        lastStartCraftError:
          procVal.reason ??
          'План обработки материалов невалиден. Проверьте цепочки плавки и выбранные техники.',
      }))
      return
    }

    const expertiseMap = buildExpertiseMap(know)

    const stages = generateCraftStages(
      recipe,
      materials,
      techniques,
      blacksmithLevel,
      forgeLevel,
      undefined,
      shouldPurchase,
      supply,
      expertiseMap
    )
    if (stages.length === 0) {
      setState(prev => ({
        ...prev,
        lastStartCraftError:
          'Не удалось сформировать этапы крафта. Проверьте материалы и техники.',
      }))
      return
    }

    const plan = createCraftPlan(
      recipeId,
      materials,
      techniqueIds,
      blacksmithLevel,
      forgeLevel,
      shouldPurchase,
      supply,
      expertiseMap
    )

    const activeCraft: ActiveCraftV2 = {
      id: `craft_${Date.now()}`,
      plan,
      stages,
      currentStageIndex: 0,
      startTime: Date.now(),
      totalDuration: stages.reduce((sum, s) => sum + s.calculatedDuration, 0),
      elapsedTime: 0,
      status: 'running',
      log: [
        {
          timestamp: Date.now(),
          stageId: 'start',
          stageName: 'Начало крафта',
          message: `Начинаю создание ${recipe.name}`,
          type: 'start',
        },
      ],
    }

    stages[0].status = 'in_progress'
    stages[0].startTime = Date.now()

    setState(prev => ({
      ...prev,
      activeCraft,
      stage: 'crafting',
      lastStartCraftError: null,
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
      lastStartCraftError: null,
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
      
      const done = finalizeCompletedCraftV2(prev, blacksmithLevel)
      if (done) return done

      return prev
    })
  }, [state.stage, state.activeCraft, setState, blacksmithLevel])
  
  // ================================
  // RESULT ACTIONS
  // ================================
  
  const collectWeapon = useCallback(() => {
    const { completedWeapon } = state

    if (!completedWeapon) return null

    setState(prev => ({
      ...prev,
      completedWeapon: null,
      stage: 'planning',
      lastCraftExpertiseGains: null,
      lastStartCraftError: null,
    }))

    return completedWeapon
  }, [state, setState])

  const clearLastStartCraftError = useCallback(() => {
    setState(prev => ({ ...prev, lastStartCraftError: null }))
  }, [setState])
  
  const reset = useCallback(() => {
    materialsRef.current = {}
    techniquesRef.current = []
    recipeIdRef.current = null
    partMaterialSupplyRef.current = {}
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
          
          const done = finalizeCompletedCraftV2(prev, blacksmithLevel)
          if (done) return done
        }
        
        return { ...prev, activeCraft: craft }
      })
    }, 100)
    
    return () => clearInterval(interval)
  }, [state.stage, state.activeCraft, setState, blacksmithLevel])
  
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
    setPartMaterialSupply,
    clearLastStartCraftError,
  }
}

export default useCraftV2
