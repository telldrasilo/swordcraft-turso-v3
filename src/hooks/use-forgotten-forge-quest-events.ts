'use client'

import { useEffect } from 'react'
import { useGameStore } from '@/store/game-store-composed'
import { gameEvents } from '@/lib/game-events'
import { isForgottenForgeAltarRecipe } from '@/lib/craft/altar-construction'
import {
  reduceForgottenForgeAfterAltarPhaseCompleted,
  reduceForgottenForgeAfterCraftCompleted,
  type ForgottenForgeEventContext,
} from '@/lib/quests/forgotten-forge-event-transitions'

/**
 * Реакция квеста FF v2 на события стройки и крафта (без циклических импортов store).
 * Экспедиции обрабатываются в forgotten-forge-quest-slice.advanceForgottenForgeAfterExpedition.
 */
export function useForgottenForgeQuestEvents() {
  useEffect(() => {
    const buildCtx = (): ForgottenForgeEventContext => {
      const s = useGameStore.getState()
      return {
        nowMs: Date.now(),
        forgottenForgeQuest: s.forgottenForgeQuest,
        forgottenForgePhase: s.forgottenForgePhase,
        archivistDialogue: s.archivistDialogue,
        archivistPendingChoices: s.archivistPendingChoices,
        altarConstruction: s.altarConstruction,
        altarBuiltInForge: s.altarBuiltInForge,
        altarUnlockedByForgottenForgeQuest: s.altarUnlockedByForgottenForgeQuest,
        unlockedCraftTechniqueIds: s.unlockedCraftTechniqueIds,
      }
    }

    const offAltar = gameEvents.on('altar:phaseCompleted', ({ phase }) => {
      const patch = reduceForgottenForgeAfterAltarPhaseCompleted(buildCtx(), phase)
      if (patch) useGameStore.setState(patch)
    })

    const offCraft = gameEvents.on('craft:completed', ({ recipeId }) => {
      const patch = reduceForgottenForgeAfterCraftCompleted(buildCtx(), recipeId, isForgottenForgeAltarRecipe)
      if (patch) useGameStore.setState(patch)
    })

    return () => {
      offAltar()
      offCraft()
    }
  }, [])

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    const w = window as Window & { resetForgottenForgeQuest?: () => void }
    w.resetForgottenForgeQuest = () => {
      const s = useGameStore.getState()
      s.resetForgottenForgeQuestDev()
      s.tickForgottenForgeQuestAvailability()
    }
    return () => {
      delete w.resetForgottenForgeQuest
    }
  }, [])
}
