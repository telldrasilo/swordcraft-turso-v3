# 03. Слой данных (контент)

## Правило

- **Контент** (тексты, числа наград в шаблоне, атрибуты событий) лежит в `src/data/*`.  
- **Логика** (отбор событий, расчёт боя/награды, применение к стору) — в `src/lib/*` и cross-slice.  
- Изменение баланса шаблонов не требует правки калькулятора, если поля `ExpeditionTemplate` остаются тем же контрактом.

## Шаблоны экспедиций

- Файл: `src/data/expedition-templates.ts`  
- Экспорт: `expeditionTemplates`, типы `ExpeditionTemplate`, `ExpeditionType`, `ExpeditionDifficulty`, `ExpeditionReward`, `ExpeditionCost`, константа `difficultyInfo` (пороги сложности для калькулятора v2).

Полезные поля шаблона:

- Идентификация и UI: `id`, `name`, `description`, `icon`, `type`, `difficulty`, `duration` (секунды).  
- Экономика старта: `cost.supplies`, `cost.deposit` (списываются золотом при старте).  
- Награда (база для формул): `reward.baseGold`, `reward.baseWarSoul`; опционально `bonusResources`, `bonusEssence` (в cross-slice полного разбора под завершение может не быть — зависит от хоста).  
- Ограничения: `minGuildLevel`, `minWeaponAttack`, `recommendedWeaponTypes`.  
- Теги для событий: `tags?: ExpeditionTags` (`src/types/expedition-tags.ts`) — локации, враги, погода, темы и т.д.

У шаблона в файле данных также встречаются `failureChance` / `weaponLossChance` на верхнем уровне; **калькулятор v2** для базового провала и потери оружия опирается на **`difficultyInfo[difficulty]`**, а не на эти поля напрямую — при правках баланса сверяйте оба источника.

## События экспедиций

- Реестр шаблонов событий: `src/data/expedition-events/*` (агрегируется в `ALL_EXPEDITION_EVENTS` через `src/data/expedition-events.ts`).  
- Типы: `src/types/expedition-events.ts` — `ExpeditionEventTemplate`, `ExpeditionEvent`, `EventReward`, конфиг генерации `DEFAULT_EVENT_CONFIG`.

Категории файлов по смыслу (как в дереве проекта): `core`, `locations`, `enemies`, `social`, `discovery` — разделение для авторов, для рантайма важен объединённый пул и условия `conditions`.

## Селектор событий

- Файл: `src/lib/expedition-event-selector.ts`  
- На старте экспедиции: `selectEventsForExpedition(expedition, startedAt)` возвращает график событий с метками времени `triggeredAt` и порядком `order`.  
- Фильтрация: тип экспедиции, сложность, теги шаблона (`tags.locations`, `enemies`, `weather`, `special`, `themes`), длительность (`minDuration` / `maxDuration`).  
- Количество событий: из `DEFAULT_EVENT_CONFIG` (`baseCount`, `eventPerSeconds`, `minCount`, `maxCount`).

## Карта зависимостей данных (кратко)

```
expedition-templates.ts
       │                    expedition-events/*.ts
       ▼                              ▼
selectEventsForExpedition ─── ALL_EXPEDITION_EVENTS
       │
       ▼
ActiveExpedition.events
```

Калькулятор v2 читает шаблон и `difficultyInfo`, но **не** читает список событий для исхода боя в текущей реализации.
