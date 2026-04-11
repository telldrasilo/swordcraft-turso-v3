---
name: Materials next steps
overview: "Продолжение roadmap материалов после закрытого пакета follow-up: очередные волны **2.4**, углубление **3.3–3.4**, **4.x** (вставки обработки + тесты/доки), завершение **5.2–5.4** (bridge → library, metalMaterials), хвост **0.2** при данных ремонта."
todos:
  - id: wave-24f
    content: "PR: следующая подволна 2.4 (CORE→WORLD или сужение) + §8.2/§11 + тесты контракта"
    status: completed
  - id: wave-33-34
    content: "PR: 3.3 getEffectiveRefiningRecipeId из operations/convention; опц. 3.4 MaterialProcessKind для кожи"
    status: completed
  - id: wave-4x-timeline
    content: "PR: 4.x вставки processingOperations в process-generator + интеграционные тесты + CRAFT_SYSTEM_ROADMAP при смене поведения"
    status: completed
  - id: wave-52-metals
    content: "PR: 5.2 поэтапное слияние metalMaterials/метал-data с каталогом в рантайме"
    status: completed
  - id: wave-53-bridge
    content: "PR: 5.3–5.4 разнести registry-segment-bridge в library/* + почистить ссылки в гайдах"
    status: completed
  - id: tail-02-repair
    content: "PR: 0.2 расширить collectRepairReforge… при появлении materialId в repair/reforge"
    status: completed
isProject: false
---

# План следующих шагов (материалы, после §12)

**Опора:** уже зафиксировано в [docs/MATERIALS_SINGLE_SOURCE_ROADMAP.md](docs/MATERIALS_SINGLE_SOURCE_ROADMAP.md) (шапка, **§8.2**, **§11** строка follow-up, **§12**). Приложенный `.cursor/plans/*.plan.md` не является источником правды — ориентир **только roadmap + код**.

## Рекомендуемый порядок PR (узкие диффы)

```mermaid
flowchart LR
  w24["2.4f_CORE_to_WORLD"]
  w33["3.3_effectiveRecipe_from_ops"]
  w44["4.x_processing_insertions_timeline"]
  w52["5.2_metalMaterials_runtime_merge"]
  w53["5.3_bridge_to_library_files"]
  w24 --> w33
  w33 --> w44
  w44 --> w52
  w52 --> w53
```

---

## 1. Волна 2.4 (продолжение)

**Цель:** ещё один согласованный поднабор из [`CORE_MATERIAL_TO_RESOURCE`](src/lib/craft/inventory-check.ts) → [`WORLD_RESOURCE_TO_RESOURCE_KEY`](src/lib/materials/world-resource-inventory-bridge.ts) (или сужение таблицы иначе), с **пустым** пересечением ключей CORE∩WORLD ([`inventory-check-core-world-contract.test.ts`](src/lib/craft/inventory-check-core-world-contract.test.ts)), без смены экономики.

**Кандидаты:** остаточные id, однозначно «world-first» по [a2-phase24.bridge-audit.ts](src/lib/craft/a2-phase24-bridge-audit.ts) (например часть кожевенных/добываемых цепочек — отдельно от уже перенесённого камня **2.4e**); **не** трогать пулы с риском неправильного порядка списания (`leather` без явного raw-only входа).

**После PR:** [`inventory-check.test.ts`](src/lib/craft/inventory-check.test.ts), [`resources-stash-debit.test.ts`](src/store/resources-stash-debit.test.ts), [`material-catalog-contract`](src/lib/materials/material-catalog-contract.ts); **§8.2** снимок + строка **§11**; [RESOURCE_TRANSFORMATION_MAP.md](docs/RESOURCE_TRANSFORMATION_MAP.md) — только если меняются трактовки id/цепочек. **STORE_VERSION** — только при смене инварианта сейва.

---

## 2. Волна 3.3–3.4

