/**
 * Квест «Эхо забытой кузни»: состояние, архивариус, канал дока.
 */

import { getAvailableLocations } from '@/modules/expeditions/data/locations'
import { generateId } from '@/lib/store-utils/generators'
import { FORGOTTEN_FORGE_ALTAR_QUEST_ARTIFACT_IDS } from '@/data/altar/quest-artifact-material-ids'
import {
  FORGOTTEN_FORGE_QUEST_ID,
  FORGOTTEN_FORGE_STEP3_INSURANCE_GOLD,
  getForgottenForgeProgressDisplayLine,
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
import { initialAltarConstructionState } from '@/types/altar-construction'

export type QuestPhase =
  | 'locked'
  | 'intro'
  | 'awaiting_expedition'
  | 'post_expedition_dialogue'
  | /** После эпилога v2: стройка / крафт без обязательной экспедиции */
  'open'
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
  /**
   * После реплики с этим id в чате показывается блок «Обновление задачи» (последняя архивариус-реплика после смены стадии).
   */
  archivistForgottenForgeTaskBannerAfterEntryId: string | null
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
  /** Dev: полный сброс квеста FF, алтаря в store и диалога (см. window.resetForgottenForgeQuest). */
  resetForgottenForgeQuestDev: () => void
}

export type ForgottenForgeQuestSlice = ForgottenForgeQuestSliceState & ForgottenForgeQuestSliceActions

const initialQuest: ForgottenForgeQuestState = {
  status: 'locked',
  step: 0,
  waitingForCraftAfterPhase2: false,
  lastStepChangeAt: null,
  flags: {},
}

function pushThread(
  thread: ArchivistThreadEntry[],
  speaker: ArchivistThreadEntry['speaker'],
  text: string,
  extra?: Pick<ArchivistThreadEntry, 'ctaToScreen'>
): ArchivistThreadEntry[] {
  return [...thread, { id: generateId(), ts: Date.now(), speaker, text, ...extra }]
}

/** Для хука событий: добавить реплики архивариуса без доступа к set. */
export function appendArchivistLines(thread: ArchivistThreadEntry[], lines: string[]): ArchivistThreadEntry[] {
  let t = thread
  for (const text of lines) {
    t = pushThread(t, 'archivist', text)
  }
  return t
}

