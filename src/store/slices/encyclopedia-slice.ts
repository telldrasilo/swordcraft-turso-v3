/**
 * Encyclopedia Slice
 * Управление знаниями игрока о материалах
 */

import type { StateCreator } from 'zustand'
import type { MaterialKnowledge, KnowledgeThreshold } from '@/types/materials'
import type { MaterialDisplayCategory } from '@/types/materials/material-core'
import {
  getKnowledgeThreshold,
  calculateKnowledgeGain,
  createMaterialKnowledge,
  createDiscoveredMaterialKnowledge,
} from '@/types/materials/knowledge'
import type { GameMessage } from '@/types/game-message'
import type { MaterialStudySession } from '@/types/material-study'
import { getMaterialStudyTechniqueById } from '@/data/material-study-techniques'
import { catalogMaterialCostsToCraftingCost } from '@/lib/materials/material-study-costs'
import type { CraftingCost } from '@/store/slices/resources-slice'
import type { Worker } from '@/store/slices/workers-slice'
import type { ProductionBuilding } from '@/store/slices/workers-slice'
import { mergeCraftRoadmapStarterKnowledge } from '@/lib/materials/craft-roadmap-starter-knowledge'
import { computeMaterialStudySlotCapacity } from '@/lib/materials/material-study-slots'
import {
  resolveStudyDurationMs,
  computeMaterialStudyWorkerSpeedFactor,
  rollMaterialStudyCompletionOutcome,
  rollMaterialStudyExpertiseGain,
} from '@/lib/materials/material-study-balance'
import {
  MATERIAL_STUDY_CANCEL_PROGRESS_PAYOUT_RATIO,
  MATERIAL_STUDY_MAX_WORKERS_ON_STUDY,
} from '@/lib/store-utils/constants'
import { refundMaterialStudyTechniqueCosts } from '@/lib/materials/material-study-refund'

/** Минимум store для сессий изучения (избегаем цикла с game-store-composed). */
type EncyclopediaStoreGet = () => {
  spendCraftingCostWithStash: (cost: CraftingCost) => boolean
  canAffordCraftingCostWithStash: (cost: CraftingCost) => boolean
  addResource: (resource: import('@/store/slices/resources-slice').ResourceKey, amount: number) => void
  addMaterialToStash: (materialId: string, amount: number) => void
  workers: Worker[]
  buildings: ProductionBuilding[]
  assignWorker: (workerId: string, assignment: string) => void
}

function safeGameMessages(state: { gameMessages?: GameMessage[] }): GameMessage[] {
  return Array.isArray(state.gameMessages) ? state.gameMessages : []
}

// ================================
// ТИПЫ
// ================================

/** Категория отображения энциклопедии (как вкладки материалов в UI) */
export type EncyclopediaCategory = MaterialDisplayCategory

/** Состояние энциклопедии */
export interface EncyclopediaState {
  /** Знания о материалах по ID */
  materialKnowledge: Record<string, MaterialKnowledge>
  /** Активные и завершённые сессии изучения (B1); завершённые можно подчистить позже */
  materialStudySessions: MaterialStudySession[]
  /** Игровые сообщения (заготовка §6.8 roadmap) */
  gameMessages: GameMessage[]
  /** Выбранная категория */
  selectedCategory: EncyclopediaCategory
  /** Поисковый запрос */
  searchQuery: string
  /** Сортировка */
  sortBy: 'name' | 'rarity' | 'expertise'
  /** Показывать только открытые */
  showOnlyDiscovered: boolean
  /** Фокус карточки после навигации из ленты сообщений (не в persist). */
  encyclopediaFocusMaterialId: string | null
}

/** Actions для энциклопедии */
export interface EncyclopediaActions {
  /** Добавить экспертизу материалу */
  addMaterialExpertise: (materialId: string, amount: number) => void
  /** Установить экспертизу (для загрузки) */
  setMaterialExpertise: (materialId: string, expertise: number) => void
  /** Использовать материал (увеличивает экспертизу) */
  useMaterial: (materialId: string) => void
  /** Несколько единиц расхода подряд (та же формула gain 'use', что и при одном вызове `useMaterial`) */
  useMaterialAmount: (materialId: string, count: number) => void
  /** Открыть материал */
  discoverMaterial: (materialId: string) => void
  /** Установить категорию */
  setSelectedCategory: (category: EncyclopediaCategory) => void
  /** Установить поисковый запрос */
  setSearchQuery: (query: string) => void
  /** Установить сортировку */
  setSortBy: (sortBy: EncyclopediaState['sortBy']) => void
  /** Переключить фильтр открытых */
  toggleShowOnlyDiscovered: () => void
  /** Получить знания о материале */
  getMaterialKnowledge: (materialId: string) => MaterialKnowledge | undefined
  /** Проверить, открыт ли материал */
  isMaterialDiscovered: (materialId: string) => boolean
  /** Получить порог знаний материала */
  getMaterialThreshold: (materialId: string) => KnowledgeThreshold
  /** Получить процент экспертизы */
  getExpertisePercent: (materialId: string) => number
  /** Сбросить все знания (для тестов) */
  resetAllKnowledge: () => void

