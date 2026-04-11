# Дорожная карта системы крафта (материалы, экспертиза, техники)

**Статус:** проектный документ (планирование и архитектура). Не заменяет [`FORGE_SYSTEM.md`](FORGE_SYSTEM.md), [`../data/TECHNIQUES_DATA.md`](../data/TECHNIQUES_DATA.md) и [`../RESOURCE_TRANSFORMATION_MAP.md`](../RESOURCE_TRANSFORMATION_MAP.md) — дополняет их целевой моделью и фазами внедрения.

**Каталог `materialId`, единый склад и модель обработки материалов** (источник правды по ссылкам и волнам) — **[`../MATERIALS_SINGLE_SOURCE_ROADMAP.md`](../MATERIALS_SINGLE_SOURCE_ROADMAP.md)**; этот файл не дублирует то ТЗ и остаётся про крафт, энциклопедию и этапы ковки.

**Связанные документы:** [`../PROJECT_AUDIT.md`](../PROJECT_AUDIT.md) (живой аудит), [`../P2_ARCHITECTURE_INVENTORY.md`](../P2_ARCHITECTURE_INVENTORY.md), [`../MATERIAL_SEMANTIC_PROCESS_ROLES.md`](../MATERIAL_SEMANTIC_PROCESS_ROLES.md), [`../MATERIALS_UNIFICATION_AUDIT.md`](../MATERIALS_UNIFICATION_AUDIT.md), **[`../MATERIALS_SINGLE_SOURCE_ROADMAP.md`](../MATERIALS_SINGLE_SOURCE_ROADMAP.md)** — целевая единая модель каталога, склада и **техник обработки** (операции, без `line_key` на материале; финал без legacy-мостов). **Крафтовая линия** (порядок техник, этапы/микроэтапы, доли времени, цвета, сообщения из микрозадач): **[`../ENCYCLOPEDIA_MATERIALS_TECHNIQUES_ROADMAP.md`](../ENCYCLOPEDIA_MATERIALS_TECHNIQUES_ROADMAP.md) §12**; микромодель шагов — тот же документ **§10**.

---

## Сводка: сделано и осталось (актуально на 2026-04-02)

| Сделано | Осталось |
|--------|-----------|
| Фазы **§5 A–E** (MVP) по чеклисту ниже | **§1 п.3** — дальнейшее наполнение каталога техник (следующие цепочки по [`RESOURCE_TRANSFORMATION_MAP`](../RESOURCE_TRANSFORMATION_MAP.md); в коде уже дерево/камень: `forge_basic_wood_planks`, `forge_basic_stone_blocks`, `study_masonry_sketch`) |
| **§6.1–6.6**, **6.10–6.12**, **§6.13** (ядро + UX энциклопедии) | Полная **«полнота»** §1 п.3 по всем цепочкам — по мере контент-проходов |
| **§2.4** — `forecastExpertiseFactorExtra` в [`material-expertise-milestone-registry.ts`](../../src/data/material-expertise-milestone-registry.ts) суммируется в прогнозе поверх `FORECAST_EXPERTISE_MILESTONE_*` ([`FORMULAS.md`](../utils/FORMULAS.md)) | Доп. перки только из реестра без дублирования текста UI |
| **6.7** — мост заказов + единая оценка в золоте: [`order-material-cost-gold.ts`](../../src/lib/store-utils/order-material-cost-gold.ts); [`calculateMaterialCostForOrder`](../../src/lib/store-utils/order-achievable-utils.ts) / аванс через `getCraftingCost` → тот же хелпер | Редкие генерации вне общего контура — по мере обнаружения |
| **6.8** — [`GameMessagesDock`](../../src/components/layout/game-messages-dock.tsx): навигация по `navigationTarget`, на **md+** сворачивание панели вправо; [`game-layout.tsx`](../../src/components/layout/game-layout.tsx): `min-h-0` / flex | — |
| **§7:** [`PartMaterialProcessingPanel`](../../src/components/forge/craft-v2/planner/PartMaterialProcessingPanel.tsx) — цепочка этапов + расход по рецепту переработки, копирайт под плавку/дерево/камень; лишние тики `tickMaterialStudyProgress` без активных сессий не трогают store | При необходимости — ещё пороги/дедуп ленты |
| **UX кузницы:** сетка инвентаря + карточки оружия ([`inventory-section`](../../src/components/forge/inventory-section.tsx), [`weapon-inventory-card`](../../src/components/forge/weapon-inventory-card.tsx)) | **P2-Save-01** — при появлении новых persist/облако полей: миграции Turso/API по чеклисту [`cloud-save-feature.ts`](../../src/lib/cloud-save-feature.ts) |
| Чеклист расширений в [`cloud-save-feature.ts`](../../src/lib/cloud-save-feature.ts); в этой итерации новых полей persist не добавлялось | |

Ниже — **чеклист** и таблица **«Следующие приоритеты»** с файлами.

---

## Фаза 4.1 — контракт «план → этапы» (синхрон с MATERIALS_SINGLE_SOURCE_ROADMAP §7)

Черновик типов без полного UI таймлайна: [`src/types/craft/timeline-plan-contract.ts`](../../src/types/craft/timeline-plan-contract.ts) (`CraftTimelineStageRef`, `CraftTimelinePlanDraft`), тест [`timeline-plan-contract.test.ts`](../../src/types/craft/timeline-plan-contract.test.ts). **4.2–4.3 (MVP):** чистые функции в [`timeline-composition.ts`](../../src/lib/craft/timeline-composition.ts) + Vitest [`timeline-composition.test.ts`](../../src/lib/craft/timeline-composition.test.ts); полный перенос — в [`process-generator.ts`](../../src/lib/craft/process-generator.ts).

### Крафтовая линия (UI и порядок техник)

**Термин:** **Крафтовая линия** ([`ENCYCLOPEDIA_MATERIALS_TECHNIQUES_ROADMAP.md`](../ENCYCLOPEDIA_MATERIALS_TECHNIQUES_ROADMAP.md) **§12**) — полоса прогресса процесса: **блоки** = применяемые **техники** (цвет блока), **подсегменты** = **микрозадачи** внутри техники, ширина подсегмента ∝ доле времени в общей длительности; сообщения игроку из текущей микрозадачи. Порядок блоков: обработка материала / плавка **раньше** приёмов сборки и боевых техник ковки, если не переопределено данными (`craftLinePhase` / `craftLineOrder` — см. §12.3 того документа). Код: типы [`src/types/craft-line.ts`](../../src/types/craft-line.ts), сборка [`src/lib/craft/build-craft-line.ts`](../../src/lib/craft/build-craft-line.ts), полоса в кузне [`src/components/forge/craft-v2/craft-line-strip.tsx`](../../src/components/forge/craft-v2/craft-line-strip.tsx); сходимость с таймлайном Craft v2 и задел на ремонт, перековку и алтарь.

---

## Статус реализации (чеклист)

Сверка с репозиторием. Обновлять при закрытии задач. Легенда: **`[x]`** — есть в коде; **`[ ]`** — нет или существенно не дотянуто до цели роадмапа (уточнение рядом).

### Фазы §5

- [x] **A** — канонические `materialId` в селекторе части (`getForgePartMaterialCandidates`), `iron_alloy` / `mithril_alloy`, скрытие `iron`/`mithril` как цели части, тесты, миграция сейва v6 (см. подробнее в §5 блок «Фаза A»).
- [x] **B1** — `MIN_MATERIAL_EXPERTISE_FOR_CRAFT`, изучение в энциклопедии (`materialStudySessions`, техники из `material-study-techniques`), `gameMessages`, persist + поля в Turso, туториал → стартовые 10% на набор §6.1. **§6.3 (доп.):** слоты от суммы уровней зданий (`computeMaterialStudySlotCapacity`), ускорение рабочими, шанс неудачи при завершении, отмена с частичным прогрессом — в `encyclopedia-slice` + UI карточки.
- [x] **B2** — прирост экспертизы при завершении крафта (`craft-expertise-from-craft`, `use-craft-v2`), диалог при заборе в `CraftResult`, вехи 80/100 в прогнозе (`forecast-calculator` + константы), переключатель «только в наличии» (`onlyInStock` в планировщике). **Уточнение (React 19):** строки прироста считаются в `finalizeCompletedCraftV2` через [`buildCraftExpertiseGainRows`](../../src/lib/craft/craft-expertise-from-craft.ts); запись в store (`addMaterialExpertise`) откладывается в **`queueMicrotask`** ([`applyCraftExpertiseGainRows`](../../src/lib/craft/craft-expertise-from-craft.ts)), чтобы не вызывать Zustand внутри updater’а `setState`.
- [x] **C** — `partMaterialSupply`, реестр техник плавки, расход и проверки в `inventory-check`, UI цепочки, вклад `processingQualityDelta` в прогноз/калькулятор.
- [x] **D (MVP)** — `material-processing-techniques`, `unlockedMaterialProcessingTechniqueIds` в store/облаке, `validateMaterialProcessingPlan`, уровневая выдача техник через `planner-unlocked-techniques`.
- [x] **E (MVP)** — вставка этапов по `craftStageInsertions` в `process-generator`, `outcomeModifiers.forecastSpreadTightness` → прогноз, длительности из данных техники (`durationSeconds` / override).

### Цели §1 и §6.13 (энциклопедия ↔ крафт)

