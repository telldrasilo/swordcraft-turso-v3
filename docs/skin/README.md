# SwordCraft — заготовка UI (`docs/skin`)

Отдельное мини-приложение на **Next.js 16 + Tailwind CSS v4** (тот же стек, что у корня репозитория): семантические токены (`bg-background`, `text-primary`, …) из `@theme`, палитры **Tailwind** для вёрстки как в `game-layout` (`from-stone-950`, `text-amber-200`, …). Оболочка вынесена в `components/skin-shell.tsx`.

Раньше здесь стоял **Vite** как самый короткий путь к статическому HTML без React. Для прототипов, которые потом переносятся в основное приложение, удобнее **тот же Next.js + React**, без второго стека.

## Быстрый старт

```bash
cd docs/skin
npm install
npm run dev
```

Порт **3010** задан в скрипте `dev` в `package.json`: [http://localhost:3010](http://localhost:3010).

Продакшен-сборка этой папки:

```bash
npm run build
npm run start
```

Папку `docs/skin` можно копировать отдельно; достаточно `npm install` внутри неё.

## Стек (согласован с корневым репозиторием)

| Слой | В этой папке | В основном проекте |
|------|----------------|---------------------|
| Фреймворк | **Next.js** 16 (App Router) | То же |
| Стили | **Tailwind CSS** 4, **tw-animate-css**, PostCSS | То же + полный `src/app/globals.css` |
| UI | **React** 19, разметка в `components/` | **React** + **shadcn/ui** (Radix) |
| Состояние | — | **Zustand** 5 |

Полный список зависимостей монорепозитория: корневой `package.json`. Документация: [`docs/README.md`](../README.md), [`AGENTS.md`](../../AGENTS.md).

## Файлы

| Путь | Назначение |
|------|------------|
| `package.json` | `next dev/build/start`, порт 3010 |
| `next.config.ts` | Минимальная конфигурация Next |
| `postcss.config.mjs` | `@tailwindcss/postcss` |
| `app/layout.tsx`, `app/page.tsx` | Корневой layout и страница |
| `app/globals.css` | Tailwind, `@theme`, импорт `src/theme-root.css`, utilities, animations, скроллбары |
| `components/skin-shell.tsx` | Оболочка (сайдбар, статусбар, кузница, док) |
| `src/theme-root.css` | `:root` / `.light` — значения токенов |
| `src/utilities.css`, `src/animations.css` | Как в прежней заготовке |
| `src/experiments/` | Черновики CSS (подключение в `app/layout.tsx`) |
| `public/` | Статика `/…` |
| `IDEA_TEMPLATE.md`, `BOILERPLATE.md` | Шаблон идеи и обзор болванки |

Источник правды по теме в игре: **`src/app/globals.css`**. После смены темы сверьте `theme-root.css` и `@theme` в `app/globals.css`.

## Как стилировать модули

1. **Семантика** — `bg-background`, `text-muted-foreground`, `border-border`, `text-primary`, …
2. **Layout как в игре** — `stone-*`, `amber-*`, градиенты и прозрачность как в `game-layout.tsx`.
3. **Утилиты игры** — `glow-gold`, `scrollbar-medieval`, классы из `src/utilities.css` / `animations.css`.

При желании подключите **Geist** в `app/layout.tsx` так же, как в корневом `src/app/layout.tsx`.

## Болванка для идей

- [`BOILERPLATE.md`](./BOILERPLATE.md), [`IDEA_TEMPLATE.md`](./IDEA_TEMPLATE.md), [`src/experiments/README.md`](./src/experiments/README.md), **`public/`**

## Прочее

- [`MODULE_STARTER.md`](./MODULE_STARTER.md) — перенос в монорепозиторий.
- `npm run typecheck` — `tsc --noEmit`.
- В `.gitignore`: `.next/`, `out/`, `node_modules/`.
