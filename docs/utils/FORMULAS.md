# Формулы игры

## Обзор
Этот файл собирает ключевые типы формул проекта в одном месте. Точные коэффициенты следует сверять в исходных утилитах и данных, а этот документ нужен как карта зависимостей.

## Крафт
Обобщенная схема:
- итоговый стат = базовый стат рецепта + сумма вкладов материалов + бонусы техник
- итоговое качество = базовое качество + бонусы качества материалов и техник
- финальный стат = сырой стат * quality multiplier

## Инвентарь: `powerScore` (сводная «мощь»)

Источник в коде: [`recalculateWeaponPowerScore`](../../src/lib/craft/weapon-power-score.ts), поле `powerScore` на [`CraftedWeaponV2`](../../src/types/craft-v2.ts). Пересчитывается при создании и мутациях оружия (`withRecalculatedPowerScore`).

**Формула (целое, не ниже 0):**

`powerScore = round(attack + qualityBonus + warSoulTierBonus)`, где:

- `attack` — `weapon.stats.attack`;
- `qualityBonus = round((weapon.quality / 100) * 20)` — вклад шкалы качества 0…100;
- `warSoulTierBonus = tier * 2`, где `tier` — числовой индекс тира Души Войны из [`getWarSoulTier`](../../src/data/war-soul-tiers.ts) с учётом пула `maxWarSoul` (как в UI тира).

Сортировка инвентаря/верстака по опции «мощь» опирается на это значение.

## Прогноз
Обобщенная схема:
- диапазон = ожидаемое значение +/- разброс
- разброс зависит от экспертизы, комбинации материалов и сложности рецепта
- confidence растет с ростом знания материалов
- **Вехи средней экспертизы по материалам плана (B2):** в расчёте `expertiseFactor` в [`forecast-calculator.ts`](../../src/lib/craft/forecast-calculator.ts) сначала собирается **`expertiseMilestoneMult`** (начинается с 1), затем умножается скобка `(FORECAST_EXPERTISE_FACTOR_BASE + …)`. К **`expertiseMilestoneMult`** относятся:
  1. **Константы** при средней экспертизе плана `avgExpertise`: ≥ **80%** (`MATERIAL_EXPERTISE_MILESTONE_HIGH`) → `+ FORECAST_EXPERTISE_MILESTONE_80_EXTRA` (**0.012**); ≥ **100%** (`MATERIAL_EXPERTISE_MILESTONE_MAX`) → дополнительно `+ FORECAST_EXPERTISE_MILESTONE_100_EXTRA` (**0.015**). Константы — в [`src/lib/store-utils/constants.ts`](../../src/lib/store-utils/constants.ts).
  2. **Реестр** [`material-expertise-milestone-registry.ts`](../../src/data/material-expertise-milestone-registry.ts): для каждой строки `GLOBAL_MATERIAL_EXPERTISE_MILESTONE_ROWS`, у которой `avgExpertise >= atPercent`, в сумму входит опциональное **`forecastExpertiseFactorExtra`** (сейчас **+0.002** на 80%, **+0.003** на 100%). Функция **`getRegistryForecastExpertiseFactorExtras`** суммирует вклады достигнутых порогов и **прибавляется к тому же** `expertiseMilestoneMult` после констант, без двойного учёта порога. Подписи **`labelRu` / `summaryRu` в UI должны соответствовать этому правилу**; отдельные «перки в данных» в будущем можно навешивать на те же строки реестра.

**Техники обработки (плавка):** поле **`outcomeModifiers.forecastSpreadTightness`** в [`material-processing-techniques.ts`](../../src/data/material-processing-techniques.ts) агрегируется в **`aggregateProcessingForecastSpreadTightness`** и передаётся в **`calculateForecast`** как седьмой аргумент (`processingForecastSpreadTightness`), сужая разброс min–max относительно базы прогноза (см. [`calculator.ts`](../../src/lib/craft/calculator.ts)).