- [x] **§1 п.1–2** — стадии материалов в выборе, ворота экспертизы, рост от крафта и изучения (см. фазы A–B2).
- [ ] **§1 п.3 «полнота»** — архитектура техник + этапы + `outcomeModifiers` заложены; наполнение **полным** каталогом — по мере данных. *Итерации в коде:* плавки олово/бронза/сталь/серебро/золото + `study_quick_notes`; **дерево/камень** — `forge_basic_wood_planks`, `forge_basic_stone_blocks`, этапы `prep_forge_wood_stock` / `prep_forge_stone_blocks`, `study_masonry_sketch`; разблокировки см. [`planner-unlocked-techniques.ts`](../../src/lib/craft/planner-unlocked-techniques.ts).
- [x] **§2.4** — данные вех сверх констант прогноза: `forecastExpertiseFactorExtra` в [`material-expertise-milestone-registry.ts`](../../src/data/material-expertise-milestone-registry.ts), сумма в [`getRegistryForecastExpertiseFactorExtras`](../../src/data/material-expertise-milestone-registry.ts) → [`forecast-calculator.ts`](../../src/lib/craft/forecast-calculator.ts); правило зафиксировано в [`FORMULAS.md`](../utils/FORMULAS.md).
- [x] **§6.13 целиком (ядро + UX)** — `aggregateExpertiseImpactsForPlan`, метаданные этапов (`primaryPartId` / `primaryMaterialId` / `stageSource` / `techniqueId`), время этапов с `timeMultiplier` и софткапами, прогноз/ролл Craft v2 через агрегаты, в энциклопедии — «Мастерство» и тултипы (`encyclopedia-craft-bonus-tooltips.ts`). Деталь см. [`FORMULAS.md`](../utils/FORMULAS.md) §6.13.

### Фрагмент §6 (Q&A)

- [x] **6.1** — порог 10%, стартовый набор после туториала  
- [x] **6.2** — режимы списка материалов (известные / в наличии)  
- [x] **6.3** — слоты изучения от зданий; рабочие на изучение; риск неудачи; отмена с частичным прогрессом; при отмене — возврат **50%** расходников техники ([`material-study-refund.ts`](../../src/lib/materials/material-study-refund.ts))  
- [x] **6.4** — независимые ветки study/processing; поля совместимости в данных + валидатор плана  
- [x] **6.5** — попап прироста экспертизы; формула прироста с учётом материала/экспертизы; вехи в прогнозе  
- [x] **6.6** — выбор слиток со склада vs цепочка руда+плавка  
- [x] **6.7** — мост материала заказа ↔ легаси-шаблон и Craft v2: [`weaponMaterialTagsAlignForOrders`](../../src/lib/craft/weapon-display-meta.ts) + [`checkOrderAchievability`](../../src/lib/store-utils/order-achievable-utils.ts); [`hiddenTagsSatisfyOrderMaterial`](../../src/lib/craft/weapon-display-meta.ts) в slice/UI гильдии. *Уточнение:* оценка материалов заказа в золоте — [`order-material-cost-gold.ts`](../../src/lib/store-utils/order-material-cost-gold.ts); [`calculateMaterialCostForOrder`](../../src/lib/store-utils/order-achievable-utils.ts) и аванс используют `getCraftingCost` → тот же хелпер (согласовано с генерацией заказа и `calculateGoldReward`).  
- [x] **6.8** — глобальная панель-агрегатор сообщений в layout ([`GameMessagesDock`](../../src/components/layout/game-messages-dock.tsx) в [`game-layout`](../../src/components/layout/game-layout.tsx); навигация по `navigationTarget`; на **md+** — сворачивание вправо, остаётся кнопка «Развернуть»; у основной колонки контента — `min-h-0` в flex-цепочке, чтобы экраны не теряли высоту)  
- [x] **6.10–6.12** — семантика стадий; расход при изучении; этапы техник в процессе и модификаторы итога  

### Документация

- [x] Перенос финальных формул §6.13 и софткапов в [`FORMULAS.md`](../utils/FORMULAS.md)  
- [x] Краткая отсылка из [`FORGE_SYSTEM.md`](FORGE_SYSTEM.md) на §6.13 после внедрения в код  

### Следующие приоритеты работ (бэклог, синхронизация с планом)

| Приоритет | Фокус |
|-----------|--------|
| **A–E** | Закрыто в одной итерации (2026-04-02): контент §1 п.3 — итерация плавок + study; §2.4 — реестр в прогнозе + `FORMULAS.md`; §6.7 — `order-material-cost-gold`; §7 — UI/сообщения/возврат 50%; P2 — чеклист `cloud-save-feature`. **Далее:** следующие цепочки §1 п.3; миграции Turso при новых полях сейва. **Доп. (та же дата):** §1 п.3 — дерево/камень; §6.7 хвост — аванс/`calculateMaterialCostForOrder`; §7 — дерево шагов в панели обработки; P2 — без новых полей persist. |

---

## 1. Цель

Выстроить крафт так, чтобы:

1. **В оружии учитываются реальные стадии материалов** — для металлического лезвия выбирается не абстрактное «железо», а конкретный канонический каталожный материал **готовой к ковке стадии** (например железный слиток / `iron_alloy` и т.д. по карте преобразований), согласованный с [`RESOURCE_TRANSFORMATION_MAP.md`](../RESOURCE_TRANSFORMATION_MAP.md) и `inventory-check`.

2. **Универсальные формы рецептов** допускали **любой подходящий материал** при условиях: материал **соответствует роли части**, **экспертиза не ниже порога** (стартово **10%**), материал **доступен** в инвентаре. **Первые проценты экспертизы не выдаются «просто так»:** с **неизвестным** материалом в крафте работать нельзя — сначала нужно **изучить** его (модуль энциклопедии, см. §2.1). После открытия порога экспертиза продолжает **расти от использования** в крафте (с убывающей отдачей на высоких уровнях) и от **продолжительного изучения** в энциклопедии (см. §2.1–2.4).

3. **Техники обработки** стали отдельным расширяемым слоем: выбор «целевого» материала части может **раскрывать цепочку** «сырьё + техника → промежуточный/целевой материал»; целевая стадия части достигается **именно обработкой по технике**, а не «магическим» присвоением сырья части (§6.10). Техника может **добавлять этапы и время** в экран **«Крафт в процессе»** и (в данных) **влиять на итоговые характеристики оружия** — для базовых техник модификаторы могут быть нулевыми, но поле в архитектуре закладывается сразу (§6.12).

---

## 2. Термины (целевая модель)

| Термин | Смысл |
|--------|--------|
| **Форма оружия** | Рецепт v2 в `allRecipes`: части, этапы, без «железный меч» в id. |
| **Роль части** | Семейство допустимых материалов для части (металл слитка, дерево обработанное, камень блока и т.д.) — опирается на каталог и семантику процессов. |
| **Стадия материала** | Сырьевая / промежуточная / готовая к данной операции — явные `materialId` из библиотеки, не `ResourceKey` «схлопывание без ведома игрока». |
| **Техника** | Правило преобразования: входы (материалы + при необходимости топливо/инструмент), выход, время/риск, требования разблокировки; опционально **вклад в процесс крафта** (этапы + длительности для UI «Крафт в процессе») и **модификаторы итога** оружия (могут быть пустыми у базовых техник). |
| **Цепочка выбора** | Для части: выбранный **целевой** материал → ноль или больше **шагов** «как получить» (техники) → фактический расход **сырья** в блоке материалов и в калькуляторе. |
| **Экспертиза** | Число 0–100 в `materialKnowledge` ([`MaterialKnowledge`](../../src/types/materials/knowledge.ts)); порог допуска в крафте (например **10%**). Источники роста — §2.1. |
| **Изучение (энциклопедия)** | Отдельный игровой процесс: не мгновенный «бафф», а **запуск** одной или нескольких **техник изучения** материала на время с периодическим или итоговым начислением экспертизы. |
| **Техника изучения** | Подтип/категория в реестре техник (или отдельная таблица): длительность, стоимость (время/ресурсы/внимание), ожидаемый прирост экспертизы, требования разблокировки. Не путать с техниками **обработки** для цепочки «руда → слиток». |

### 2.1 Экспертиза: двухконтурная прогрессия

**Текущее состояние кода:** экспертиза отображается в энциклопедии ([`encyclopedia-screen`](../../src/components/screens/encyclopedia-screen.tsx)); прирост от завершённого крафта — фаза **B2** ([`craft-expertise-from-craft`](../../src/lib/craft/craft-expertise-from-craft.ts), отложенное начисление в store из [`use-craft-v2`](../../src/hooks/use-craft-v2.ts)). **§6.13 закрыт в Craft v2:** агрегаты [`aggregateExpertiseImpactsForPlan`](../../src/lib/craft/aggregate-expertise-impact.ts) → [`calculator.ts`](../../src/lib/craft/calculator.ts) (`calculateForecast` / `calculateWeapon`), [`forecast-calculator.ts`](../../src/lib/craft/forecast-calculator.ts), время этапов в [`process-generator.ts`](../../src/lib/craft/process-generator.ts); см. чеклист в начале документа и [`FORMULAS.md`](../utils/FORMULAS.md) §6.13. Превью материала в [`material-preview`](../../src/lib/craft/material-preview.ts) — отдельная упрощённая модель, не обязана дублировать §6.13.

**Целевая модель — два источника роста:**

1. **Использование материала в крафте** — после того как материал **допущен** в работу (≥ порога изучения), каждое значимое применение (завершённый крафт с участием `materialId` в частях) даёт небольшой прирост экспертизы.
2. **Изучение через энциклопедию** — основной способ **первого открытия** и способ **продвигать высокие проценты**, когда крафт уже «кормит» слабо.

