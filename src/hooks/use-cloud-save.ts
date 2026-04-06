/**
 * Хук для синхронизации игры с сервером
 * Автоматическое сохранение и загрузка с поддержкой офлайн-режима.
 *
 * Облако включается только при `NEXT_PUBLIC_CLOUD_SAVE_ENABLED=true` (см. `cloud-save-feature.ts`).
 */

import { useEffect, useCallback, useRef, useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useGameStore } from '@/store'
import { normalizeForgottenForgePersistFromSave } from '@/lib/normalize-forgotten-forge-persist'
import { isSaveAuthEnforcedClient } from '@/lib/save-auth'
import { isCloudSaveEnabled } from '@/lib/cloud-save-feature'
import { migrateLegacyMaterialResourcesToStash } from '@/lib/craft/inventory-check'
import type { MaterialKnowledge } from '@/types/materials/knowledge'
import { createDiscoveredMaterialKnowledge } from '@/types/materials/knowledge'
import { initialResources, type Resources } from '@/store/slices/resources-slice'
import {
  mergeActiveRefiningFromSave,
  mergeCraftV2PersistedFromSave,
  normalizeActiveCraftColumn,
} from '@/lib/save-craft-normalize'
import { normalizeMaterialStudySessionsFromSave } from '@/lib/materials/normalize-material-study-sessions'
import {
  normalizeRepairBenchWeaponIdFromSave,
  normalizeRepairTechniqueStageRunFromSave,
} from '@/lib/normalize-repair-bench-from-save'
import type { QuestPhase } from '@/store/slices/forgotten-forge-quest-slice'

interface UseCloudSaveOptions {
  autoSaveInterval?: number
  enableAutoSave?: boolean
  playerId?: string
}

interface CloudSaveResult {
  isLoading: boolean
  isSaving: boolean
  lastSavedAt: Date | null
  error: string | null
  isOnline: boolean
  save: () => Promise<boolean>
  load: () => Promise<boolean>
  reset: () => Promise<boolean>
}

// Хелпер для получения титула по уровню
function getTitleByLevel(level: number): string {
  const titles = [
    { min: 1, max: 4, title: 'Новичок' },
    { min: 5, max: 9, title: 'Ученик' },
    { min: 10, max: 14, title: 'Подмастерье' },
    { min: 15, max: 19, title: 'Опытный кузнец' },
    { min: 20, max: 29, title: 'Мастер-кузнец' },
    { min: 30, max: 39, title: 'Великий мастер' },
    { min: 40, max: 49, title: 'Легендарный мастер' },
    { min: 50, max: 999, title: 'Легенда' },
  ]

  for (const t of titles) {
    if (level >= t.min && level <= t.max) {
      return t.title
    }
  }
  return 'Новичок'
}

const OFFLINE_BACKUP_KEY = 'swordcraft-offline-backup'
const TIMESTAMP_KEY = 'swordcraft-last-save-timestamp'
/** Чтобы UI не зависал на «Загрузка сохранения…» при медленном/зависшем Turso или прокси */
const LOAD_FETCH_TIMEOUT_MS = 12_000
/** SSR: на сервере нет `navigator`; иначе — падение рендера и «белый экран» у клиентских компонентов */
const AUTH_BOOTSTRAP_TIMEOUT_MS = 10_000

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  timeoutMs: number
): Promise<Response> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    return await fetch(input, {
      ...init,
      signal: ctrl.signal,
    })
  } finally {
    clearTimeout(t)
  }
}

function buildSaveFetchHeaders(
  contentTypeJson: boolean,
  enforceAuth: boolean,
  playerId: string
): HeadersInit {
  const h: Record<string, string> = {}
  if (contentTypeJson) {
    h['Content-Type'] = 'application/json'
  }
  if (!enforceAuth) {
    h['x-player-id'] = playerId
  }
  return h
}