/** Id последней реплики архивариуса в thread (якорь для блока задачи в чате). */
export function taskBannerAnchorFromThread(thread: ArchivistThreadEntry[]): string | null {
  for (let i = thread.length - 1; i >= 0; i--) {
    if (thread[i].speaker === 'archivist') return thread[i].id
  }
  return null
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
  archivistForgottenForgeTaskBannerAfterEntryId: null,
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
        archivistForgottenForgeTaskBannerAfterEntryId: taskBannerAnchorFromThread(thread),
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

      if (phase === 'completed' && q.status === 'completed' && q.step === 18) {
        const r = D.FF_FINALE_REPLIES[choiceId]
        if (r) thread = pushThread(thread, 'archivist', r)
        set({
          archivistDialogue: { thread },
          archivistPendingChoices: null,
          archivistForgottenForgeTaskBannerAfterEntryId: taskBannerAnchorFromThread(thread),
        } as Partial<T>)
        return
      }

      if (phase === 'open' && q.step === 9 && q.waitingForCraftAfterPhase2) {
        const r = D.FF_PHASE2_WAIT_CRAFT_REPLIES[choiceId]
        if (r) {
          thread = pushThread(thread, 'archivist', r)
          set({
            archivistDialogue: { thread },
            archivistPendingChoices: null,
            forgottenForgeQuest: { ...q, lastStepChangeAt: Date.now() },
            archivistForgottenForgeTaskBannerAfterEntryId: taskBannerAnchorFromThread(thread),
          } as Partial<T>)
          return
        }
      }

      let nextQuest = { ...q }
      let nextPhase: QuestPhase = phase
      let nextPending: ArchivistPendingChoice[] | null = null
      /** Якорь баннера FF: после шага 6 последняя реплика — CTA, якорь оставляем на длинном чертеже. */
      let taskBannerAnchorOverride: string | null = null

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
          const step3Insurance = choiceId === 'ff_s2_1'
          nextQuest = {
            ...q,
            step: 3,
            flags: { ...q.flags, step3Insurance },
          }
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
          thread = pushThread(thread, 'archivist', D.FF_STEP7_BLUEPRINT_ARCHIVIST)
          taskBannerAnchorOverride = taskBannerAnchorFromThread(thread)
          thread = pushThread(thread, 'archivist', D.FF_STEP7_ALTAR_UNLOCK_CTA, {
            ctaToScreen: 'altar',
          })
          nextQuest = { ...q, step: 7 }
          nextPhase = 'post_expedition_dialogue'
          nextPending = D.FF_STEP7_BLUEPRINT_CHOICES.map((c) => ({ id: c.id, label: c.label }))
        } else if (s === 7) {
          const r = D.FF_STEP7_BLUEPRINT_REPLIES[choiceId]
          if (r) thread = pushThread(thread, 'archivist', r)
          nextQuest = {
            ...q,
            status: 'active',
            step: 8,
            waitingForCraftAfterPhase2: false,
            lastStepChangeAt: Date.now(),
          }
          nextPhase = 'open'
          nextPending = null
        }
      }

      const altarBlueprint =
        nextQuest.step >= 7 || nextQuest.status === 'completed'

      const archivistTaskBannerId =
        taskBannerAnchorOverride ?? taskBannerAnchorFromThread(thread)

      set({
        archivistDialogue: { thread },
        forgottenForgeQuest: nextQuest,
        forgottenForgePhase: nextPhase,
        archivistPendingChoices: nextPending,
        archivistForgottenForgeTaskBannerAfterEntryId: archivistTaskBannerId,
        ...(altarBlueprint ? { altarUnlockedByForgottenForgeQuest: true } : {}),
      } as Partial<T>)
    },

    completeForgottenForgeQuestDev: () => {
      set({
        forgottenForgeQuest: {
          status: 'active',
          step: 8,
          waitingForCraftAfterPhase2: false,
          lastStepChangeAt: Date.now(),
          step0Choice: 1,
          flags: {
            step3Insurance: false,
            step5Cleanse: 'magic',
            step6Anselm: 'deal',
          },
        },
        forgottenForgePhase: 'open',
        archivistPendingChoices: null,
        altarUnlockedByForgottenForgeQuest: true,
        archivistForgottenForgeTaskBannerAfterEntryId: null,
      } as unknown as Partial<T>)
    },

    resetForgottenForgeQuestDev: () => {
      const state = get() as T & {
        materialStash?: Record<string, number>
        materialStashQuestItemIds?: string[]
      }
      const stash = { ...(state.materialStash ?? {}) }
      for (const id of FORGOTTEN_FORGE_ALTAR_QUEST_ARTIFACT_IDS) {
        delete stash[id]
      }
      const artifactSet = new Set<string>([...FORGOTTEN_FORGE_ALTAR_QUEST_ARTIFACT_IDS])
      const prevQuestIds = state.materialStashQuestItemIds ?? []
      const questIds = prevQuestIds.filter((id: string) => !artifactSet.has(id))
      set({
        forgottenForgeQuest: { ...initialQuest },
        forgottenForgePhase: 'locked',
        archivistDialogue: { thread: [] },
        archivistPendingChoices: null,
        messagesDockChannel: 'encyclopedia',
        messagesDockOpenNonce: 0,
        messagesDockEncyclopediaReadUpToTs: 0,
        messagesDockArchivistReadUpToTs: 0,
        altarUnlockedByForgottenForgeQuest: false,
        altarBuiltInForge: false,
        altarConstruction: { ...initialAltarConstructionState },
        materialStash: stash,
        materialStashQuestItemIds: questIds,
        archivistForgottenForgeTaskBannerAfterEntryId: null,
      } as unknown as Partial<T>)
    },

    advanceForgottenForgeAfterExpedition: ({
      locationId,
      success,
      linkedQuestId,
      linkedQuestTag,
    }: {
      locationId?: string
      success: boolean
      linkedQuestId?: string
      linkedQuestTag?: string
    }) => {
      const state = get()
      if (
        !canAdvanceForgottenForgeAfterExpedition({
          forgottenForgeQuest: state.forgottenForgeQuest,
          forgottenForgePhase: state.forgottenForgePhase,
          locationId,
          success,
          linkedQuestId,
          linkedQuestTag,
        })
      ) {
        return
      }

      const q = state.forgottenForgeQuest
      let thread = state.archivistDialogue.thread
      const addStash = get()['addMaterialToStash' as keyof T] as
        | ((id: string, n: number, o?: { markQuestItem?: boolean }) => void)
        | undefined
      const unlockCraft = get()['unlockCraftTechnique' as keyof T] as
        | ((id: string) => boolean)
        | undefined

      if (q.step === 3 && locationId === 'forgotten_mines' && success) {
        addStash?.('resonator_matrix', 1, { markQuestItem: true })
      } else if (q.step === 5 && locationId === 'rotten_swamp' && success) {
        addStash?.('focusing_chalice', 1, { markQuestItem: true })
      } else if (q.step === 6 && locationId === 'silver_grove' && success) {
        addStash?.('lunar_tuning_fork', 1, { markQuestItem: true })
      }

      if (q.step === 11 && success) {
        unlockCraft?.('rune_engraving_basic')
        const t11 = pushThread(thread, 'archivist', D.FF_AFTER_EXP_RUNE_TECHNIQUE)
        set({
          forgottenForgeQuest: {
            ...q,
            step: 12,
            lastStepChangeAt: Date.now(),
          },
          forgottenForgePhase: 'awaiting_expedition',
          archivistDialogue: { thread: t11 },
          archivistPendingChoices: null,
          archivistForgottenForgeTaskBannerAfterEntryId: taskBannerAnchorFromThread(t11),
        } as Partial<T>)
        return
      }
      if (q.step === 12 && success) {
        unlockCraft?.('clay_firing')
        const thread12 = pushThread(thread, 'archivist', D.FF_AFTER_EXP_CLAY_TECHNIQUE)
        set({
          forgottenForgeQuest: {
            ...q,
            step: 13,
            lastStepChangeAt: Date.now(),
          },
          forgottenForgePhase: 'awaiting_expedition',
          archivistDialogue: { thread: thread12 },
          archivistPendingChoices: null,
          archivistForgottenForgeTaskBannerAfterEntryId: taskBannerAnchorFromThread(thread12),
        } as Partial<T>)
        return
      }
      if (q.step === 13 && success) {
        unlockCraft?.('frequency_tuning')
        const thread13 = pushThread(thread, 'archivist', D.FF_AFTER_EXP_FREQUENCY_TECHNIQUE)
        set({
          forgottenForgeQuest: {
            ...q,
            step: 14,
            lastStepChangeAt: Date.now(),
          },
          forgottenForgePhase: 'open',
          archivistDialogue: { thread: thread13 },
          archivistPendingChoices: null,
          archivistForgottenForgeTaskBannerAfterEntryId: taskBannerAnchorFromThread(thread13),
        } as Partial<T>)
        return
      }
      if (q.step === 15 && success) {
        unlockCraft?.('spirit_blessing')
        const thread15 = pushThread(thread, 'archivist', D.FF_AFTER_SPIRIT_BLESSING_ARCHIVIST)
        set({
          forgottenForgeQuest: {
            ...q,
            step: 16,
            lastStepChangeAt: Date.now(),
          },
          forgottenForgePhase: 'open',
          archivistDialogue: { thread: thread15 },
          archivistPendingChoices: null,
          archivistForgottenForgeTaskBannerAfterEntryId: taskBannerAnchorFromThread(thread15),
        } as Partial<T>)
        return
      }

      if (q.step === 1) {
        thread = pushThread(thread, 'archivist', D.FF_AFTER_EXP_1_ARCHIVIST)
        set({
          archivistDialogue: { thread },
          archivistPendingChoices: D.FF_AFTER_EXP_1_CHOICES.map((c) => ({ id: c.id, label: c.label })),
          forgottenForgePhase: 'post_expedition_dialogue',
          archivistForgottenForgeTaskBannerAfterEntryId: taskBannerAnchorFromThread(thread),
        } as Partial<T>)
        return
      }
      if (q.step === 2) {
        thread = pushThread(thread, 'archivist', D.FF_AFTER_EXP_2_ARCHIVIST)
        set({
          archivistDialogue: { thread },
          archivistPendingChoices: D.FF_AFTER_EXP_2_CHOICES.map((c) => ({ id: c.id, label: c.label })),
          forgottenForgePhase: 'post_expedition_dialogue',
          archivistForgottenForgeTaskBannerAfterEntryId: taskBannerAnchorFromThread(thread),
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
          archivistForgottenForgeTaskBannerAfterEntryId: taskBannerAnchorFromThread(thread),
        } as Partial<T>)
        return
      }
      if (q.step === 4) {
        thread = pushThread(thread, 'archivist', D.FF_AFTER_EXP_4_ARCHIVIST)
        set({
          archivistDialogue: { thread },
          archivistPendingChoices: D.FF_AFTER_EXP_4_CHOICES.map((c) => ({ id: c.id, label: c.label })),
          forgottenForgePhase: 'post_expedition_dialogue',
          archivistForgottenForgeTaskBannerAfterEntryId: taskBannerAnchorFromThread(thread),
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
          archivistForgottenForgeTaskBannerAfterEntryId: taskBannerAnchorFromThread(thread),
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
          archivistForgottenForgeTaskBannerAfterEntryId: taskBannerAnchorFromThread(thread),
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

/** Строка прогресса для карточки UI и дока сообщений */
export function getForgottenForgeProgressLine(
  step: number,
  status: ForgottenForgeQuestState['status'],
  waitingForCraftAfterPhase2 = false
): string {
  return getForgottenForgeProgressDisplayLine(step, status, waitingForCraftAfterPhase2)
}