**Ворота крафта:** до **10%** (или иного `MIN_MATERIAL_EXPERTISE_FOR_CRAFT`) материал в планировщике **недоступен**, пока игрок не прошёл минимальное изучение (энциклопедия). **Стартовый набор базовых материалов** (см. §6.1) получает первые **10% не при создании сейва**, а **через шаги туториала**, который ведёт в изучение/энциклопедию.

### 2.2 Сценарий: изучение в энциклопедии

Игромеханика (как ты описал), для спецификации UI и store:

1. Игрок открывает **энциклопедию**, находит материал (в т.ч. с **0%** экспертизы).
2. Кнопка **«Изучить»** → выбор одной или нескольких **техник изучения** материала (разная длительность, стоимость, эффективность; разблокировки как у обычных техник в будущем).
3. Запускается **растянутый во времени процесс** (**число параллельных сессий** от **уровня зданий**, §6.3; **ускорение рабочими**; **расход материалов** по данным техники, §6.11; офлайн-тики — фаза B1): по ходу и по завершении сессии — **лента сообщений** (аналог этапов крафта / событий экспедиций), возможны **неудача** и **частичный прогресс** при отмене (§6.3, §6.11).
4. Процесс **доступен на любом уровне** экспертизы: и на 0%, и на 90% — чтобы не застревать на плато после ослабления прироста от крафта.

### 2.3 Убывающая отдача от крафта

- На **низких** и **средних** уровнях экспертиза от крафта ощутима.
- После условного порога (например **~80%**) прирост **за один крафт** становится **очень маленьким** (кривая с общим cap 100%).
- **Изучение в энциклопедии** остаётся **основным** способом дожимать последние проценты и стабильно расти без спама крафтом.

Точная формула (логарифм, кусочно-линейная, таблица) — баланс фазы B2; задокументировать в [`FORMULAS.md`](../utils/FORMULAS.md) после фиксации.

### 2.4 Вехи 80% и 100%

На насыщенных уровнях — не только цифра, но и **содержание**:

| Веха | Назначение (концепт) |
|------|----------------------|
| **80%** | Первый заметный **бонус мастерства**: например снижение дисперсии прогноза, малый бонус к вкладу в характеристики, скидка времени на этапах с этим материалом — конкретика на балансе. |
| **100%** | **Особый эффект** или **раскрытие скрытого свойства** материала (уникальный модификатор, доступ к продвинутой технике только для «мастера материала», косметика имени/тега — на выбор дизайна). |

Вехи должны быть **явно описаны в данных** материала или в глобальной таблице «perks expertise», чтобы контент не разъезжался.

### 2.5 Архитектура модуля (черновик)

- **Store:** активные/завершённые сессии изучения (`materialId`, выбранные `studyTechniqueIds`, `startTime`, `endTime`, начисления); не смешивать с `activeRefining` без нужды — возможен отдельный slice или поле в `encyclopedia`/craft cross-slice.
- **Тики:** game loop или расчёт при открытии экрана энциклопедии (`Date.now` − `startTime`), аналогично переработке.
- **Персист / облако:** расширение сейва при появлении очереди изучения — чеклист [`cloud-save-feature`](../../src/lib/cloud-save-feature.ts).
- **Связь с техниками:** общий реестр с полем `kind: 'processing' | 'study' | ...` или два реестра с единым `unlockTechnique`.

---

## 3. Пользовательский сценарий (MVP техник)

**Пример: лезвие из железных слитков.**

1. Игрок в планировщике выбирает для лезвия материал **железный слиток** (каталожный id, не абстрактное «Fe»).
2. Справа появляется блок **«Как получить слиток»**: хотя бы одна **базовая техника** (например «простая плавка из железной руды»), включается **галочкой**.
3. После включения в секции **«Материалы»** для этой части отображаются уже **железная руда** (`iron_ore` или канон по карте узлов) и **уголь** (и прочие входы техники — по данным техники), а не слиток как прямой расход — либо смешанная модель «слиток со склада ИЛИ путь через руду», в зависимости от принятого в фазе C правила **замещения** (см. §6).
4. В **«Крафт в процессе»** в общий таймлайн этапов **подмешиваются этапы, порождённые выбранными техниками** (имя, порядок, длительность — из данных техники/`process-generator`), чтобы было видно, что кузнец реально выполняет эту обработку. **Прогноз характеристик** учитывает **опциональные модификаторы техник** (у простой плавки — нейтрально, у продвинутых — отличия).

Тот же паттерн распространяется на другие части и материалы, у которых есть техника подготовки.

---

## 4. Архитектура (задел на расширение)

Ниже — целевая схема модулей; внедрение по фазам может временно сосуществовать с текущим `CraftPlan` / `MaterialAssignment`.

### 4.1 Данные

- **Реестр техник** (`techniqueId`, `kind: 'processing' | 'study' | …`, `inputs[]`, `outputs[]`, `fuel`, `skillGates`, `unlocksFrom` — shop | quest | expedition | dungeon | level).
- **Вклад в процесс крафта (processing):** у техники — описание **этапов** (идентификаторы/ярлыки для UI, **длительность** или множитель к базовому времени, порядок относительно этапов формы оружия). Генератор процесса (`process-generator` и потребители) **склеивает** этапы рецепта и этапы всех выбранных техник цепочки в один таймлайн для **«Крафт в процессе»**.
- **Влияние на итог оружия (processing, опционально):** структура в данных, например `outcomeModifiers` — ссылки на типы модификаторов прогноза/калькулятора (дисперсия, смещение атрибутов, теги «качества» и т.д.). Для **базовых** техник поле **пустое или нейтральное**, чтобы не менять баланс до контента; тип и мерж правил — одна функция в [`forecast-calculator`](../../src/lib/craft/forecast-calculator.ts) / калькуляторе (фаза E).
- **Совместимость техник (данные):** у записи техники — опционально `complementsTechniqueIds[]`, `incompatibleWithTechniqueIds[]` (или эквивалент по тегам); валидатор плана объединяет граф (§6.4).
- **Привязка материала к допустимым техникам** «достроить до части» — либо обратный индекс «техника X даёт материал Y», либо у материала поле `defaultAcquisitionTechniques[]`.
- **Роли частей рецепта** — эволюция от `materialTypes: ['metal', 'alloy']` к явным **семействам / стадиям**; сырьё только как вход цепочки, не как финальный материал части без обработки (§6.10, [`MATERIAL_SEMANTIC_PROCESS_ROLES.md`](../MATERIAL_SEMANTIC_PROCESS_ROLES.md)).

### 4.2 Состояние плана крафта

Расширение плана (концептуально):

- `materials[partId]`: выбранный **целевой** `materialId`.
- `acquisition[partId]`: для каждого шага — выбранная `techniqueId` + флаг активности; опционально дерево, если техник несколько.
- Сериализация в `craftV2Persisted` / сейв — версионирование (`STORE_VERSION` / поле `planVersion` при необходимости).

### 4.3 Расчёт стоимости и проверки

- **`inventory-check` / `getCraftingCost`**: разворачивать цепочку до **листьев** (руда, уголь, …) или учитывать уже готовый слиток на складе — политика фазы C.
- **Прогноз и результат:** агрегировать **outcomeModifiers** всех выбранных техник обработки в крафте (§4.1, §6.12 п. 20) до применения к калькулятору.
- **Экспертиза**: фильтр кандидатов в UI и валидация перед стартом крафта; начисления от крафта и от изучения (§2).
- **Совместимость** с заказами и `hiddenTags`: материал боевой части по-прежнему должен маппиться на «iron / steel / …» для NPC (существующие мосты в [`weapon-recipes` / калькулятор](../../src/data/weapon-recipes.ts)).

### 4.4 UI

- Компонент выбора материала части → при фокусе/выборе подгружает **доступные техники** для достижения выбранного материала.
- Блок «Материалы» агрегирует **развёрнутые** требования + опционально показывает «свежее дерево» зависимостей (сколько руды уйдёт после выбранных техник).
- Экран **«Крафт в процессе»**: список этапов строится из **базы рецепта** плюс **этапы выбранных техник обработки** (лейбл, прогресс, время); при смене техник в плане до старта — пересчёт таймлайна и общего времени.

### 4.5 Источники разблокировки техник (будущее)

Один реестр; разные модули только **выдают** `unlockTechnique(id)`:

- магазин, награды квестов NPC, экспедиции, подземелья, уровень кузнеца.

---

## 5. Фазы разработки

### 5.1 Рекомендуемый порядок и промежуточное видение

Чтобы **без разрыва** дойти до целевого вида из §1–§4 и §6:

| Шаг | Фазы | Что появляется у игрока |
|-----|------|-------------------------|
| 1 | **A** | Только «правильные» стадии `materialId` в селекторе части; сырьё не финал части (§6.10). |
| 2 | **B1** | Ворота по экспертизе, изучение в энциклопедии, туториал → 10% на набор §6.1; слоты/рабочие/риск/сообщения — по мере готовности внутри B1 (можно итерациями). Глобальная лента `gameMessages` / §6.8 — см. чеклист и [`game-messages-dock.tsx`](../../src/components/layout/game-messages-dock.tsx). |
| 3 | **B2** | Рост экспертизы от крафта, вехи, переключатель списка материалов (§6.2), попап при заборе о приросте экспертизы (§6.5 п. 11). |
| 4 | **C** | Первая цепочка «слиток ← руда + техника» или слиток со склада (§6.6); план и списание согласованы. **До E** техника в крафте может давать только **логистику расхода**; этапы в «Крафт в процессе» и `outcomeModifiers` — в E (§6.12). |
| 5 | **D** | Полноценный реестр, разблокировки, **валидатор совместимости** техник по данным (§6.4 п. 10 — формально закрывается здесь, не в C). |
| 6 | **E** | Таймлайн техник в UI процесса + слияние модификаторов с прогнозом/результатом; баланс этапов. |

