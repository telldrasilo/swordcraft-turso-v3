/**
 * Статическая оболочка UI — тот же каркас, что в game-layout / forge-screen (Tailwind).
 */
export function SkinShell() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 text-stone-300 md:flex-row">
      <nav
        className="flex w-full shrink-0 flex-col flex-wrap border-b border-stone-700/50 bg-gradient-to-b from-stone-900 to-stone-950 p-4 md:h-auto md:w-64 md:flex-nowrap md:border-b-0 md:border-r"
        aria-label="Основная навигация"
      >
        <div className="mb-8 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-amber-200 text-glow">⚔️ SwordCraft</h1>
            <p className="text-xs text-stone-500">Idle Forge</p>
          </div>
          <button
            type="button"
            className="h-8 w-8 shrink-0 rounded-md p-0 text-stone-400 hover:text-amber-400 disabled:opacity-90"
            title="Сохранить игру"
            aria-label="Сохранить игру"
            disabled
          >
            <svg className="mx-auto h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-2 md:flex-1">
          <button
            type="button"
            className="flex w-full items-center justify-start gap-3 rounded-md bg-gradient-to-r from-amber-800 to-amber-900 px-3 py-2 text-amber-100 shadow-lg glow-gold"
            aria-current="page"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
            <span className="flex-1 text-left text-sm font-medium">Кузница</span>
          </button>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-4 md:mt-auto">
          <div className="flex h-32 items-end justify-center rounded-lg border border-amber-800/20 bg-gradient-to-t from-amber-900/20 to-transparent pb-4">
            <div className="text-center">
              <svg
                className="animate-pulse-gold mx-auto h-8 w-8 text-amber-500/50"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
              <p className="mt-1 text-xs text-stone-600">Кузница работает</p>
            </div>
          </div>
          <button type="button" className="w-full justify-start gap-2 rounded-md px-3 py-2 text-left text-xs text-stone-500 opacity-80" disabled>
            Сбросить игру
          </button>
        </div>
      </nav>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col md:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header
            className="shrink-0 border-b border-stone-700/50 bg-gradient-to-b from-stone-900 to-stone-950 px-4 py-3"
            data-tutorial="resources-bar"
            aria-label="Ресурсы и прогресс"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-md border border-amber-600/50 bg-amber-900/30 px-2 py-0.5 text-xs font-semibold text-amber-200">
                  Lv.12
                </span>
                <span className="font-medium text-stone-300">Кузнец</span>
                <span className="hidden text-xs text-stone-500 sm:inline">(Новичок)</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="inline-flex items-center gap-1 font-semibold text-amber-200">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="8" cy="8" r="6" />
                    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
                    <path d="M7 6h1v4" />
                    <path d="m16.71 13.88.7.71-2.82 2.82" />
                  </svg>
                  124 580
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-purple-300">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
                  </svg>
                  3 240
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-green-500" title="Сохранено">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M21.801 10A10 10 0 1 1 17 3.335" />
                    <path d="m9 11 3 3L22 4" />
                  </svg>
                  <span className="hidden sm:inline">только что</span>
                </span>
                <div className="flex min-w-[140px] items-center gap-2">
                  <div
                    className="relative h-2 w-24 overflow-hidden rounded-full bg-stone-800"
                    role="progressbar"
                    aria-valuenow={65}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Опыт до следующего уровня"
                  >
                    <div
                      className="bg-primary h-full w-full transition-transform duration-300 ease-out"
                      style={{ transform: 'translateX(-34.84%)' }}
                    />
                  </div>
                  <span className="whitespace-nowrap text-xs text-stone-400">2450/3760</span>
                </div>
              </div>
            </div>
          </header>

          <main className="scrollbar-medieval min-h-0 flex-1 overflow-y-auto" id="module-root">
            <div className="space-y-6 p-4 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="flex items-center gap-2 text-2xl font-bold text-amber-200">
                    <svg className="h-6 w-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                    </svg>
                    Кузница
                  </h2>
                  <p className="text-sm text-stone-500">Создавайте легендарное оружие</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-md border border-amber-600/50 bg-amber-900/30 px-2.5 py-0.5 text-xs font-semibold text-amber-200">
                    <svg className="mr-1 h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                    </svg>
                    12 рецептов
                  </span>
                  <span className="inline-flex items-center rounded-md border border-stone-600 bg-stone-800/50 px-2.5 py-0.5 text-xs font-semibold text-stone-300">
                    <svg className="mr-1 h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
                      <path d="M12 22V12" />
                      <polyline points="3.29 7 12 12 20.71 7" />
                      <path d="m7.5 4.27 9 5.15" />
                    </svg>
                    4 в инвентаре
                  </span>
                </div>
              </div>

              <div className="flex min-h-[12rem] items-center justify-center rounded-md border border-dashed border-stone-600 bg-stone-900/40 p-6 text-center text-sm text-muted-foreground">
                Модуль
              </div>
            </div>
          </main>
        </div>

        <aside
          className="hidden min-h-0 w-[min(100vw,356px)] shrink-0 flex-row self-stretch border-l border-stone-800/80 bg-stone-950/80 backdrop-blur-sm md:flex"
          aria-label="Лента событий"
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-stone-800/80 px-2 py-2">
              <span className="pl-1 text-xs font-semibold uppercase tracking-wide text-stone-400">Энциклопедия</span>
              <button
                type="button"
                className="h-8 w-8 shrink-0 rounded-md text-stone-400 hover:bg-stone-800/80 hover:text-amber-200"
                aria-label="Свернуть ленту событий вправо"
                title="Свернуть"
              >
                <svg className="mx-auto h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
            <div className="scrollbar-dock-subtle min-h-0 flex-1 overflow-y-auto p-2" />
          </div>
          <div
            className="flex w-12 shrink-0 flex-col gap-1 border-l border-stone-800/80 bg-stone-950/90 py-2 pl-1 pr-1"
            role="tablist"
            aria-label="Каналы сообщений"
          >
            <button
              type="button"
              className="flex w-full flex-col items-center justify-center rounded-md border border-amber-700/60 bg-amber-900/50 py-2 text-amber-100"
              aria-selected
              title="Энциклопедия"
              aria-label="Энциклопедия"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 7v14" />
                <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
              </svg>
            </button>
            <button
              type="button"
              className="flex w-full flex-col items-center justify-center rounded-md border border-transparent py-2 text-stone-500 hover:text-stone-300"
              aria-selected={false}
              title="Архивариус"
              aria-label="Архивариус"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M15 12h-5" />
                <path d="M15 8h-5" />
                <path d="M19 17V5a2 2 0 0 0-2-2H4" />
                <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3" />
              </svg>
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
