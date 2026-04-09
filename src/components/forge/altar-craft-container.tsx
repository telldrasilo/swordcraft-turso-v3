/**
 * Крафт v2 только для сборки узла зачарований (рецепт квеста Forgotten Forge).
 * @see docs/systems/ENCHANTMENT_MODULE_PHASE2_ALTAR_CONSTRUCTION.md
 */

'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Hammer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

import { useCraftV2 } from '@/hooks/use-craft-v2'
import { useGameStore } from '@/store/game-store-composed'
import { CraftPlanner } from '@/components/forge/craft-v2/craft-planner'
import { CraftProgress } from '@/components/forge/craft-v2/craft-progress'
import { getRecipeById } from '@/data/recipes'
import { getCraftingCost, type MaterialToBuy } from '@/lib/craft/inventory-check'
import type { PartMaterialSupplyEntry } from '@/types/craft-v2'
import { validateMaterialProcessingPlan } from '@/data/material-processing-techniques'
import { getPlannerUnlockedTechniqueIds } from '@/lib/craft/planner-unlocked-techniques'
import {
  FORGOTTEN_FORGE_ALTAR_RECIPE_ID,
} from '@/lib/craft/altar-construction'

const ALTAR_UNBLOCKED_TECHNIQUES = [
  'basic_forging',
  'balanced_design',
  'folded_steel',
  'double_hardening',
  'spirit_blessing',
  'celestial_hardening',
]

const ALTAR_SOUL_REAGENTS = ['silver_alloy', 'peat', 'mist_herbs'] as const

const ALTAR_MACRO_PHASES = [
  { phase: 1 as const, title: 'I. По листам', short: 'Основание и каркас по чертежу' },
  { phase: 2 as const, title: 'II. Крепёж', short: 'Скобы, стяжки, сборка узла' },
  { phase: 3 as const, title: 'III. Проводка души', short: 'Резонанс и реагенты III фазы' },
]

function AltarMacroPhaseStrip({
  activePhase,
  mode,
}: {
  activePhase: 1 | 2 | 3 | null
  mode: 'planning' | 'crafting'
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {ALTAR_MACRO_PHASES.map(({ phase, title, short }) => {
        const isActive = mode === 'crafting' && activePhase === phase
        const isMuted = mode === 'planning'
        return (
          <div
            key={phase}
            className={cn(
              'rounded-lg border px-3 py-2 text-left transition-colors',
              isActive && 'border-amber-500/80 bg-amber-950/35 text-amber-100',
              !isActive && !isMuted && 'border-stone-600/60 bg-stone-900/40 text-stone-400',
              isMuted && 'border-stone-700/70 bg-stone-900/30 text-stone-500'
            )}
          >
            <p className="text-xs font-semibold text-amber-200/90">{title}</p>
            <p className="text-[11px] mt-0.5 leading-snug">{short}</p>
          </div>
        )
      })}
    </div>
  )
}

interface AltarCraftContainerProps {
  playerLevel: number
  forgeLevel?: number
}