**После последней итерации:** **§6.8** считать **реализованным** в layout — [`GameMessagesDock`](../../src/components/layout/game-messages-dock.tsx), [`game-layout.tsx`](../../src/components/layout/game-layout.tsx) (навигация по `navigationTarget`; на десктопе — **свёрнутая** полоса с кнопкой развёртывания). **Кожа / `raw_leather`:** выбор в планировщике для роли `leather` уже покрыт кандидатами — [`forge-part-material-candidates.ts`](../../src/lib/materials/forge-part-material-candidates.ts), тест [`forge-part-material-candidates.test.ts`](../../src/lib/materials/forge-part-material-candidates.test.ts); отдельная задача сводится к **контенту форм/заказов**, если нужны явные слоты кожи в рецептах. **Заказы §6.7:** мост в [`weapon-display-meta.ts`](../../src/lib/craft/weapon-display-meta.ts) — `hiddenTagsSatisfyOrderMaterial`, **`weaponMaterialTagsAlignForOrders`** (в т.ч. `iron` ≡ `iron_alloy`) и использование в [`checkOrderAchievability`](../../src/lib/store-utils/order-achievable-utils.ts) + UI гильдии; **полный модуль** — см. бэклог приоритет **C** (награды/план v2).

**Пересечения:** ролевые правила в B2 и семантика стадий в A — не дублировать: A задаёт **кого показывать в селекторе цели**, B2 — **экспертиза + пул**. Несколько техник на один материал (§7 п. 1) уточняется после первой цепочки (C), не блокирует A–B1.

**Трекинг в бэклоге:** идентификаторы **P2-CraftRm-A** … **P2-CraftRm-E** и **P2-CraftRm-X** (отложенное) — таблица в [`P2_ARCHITECTURE_INVENTORY.md`](../P2_ARCHITECTURE_INVENTORY.md), раздел «Крафт и типы».

### Фаза A — Канон стадий в селекторе материала

**Цель:** убрать из UX выбора части абстрактные ключи вроде «железо»; везде **конкретные `materialId`** нужной стадии (слиток / плита / доска и т.д.).

**Работы (ориентир):**

- Аудит: какие `materialId` сейчас попадают в список выбора для `blade` и других частей; сверка с [`RESOURCE_TRANSFORMATION_MAP.md`](../RESOURCE_TRANSFORMATION_MAP.md).
- Обновление фильтров в хуке/планировщике и в данных рецептов (`materialTypes` / допустимые категории).
- Тесты: крафт «только слиток», отсутствие «iron» как материала части при несогласованности с каталогом.

**Критерий готовности:** для базовых форм меча лезвие выбирается из **металлов/сплавов каталожной стадии слитка**, согласованной с переработкой.

**Прогресс (итерация к P2-CraftRm-A):**

- Селектор части: [`getForgePartMaterialCandidates`](../../src/lib/materials/forge-part-material-candidates.ts) (пересечение класса рецепта и фасетов `weapon_craft_v2`); в UI — [`PartMaterialSelector`](../../src/components/forge/craft-v2/planner/PartMaterialSelector.tsx). Руды и материалы без роли в кузне **не попадают** в список (в т.ч. за счёт пустого вклада у руд в `weapon_craft_v2`).
- Каталожные узлы **железный / мифриловый слиток**: [`iron_alloy`](../../src/data/materials/library/metals/iron_alloy.ts), [`mithril_alloy`](../../src/data/materials/library/metals/mithril_alloy.ts); абстрактные [`iron`](../../src/data/materials/library/metals/iron.ts) / [`mithril`](../../src/data/materials/library/metals/mithril.ts) в **целевом** выборе части скрыты (оверрайд `weapon_craft_v2: { facets: [] }` в [`material-process-overrides.ts`](../../src/data/materials/material-process-overrides.ts)).
- Явный оверрайд с **пустым** `facets` поддерживается в [`getMaterialProcessContribution`](../../src/lib/materials/material-process-contribution.ts) (раньше пустой массив игнорировался).
- Миграция сейвов **v5→v6**: `iron`→`iron_alloy`, `mithril`→`mithril_alloy` в плане/активном крафте/инвентаре оружия ([`forge-material-migrate.ts`](../../src/lib/craft/forge-material-migrate.ts), [`game-store-composed.ts`](../../src/store/game-store-composed.ts)); облачная нормализация — [`save-craft-normalize.ts`](../../src/lib/save-craft-normalize.ts).
- Тесты: [`forge-part-material-candidates.test.ts`](../../src/lib/materials/forge-part-material-candidates.test.ts), [`forge-material-migrate.test.ts`](../../src/lib/craft/forge-material-migrate.test.ts).

**Остаток по фазе A:** расширение контента (камень/самоцветы) — точечные оверрайды по мере рецептов; селектор учитывает категории `gem` / `stone` через классы каталога в [`getForgePartMaterialCandidates`](../../src/lib/materials/forge-part-material-candidates.ts). Базовые `*_alloy` сверять с [`inventory-check`](../../src/lib/craft/inventory-check.ts) при расширении каталога.

---

### Фаза B1 — Экспертиза: энкциклопедия и ворота крафта

**Цель:** материал с экспертизой **ниже** порога крафта не попадает в планировщик; **первый** выход на порог — через **изучение** в энциклопедии (таймеры, техники изучения).

**Работы:**

- Данные: минимум одна–две **техники изучения** (длительность, прирост, **стоимость материалов**, риск/сообщения — §6).
- UI энциклопедии: карточка материала → **«Изучить»** → выбор техники → активное изучение, **лента хода**, привязка к **слотам от зданий** и опционально **рабочим** (§6.3).
- Store + тики начисления; миграция сейва при необходимости; заготовка **публикации сообщений** для будущего глобального чата (§6.8).
- Константа `MIN_MATERIAL_EXPERTISE_FOR_CRAFT` (например 10) и единая проверка «можно ли выбрать материал в части».
- Туториал: выдача стартовых **10%** на набор §6.1 **после** шагов обучения, не на пустом сейве.

**Прогресс (итерация B1):**

- Константа и ворота: `MIN_MATERIAL_EXPERTISE_FOR_CRAFT`, [`isMaterialUnlockedForForge` / `filterForgeExpertiseMaterials`](../../src/lib/craft/material-forge-access.ts); селектор части [`PartMaterialSelector`](../../src/components/forge/craft-v2/planner/PartMaterialSelector.tsx); проверки [`craft-planner`](../../src/components/forge/craft-v2/craft-planner.tsx) и [`use-craft-v2`](../../src/hooks/use-craft-v2.ts) при старте крафта.
- Пустая стартовая энциклопедия [`initialEncyclopediaState`](../../src/store/slices/encyclopedia-slice.ts); открытие из склада через [`createDiscoveredMaterialKnowledge`](../../src/types/materials/knowledge.ts) с **1%** (кузня всё ещё требует ≥ порога).
- Техники и данные: [`material-study-techniques.ts`](../../src/data/material-study-techniques.ts), типы [`material-study.ts`](../../src/types/material-study.ts), сообщения [`game-message.ts`](../../src/types/game-message.ts).
- Store: `materialStudySessions`, `gameMessages`, тик [`flushCompletedMaterialStudies`](../../src/store/slices/encyclopedia-slice.ts); persist **v7** + `tutorial.starterForgeExpertiseGranted`, [`mergeCraftRoadmapStarterKnowledge`](../../src/lib/materials/craft-roadmap-starter-knowledge.ts) после шагов `crafting` / `final`, пропуска или завершения туториала.
- UI: «Изучить» на [`material-card`](../../src/components/encyclopedia/material-card.tsx), лента на [`encyclopedia-screen`](../../src/components/screens/encyclopedia-screen.tsx).
- Облако (Turso): `materialStudySessions`, `gameMessages` в payload / API / колонках `GameSave` ([`use-cloud-save`](../../src/hooks/use-cloud-save.ts), [`save-payload-schema`](../../src/lib/save-payload-schema.ts), [`db.ensureGameSavesColumns`](../../src/lib/db.ts)); слияние в `applyLoadedData` с безопасными дефолтами для старых сейвов.
- Тесты: [`material-forge-access.test.ts`](../../src/lib/craft/material-forge-access.test.ts), [`craft-roadmap-starter-knowledge.test.ts`](../../src/lib/materials/craft-roadmap-starter-knowledge.test.ts), [`material-study-chain.test.ts`](../../src/store/material-study-chain.test.ts).

**Критерий готовности:** с 0% игрок может довести материал до ≥ порога только через изучение; после этого материал доступен в селекторе части (при прочих условиях фазы B2).

---

### Фаза B2 — Рост от крафта, убывание на высоких %, вехи 80/100, универсальный пул

**Цель:** экспертиза **растёт при использовании** материала в завершённом крафте; на высоких уровнях прирост от крафта **падает**; **энциклопедия** остаётся релевантной; на **80%** и **100%** выдаются **бонусы/эффекты** (данные + отображение в прогнозе/инвентаре).

**Работы:**

