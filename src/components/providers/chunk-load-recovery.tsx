'use client'

import { useEffect } from 'react'

const SESSION_KEY = 'swordcraft-chunk-reload-once'

function messageLooksLikeStaleChunk(error: unknown): boolean {
  const msg =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : ''
  if (!msg) return false
  return (
    /ChunkLoadError|loading chunk \d+ failed|__webpack_modules__\[/i.test(msg) ||
    /Failed to fetch dynamically imported module/i.test(msg)
  )
}

/**
 * Однократная перезагрузка вкладки при типичных сбоях загрузки чанков Webpack
 * (устаревший кеш `.next`, несовпадение порта с тем, с которого отдан HTML, прерванный HMR).
 */
export function ChunkLoadRecovery() {
  useEffect(() => {
    /** Сбрасываем флаг после успешной загрузки, чтобы повторный сбой чанка снова мог сделать одну перезагрузку. */
    const clearFlagTimer = window.setTimeout(() => {
      try {
        sessionStorage.removeItem(SESSION_KEY)
      } catch {
        /* ignore */
      }
    }, 10_000)

    const tryReload = (reason: unknown) => {
      if (!messageLooksLikeStaleChunk(reason)) return
      try {
        if (sessionStorage.getItem(SESSION_KEY)) return
        sessionStorage.setItem(SESSION_KEY, '1')
      } catch {
        return
      }
      window.location.reload()
    }

    const onRejection = (ev: PromiseRejectionEvent) => {
      tryReload(ev.reason)
    }
    const onError = (ev: ErrorEvent) => {
      tryReload(ev.error ?? ev.message)
    }

    window.addEventListener('unhandledrejection', onRejection)
    window.addEventListener('error', onError)
    return () => {
      window.clearTimeout(clearFlagTimer)
      window.removeEventListener('unhandledrejection', onRejection)
      window.removeEventListener('error', onError)
    }
  }, [])

  return null
}
