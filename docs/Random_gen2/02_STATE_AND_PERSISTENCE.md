# 02. Состояние и сохранения

## Срез `guild` в хосте

В `GameStore` поле `guild` имеет тип **`GuildState`** (`src/types/guild.ts`), не расширенный slice-вариант с контрактами. Сохраняется целиком в persist и в облако как JSON.

### Ключевые поля для экспедиций

| Поле | Тип | Назначение |
|------|-----|------------|
| `level` | number | Уровень гильдии (лимит активных экспедиций, множители в формулах). |
| `reputation`, `totalReputation`, `glory`, `totalGlory` | number | Прогресс гильдии; при завершении экспедиции к `glory` добавляется расчётное значение. |
| `activeExpeditions` | `ActiveExpedition[]` | Текущие миссии. |
| `recoveryQuests` | `RecoveryQuest[]` | Квесты при потере оружия. |
| `history` | `ExpeditionHistoryEntry[]` | Журнал завершённых. |
| `stats` | `GuildStats` | Агрегированная статистика. |
| `adventurers`, `adventurerRefreshAt`, `knownAdventurers`, … | — | Вне логики исхода экспедиции, но в том же JSON. |

Структуры полей см. `APPENDIX_TYPES_AND_INTERFACES.md`.

## Persist (localStorage)

- Имя стора: `swordcraft-store-v2`, версия `1`.  
- `partialize` включает `guild: state.guild` без подрезки полей экспедиции.  
- `merge` при загрузке: `merged.guild = { ...currentState.guild, ...(persisted.guild ?? {}) }` — сохранённые активные экспедиции перекрывают дефолты.

## Облако (Turso / API save)

В `src/app/api/save/route.ts` поле `guild` сериализуется как `JSON.stringify(validatedData.guild)` в колонку БД и обратно `safeJsonParse`. Схема на уровне приложения — тот же объект, что в Zustand.

Рекомендуемая **версия модуля экспедиций** для миграций (vNext): завести опциональное поле верхнего уровня в `guild`, например `expeditionModuleVersion: number`, или в каждом `ActiveExpedition` — `schemaVersion`; при загрузке старых сейвов мигрировать формат `events` и наград.

## Пример фрагмента JSON (guild)

Нормализованный пример для тестов миграций:

```json
{
  "level": 3,
  "reputation": 1200,
  "totalReputation": 5000,
  "glory": 40,
  "totalGlory": 100,
  "activeExpeditions": [
    {
      "id": "exp_active_1",
      "expeditionId": "forest_hunt_easy",
      "expeditionName": "Лесная охота",
      "expeditionIcon": "🌲",
      "adventurerId": "adv_1",
      "adventurerName": "Рольф Кремневой",
      "weaponId": "wpn_abc",
      "weaponName": "Железный длинный меч",
      "weaponData": {},
      "startedAt": 1710000000000,
      "endsAt": 1710001800000,
      "deposit": 50,
      "suppliesCost": 20,
      "events": []
    }
  ],
  "recoveryQuests": [],
  "history": [],
  "stats": {
    "totalExpeditions": 0,
    "successfulExpeditions": 0,
    "failedExpeditions": 0,
    "weaponsLost": 0,
    "weaponsRecovered": 0,
    "totalCommission": 0,
    "totalWarSoul": 0,
    "totalGlory": 0
  },
  "adventurers": [],
  "adventurerRefreshAt": 0,
  "knownAdventurers": [],
  "maxKnownAdventurers": 10
}
```

`weaponData` в реальном сейве — полный объект `CraftedWeaponV2`; здесь сокращён. Массив `events` — см. тип `ExpeditionEvent` в приложении типов.
