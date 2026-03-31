# Пакет автономной документации по зачарованиям

## Назначение

Этот пакет нужен для разработки системы зачарований вне текущего репозитория с последующей безопасной интеграцией обратно в SwordCraft.

Пакет специально собран как набор контрактов:

1. `domain contract` - что такое зачарования, какие у них сущности, правила и инварианты.
2. `state contract` - какие поля store и какие runtime-структуры система читает и изменяет.
3. `persistence contract` - как состояние зачарований проходит через local persist, cloud save и базу данных.
4. `integration contract` - в какие файлы и системные швы новая реализация должна вернуться при обратной интеграции.

## Как пользоваться пакетом

### Для отдельной разработки в другой среде

Читайте документы в таком порядке:

1. `01_CURRENT_IMPLEMENTATION_AUDIT.md`
2. `02_DOMAIN_CONTRACT.md`
3. `03_STATE_AND_VARIABLES.md`
4. `04_PERSISTENCE_CONTRACT.md`
5. `05_INTEGRATION_SEAMS.md`
6. `06_MERGE_PLAYBOOK.md`

### Для обратной интеграции в этот проект

Сначала проверьте:

- совпадает ли доменная модель с `src/data/enchantments.ts`;
- совпадает ли shape состояния с `src/store/game-store-composed.ts`;
- совпадает ли структура сохранений с `src/hooks/use-cloud-save.ts`, `src/app/api/save/route.ts` и `src/lib/db.ts`.

## Что входит в пакет

- `01_CURRENT_IMPLEMENTATION_AUDIT.md` - фактическое состояние системы и все найденные расхождения.
- `02_DOMAIN_CONTRACT.md` - каноническая доменная спецификация.
- `03_STATE_AND_VARIABLES.md` - все обязательные поля store, типы оружия и переменные интеграции.
- `04_PERSISTENCE_CONTRACT.md` - правила сохранения, загрузки, совместимости и versioning.
- `05_INTEGRATION_SEAMS.md` - список связанных систем, action boundaries и файлов интеграции.
- `06_MERGE_PLAYBOOK.md` - пошаговый сценарий возврата внешней реализации в проект.

## Канонические исходники кода

При споре между старой документацией и кодом в первую очередь ориентироваться на эти файлы:

- `src/data/enchantments.ts`
- `src/types/shared/enchantment.ts`
- `src/types/craft-v2.ts`
- `src/store/game-store-composed.ts`
- `src/store/slices/craft-slice.ts`
- `src/hooks/use-cloud-save.ts`
- `src/app/api/save/route.ts`
- `src/lib/db.ts`

## Важное ограничение

Текущая внутренняя документация проекта частично отстаёт от реального состояния кода. Поэтому этот пакет фиксирует:

- `current implementation` - что реально работает сейчас;
- `canonical contract` - на что должна опираться внешняя разработка;
- `merge requirements` - что нужно синхронизировать при возврате изменений.