export function useCloudSave(options: UseCloudSaveOptions = {}): CloudSaveResult {
  const { autoSaveInterval = 60000, enableAutoSave = true, playerId = 'demo-player' } = options
  const enforceAuth = isSaveAuthEnforcedClient()
  const cloudEnabled = isCloudSaveEnabled()
  const needsAuthBootstrap = enforceAuth && cloudEnabled

  const [authReady, setAuthReady] = useState(!needsAuthBootstrap)
  const [isLoading, setIsLoading] = useState(cloudEnabled)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  // Отслеживаем состояние сети
  useEffect(() => {
    if (typeof navigator === 'undefined') return
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOnline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOnline)
    }
  }, [])

  useEffect(() => {
    if (!needsAuthBootstrap) return
    let cancelled = false
    const run = async () => {
      try {
        await Promise.race([
          (async () => {
            const existing = await getSession()
            if (!cancelled && !existing) {
              await signIn('demo', { redirect: false })
            }
          })(),
          new Promise<never>((_, reject) => {
            window.setTimeout(() => reject(new Error('auth-bootstrap-timeout')), AUTH_BOOTSTRAP_TIMEOUT_MS)
          }),
        ])
      } catch (e) {
        if (e instanceof Error && e.message === 'auth-bootstrap-timeout') {
          console.warn('[CloudSave] Auth bootstrap timeout — продолжаем загрузку сохранения')
        } else {
          console.error('[CloudSave] Session bootstrap failed:', e)
        }
      } finally {
        if (!cancelled) {
          setAuthReady(true)
        }
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [needsAuthBootstrap])

  /** Страховка: если load/auth зависли, не блокируем UI бесконечно */
  useEffect(() => {
    if (!cloudEnabled) return
    const id = window.setTimeout(() => {
      setIsLoading((wasLoading) => {
        if (wasLoading) {
          console.warn('[CloudSave] Loading failsafe: снимаем блокировку UI (проверьте сеть / NextAuth / Turso)')
        }
        return false
      })
    }, Math.max(LOAD_FETCH_TIMEOUT_MS + AUTH_BOOTSTRAP_TIMEOUT_MS + 3000, 25_000))
    return () => window.clearTimeout(id)
  }, [cloudEnabled])

  // Сбор данных для сохранения
  const collectSaveData = useCallback(() => {
    const state = useGameStore.getState()

    return {
      timestamp: Date.now(),
      player: {
        level: state.player?.level || 1,
        experience: state.player?.experience || 0,
        fame: state.player?.fame ?? 0,
      },
      resources: state.resources || {},
      materialStash: state.materialStash || {},
      statistics: state.statistics || {},
      workers: state.workers || [],
      buildings: state.buildings || [],
      maxWorkers: state.maxWorkers || 3,
      activeCraft: normalizeActiveCraftColumn(null, state.craftV2Persisted),
      activeRefining: state.activeRefining || {},
      weaponInventory: state.weaponInventory || { weapons: [] },
      unlockedRecipes: state.unlockedRecipes || { weaponRecipes: [], refiningRecipes: [] },
      recipeSources: state.recipeSources || [],
      unlockedEnchantments: state.unlockedEnchantments || [],
      unlockedMaterialProcessingTechniqueIds:
        state.unlockedMaterialProcessingTechniqueIds || [],
      unlockedRepairTechniqueIds: state.unlockedRepairTechniqueIds || [],
      unlockedReforgeTechniqueIds: state.unlockedReforgeTechniqueIds || [],
      guild: state.guild || {},
      knownAdventurers: state.knownAdventurers || [],
      orders: state.orders || [],
      tutorial: state.tutorial || { isActive: true, currentStep: 0 },
      materialKnowledge: state.materialKnowledge || {},
      materialStudySessions: state.materialStudySessions || [],
      gameMessages: state.gameMessages || [],
      playTime: state.statistics?.playTime || 0,
      craftV2Persisted: state.craftV2Persisted || null,
      repairBenchWeaponId: state.repairBenchWeaponId ?? null,
      repairTechniqueStageRun: state.repairTechniqueStageRun ?? null,
      saveVersion: 5,
      forgottenForgePersist: {
        forgottenForgeQuest: state.forgottenForgeQuest,
        forgottenForgePhase: state.forgottenForgePhase,
        archivistDialogue: state.archivistDialogue,
        archivistPendingChoices: state.archivistPendingChoices,
        altarUnlockedByForgottenForgeQuest: state.altarUnlockedByForgottenForgeQuest,
        altarBuiltInForge: state.altarBuiltInForge,
      },
    }
  }, [])

  // Сохранение в localStorage (офлайн-бэкап)
  const saveToLocalStorage = useCallback((data: any) => {
    try {
      localStorage.setItem(OFFLINE_BACKUP_KEY, JSON.stringify(data))
      localStorage.setItem(TIMESTAMP_KEY, data.timestamp.toString())
    } catch (e) {
      console.error('[CloudSave] Failed to save to localStorage:', e)
    }
  }, [])

  // Загрузка из localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      const backup = localStorage.getItem(OFFLINE_BACKUP_KEY)
      if (backup) {
        return JSON.parse(backup)
      }
    } catch (e) {
      console.error('[CloudSave] Failed to load from localStorage:', e)
    }
    return null
  }, [])

  // Применение загруженных данных
  const applyLoadedData = useCallback((data: any) => {
    const p = data.player && typeof data.player === 'object' ? data.player : null
    const level = Number(data.level ?? p?.level) || 1
    const experience = Number(data.experience ?? p?.experience) || 0
    const fame = Number(data.fame ?? p?.fame) || 0

    const mergedResources = {
      ...initialResources,
      ...((data.resources || {}) as Partial<Resources>),
    } as Resources
    const mergedStash =
      data.materialStash != null && typeof data.materialStash === 'object' && !Array.isArray(data.materialStash)
        ? { ...(data.materialStash as Record<string, number>) }
        : {}
    const inv = migrateLegacyMaterialResourcesToStash(mergedResources, mergedStash)

    const baseMaterialKnowledge: Record<string, MaterialKnowledge> =
      data.materialKnowledge && typeof data.materialKnowledge === 'object'
        ? { ...(data.materialKnowledge as Record<string, MaterialKnowledge>) }
        : {}
    const materialKnowledge = { ...baseMaterialKnowledge }
    for (const [mid, qty] of Object.entries(inv.materialStash)) {
      if ((qty ?? 0) > 0 && !materialKnowledge[mid]) {
        materialKnowledge[mid] = createDiscoveredMaterialKnowledge(mid)
      }
    }

    const weaponInvForBench = data.weaponInventory || { weapons: [] }
    const weaponsForBench = Array.isArray(weaponInvForBench.weapons)
      ? (weaponInvForBench.weapons as { id?: string }[])
      : []
    const repairBenchWeaponId = normalizeRepairBenchWeaponIdFromSave(
      data.repairBenchWeaponId,
      weaponsForBench
    )
    const repairTechniqueStageRun = normalizeRepairTechniqueStageRunFromSave(
      data.repairTechniqueStageRun,
      repairBenchWeaponId,
      weaponsForBench
    )

    const ffPersist = normalizeForgottenForgePersistFromSave(data.forgottenForgePersist)

    const tutorialRaw = data.tutorial && typeof data.tutorial === 'object' ? data.tutorial : {}
    const tutorial = {
      isActive: true,
      currentStep: 0,
      completedSteps: [] as string[],
      skipped: false,
      starterForgeExpertiseGranted: false,
      weaponRepairGuidanceConsumed: false,
      weaponRepairGuidancePending: false,
      ...(tutorialRaw as Record<string, unknown>),
    }

    useGameStore.setState({
      player: {
        name: 'Кузнец',
        level: level,
        experience,
        experienceToNextLevel: Math.floor(100 * Math.pow(1.5, level - 1)),
        fame,
        title: getTitleByLevel(level),
      },
      resources: inv.resources,
      materialStash: inv.materialStash,
      statistics: data.statistics || {},
      workers: data.workers || [],
      buildings: data.buildings || [],
      maxWorkers: data.maxWorkers || 3,
      activeRefining: mergeActiveRefiningFromSave(data.activeRefining),
      weaponInventory: data.weaponInventory || { weapons: [] },
      unlockedRecipes: data.unlockedRecipes || { weaponRecipes: [], refiningRecipes: [] },
      recipeSources: data.recipeSources || [],
      unlockedEnchantments: data.unlockedEnchantments || [],
      unlockedMaterialProcessingTechniqueIds: Array.isArray(
        data.unlockedMaterialProcessingTechniqueIds
      )
        ? data.unlockedMaterialProcessingTechniqueIds
        : [],
      unlockedRepairTechniqueIds: Array.isArray(data.unlockedRepairTechniqueIds)
        ? data.unlockedRepairTechniqueIds
        : [],
      unlockedReforgeTechniqueIds: Array.isArray(data.unlockedReforgeTechniqueIds)
        ? data.unlockedReforgeTechniqueIds
        : [],
      guild: data.guild || {},
      knownAdventurers: data.knownAdventurers || [],
      orders: data.orders || [],
      tutorial,
      materialKnowledge,
      materialStudySessions: normalizeMaterialStudySessionsFromSave(
        Array.isArray(data.materialStudySessions) ? data.materialStudySessions : []
      ),
      gameMessages: Array.isArray(data.gameMessages) ? data.gameMessages : [],
      craftV2Persisted: mergeCraftV2PersistedFromSave(
        data.craftV2Persisted,
        data.activeCraft
      ),
      repairBenchWeaponId,
      repairTechniqueStageRun,
      forgottenForgeQuest: ffPersist.forgottenForgeQuest,
      forgottenForgePhase: ffPersist.forgottenForgePhase as QuestPhase,
      archivistDialogue: ffPersist.archivistDialogue,
      archivistPendingChoices: ffPersist.archivistPendingChoices,
      altarUnlockedByForgottenForgeQuest: ffPersist.altarUnlockedByForgottenForgeQuest,
      altarBuiltInForge: ffPersist.altarBuiltInForge,
    })
  }, [])

  // Сохранение
  const save = useCallback(async (): Promise<boolean> => {
    if (isSaving) return false

    setIsSaving(true)
    setError(null)

    const saveData = collectSaveData()

    // Всегда сохраняем в localStorage как бэкап
    saveToLocalStorage(saveData)

    if (!cloudEnabled) {
      setLastSavedAt(new Date())
      setIsSaving(false)
      return true
    }

    // Если онлайн - сохраняем на сервер
    if (isOnline) {
      try {
        const response = await fetch('/api/save', {
          method: 'POST',
          credentials: 'include',
          headers: buildSaveFetchHeaders(true, enforceAuth, playerId),
          body: JSON.stringify(saveData),
        })

        const result = await response.json()

        if (result.success) {
          setLastSavedAt(new Date())
          console.warn('[CloudSave] Saved to server successfully')
          return true
        } else {
          setError(result.error || 'Save failed')
          return false
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error')
        console.error('[CloudSave] Server save error:', err)
        return false
      } finally {
        setIsSaving(false)
      }
    } else {
      // Офлайн - сохранено только в localStorage
      console.warn('[CloudSave] Offline - saved to localStorage')
      setLastSavedAt(new Date())
      setIsSaving(false)
      return true
    }
  }, [cloudEnabled, collectSaveData, enforceAuth, isOnline, isSaving, playerId, saveToLocalStorage])

  // Загрузка
  const load = useCallback(async (): Promise<boolean> => {
    if (!cloudEnabled) {
      setError(null)
      setIsLoading(false)
      return false
    }

    setIsLoading(true)
    setError(null)

    let loadedData: any = null
    let source = 'none'

    try {
      // Сначала пробуем загрузить с сервера
      if (isOnline) {
        try {
          const response = await fetchWithTimeout(
            '/api/save',
            {
              method: 'GET',
              credentials: 'include',
              headers: buildSaveFetchHeaders(false, enforceAuth, playerId),
            },
            LOAD_FETCH_TIMEOUT_MS
          )

          let result: { success?: boolean; data?: unknown; error?: string; needsConfig?: boolean } = {}
          try {
            result = await response.json()
          } catch {
            setError('Некорректный ответ сервера при загрузке')
          }

          if (result.success && result.data) {
            loadedData = result.data
            source = 'server'
          } else if (result.needsConfig || response.status === 503) {
            // Turso не настроен — играем из localStorage / дефолт без блокировки UI
            setError(null)
          } else if (!response.ok && result.error) {
            setError(result.error)
          }
        } catch (e) {
          const err = e instanceof Error ? e : null
          if (err?.name === 'AbortError') {
            setError('Таймаут загрузки облака — используем локальные данные')
          } else {
            setError(err?.message ?? 'Ошибка сети')
          }
        }
      }

      // Проверяем localStorage на наличие более свежего офлайн-сохранения
      const localBackup = loadFromLocalStorage()
      if (localBackup && localBackup.timestamp) {
        if (!loadedData || localBackup.timestamp > (loadedData.timestamp || 0)) {
          loadedData = localBackup
          source = 'local'
          console.warn('[CloudSave] Using newer local backup')
        }
      }

      // Применяем данные
      if (loadedData) {
        applyLoadedData(loadedData)
        console.warn(`[CloudSave] Loaded from ${source}, timestamp:`, new Date(loadedData.timestamp))
        return true
      }

      return false
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Load error')
      console.error('[CloudSave] Load error:', err)

      // Пробуем загрузить из localStorage как fallback
      const localBackup = loadFromLocalStorage()
      if (localBackup) {
        applyLoadedData(localBackup)
        console.warn('[CloudSave] Loaded from local backup as fallback')
        return true
      }

      return false
    } finally {
      setIsLoading(false)
    }
  }, [applyLoadedData, cloudEnabled, enforceAuth, isOnline, loadFromLocalStorage, playerId])

  // Сброс
  const reset = useCallback(async (): Promise<boolean> => {
    if (!cloudEnabled) {
      localStorage.removeItem(OFFLINE_BACKUP_KEY)
      localStorage.removeItem(TIMESTAMP_KEY)
      window.location.reload()
      return true
    }
    try {
      const response = await fetch('/api/save', {
        method: 'DELETE',
        credentials: 'include',
        headers: buildSaveFetchHeaders(false, enforceAuth, playerId),
      })

      const result = await response.json()

      if (result.success) {
        localStorage.removeItem(OFFLINE_BACKUP_KEY)
        localStorage.removeItem(TIMESTAMP_KEY)
        window.location.reload()
        return true
      }
      return false
    } catch (err) {
      console.error('[CloudSave] Reset error:', err)
      return false
    }
  }, [cloudEnabled, enforceAuth, playerId])

  const loadRef = useRef(load)
  loadRef.current = load
  useEffect(() => {
    if (!authReady) return
    void loadRef.current()
  }, [authReady])

  // Автосохранение
  useEffect(() => {
    if (!enableAutoSave) return

    const interval = setInterval(() => {
      save()
    }, autoSaveInterval)

    return () => clearInterval(interval)
  }, [enableAutoSave, autoSaveInterval, save])

  // Сохранение при закрытии страницы
  useEffect(() => {
    const handleBeforeUnload = () => {
      const saveData = collectSaveData()
      saveToLocalStorage(saveData)

      if (cloudEnabled && isOnline) {
        const blob = new Blob([JSON.stringify(saveData)], { type: 'application/json' })
        navigator.sendBeacon('/api/save', blob)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [cloudEnabled, collectSaveData, isOnline, saveToLocalStorage])

  return {
    isLoading,
    isSaving,
    lastSavedAt,
    error,
    isOnline,
    save,
    load,
    reset,
  }
}

export type { CloudSaveResult, UseCloudSaveOptions }
