# Persistence contract системы зачарований

## Назначение

Этот документ фиксирует, как состояние зачарований проходит через все уровни сохранения в SwordCraft. Внешняя разработка должна учитывать весь путь данных, а не только store.

## Три уровня persistence

Система зачарований зависит сразу от трёх уровней:

1. Zustand persist в браузере.
2. Cloud save через `use-cloud-save.ts`.
3. База данных Turso через `/api/save` и `src/lib/db.ts`.

Если изменить только один из уровней, система станет несовместимой со старыми сохранениями или потеряет данные.

## Локальное сохранение через Zustand persist

Источник: `src/store/game-store-composed.ts`

В `partialize` уже сохраняются:

- `weaponInventory`
- `unlockedEnchantments`
- `currentScreen`
- сопутствующие игровые данные

Следствие:

- любое расширение altar-state должно либо жить внутри уже сохраняемых объектов, либо быть явно добавлено в `partialize`.

## Cloud save: сбор данных

Источник: `src/hooks/use-cloud-save.ts`

`collectSaveData()` уже отправляет:

- `weaponInventory`
- `unlockedEnchantments`
- `saveVersion`

Следствие:

- внешний модуль не может менять shape этих полей без синхронного обновления save pipeline.

## Cloud save: применение загруженных данных

Источник: `src/hooks/use-cloud-save.ts`

`applyLoadedData()` уже восстанавливает:

- `weaponInventory`
- `unlockedEnchantments`

Следствие:

- если новые поля зачарований будут храниться отдельно, их надо добавить и в apply path;
- если новые поля будут вложены в weapon-сущности, нужно обеспечить backward compatibility для старых сохранений.

## API-контракт `/api/save`

Источник: `src/app/api/save/route.ts`

На серверном уровне участвуют:

- `validateSaveData()`
- `formatSaveData()`
- SQL `INSERT`
- SQL `UPDATE`

Сейчас уже сохраняются:

- `weaponInventory`
- `unlockedEnchantments`
- `saveVersion`

Следствие:

- любые новые altar-поля должны быть отражены во всех четырёх местах;
- нельзя ограничиться изменением только клиента или только SQL.

## DB shape

Источник: `src/lib/db.ts`

Текущие relevant columns:

- `weaponInventory TEXT`
- `unlockedEnchantments TEXT`

Это значит:

- наложенные чары фактически едут в базе как часть JSON оружия;
- отдельно хранится только список разблокированных чар.

## Канонический persistence contract

Для автономной разработки считать обязательным следующий контракт:

### 1. Разблокированные чары

Хранятся как:

- `unlockedEnchantments: string[]`

Должны проходить через:

- Zustand persist
- `collectSaveData()`
- `applyLoadedData()`
- `validateSaveData()`
- `formatSaveData()`
- DB field `unlockedEnchantments`

### 2. Наложенные чары на оружии

Хранятся как часть:

- `weaponInventory.weapons[].enchantments`

Должны проходить через:

- Zustand persist
- `collectSaveData()`
- `applyLoadedData()`
- `validateSaveData()`
- `formatSaveData()`
- DB field `weaponInventory`

### 3. Версия сохранения

Контрольное поле:

- `saveVersion`

Назначение:

- отделять старые save-шаблоны от новых;
- задавать момент для миграций и адаптеров при загрузке.

## Когда нужно повышать saveVersion

Нужно повышать `saveVersion`, если меняется хотя бы одно из условий:

1. Меняется shape `weaponInventory.weapons[].enchantments`.
2. Появляются новые отдельные altar-поля верхнего уровня.
3. Появляется новая обязательная вложенность у чара или оружия.
4. Нужен адаптер для старых сохранений.

Не обязательно повышать `saveVersion`, если:

- меняется только текст описания чар;
- меняется UI layout;
- меняются формулы без изменения save-shape.

## Правила совместимости старых сохранений

При внешней разработке нужно заранее предусмотреть backward compatibility:

1. Старые сохранения могут не содержать новых полей зачарований.
2. Старые записи оружия могут иметь пустой или отсутствующий массив `enchantments`.
3. Старые сохранения могут иметь старое значение `saveVersion`.

Минимальная стратегия загрузки:

- всегда задавать безопасные значения по умолчанию;
- не падать, если `enchantments` отсутствует;
- мигрировать старые записи в память до установки state;
- документировать каждое новое поле и его default.

## Что внешняя разработка должна держать синхронно

При возврате в проект нужно синхронно проверять:

- `src/store/game-store-composed.ts`
- `src/hooks/use-cloud-save.ts`
- `src/app/api/save/route.ts`
- `src/lib/db.ts`

Если хотя бы один файл не обновлён, persistence contract считается нарушенным.
