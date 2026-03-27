/**
 * Хук для синхронизации игры с сервером
 * Автоматическое сохранение и загрузка с поддержкой офлайн-режима
 */

import { useEffect, useCallback, useRef, useState } from 'react'
import { useGameStore } from '@/store'

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

export function useCloudSave(options: UseCloudSaveOptions = {}): CloudSaveResult {
  const { autoSaveInterval = 60000, enableAutoSave = true, playerId = 'demo-player' } = options

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const isLoadingRef = useRef(false)

  // Отслеживаем состояние сети
  useEffect(() => {
    const handleOnline = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOnline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOnline)
    }
  }, [])

  // Сбор данных для сохранения
  const collectSaveData = useCallback(() => {
    const state = useGameStore.getState()

    return {
      timestamp: Date.now(),
      player: {
        level: state.player?.level || 1,
        experience: state.player?.experience || 0,
        fame: state.player?.fame || 1,
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
    const level = data.level || 1

    useGameStore.setState({
      player: {
        name: 'Кузнец',
        level: level,
        experience: data.experience || 0,
        experienceToNextLevel: Math.floor(100 * Math.pow(1.5, level - 1)),
        fame: data.fame || 0,
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
          headers: {
            'Content-Type': 'application/json',
            'x-player-id': playerId,
          },
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
  }, [collectSaveData, isOnline, isSaving, playerId, saveToLocalStorage])

  // Загрузка
  const load = useCallback(async (): Promise<boolean> => {
    // #region agent log
    fetch('http://127.0.0.1:7756/ingest/6a59fcb2-1024-4589-94d8-127641c9bb5c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d59723'},body:JSON.stringify({sessionId:'d59723',location:'use-cloud-save.ts:load-start',message:'load called',data:{isLoadingRef:isLoadingRef.current},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (isLoadingRef.current) return false

    isLoadingRef.current = true
    setIsLoading(true)
    setError(null)

    let loadedData: any = null
    let source = 'none'

    try {
      // Сначала пробуем загрузить с сервера
      if (isOnline) {
        // #region agent log
        fetch('http://127.0.0.1:7756/ingest/6a59fcb2-1024-4589-94d8-127641c9bb5c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d59723'},body:JSON.stringify({sessionId:'d59723',location:'use-cloud-save.ts:load-fetch',message:'fetching from server',data:{playerId},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        const response = await fetch('/api/save', {
          method: 'GET',
          headers: {
            'x-player-id': playerId,
          },
        })

        const result = await response.json()
        // #region agent log
        fetch('http://127.0.0.1:7756/ingest/6a59fcb2-1024-4589-94d8-127641c9bb5c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d59723'},body:JSON.stringify({sessionId:'d59723',location:'use-cloud-save.ts:load-server-result',message:'server response',data:{success:result.success,hasData:!!result.data},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        if (result.success && result.data) {
          loadedData = result.data
          source = 'server'
        }
      }

      // Проверяем localStorage на наличие более свежего офлайн-сохранения
      const localBackup = loadFromLocalStorage()
      // #region agent log
      fetch('http://127.0.0.1:7756/ingest/6a59fcb2-1024-4589-94d8-127641c9bb5c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d59723'},body:JSON.stringify({sessionId:'d59723',location:'use-cloud-save.ts:load-local',message:'local backup check',data:{hasBackup:!!localBackup,hasTimestamp:!!localBackup?.timestamp,hasCraftV2:!!localBackup?.craftV2Persisted,craftV2Stage:localBackup?.craftV2Persisted?.stage,craftV2HasActive:!!localBackup?.craftV2Persisted?.activeCraft},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      if (localBackup && localBackup.timestamp) {
        if (!loadedData || localBackup.timestamp > (loadedData.timestamp || 0)) {
          loadedData = localBackup
          source = 'local'
          console.log('[CloudSave] Using newer local backup')
        }
      }

      // Применяем данные
      if (loadedData) {
        // #region agent log
        fetch('http://127.0.0.1:7756/ingest/6a59fcb2-1024-4589-94d8-127641c9bb5c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d59723'},body:JSON.stringify({sessionId:'d59723',location:'use-cloud-save.ts:load-apply',message:'applying loaded data',data:{source,hasCraftV2:!!loadedData.craftV2Persisted,craftV2Stage:loadedData.craftV2Persisted?.stage},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        applyLoadedData(loadedData)
        console.log(`[CloudSave] Loaded from ${source}, timestamp:`, new Date(loadedData.timestamp))
        // #region agent log
        fetch('http://127.0.0.1:7756/ingest/6a59fcb2-1024-4589-94d8-127641c9bb5c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d59723'},body:JSON.stringify({sessionId:'d59723',location:'use-cloud-save.ts:load-applied',message:'data applied successfully',data:{source},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        return true
      }

      return false
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7756/ingest/6a59fcb2-1024-4589-94d8-127641c9bb5c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d59723'},body:JSON.stringify({sessionId:'d59723',location:'use-cloud-save.ts:load-error',message:'load error',data:{error:err instanceof Error?err.message:String(err)},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
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
      // #region agent log
      fetch('http://127.0.0.1:7756/ingest/6a59fcb2-1024-4589-94d8-127641c9bb5c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d59723'},body:JSON.stringify({sessionId:'d59723',location:'use-cloud-save.ts:load-finally',message:'load finally block',data:{},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setIsLoading(false)
      isLoadingRef.current = false
    }
  }, [applyLoadedData, isOnline, loadFromLocalStorage, playerId])

  // Сброс
  const reset = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/save', {
        method: 'DELETE',
        headers: {
          'x-player-id': playerId,
        },
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
  }, [playerId])

  // Загрузка при монтировании (только один раз)
  const loadRef = useRef(load)
  loadRef.current = load
  useEffect(() => {
    loadRef.current()
  }, [])

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
