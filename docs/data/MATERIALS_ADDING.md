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
| Органика / травы | `library/organics/*.ts` (`buildWorldNode`, роль `organic`) |

## Чеклист секций `MaterialNode`

1. `identity` — `id`, `name`, `class`, `origin`, `tags`
2. `physical`, `chemical`, `arcane`, `processing`
3. `economy` — `rarity`, `tier`, `baseValue`, `availability`, `discoverability`
4. `summary` — `basic`, `applied`, `strengths`, `weaknesses`, `bestFor`
5. `discovery` — `unlockedBy`
6. `description`, `icon`, `version`
7. опционально `recipe`

Числа нового материала сверяйте с **2–3 соседями** того же `economy.tier` и близкой роли.

## TD-DOC-1: новый добываемый id и склад кузницы (фаза 3 аудита)

Чтобы id не «застрял» только в энциклопедии или ломал партицию тестов, при добавлении добываемого узла последовательно:

1. **[`scripts/gather-material-config.mjs`](../../scripts/gather-material-config.mjs)** — порядок и папка; `node scripts/refresh-gather-library.mjs`.
2. **Расход в кузне / горне / лавке:** при необходимости строка в [`world-resource-inventory-bridge.ts`](../../src/lib/materials/world-resource-inventory-bridge.ts) и/или ядро [`MATERIAL_TO_RESOURCE`](../../src/lib/craft/inventory-check.ts) (`inventory-check.ts`); хелпер [`canCatalogMaterialSpendInForgeCraft`](../../src/lib/craft/inventory-check.ts) должен стать `true`, иначе материал не попадёт в планировщик крафта.
3. Если пока **не** подключаете к расходу — **явно** добавьте id в [`gatherable-enc-only.ts`](../../src/lib/materials/gatherable-enc-only.ts) (реестр ENC-only); иначе CI [`gatherable-enc-only.test.ts`](../../src/lib/materials/gatherable-enc-only.test.ts) упадёт.
4. **[`docs/RESOURCE_TRANSFORMATION_MAP.md`](../RESOURCE_TRANSFORMATION_MAP.md)** и таблицы **§4.1** в [`MATERIALS_UNIFICATION_AUDIT.md`](../MATERIALS_UNIFICATION_AUDIT.md).
5. При списании в процессах с семантикой — оверрайд и тест по [`MATERIAL_SEMANTIC_PROCESS_ROLES.md`](../MATERIAL_SEMANTIC_PROCESS_ROLES.md) (**TD-SEM-4**).

## Пакет экспедиции (много однотипных ресурсов)

Каталог добычи в мире: файл в нужной подпапке [`library/`](../../src/data/materials/library/) — `ores/`, `fuels/`, `gems/`, `organics/`, `special/` и т.д. — с `buildWorldNode` из [`build-world-node.ts`](../../src/data/materials/library/build-world-node.ts) (без тега `expedition`). Добавьте id в [`scripts/gather-material-config.mjs`](../../scripts/gather-material-config.mjs), затем `node scripts/refresh-gather-library.mjs`. Массовое добавление: [`expedition/nodes.ts`](../../src/data/materials/library/expedition/nodes.ts) → `node scripts/gen-world-resource-nodes-from-expedition.mjs` → `node scripts/split-world-resource-nodes.mjs` (результат разносится по папкам, затем refresh). Legacy-фабрика [`expedition/factory.ts`](../../src/data/materials/library/expedition/factory.ts) не обязательна для новых id.

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