**Длительность вставленных этапов:** у вставки из техники обработки задаётся **`durationSeconds`**; в таймлайне крафта это уходит в **`baseDurationOverride`** у сгенерированного этапа ([`process-generator.ts`](../../src/lib/craft/process-generator.ts), тип конфига этапа в [`craft-v2.ts`](../../src/types/craft-v2.ts)).

## §6.13 Энциклопедия ↔ Craft v2 (`aggregateExpertiseImpact`)

Источник правды в коде: [`aggregate-expertise-impact.ts`](../../src/lib/craft/aggregate-expertise-impact.ts), потребители — [`calculator.ts`](../../src/lib/craft/calculator.ts), [`forecast-calculator.ts`](../../src/lib/craft/forecast-calculator.ts), [`process-generator.ts`](../../src/lib/craft/process-generator.ts).

**Веса частей:** строки плана `{ materialId, partWeight }` с нормализацией Σ`partWeight` = 1; построение из рецепта — `buildExpertisePlanRowsFromCraft` (доля по `quantity` части в плане).

**Нейтральный impact при экспертизе ≤ 0 на материал:** единичные множители времени/риска/отходов, `qualityBonus = 0`, `varianceMultiplier = 1`, точность прогноза 50 — чтобы черновой план не ломался.

**Агрегирование:**
- `qualityBonus`: взвешенное арифметическое по `partWeight`.
- `timeMultiplier`, `defectRiskMultiplier`, `materialWasteMultiplier`, `varianceMultiplier`: взвешенное геометрическое `exp(Σ wᵢ ln Mᵢ)` при Mᵢ > 0.
- `predictionAccuracy`: взвешенное среднее, затем clamp [50, 100].
- Глобальный **`timeMultiplier`** после агрегации: нижний софткап **0.75** (ускорение от экспертизы не глубже −25% к базе этапа в смысле агрегата; отдельно на этап действует clamp на per-material множитель).

**Мастерство (UI «Мастерство», поле `materialWasteMultiplier` в данных):** эффективность вклада материала в статы — `materialMasteryEfficiency = min(1.4, 1 / max(0.05, waste))`; per-part в [`calculateWeapon`](../../src/lib/craft/calculator.ts) и прогнозе статов; геом. среднее эффективностей — в агрегате `materialMasteryEfficiency`.

**Длительность этапа (после уровней/workability из типа этапа):** `duration ×= expertiseTimeMultiplier` из `calculateExpertiseImpact` по `primaryMaterialId`; этапы без материала — множитель из **агрегированного** времени. Софткап: итог не ниже **75%** от длительности «до множителя экспертизы» (`preExpertiseDuration * 0.75`).

**Надёжность → качество (Craft v2):** в [`calculateWeapon`](../../src/lib/craft/calculator.ts) к очку качества после базовой формулы применяются множитель от агрегированного `defectRiskMultiplier` и доля от взвешенного `qualityBonus` из impact (см. код).

## Экспертиза от завершённого крафта (B2)
- Одна дельта на **уникальный** `materialId` в плане частей; формула: [`computeCraftExpertiseGainDelta`](../../src/lib/craft/craft-expertise-from-craft.ts) (убывание на высоких %, 0 при 100%).
- **Craft v2 (UI + store):** в [`finalizeCompletedCraftV2`](../../src/hooks/use-craft-v2.ts) синхронно собираются строки прироста [`buildCraftExpertiseGainRows`](../../src/lib/craft/craft-expertise-from-craft.ts); запись в Zustand через [`applyCraftExpertiseGainRows`](../../src/lib/craft/craft-expertise-from-craft.ts) выполняется в **`queueMicrotask`**, чтобы не вызывать `addMaterialExpertise` внутри updater’а `setState` (React 19).
- **Одним вызовом** (тесты, внешние сценарии): [`applyCraftExpertiseFromCompletedPlan`](../../src/lib/craft/craft-expertise-from-craft.ts) — считает строки и сразу применяет их к store.
- Не смешивать с начислениями из **сессий изучения** в энциклопедии.

## Экспедиции (v2)

