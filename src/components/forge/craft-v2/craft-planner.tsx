/**
 * Craft Planner V2
 * Интерфейс планирования крафта - ИСПОЛЬЗУЕТ МОДУЛЬНЫЕ КОМПОНЕНТЫ
 * Обновлён: передаёт знания и инвентарь в PartMaterialSelector
 * 
 * @see docs/CRAFT_SYSTEM_CONCEPT.md - секция 5.1
 * 
 * Размер: ~300 строк (было 788)
 */

'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Hammer, Wrench, Package, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPlannerUnlockedTechniqueIds } from '@/lib/craft/planner-unlocked-techniques'

// Модульные компоненты
import {
  RecipeCard,
  PartMaterialSelector,
  TechniqueSelector,
  MaterialsCheck,
  PartMaterialProcessingPanel,
} from './planner'

// Прогноз результата
import { WeaponForecastPanel } from './planner/WeaponForecastPanel'

// Типы и данные
import type { Resources } from '@/store/slices/resources-slice'
import type { MaterialToBuy } from '@/lib/craft/inventory-check'
import type { MaterialKnowledge } from '@/types/materials/knowledge'
import type { PartMaterialSupplyEntry } from '@/types/craft-v2'
import {
  aggregateProcessingForecastSpreadTightness,
  aggregateProcessingQualityDelta,
  getAvailableMaterialProcessingTechniques,
  getMaterialProcessingTechniqueById,
  validateMaterialProcessingPlan,
} from '@/data/material-processing-techniques'
import { getAvailableRecipes, getRecipeById } from '@/data/recipes'
import { getTechniqueById } from '@/data/techniques'
import { calculateForecast } from '@/lib/craft/calculator'
import {
  canCatalogMaterialSpendInForgeCraft,
  checkInventoryForCraft,
} from '@/lib/craft/inventory-check'
import { isMaterialUnlockedForForge } from '@/lib/craft/material-forge-access'

// ================================
// PROP TYPES
// ================================

interface CraftPlannerProps {
  playerLevel: number
  inventory: Resources
  materialStash?: Record<string, number>
  gold: number
  availableMaterials: string[]
  unlockedRecipes: string[]
  /** Боевые приёмы крафта (селектор «Техники») */
  unlockedTechniques: string[]
  /** Разблокированные техники обработки (плавка); плюс уровень даёт `forge_fine_iron_smelt` см. planner-unlocked-techniques */
  unlockedMaterialProcessingTechniqueIds?: string[]

  // Новые props:
  materialKnowledge: Record<string, MaterialKnowledge>
  materialPrices?: Record<string, number>
  blacksmithLevel?: number  // Уровень мастерства кузнеца (для прогноза)

  // Props для аванса
  activeOrderId?: string | null
  activeOrder?: {
    goldReward: number
    advanceTaken?: number
  } | null

  onStartCraft: (plan: {
    recipeId: string
    materials: Record<string, { materialId: string; quantity: number }>
    techniques: string[]
    shouldPurchaseMaterials?: boolean
    shouldTakeAdvance?: boolean
    partMaterialSupply?: Record<string, PartMaterialSupplyEntry>
  }) => void
  onBuyMaterials?: (materials: MaterialToBuy[], totalCost: number) => void

  /** Один фиксированный рецепт (вкладка «Алтарь»): без сетки выбора формы */
  fixedRecipeId?: string | null
}

// ================================
// MAIN COMPONENT
// ================================