- Хук в завершение крафта (cross-slice / `use-craft-v2` / composed store): `addMaterialExpertiseDelta(materialId, delta)` с кривой убывания от текущего уровня; формула опирается на **теги/свойства материалов** и экспертизу, не на один множитель (§6.5).
- **Модальное окно при заборе готового оружия:** сводка прироста экспертизы по использованным `materialId` (§6.5).
- Таблица или поля в данных для **вех 80/100** и **глобальных долгосрочных бонусов** за мастерство (§6.5); **>100%** — заглушка; интеграция с [`forecast-calculator`](../../src/lib/craft/forecast-calculator.ts) / превью при необходимости.
- Единая функция «разрешённые материалы для части» = пересечение роли части, **экспертиза ≥ порога**; **UI-переключатель:** все пригодные из известных vs только **в наличии** (§6.2).
- Постепенная замена жёстких списков в рецептах на **ролевые** правила.

**Критерий готовности:** новый материал в каталоге после изучения и с ростом от крафта стабильно участвует в мете прогноза; вехи 80/100 дают измеримый эффект в UI или расчёте.

**Прогресс (итерация B2 MVP):**

- Прирост экспертизы при завершении крафта: [`computeCraftExpertiseGainDelta`](../../src/lib/craft/craft-expertise-from-craft.ts), [`buildCraftExpertiseGainRows`](../../src/lib/craft/craft-expertise-from-craft.ts) + отложенное [`applyCraftExpertiseGainRows`](../../src/lib/craft/craft-expertise-from-craft.ts) из [`use-craft-v2`](../../src/hooks/use-craft-v2.ts) (`finalizeCompletedCraftV2`); для внешних сценариев по-прежнему [`applyCraftExpertiseFromCompletedPlan`](../../src/lib/craft/craft-expertise-from-craft.ts); unit-тесты [`craft-expertise-from-craft.test.ts`](../../src/lib/craft/craft-expertise-from-craft.test.ts).
- UI при заборе: [`CraftResult`](../../src/components/forge/craft-v2/craft-result.tsx) (диалог со сводкой), данные из `lastCraftExpertiseGains` в состоянии хука.
- Вехи 80/100 в прогнозе: доп. множитель к `expertiseFactor` в [`forecast-calculator`](../../src/lib/craft/forecast-calculator.ts); константы [`store-utils/constants`](../../src/lib/store-utils/constants.ts) (`MATERIAL_EXPERTISE_MILESTONE_*`, `FORECAST_EXPERTISE_MILESTONE_*`); подсказка в [`WeaponForecastPanel`](../../src/components/forge/craft-v2/planner/WeaponForecastPanel.tsx).
- Переключатель «только в наличии»: [`craft-planner`](../../src/components/forge/craft-v2/craft-planner.tsx) → `onlyInStock` в [`PartMaterialSelector`](../../src/components/forge/craft-v2/planner/PartMaterialSelector.tsx).

---

### Фаза C — MVP техник получения материала (одна базовая цепочка)

**Цель:** реализовать сценарий §3 end-to-end для **минимум одной** связки (например слиток ← руда + базовая плавка).

**Работы:**

- Модель данных техники + связь «выбранный слиток → техника плавки → входы».
- UI: блок справа, галочка, пересчёт блока «Материалы».
- Интеграция с `getCraftingCost` / списанием; **явный выбор игрока:** слиток со склада **или** цепочка «руда → плавка» (§6.6).
- Обновление `CraftPlan` и персиста (миграция при необходимости).

**Критерий готовности:** игрок может выбрать слиток, включить базовую технику и увидеть расход руды и угля в плане; старт крафта валидируется.

**Прогресс (итерация C MVP):**

- Типы: `PartMaterialSupplyMode`, `PartMaterialSupplyEntry`, поле **`partMaterialSupply`** в `CraftPlan` — [`craft-v2.ts`](../../src/types/craft-v2.ts).
- Реестр техник плавки и фильтр разблокировок: [`material-processing-techniques.ts`](../../src/data/material-processing-techniques.ts); этап вставки в процесс: [`prep_forge_ore_smelting`](../../src/data/stages/preparation.ts).
- Расход и проверка запасов: [`inventory-check.ts`](../../src/lib/craft/inventory-check.ts) (`calculatePartRawResources`, `getCraftingCost`, `checkInventoryForCraft`); таймлайн: [`process-generator.ts`](../../src/lib/craft/process-generator.ts).
- UI планировщика: переключатель «из руды» и выбор техники (при нескольких) — [`craft-planner.tsx`](../../src/components/forge/craft-v2/craft-planner.tsx); хук и контейнер передают supply в превью/старт — [`use-craft-v2.ts`](../../src/hooks/use-craft-v2.ts), [`craft-container.tsx`](../../src/components/forge/craft-v2/craft-container.tsx).
- Полиш UX: панель плавки справа на широком экране, на мобильных — нижняя шторка по кнопке «Техника плавки (горн)» — [`PartMaterialProcessingPanel.tsx`](../../src/components/forge/craft-v2/planner/PartMaterialProcessingPanel.tsx) + [`craft-planner.tsx`](../../src/components/forge/craft-v2/craft-planner.tsx).
- Калькулятор: малый **`processingQualityDelta`** в [`calculator.ts`](../../src/lib/craft/calculator.ts) / прогноз.

---

### Фаза D — Реестр техник и разблокировки

**Цель:** много техник, разные источники получения, без хардкода в UI.

**Работы:**

- Файл(ы) данных техник + типы в `src/types`.
- `unlockedTechniques` / покупка / награда (минимум магазин + заглушка под квест/экспедицию).
- Документация для контент-мейкеров: как добавить технику и привязать к материалу.

**Критерий готовности:** новая техника добавляется данными и появляется после разблокировки, без правки планировщика вручную.

**Прогресс (MVP):** реестр **processing** — [`material-processing-techniques.ts`](../../src/data/material-processing-techniques.ts). Источник разблокировок: **`unlockedMaterialProcessingTechniqueIds`** в store ([`craft-slice.ts`](../../src/store/slices/craft-slice.ts)), персист **STORE_VERSION 8**, облако — колонка **`unlockedMaterialProcessingTechniqueIds`** (Turso + [`use-cloud-save.ts`](../../src/hooks/use-cloud-save.ts)); плюс уровень ≥ 5 даёт **`forge_fine_iron_smelt`** — [`planner-unlocked-techniques.ts`](../../src/lib/craft/planner-unlocked-techniques.ts). Совместимость плана — **`validateMaterialProcessingPlan`** (планировщик, контейнер, `startCraft`). Отдельный магазин наград за id техник — опционально.

---

### Фаза E — Связка с этапами процесса крафта и баланс

**Цель:** выбранные техники **не только расходуют сырьё**, но и **встраиваются в процесс**: дополнительные **этапы и время** в UI **«Крафт в процессе»** и (по данным) **модификаторы итоговых характеристик**; согласование с будущим «много техник на одну стадию».

**Работы:**

- Маппинг technique → **фрагменты таймлайна** (этапы + длительности) для `process-generator` и активного крафта.
- Маппинг technique → **outcomeModifiers** (может быть нулевым для базовых техник); единая точка слияния с прогнозом/калькулятором.
- Баланс топлива, времени, экспертизы, риска по этапам техник.
- Обновление [`FORGE_SYSTEM.md`](FORGE_SYSTEM.md) и калькулятора в docs при стабилизации.

**Критерий готовности:** включённая техника **видна** в «Крафт в процессе»; смена техники на контенте с непустыми `outcomeModifiers` **изменяет** прогноз/результат в пределах задокументированных формул.

**Прогресс (MVP):** вставка этапов из **`craftStageInsertions`** и/или **`processingOperations[].stageTypeHint`** (общий сборщик в [`process-generator.ts`](../../src/lib/craft/process-generator.ts), без дубля по `stageType`; якорь `after prep_heating` подставляется для этапов только из операций — пилот **`forge_basic_leather_tan`** без `craftStageInsertions`); малый вклад в итоговое качество через **`processingQualityBonus`** и `processingQualityDelta` в [`calculator.ts`](../../src/lib/craft/calculator.ts); **`outcomeModifiers.forecastSpreadTightness`** влияет на прогноз (аргумент **`processingForecastSpreadTightness`** в **`calculateForecast`**); длительность — **`durationSeconds`** на операции или у записи `craftStageInsertions` → **`baseDurationOverride`**. Расширение набора модификаторов и баланс — по мере данных.

---

## 6. Зафиксированные решения по дизайну (Q&A, 2026-04-02)

Ниже — ответы по пунктам обсуждения; дополняют §2–§5 и закрывают часть старых «открытых решений».

### 6.1 Стартовая экспертиза и туториал

1. **Жёсткий глобальный порог крафта** (например **10%**) сохраняется.
2. **Первые «базовые» материалы не открыты в момент нулевого сейва:** минимальная экспертиза на ключевом наборе выдаётся **после шага(ов) туториала** (изучение в энциклопедии / сюжетная подача — деталь модуля `TUTORIAL_SYSTEM`). До этого материалы в крафте недоступны.
3. **Стартовый набор после туториала (все четыре — 10%):**

   | Назначение | Канонический `materialId` | Комментарий |
   |------------|---------------------------|-------------|
   | Железная руда | `iron_ore` | |
   | Железный слиток | `iron_alloy` | Согласовано с [`inventory-check`](../../src/lib/craft/inventory-check.ts) (`ironIngot` → stash). |
   | Дерево (самое простое/дёшево в данных) | **`birch`** | `economy.tier: 1`, `baseValue: 8` в [`birch.ts`](../../src/data/materials/library/woods/birch.ts). |
   | Кожа | `raw_leather` | Базовая кожа в [`raw_leather.ts`](../../src/data/materials/library/leathers/raw_leather.ts). В **крафте оружия пока не используется** — отдельная задача на роли частей / рецепты. |

