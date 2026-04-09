/**
 * Нормализация blob квеста «Эхо забытой кузни» из облака / API.
 */

import { initialForgottenForgeQuestSlice } from '@/store/slices/forgotten-forge-quest-slice'
import type {
  ArchivistDialogueState,
  ArchivistPendingChoice,
  ForgottenForgeQuestState,
} from '@/types/forgotten-forge-quest'

export interface ForgottenForgePersistPayload {
  forgottenForgeQuest: ForgottenForgeQuestState
  forgottenForgePhase: string
  archivistDialogue: ArchivistDialogueState
  archivistPendingChoices: ArchivistPendingChoice[] | null
  altarUnlockedByForgottenForgeQuest: boolean
  /** Узел собран в кузнице (синхрон с `altarBuiltInForge` в store) */
  altarBuiltInForge: boolean
  messagesDockEncyclopediaReadUpToTs: number
  messagesDockArchivistReadUpToTs: number
}

export function normalizeForgottenForgePersistFromSave(raw: unknown): ForgottenForgePersistPayload {
  const d = initialForgottenForgeQuestSlice
  const base: ForgottenForgePersistPayload = {
    forgottenForgeQuest: { ...d.forgottenForgeQuest },
    forgottenForgePhase: d.forgottenForgePhase,
    archivistDialogue: {
      thread: Array.isArray(d.archivistDialogue.thread) ? [...d.archivistDialogue.thread] : [],
    },
    archivistPendingChoices: d.archivistPendingChoices,
    altarUnlockedByForgottenForgeQuest: false,
    altarBuiltInForge: false,
    messagesDockEncyclopediaReadUpToTs: 0,
    messagesDockArchivistReadUpToTs: 0,
  }
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return base
  const o = raw as Record<string, unknown>

  const fq = o['forgottenForgeQuest']
  if (fq && typeof fq === 'object' && !Array.isArray(fq)) {
    const x = fq as Record<string, unknown>
    base.forgottenForgeQuest = {
      status:
        x['status'] === 'locked' ||
        x['status'] === 'available' ||
        x['status'] === 'active' ||
        x['status'] === 'completed'
          ? x['status']
          : base.forgottenForgeQuest.status,
      step: typeof x['step'] === 'number' && x['step'] >= 0 && x['step'] <= 7 ? x['step'] : base.forgottenForgeQuest.step,
      step0Choice:
        x['step0Choice'] === 1 || x['step0Choice'] === 2 || x['step0Choice'] === 3
          ? x['step0Choice']
          : undefined,
      flags:
        x['flags'] && typeof x['flags'] === 'object' && !Array.isArray(x['flags'])
          ? { ...(x['flags'] as ForgottenForgeQuestState['flags']) }
          : {},
    }
  }

  const phase = o['forgottenForgePhase']
  if (typeof phase === 'string' && phase.length > 0) {
    base.forgottenForgePhase = phase
  }

  const ad = o['archivistDialogue']
  if (ad && typeof ad === 'object' && !Array.isArray(ad)) {
    const t = (ad as { thread?: unknown })['thread']
    if (Array.isArray(t)) {
      base.archivistDialogue = { thread: t as ArchivistDialogueState['thread'] }
    }
  }

  const pc = o['archivistPendingChoices']
  if (pc === null) {
    base.archivistPendingChoices = null
  } else if (Array.isArray(pc)) {
    base.archivistPendingChoices = pc as ArchivistPendingChoice[]
  }

  const alt = o['altarUnlockedByForgottenForgeQuest']
  if (typeof alt === 'boolean') {
    base.altarUnlockedByForgottenForgeQuest = alt
  }

  const built = o['altarBuiltInForge']
  if (typeof built === 'boolean') {
    base.altarBuiltInForge = built
  } else if (base.altarUnlockedByForgottenForgeQuest) {
    base.altarBuiltInForge = true
  }

  const encRead = o['messagesDockEncyclopediaReadUpToTs']
  if (typeof encRead === 'number' && Number.isFinite(encRead)) {
    base.messagesDockEncyclopediaReadUpToTs = encRead
  }
  const archRead = o['messagesDockArchivistReadUpToTs']
  if (typeof archRead === 'number' && Number.isFinite(archRead)) {
    base.messagesDockArchivistReadUpToTs = archRead
  }

  return base
}
