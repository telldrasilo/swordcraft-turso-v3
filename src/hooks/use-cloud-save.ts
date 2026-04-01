/**
 * Хук для синхронизации игры с сервером
 * Автоматическое сохранение и загрузка с поддержкой офлайн-режима
 */

import { useEffect, useCallback, useRef, useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useGameStore } from '@/store'
import { isSaveAuthEnforcedClient } from '@/lib/save-auth'

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

  const [authReady, setAuthReady] = useState(!enforceAuth)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  // Отслеживаем состояние сети
  useEffect(() => {
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
    if (!enforceAuth) return
    let cancelled = false
    let settled = false
    const finish = () => {
      if (cancelled || settled) return
      settled = true
      setAuthReady(true)
    }
    const timeoutId = window.setTimeout(() => {
      console.warn('[CloudSave] Auth bootstrap timeout — продолжаем загрузку сохранения')
      finish()
    }, AUTH_BOOTSTRAP_TIMEOUT_MS)

    void (async () => {
      try {
        const existing = await getSession()
        if (!cancelled && !existing) {
          await signIn('demo', { redirect: false })
        }
      } catch (e) {
        console.error('[CloudSave] Session bootstrap failed:', e)
      } finally {
        window.clearTimeout(timeoutId)
        if (!cancelled) finish()
      }
    })()

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [enforceAuth])

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
      statistics: state.statistics || {},
      workers: state.workers || [],
      buildings: state.buildings || [],
      maxWorkers: state.maxWorkers || 3,
      activeCraft: state.activeCraft || {},
      activeRefining: state.activeRefining || {},
      weaponInventory: state.weaponInventory || { weapons: [] },
      unlockedRecipes: state.unlockedRecipes || { weaponRecipes: [], refiningRecipes: [] },
      recipeSources: state.recipeSources || [],
      unlockedEnchantments: state.unlockedEnchantments || [],
      guild: state.guild || {},
      knownAdventurers: state.knownAdventurers || [],
      orders: state.orders || [],
      tutorial: state.tutorial || { isActive: true, currentStep: 0 },
      materialKnowledge: state.materialKnowledge || {},
      playTime: state.statistics?.playTime || 0,
      craftV2Persisted: state.craftV2Persisted || null,
      saveVersion: 3,
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

    useGameStore.setState({
      player: {
        name: 'Кузнец',
        level: level,
        experience,
        experienceToNextLevel: Math.floor(100 * Math.pow(1.5, level - 1)),
        fame,
        title: getTitleByLevel(level),
      },
      resources: data.resources || {},
      statistics: data.statistics || {},
      workers: data.workers || [],
      buildings: data.buildings || [],
      maxWorkers: data.maxWorkers || 3,
      activeCraft: data.activeCraft || {},
      activeRefining: data.activeRefining || {},
      weaponInventory: data.weaponInventory || { weapons: [] },
      unlockedRecipes: data.unlockedRecipes || { weaponRecipes: [], refiningRecipes: [] },
      recipeSources: data.recipeSources || [],
      unlockedEnchantments: data.unlockedEnchantments || [],
      guild: data.guild || {},
      knownAdventurers: data.knownAdventurers || [],
      orders: data.orders || [],
      tutorial: data.tutorial || { isActive: true, currentStep: 0 },
      materialKnowledge:
        data.materialKnowledge && typeof data.materialKnowledge === 'object'
          ? data.materialKnowledge
          : {},
      craftV2Persisted: data.craftV2Persisted || null,
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
          console.log('[CloudSave] Saved to server successfully')
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
      console.log('[CloudSave] Offline - saved to localStorage')
      setLastSavedAt(new Date())
      setIsSaving(false)
      return true
    }
  }, [collectSaveData, enforceAuth, isOnline, isSaving, playerId, saveToLocalStorage])

  // Загрузка
  const load = useCallback(async (): Promise<boolean> => {
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
          console.log('[CloudSave] Using newer local backup')
        }
      }

      // Применяем данные
      if (loadedData) {
        applyLoadedData(loadedData)
        console.log(`[CloudSave] Loaded from ${source}, timestamp:`, new Date(loadedData.timestamp))
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
        console.log('[CloudSave] Loaded from local backup as fallback')
        return true
      }

      return false
    } finally {
      setIsLoading(false)
    }
  }, [applyLoadedData, enforceAuth, isOnline, loadFromLocalStorage, playerId])

  // Сброс
  const reset = useCallback(async (): Promise<boolean> => {
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
  }, [enforceAuth, playerId])

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

      if (isOnline) {
        const blob = new Blob([JSON.stringify(saveData)], { type: 'application/json' })
        navigator.sendBeacon('/api/save', blob)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [collectSaveData, isOnline, saveToLocalStorage])

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