### 6.2 UI списка материалов в крафте

4. **Переключатель отображения** (одна панель, с учётом мобильной вёрстки):

   - **«Известные, пригодные к крафту»** — материалы с экспертизой **≥ порога** и удовлетворяющие роли части (независимо от наличия на складе).
   - **«Только в наличии (и пригодные)»** — то же, но отфильтровано по stash/resources так, чтобы **можно было потратить** на план.
   - Материалы **без** достаточной экспертизы **не показывать** (не весь каталог).

### 6.3 Изучение в энциклопедии: слоты, ускорение, риск, отмена

5. **Число параллельных сессий изучения** зависит от **уровня зданий** (разные ветки — см. п. 13), не фиксированная «1 навсегда».
6. **Ускорение рабочими** — игрок может назначить работников на активное изучение (аналог ускорения производства; детали баланса — фаза B1/B2).
7. **Риск неудачи** при изучении: результат не полностью детерминирован; **лента сообщений** о ходе и итогах (по аналогии с сообщениями **этапов крафта** и **случайных событий экспедиций**). Архитектурно — общий тип «игровое сообщение» + подписка UI энциклопедии и будущего глобального чата (см. п. 17).
8. **Отмена изучения:** сохраняется **частичный прогресс**; итог зависит от уже произошедших **случайных открытий** по ходу сессии (не полный откат «как будто не начинал»).

### 6.4 Техники: обработка, изучение, совместимость

9. **Техники изучения** и **техники переработки** (плавка, прочее) — **независимые ветки** в реестре (`kind: 'study' | 'processing'` или эквивалент); общие только инфраструктура разблокировки и UX «цепочки». Для **processing** дополнительно — этапы процесса и опциональное влияние на итог оружия (§6.12).
10. **Совместимость техник** задаётся **в данных каждой техники**, а не эвристикой в коде:

    - Поля уровня **`complementsTechniqueIds[]`**, **`incompatibleWithTechniqueIds[]`** (и/или правила по тегам) — расширяемо под «одна дополняет другую» / «взаимоисключающие».
    - Валидатор плана крафта / финальный `validateCraftPlan` учитывает граф несовместимости.

### 6.5 Экспертиза от крафта, формулы, вехи

11. **При завершении оружия** и **заборе готового изделия** — **всплывающее окно**: сколько **экспертизы добавилось** по каждому `materialId`, реально участвовавшему в частях.
12. **Формулы прироста** — не один «глобальный множитель»: опора на **унифицированные свойства/теги материалов** ([`MaterialNode`](../../src/types/materials/material-core.ts)) и **текущую экспертизу** (сильнее влияние тегов/класса на низких %, и т.д. — проработка в [`FORMULAS.md`](../utils/FORMULAS.md)).
13. **Глобальные бонусы** (дополнительно к пер-материальным вехам): **100% по материалу** трактуется как **серьёзное долгосрочное достижение** — на него могут вешаться редкие перки/чат-достижения.
14. **Выше 100%** — пока **заглушка** в типах/данных (`cap` 100 в UI, опциональное скрытое поле или резерв под будущий «мастер+»).

### 6.6 Цепочка «слиток со склада vs переплавка в процессе»

15. **Игрок выбирает режим:** потратить **готовый слиток** (`iron_alloy` и т.д.) **или** включить **технику получения слитка из руды** в цепочке части (расход сырья по технике). Обе ветки валидируются по экспертизе и складу.

### 6.7 Заказы NPC

16. **Заказы остаются** в текущем виде; уточнение требований к материалам/тегам — **отдельный модуль** позже.

### 6.8 Энциклопедия и глобальный «чат» сообщений

17. **Изучение** — основной UX **внутри энциклопедии**. Долгосрочно: **правая панель проекта** — агрегатор сообщений (лог крафта, экспедиций, изучения, …) с **кликом → переход** к источнику. **Мобильная версия** — отдельная кнопка/экран чата или слой уведомлений (последующая итерация).

    **Документация для интеграции:** при появлении нового сообщения из энциклопедии (прогресс изучения, неудача, открытие) публиковать его в **единую шину событий** / store-срез `gameMessages` (имя на этапе реализации) с полями `{ id, ts, kind: 'encyclopedia' | 'craft' | 'expedition' | ..., payload, navigationTarget }`. Энциклопедия только **пишет**; layout навигатора **подписывается** и рендерит ту же запись. Детальная вёрстка чата — вне объёма текущей фазы; здесь зафиксирован контракт «одна запись — один переход».

### 6.9 Планировщик крафта (мобильность)

18. **Одна панель** на цепочку материала части; при проектировании UI — **учёт телефона** (сворачивание, нижние шиты, приоритет блока «материалы»).

### 6.10 Вопрос 15 (прояснение исходного вопроса про рецепты)

Исходный вопрос звучал так: нужно ли помимо широких `materialTypes` на части вводить **явные ограничения стадии** (чтобы, например, **`iron_ore` нельзя было выбрать как финальный материал лезвия**, только стадию слитка / готового металла).

**Ответ (зафиксировано):** да. **Целевой материал части** должен соответствовать **допустимой семантической роли / стадии** (см. [`MATERIAL_SEMANTIC_PROCESS_ROLES.md`](../MATERIAL_SEMANTIC_PROCESS_ROLES.md), фаза A roadmap). Сырьевые `materialId` допускаются **только как входы техник** в цепочке «как получить», а не как произвольная подстановка в поле «материал части» без обработки. Итог для игрока: часть **получена крафтом/обработкой** — техника отрабатывается в процессе, а не «назначается» необработанное сырьё на слот части.

### 6.11 Изучение расходует материалы

19. **Сессия изучения в энциклопедии тратит материалы** из инвентаря (стоимость в данных техники изучения). При неудаче/отмене политика возврата — отдельное правило баланса (частичный возврат опционально; по умолчанию зафиксировать вместе с п. 8).

### 6.12 Техники в крафте: характеристики оружия и этапы «Крафт в процессе»

20. **Влияние на конечные характеристики.** Выбор техники обработки — не только цепочка расхода: в данных техники предусматривается **опциональный блок модификаторов итога** (`outcomeModifiers` или эквивалент), который участвует в **прогнозе и финальном расчёте** оружия. У **базовых** техник (простая плавка и т.п.) модификаторы **нейтральны или отсутствуют**, чтобы не ломать текущий баланс; у продвинутых — осознанные отличия. Слияние нескольких техник в одном крафте — **детерминированное правило** (порядок, стек, cap — фаза E).

21. **Этапы и время в UI.** Любая включённая в план **техника обработки** добавляет в общий процесс **свои этапы** (название, порядок, длительность) так, чтобы экран **«Крафт в процессе»** отражал реальную работу кузнеца по этой технике, а не только этапы «голой» формы рецепта. Источник правды — данные техники + склейка в `process-generator` (§4.1).

### 6.13 ExpertiseImpact ↔ крафт v2: единая модель (взвешенно, этапы, софткапы)

**Проблема (текущий код):** [`calculateExpertiseImpact`](../../src/types/materials/knowledge.ts) питает только карточку энциклопедии; прогноз и ролл в [`forecast-calculator`](../../src/lib/craft/forecast-calculator.ts) / [`calculator`](../../src/lib/craft/calculator.ts) опираются на **среднюю экспертизу** и отдельные константы, без пер-материальных множителей из энциклопедии. Параметр «экономия» в UX смешивает идею **расхода** (которого в модели нет) и **стабильности исхода**.

**Целевое решение (область — только Craft v2):** для каждого материала в плане считается `ExpertiseImpact(material, expertise[materialId])`; из набора impacts строятся **взвешенные агрегаты**, которые подаются в **прогноз**, **финальный ролл** и **длительность этапов** процесса. Отображение в энциклопедии и цифры в кузнице **сходятся** (одна цепочка расчёта, разные представления).

#### Веса частей

- Вес части `w(part)` берётся из того же источника, что и прогноз: **`partWeight`** в составе `ForecastInput.materials` / эквивалент в расширенном плане (согласовать с [`forecast-calculator`](../../src/lib/craft/forecast-calculator.ts), единый расчёт в хелпере вида `buildForecastMaterialsFromPlan`).

- Нормализация: `w'_i = w_i / Σ_j w_j` по всем частям рецепта, которые участвуют в плане (вклад части с `materialId` и нулевой экспертизой допустим: impact при `expertise === 0` задаёт «нейтральный» базис или отдельное правило — зафиксировать в реализации так, чтобы не ломать отображение неизученных материалов).

#### Агрегирование полей `ExpertiseImpact`

