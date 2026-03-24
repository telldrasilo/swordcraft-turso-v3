/**
 * Encyclopedia Slice
 * Управление знаниями игрока о материалах
 */

import type { StateCreator } from 'zustand'
import type { MaterialKnowledge, KnowledgeThreshold } from '@/types/materials'
import {
  getKnowledgeThreshold,
  calculateKnowledgeGain,
} from '@/types/materials/knowledge'

// ================================
// ТИПЫ
// ================================

/** Категория отображения энциклопедии */
export type EncyclopediaCategory = 'all' | 'ores' | 'ingots' | 'stones' | 'wood' | 'leather' | 'other'

/** Состояние энциклопедии */
export interface EncyclopediaState {
  /** Знания о материалах по ID */
  materialKnowledge: Record<string, MaterialKnowledge>
  /** Выбранная категория */
  selectedCategory: EncyclopediaCategory
  /** Поисковый запрос */
  searchQuery: string
  /** Сортировка */
  sortBy: 'name' | 'rarity' | 'expertise'
  /** Показывать только открытые */
  showOnlyDiscovered: boolean
}

/** Actions для энциклопедии */
export interface EncyclopediaActions {
  /** Добавить экспертизу материалу */
  addMaterialExpertise: (materialId: string, amount: number) => void
  /** Установить экспертизу (для загрузки) */
  setMaterialExpertise: (materialId: string, expertise: number) => void
  /** Использовать материал (увеличивает экспертизу) */
  useMaterial: (materialId: string) => void
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
}

/** Полный тип slice */
export type EncyclopediaSlice = EncyclopediaState & EncyclopediaActions

// ================================
// НАЧАЛЬНОЕ СОСТОЯНИЕ
// ================================

/**
 * Создать начальные знания о материале
 */
function createInitialKnowledge(materialId: string, expertise: number = 50): MaterialKnowledge {
  const now = Date.now()
  return {
    materialId,
    expertise,
    discoveredAt: now,
    lastUsedAt: now,
    totalUses: 0,
    totalResearchTime: 0,
  }
}

export const initialEncyclopediaState: EncyclopediaState = {
  // Начальные открытые материалы
  materialKnowledge: {
    // Руды
    'iron_ore': createInitialKnowledge('iron_ore', 50),
    
    // Металлы
    'iron': createInitialKnowledge('iron', 50),
    
    // Дерево
    'birch': createInitialKnowledge('birch', 50),
    'oak': createInitialKnowledge('oak', 50),
    
    // Кожа
    'raw_leather': createInitialKnowledge('raw_leather', 50),
    'tanned_leather': createInitialKnowledge('tanned_leather', 50),
    
    // Уголь
    'coal': createInitialKnowledge('coal', 50),
  },
  selectedCategory: 'all',
  searchQuery: '',
  sortBy: 'rarity',
  showOnlyDiscovered: true,
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

// ================================
// SLICE
// ================================

export const createEncyclopediaSlice: StateCreator<EncyclopediaSlice, [], [], EncyclopediaSlice> = (set, get) => ({
  // State
  ...initialEncyclopediaState,

  // Actions
  addMaterialExpertise: (materialId, amount) => {
    set((state) => {
      const current = state.materialKnowledge[materialId] || createInitialKnowledge(materialId)
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
      const current = state.materialKnowledge[materialId] || createInitialKnowledge(materialId)

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
    set((state) => {
      const current = state.materialKnowledge[materialId] || createInitialKnowledge(materialId)
      const gain = calculateKnowledgeGain('use', current.expertise, 1)
      const newExpertise = clampExpertise(current.expertise + gain)

      return {
        materialKnowledge: {
          ...state.materialKnowledge,
          [materialId]: {
            ...current,
            expertise: newExpertise,
            lastUsedAt: Date.now(),
            totalUses: current.totalUses + 1,
          },
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
          [materialId]: createInitialKnowledge(materialId),
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
    set({ materialKnowledge: {} })
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
