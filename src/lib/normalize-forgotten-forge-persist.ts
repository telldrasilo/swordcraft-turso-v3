/**
 * Нормализация blob квеста «Эхо забытой кузни» из облака / API.
 */

import { initialForgottenForgeQuestSlice } from '@/store/slices/forgotten-forge-quest-slice'
import { coerceAltarPhase } from '@/lib/altar/coerce-altar-phase'
import {
  initialAltarConstructionState,
  type AltarConstructionState,
  type AltarPhase,
  type AltarStage,
} from '@/types/altar-construction'
import type {
  ArchivistDialogueState,
  ArchivistPendingChoice,
  ForgottenForgeQuestState,
} from '@/types/forgotten-forge-quest'
import { FORGOTTEN_FORGE_QUEST_STEP_MAX } from '@/types/forgotten-forge-quest'

const ALTAR_PHASES = new Set<AltarPhase>([1, 2, 3, 4, 5])

function parseAltarPhase(n: unknown): AltarPhase | null {
  return coerceAltarPhase(n)
}

function normalizeAltarStage(raw: unknown): AltarStage | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null
  const o = raw as Record<string, unknown>
  const id = o['id']
  const name = o['name']
  const durationSec = o['durationSec']
  const description = o['description']
  if (typeof id !== 'string' || typeof name !== 'string' || typeof description !== 'string') return null
  const dur = typeof durationSec === 'number' && Number.isFinite(durationSec) ? Math.max(0, durationSec) : null
  if (dur === null) return null
  const techniqueId = o['techniqueId']
  const stage: AltarStage = {
    id,
    name,
    durationSec: dur,
    description,
  }
  if (typeof techniqueId === 'string' && techniqueId.length > 0) {
    stage.techniqueId = techniqueId
  }
  return stage
}

export function normalizeAltarConstructionFromSave(
  raw: unknown,
  sync: { altarUnlocked: boolean; altarBuilt: boolean }
): AltarConstructionState {
  const base: AltarConstructionState = {
    ...initialAltarConstructionState,
    altarUnlocked: sync.altarUnlocked,
    altarBuilt: sync.altarBuilt,
  }
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return base
  }
  const o = raw as Record<string, unknown>

  const completed: AltarPhase[] = []
  const c = o['completedPhases']
  if (Array.isArray(c)) {
    for (const p of c) {
      const ph = parseAltarPhase(p)
      if (ph && !completed.includes(ph)) completed.push(ph)
    }
  }

  const activePhase = parseAltarPhase(o['activePhase'])
  const stagesRaw = o['activePhaseStages']
  const stages: AltarStage[] = []
  if (Array.isArray(stagesRaw)) {
    for (const s of stagesRaw) {
      const st = normalizeAltarStage(s)
      if (st) stages.push(st)
    }
  }

  const idx = o['activePhaseStageIndex']
  const stageIndex =
    typeof idx === 'number' && Number.isFinite(idx) ? Math.max(0, Math.floor(idx)) : 0

  const start = o['activePhaseStartTime']
  const stageStart = o['activePhaseStageStartTime']
  const activePhaseStartTime =
    typeof start === 'number' && Number.isFinite(start) ? Math.max(0, start) : 0
  const activePhaseStageStartTime =
    typeof stageStart === 'number' && Number.isFinite(stageStart) ? Math.max(0, stageStart) : 0

  return {
    altarUnlocked: sync.altarUnlocked,
    altarBuilt: sync.altarBuilt,
    completedPhases: completed.filter((p) => ALTAR_PHASES.has(p)),
    activePhase,
    activePhaseStartTime,
    activePhaseStageIndex: stageIndex,
    activePhaseStageStartTime,
    activePhaseStages: stages,
  }
}

function normalizeMaterialStashQuestItemIdsFromSave(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const out: string[] = []
  for (const x of raw) {
    if (typeof x === 'string' && x.length > 0 && !out.includes(x)) out.push(x)
  }
  return out
}