  /** Стартовые 10% на набор §6.1 после туториала (идемпотентно по флагу в tutorial) */
  grantCraftRoadmapStarterExpertise: () => void
  /**
   * Начать изучение (списание стоимости сразу). Слоты — от зданий; assistWorkerIds — только `assignment === 'rest'`.
   */
  startMaterialStudy: (
    materialId: string,
    techniqueId: string,
    assistWorkerIds?: string[]
  ) => boolean
  /** Дорасчитать завершённые сессии и начислить экспертизу */
  flushCompletedMaterialStudies: () => void
  /** Промежуточные сообщения в ленту при 25/50/75% прогресса активных сессий */
  tickMaterialStudyProgress: () => void
  /** Прервать сессию: частичный прирост по прогрессу, рабочие на отдых */
  cancelMaterialStudy: (sessionId: string) => void
  setEncyclopediaFocusMaterialId: (materialId: string | null) => void
  getMaterialStudySlotCapacity: () => number
  /** Добавить сообщение в ленту (энциклопедия и др.) */
  pushGameMessage: (msg: Omit<GameMessage, 'id' | 'ts'> & Partial<Pick<GameMessage, 'id' | 'ts'>>) => void
}

/** Полный тип slice */
export type EncyclopediaSlice = EncyclopediaState & EncyclopediaActions

// ================================
// НАЧАЛЬНОЕ СОСТОЯНИЕ
// ================================

const MAX_GAME_MESSAGES = 50

export const initialEncyclopediaState: EncyclopediaState = {
  materialKnowledge: {},
  materialStudySessions: [],
  gameMessages: [],
  selectedCategory: 'all',
  searchQuery: '',
  sortBy: 'rarity',
  showOnlyDiscovered: false,
  encyclopediaFocusMaterialId: null,
}

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================

/**
 * Ограничить экспертизу диапазоном 0-100
 */
function clampExpertise(expertise: number): number {
  return Math.max(0, Math.min(100, expertise))
}

function pickAssistWorkers(workers: Worker[], requested: string[] | undefined): string[] {
  if (!requested?.length) return []
  const want = [...new Set(requested)].slice(0, MATERIAL_STUDY_MAX_WORKERS_ON_STUDY)
  return want.filter(id => {
    const w = workers.find(x => x.id === id)
    return Boolean(w && w.assignment === 'rest')
  })
}

function releaseStudyWorkers(storeGet: EncyclopediaStoreGet, session: MaterialStudySession) {
  const g = storeGet()
  const token = `material_study:${session.id}`
  for (const wid of session.assignedWorkerIds ?? []) {
    const w = g.workers.find(x => x.id === wid)
    if (w && w.assignment === token) {
      g.assignWorker(wid, 'rest')
    }
  }
}

// ================================
// SLICE
// ================================

