# Эксперименты (изолированные идеи)

Сюда кладите **дополнительные стили и скрипты** для прототипа, не смешивая с базовой темой, пока идея не созрела.

## Стили

1. Создайте файл, например `my-feature.css`.
2. Подключите в `app/layout.tsx` **после** `./globals.css`:

```tsx
import './globals.css'
import '../src/experiments/my-feature.css'
```

3. В `my-feature.css` используйте те же токены (`var(--primary)`), утилиты Tailwind через `@apply` в `@layer components` при желании, или чистый CSS.

## Разметка

- Быстрый путь: правьте содержимое `#module-root` в `components/skin-shell.tsx` (или подключите свой компонент из `app/page.tsx`).
- Если нужна **отдельная страница** — добавьте маршрут в `app/…/page.tsx` (например `app/prototype/page.tsx`).

## Скрипты

Добавьте `src/experiments/my-feature.ts` и импорт в `app/layout.tsx` или в страницу/компонент. Логику держите чистой; при переносе в игру — переписать на React и store.
