# Система зачарований

## Обзор

Система зачарований связывает кузницу, инвентарь оружия, ресурсы и экран altar через `soulEssence`, `gold`, `unlockedEnchantments` и зачарования, вложенные в оружие.

Коротко о текущем состоянии:

- фактические боевые действия находятся в `src/store/game-store-composed.ts`;
- состояние `unlockedEnchantments` сейчас живёт в `src/store/slices/craft-slice.ts`;
- `src/store/slices/enchantments-slice.ts` существует, но не является главным рабочим контрактом текущей реализации;
- канонический автономный пакет документации лежит в `docs/Ecnchantment_System/`.

## Куда смотреть в первую очередь

### Канонический пакет для отдельной разработки

- `docs/Ecnchantment_System/README.md`
- `docs/Ecnchantment_System/01_CURRENT_IMPLEMENTATION_AUDIT.md`
- `docs/Ecnchantment_System/02_DOMAIN_CONTRACT.md`
- `docs/Ecnchantment_System/03_STATE_AND_VARIABLES.md`
- `docs/Ecnchantment_System/04_PERSISTENCE_CONTRACT.md`
- `docs/Ecnchantment_System/05_INTEGRATION_SEAMS.md`
- `docs/Ecnchantment_System/06_MERGE_PLAYBOOK.md`

### Основные файлы кода

- `src/data/enchantments.ts`
- `src/types/shared/enchantment.ts`
- `src/types/craft-v2.ts`
- `src/store/slices/craft-slice.ts`
- `src/store/game-store-composed.ts`
- `src/hooks/use-cloud-save.ts`
- `src/app/api/save/route.ts`

## Текущий рабочий контракт

### Данные системы

- каталог чар, школы и требования - `src/data/enchantments.ts`
- runtime-тип чара на оружии - `src/types/shared/enchantment.ts`
- поля оружия для будущей магической интеграции - `src/types/craft-v2.ts`

### State и actions

Текущие action boundaries:

- `unlockEnchantment()`
- `isEnchantmentUnlocked()`
- `unlockEnchantmentWithCost()`
- `sacrificeWeaponForEssence()`
- `enchantWeapon()`
- `removeEnchantment()`

### Persistence

Система уже завязана на:

- `weaponInventory`
- `unlockedEnchantments`
- `saveVersion`

через:

- Zustand persist
- `use-cloud-save.ts`
- `/api/save`
- Turso `game_saves`

## Текущие ограничения

Фактическая рабочая модель на сегодня:

- максимум `2` зачарования на оружии;
- две чары одной школы на одном оружии запрещены;
- разблокировка должна зависеть от `gold`, `soulEssence`, `player.level`, `player.fame`;
- жертвоприношение зависит от `quality`, `tier`, `warSoul`, `epicMultiplier`.

## Важное замечание

В проекте есть расхождения между кодом и частью старой документации. Для отдельной разработки и безопасной обратной интеграции ориентироваться нужно прежде всего на пакет `docs/Ecnchantment_System/`, а не на устаревшие описания slice-структуры.
