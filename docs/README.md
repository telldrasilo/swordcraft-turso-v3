# Документация SwordCraft

## Навигация по документации

Этот файл является точкой входа во всю документацию проекта SwordCraft.

## Карта систем проекта

```mermaid
mindmap
  root((SwordCraft))
    Архитектура
      Технологии
      Паттерны проектирования
      Потоки данных
      API маршруты
    State Management
      Zustand Composed Store
      Слайсы (slices)
      Actions и Selectors
      Персистентность
    Типы данных
      Интерфейсы сущностей
      Enum'ы
      Константы
    Игровые системы
      Кузница (Крафт)
      Гильдия (Экспедиции)
      Ресурсы и рабочие
      Заказы NPC
      Зачарования
      Туториал
    Утилиты и формулы
      Расчёты
      Генераторы
      Формулы игры
    Данные игры
      Материалы
      Рецепты
      Техники
      Искатели
      События экспедиций
```

## Как пользоваться документацией

### Для AI агентов
1. Начните с чтения [AGENTS.md](../AGENTS.md) - главный навигационный файл
2. При работе с конкретной системой - читайте соответствующий файл ниже
3. Всегда проверяйте типы в [docs/04_TYPES_SYSTEM.md](04_TYPES_SYSTEM.md) перед изменениями
4. При необходимости - читайте архитектуру и потоки данных в [docs/01_ARCHITECTURE.md](01_ARCHITECTURE.md)

### Для разработчиков
1. Начните с [docs/01_ARCHITECTURE.md](01_ARCHITECTURE.md) - обзор технологий и архитектуры
2. Изучите структуру проекта в [docs/02_PROJECT_STRUCTURE.md](02_PROJECT_STRUCTURE.md)
3. Для работы с state - читайте [docs/03_STATE_MANAGEMENT.md](03_STATE_MANAGEMENT.md)
4. Для работы с типами - смотрите [docs/04_TYPES_SYSTEM.md](04_TYPES_SYSTEM.md)
5. Тесты и команды проверки — раздел **«Тесты и проверка качества»** в [AGENTS.md](../AGENTS.md); скрипты также перечислены в корневом [README.md](../README.md)

## Файлы документации

### Навигация и архитектура
| Файл | Описание |
|---------|---------|
| [AGENTS.md](../AGENTS.md) | Главный файл для AI агентов |
| [docs/01_ARCHITECTURE.md](01_ARCHITECTURE.md) | Технологии, паттерны, потоки данных |
| [docs/02_PROJECT_STRUCTURE.md](02_PROJECT_STRUCTURE.md) | Структура файлов и папок проекта |

### Техническая документация
| Файл | Описание |
|---------|---------|
| [docs/03_STATE_MANAGEMENT.md](03_STATE_MANAGEMENT.md) | Zustand store, слайсы, actions, selectors |
| [docs/04_TYPES_SYSTEM.md](04_TYPES_SYSTEM.md) | Все интерфейсы, enum'ы, константы |
| [docs/PROJECT_AUDIT.md](PROJECT_AUDIT.md) | Актуальные риски и техдолг (живой аудит); журнал закрытых пунктов и **P1** |
| [docs/P2_ARCHITECTURE_INVENTORY.md](P2_ARCHITECTURE_INVENTORY.md) | **P2:** инвентаризация (крафт v1/v2, store, корень репо, examples) и бэклог задач |

### Игровые системы
| Файл | Описание |
|---------|---------|
| [docs/systems/FORGE_SYSTEM.md](systems/FORGE_SYSTEM.md) | Крафт оружия, качество, War Soul |
| [docs/systems/GUILD_SYSTEM.md](systems/GUILD_SYSTEM.md) | Гильдия, искатели, экспедиции, модификаторы |
| [docs/systems/RESOURCE_SYSTEM.md](systems/RESOURCE_SYSTEM.md) | Добыча, шахты, рабочие, здания |
| [docs/systems/ORDER_SYSTEM.md](systems/ORDER_SYSTEM.md) | Заказы NPC, требования, скрытые теги |
| [docs/systems/ENCHANTMENT_SYSTEM.md](systems/ENCHANTMENT_SYSTEM.md) | Школы магии, уровни, жертвоприношение |
| [docs/Ecnchantment_System/README.md](Ecnchantment_System/README.md) | Автономный пакет документации для отдельной разработки и обратной интеграции |

### Утилиты и расчёты
| Файл | Описание |
|---------|---------|
| [docs/utils/CRAFT_CALCULATOR.md](utils/CRAFT_CALCULATOR.md) | Расчёт оружия, формулы |
| [docs/utils/EXPEDITION_CALCULATOR.md](utils/EXPEDITION_CALCULATOR.md) | Расчёт экспедиций, модификаторы |
| [docs/utils/GENERATORS.md](utils/GENERATORS.md) | Генерация искателей, заказов |
| [docs/utils/FORMULAS.md](utils/FORMULAS.md) | Все формулы игры |

### Данные игры
| Файл | Описание |
|---------|---------|
| [docs/data/MATERIALS_DATA.md](data/MATERIALS_DATA.md) | Система материалов, бонусы |
| [docs/data/RECIPES_DATA.md](data/RECIPES_DATA.md) | Рецепты оружия и плавки |
| [docs/data/TECHNIQUES_DATA.md](data/TECHNIQUES_DATA.md) | Техники крафта |
| [docs/data/ADVENTURERS_DATA.md](data/ADVENTURERS_DATA.md) | Теги, редкость, генерация |
| [docs/data/EXPEDITIONS_DATA.md](data/EXPEDITIONS_DATA.md) | События экспедиций |

## Ключевые файлы проекта

### State Management
- [src/store/game-store-composed.ts](../src/store/game-store-composed.ts) — единый Zustand store (~1400 строк; cross-slice, напр. ремонт, в [src/store/cross-slice/](../src/store/cross-slice/))
- Все основные домены сходятся в `game-store-composed.ts`; для зачарований рабочий контракт сейчас проходит через `craft-slice` и cross-slice actions, см. `docs/Ecnchantment_System/`

### Типы данных
- [src/types/index.ts](../src/types/index.ts) - Центральный экспорт типов
- Все доменные типы определены в src/types/

### Утилиты бизнес-логики
- [src/lib/craft/calculator.ts](../src/lib/craft/calculator.ts) - Расчёт характеристик оружия
- [src/lib/expedition-calculator-v2.ts](../src/lib/expedition-calculator-v2.ts) - Расчёт экспедиций
- [src/lib/modifier-system/](../src/lib/modifier-system/) - Система модификаторов v2
- [src/lib/adventurer-generator-extended.ts](../src/lib/adventurer-generator-extended.ts) - Генерация искателей

### Сохранения (локально и облако)
- [src/lib/cloud-save-feature.ts](../src/lib/cloud-save-feature.ts) — фича-флаг `NEXT_PUBLIC_CLOUD_SAVE_ENABLED` и чеклист расширения схемы
- [src/hooks/use-cloud-save.ts](../src/hooks/use-cloud-save.ts) — бэкап + опциональная синхронизация с `/api/save`

### Статические данные
- [src/data/](../src/data/) - Все игровые данные (материалы, рецепты, искатели...)