| Тип поля | Предлагаемое правило агрегации | Софткап (принцип) |
|----------|--------------------------------|-------------------|
| Аддитивные бонусы (`qualityBonus`) | `Σ w'_i * qualityBonus_i` | Верхняя граница вкладки в очки качества прогноза — в [`FORMULAS.md`](../utils/FORMULAS.md) |
| Множители в узком диапазоне (`timeMultiplier`, `defectRiskMultiplier`, `materialMasteryEfficiency`, множитель дисперсии) | **Геометрическое среднее:** `exp(Σ w'_i * ln(M_i))` при `M_i > 0`; при необходимости fallback на `1 + Σ w'_i*(M_i-1)` на раннем прототипе | После агрегации — **clamp** отклонения от 1.0 (например время: суммарное ускорение от экспертизы не глубже **−25%** к базе этапа без учёта уровней кузнеца); для мастерства — верхний софткап эффективности вклада материала в статы |
| `predictionAccuracy` | **Взвешенное арифметическое:** `Σ w'_i * accuracy_i` | Ограничить `[50, 100]` или согласовать с текущими порогами прогноза |
| `varianceMultiplier` | Геометрическое среднее (как множители) | Согласовать с существующим `processingForecastSpreadTightness` — **мультипликативно** или через одну нормализованную «плотность разброса» |

**Итог агрегации** — объект `AggregatedExpertiseImpact` (имя на этапе кода), единая точка входа: например `aggregateExpertiseImpactsForPlan(plan, materialKnowledge | expertiseMap)` в `src/lib/craft/` рядом с прогнозом.

#### Надёжность → качество

- В энциклопедии «Надёжность» остаётся **человекочитаемым** отображением снижения риска (как сейчас: `1 - defectRiskMultiplier` в % для карточки).

- В крафте **агрегированный `defectRiskMultiplier`** влияет **на качество** прогноза и/или итогового ролла: аддитивный или мультипликативный вклад к итоговому «очку качества» / к границам ранга — **без отдельного броска «брак»** до введения такого механика. Конкретная формула — баланс + запись в `FORMULAS.md`.

#### «Мастерство» (замена «Экономии» / `materialWasteMultiplier`) — отдельная ось, без дублирования

**UX энциклопедии:** метка **«Мастерство»**; в процентах — рост **эффективности реализации материала** (сколько из «physics + processing + arcane» потенциала уходит в характеристики изделия), а не расход слитков и не узость интервала.

**Как не пересекаться с остальными показателями:**

| Показатель | Что делает | Чего **не** делает мастерство |
|------------|------------|-------------------------------|
| **Скорость** | короче этапы, где задействован материал (`timeMultiplier`) | не трогает длительность |
| **Надёжность** | меньше «штрафа» по **качеству** / риску плохого исхода (`defectRiskMultiplier`) | не заменяет вклад в очко качества тем же путём: надёжность = «не испортить», мастерство = «выжать статы из материала» |
| **Точность** | прогноз ближе к фактическому роллу (`predictionAccuracy`) | не меняет калибровку прогноза |
| **`varianceMultiplier`** | ширина интервалов статов / разброс ролла | мастерство **не** сжимает и **не** расширяет полосу; разброс остаётся этому множителю (+ техники / обработка) |

**Игровой смысл мастерства:** при прочих равных вы **лучше используете свойства именно этого материала** — усиливается **вклад материала в числовые статы** (атака/прочность/вес/ёмкость души от частей, где он участвует), обычно как **мультипликатор ≥ 1** к вкладу после расчёта «сырого» эффекта материала в прогнозе и согласованно при `rollWeaponOutcome`. База рецепта, уровень кузнеца и чисто технические outcome-модификаторы **не** умножаются этим коэффициентом (или умножаются по явному списку — зафиксировать в коде одной функцией «material-derived lines only»).

**Формула в данных:** текущее поле `materialWasteMultiplier` в [`knowledge.ts`](../../src/types/materials/knowledge.ts) **перепрофилировать**: либо переименовать в коде в `materialMasteryEfficiency` (множитель вклада), либо оставить имя до рефактора, но в комментарии и UI — только «мастерство». Пересчитать веса в формуле от свойств материала так, чтобы отражать **потенциал к «выжиманию»** (например связка `processing.workability`, `processing.purityPotential`, `physical.toughness` / однородность — не дублировать те же термы, что уже входят в `defectRiskMultiplier` и `timeMultiplier` с тем же знаком; при пересечении — ослабить коэффициент или перенести фактор в одно место).

**Агрегация по плану:** для каждой части считается мастерство материала этой части; при сборке итогового оружия вклад статов от части `p` умножается на `mastery_p` (и при необходимости нормируется), затем при multi-part — взвешенное усреднение **не глобально на всё оружие**, а **пошагово по вкладу части** (геометрическое среднее по частям недостаточно: мастерство клинка влияет на боевые линии, рукояти — на свои). Детализация по строкам breakdown в прогнозе — в [`FORMULAS.md`](../utils/FORMULAS.md).

**Опционально позже:** мастерство слегка усиливает **бонус от техники обработки**, **привязанной к той же части** (вторичный рычаг, чтобы связать цепочку «руда → слиток» с ощущением роста умения).

**Действия по коду/UI:** подпись «Экономия» → **«Мастерство»**; полный текст подсказки — в общем слое UX (см. **«UX энциклопедии: подсказки при наведении»** ниже); синхронизировать расчёт в `calculateExpertiseImpact` и потребителей Craft v2.

#### Точность прогноза, `qualityBonus`, `varianceMultiplier`

- **`predictionAccuracy` (агрегированная)** заменяет или **доминирует** над упрощённой формулой `BASE + avgExpertise * k` в прогнозе (допустимо смешение: база от средней экспертизы + поправка от взвешенного accuracy — решение фиксируется при внедрении, чтобы не дублировать эффект).

- **`qualityBonus`** — взвешенная сумма → вклад в блок качества в [`calculateWeaponForecast`](../../src/lib/craft/forecast-calculator.ts).

- **`varianceMultiplier`** — агрегированный множитель к разбросам в прогнозе и к факторам дисперсии при ролле.

#### Этапы крафта: привязка к материалу и технике

Чтобы **время от экспертизы конкретного материала** влияло осмысленно, каждый элемент таймлайна Craft v2 должен знать, **на какой материал опираться**:

| Метаданные этапа | Назначение |
|------------------|------------|
| `primaryPartId` | Часть оружия (клинок, гарда, рукоять, …) |
| `primaryMaterialId` | Канонический `materialId` этой части в плане |
| `stageSource` | `recipe` \| `processing_technique` \| `global` (например общая пауза прогрева — правило по умолчанию) |
| `techniqueId?` | Если этап вставлен техникой обработки (§6.12 п. 21) |

**Правило длительности этапа:**  
`duration = clamp_softcap( T_base * timeMultiplier(expertise, primaryMaterialId) * ...существующие модификаторы (уровни, workability из каталога, данные техники)... )`.

Одна и та же функция используется при **генерации плана** ([`process-generator`](../../src/lib/craft/process-generator.ts)) и при **UI «Крафт в процессе»** (прогноз оставшегося времени = сумма оставшихся этапов).

**С чем ещё связывать этап (кроме материала и техники):** тип этапа (`stageType`), **инструмент/здание** (будущее: модификаторы от уровня горна/кузницы), **теги опасности** (для ленты событий) — вне минимального MVP, но поле `stageSource` резервирует расширение.

#### Матрица: параметр карточки → потребитель в Craft v2

| Показатель в UI энциклопедии | Поле / производная `ExpertiseImpact` | Где применяется |
|------------------------------|--------------------------------------|-----------------|
| Скорость | `timeMultiplier` | Длительность этапов с соответствующим `primaryMaterialId` |
| Надёжность | `defectRiskMultiplier` | Качество прогноза и ролла (без отдельного «брака», пока не заведён) |
| Мастерство | перепрофилированный `materialWasteMultiplier` → эффективность вклада материала в статы | Множитель к **material-derived** вкладам в прогноз и ролл по частям (см. §6.13); не разброс и не точность |
| Точность | `predictionAccuracy` | Взвешенная точность прогноза; согласование с [`WeaponForecastPanel`](../../src/components/forge/craft-v2/planner/WeaponForecastPanel.tsx) |
| (вклад в карточку позже) | `qualityBonus`, `varianceMultiplier` | Качество и разброс статов |

#### UX энциклопедии: подсказки при наведении на параметры крафта

На карточке материала в блоке **«Бонусы к крафту»** у строк **Скорость**, **Надёжность**, **Мастерство**, **Точность** должен быть **поясняющий слой** (tooltip / title / popover — по UX-паттерну проекта):

| Требование | Детали |
|------------|--------|
| **Триггер** | Наведение курсора на десктопе; на сенсорных экранах — **долгое нажатие** или отдельная иконка «i» рядом с подписью (чтобы не ломать скролл и не полагаться только на hover). |
| **Содержание** | 2–4 предложения: что означает показатель **в игре**, на что влияет в **Craft v2** (согласно матрице выше и §6.13), что **не** делает (границы — см. таблицу разграничения у «Мастерства»). Без дублирования длинных формул — при необходимости ссылка «подробнее» на [`FORMULAS.md`](../utils/FORMULAS.md) после фиксации чисел. |
| **Единый источник текста** | Константа или объект `ENCYCLOPEDIA_CRAFT_BONUS_TOOLTIPS` рядом с [`material-card`](../../src/components/encyclopedia/material-card.tsx) / вынесенный модуль `src/lib/encyclopedia/` — чтобы подсказки не разъезжались от формулировок в роадмапе; при смене механики править **одно место** + этот документ. |
| **Доступность** | Не только `title`; предпочтительно компонент с фокусом и `aria-describedby`, если используется иконка «i». |

**Критерий готовности:** игрок без чтения документации понимает разницу между четырьмя параметрами; формулировки синхронизированы с кодом Craft v2 и [`encyclopedia-craft-bonus-tooltips.ts`](../../src/lib/encyclopedia/encyclopedia-craft-bonus-tooltips.ts).

#### Пример взвешивания (иллюстрация)