export interface ForgottenForgePersistPayload {
  forgottenForgeQuest: ForgottenForgeQuestState
  forgottenForgePhase: string
  archivistDialogue: ArchivistDialogueState
  archivistPendingChoices: ArchivistPendingChoice[] | null
  archivistForgottenForgeTaskBannerAfterEntryId: string | null
  altarUnlockedByForgottenForgeQuest: boolean
  /** Узел собран в кузнице (синхрон с `altarBuiltInForge` в store) */
  altarBuiltInForge: boolean
  messagesDockEncyclopediaReadUpToTs: number
  messagesDockArchivistReadUpToTs: number
  /** Прогресс строительства алтаря v2 */
  altarConstruction: AltarConstructionState
  /** Квестовые материалы на складе (id из каталога) */
  materialStashQuestItemIds: string[]
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
    archivistForgottenForgeTaskBannerAfterEntryId:
      d.archivistForgottenForgeTaskBannerAfterEntryId ?? null,
    altarUnlockedByForgottenForgeQuest: false,
    altarBuiltInForge: false,
    messagesDockEncyclopediaReadUpToTs: 0,
    messagesDockArchivistReadUpToTs: 0,
    altarConstruction: { ...initialAltarConstructionState },
    materialStashQuestItemIds: [],
  }
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return base
  const o = raw as Record<string, unknown>

  const fq = o['forgottenForgeQuest']
  if (fq && typeof fq === 'object' && !Array.isArray(fq)) {
    const x = fq as Record<string, unknown>
    const stepRaw = x['step']
    const step =
      typeof stepRaw === 'number' &&
      Number.isFinite(stepRaw) &&
      stepRaw >= 0 &&
      stepRaw <= FORGOTTEN_FORGE_QUEST_STEP_MAX
        ? Math.floor(stepRaw)
        : base.forgottenForgeQuest.step

    const waiting = x['waitingForCraftAfterPhase2'] === true
    const lastAt = x['lastStepChangeAt']
    const lastStepChangeAt =
      typeof lastAt === 'number' && Number.isFinite(lastAt) ? lastAt : null

    base.forgottenForgeQuest = {
      status:
        x['status'] === 'locked' ||
        x['status'] === 'available' ||
        x['status'] === 'active' ||
        x['status'] === 'completed'
          ? x['status']
          : base.forgottenForgeQuest.status,
      step,
      waitingForCraftAfterPhase2: waiting,
      lastStepChangeAt,
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

  const bannerId = o['archivistForgottenForgeTaskBannerAfterEntryId']
  if (typeof bannerId === 'string' && bannerId.length > 0) {
    base.archivistForgottenForgeTaskBannerAfterEntryId = bannerId
  } else if (bannerId === null) {
    base.archivistForgottenForgeTaskBannerAfterEntryId = null
  }

  const alt = o['altarUnlockedByForgottenForgeQuest']
  if (typeof alt === 'boolean') {
    base.altarUnlockedByForgottenForgeQuest = alt
  }

  const built = o['altarBuiltInForge']
  if (typeof built === 'boolean') {
    base.altarBuiltInForge = built
  }

  const encRead = o['messagesDockEncyclopediaReadUpToTs']
  if (typeof encRead === 'number' && Number.isFinite(encRead)) {
    base.messagesDockEncyclopediaReadUpToTs = encRead
  }
  const archRead = o['messagesDockArchivistReadUpToTs']
  if (typeof archRead === 'number' && Number.isFinite(archRead)) {
    base.messagesDockArchivistReadUpToTs = archRead
  }

  base.materialStashQuestItemIds = normalizeMaterialStashQuestItemIdsFromSave(o['materialStashQuestItemIds'])

  base.altarConstruction = normalizeAltarConstructionFromSave(o['altarConstruction'], {
    altarUnlocked: base.altarUnlockedByForgottenForgeQuest,
    altarBuilt: base.altarBuiltInForge,
  })

  const fqUnlock = base.forgottenForgeQuest
  if (
    base.altarUnlockedByForgottenForgeQuest !== true &&
    (fqUnlock.status === 'completed' ||
      (fqUnlock.status === 'active' && fqUnlock.step >= 7))
  ) {
    base.altarUnlockedByForgottenForgeQuest = true
    base.altarConstruction = normalizeAltarConstructionFromSave(o['altarConstruction'], {
      altarUnlocked: true,
      altarBuilt: base.altarBuiltInForge,
    })
  }

  return base
}
