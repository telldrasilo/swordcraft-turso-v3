# State contract и реестр переменных интеграции

## Назначение

Этот документ фиксирует точные поля состояния, с которыми система зачарований уже связана в SwordCraft. Внешняя разработка должна опираться на эти имена и вложенность, чтобы обратная интеграция не требовала переписывания половины store.

## Главные точки входа в store

Основные файлы:

- `src/store/game-store-composed.ts`
- `src/store/slices/craft-slice.ts`

Фактический state contract сейчас проходит через:

- `CraftSlice`
- `AdditionalState`
- `CrossSliceActions`
- сущности оружия из `src/types/craft-v2.ts`

## Обязательные поля состояния

### Ресурсы

Источник: `src/types/resources.ts`

Обязательные поля:

- `resources.gold`
- `resources.soulEssence`

Зачем нужны:

- `gold` участвует в разблокировке чар;
- `soulEssence` является основной валютой altar-системы.

### Данные игрока

Источник: `src/types/player.ts`

Обязательные поля:

- `player.level`
- `player.fame`

Зачем нужны:

- определяют доступность чар по прогрессии.

### Статистика игрока

Источник: `src/types/player.ts`

Обязательные поля:

- `statistics.weaponsSacrificed`
- `statistics.enchantmentsApplied`

Зачем нужны:

- фиксируют активность altar-системы;
- должны синхронно обновляться в action-слое.

### Экран

Источник: `src/store/game-store-composed.ts`

Обязательное поле:

- `currentScreen`

Особое значение для системы:

- `currentScreen: 'altar'`

Это связывает систему зачарований с навигацией приложения.

## Обязательные runtime-поля оружия

Фактический контейнер:

- `weaponInventory.weapons[]`

Минимальные обязательные поля для altar-механики:

- `weaponInventory.weapons[].id`
- `weaponInventory.weapons[].quality`
- `weaponInventory.weapons[].tier`
- `weaponInventory.weapons[].warSoul`
- `weaponInventory.weapons[].epicMultiplier`
- `weaponInventory.weapons[].enchantments`

Вложенные runtime-записи чар:

- `weaponInventory.weapons[].enchantments[].id`
- `weaponInventory.weapons[].enchantments[].enchantmentId`
- `weaponInventory.weapons[].enchantments[].appliedAt`

## Обязательные store-поля системы зачарований

### Список разблокированных чар

Поле:

- `unlockedEnchantments[]`

Смысл:

- список id чар, которые игрок уже открыл;
- должен сохраняться и локально, и в cloud save.

### Cross-slice actions

Фактические action boundaries:

- `sacrificeWeaponForEssence(weaponId: string)`
- `unlockEnchantmentWithCost(enchantmentId: string)`
- `enchantWeapon(weaponId: string, enchantmentId: string)`
- `removeEnchantment(weaponId: string, enchantmentId: string)`
- `isEnchantmentUnlocked(enchantmentId: string)`

Важно:

- именно эти операции нужно считать публичной интеграционной поверхностью при возврате внешней реализации.

## Поля крафта v2, которые уже готовы к интеграции

Источник: `src/types/craft-v2.ts`

Поля:

- `CraftedWeaponV2.stats.enchantSlots`
- `CraftedWeaponV2.stats.enchantPower`

Текущее значение:

- поля уже рассчитываются калькуляторами материалов;
- но текущая altar-логика не использует их как основной гейт или модификатор.

Как относиться к ним во внешней разработке:

- сохранять совместимость;
- не ломать их shape;
- предусмотреть подключение этих полей в будущей версии логики зачарований.

## Полный минимальный реестр переменных

Ниже приведён список полей, которые обязательно должны присутствовать в документации внешнего модуля:

- `resources.gold`
- `resources.soulEssence`
- `player.level`
- `player.fame`
- `statistics.weaponsSacrificed`
- `statistics.enchantmentsApplied`
- `weaponInventory.weapons[]`
- `weaponInventory.weapons[].id`
- `weaponInventory.weapons[].quality`
- `weaponInventory.weapons[].tier`
- `weaponInventory.weapons[].warSoul`
- `weaponInventory.weapons[].epicMultiplier`
- `weaponInventory.weapons[].enchantments`
- `weaponInventory.weapons[].enchantments[].id`
- `weaponInventory.weapons[].enchantments[].enchantmentId`
- `weaponInventory.weapons[].enchantments[].appliedAt`
- `unlockedEnchantments[]`
- `CraftedWeaponV2.stats.enchantSlots`
- `CraftedWeaponV2.stats.enchantPower`
- `currentScreen`
- `saveVersion`

## Точки расширения, которые пока не входят в обязательный контракт

Эти поля и интеграции уже намечены, но не должны считаться обязательными рабочими зависимостями текущей версии:

- `preferredEnchantment` у искателей;
- влияние зачарований на expedition calculations;
- влияние зачарований на matching заказов;
- отображение эффектов чар в `weapon-card`;
- расширенная несовместимость через `incompatibleMap`.

## Рекомендации для внешней разработки

Если разработка идёт в другой среде:

1. Сохраните exact names этих полей без переименований.
2. Не переносите логику в новую shape-модель store без адаптера.
3. Если хотите добавить новые поля, делайте это только как расширение существующего контракта, а не как замену.
4. Если новая логика зависит от `enchantSlots` или `enchantPower`, опишите это как versioned change и заранее внесите в merge-playbook.