export const createEncyclopediaSlice: StateCreator<EncyclopediaSlice, [], [], EncyclopediaSlice> = (set, get) => ({
  // State
  ...initialEncyclopediaState,

  // Actions
  addMaterialExpertise: (materialId, amount) => {
    set((state) => {
      const current = state.materialKnowledge[materialId] || createMaterialKnowledge(materialId)
      const newExpertise = clampExpertise(current.expertise + amount)

      return {
        materialKnowledge: {
          ...state.materialKnowledge,
          [materialId]: {
            ...current,
            expertise: newExpertise,
            lastUsedAt: Date.now(),
          },
        },
      }
    })
  },

  setMaterialExpertise: (materialId, expertise) => {
    set((state) => {
      const current = state.materialKnowledge[materialId] || createMaterialKnowledge(materialId)

      return {
        materialKnowledge: {
          ...state.materialKnowledge,
          [materialId]: {
            ...current,
            expertise: clampExpertise(expertise),
            lastUsedAt: Date.now(),
          },
        },
      }
    })
  },

  useMaterial: (materialId) => {
    get().useMaterialAmount(materialId, 1)
  },

  useMaterialAmount: (materialId, count) => {
    if (!materialId || count <= 0) return
    set((state) => {
      let current = state.materialKnowledge[materialId] || createMaterialKnowledge(materialId)
      for (let i = 0; i < count; i++) {
        const gain = calculateKnowledgeGain('use', current.expertise, 1)
        current = {
          ...current,
          expertise: clampExpertise(current.expertise + gain),
          lastUsedAt: Date.now(),
          totalUses: current.totalUses + 1,
        }
      }
      return {
        materialKnowledge: {
          ...state.materialKnowledge,
          [materialId]: current,
        },
      }
    })
  },

  discoverMaterial: (materialId) => {
    set((state) => {
      if (state.materialKnowledge[materialId]) {
        // Уже открыт
        return state
      }

      return {
        materialKnowledge: {
          ...state.materialKnowledge,
          [materialId]: createDiscoveredMaterialKnowledge(materialId),
        },
      }
    })
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category })
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query })
  },

  setSortBy: (sortBy) => {
    set({ sortBy })
  },

  toggleShowOnlyDiscovered: () => {
    set((state) => ({ showOnlyDiscovered: !state.showOnlyDiscovered }))
  },

  getMaterialKnowledge: (materialId) => {
    return get().materialKnowledge[materialId]
  },

  isMaterialDiscovered: (materialId) => {
    const knowledge = get().materialKnowledge[materialId]
    return knowledge !== undefined && knowledge.expertise > 0
  },

  getMaterialThreshold: (materialId) => {
    const knowledge = get().materialKnowledge[materialId]
    const expertise = knowledge?.expertise ?? 0
    return getKnowledgeThreshold(expertise)
  },

  getExpertisePercent: (materialId) => {
    const knowledge = get().materialKnowledge[materialId]
    return knowledge?.expertise ?? 0
  },

  resetAllKnowledge: () => {
    set({
      materialKnowledge: {},
      materialStudySessions: [],
      gameMessages: [],
      encyclopediaFocusMaterialId: null,
    })
  },

  grantCraftRoadmapStarterExpertise: () => {
    set(state => ({
      materialKnowledge: mergeCraftRoadmapStarterKnowledge(state.materialKnowledge),
    }))
  },

  startMaterialStudy: (materialId, techniqueId, assistWorkerIds) => {
    const pushEnc = (body: string) => {
      get().pushGameMessage({
        kind: 'encyclopedia',
        title: 'Изучение',
        body,
      })
    }

    const technique = getMaterialStudyTechniqueById(techniqueId)
    if (!technique || !materialId) {
      pushEnc('Техника изучения не найдена.')
      return false
    }
    if (technique.targetMaterialIds?.length && !technique.targetMaterialIds.includes(materialId)) {
      pushEnc('Эта техника недоступна для выбранного материала.')
      return false
    }

    const knowledge = get().materialKnowledge[materialId]
    if (!knowledge || knowledge.expertise <= 0) {
      pushEnc('Материал ещё не открыт в энциклопедии — нужна хотя бы минимальная экспертиза.')
      return false
    }

    const storeGet = get as unknown as EncyclopediaStoreGet
    const slotCap = computeMaterialStudySlotCapacity(storeGet().buildings ?? [])
    const running = get().materialStudySessions.filter(s => s.status === 'running').length
    if (running >= slotCap) {
      pushEnc(
        `Все слоты изучения заняты (${running}/${slotCap}). Прокачайте здания или дождитесь завершения сессий.`
      )
      return false
    }

    const cost = catalogMaterialCostsToCraftingCost(technique.materialCosts)
    if (!storeGet().canAffordCraftingCostWithStash(cost)) {
      pushEnc('Не хватает ресурсов или материалов на складе экспедиций для выбранной техники.')
      return false
    }
    if (!storeGet().spendCraftingCostWithStash(cost)) {
      pushEnc('Не удалось списать стоимость изучения.')
      return false
    }

    const now = Date.now()
    const sessionId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `study_${now}`
    const assist = pickAssistWorkers(storeGet().workers, assistWorkerIds)
    const assignTok = `material_study:${sessionId}`
    for (const wid of assist) {
      storeGet().assignWorker(wid, assignTok)
    }

    const plannedMs = resolveStudyDurationMs(technique.durationMs)
    const speed = computeMaterialStudyWorkerSpeedFactor(assist.length)
    const effectiveMs = Math.max(0, Math.round(plannedMs / speed))

    const session: MaterialStudySession = {
      id: sessionId,
      materialId,
      techniqueId,
      startTime: now,
      endTime: now + effectiveMs,
      plannedDurationMs: plannedMs,
      assignedWorkerIds: assist.length ? assist : undefined,
      status: 'running',
      log: [
        {
          ts: now,
          message:
            assist.length > 0
              ? `Начато: ${technique.name} (помогают рабочие: ${assist.length})`
              : `Начато: ${technique.name}`,
        },
      ],
    }

    set(state => ({
      materialStudySessions: [...state.materialStudySessions, session],
    }))
    return true
  },

  flushCompletedMaterialStudies: () => {
    const now = Date.now()
    const storeGet = get as unknown as EncyclopediaStoreGet
    const pre = get().materialStudySessions
    for (const s of pre) {
      if (s.status === 'running' && now >= s.endTime) {
        releaseStudyWorkers(storeGet, s)
      }
    }

    set(state => {
      let knowledge = { ...state.materialKnowledge }
      const newMessages: GameMessage[] = []
      const nextSessions = state.materialStudySessions.map(s => {
        if (s.status !== 'running' || now < s.endTime) return s

        const technique = getMaterialStudyTechniqueById(s.techniqueId)
        const outcome = rollMaterialStudyCompletionOutcome()
        const gain = outcome.gain
        const researchDelta = Math.max(0, s.endTime - s.startTime)
        const cur = knowledge[s.materialId] || createMaterialKnowledge(s.materialId)
        const expertise = Math.min(100, cur.expertise + gain)
        knowledge = {
          ...knowledge,
          [s.materialId]: {
            ...cur,
            expertise,
            lastUsedAt: now,
            totalResearchTime: cur.totalResearchTime + researchDelta,
          },
        }

        const title =
          outcome.kind === 'failure' ? 'Изучение: частичный срыв' : 'Изучение завершено'
        const body =
          outcome.kind === 'failure'
            ? technique
              ? `${technique.name}: неудача, +${gain}% (${s.materialId})`
              : `Неудача, +${gain}% (${s.materialId})`
            : technique
              ? `${technique.name}: +${gain}% к ${s.materialId}`
              : `+${gain}% к ${s.materialId}`

        const gid =
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `gm_${now}_${s.id}`

        newMessages.push({
          id: gid,
          ts: now,
          kind: 'encyclopedia',
          title,
          body,
          navigationTarget: { screen: 'encyclopedia', entityId: s.materialId },
        })

        return {
          ...s,
          status: 'completed' as const,
          log: [...s.log, { ts: now, message: body }],
        }
      })

      const gameMessages = [...newMessages, ...state.gameMessages].slice(0, MAX_GAME_MESSAGES)
      return { materialKnowledge: knowledge, materialStudySessions: nextSessions, gameMessages }
    })
  },

  tickMaterialStudyProgress: () => {
    if (!get().materialStudySessions.some(s => s.status === 'running')) return
    const now = Date.now()
    set(state => {
      const newMessages: GameMessage[] = []
      const nextSessions = state.materialStudySessions.map(s => {
        if (s.status !== 'running') return s
        const total = Math.max(1, s.endTime - s.startTime)
        const p = Math.min(1, Math.max(0, (now - s.startTime) / total))
        let bits = s.progressMessageBits ?? 0
        const technique = getMaterialStudyTechniqueById(s.techniqueId)
        const name = technique?.name ?? 'Изучение'

        const emit = (threshold: number, bit: number) => {
          if (p < threshold || (bits & bit) !== 0) return
          bits |= bit
          const gid =
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
              ? crypto.randomUUID()
              : `gm_prog_${now}_${s.id}_${bit}`
          newMessages.push({
            id: gid,
            ts: now,
            kind: 'encyclopedia',
            title: 'Изучение',
            body: `${name}: около ${Math.round(threshold * 100)}% прогресса (${s.materialId})`,
            navigationTarget: { screen: 'encyclopedia', entityId: s.materialId },
          })
        }

        emit(0.25, 1)
        emit(0.5, 2)
        emit(0.75, 4)

        if (bits === (s.progressMessageBits ?? 0)) return s
        return { ...s, progressMessageBits: bits }
      })

      if (newMessages.length === 0) return {}
      const gameMessages = [...newMessages, ...safeGameMessages(state)].slice(0, MAX_GAME_MESSAGES)
      return { materialStudySessions: nextSessions, gameMessages }
    })
  },

  cancelMaterialStudy: sessionId => {
    const storeGet = get as unknown as EncyclopediaStoreGet
    const now = Date.now()
    const s = get().materialStudySessions.find(x => x.id === sessionId && x.status === 'running')
    if (!s) return

    releaseStudyWorkers(storeGet, s)

    const techniqueForRefund = getMaterialStudyTechniqueById(s.techniqueId)
    if (techniqueForRefund) {
      refundMaterialStudyTechniqueCosts(
        {
          addResource: storeGet().addResource,
          addMaterialToStash: storeGet().addMaterialToStash,
        },
        techniqueForRefund
      )
    }

    const total = Math.max(1, s.endTime - s.startTime)
    const elapsed = Math.min(Math.max(0, now - s.startTime), total)
    const progress = elapsed / total
    const rolled = rollMaterialStudyExpertiseGain()
    const gain = Math.max(
      0,
      Math.floor(rolled * progress * MATERIAL_STUDY_CANCEL_PROGRESS_PAYOUT_RATIO)
    )

    set(state => {
      let knowledge = { ...state.materialKnowledge }
      if (gain > 0) {
        const cur = knowledge[s.materialId] || createMaterialKnowledge(s.materialId)
        const expertise = Math.min(100, cur.expertise + gain)
        knowledge = {
          ...knowledge,
          [s.materialId]: {
            ...cur,
            expertise,
            lastUsedAt: now,
            totalResearchTime: cur.totalResearchTime + elapsed,
          },
        }
      }

      const technique = getMaterialStudyTechniqueById(s.techniqueId)
      const gid =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `gm_cancel_${now}_${s.id}`
      const msg: GameMessage = {
        id: gid,
        ts: now,
        kind: 'encyclopedia',
        title: 'Изучение прервано',
        body:
          gain > 0
            ? `${technique?.name ?? 'Сессия'} остановлена: +${gain}% (прогресс ${Math.round(progress * 100)}%). Часть материалов возвращена на склад.`
            : `${technique?.name ?? 'Сессия'} остановлена без прироста. Часть материалов возвращена на склад.`,
        navigationTarget: { screen: 'encyclopedia', entityId: s.materialId },
      }

      const nextSessions = state.materialStudySessions.map(sess =>
        sess.id === sessionId && sess.status === 'running'
          ? {
              ...sess,
              status: 'cancelled' as const,
              log: [...sess.log, { ts: now, message: msg.body }],
            }
          : sess
      )

      const gameMessages = [msg, ...state.gameMessages].slice(0, MAX_GAME_MESSAGES)
      return { materialKnowledge: knowledge, materialStudySessions: nextSessions, gameMessages }
    })
  },

  setEncyclopediaFocusMaterialId: materialId => {
    set({ encyclopediaFocusMaterialId: materialId })
  },

  getMaterialStudySlotCapacity: () => {
    const storeGet = get as unknown as EncyclopediaStoreGet
    return computeMaterialStudySlotCapacity(storeGet().buildings ?? [])
  },

  pushGameMessage: msg => {
    const now = msg.ts ?? Date.now()
    const id =
      msg.id ??
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `gm_${now}`)
    set(state => ({
      gameMessages: [{ ...msg, id, ts: now } as GameMessage, ...safeGameMessages(state)].slice(
        0,
        MAX_GAME_MESSAGES
      ),
    }))
  },
})

