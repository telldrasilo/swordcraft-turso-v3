# 05. Спецификация событий, наград и материалов (vNext)

Документ задаёт **целевую** модель для переписанного модуля. Текущая реализация: события сохраняются в `ActiveExpedition.events`, но **не меняют исход** и **не выдают награды** (генератор — заглушка).

## Модель события (экземпляр)

База: `ExpeditionEvent` = шаблон + поля инстанса (`instanceId`, `triggeredAt`, `order`, опционально `shownAt`).

Рекомендуемые расширения vNext:

| Поле | Тип | Описание |
|------|-----|----------|
| `effects` | массив дискриминированных эффектов | Что произошло при срабатывании (награда, урон прочности, модификатор исхода). |
| `resolvedAt` | timestamp? | Когда эффекты применены к стору. |
| `rngSeed` | string? | Если нужна воспроизводимость при отладке. |

## Типы эффектов (предложение)

Каждый элемент `effects`:

1. **`grant_resource`** — `resource: ResourceKey`, `amount: number` (или диапазон + бросок).  
2. **`grant_material_expertise`** — `materialId: string`, `expertiseDelta: number` (хост: `addMaterialExpertise` в encyclopedia slice).  
3. **`grant_soul_essence`** — число в `soulEssence` при необходимости.  
4. **`modify_run`** — опционально: временный модификатор к финальному `successChance` / комиссии (если события должны влиять на исход).  
5. **`narrative_only`** — только текст/UI.

Разделение: **ресурсы гильдии** (`Resources` / `ResourceKey`) vs **энциклопедия материалов** (строковый `materialId`, экспертиза 0–100).

## RNG

- Текущий селектор событий и cross-slice используют `Math.random()` без сида.  
- vNext: опционально детерминированный сид на экспедицию (`startedAt` + `expeditionId` + счётчик) для воспроизводимых тестов.

## Единая операция применения

Ввести одну функцию уровня хоста, например `applyExpeditionEventEffects(activeExpeditionId, eventInstanceId, effects)`:

- Идемпотентность: не применять дважды, если `resolvedAt` уже установлен.  
- Транзакционность: либо все гранты прошли, либо откат (по политике хоста).  
- Логирование для UI журнала наград.

## Перечни идентификаторов

Полный список `ResourceKey` — `APPENDIX_RESOURCES_AND_HOST_ACTIONS.md`.  
Семантика материалов и экспертизы — `APPENDIX_MATERIALS_AND_EXPERTISE.md`.

## Связь с заглушкой

Файл `src/lib/expedition-reward-generator.ts` содержит задуманные константы (`REWARD_CHANCES`, `RARITY_CHANCES`, диапазоны gold/warSoul/glory/essence) и типы `EventReward`; при реализации vNext перенести баланс в данные или в отдельный конфиг, а генератор сделать чистой функцией от `ExpeditionEvent` + контекст.
