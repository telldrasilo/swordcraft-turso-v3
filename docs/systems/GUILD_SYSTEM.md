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

## Связи с другими системами
- `FORGE_SYSTEM.md` - оружие для экспедиций
- `RESOURCE_SYSTEM.md` - комиссия и расходы списываются из ресурсов
- `ORDER_SYSTEM.md` - игрок балансирует доход между заказами и миссиями
- `ENCHANTMENT_SYSTEM.md` - зачарованное оружие влияет на результат экспедиций

## Что смотреть при изменениях
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