**Источник правды по коду:** [`expedition-calculator-v2.ts`](../../src/lib/expedition-calculator-v2.ts), модификаторы — [`modifier-system/`](../../src/lib/modifier-system/). Завершение и агрегация событий модуля — [`guild-expedition-cross-slice.ts`](../../src/store/cross-slice/guild-expedition-cross-slice.ts). Канон экономики и параметры шаблона — [`EXPEDITION_AND_ADVENTURER_AUDIT.md`](../systems/EXPEDITION_AND_ADVENTURER_AUDIT.md).

### Базовые шансы и «сложность»

- У [`ExpeditionTemplate`](../../src/data/expedition-templates.ts) поле **`difficulty`** задаёт вход в презентацию и баланс: [`difficultyInfo`](../../src/data/expedition-templates.ts) и глобальная таблица [`EXPEDITION_DIFFICULTY_BALANCE`](../../src/lib/expedition-difficulty-balance.ts) (`failureChance`, `weaponLossChance`, `levelRange`, `rewardMultiplier`, `tier` и т.д.).
- **Базовый шанс успеха** в v2 опирается на `failureChance` из этого баланса (через `difficultyInfo`), а не на произвольные поля конкретной строки шаблона, если только шаблон не синхронизирован с `difficulty` осознанно.
- Поля **`failureChance` / `weaponLossChance` на самом объекте шаблона** в данных могут дублировать презентацию или оставаться legacy; **изменение только их без согласования с `difficulty` и балансом не меняет исход калькулятора v2.** Авторам контента: ориентир — `difficulty` + `EXPEDITION_DIFFICULTY_BALANCE` (см. нарушение п.3 в аудите).

### Прогноз в store и договор миссии

- Хелпер **`calculateExpedition`** в [`game-store-composed.ts`](../../src/store/game-store-composed.ts) принимает опциональный **`contractType`** (`exploration` | `speed`), по умолчанию `exploration`, и передаёт его в калькулятор v2 — в одной линии с брифингом.

### Черты данных и уникальные бонусы искателя

- Поле **`adventurer.traits`** (каталог `adventurer-traits`) и **`adventurer.uniqueBonuses`** (каталог `unique-bonuses`) подключены к расчёту v2 провайдером **`dataTraitsUniqueBonuses`** в [`modifier-system/providers/data-traits-unique-bonuses-provider.ts`](../../src/lib/modifier-system/providers/data-traits-unique-bonuses-provider.ts) (отдельно от личностных черт `personality.primaryTrait` / `secondary`).

### Слава гильдии

- В расчёте v2: **`guildGloryOnSuccess`** и модификаторы цели `glory`; при завершении экспедиции начисление славы гильдии согласуется с этим прогнозом (и критом при успехе в cross-slice).

### Экономика старта

- Старт миссии **не списывает золото кузнеца** с `resources.gold` (канон в аудите). Поля **`cost.supplies` / `cost.deposit`** в данных — про контракт заказчика/снабжение в лоре, не личный взнос при нажатии «Отправить».

Обобщённая схема исхода:
- success chance = база из сложности + сумма модификаторов
- crit chance = базовый шанс + модификаторы
- weapon loss chance = база из баланса сложности + модификаторы
- weapon wear = базовый износ + модификаторы

## Заказы
Обобщенная схема:
- weapon matches order = проверка типа + качества + атаки + иногда материала
- reward efficiency = награда / сложность выполнения
- оценка «стоимости материалов» в золоте для шаблона заказа и аванса: `getCraftingCost` в [`src/lib/craft/inventory-check.ts`](../../src/lib/craft/inventory-check.ts) (в т.ч. базовый +3 угля горна) → [`craftingResourceCostMapToGoldApprox`](../../src/lib/store-utils/order-material-cost-gold.ts) по `RESOURCE_SELL_PRICES`; см. [`order-achievable-utils.ts`](../../src/lib/store-utils/order-achievable-utils.ts) и [`order-utils.ts`](../../src/lib/store-utils/order-utils.ts) (`calculateGoldReward`)

