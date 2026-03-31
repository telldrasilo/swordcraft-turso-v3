# Backup: Неиспользуемые файлы в корневой директории

Этот файл был перемещ сюда, так как содержит импорт из несуществующего модуля типов.

## Исходный файл: `data/knowledge-discoveries.ts`
**Причина:** Импортирует из `../types/expedition-loot.types`, но этот путь не существует. Файл существует только в `docs/Random_gen/types/expedition-loot.types.ts`

## Что использовать вместо
Функциональность из этого файла дублируется в `docs/Random_gen/data/knowledge-discoveries.ts`

## Как восстановить
1. Скопиру файл обратно в `data/knowledge-discoveries.ts`
2. Обновить импорт на `../types/expedition-loot.types` (если используется)
   - Если тип definitions are needed: create `src/types/expedition-loot.types.ts` и скопировать из `docs/Random_gen/types/expedition-loot.types.ts`
   - Если `docs/Random_gen/types/expedition-loot.types.ts` is used, копировать the contents и2. Удалить неиспользуемые импорты строк:
3. Обновить все импорты в файле указывающие на актуальную расположение файлов

## Восстановление
```bash
# Переместить файл обратно
mv data/knowledge-discoveries.ts src/backup/unused-root-files/

# Если нужно восстановить:
1. Откомментировать импорт: `// LootRarity больше не нужен
2. Обновить путь к `docs/Random_gen/types/expedition-loot.types.ts` (если используется)
2. Скопировать весь файл в `src/data/knowledge-discoveries.ts` (если нужна)
3. Создать файл `src/types/expedition-loot.types.ts` с реэкспортами типов из `docs/Random_gen/types/expedition-loot.types.ts`
```
