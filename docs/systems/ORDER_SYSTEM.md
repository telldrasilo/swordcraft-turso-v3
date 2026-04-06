# Система заказов

## Обзор
Заказы NPC — это альтернативный источник дохода и прогресса, связанный с кузницей. Игрок создает оружие под требования клиента и получает золото, славу и дополнительные бонусы.

Главные файлы:
- `src/store/slices/orders-slice.ts`
- `src/store/cross-slice/order-cross-slice.ts`
- `src/lib/store-utils/order-achievable-utils.ts`
- `src/lib/store-utils/order-utils.ts`
- `src/lib/guild-weapon-service-eligibility.ts` (общие правила с экспедициями)
- `src/types/game.ts`

## Структура заказа
Заказ содержит:
- клиента
- тип оружия
- иногда материал
- минимальное качество
- иногда минимальную атаку
- денежную награду
- награду славой
- бонусные предметы
- дедлайн
- требования по уровню и fame

## Статусы заказов
- `available`
- `in_progress`
- `completed`
- `expired`

## Проверка соответствия оружия
Логика в `orders-slice.ts` проверяет:
- качество
- атаку
- тип оружия
- материал

Используется новая система `hiddenTags`, а при ее отсутствии — fallback на старую проверку.

Перед этим `order-cross-slice` отклоняет сдачу, если оружие не проходит **`getWeaponGuildServiceBlockReason`** (то же, что для старта экспедиции в `validateExpeditionStart`, `src/lib/expedition-start-validation.ts`): доля текущей прочности к `maxDurability` не ниже `GUILD_WEAPON_MIN_DURABILITY_RATIO` (`src/lib/store-utils/constants.ts`), нет активных видимых тегов повреждений, `repairCondition` не `needsProperRepair` / `temporaryPatch`. В заказах: тост **«Оружие не принимают»**, `description` — строка из `getWeaponGuildServiceBlockReason` (низкая прочность / видимые повреждения / нужна полноценная починка / временная заплатка; все с отсылкой к вкладке **«Ремонт»** кузницы). **Исключений по типу заказа** (например принять `temporaryPatch`) в коде нет — потребуется отдельное ТЗ и флаги заказа, если геймдизайн это введёт.

## Генерация достижимых заказов
Заказы генерируются так, чтобы быть реалистично выполнимыми для текущего состояния игрока. Это вынесено в `order-achievable-utils.ts`.

Учитываются:
- доступные рецепты
- доступные материалы
- прогресс игрока
- уровень и fame

Стоимость материалов в условном золоте (поле `materialCost` заказа, расчёт аванса `materialAdvance` и вход в `calculateGoldReward` из рецепта) сводится к одному пути: `getCraftingCost(recipe, {})` и [`craftingResourceCostMapToGoldApprox`](../../src/lib/store-utils/order-material-cost-gold.ts), чтобы цены не расходились между генерацией, наградой и UI аванса.

## Экономика заказов
Заказы важны как:
- источник золота
- источник fame
- способ монетизировать сильное оружие
- мягкий гайд по развитию кузницы

## Связи с другими системами
- кузница создает оружие под заказ
- ресурсы обеспечивают материалы
- игрок получает fame и золото
- гильдия конкурирует за внимание игрока как альтернативный способ заработать

## Что смотреть при изменениях
- `src/store/slices/orders-slice.ts`
- `src/lib/store-utils/order-achievable-utils.ts`
- `src/lib/store-utils/order-utils.ts`
- `src/types/game.ts`
- `src/types/craft-v2.ts`
