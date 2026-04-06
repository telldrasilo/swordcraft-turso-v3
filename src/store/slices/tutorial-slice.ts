/**
 * Tutorial Slice
 * Управление туториалом для новых игроков
 */

import type { StateCreator } from 'zustand'

// ================================
// ТИПЫ
// ================================

/** Состояние туториала */
export interface TutorialState {
  isActive: boolean
  currentStep: number
  completedSteps: string[]
  skipped: boolean
  /** Выданы стартовые 10% §6.1 (кузня) после туториала / пропуска */
  starterForgeExpertiseGranted: boolean
  /** Подсказка про вкладку «Ремонт» уже показана или отклонена */
  weaponRepairGuidanceConsumed: boolean
  /** Одноразовый триггер для UI (тост); не сохраняется в persist как true */
  weaponRepairGuidancePending: boolean
}

/** Actions для туториала */
export interface TutorialActions {
  nextTutorialStep: () => void
  skipTutorial: () => void
  completeTutorialStep: (stepId: string) => void
  isTutorialActive: () => boolean
  resetTutorial: () => void
}

/** Полный тип slice */
export type TutorialSlice = TutorialState & TutorialActions

// ================================
// НАЧАЛЬНОЕ СОСТОЯНИЕ
// ================================

export const initialTutorialState: TutorialState = {
  isActive: true, // Туториал активен при первом запуске
  currentStep: 0,
  completedSteps: [],
  skipped: false,
  starterForgeExpertiseGranted: false,
  weaponRepairGuidanceConsumed: false,
  weaponRepairGuidancePending: false,
}

// ================================
// ШАГИ ТУТОРИАЛА
// ================================

export const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Добро пожаловать в Кузницу!',
    content: 'Вы — молодой кузнец, начинающий свой путь мастерства. Ваша задача — создавать оружие и развивать свою кузницу.',
  },
  {
    id: 'resources',
    title: 'Ресурсы',
    content: 'Дерево, камень, железо и другие ресурсы нужны для крафта. Нанимайте рабочих для их добычи.',
  },
  {
    id: 'workers',
    title: 'Рабочие',
    content: 'Рабочие добывают ресурсы и помогают в кузнице. У каждого класса св специализация.',
  },
  {
    id: 'forge',
    title: 'Кузница',
    content: 'Здесь вы создаёте оружие из материалов. Качество зависит от мастерства ваших кузнецов.',
  },
  {
    id: 'guild',
    title: 'Гильдия',
    content:
      'Выполняйте заказы и экспедиции. С изношенным или с метками повреждений оружием гильдия не пустит — сначала вкладка «Ремонт» в кузнице.',
  },
  {
    id: 'altar',
    title: 'Зачарования',
    content:
      'Раздел «Зачарования» в меню откроет новый модуль (пробуждение души, древо перков). Сейчас экран — заглушка; старый алтарь снят.',
  },
] as const

// ================================
// SLICE
// ================================

export const createTutorialSlice: StateCreator<
  TutorialSlice,
  [],
  [],
  TutorialSlice
> = (set, get) => ({
  // State
  isActive: true,
  currentStep: 0,
  completedSteps: [],
  skipped: false,
  starterForgeExpertiseGranted: false,
  weaponRepairGuidanceConsumed: false,
  weaponRepairGuidancePending: false,

  // Actions
  nextTutorialStep: () => set((state) => {
    const nextStep = state.currentStep + 1
    
    // Если прошли все шаги - завершаем туториал
    if (nextStep >= TUTORIAL_STEPS.length) {
      return {
        ...state,
        isActive: false,
        currentStep: nextStep,
      }
    }

    return {
      ...state,
      currentStep: nextStep,
    }
  }),

  skipTutorial: () => set((state) => ({
    ...state,
    isActive: false,
    skipped: true,
  })),

  completeTutorialStep: (stepId) => set((state) => {
    if (state.completedSteps.includes(stepId)) return state

    return {
      ...state,
      completedSteps: [...state.completedSteps, stepId],
    }
  }),

  isTutorialActive: () => {
    const state = get()
    return state.isActive && !state.skipped
  },

  resetTutorial: () => set(() => ({
    ...initialTutorialState,
  })),

  acknowledgeWeaponRepairGuidance: () =>
    set((state) => ({
      ...state,
      weaponRepairGuidancePending: false,
      weaponRepairGuidanceConsumed: true,
    })),
})
