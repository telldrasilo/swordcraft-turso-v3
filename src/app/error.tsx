'use client'

/**
 * Сегмент ошибки App Router: вместо пустого белого экрана при падении UI в дереве страницы.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 p-6 text-stone-200">
      <h1 className="text-xl font-semibold text-amber-200">Не удалось отобразить экран</h1>
      <p className="max-w-md text-center text-sm text-stone-400">
        Нажмите «Попробовать снова» или обновите страницу. Иногда помогает жёсткое обновление
        (Ctrl+Shift+R) или очистка кеша сайта. При повторении — сброс игры в боковом меню.
      </p>
      {process.env.NODE_ENV === 'development' && error.message ? (
        <pre className="max-h-40 max-w-full overflow-auto rounded border border-stone-700 bg-stone-900/80 p-3 text-left text-xs text-red-300">
          {error.message}
        </pre>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-amber-50 hover:bg-amber-600"
      >
        Попробовать снова
      </button>
    </div>
  )
}
