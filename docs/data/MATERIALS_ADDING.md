# Добавление и согласование материалов

Канон игровых материалов для энциклопедии и крафта v2 — **`MaterialNode`** в [`src/types/materials/material-core.ts`](../../src/types/materials/material-core.ts), данные в [`src/data/materials/library/`](../../src/data/materials/library/).

Обзор данных: [`MATERIALS_DATA.md`](MATERIALS_DATA.md). Маппинг id экспедиций: [`docs/expedition-material-id-map.md`](../expedition-material-id-map.md).

## Эталоны по `identity.class` (ручные файлы)

| Класс / роль | Файл-эталон |
|--------------|-------------|
| Металл (слиток) | `library/metals/iron.ts` |
| Минерал, камень | `library/stones/flint.ts`, `obsidian.ts` |
| Древесина | `library/woods/oak.ts`, `ironwood.ts` |
| Кожа | `library/leathers/tanned_leather.ts` |
| Руда (`mineral` + тег `ore`) | `library/ores/iron_ore.ts` |
| Органика / травы | опорные узлы в `library/world-resources/items/*.ts` (`buildWorldNode`, роль `organic`) |

## Чеклист секций `MaterialNode`

1. `identity` — `id`, `name`, `class`, `origin`, `tags`
2. `physical`, `chemical`, `arcane`, `processing`
3. `economy` — `rarity`, `tier`, `baseValue`, `availability`, `discoverability`
4. `summary` — `basic`, `applied`, `strengths`, `weaknesses`, `bestFor`
5. `discovery` — `unlockedBy`
6. `description`, `icon`, `version`
7. опционально `recipe`

Числа нового материала сверяйте с **2–3 соседями** того же `economy.tier` и близкой роли.

## Пакет экспедиции (много однотипных ресурсов)

Каталог добычи в мире: новый файл в [`library/world-resources/items/`](../../src/data/materials/library/world-resources/items), экспорт в [`world-resources/index.ts`](../../src/data/materials/library/world-resources/index.ts) через `buildWorldNode` из [`build-world-node.ts`](../../src/data/materials/library/world-resources/build-world-node.ts) (без тега `expedition`). Массовое добавление: правка эталона [`expedition/nodes.ts`](../../src/data/materials/library/expedition/nodes.ts) (только для скрипта) → `node scripts/gen-world-resource-nodes-from-expedition.mjs` → `node scripts/split-world-resource-nodes.mjs`. Legacy-фабрика [`expedition/factory.ts`](../../src/data/materials/library/expedition/factory.ts) не обязательна для новых id.

## Коллекции

- Категориальные списки: [`src/data/materials/collections/`](../../src/data/materials/collections/) (фильтры по `allMaterials`).
- Новый материал попадает в нужные коллекции автоматически, если совпадают `class` и теги (`ore`, `gem` и т.д.).

## Политика энциклопедии

- **Старт с экспертизой:** только узлы из `initialEncyclopediaState` в [`encyclopedia-slice.ts`](../../src/store/slices/encyclopedia-slice.ts). Сейчас это базовые материалы ранней игры (`iron_ore`, `iron`, `birch`, `oak`, `raw_leather`, `tanned_leather`, `coal`).
- **Экспедиционные и редкие id:** по умолчанию открываются через `discoverMaterial` / игровые действия, а не добавлением в стартовое состояние. Исключения — осознанно и с обновлением этого раздела.

## Legacy

[`src/data/materials/organic.ts`](../../src/data/materials/organic.ts) — старый тип `Material` (рукояти и др.). Новые сущности заводятся как `MaterialNode`; синхронизация с `organic.ts` — отдельная задача.

## Проверка

- `npm run test` — в т.ч. [`expedition-material-integrity.test.ts`](../../src/modules/expeditions/data/expedition-material-integrity.test.ts) (локации, миссии, ключи стартовой энциклопедии ⊆ `materialById`).
