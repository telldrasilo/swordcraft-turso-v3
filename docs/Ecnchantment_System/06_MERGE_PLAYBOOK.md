# Merge playbook: как вернуть внешнюю разработку в SwordCraft

## Назначение

Этот документ описывает, как интегрировать отдельно разработанную систему зачарований обратно в текущий проект без поломки store, сохранений и UI.

## Принцип безопасной интеграции

Возвращать внешнюю реализацию нужно не "папкой целиком", а по четырём слоям:

1. `domain layer`
2. `state layer`
3. `persistence layer`
4. `ui layer`

Каждый слой должен быть совместим с текущими контрактами из этого пакета.

## Шаг 1. Сначала сравнить контракты, а не код

Перед merge нужно проверить:

- совпадает ли набор школ и shape `Enchantment`;
- совпадает ли shape `WeaponEnchantment`;
- совпадает ли вложенность `weaponInventory.weapons[].enchantments`;
- совпадает ли работа с `resources.gold` и `resources.soulEssence`;
- совпадает ли логика `unlockedEnchantments`.

Если contracts не совпадают, сначала пишется адаптер или migration plan, а уже потом идёт merge кода.

## Шаг 2. Влить доменную модель

Проверить и обновить:

- `src/data/enchantments.ts`
- `src/types/shared/enchantment.ts`
- `src/types/craft-v2.ts`

На этом шаге нужно:

- унифицировать школы;
- унифицировать effect types;
- убрать дублирующие определения, если они появились во внешнем модуле;
- выбрать один канонический лимит по количеству чар;
- выбрать одну каноническую формулу жертвоприношения;
- выбрать одну каноническую модель совместимости.

## Шаг 3. Влить store и action boundaries

Проверить и обновить:

- `src/store/slices/craft-slice.ts`
- `src/store/game-store-composed.ts`

На этом шаге нужно:

- определить, остаётся ли `unlockedEnchantments` в `CraftSlice` или выносится в отдельный рабочий slice;
- сохранить публичные action boundaries или добавить совместимый adapter;
- убедиться, что `unlockEnchantmentWithCost()` реально списывает ресурсы;
- убедиться, что `enchantWeapon()` работает с тем же shape оружия, который хранится в inventory;
- убедиться, что статистика обновляется синхронно.

## Шаг 4. Синхронизировать persistence

Проверить и обновить:

- `src/store/game-store-composed.ts` -> `partialize`, `merge`, `resetGame`
- `src/hooks/use-cloud-save.ts` -> `collectSaveData`, `applyLoadedData`
- `src/app/api/save/route.ts` -> `validateSaveData`, `formatSaveData`, SQL `INSERT`, SQL `UPDATE`
- `src/lib/db.ts` -> schema или migration strategy

Правило:

- если новый код меняет shape save-данных, все четыре точки должны быть обновлены в одном PR.

## Шаг 5. Решить вопрос с saveVersion

Повышать `saveVersion`, если:

- изменяется JSON shape чара на оружии;
- добавляются новые altar-поля;
- нужна миграция старых save.

Если `saveVersion` повышен, нужно:

1. описать default values;
2. описать migration path;
3. протестировать загрузку старого сохранения;
4. протестировать создание нового сохранения;
5. протестировать round-trip: save -> load -> save.

## Шаг 6. Влить UI без разрыва с action-слоем

Проверить и обновить:

- `src/components/screens/altar-screen.tsx`
- `src/components/altar/enchantment-shop-section.tsx`
- `src/components/altar/enchant-weapon-modal.tsx`
- `src/components/altar/sacrifice-section.tsx`
- `src/components/altar/enchanted-weapons-section.tsx`
- `src/components/ui/weapon-card.tsx`

Правила:

- UI не должен вызывать устаревшие action-и;
- UI не должен сам определять платную или бесплатную разблокировку только по визуальной проверке;
- UI и store должны опираться на один и тот же лимит;
- если новая логика использует `enchantSlots` и `enchantPower`, это должно быть видно и в UI, и в store.

## Шаг 7. Синхронизировать документацию

После возврата внешней разработки обязательно обновить:

- `docs/systems/ENCHANTMENT_SYSTEM.md`
- `docs/03_STATE_MANAGEMENT.md`
- `docs/04_TYPES_SYSTEM.md`
- пакет `docs/Ecnchantment_System/*`

Если доменная модель изменилась существенно, нужно обновить и соседние docs:

- `docs/utils/FORMULAS.md`
- связанные docs по крафту и экспедициям

## Что нужно проверить до merge

### Обязательный чек-лист

1. Нет ли второго конфликтующего источника `MAX_ENCHANTMENTS_PER_WEAPON`.
2. Нет ли двух формул `calculateSacrificeValue`.
3. Нет ли двух несовместимых моделей `areEnchantmentsCompatible`.
4. Реально ли списываются `gold` и `soulEssence` при разблокировке.
5. Сохраняются ли `unlockedEnchantments`.
6. Сохраняются ли наложенные чары внутри `weaponInventory`.
7. Не ломаются ли старые сохранения при загрузке.
8. Не расходятся ли UI-ограничения и store-ограничения.
9. Не потеряны ли статистики `weaponsSacrificed` и `enchantmentsApplied`.
10. Не появились ли новые поля без документации.

## Рекомендуемый порядок интеграции по PR

Если внешняя разработка большая, лучше вносить её не одним коммитом, а по этапам:

1. Унификация типов и статических данных.
2. Store и доменная логика.
3. Persistence и migration.
4. UI.
5. Обновление документации.

Так проще искать регрессии и тестировать совместимость.

## Минимальный smoke test после интеграции

1. Открыть altar.
2. Проверить отображение `soulEssence`.
3. Попробовать разблокировать чару при нехватке ресурсов.
4. Попробовать разблокировать чару при достаточных ресурсах.
5. Проверить списание `gold` и `soulEssence`.
6. Наложить чару на оружие.
7. Проверить, что в inventory у оружия появился `enchantments[]`.
8. Перезагрузить приложение и убедиться, что чарование сохранилось.
9. Проверить cloud save round-trip.
10. Попробовать жертвоприношение и проверить рост статистики.

## Особые риски текущего проекта

Перед интеграцией нужно помнить о текущих известных проблемах:

- docs и код частично расходятся;
- unlock flow в текущем проекте не доведён до полноценного списания ресурсов;
- лимит чар продублирован с разными значениями;
- формулы sacrifice и compatibility задублированы;
- `weapon-card` и expedition logic пока не используют чары как полноценные модификаторы.

Это означает:

- merge внешнего модуля должен не только добавить новую логику, но и убрать уже существующие расхождения.
