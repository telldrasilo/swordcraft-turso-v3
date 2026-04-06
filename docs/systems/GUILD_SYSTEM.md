# Система гильдии

## Обзор
Гильдия объединяет системы искателей приключений, экспедиций, контрактов, истории миссий и квестов восстановления.

Главные файлы:
- `src/store/slices/guild-slice.ts`
- `src/lib/adventurer-generator-extended.ts`
- `src/lib/expedition-calculator-v2.ts`
- `src/lib/contract-manager.ts`
- `src/lib/store-utils/expedition-utils.ts`
- `src/types/guild.ts`
- `src/types/adventurer-extended.ts`
- `src/types/contract.ts`
- `src/data/expedition-templates.ts`
- `src/data/expedition-events/`

## Искатели приключений
Актуальная модель искателя - `AdventurerExtended`.

Она разделена на блоки:
- `identity`
- `combat`
- `personality`
- `traits`
- `uniqueBonuses`
- `strengths`
- `weaknesses`
- `requirements`

Это позволяет отдельно моделировать:
- боевые параметры
- характер
- требования к оружию
- сильные и слабые стороны
- источники модификаторов

## Генерация искателей
Генерация выполняется в `src/lib/adventurer-generator-extended.ts`.

Во время генерации подбираются:
- редкость
- уровень
- имя и идентичность
- стиль боя
- personality traits
- мотивации
- social tags
- strengths и weaknesses
- требования к оружию

Система опирается на данные из:
- `src/data/adventurer-rarity.ts`
- `src/data/adventurer-traits.ts`
- `src/data/adventurer-tags/`
- `src/data/adventurer-names.ts`
- `src/data/unique-bonuses.ts`

## Экспедиции
Экспедиция - это связка:
- шаблон миссии
- искатель
- оружие
- набор модификаторов из нескольких подсистем

**Экономика старта (канон):** отправка миссии **не** списывает золото кузнеца с `resources.gold`. Поля `cost.supplies` / `cost.deposit` в данных описывают контракт заказчика (лор); в UI они сопровождаются пояснением, что это не личный взнос. Подробно: `docs/systems/EXPEDITION_AND_ADVENTURER_AUDIT.md` (раздел «Экономика»), формулы v2 — `docs/utils/FORMULAS.md` («Экспедиции (v2)»).

Ключевые сущности:
- `ExpeditionTemplate`
- `ActiveExpedition`
- `ExpeditionResult`
- `ExpeditionHistory`

## Калькулятор экспедиций v2
Главный расчет расположен в `src/lib/expedition-calculator-v2.ts`.

Он считает:
- `successChance`
- `commission`
- `warSoul`
- `weaponWear`
- `weaponLossChance`
- `critChance`

## Система модификаторов
Модификаторная логика вынесена в `src/lib/modifier-system/`.

Провайдеры:
- `combat-stats-provider.ts`
- `combat-style-provider.ts`
- `level-rarity-provider.ts`
- `motivations-provider.ts`
- `personality-traits-provider.ts`
- `data-traits-unique-bonuses-provider.ts` — черты из `adventurer-traits` (`adventurer.traits`) и каталог `unique-bonuses`
- `social-tags-provider.ts`
- `strengths-weaknesses-provider.ts`
- `weapon-quality-provider.ts`

## Контракты
Контрактная система описана в `src/types/contract.ts` и обслуживается `src/lib/contract-manager.ts`.

Тиры контрактов:
- `bronze`
- `silver`
- `gold`
- `platinum`

Контракт может давать:
- снижение комиссии
- снижение шанса отказа
- приоритетный доступ
- прямое назначение миссий
- бонус к лояльности
- доступ к эксклюзивным миссиям

## Квесты восстановления
Если оружие потеряно, система может создать `RecoveryQuest`, связанный с искателем и потерянным предметом.

## Интендант гильдии
Вкладка в `GuildScreen` (`src/components/guild/intendant-section.tsx`): покупка **рецептов оружия и переработки**, **спец-техник ремонта** и **спец-техник перековки** за **репутацию текущего ранга** (`guild.reputation`), не золото игрока.

- Каталог и цены: `src/data/guild/intendant-catalog.ts` (рецепты из бывшего золотого магазина кузницы; техники ремонта/перековки — отдельные формулы баланса в том же файле).
- Покупка: `purchaseIntendantOffer` в `src/store/game-store-composed.ts`.
- Персист: `unlockedRepairTechniqueIds`, `unlockedReforgeTechniqueIds` (облако — колонки в Turso / `api/save`, см. `STORE_VERSION` в store).

**Перековка:** базовые техники в `REFORGE_TECHNIQUES` с `reforgeTier: 'basic'` доступны без интенданта; **specialized** — покупка у интенданта **или** прежняя разблокировка через технику обработки в кузне (`isReforgeTechniqueUnlocked` в `src/lib/reforge/apply.ts`).

## Репутация ранга
Ступени прогресса внутри ранга гильдии: `src/lib/guild-reputation-tier.ts` — `addReputation` с верхней границей по рангу, `guildRankUp`, `spendGuildReputation`.

## Экспедиции: подвкладки
В `src/components/guild/expeditions-section.tsx` — сегмент **«Доступные экспедиции»** / **«Особые задания»**; во втором — квест «Эхо забытой кузни» (`ForgottenForgeQuestCard`) и связка с выбором миссий на первой подвкладке.

## Связи с другими системами
- `FORGE_SYSTEM.md` - оружие для экспедиций
- `RESOURCE_SYSTEM.md` - комиссия и расходы списываются из ресурсов
- `ORDER_SYSTEM.md` - игрок балансирует доход между заказами и миссиями
- `ENCHANTMENT_SYSTEM.md` - зачарованное оружие влияет на результат экспедиций

## Что смотреть при изменениях
- `src/components/guild/intendant-section.tsx`, `src/data/guild/intendant-catalog.ts`
- `src/store/slices/guild-slice.ts`
- `src/types/guild.ts`
- `src/types/adventurer-extended.ts`
- `src/types/contract.ts`
- `src/lib/adventurer-generator-extended.ts`
- `src/lib/expedition-calculator-v2.ts`
- `src/lib/modifier-system/`
- `src/lib/contract-manager.ts`
- `src/lib/store-utils/expedition-utils.ts`
- `src/data/expedition-templates.ts`
- `src/data/expedition-events/`