export function CraftPlanner({
  playerLevel,
  inventory,
  materialStash = {},
  gold,
  availableMaterials: _availableMaterials,
  unlockedRecipes,
  unlockedTechniques,
  unlockedMaterialProcessingTechniqueIds = [],
  materialKnowledge,
  materialPrices = {},
  blacksmithLevel = playerLevel,  // По умолчанию используем playerLevel
  activeOrderId = null,
  activeOrder = null,
  onStartCraft,
  onBuyMaterials,
  fixedRecipeId = null,
}: CraftPlannerProps) {
  // === STATE ===
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(() =>
    fixedRecipeId ?? null
  )
  const [selectedMaterials, setSelectedMaterials] = useState<Record<string, string>>({})
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([])
  const [shouldPurchaseMaterials, setShouldPurchaseMaterials] = useState(false)
  const [shouldTakeAdvance, setShouldTakeAdvance] = useState(false)
  const [plannerOnlyInStockMaterials, setPlannerOnlyInStockMaterials] = useState(false)
  const [partMaterialSupply, setPartMaterialSupply] = useState<
    Record<string, PartMaterialSupplyEntry>
  >({})
  const [processingSheetOpen, setProcessingSheetOpen] = useState(false)
  const [processingSheetPartId, setProcessingSheetPartId] = useState<string | null>(null)

  // === DERIVED DATA ===
  const selectedRecipe = useMemo(() => {
    return selectedRecipeId ? getRecipeById(selectedRecipeId) : null
  }, [selectedRecipeId])
  
  const recipes = useMemo(() => {
    return getAvailableRecipes(playerLevel, unlockedRecipes)
  }, [playerLevel, unlockedRecipes])

  // Подготовка экспертизы в нужном формате (materialId -> expertise)
  const expertiseMap = useMemo(() => {
    const map: Record<string, number> = {}
    Object.entries(materialKnowledge).forEach(([id, knowledge]) => {
      map[id] = knowledge.expertise
    })
    return map
  }, [materialKnowledge])

  const processingUnlockIds = useMemo(
    () =>
      getPlannerUnlockedTechniqueIds({
        playerLevel,
        unlockedMaterialProcessingTechniqueIds,
      }),
    [playerLevel, unlockedMaterialProcessingTechniqueIds]
  )

  const materialAssignment = useMemo(() => {
    if (!selectedRecipe) return {}
    const materials: Record<string, { materialId: string; quantity: number }> = {}
    for (const part of selectedRecipe.parts) {
      const materialId = selectedMaterials[part.id]
      if (materialId) {
        materials[part.id] = { materialId, quantity: part.minQuantity }
      }
    }
    return materials
  }, [selectedRecipe, selectedMaterials])

  const processingQualityDelta = useMemo(
    () =>
      aggregateProcessingQualityDelta(
        partMaterialSupply,
        materialAssignment,
        processingUnlockIds
      ),
    [partMaterialSupply, materialAssignment, processingUnlockIds]
  )

  const processingForecastSpreadTightness = useMemo(
    () =>
      aggregateProcessingForecastSpreadTightness(
        partMaterialSupply,
        materialAssignment,
        processingUnlockIds
      ),
    [partMaterialSupply, materialAssignment, processingUnlockIds]
  )

  const supplyForChecks =
    Object.keys(partMaterialSupply).length > 0 ? partMaterialSupply : undefined

  const materialProcessingPlanValidation = useMemo(
    () =>
      validateMaterialProcessingPlan(
        materialAssignment,
        supplyForChecks,
        selectedTechniques,
        processingUnlockIds
      ),
    [materialAssignment, supplyForChecks, selectedTechniques, processingUnlockIds]
  )

  // Расчёт прогноза с использованием тех же формул, что и при крафте
  const forecast = useMemo(() => {
    if (!selectedRecipe || Object.keys(selectedMaterials).length === 0) return null

    const techniques = selectedTechniques.map(id => getTechniqueById(id)).filter((t): t is NonNullable<typeof t> => t !== null)

    return calculateForecast(
      selectedRecipe,
      materialAssignment,
      techniques,
      blacksmithLevel,
      expertiseMap,
      processingQualityDelta,
      processingForecastSpreadTightness
    )
  }, [
    selectedRecipe,
    selectedMaterials,
    materialAssignment,
    selectedTechniques,
    blacksmithLevel,
    expertiseMap,
    processingQualityDelta,
    processingForecastSpreadTightness,
  ])

  const avgMaterialExpertiseForSelection = useMemo(() => {
    if (!selectedRecipe) return 0
    let sum = 0
    let n = 0
    for (const part of selectedRecipe.parts) {
      const id = selectedMaterials[part.id]
      if (id) {
        sum += expertiseMap[id] ?? 0
        n += 1
      }
    }
    return n > 0 ? sum / n : 0
  }, [selectedRecipe, selectedMaterials, expertiseMap])

  // === VALIDATION ===
  const canStartCraft = useMemo(() => {
    if (!selectedRecipe) return false
    
    // Все обязательные части выбраны
    const requiredParts = selectedRecipe.parts.filter(p => !p.optional)
    const hasAllMaterials = requiredParts.every(p => selectedMaterials[p.id])
    if (!hasAllMaterials) return false
    
    for (const part of requiredParts) {
      const materialId = selectedMaterials[part.id]
      if (!materialId) continue

      if (!canCatalogMaterialSpendInForgeCraft(materialId)) return false
      if (!isMaterialUnlockedForForge(materialId, materialKnowledge)) return false
    }

    const checkResult = checkInventoryForCraft(
      selectedRecipe,
      materialAssignment,
      inventory,
      materialStash,
      supplyForChecks
    )

    if (checkResult.forgeSpendBlockReason) return false

    if (!materialProcessingPlanValidation.ok) return false

    if (checkResult.canCraft) return true

    if (shouldPurchaseMaterials) {
      if (!checkResult.canPurchaseMissing) return false
      const need = checkResult.totalPurchaseCost
      if (shouldTakeAdvance && activeOrder) {
        const maxAdvance = Math.floor(activeOrder.goldReward * 0.5)
        const alreadyTaken = activeOrder.advanceTaken ?? 0
        const advanceStillAvailable = Math.max(0, maxAdvance - alreadyTaken)
        return gold + advanceStillAvailable >= need
      }
      return gold >= need
    }

    return false
  }, [
    selectedRecipe,
    selectedMaterials,
    materialAssignment,
    supplyForChecks,
    inventory,
    materialStash,
    shouldPurchaseMaterials,
    shouldTakeAdvance,
    gold,
    activeOrder,
    materialKnowledge,
    materialProcessingPlanValidation,
  ])
  
  // === HANDLERS ===
  const handleSelectRecipe = useCallback((recipeId: string) => {
    setSelectedRecipeId(recipeId)
    setSelectedMaterials({})
    setPartMaterialSupply({})
    setProcessingSheetOpen(false)
    setProcessingSheetPartId(null)
  }, [])
  
  const handleSelectMaterial = useCallback(
    (partId: string, materialId: string) => {
      setSelectedMaterials(prev => ({
        ...prev,
        [partId]: materialId,
      }))
      setPartMaterialSupply(prev => {
        const next = { ...prev }
        const available = getAvailableMaterialProcessingTechniques(
          materialId,
          processingUnlockIds
        )
        if (available.length > 0) {
          const tech = available[0]
          next[partId] = { mode: 'ore_smelt', processingTechniqueId: tech.id }
        } else {
          delete next[partId]
        }
        return next
      })
    },
    [processingUnlockIds]
  )

  const handleToggleOreSmelt = useCallback(
    (partId: string, catalogMaterialId: string, enabled: boolean) => {
      if (!enabled) {
        setPartMaterialSupply(prev => {
          const next = { ...prev }
          delete next[partId]
          return next
        })
        return
      }
      const available = getAvailableMaterialProcessingTechniques(
        catalogMaterialId,
        processingUnlockIds
      )
      const tech = available[0]
      if (!tech) return
      setPartMaterialSupply(prev => ({
        ...prev,
        [partId]: { mode: 'ore_smelt', processingTechniqueId: tech.id },
      }))
    },
    [processingUnlockIds]
  )

  const handleProcessingTechniqueChange = useCallback(
    (partId: string, techniqueId: string) => {
      setPartMaterialSupply(prev => ({
        ...prev,
        [partId]: { mode: 'ore_smelt', processingTechniqueId: techniqueId },
      }))
    },
    []
  )
  
  const handleToggleTechnique = useCallback((techniqueId: string) => {
    setSelectedTechniques(prev => 
      prev.includes(techniqueId)
        ? prev.filter(id => id !== techniqueId)
        : prev.length < 3 
          ? [...prev, techniqueId]
          : prev
    )
  }, [])
  
  const handleStartCraft = useCallback(() => {
    if (!selectedRecipeId || !canStartCraft) return
    
    const materials: Record<string, { materialId: string; quantity: number }> = {}
    
    selectedRecipe?.parts.forEach(part => {
      const materialId = selectedMaterials[part.id]
      if (materialId) {
        materials[part.id] = {
          materialId,
          quantity: part.minQuantity,
        }
      }
    })
    
    onStartCraft({
      recipeId: selectedRecipeId,
      materials,
      techniques: selectedTechniques,
      shouldPurchaseMaterials,
      shouldTakeAdvance,
      partMaterialSupply:
        Object.keys(partMaterialSupply).length > 0 ? partMaterialSupply : undefined,
    })
  }, [
    selectedRecipeId,
    selectedRecipe,
    selectedMaterials,
    selectedTechniques,
    canStartCraft,
    onStartCraft,
    shouldPurchaseMaterials,
    shouldTakeAdvance,
    partMaterialSupply,
  ])
  
  // === RENDER ===
  return (
    <div className="space-y-6">
      {/* Выбор рецепта */}
      {!fixedRecipeId ? (
        <Card className="bg-stone-900/50 border-stone-700">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              Выберите рецепт
            </CardTitle>
            <CardDescription>
              Доступно {recipes.length} рецептов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[min(55vh,24rem)] sm:min-h-[14rem]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 pr-3">
                {recipes.map(recipe => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    isSelected={selectedRecipeId === recipe.id}
                    isAvailable={true}
                    onSelect={() => handleSelectRecipe(recipe.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : selectedRecipe ? (
        <Card className="bg-stone-900/50 border-amber-900/40">
          <CardHeader>
            <CardTitle className="text-lg text-amber-200">{selectedRecipe.name}</CardTitle>
            <CardDescription>{selectedRecipe.description}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}
      
      {/* Выбор материалов */}
      <AnimatePresence>
        {selectedRecipe && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-stone-900/50 border-stone-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-400" />
                  Материалы
                </CardTitle>
                <CardDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>Выберите материал для каждой части</span>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="craft-planner-only-stock"
                      checked={plannerOnlyInStockMaterials}
                      onCheckedChange={setPlannerOnlyInStockMaterials}
                    />
                    <Label htmlFor="craft-planner-only-stock" className="text-xs font-normal text-stone-400 cursor-pointer">
                      Только в наличии
                    </Label>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedRecipe.parts.map(part => {
                  const catalogId = selectedMaterials[part.id] || null
                  const processingOpts = catalogId
                    ? getAvailableMaterialProcessingTechniques(
                        catalogId,
                        processingUnlockIds
                      )
                    : []
                  const supplyEntry = partMaterialSupply[part.id]

                  return (
                    <div key={part.id} className="space-y-2">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
                        <PartMaterialSelector
                          partId={part.id}
                          partName={part.name}
                          allowedCategories={part.materialTypes}
                          selectedMaterial={catalogId}
                          onSelect={materialId =>
                            handleSelectMaterial(part.id, materialId)
                          }
                          inventory={inventory}
                          materialStash={materialStash}
                          playerLevel={playerLevel}
                          recipe={selectedRecipe}
                          knowledge={materialKnowledge}
                          materialPrices={materialPrices}
                          currentMaterials={selectedMaterials}
                          onlyInStock={plannerOnlyInStockMaterials}
                        />
                        {processingOpts.length > 0 && catalogId ? (
                          <div className="hidden lg:block min-w-0">
                            <PartMaterialProcessingPanel
                              partId={part.id}
                              processingOpts={processingOpts}
                              supplyEntry={supplyEntry}
                              onToggleOreSmelt={v =>
                                handleToggleOreSmelt(part.id, catalogId, v)
                              }
                              onProcessingTechniqueChange={id =>
                                handleProcessingTechniqueChange(part.id, id)
                              }
                            />
                          </div>
                        ) : null}
                      </div>
                      {processingOpts.length > 0 && catalogId ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="lg:hidden w-full border-amber-800/60 bg-stone-950/50 text-amber-100"
                          onClick={() => {
                            setProcessingSheetPartId(part.id)
                            setProcessingSheetOpen(true)
                          }}
                        >
                          Обработка сырья
                        </Button>
                      ) : null}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Проверка материалов */}
      <AnimatePresence>
        {selectedRecipe && Object.keys(selectedMaterials).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <MaterialsCheck
              inventory={inventory}
              materialStash={materialStash}
              selectedMaterials={selectedMaterials}
              recipe={selectedRecipe}
              gold={gold}
              onBuyMaterials={onBuyMaterials}
              shouldPurchaseMaterials={shouldPurchaseMaterials}
              onTogglePurchaseMaterials={setShouldPurchaseMaterials}
              activeOrderId={activeOrderId}
              activeOrder={activeOrder}
              shouldTakeAdvance={shouldTakeAdvance}
              onToggleTakeAdvance={setShouldTakeAdvance}
              partMaterialSupply={supplyForChecks}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Выбор техник */}
      <AnimatePresence>
        {selectedRecipe && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <TechniqueSelector
              selectedTechniques={selectedTechniques}
              onToggle={handleToggleTechnique}
              unlockedTechniques={unlockedTechniques}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Прогноз результата */}
      <AnimatePresence>
        {forecast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <WeaponForecastPanel
              forecast={forecast}
              avgMaterialExpertise={avgMaterialExpertiseForSelection}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Кнопка запуска */}
      <AnimatePresence>
        {selectedRecipe && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Button
              size="lg"
              className={cn(
                "w-full text-lg py-6 flex items-center justify-center gap-2",
                canStartCraft
                  ? "bg-amber-600 hover:bg-amber-500"
                  : "bg-stone-700 cursor-not-allowed"
              )}
              disabled={!canStartCraft}
              onClick={handleStartCraft}
            >
              {canStartCraft ? (
                <>
                  <Hammer className="w-5 h-5" />
                  Начать крафт
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-left line-clamp-3">
                    {!materialProcessingPlanValidation.ok
                      ? materialProcessingPlanValidation.reason
                      : "Недостаточно материалов"}
                  </span>
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <Sheet
        open={processingSheetOpen}
        onOpenChange={open => {
          setProcessingSheetOpen(open)
          if (!open) setProcessingSheetPartId(null)
        }}
      >
        <SheetContent
          side="bottom"
          className="max-h-[88vh] overflow-y-auto rounded-t-xl border-t border-amber-900/40"
        >
          {processingSheetPartId && selectedRecipe
            ? (() => {
                const partId = processingSheetPartId
                const catalogId = selectedMaterials[partId] ?? null
                if (!catalogId) return null
                const processingOpts = getAvailableMaterialProcessingTechniques(
                  catalogId,
                  processingUnlockIds
                )
                if (processingOpts.length === 0) return null
                const part = selectedRecipe.parts.find(p => p.id === partId)
                const supplyEntry = partMaterialSupply[partId]
                const sheetActiveTechniqueName =
                  supplyEntry?.mode === 'ore_smelt' && supplyEntry.processingTechniqueId
                    ? getMaterialProcessingTechniqueById(supplyEntry.processingTechniqueId)
                        ?.name
                    : undefined
                return (
                  <>
                    <SheetHeader className="text-left">
                      <SheetTitle className="text-amber-100">
                        Техника обработки
                      </SheetTitle>
                      <SheetDescription className="space-y-1 text-stone-400">
                        <span className="block">
                          {part?.name ?? partId} — цепочка переработки сырья до нужной заготовки
                        </span>
                        {sheetActiveTechniqueName ? (
                          <span className="block text-sm font-medium text-amber-200/95">
                            {sheetActiveTechniqueName}
                          </span>
                        ) : null}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-4">
                      <PartMaterialProcessingPanel
                        partId={partId}
                        processingOpts={processingOpts}
                        supplyEntry={supplyEntry}
                        onToggleOreSmelt={v =>
                          handleToggleOreSmelt(partId, catalogId, v)
                        }
                        onProcessingTechniqueChange={id =>
                          handleProcessingTechniqueChange(partId, id)
                        }
                      />
                    </div>
                  </>
                )
              })()
            : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default CraftPlanner
