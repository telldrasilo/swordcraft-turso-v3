# Система кузницы

## Обзор
Кузница отвечает за создание оружия, переплавку материалов, ремонт и работу с инвентарем. В проекте одновременно присутствуют две ветки логики:

- `craft-slice.ts` — старая, более простая система.
- `craft-v2-slice.ts` — новая система с детальным планированием.

Главные файлы:

- `src/store/slices/craft-slice.ts`
- `src/store/slices/craft-v2-slice.ts`
- `src/lib/craft/calculator.ts`
- `src/lib/craft/forecast-calculator.ts`
- `src/lib/store-utils/craft-utils.ts`
- `src/data/weapon-recipes.ts`
- `src/data/refining-recipes.ts`
- `src/data/recipes/`
- `src/data/techniques/`
- `src/data/stages/`

## Крафт v1
Старая система хранит состояние активного крафта, активной переплавки, инвентаря оружия и списка разблокированных рецептов.

Основные сущности:

- `ActiveCraft` — текущий крафт.
- `ActiveRefining` — текущая переплавка.
- `WeaponInventory` — массив оружия игрока.
- `UnlockedRecipes` — список открытых рецептов.

Основные действия:

- `startCraft()`
- `updateCraftProgress()`
- `completeCraft()`
- `startRefining()`
- `completeRefining()`
- `addWeapon()`
- `removeWeapon()`
- `unlockRecipe()`

Эта ветка использует более простую модель:

- рецепт определяет базовые параметры;
- качество влияет на итоговые характеристики;
- расчеты опираются на утилиты из `src/lib/store-utils/craft-utils.ts`.

## Крафт v2
Новая система строится вокруг плана крафта и детального выбора материалов под части оружия.

Ключевые сущности из `src/types/craft-v2.ts`:

- `CraftPlan`
- `ActiveCraftV2`
- `CraftedWeaponV2`
- `MaterialAssignment`
- `WeaponStats`
- `CraftStageInstance`

Состояние `craft-v2-slice.ts` хранит:

- `activeCraft`
- `completedWeapon`
- `craftedWeapons`
- `unlockedRecipes`
- `unlockedTechniques`
- `availableMaterials`
- `stats`
- `shouldPurchaseMaterials`

Основные действия:

- `setCraftPlan()`
- `clearCraftPlan()`
- `startCraftV2()`
- `updateCraftProgress()`
- `completeCraftV2()`
- `unlockRecipe()`
- `unlockTechnique()`
- `unlockMaterial()`

## План крафта
План крафта собирается до запуска процесса и включает:

- выбранный рецепт;
- материалы по частям оружия;
- выбранные техники;
- прогноз ожидаемого результата.

Типичный поток:

1. Игрок выбирает рецепт.
2. Для каждой части оружия назначаются материалы.
3. Выбираются техники.
4. Калькулятор прогнозирует результат.
5. Store проверяет ресурсы и запускает крафт.
6. После завершения создается `CraftedWeaponV2`.

## Части оружия
Система v2 опирается на parts в рецептах. Обычно используются:

- `blade`
- `guard`
- `grip`
- `pommel`

Для каждой части важны:

- допустимые категории материалов;
- количество;
- доминирующие свойства;
- вторичные свойства.

## Качество
Общая система качества описана в `src/types/shared/quality.ts`.

Градации:

- `poor`
- `common`
- `good`
- `excellent`
- `masterpiece`
- `legendary`

Для крафта используются:

- `QUALITY_GRADES_V1`
- `QUALITY_GRADES_V2`
- `getQualityGrade()`
- `getQualityMultiplier()`
- `getQualityNameRu()`

Качество влияет на:

- атаку;
- прочность;
- цену продажи;
- визуальную подачу в UI;
- ценность жертвоприношения;
- пригодность для заказов и экспедиций.

## Прогноз результата
`src/lib/craft/forecast-calculator.ts` рассчитывает прогноз еще до запуска крафта.

Прогноз включает:

- ожидаемое качество;
- диапазоны характеристик;
- точность предсказания;
- вклад материалов;
- вклад техник;
- вклад экспертизы по материалам.

Точность прогноза зависит от средней экспертизы материалов:

- ниже экспертиза — шире диапазоны;
- выше экспертиза — уже диапазоны и выше confidence.

## Расчет оружия
Главный расчет находится в `src/lib/craft/calculator.ts`.

Результат возвращается как `WeaponCalculationResult`:

- `stats`
- `quality`
- `qualityGrade`
- `qualityMultiplier`
- `qualityColor`
- `qualityNameRu`
- `sellPrice`
- `materials`

На итог влияют:

- базовые статы рецепта;
- свойства материалов;
- техники;
- качество;
- редкость материалов;
- уровень кузнеца;
- экспертиза.

## Этапы крафта
Этапы описаны в `src/data/stages/` и разделены на 5 категорий:

- `preparation`
- `processing`
- `forming`
- `assembly`
- `finishing`

Они нужны для:

- генерации процесса крафта;
- визуализации прогресса;
- добавления техникой новых шагов или замены шагов.

## Техники
Техники описаны в `src/data/techniques/basic.ts` и `src/data/techniques/advanced.ts`.

Техника может менять:

- качество;
- прочность;
- атаку;
- магическую проводимость;
- длительность процесса;
- расход материалов;
- риск неудачи;
- состав этапов.

## Переплавка
Переплавка использует `src/data/refining-recipes.ts`.

Покрывает:

- руды;
- сплавы;
- обработку дерева;
- обработку камня.

Переплавка зависит от:

- доступных ресурсов;
- топлива;
- иногда зданий и рабочих;
- длительности рецепта.

## Инвентарь оружия
Инвентарь хранит созданное оружие и используется в нескольких системах:

- продажа;
- заказы NPC;
- экспедиции;
- зачарование;
- жертвоприношение;
- ремонт.

Ключевые поля оружия:

- `type`
- `quality`
- `qualityGrade`
- `attack`
- `durability`
- `sellPrice`
- `enchantments`
- `warSoul`
- `epicMultiplier`

## Ремонт
Ремонт опирается на `src/lib/store-utils/repair-utils.ts` и `src/data/repair-system.ts`.

Основные задачи:

- найти лучшего кузнеца;
- рассчитать стоимость ремонта;
- определить максимум восстановления;
- списать ресурсы;
- применить восстановление к оружию.

Ключевые функции:

- `findBestBlacksmith()`
- `getRepairOptionsForWeapon()`
- `calculateRepairCost()`
- `calculateMaxRepairPercent()`
- `executeRepair()`

## War Soul и epic multiplier
Система кузницы связана с более поздними боевыми и экспедиционными системами через:

- `warSoul`
- `epicMultiplier`

Они влияют на:

- ценность оружия;
- бонусы в экспедициях;
- ценность при жертвоприношении;
- привлекательность для игрока при выборе снаряжения.

## Связи с другими системами

- `resources-slice.ts` — списание и получение ресурсов.
- `orders-slice.ts` — проверка соответствия оружия заказу.
- `guild-slice.ts` — выбор оружия для экспедиций.
- `enchantments-slice.ts` — наложение чар и жертвоприношение.
- `encyclopedia-slice.ts` — рост экспертизы по материалам.

## Что смотреть при изменениях
Если меняется крафт, обычно нужно проверить сразу несколько зон:

- `src/types/craft.ts`
- `src/types/craft-v2.ts`
- `src/types/shared/quality.ts`
- `src/store/slices/craft-slice.ts`
- `src/store/slices/craft-v2-slice.ts`
- `src/lib/craft/calculator.ts`
- `src/lib/craft/forecast-calculator.ts`
- `src/lib/store-utils/craft-utils.ts`
- `src/data/weapon-recipes.ts`
- `src/data/recipes/`
- `src/data/techniques/`
- `src/data/stages/`
