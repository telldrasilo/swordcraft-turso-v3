/**
 * Квест «Эхо забытой кузни»: состояние, архивариус, канал дока.
 */

import { getAvailableLocations } from '@/modules/expeditions/data/locations'
import { generateId } from '@/lib/store-utils/generators'
import {
  FORGOTTEN_FORGE_PROGRESS_LINES,
  FORGOTTEN_FORGE_QUEST_ID,
  FORGOTTEN_FORGE_STEP3_INSURANCE_GOLD,
} from '@/data/quests/forgotten-forge'
import * as D from '@/data/quests/forgotten-forge-dialogue'
import { canAdvanceForgottenForgeAfterExpedition } from '@/lib/quests/forgotten-forge-advance'
import type { GameMessage } from '@/types/game-message'
import type {
  ArchivistDialogueState,
  ArchivistPendingChoice,
  ArchivistThreadEntry,
  ForgottenForgeQuestState,
  GameMessagesDockChannel,
} from '@/types/forgotten-forge-quest'

export type QuestPhase =
  | 'locked'
  | 'intro'
  | 'awaiting_expedition'
  | 'post_expedition_dialogue'
  | 'completed'

export interface ForgottenForgeQuestSliceState {
  forgottenForgeQuest: ForgottenForgeQuestState
  /** Внутренняя фаза UI квеста */
  forgottenForgePhase: QuestPhase
  archivistDialogue: ArchivistDialogueState
  archivistPendingChoices: ArchivistPendingChoice[] | null
  /** Не персистится — сброс при загрузке */
  messagesDockChannel: GameMessagesDockChannel
  /** Не персистится — триггер открытия дока из кода (карточка квеста и т.д.) */
  messagesDockOpenNonce: number
  /** Все сообщения энциклопедии с ts ≤ этого считаются прочитанными */
  messagesDockEncyclopediaReadUpToTs: number
  /** Все реплики архивариуса/игрока с ts ≤ этого считаются прочитанными */
  messagesDockArchivistReadUpToTs: number
}

export interface ForgottenForgeQuestSliceActions {
  setMessagesDockChannel: (ch: GameMessagesDockChannel) => void
  /** Развернуть док (мобильный Sheet / десктоп), переключить канал */
  openMessagesDock: (channel?: GameMessagesDockChannel) => void
  /** Пометить текущие сообщения и диалог как прочитанные (обновляет пороги ts) */
  markMessagesDockRead: () => void
  /** Вызывать при загрузке экрана гильдии / после rehydrate */
  tickForgottenForgeQuestAvailability: () => void
  selectArchivistChoice: (choiceId: string) => void
  setForgottenForgeStep3Insurance: (insured: boolean) => void
  setForgottenForgeStep5Cleanse: (mode: 'magic' | 'physical') => void
  setForgottenForgeStep6Anselm: (mode: 'deal' | 'theft') => void
  /** После успешной экспедиции с linkedQuestId (из cross-slice) */
  advanceForgottenForgeAfterExpedition: (payload: {
    locationId?: string
    success: boolean
    linkedQuestId?: typeof FORGOTTEN_FORGE_QUEST_ID
  }) => void
  /**
   * Только для dev: мгновенно доводит квест до финала (как после эпилога) и выдаёт чертёж алтаря.
   */
  completeForgottenForgeQuestDev: () => void
}

export type ForgottenForgeQuestSlice = ForgottenForgeQuestSliceState & ForgottenForgeQuestSliceActions

const initialQuest: ForgottenForgeQuestState = {
  status: 'locked',
  step: 0,
  flags: {},
}

function pushThread(
  thread: ArchivistThreadEntry[],
  speaker: ArchivistThreadEntry['speaker'],
  text: string
): ArchivistThreadEntry[] {
  return [...thread, { id: generateId(), ts: Date.now(), speaker, text }]
}

export const initialForgottenForgeQuestSlice: ForgottenForgeQuestSliceState = {
  forgottenForgeQuest: initialQuest,
  forgottenForgePhase: 'locked',
  archivistDialogue: { thread: [] },
  archivistPendingChoices: null,
  messagesDockChannel: 'encyclopedia',
  messagesDockOpenNonce: 0,
  messagesDockEncyclopediaReadUpToTs: 0,
  messagesDockArchivistReadUpToTs: 0,
}