## Жертвоприношение
Обобщенная схема:
- essence value = базовая ценность оружия + бонус качества + бонус tier + бонусы `warSoul` и `epicMultiplier`

## Экономика ресурсов
Обобщенная схема:
- sell value = количество * цена ресурса
- окупаемость производства = рыночная стоимость результата - стоимость входных ресурсов и времени

## Плавка (`refining_smelting`)
При **завершении** плавки количество продукта (слитка) берётся как **целая часть** от базового выхода, умноженного на средневзвешенный множитель по фактически списанным зарядам руды:

- множитель = `computeRefiningSmeltingOutputMultiplier` в [`src/lib/craft/inventory-check.ts`](../../src/lib/craft/inventory-check.ts) (веса по количеству списанного `materialId` с фасетом `smelt_ore_charge`);
- на материал — коэффициент **`oreChargeEfficiency`** из оверрайда [`src/data/materials/material-process-overrides.ts`](../../src/data/materials/material-process-overrides.ts) (через `getRefiningOreChargeEfficiency` в [`src/lib/materials/material-process-contribution.ts`](../../src/lib/materials/material-process-contribution.ts)); применение к выходу — [`game-store-composed.ts`](../../src/store/game-store-composed.ts) (`Math.floor(…)`).

Карта для разработчиков: [`docs/RESOURCE_TRANSFORMATION_MAP.md`](../RESOURCE_TRANSFORMATION_MAP.md). **Баланс:** отличия альтернативных руд от канонических (`iron_ore`, …) задаются этими коэффициентами.

## Экспедиция: прочность и видимые теги повреждений (фаза 6)

- **Списание прочности за миссию — один источник:** значение `weaponWear` из [`expedition-calculator-v2.ts`](../../src/lib/expedition-calculator-v2.ts) передаётся в `addWarSoulToWeapon` как потеря `currentDurability` ([`craft-slice.ts`](../../src/store/slices/craft-slice.ts)). Поля эффекта `damage_weapon` в данных события **не** суммируются к прочности повторно.
- **Видимые теги:** если у шаблона события в **основных** `effects` есть `damage_weapon`, при завершении миссии [`expedition-post-mission-damage.ts`](../../src/lib/expedition-post-mission-damage.ts) дописывает записи в `activeDamageTags` по карте [`event-template-to-damage-tags.ts`](../../src/data/weapon-damage/event-template-to-damage-tags.ts). События с уроном только в ветках `choices[]` пока не дают тегов (нет сохранённого выбора в снимке).
- **Тяжесть** (`light` / `moderate` / `heavy`) для новых записей берётся из того же `weaponWear` функцией `weaponWearToSeverity` (пороги см. в том же модуле).
- **Старт экспедиции и сдача заказа NPC:** [`validateExpeditionStart`](../../src/lib/expedition-start-validation.ts) и `order-cross-slice` используют [`getWeaponGuildServiceBlockReason`](../../src/lib/guild-weapon-service-eligibility.ts): доля `(currentDurability ?? durability) / maxDurability` не ниже **`GUILD_WEAPON_MIN_DURABILITY_RATIO`**, нет записей в `activeDamageTags`, `repairCondition` только `ok` (не `needsProperRepair` / `temporaryPatch`).

## Кузница: ремонт и теги (G1, фаза 6)

