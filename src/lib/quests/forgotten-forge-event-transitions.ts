/**
 * Чистая логика переходов квеста FF по событиям алтаря/крафта (для тестов и хука).
 * @see useForgottenForgeQuestEvents
 */

import * as D from '@/data/quests/forgotten-forge-dialogue'
import { buildAfterAltarPhase1ArchivistMessage } from '@/lib/quests/ff-after-altar-phase1-archivist-message'
import {
  appendArchivistLines,
  taskBannerAnchorFromThread,
} from '@/store/slices/forgotten-forge-quest-slice'
import type { AltarConstructionState, AltarPhase } from '@/types/altar-construction'
import type {
  ArchivistDialogueState,
  ArchivistPendingChoice,
  ForgottenForgeQuestState,
} from '@/types/forgotten-forge-quest'

export type ForgottenForgeUiPhase =
  | 'locked'
  | 'intro'
  | 'awaiting_expedition'
  | 'post_expedition_dialogue'
  | 'open'
  | 'completed'

export type ForgottenForgeEventPatch = {
  forgottenForgeQuest: ForgottenForgeQuestState
  forgottenForgePhase: ForgottenForgeUiPhase
  archivistDialogue: ArchivistDialogueState
  archivistPendingChoices: ArchivistPendingChoice[] | null
  archivistForgottenForgeTaskBannerAfterEntryId: string | null
  altarBuiltInForge?: boolean
  altarConstruction?: AltarConstructionState
}

export type ForgottenForgeEventContext = {
  nowMs: number
  forgottenForgeQuest: ForgottenForgeQuestState
  forgottenForgePhase: ForgottenForgeUiPhase
  archivistDialogue: ArchivistDialogueState
  archivistPendingChoices: ArchivistPendingChoice[] | null
  altarConstruction: AltarConstructionState
  altarBuiltInForge: boolean
  altarUnlockedByForgottenForgeQuest: boolean
  /** Для реплики после фазы I: какие крафт-техники реально открыты (не только сейв). */
  unlockedCraftTechniqueIds: string[]
}

export function reduceForgottenForgeAfterAltarPhaseCompleted(
  ctx: ForgottenForgeEventContext,
  phase: AltarPhase
): ForgottenForgeEventPatch | null {
  const { forgottenForgeQuest: q, nowMs } = ctx
  if (q.status !== 'active') return null

  if (phase === 1 && q.step === 8) {
    const phase1Text = buildAfterAltarPhase1ArchivistMessage(ctx.unlockedCraftTechniqueIds)
    const thread = appendArchivistLines(ctx.archivistDialogue.thread, [phase1Text])
    return {
      forgottenForgeQuest: { ...q, step: 9, lastStepChangeAt: nowMs },
      forgottenForgePhase: 'open',
      archivistDialogue: { thread },
      archivistPendingChoices: ctx.archivistPendingChoices,
      archivistForgottenForgeTaskBannerAfterEntryId: taskBannerAnchorFromThread(thread),
    }
  }

  if (phase === 2 && q.step === 9 && !q.waitingForCraftAfterPhase2) {
    const thread = appendArchivistLines(ctx.archivistDialogue.thread, [D.FF_AFTER_ALTAR_PHASE2_ARCHIVIST])
    return {
      forgottenForgeQuest: {
        ...q,
        step: 9,
        waitingForCraftAfterPhase2: true,
        lastStepChangeAt: nowMs,
      },
      forgottenForgePhase: 'open',
      archivistDialogue: { thread },
      archivistPendingChoices: D.FF_PHASE2_WAIT_CRAFT_CHOICES.map((c) => ({ id: c.id, label: c.label })),
      archivistForgottenForgeTaskBannerAfterEntryId: taskBannerAnchorFromThread(thread),
    }
  }

  if (phase === 3 && q.step === 14) {
    const thread = appendArchivistLines(ctx.archivistDialogue.thread, [D.FF_AFTER_ALTAR_PHASE3_ARCHIVIST])
    return {
      forgottenForgeQuest: { ...q, step: 15, lastStepChangeAt: nowMs },
      forgottenForgePhase: 'awaiting_expedition',
      archivistDialogue: { thread },
      archivistPendingChoices: null,
      archivistForgottenForgeTaskBannerAfterEntryId: taskBannerAnchorFromThread(thread),
    }
  }

  if (phase === 4 && q.step === 16) {
    const thread = appendArchivistLines(ctx.archivistDialogue.thread, [D.FF_AFTER_ALTAR_PHASE4_ARCHIVIST])
    return {
      forgottenForgeQuest: { ...q, step: 17, lastStepChangeAt: nowMs },
      forgottenForgePhase: 'open',
      archivistDialogue: { thread },
      archivistPendingChoices: ctx.archivistPendingChoices,
      archivistForgottenForgeTaskBannerAfterEntryId: taskBannerAnchorFromThread(thread),
    }
  }

  if (phase === 5 && q.step === 17) {
    const thread = appendArchivistLines(ctx.archivistDialogue.thread, [D.FF_FINALE_ARCHIVIST])
    return {
      forgottenForgeQuest: {
        ...q,
        step: 18,
        status: 'completed',
        lastStepChangeAt: nowMs,
      },
      forgottenForgePhase: 'completed',
      archivistDialogue: { thread },
      archivistPendingChoices: D.FF_FINALE_CHOICES.map((c) => ({ id: c.id, label: c.label })),
      archivistForgottenForgeTaskBannerAfterEntryId: taskBannerAnchorFromThread(thread),
      altarBuiltInForge: true,
      altarConstruction: {
        ...ctx.altarConstruction,
        altarUnlocked: ctx.altarUnlockedByForgottenForgeQuest,
        altarBuilt: true,
        completedPhases: [1, 2, 3, 4, 5],
        activePhase: null,
        activePhaseStartTime: 0,
        activePhaseStageIndex: 0,
        activePhaseStageStartTime: 0,
        activePhaseStages: [],
      },
    }
  }

  return null
}

export function reduceForgottenForgeAfterCraftCompleted(
  ctx: ForgottenForgeEventContext,
  recipeId: string,
  isForgottenForgeAltarRecipe: (id: string) => boolean
): ForgottenForgeEventPatch | null {
  if (isForgottenForgeAltarRecipe(recipeId)) return null
  const q = ctx.forgottenForgeQuest
  if (q.status !== 'active' || q.step !== 9 || !q.waitingForCraftAfterPhase2) return null

  const thread = appendArchivistLines(ctx.archivistDialogue.thread, [D.FF_AFTER_CRAFT_DECRYPT_ARCHIVIST])
  return {
    forgottenForgeQuest: {
      ...q,
      step: 11,
      waitingForCraftAfterPhase2: false,
      lastStepChangeAt: ctx.nowMs,
    },
    forgottenForgePhase: 'awaiting_expedition',
    archivistDialogue: { thread },
    archivistPendingChoices: null,
    archivistForgottenForgeTaskBannerAfterEntryId: taskBannerAnchorFromThread(thread),
  }
}