План: лезвие вес 0.6, рукоять 0.4.  
`timeMultiplier` лезвия 0.88, рукояти 0.95 → геометрическое среднее `0.88^0.6 * 0.95^0.4 ≈ 0.907` для **глобального** множителя времени, если этап не привязан к части; для этапа **только лезвия** — 0.88. После применения — софткап (например не ниже 0.75 относительно нейтрали).

#### Внедрение (чеклист) — **выполнено** (синхронизировано с «Статус реализации» в начале документа)

1. [x] `aggregateExpertiseImpactsForPlan` + тип агрегата; unit-тесты (`aggregate-expertise-impact.test.ts`).
2. [x] Модель этапа в [`process-generator`](../../src/lib/craft/process-generator.ts) / [`craft-v2`](../../src/types/craft-v2.ts): `primaryPartId`, `primaryMaterialId`, `stageSource`, `techniqueId`.
3. [x] Агрегаты в [`calculateWeaponForecast`](../../src/lib/craft/forecast-calculator.ts) и в Craft v2 [`calculator.ts`](../../src/lib/craft/calculator.ts) (`calculateForecast` / `calculateWeapon`, ролл в границах прогноза).
4. [x] Карточка энциклопедии: **«Мастерство»**, тултипы [`encyclopedia-craft-bonus-tooltips.ts`](../../src/lib/encyclopedia/encyclopedia-craft-bonus-tooltips.ts) + [`material-card`](../../src/components/encyclopedia/material-card.tsx); семантика в кузне согласована с полем `materialWasteMultiplier` / мастерством в расчёте.
5. [x] Софткапы и формулы — [`FORMULAS.md`](../utils/FORMULAS.md) §6.13; [`FORGE_SYSTEM.md`](FORGE_SYSTEM.md).

**Legacy:** расчёт [`calculateWeapon`](../../src/lib/craft/calculator.ts) для старых путей, если ещё существуют, **не расширять** этой моделью — только Craft v2.

---

## 7. Остающиеся открытые вопросы

1. **Несколько техник на один материал:** порядок выбора (древовидно vs плоский список шагов) — UX после первой цепочки.
2. **Разный порог экспертизы по тиру материала** vs единый глобальный — пока **глобальный**; пересмотр при разрастании контента.
3. **Облачный сейв:** расширение схемы плана и **очереди изучения** — чеклист в [`cloud-save-feature`](../../src/lib/cloud-save-feature.ts).
4. **Конкретные числа бонусов 80% / 100%** и глобальные перки — баланс в [`FORMULAS.md`](../utils/FORMULAS.md) после прототипа.
5. **Возврат материалов** при срыве/отмене изучения — если понадобится отличие от «потратил = потратил».
6. ~~**Нейтральный impact при 0% экспертизы**~~ — зафиксировано в [`aggregate-expertise-impact.ts`](../../src/lib/craft/aggregate-expertise-impact.ts) (`resolveExpertiseImpactForPlanRow` / `NEUTRAL_EXPERTISE_IMPACT_FOR_AGGREGATION`).

---

## 8. Инварианты (не ломать без явного решения)

- Канон **`materialId`** на складе и в экспедициях — см. аудит материалов; не возвращать «магическое» приведение руды к слитку без техники/этапа.
- Заказы NPC и `hiddenTags` должны продолжать однозначно определять «железный / стальной» и т.д. после Фаз A–B.
- `STORE_VERSION`: любое изменение формы `CraftPlan` — миграция и запись в аудите.

---

## 9. История документа

| Дата | Изменение |
|------|-----------|
| 2026-04-02 | Первоначальная версия: принципы, архитектура, фазы A–E, открытые вопросы. |
| 2026-04-02 | Экспертиза: энциклопедия «Изучить», техники изучения, рост от крафта с DR, вехи 80%/100%; фазы B1/B2. |
| 2026-04-02 | §6: зафиксированные Q&A (туториал + 10% на iron_ore / iron_alloy / birch / raw_leather; переключатель списка материалов; здания и рабочие; риск и лента; совместимость техник; попап экспертизы; формулы по тегам; контракт глобального чата; прояснение Q15). §7: сокращённый список открытых тем. |
| 2026-04-02 | §1, §2, §3, §4, §6.10, **§6.12**: техники — вклад в **«Крафт в процессе»** (этапы, время) и опциональные **outcomeModifiers**; фаза E уточнена; Q15 — явно «крафт/обработка», не подстановка сырья. |
| 2026-04-02 | **§5.1**: рекомендуемый порядок A→B1→B2→C→D→E, промежуточное видение (C без E = только расход/цепочка), вынесение совместимости техник в D, явный defer чата/кожи/заказов. Ссылка на **P2-CraftRm-*** в P2_ARCHITECTURE_INVENTORY. |
| 2026-04-02 | **Фаза A (часть):** селектор по фасетам `weapon_craft_v2`, узлы `iron_alloy` / `mithril_alloy`, скрытие `iron`/`mithril` как цели части, миграция сейва v6, правка `getMaterialProcessContribution` для пустых оверрайдов. |
| 2026-04-02 | **§6.13** (уточн.): замена «Экономии» на **Мастерство** — множитель к material-derived статьям по частям, таблица разграничения с скоростью/надёжностью/точностью/`varianceMultiplier`, поле `materialMasteryEfficiency` в агрегате; §7 без вопроса про копирайт «Повторяемость». |
| 2026-04-02 | **§6.13:** подраздел **«UX энциклопедии: подсказки при наведении»** — тултипы по четырём параметрам, мобильный паттерн, единый источник копирайта, a11y; пункт в чеклисте внедрения. |
| 2026-04-02 | В начале документа: **«Статус реализации (чеклист)»** — отметки `[x]`/`[ ]` по фазам A–E и ключевым пунктам §1 / §6 / §6.13; §2.1 обновлено под прирост экспертизы от крафта (B2). |
| 2026-04-02 | Актуализация после итерации кода: §2.1 и чеклист §6.13 «Внедрение» приведены к состоянию репозитория; B2 — `buildCraftExpertiseGainRows` + `queueMicrotask` для Zustand (React 19); §7 п.6 закрыт нейтральным impact в агрегаторе. |
| 2026-04-02 | Синхронизация §5.1 с чеклистом: §6.8 и глобальные сообщения в коде; уточнение `raw_leather`/кандидатов и частичного моста заказов (§6.7). В коде: нормализация сессий изучения в persist/облаке, мифриловая и **медная** плавка в кузне (`forge_basic_copper_smelt` + уровень 3 в `planner-unlocked-techniques`), `hiddenTagsSatisfyOrderMaterial` для заказов v2. **UX инвентаря кузницы:** сетка `repeat(auto-fill, minmax(...))` в [`inventory-section.tsx`](../../src/components/forge/inventory-section.tsx); карточка оружия без сжатия заголовка в [`weapon-inventory-card.tsx`](../../src/components/forge/weapon-inventory-card.tsx). Таблица «Следующие приоритеты работ» после чеклиста; §1 п.3 — пометка частичных примеров. |
| 2026-04-02 | **§6.7:** `weaponMaterialTagsAlignForOrders` + нормализация канонического id в [`weapon-display-meta.ts`](../../src/lib/craft/weapon-display-meta.ts); [`checkOrderAchievability`](../../src/lib/store-utils/order-achievable-utils.ts) подбирает легаси-рецепт при `iron`/`iron_alloy` и др.; чеклист **6.7**, уточнение §5.1 и строки бэклога **C**. |
| 2026-04-02 | **§6.8 / layout:** сворачиваемая правая панель событий (десктоп) в [`game-messages-dock.tsx`](../../src/components/layout/game-messages-dock.tsx); правка flex/`min-h-0` в [`game-layout.tsx`](../../src/components/layout/game-layout.tsx) после введения дока. В начале документа — таблица **«Сводка: сделано и осталось»**. |
| 2026-04-02 | Итерация **A–E** (craft roadmap next steps): §1 п.3 — плавки Sn/Bronze/Steel/Ag/Au + `study_quick_notes`; §2.4 — `forecastExpertiseFactorExtra` + [`FORMULAS.md`](../utils/FORMULAS.md); §6.7 — [`order-material-cost-gold.ts`](../../src/lib/store-utils/order-material-cost-gold.ts); §7 — мульти-техника / тики / возврат 50%; P2 — чеклист [`cloud-save-feature.ts`](../../src/lib/cloud-save-feature.ts). Обновлены сводка, чеклист (§2.4 `[x]`), приоритеты. |
| 2026-04-02 | Итерация **roadmap next** (план craft_roadmap_next): §1 п.3 — цепочки **дерево/камень** (`material-processing-techniques`, этапы `prep_forge_*`, `study_masonry_sketch`); **§6.7** — [`calculateMaterialCostForOrder`](../../src/lib/store-utils/order-achievable-utils.ts) через `getCraftingCost` + [`craftingResourceCostMapToGoldApprox`](../../src/lib/store-utils/order-material-cost-gold.ts); **§7** — группировка шагов в [`PartMaterialProcessingPanel`](../../src/components/forge/craft-v2/planner/PartMaterialProcessingPanel.tsx); ранний выход в `tickMaterialStudyProgress` без активных сессий; **P2** — новых полей persist нет; обновлены [`ORDER_SYSTEM.md`](ORDER_SYSTEM.md), [`FORMULAS.md`](../utils/FORMULAS.md) (заказы), чеклист в [`cloud-save-feature.ts`](../../src/lib/cloud-save-feature.ts). |