- **G1 — допустимые профили броска:** по каждому тегу в реестре задаётся `allowedRepairTechniqueIds` (пустой массив — без ограничения от тега); профили броска (`RepairDiceProfile`, [`repair-dice-profile.ts`](../../src/lib/weapon-damage/repair-dice-profile.ts)) получаются как `mapTechniqueIdsToRepairDiceProfile([id])` на каждый id, затем пересечение по всем `activeDamageTags` ([`filter-repair-by-damage-tags.ts`](../../src/lib/weapon-damage/filter-repair-by-damage-tags.ts), [`repair-dice-from-techniques.ts`](../../src/lib/weapon-damage/repair-dice-from-techniques.ts)); переход к таблицам в `repair-system` — `repairDiceProfileToRepairType` в [`repair-utils.ts`](../../src/lib/store-utils/repair-utils.ts); опции и кубик — там же и [`repair-cross-slice.ts`](../../src/store/cross-slice/repair-cross-slice.ts).
- **Фаза 3b — техники и план этапов:** применимые техники к активным тегам — `getApplicableRepairTechniquesForTags`; слияние этапов и стоимости — `buildWeaponRepairPlan` ([`build-repair-plan.ts`](../../src/lib/weapon-damage/build-repair-plan.ts)); описания техник — [`repair-techniques-registry.ts`](../../src/data/weapon-damage/repair-techniques-registry.ts). Прогресс по этапам по времени — [`repair-stage-timing.ts`](../../src/lib/weapon-damage/repair-stage-timing.ts) (`getRepairStageProgressFromElapsed`); UI — хук [`use-weapon-repair-stage-run.ts`](../../src/hooks/use-weapon-repair-stage-run.ts), после прохода таймера этапов вызывается `executeWeaponRepairByTechniques`. **Игровой поток:** `executeWeaponRepairByTechniques` в [`repair-cross-slice.ts`](../../src/store/cross-slice/repair-cross-slice.ts) — покрытие всех активных тегов выбранными техниками, скидка мастера на **материалы** плана (`applyMasteryDiscountToTechniquePlanCost`; золото в ремонте не используется), бросок через `executeRepairWithPlanCosts` (проверка материалов по плану, кубик по опции `RepairType`, выбранной из `mapTechniqueIdsToRepairDiceProfile` и суженной по G1 через `pickRepairDiceProfileAllowedByTags` → `repairDiceProfileToRepairType`). **Верстак:** в persist хранится `repairBenchWeaponId` — на вкладке «Ремонт» один клинок; после успешного ремонта слот очищается.
- **После успешного ремонта:** снимаются видимые теги, `repairCondition` → `ok`; сбрасывается очередь `autoRepairReadyAt` при успехе ручного ремонта; с шансом в `weaponLegacy.hiddenMarks` добавляется служебный id `repair_legacy_resonance` (заготовка под зачарования). Базовый шанс + бонус от `weaponLegacy.bladeBondRepairCount` (накапливается на успешных **quality / restoration / enhancement**) — константы `WEAPON_LEGACY_RESONANCE_*` в [`constants.ts`](../../src/lib/store-utils/constants.ts).
- **Модель v2 (диагностика):** при успешном снятии тегов `executeWeaponRepairByTechniques` получает опции [`RepairTechniqueExecutionOptions`](../../src/types/repair-execution.ts): ручной осмотр (`manual_inspection` + `hypothesisByTagId`) → в `weaponLegacy` инкремент **`precise`** (верная гипотеза) или **`risky`** (ошибочная); **`auto_pick`** и **`auto_repair`** → **`skipped`**. Неверная гипотеза по хотя бы одному активному тегу: к `baseSuccessChance` применяется **`REPAIR_WRONG_HYPOTHESIS_SUCCESS_PENALTY_POINTS`** (отрицательное смещение, через `executeRepairWithPlanCosts` → `successChanceDelta`). Режим **авто-подбора техник:** стоимость материалов плана умножается на **`getRepairAutoPickMaterialMarkup(weapon)`** — линейная интерполяция между **`REPAIR_AUTO_PICK_MARKUP_MIN`** и **`REPAIR_AUTO_PICK_MARKUP_MAX`** по атаке (`REPAIR_AUTO_PICK_ATTACK_REF_MIN` … `REPAIR_AUTO_PICK_ATTACK_REF_MAX`); мощность v1 — **`getWeaponRepairPowerScore`** (= атака, ≥ 1). **`claimWeaponAutoRepair`** при снятии тегов пишет **`skipped`** в счётчики диагностики.
- **Очередь верстака — финал после этапов:** при вызове `executeWeaponRepairByTechniques` из очереди в опции пробрасывается `workbenchCompletedStages` (= число этапов плана). К `successChanceDelta` добавляется min(**`REPAIR_WORKBENCH_STAGE_SUCCESS_BONUS_CAP`**, этапы × **`REPAIR_WORKBENCH_STAGE_SUCCESS_BONUS_PER_STAGE`**) — логика «промежуточные операции снижают риск финальной закалки». Тексты провала без обесценивания времени игрока — [`repair-failure-copy.ts`](../../src/lib/weapon-damage/repair-failure-copy.ts).
- **G2/G3 (заглушка):** у части тегов в реестре `requiresPrepStep` — в UI баннер «нужна подготовка»; полный цикл этапов не в MVP.
- **Авто-ремонт:** основная цена — **золото**, не таймер: **`getWeaponAutoRepairGoldCost(weapon)`** = **`WEAPON_AUTO_REPAIR_GOLD_BASE`** + ⌊**`getWeaponRepairPowerScore(weapon)`** × **`WEAPON_AUTO_REPAIR_GOLD_PER_ATTACK_POINT`**⌋; списание в **`claimWeaponAutoRepair`** (при **`autoRepairAwaitingForgeVisit`** claim недоступен до захода в кузницу). Очередь **next_visit:** `scheduleWeaponAutoRepair` → `autoRepairAwaitingForgeVisit`; при открытии кузницы `settleAutoRepairForgeVisitReady` снимает ожидание и выставляет `autoRepairReadyAt = now` (косметика готовности). Таймер **`WEAPON_AUTO_REPAIR_DELAY_MS`** убран из основного потока (legacy). `claimWeaponAutoRepair` восстанавливает долю разрыва прочности (`WEAPON_AUTO_REPAIR_DURABILITY_RESTORE_RATIO`), снимает теги, умножает `epicMultiplier` на `WEAPON_AUTO_REPAIR_EPIC_MULTIPLIER`, слабее крит скрытой метки (`WEAPON_AUTO_REPAIR_LEGACY_RESONANCE_*`).
- **Осмотр:** `startWeaponDeepInspect` списывает материалы (`WEAPON_DEEP_INSPECT_MATERIAL_COST`), выставляет `weaponLegacy.deepInspectReadyAt`; по истечении `WEAPON_DEEP_INSPECT_DURATION_MS` UI вызывает `completeWeaponDeepInspect` — пишется `lastDeepInspectAt` и снимок `deepInspectNotes` / `deepInspectTagIds`. Хелперы: [`weapon-legacy.ts`](../../src/lib/weapon-damage/weapon-legacy.ts).
- **Авто-ремонт (наследие):** при `claimWeaponAutoRepair` увеличивается `weaponLegacy.autoRepairCompletedCount`.

## Примечание
Этот файл — обзорная карта. За **численными коэффициентами крафта** (итог оружия, прогноз, сортировка материалов) смотрите:
- `src/lib/craft/constants.ts`
- `src/lib/craft/formulas.ts`
- `src/lib/craft/calculator.ts`
- `src/lib/craft/forecast-calculator.ts`
- `src/lib/craft/aggregate-expertise-impact.ts` (§6.13)
- `src/lib/craft/craft-expertise-from-craft.ts` (прирост экспертизы после крафта, B2)

Остальное:
- `src/lib/expedition-calculator-v2.ts` (и `src/lib/expedition-post-mission-damage.ts` — теги после миссии)
- `src/lib/guild-weapon-service-eligibility.ts` (гильдия: прочность / теги / repairCondition)
- `src/lib/weapon-damage/filter-repair-by-damage-tags.ts` (G1 — фильтр типов ремонта)
- `src/lib/weapon-damage/build-repair-plan.ts` (фаза 3b — сборка плана из техник)
- `src/lib/weapon-damage/repair-stage-timing.ts` (фаза 3b — таймлайн этапов для UI)
- `src/lib/store-utils/enchantment-utils.ts`
- `src/lib/store-utils/constants.ts` (экономика, титулы, тиры и т.д.)