export function createForgottenForgeQuestSlice<
  T extends ForgottenForgeQuestSliceState & {
    guild: { level: number }
    gameMessages: GameMessage[]
  } & Record<string, unknown>,
>(
  set: (partial: Partial<T> | ((s: T) => Partial<T>)) => void,
  get: () => T
): ForgottenForgeQuestSlice {
  return {
    ...initialForgottenForgeQuestSlice,

    setMessagesDockChannel: (ch: GameMessagesDockChannel) =>
      set({ messagesDockChannel: ch } as Partial<T>),

    openMessagesDock: (channel?: GameMessagesDockChannel) => {
      set((s) => ({
        messagesDockChannel: channel ?? 'archivist',
        messagesDockOpenNonce: (s.messagesDockOpenNonce ?? 0) + 1,
      } as Partial<T>))
    },

    markMessagesDockRead: () => {
      const state = get()
      const msgs = Array.isArray(state.gameMessages) ? state.gameMessages : []
      let encMax = 0
      for (const m of msgs) {
        if (m.kind === 'encyclopedia' && m.ts > encMax) encMax = m.ts
      }
      const thread = state.archivistDialogue?.thread ?? []
      let archMax = 0
      for (const e of thread) {
        if (e.ts > archMax) archMax = e.ts
      }
      set({
        messagesDockEncyclopediaReadUpToTs: Math.max(
          state.messagesDockEncyclopediaReadUpToTs ?? 0,
          encMax
        ),
        messagesDockArchivistReadUpToTs: Math.max(
          state.messagesDockArchivistReadUpToTs ?? 0,
          archMax
        ),
      } as Partial<T>)
    },

    tickForgottenForgeQuestAvailability: () => {
      const state = get()
      const guildLevel = state.guild.level
      const tier2 = getAvailableLocations(guildLevel).some((l) => l.tier >= 2)
      const q = state.forgottenForgeQuest
      if (!tier2 || q.status !== 'locked') return

      const thread = pushThread([], 'archivist', D.FF_INTRO_ARCHIVIST)
      set({
        forgottenForgeQuest: { ...q, status: 'available', step: 0 },
        forgottenForgePhase: 'intro',
        archivistDialogue: { thread },
        archivistPendingChoices: D.FF_INTRO_CHOICES.map((c) => ({ id: c.id, label: c.label })),
        messagesDockChannel: 'archivist',
      } as Partial<T>)
    },

    setForgottenForgeStep3Insurance: (insured: boolean) => {
      set((s) => ({
        forgottenForgeQuest: {
          ...s.forgottenForgeQuest,
          flags: { ...s.forgottenForgeQuest.flags, step3Insurance: insured },
        },
      } as Partial<T>))
    },

    setForgottenForgeStep5Cleanse: (mode: 'magic' | 'physical') => {
      set((s) => ({
        forgottenForgeQuest: {
          ...s.forgottenForgeQuest,
          flags: { ...s.forgottenForgeQuest.flags, step5Cleanse: mode },
        },
      } as Partial<T>))
    },

    setForgottenForgeStep6Anselm: (mode: 'deal' | 'theft') => {
      set((s) => ({
        forgottenForgeQuest: {
          ...s.forgottenForgeQuest,
          flags: { ...s.forgottenForgeQuest.flags, step6Anselm: mode },
        },
      } as Partial<T>))
    },

    selectArchivistChoice: (choiceId: string) => {
      const state = get()
      const q = state.forgottenForgeQuest
      const phase = state.forgottenForgePhase
      const pending = state.archivistPendingChoices
      if (!pending?.some((c) => c.id === choiceId)) return

      let thread = state.archivistDialogue.thread
      const label = pending.find((c) => c.id === choiceId)?.label ?? '…'
      thread = pushThread(thread, 'player', label)

      let nextQuest = { ...q }
      let nextPhase: QuestPhase = phase
      let nextPending: ArchivistPendingChoice[] | null = null

      if (phase === 'intro' && q.step === 0) {
        const reply = D.FF_INTRO_REPLIES[choiceId]
        if (reply) thread = pushThread(thread, 'archivist', reply)
        const c0 =
          choiceId === 'ff_s0_1' ? 1 : choiceId === 'ff_s0_2' ? 2 : choiceId === 'ff_s0_3' ? 3 : undefined
        nextQuest = { ...q, status: 'active', step: 1, step0Choice: c0 }
        nextPhase = 'awaiting_expedition'
        nextPending = null
      } else if (phase === 'post_expedition_dialogue') {
        const s = q.step
        if (s === 1) {
          const r = D.FF_AFTER_EXP_1_REPLIES[choiceId]
          if (r) thread = pushThread(thread, 'archivist', r)
          nextQuest = { ...q, step: 2 }
          nextPhase = 'awaiting_expedition'
        } else if (s === 2) {
          const r = D.FF_AFTER_EXP_2_REPLIES[choiceId]
          if (r) thread = pushThread(thread, 'archivist', r)
          nextQuest = { ...q, step: 3 }
          nextPhase = 'awaiting_expedition'
        } else if (s === 3) {
          const r = D.FF_AFTER_EXP_3_REPLIES[choiceId]
          if (r) thread = pushThread(thread, 'archivist', r)
          nextQuest = { ...q, step: 4 }
          nextPhase = 'awaiting_expedition'
        } else if (s === 4) {
          const r = D.FF_AFTER_EXP_4_REPLIES[choiceId]
          if (r) thread = pushThread(thread, 'archivist', r)
          nextQuest = { ...q, step: 5 }
          nextPhase = 'awaiting_expedition'
        } else if (s === 5) {
          const r = D.FF_AFTER_EXP_5_REPLIES[choiceId]
          if (r) thread = pushThread(thread, 'archivist', r)
          nextQuest = { ...q, step: 6 }
          nextPhase = 'awaiting_expedition'
        } else if (s === 6) {
          const r = D.FF_AFTER_EXP_6_REPLIES[choiceId]
          if (r) thread = pushThread(thread, 'archivist', r)
          thread = pushThread(thread, 'archivist', D.FF_EPILOGUE_ARCHIVIST)
          nextQuest = { ...q, step: 7 }
          nextPhase = 'post_expedition_dialogue'
          nextPending = D.FF_EPILOGUE_CHOICES.map((c) => ({ id: c.id, label: c.label }))
        } else if (s === 7) {
          const r = D.FF_EPILOGUE_REPLIES[choiceId]
          if (r) thread = pushThread(thread, 'archivist', r)
          nextQuest = { ...q, status: 'completed', step: 7 }
          nextPhase = 'completed'
          nextPending = null
        }
      }

      const altarDone = nextQuest.status === 'completed'

      set({
        archivistDialogue: { thread },
        forgottenForgeQuest: nextQuest,
        forgottenForgePhase: nextPhase,
        archivistPendingChoices: nextPending,
        ...(altarDone ? { altarUnlockedByForgottenForgeQuest: true } : {}),
      } as Partial<T>)
    },

    completeForgottenForgeQuestDev: () => {
      set({
        forgottenForgeQuest: {
          status: 'completed',
          step: 7,
          step0Choice: 1,
          flags: {
            step3Insurance: false,
            step5Cleanse: 'magic',
            step6Anselm: 'deal',
          },
        },
        forgottenForgePhase: 'completed',
        archivistPendingChoices: null,
        altarUnlockedByForgottenForgeQuest: true,
      } as unknown as Partial<T>)
    },

    advanceForgottenForgeAfterExpedition: ({
      locationId,
      success,
      linkedQuestId,
    }: {
      locationId?: string
      success: boolean
      linkedQuestId?: string
    }) => {
      const state = get()
      if (
        !canAdvanceForgottenForgeAfterExpedition({
          forgottenForgeQuest: state.forgottenForgeQuest,
          forgottenForgePhase: state.forgottenForgePhase,
          locationId,
          success,
          linkedQuestId,
        })
      ) {
        return
      }

      const q = state.forgottenForgeQuest
      let thread = state.archivistDialogue.thread

      if (q.step === 1) {
        thread = pushThread(thread, 'archivist', D.FF_AFTER_EXP_1_ARCHIVIST)
        set({
          archivistDialogue: { thread },
          archivistPendingChoices: D.FF_AFTER_EXP_1_CHOICES.map((c) => ({ id: c.id, label: c.label })),
          forgottenForgePhase: 'post_expedition_dialogue',
        } as Partial<T>)
        return
      }
      if (q.step === 2) {
        thread = pushThread(thread, 'archivist', D.FF_AFTER_EXP_2_ARCHIVIST)
        set({
          archivistDialogue: { thread },
          archivistPendingChoices: D.FF_AFTER_EXP_2_CHOICES.map((c) => ({ id: c.id, label: c.label })),
          forgottenForgePhase: 'post_expedition_dialogue',
        } as Partial<T>)
        return
      }
      if (q.step === 3) {
        const insured = q.flags.step3Insurance === true
        const body = insured ? D.FF_AFTER_EXP_3_INSURED : D.FF_AFTER_EXP_3_RISK
        thread = pushThread(thread, 'archivist', body)
        set({
          archivistDialogue: { thread },
          archivistPendingChoices: D.FF_AFTER_EXP_3_CHOICES.map((c) => ({ id: c.id, label: c.label })),
          forgottenForgePhase: 'post_expedition_dialogue',
        } as Partial<T>)
        return
      }
      if (q.step === 4) {
        thread = pushThread(thread, 'archivist', D.FF_AFTER_EXP_4_ARCHIVIST)
        set({
          archivistDialogue: { thread },
          archivistPendingChoices: D.FF_AFTER_EXP_4_CHOICES.map((c) => ({ id: c.id, label: c.label })),
          forgottenForgePhase: 'post_expedition_dialogue',
        } as Partial<T>)
        return
      }
      if (q.step === 5) {
        const magic = q.flags.step5Cleanse === 'magic'
        const body = magic ? D.FF_AFTER_EXP_5_MAGIC : D.FF_AFTER_EXP_5_PHYS
        thread = pushThread(thread, 'archivist', body)
        set({
          archivistDialogue: { thread },
          archivistPendingChoices: D.FF_AFTER_EXP_5_CHOICES.map((c) => ({ id: c.id, label: c.label })),
          forgottenForgePhase: 'post_expedition_dialogue',
        } as Partial<T>)
        return
      }
      if (q.step === 6) {
        const deal = q.flags.step6Anselm !== 'theft'
        const body = deal ? D.FF_AFTER_EXP_6_DEAL : D.FF_AFTER_EXP_6_THEFT
        thread = pushThread(thread, 'archivist', body)
        set({
          archivistDialogue: { thread },
          archivistPendingChoices: D.FF_AFTER_EXP_6_CHOICES.map((c) => ({ id: c.id, label: c.label })),
          forgottenForgePhase: 'post_expedition_dialogue',
        } as Partial<T>)
        return
      }
    },
  } as unknown as ForgottenForgeQuestSlice
}

export { FORGOTTEN_FORGE_QUEST_ID }

/** Старт экспедиции квеста: списать золото за страховку шага 3 если включено */
export function maybeSpendForgottenForgeStep3Insurance(
  get: () => { forgottenForgeQuest: ForgottenForgeQuestState; spendResource?: (k: 'gold', n: number) => boolean }
): boolean {
  const q = get().forgottenForgeQuest
  if (q.step !== 3 || q.flags.step3Insurance !== true) return true
  return get().spendResource?.('gold', FORGOTTEN_FORGE_STEP3_INSURANCE_GOLD) ?? false
}

/** Строка прогресса для карточки UI */
export function getForgottenForgeProgressLine(step: number, status: ForgottenForgeQuestState['status']): string {
  if (status === 'locked') return 'Станет доступно, когда гильдия откроет локации 2-го тира.'
  if (status === 'completed') return FORGOTTEN_FORGE_PROGRESS_LINES[7] ?? ''
  return FORGOTTEN_FORGE_PROGRESS_LINES[step] ?? FORGOTTEN_FORGE_PROGRESS_LINES[0]
}