**3.3** — углубление [`getEffectiveRefiningRecipeId`](src/lib/craft/processing-technique-refining-bridge.ts): опциональное соглашение (например единственная `processingOperation` + явное поле `refiningRecipeId` на операции **или** стабильный вывод из I/O операции ↔ один id в [`refining-recipes.ts`](src/data/refining-recipes.ts)), затем регрессия в местах вызова ([`PartMaterialProcessingPanel.tsx`](src/components/forge/craft-v2/planner/PartMaterialProcessingPanel.tsx), [`process-generator.ts`](src/lib/craft/process-generator.ts), [`inventory-check.ts`](src/lib/craft/inventory-check.ts) если есть ветки).

**3.4** — при необходимости отделить семантику кожи/дубления от `refining_smelting`: сверка с [docs/MATERIAL_SEMANTIC_PROCESS_ROLES.md](docs/MATERIAL_SEMANTIC_PROCESS_ROLES.md), при согласии — расширение [`MaterialProcessKind`](src/types/materials/material-process.ts) + точечные `targetSemanticProcessRoles` у техники кожи; обновить тесты в [`material-processing-techniques-operations.test.ts`](src/data/material-processing-techniques-operations.test.ts) (сейчас все с operations содержат `refining_smelting` — менять только осознанно, отдельный маленький PR).

---

## 3. Волна 4.x (обработка в таймлайне)

**Сделано:** [`applyCombatProcessModsToStageEntries`](src/lib/craft/timeline-composition.ts) задействован в [`process-generator.ts`](src/lib/craft/process-generator.ts) для боевых модов; есть интеграция с кожей в [`process-generator.integration.test.ts`](src/lib/craft/process-generator.integration.test.ts).

**Дальше:** перенос **вставок из `processingOperations`** (не только `craftStageInsertions`) в общий контур построения списка стадий — согласование с черновиком [`timeline-composition.ts`](src/lib/craft/timeline-composition.ts) / при необходимости [`timeline-plan-contract.ts`](src/types/craft/timeline-plan-contract.ts); ещё **1–2** интеграционных сценария «боевая техника + обработка». При изменении поведения — короткая правка [docs/systems/CRAFT_SYSTEM_ROADMAP.md](docs/systems/CRAFT_SYSTEM_ROADMAP.md).

---

## 4. Волна 5.2–5.4

**5.2** — сейчас есть тест ⊆ реестра ([`metals-catalog-alignment.test.ts`](src/data/materials/metals-catalog-alignment.test.ts)); **следующий шаг** — поэтапное **снятие дубля** числовых данных из [`metals.ts`](src/data/materials/metals.ts) / `metalMaterials` в пользу каталога/единого источника в рантайме (без ломки legacy-крафта — малые PR по потребителям).

**5.3–5.4** — содержимое [`registry-segment-bridge.ts`](src/data/materials/library/registry-segment-bridge.ts) **разнести в полноценные файлы** `library/metals|woods|stones|leathers/*.ts` + сегменты реестра; после исчезновения массива — упростить satellites/manifest. Проверить [forbidden-legacy-bridge-imports.test.ts](src/lib/materials/forbidden-legacy-bridge-imports.test.ts) и **устаревшие ссылки** в доках (например старые упоминания `inventory-mapped-legacy-nodes` вне roadmap — при нахождении поправить).

---

## 5. Хвост 0.2 (ремонт / перековка)

Когда в [`repair-system.ts`](src/data/repair-system.ts) (или данных reforge) появятся явные **`materialId`**, дополнить [`collectRepairReforgeCatalogMaterialIds`](src/lib/materials/material-catalog-contract.ts) обходом этих полей (сейчас — агрегация по `ResourceKey` пула).

---

## Ритуал на каждый PR

- Одна строка в **§11** roadmap.
- CI: `npm run test`, `type-check`, `lint`, `build` ([AGENTS.md](AGENTS.md)).
- После правок склада/горна — ручной смоук **§3.6** (roadmap).
