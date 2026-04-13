# Болванка `docs/skin`: что уже есть и что добавить по желанию

## Уже подготовлено

| Элемент | Зачем |
|--------|--------|
| Next.js 16 + Tailwind 4 + тема как в `globals.css` | Тот же стек, что у основного приложения; dev/build как в монорепо |
| `app/page.tsx` + `components/skin-shell.tsx` | Оболочка игры без дублирования с основным `GameLayout` |
| `src/theme-root.css`, `app/globals.css` | Токены и `@theme` — те же паттерны, что в `src/app/globals.css` |
| `src/utilities.css`, `animations.css` | Общие утилиты и анимации из приложения |
| `src/experiments/` | Изолированные CSS/TS без смешения с базой |
| `public/` | Картинки и файлы по URL `/…` |
| `IDEA_TEMPLATE.md` | Оформить идею до кода |
| `MODULE_STARTER.md` | Чеклист переноса в монорепозиторий |
| `.editorconfig` | Единый стиль отступов |
| `npm run typecheck` | Проверка `app/`, `components/` и скриптов |

## Опционально (по мере необходимости)

- **Prettier** — запускать из корня репозитория (`npm run format`) или добавить `prettier` в `docs/skin/package.json`, если папка живёт отдельно.
- **Vitest в этой папке** — обычно избыточен: юнит-тесты логики лучше в корне (`src/**/*.test.ts`).
- **Отдельная страница без оболочки** — новый маршрут `app/…/page.tsx` без `SkinShell` или отдельный layout.
- **Копия `.prettierrc`** из корня — если проект выносится в отдельный репозиторий.

## Минимальный цикл «идея → код в игре»

1. Заполнить `IDEA_TEMPLATE.md` (или копию).
2. Верстать/скриптовать в `#module-root` и/или `src/experiments/`.
3. Согласовать с `AGENTS.md` и нужным `docs/systems/*.md`.
4. Перенести по `MODULE_STARTER.md`.
