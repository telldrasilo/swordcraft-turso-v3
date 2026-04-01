# 01. Границы модуля и контракт с хостом

## In (переписывается в рамках vNext)

- Данные и тексты экспедиций (`ExpeditionTemplate` и связанные поля).  
- Данные событий по пути (шаблоны, условия, веса, тексты).  
- Логика отбора событий и (vNext) применение эффектов/наград событий к ресурсам и материалам.  
- Отображение экспедиций, активных миссий, журнала событий, завершения.  
- Согласование с калькулятором `calculateExpeditionResult` (модификаторы, исход, износ, комиссия).

## Out (не целевой контент модуля экспедиции)

- Генерация пула искателей, Extended/Legacy модели личности (как контент).  
- Экраны контрактов, заказов гильдии, квесты восстановления — **кроме** триггеров, которые уже вызывает текущий cross-slice (создание `RecoveryQuest`, удаление оружия).  
- Полная энциклопедия материалов и крафт-V2 (описаны только вызовы, нужные наградам).

## Frozen boundary: входы от искателя и оружия

Модуль экспедиции **обязан** принимать на старт и в расчёт:

- `Adventurer` (legacy UI-список): `id`, `name`, `traits`, `uniqueBonuses`, `requirements`, `skill`, прочие поля как в `Adventurer`.  
- `AdventurerExtended` (если есть): полная структура для `calculateExpeditionResult` — см. `APPENDIX_MODIFIER_INPUTS.md` и `APPENDIX_TYPES_AND_INTERFACES.md`.  
- `CraftedWeaponV2`: как минимум `id`, `fullName`, `stats.attack`, `currentDurability`, `type`, `qualityRank`, `epicMultiplier`, `combatMaterialId`, `quality` — те поля, что передаются в калькулятор v2.

Подбор «какого искателя показывать в списке» не меняется контентно; меняется только потребление этих типов в новой механике экспедиции.

## Публичный контракт стора (хост)

Имена и семантика **должны остаться стабильными** для UI и интеграций, пока хост не мигрирует осознанно:

| Метод | Сигнатура (концептуально) | Назначение |
|--------|---------------------------|------------|
| `startExpeditionFull` | `(expedition: ExpeditionTemplate, adventurer: Adventurer, weapon: CraftedWeaponV2, extendedAdventurer?: AdventurerExtended) => boolean` | Списание `gold` (supplies+deposit), проверки слотов/оружия, запись `ActiveExpedition` с событиями. |
| `completeExpeditionFull` | `(expeditionId: string) => ExpeditionResult \| null` | Расчёт исхода, начисления, история, квест восстановления при потере оружия. |

Зависимости, передаваемые в cross-slice через замыкание `get()` (см. исходник `guild-expedition-cross-slice.ts`):

- `guild`, `weaponInventory`, `player`, `statistics`  
- `canAfford`, `spendResource`, `addResource` (`ResourceKey`, число)  
- `addExperience`, `updateStatistics`  
- `removeWeapon`, `addWarSoulToWeapon`

Ошибка старта: `false` (слоты, золото, прочность оружия \<= 10, атака ниже `minWeaponAttack`). Ошибка завершения: `null` (нет активной экспедиции / шаблона / оружия).

## Примечание: поле `reputation` в результате

`ExpeditionResult` содержит `reputation`, вычисляемое через `calculateReputationGain('expedition', ...)`. В текущем `completeExpeditionFull` начисление репутации гильдии этим полем **может не выполняться** — при переносе модуля нужно явно связать с действием хоста (например `addGuildReputation`), либо удалить поле из контракта UI.
