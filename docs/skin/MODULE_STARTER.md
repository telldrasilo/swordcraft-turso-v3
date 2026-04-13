# Заготовка для разработки модуля

Краткий ориентир, как из прототипа в `docs/skin` перейти к полноценному коду в репозитории.

## 0. Локальная оболочка

```bash
cd docs/skin
npm install
npm run dev
```

Вёрстка в `components/skin-shell.tsx` использует **Tailwind** (классы `stone-*`, `amber-*`, семантические `bg-background`, `text-primary`, …). В основном приложении переносите в свои компоненты и `className` 1:1.

Описание идеи до кода: [`IDEA_TEMPLATE.md`](./IDEA_TEMPLATE.md). Обзор возможностей болванки: [`BOILERPLATE.md`](./BOILERPLATE.md).

## 1. Разметка и стили

- Переносите UI в **`src/components/`** (например `src/components/screens/`, `src/components/systems/`).
- Стили в игре — **Tailwind** + токены из `globals.css`; классы из заготовки можно перевести в `className` с теми же визуальными акцентами (`stone-*`, `amber-*`, `var(--primary)`).
- Общие утилиты уже есть в приложении: `glow-gold`, `scrollbar-medieval`, `animate-pulse-gold` и т.д. — см. `src/app/globals.css`.

## 2. Состояние

- Центральный store: **`src/store/game-store-composed.ts`** и слайсы в `src/store/slices/`.
- Сложная логика между слайсами: **`src/store/cross-slice/`**.
- Перед новыми полями состояния — **`src/types/`** и при необходимости `docs/04_TYPES_SYSTEM.md`.

## 3. Данные и баланс

- Статика игры: **`src/data/`**.
- Константы порогов/цен: **`src/lib/store-utils/constants.ts`**.
- Формулы: **`docs/utils/FORMULAS.md`**.

## 4. Маршруты и экраны

- Новый экран: зарегистрировать в **`GameScreen`** и в маппинге экранов в **`src/components/layout/game-layout.tsx`** (и при необходимости в навигации).
- Кузница по умолчанию: **`ForgeScreen`**, `src/components/screens/forge-screen.tsx`.

## 5. Качество

- Юнит-тесты рядом с логикой: **`src/**/*.test.ts`**, Vitest.
- Перед PR: `npm run lint`, `npm run type-check`, `npm run test`, `npm run build` (как в CI).

## 6. Документация по домену

В зависимости от модуля читайте соответствующие файлы в `docs/systems/`, `docs/data/`, roadmap-файлы в `docs/` — см. **`AGENTS.md`**.

## 7. Облако и сейвы

- Расширение полей облака: **`src/lib/cloud-save-feature.ts`**, API **`src/app/api/save/route.ts`**.
- Локально основной слой — Zustand persist; облако включается флагом окружения (см. `AGENTS.md`).

---

**Идея папки `skin`:** быстро проверить визуал и разметку без HMR и без связи с store; затем перенос в React с подключением к существующим паттернам проекта.
