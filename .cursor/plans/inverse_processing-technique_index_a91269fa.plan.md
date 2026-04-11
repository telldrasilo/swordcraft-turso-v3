---
name: Inverse processing-technique index
overview: Сделать обязательным в CI обратный индекс `materialId` → id техник обработки, для которых этот материал является **выходом** (операции I/O + выход связанного рецепта `refining-recipes` через `getEffectiveRefiningRecipeId`), с единым использованием в ENC-подсказках и чекбоксом **§10** в дорожной карте.
todos:
  - id: output-index-module
    content: "Добавить material-processing-output-index.ts: выходы техники (ops I/O + рецепт getEffectiveRefiningRecipeId), карта materialId → techniqueIds"
    status: completed
  - id: output-index-tests
    content: "Vitest: покрытие targetCatalogMaterialIds, снимки iron_alloy/tanned_leather/processed_wood, обратимость"
    status: completed
  - id: refactor-acquisition-hints
    content: "material-acquisition-hints.ts: строки «Обработка» из индекса; обновить material-acquisition-hints.test.ts"
    status: completed
  - id: roadmap-section10
    content: "MATERIALS_SINGLE_SOURCE_ROADMAP §10/§7/§8.5/§11: обязательный индекс, worklog"
    status: completed
isProject: false
---

# Обязательный обратный индекс: материал ← техники обработки (выход)

## Зачем

В [§10 дорожной карты](docs/MATERIALS_SINGLE_SOURCE_ROADMAP.md) пункт про индекс сейчас не закрыт и помечен как опциональный. [material-acquisition-hints.ts](src/lib/materials/material-acquisition-hints.ts) обходит только `processingOperations[].outputMaterialIds` и отдельно `refining-recipes`; техники вроде плавки **без** I/O на операциях не попадают в первую ветку, хотя их выход задаётся рецептом горна (`getEffectiveRefiningRecipeId` → [refining-recipes.ts](src/data/refining-recipes.ts)). Нужен **один источник правды** для «какие техники **производят** данный `materialId`», плюс Vitest, чтобы индекс не расходился с данными.

## Источник выхода по технике

Для каждой записи из `allMaterialProcessingTechniques` собрать множество каталожных **выходов**:

1. Все ключи `outputMaterialIds` по всем `processingOperations` (как сейчас для кожи).
2. Плюс канонический выход рецепта горна: `recipe = refiningRecipes.find(r => r.id === getEffectiveRefiningRecipeId(tech))`, затем `stashOutputMaterialId ?? getGrantTargetMaterialId(recipe.output.resource)` (та же формула, что в подсказках для рецептов).

Инвариант: для техник с единственной операцией и `refiningRecipeId` на операции п.2 совпадает с фактическим продуктом плавки/пилорамы/каменоломни.

## Новый модуль API

Файл, например [src/lib/materials/material-processing-output-index.ts](src/lib/materials/material-processing-output-index.ts) (имя можно уточнить в PR):

- `getCatalogOutputMaterialIdsForProcessingTechnique(tech): string[]` — уникальные id, стабильная сортировка.
- `getMaterialIdToProcessingTechniqueIds(): ReadonlyMap<string, readonly string[]>` или `Record` — для каждого `materialId` список `technique.id` (уникальные, отсортированные).
- `getProcessingTechniqueIdsProducingMaterial(materialId: string): readonly string[]` — тонкая обёртка над картой.

Зависимости: `@/data/material-processing-techniques`, `@/data/refining-recipes`, `@/lib/craft/processing-technique-refining-bridge`, `@/lib/craft/inventory-check` (`getGrantTargetMaterialId`). Без циклов: индекс не импортирует `material-acquisition-hints`.

## Рефактор ENC-подсказок

В [material-acquisition-hints.ts](src/lib/materials/material-acquisition-hints.ts):

- Строки «Обработка: …» строить по **индексу**: для `materialId` взять список `techniqueId`, по id получить технику (map `byId` или линейный поиск в тестах не нужен в hot path — можно один раз построить `Map<id, technique>` в модуле индекса или импортировать `getMaterialProcessingTechniqueById`).
- Ветку по `refiningRecipes` **оставить** для дублирующей подсказки «Горн / переработка: …» (как в текущих тестах для `tanned_leather` и `processed_wood`), либо сократить дубль осознанно в том же PR с обновлением [material-acquisition-hints.test.ts](src/lib/materials/material-acquisition-hints.test.ts), если поведение UI останется эквивалентным (не удалять строки без согласования с тестами).

## Обязательные тесты (CI)

Новый файл, например `material-processing-output-index.test.ts`:

- **Согласованность с целями техники:** для каждой техники обработки каждый id из `targetCatalogMaterialIds` входит в вычисленное множество выходов (или документированное исключение с комментарием в тесте — лучше не допускать без причины).
- **Обратимость:** для каждой техники каждый вычисленный выход `m` даёт `ids.includes(technique.id)` в `getProcessingTechniqueIdsProducingMaterial(m)`.
- **Точечные снимки:** `iron_alloy` содержит `forge_basic_iron_smelt`; `tanned_leather` содержит `forge_basic_leather_tan`; `processed_wood` содержит `forge_basic_wood_planks`.
- **Идемпотентность карты:** повторный вызов строителя даёт те же ключи/массивы (детерминизм для снапшотов не обязателен, если сортировка фиксирована).

Опционально в том же PR: расширить [material-catalog-contract.ts](src/lib/materials/material-catalog-contract.ts) сканером «ключи обратного индекса ⊆ реестр» (обычно уже покрыто `targetCatalogMaterialIds` + рецепты; добавлять только если появятся новые выходы без других сканеров).

## Документация

- В [MATERIALS_SINGLE_SOURCE_ROADMAP.md](docs/MATERIALS_SINGLE_SOURCE_ROADMAP.md): §10 — отметить пункт про обратный индекс как выполненный, убрать «опционально» у соответствующей формулировки в §7 (пакет 5.1) / §8.5 при наличии дубля; краткая строка в **§11** worklog с ссылкой на модуль и тест.

## Критерий готовности

- Один модуль индекса + Vitest; `npm run test` зелёный.
- `getMaterialAcquisitionHintLines` опирается на индекс для техник обработки (нет дубля логики «только outputMaterialIds»).
- §10 чекбокс закрыт.
