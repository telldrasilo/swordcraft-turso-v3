---
name: weapon-recipe-authoring
description: >-
  SwordCraft: добавить или изменить рецепт оружия (WeaponRecipe) — части, стадии, регистр,
  согласование с шаблонами и Крафтовой линией. Use when adding a weapon recipe, new sword
  axe dagger form, editing src/data/recipes, or "новый рецепт оружия".
---

# Weapon recipe authoring

## Когда открывать

- Новый или правка существующего **рецепта оружия** (`WeaponRecipe`).
- Расширение **шаблонного** контура (после появления материализатора) или **плоский** рецепт в `src/data/recipes/*.ts`.

## Навигация по документам (канон)

| Документ | Зачем |
|----------|--------|
| [CRAFT_LINE_RECIPE_TECHNIQUE_COMPOSITION.md](../../../docs/CRAFT_LINE_RECIPE_TECHNIQUE_COMPOSITION.md) | Центр проработки: хребет, полоса, фазы внедрения. |
| [RECIPE_TEMPLATE_COMPOSITION.md](../../../docs/RECIPE_TEMPLATE_COMPOSITION.md) | Шаблоны и фрагменты; **§14** — меч / кинжал / топор как эталоны. |
| [TZ_SWORD_RECIPE_AND_CRAFT_LINE.md](../../../docs/TZ_SWORD_RECIPE_AND_CRAFT_LINE.md) | ТЗ пилота меча (микроэтапы хребта) при работе с мечами. |

Типы: [`src/types/craft-v2.ts`](../../../src/types/craft-v2.ts) — `WeaponRecipe`, `RecipePart`, `RecipeStageConfig` (+ опционально **`craftLineMicroSteps`**, **`craftLinePhase`**, **`RecipeCraftLineMicroStep`**). Пилот хребта: [`basic-sword-stages.ts`](../../../src/data/recipes/basic-sword-stages.ts), [`basic-sword-recipe.ts`](../../../src/data/recipes/basic-sword-recipe.ts); второй эталон v0: [`ceremonial-sword-recipe.ts`](../../../src/data/recipes/ceremonial-sword-recipe.ts). Шаблон v0: [`recipe-definition-v0.ts`](../../../src/lib/craft/recipe-definition-v0.ts). Контракт `stages` для CI: [`recipe-stages-contract.ts`](../../../src/lib/craft/recipe-stages-contract.ts) + снимки в [`recipe-definition-v0.test.ts`](../../../src/lib/craft/recipe-definition-v0.test.ts). Линия с хребтом: по умолчанию **включена**; legacy-only: **`NEXT_PUBLIC_CRAFT_LINE_RECIPE_BACKBONE=false`** (`isCraftLineRecipeBackboneEnabled` в `store-utils/constants`).

## Чеклист: плоский рецепт (текущий основной путь)

1. **Файл данных** — подходящий модуль: [`swords.ts`](../../../src/data/recipes/swords.ts), [`melee.ts`](../../../src/data/recipes/melee.ts), [`extra-melee-forms.ts`](../../../src/data/recipes/extra-melee-forms.ts) или новый, если тип изолирован.
2. **Уникальный `id`** рецепта; `type` согласован с группировкой в [`recipes/index.ts`](../../../src/data/recipes/index.ts).
3. **`parts`** — `id`, `materialTypes`, `minQuantity`/`maxQuantity`, `dominantProperty`/`secondaryProperty`, `optional` где нужно; **`combatPart`** указывает на существующий `parts[].id`.
4. **`stages`** — каждый `stageType` существует в библиотеке этапов ([`src/data/stages`](../../../src/data/stages)); поля `material`/`target` ссылаются на **id частей** из этого рецепта.
5. **Регистрация** — массив добавлен в экспорт файла; рецепт включён в [`allRecipes`](../../../src/data/recipes/index.ts) и при необходимости в **`recipesByType`** (или новый ключ типа).
6. **`getRecipeById(id)`** находит рецепт после сборки.
7. Прогон: `npm run type-check`, при затронутой логике — `npm run test`; для рецептов из **`RECIPE_DEFINITIONS_V0`** — не ломать снимок контракта `stages` в `recipe-definition-v0.test.ts` (см. **§14** / §9 RECIPE_TEMPLATE).

## Чеклист: шаблон + материализация (когда модуль внедрён)

1. Новая запись **`RecipeDefinition`** (или эквивалент в данных), не дублировать длинный `stages` вручную без причины.  
2. Версия шаблона закреплена; CI: материализованный `stages` = эталон (см. **§9** RECIPE_TEMPLATE).  
3. **`§14` RECIPE_TEMPLATE** — образец ролей и фрагментов для меча / кинжала / топора.

## Крафтовая линия и микроэтапы

- Пока полоса строится из техник без полного хребта, новый рецепт **не обязан** сразу иметь микроэтапы хребта; после внедрения контракта **A** — добавить согласно **TZ** / **CRAFT_LINE**.  
- У боевой **`Technique`** при необходимости **`craftLineAnchorAfterStageIndex`** (после какой стадии `recipe.stages`, 0-based, вставляется блок приёма на линии).
- Префиксы id микроэтапов хребта не пересекать с id микрозадач техник — см. **[technique-microtasks](../technique-microtasks/SKILL.md)**.

## Антипаттерны

- Рецепт только в UI или в побочном файле без **`allRecipes`**.  
- `stageType` из головы без проверки реестра этапов.  
- `material`/`target` на несуществующую часть.  
- Дублирующий `recipe.id`.  
- Копирование десятков стадий между видами оружия **без** плана вынести в шаблон (**RECIPE_TEMPLATE**), если модуль уже есть.

## Связанные skills

- **[technique-wiring](../technique-wiring/SKILL.md)** — новые **боевые** техники и обработка материалов, если рецепт требует согласования приёмов.  
- **[technique-microtasks](../technique-microtasks/SKILL.md)** — стабильные id шагов техник.
