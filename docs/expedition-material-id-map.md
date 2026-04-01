# Соответствие id материалов: модуль экспедиций → канон проекта

Канон данных: `MaterialNode` в `src/data/materials/library`, агрегатор `materialById`.

## Прямая замена в данных локаций (без нового узла)

| Было в модуле | Канон (`materialById`) | Примечание |
|----------------|-------------------------|------------|
| `oak_wood` | `oak` | |
| `birch_wood` | `birch` | |
| `pine_wood` | `pine` | Новый узел `pine` в library |
| `stone` | `fieldstone` | |
| `obsidian_shard` | `obsidian` | |
| `frost_iron` | `cold_iron` | Уже есть металл холодного железа |
| `blood_stone` | `bloodstone` | Узел «кровавик» в library |

Остальные id либо уже совпадали с проектом (`iron_ore`, `coal`, `flint`, …), либо добавлены как новые `MaterialNode` в `src/data/materials/library/expedition/nodes.ts`.

## Политика открытия в энциклопедии (фаза 1)

- **Старт с базовой экспертизой (10):** как в `initialEncyclopediaState` — только материалы, уже имеющие узел в library и относящиеся к ранней игре (`iron_ore`, `iron`, `birch`, `oak`, `raw_leather`, `tanned_leather`, `coal`).
- **Экспедиционные и редкие материалы:** по умолчанию **не** добавляются в `initialEncyclopediaState`; открытие через `discoverMaterial` / прирост экспертизы из экспедиции (фаза 3 логики). Исключения можно ввести позже для «учебных» ресурсов.

## Legacy

- `src/data/materials/organic.ts` (`Material` крафта рукоятей) не синхронизировался с этой фазой; новые игровые материалы заводятся как `MaterialNode`.