export function AltarCraftContainer({
  playerLevel,
  forgeLevel = 1,
}: AltarCraftContainerProps) {
  const inventory = useGameStore(state => state.resources)
  const materialStash = useGameStore(state => state.materialStash)
  const gold = useGameStore(state => state.resources.gold)
  const spendCraftingCostWithStash = useGameStore(state => state.spendCraftingCostWithStash)
  const spendResource = useGameStore(state => state.spendResource)
  const grantResourceKeyFromWorld = useGameStore(state => state.grantResourceKeyFromWorld)
  const materialKnowledge = useGameStore(state => state.materialKnowledge)
  const unlockedMaterialProcessingTechniqueIds = useGameStore(
    state => state.unlockedMaterialProcessingTechniqueIds
  )
  const setShouldPurchaseMaterials = useGameStore(state => state.setShouldPurchaseMaterials)
  const unlockedCraftTechniqueIds = useGameStore(state => state.unlockedCraftTechniqueIds)
  const [startError, setStartError] = useState<string | null>(null)

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
    setPartMaterialSupply,
    clearLastStartCraftError,
  } = useCraftV2(playerLevel, forgeLevel)

  const availableAltarTechniques = useMemo(
    () => Array.from(new Set([...ALTAR_UNBLOCKED_TECHNIQUES, ...unlockedCraftTechniqueIds])),
    [unlockedCraftTechniqueIds]
  )

  const currentMacroPhase = useMemo(() => {
    if (!state.activeCraft || state.activeCraft.stages.length === 0) return 1
    const idx = state.activeCraft.currentStageIndex
    const total = state.activeCraft.stages.length
    const p1 = Math.ceil(total * 0.34)
    const p2 = Math.ceil(total * 0.67)
    if (idx < p1) return 1
    if (idx < p2) return 2
    return 3
  }, [state.activeCraft])

  const handleStartCraft = useCallback(
    (plan: {
      recipeId: string
      materials: Record<string, { materialId: string; quantity: number }>
      techniques: string[]
      shouldPurchaseMaterials?: boolean
      partMaterialSupply?: Record<string, PartMaterialSupplyEntry>
    }) => {
      clearLastStartCraftError()

      const recipe = getRecipeById(plan.recipeId)
      if (!recipe) {
        setStartError('Рецепт сборки алтаря недоступен. Откройте вкладку заново.')
        return
      }

      const partSupply =
        plan.partMaterialSupply && Object.keys(plan.partMaterialSupply).length > 0
          ? plan.partMaterialSupply
          : undefined
      setPartMaterialSupply(plan.partMaterialSupply ?? {})

      const procUnlock = getPlannerUnlockedTechniqueIds({
        playerLevel,
        unlockedMaterialProcessingTechniqueIds:
          useGameStore.getState().unlockedMaterialProcessingTechniqueIds ?? [],
      })
      const procPlan = validateMaterialProcessingPlan(
        plan.materials,
        partSupply,
        plan.techniques,
        procUnlock
      )
      if (!procPlan.ok) {
        setStartError(
          procPlan.reason ??
            'План обработки материалов невалиден. Проверьте выбор материалов и техник.'
        )
        return
      }

      if (plan.shouldPurchaseMaterials) {
        setShouldPurchaseMaterials(true)
      }

      const cost = getCraftingCost(recipe, plan.materials, partSupply)
      const spent = spendCraftingCostWithStash(cost)
      if (!spent) {
        setStartError('Не хватает материалов на складе для запуска этой стадии сборки.')
        return
      }

      setStartError(null)

      setRecipe(plan.recipeId)
      Object.entries(plan.materials).forEach(([partId, { materialId, quantity }]) => {
        setMaterial(partId, materialId, quantity)
      })
      setTechniques(plan.techniques)

      setTimeout(() => {
        calculatePreview()
        startCraft()
      }, 100)
    },
    [
      setRecipe,
      setMaterial,
      setTechniques,
      calculatePreview,
      startCraft,
      spendCraftingCostWithStash,
      setShouldPurchaseMaterials,
      setPartMaterialSupply,
      playerLevel,
      clearLastStartCraftError,
    ]
  )

  const handleBuyMaterials = useCallback(
    (materials: MaterialToBuy[], totalCost: number) => {
      if (gold < totalCost) return
      spendResource('gold', totalCost)
      materials.forEach(mat => {
        grantResourceKeyFromWorld(mat.resourceKey, mat.quantity)
      })
    },
    [gold, spendResource, grantResourceKeyFromWorld]
  )

  const materialPrices = useMemo(() => ({} as Record<string, number>), [])

  const combinedStartError = startError ?? state.lastStartCraftError

  const renderContent = () => {
    switch (state.stage) {
      case 'planning':
        return (
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <CraftPlanner
              playerLevel={playerLevel}
              inventory={inventory}
              materialStash={materialStash}
              gold={gold}
              availableMaterials={[]}
              unlockedRecipes={[FORGOTTEN_FORGE_ALTAR_RECIPE_ID]}
              unlockedTechniques={availableAltarTechniques}
              unlockedMaterialProcessingTechniqueIds={unlockedMaterialProcessingTechniqueIds}
              materialKnowledge={materialKnowledge}
              materialPrices={materialPrices}
              fixedRecipeId={FORGOTTEN_FORGE_ALTAR_RECIPE_ID}
              onStartCraft={handleStartCraft}
              onBuyMaterials={handleBuyMaterials}
            />
            <div className="space-y-2">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">
                Этапы эпилога кузницы
              </p>
              <AltarMacroPhaseStrip activePhase={null} mode="planning" />
            </div>
            <Alert className="border-indigo-800/50 bg-indigo-950/20 text-indigo-100">
              <AlertTitle>Проводка души (фаза III)</AlertTitle>
              <AlertDescription>
                В слотах III выберите реагенты: <code>silver_alloy</code> (лунное серебро),{' '}
                <code>peat</code> (торф / болотная зола), <code>mist_herbs</code> (слеза тумана). Фазы
                I–II — обычные материалы tier 1–2 по чертежу.
              </AlertDescription>
            </Alert>
            {combinedStartError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Не удалось запустить или продолжить сборку</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>{combinedStartError}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-red-300/40 text-red-100"
                    onClick={() => {
                      setStartError(null)
                      clearLastStartCraftError()
                    }}
                  >
                    Скрыть сообщение
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </motion.div>
        )

      case 'crafting':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-amber-200 flex items-center gap-2">
                <Hammer className="w-5 h-5 text-amber-500 animate-pulse" />
                Сборка узла
              </h3>
              <Button type="button" variant="ghost" size="sm" onClick={cancelCraft}>
                Отмена
              </Button>
            </div>
            <AltarMacroPhaseStrip
              activePhase={currentMacroPhase as 1 | 2 | 3}
              mode="crafting"
            />
            <Alert className="border-amber-800/50 bg-amber-950/20 text-amber-100">
              <AlertTitle>Текущая макрофаза: {currentMacroPhase}/3</AlertTitle>
              <AlertDescription>
                {currentMacroPhase === 1 && 'I. По листам: подготовка основания и каркаса.'}
                {currentMacroPhase === 2 && 'II. Крепёж: стяжки, скобы и финальная сборка узла.'}
                {currentMacroPhase === 3 &&
                  `III. Проводка души: реагенты ${ALTAR_SOUL_REAGENTS.join(', ')}.`}
              </AlertDescription>
            </Alert>
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
        if (!state.completedWeapon) {
          return (
            <div className="space-y-3 text-stone-300 text-sm">
              <p>Сборка завершена. Состояние кузницы обновлено.</p>
              <Button type="button" variant="secondary" size="sm" onClick={() => { collectWeapon(); reset(); }}>
                OK
              </Button>
            </div>
          )
        }
        return null

      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
    </div>
  )
}