// ================================
// СЕЛЕКТОРЫ
// ================================

/**
 * Получить все открытые материалы
 */
export function selectDiscoveredMaterials(state: EncyclopediaState): string[] {
  return Object.entries(state.materialKnowledge)
    .filter(([_, knowledge]) => knowledge.expertise > 0)
    .map(([id]) => id)
}

/**
 * Получить материалы по порогу знаний
 */
export function selectMaterialsByThreshold(
  state: EncyclopediaState,
  threshold: KnowledgeThreshold
): string[] {
  return Object.entries(state.materialKnowledge)
    .filter(([_, knowledge]) => getKnowledgeThreshold(knowledge.expertise) === threshold)
    .map(([id]) => id)
}

/**
 * Получить статистику энциклопедии
 */
export function selectEncyclopediaStats(state: EncyclopediaState): {
  totalDiscovered: number
  byThreshold: Record<KnowledgeThreshold, number>
  averageExpertise: number
} {
  const entries = Object.entries(state.materialKnowledge)
  const discovered = entries.filter(([_, k]) => k.expertise > 0)
  
  const byThreshold: Record<KnowledgeThreshold, number> = {
    undiscovered: 0,
    curious: 0,
    familiar: 0,
    experienced: 0,
    mastered: 0,
    legendary: 0,
    max: 0,
  }

  discovered.forEach(([_, knowledge]) => {
    const threshold = getKnowledgeThreshold(knowledge.expertise)
    byThreshold[threshold]++
  })

  const averageExpertise = discovered.length > 0
    ? discovered.reduce((sum, [_, k]) => sum + k.expertise, 0) / discovered.length
    : 0

  return {
    totalDiscovered: discovered.length,
    byThreshold,
    averageExpertise: Math.round(averageExpertise * 10) / 10,
  }
}
