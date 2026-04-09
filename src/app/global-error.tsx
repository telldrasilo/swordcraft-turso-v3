'use client'

/**
 * Падение в root layout (шрифты, провайдеры) не ловится app/error.tsx — иначе полностью белый экран.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ru">
      <body className="bg-stone-950 text-stone-200 antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
          <h1 className="text-xl font-semibold text-amber-200">Критическая ошибка загрузки</h1>
          <p className="max-w-md text-center text-sm text-stone-400">
            Попробуйте «Снова», жёсткое обновление (Ctrl+Shift+R) или{' '}
            <code className="rounded bg-stone-800 px-1 text-xs">npm run dev:clean</code>. Если не
            помогло — очистите localStorage для ключа сохранения (см. AGENTS.md).
          </p>
          {process.env.NODE_ENV === 'development' && error.message ? (
            <pre className="max-h-40 max-w-full overflow-auto rounded border border-stone-700 bg-stone-900 p-3 text-left text-xs text-red-300">
              {error.message}
            </pre>
          ) : null}
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-amber-50 hover:bg-amber-600"
          >
            Снова
          </button>
        </div>
      </body>
    </html>
  )
}
