# SwordCraft — Контекст для AI агентов

## Что это за проект
SwordCraft — браузерная игра-симулятор кузнеца оружия с системой гильдии, экспедиций, зачарований и заказов NPC.

## Технологии
Next.js 15, TypeScript 5, Zustand 5.0.6 (composed store), Tailwind CSS 4, shadcn/ui (Radix UI), Prisma 6.6.0, @libsql/client (Turso/libSQL)

## Порядок чтения документации

### Всегда читай первым:
**AGENTS.md** — этот файл (вы сейчас его читаете)

### Затем по очереди:
1. **docs/README.md** — навигация по всем файлам документации и карта систем игры
2. **docs/01_ARCHITECTURE.md** — обзор технологий, архитектурные паттерны, потоки данных между системами
3. **docs/03_STATE_MANAGEMENT.md** — Zustand store с описанием всех slices (центральная система)
4. **docs/04_TYPES_SYSTEM.md** — все интерфейсы, enum'ы, константы игры

### При работе с конкретными системами:
- **Крафт оружия** → docs/systems/FORGE_SYSTEM.md + docs/utils/CRAFT_CALCULATOR.md
- **Экспедиции** → docs/systems/GUILD_SYSTEM.md + EXPEDITION_SYSTEM.md (уже существует)
- **Заказы NPC** → docs/systems/ORDER_SYSTEM.md
- **Ресурсы и рабочие** → docs/systems/RESOURCE_SYSTEM.md
- **Зачарования** → docs/systems/ENCHANTMENT_SYSTEM.md
- **Туториал** → docs/systems/TUTORIAL_SYSTEM.md

### При работе с данными:
- **Материалы** → docs/data/MATERIALS_DATA.md
- **Рецепты** → docs/data/RECIPES_DATA.md
- **Техники** → docs/data/TECHNIQUES_DATA.md
- **Искатели** → docs/data/ADVENTURERS_DATA.md
- **События экспедиций** → docs/data/EXPEDITIONS_DATA.md

### При работе с формулами и расчётами:
- **Формулы игры** → docs/utils/FORMULAS.md

## Быстрые указатели по категориям

### Ключевые файлы проекта
- **src/store/game-store-composed.ts** — единый Zustand store (~1540 строк)
- **src/lib/craft/calculator.ts** — расчёт характеристик оружия
- **src/lib/expedition-calculator-v2.ts** — расчёт экспедиций с модификаторами
- **src/data/** — все статические данные игры

### Типы данных
- **src/types/** — все TypeScript интерфейсы и типы. ВСЕГДА проверяй типы перед изменением.

## Структура проекта
- **src/app/** — Next.js App Router (страницы, API маршруты)
- **src/components/** — React компоненты (screens/, systems/, ui/, shared/)
- **src/store/** — Zustand store (slices/, selectors/, game-store-composed.ts)
- **src/lib/** — утилиты и бизнес-логика
- **src/types/** — TypeScript типы
- **src/data/** — статические данные игры
- **src/hooks/** — React hooks

## Общие правила

1. **ВСЕГДА проверяй типы в src/types/** перед изменением незнакомых систем**
2. Store находится в src/store/game-store-composed.ts — читай его перед изменениями
3. При добавлении новых типов — обновляй docs/04_TYPES_SYSTEM.md
4. При изменении игровых систем — обновляй соответствующие docs/systems/*.md
5. Используй существующие константы из src/lib/store-utils/constants.ts
6. Формулы расчётов задокументированы в docs/utils/FORMULAS.md

## API для работы с store

```typescript
// Получение store
import { useGameStore } from '@/store'
const store = useGameStore()

// Основные методы
store.startCraftWithResources(recipe)
store.startExpeditionFull(expedition, adventurer, weapon)
store.completeOrder(orderId, weaponId, weapon)
store.addMaterialExpertise(materialId, amount)
```

## Важные архитектурные решения

1. **Composed Store** — Все слайсы объединены в одном файле game-store-composed.ts
2. **Slice Pattern** — Каждый слайс отвечает за свою доменную область
3. **Cross-Slice Actions** — Сложные операции затрагивающие несколько слайсов находятся в основном store
4. **Modifier System v2** — Система модификаторов экспедиций с 8 провайдерами
5. **Craft System v2** — Новая система крафта с детальным управлением материалами и этапами
6. **Cloud Saves** — Автосохранение в Turso/libSQL через src/app/api/save/route.ts

## Константы игры

- Цены ресурсов, максимальные уровни, пороги знаний задокументированы в src/lib/store-utils/constants.ts
- Формулы расчёта задокументированы в docs/utils/FORMULAS.md

## Сохранение и загрузка

- Автосохранение через Turso/libSQL
- Локальное сохранение через Zustand persist middleware (localStorage)
- API маршруты в src/app/api/save/route.ts

## Ключевые ограничения

1. НЕ ИЗМЕНЯЙ существующие типы без необходимости — всегда читай src/types/**
2. При изменении slice — проверяй влияние на другие слайсы
3. Константы должны браться из src/lib/store-utils/constants.ts, не хардкодить
4. Используй существующие утилиты из src/lib/store-utils/ вместо дублирования кода
