# Строительство алтаря (экран «Зачарования»): стандарт проработки макрофазы

**Назначение:** единый **эталон для фаз I–V** — архитектура в коде и UI, обязательные проверки и типичные несоответствия. Дополняет [ENCHANTMENT_MODULE_PHASE1.md](ENCHANTMENT_MODULE_PHASE1.md) (экран-замок и перековка не здесь).

**Канон по лору и микроэтапам:** [../Quests/ALTAR_REWORK/ALTAR_BUILDING_V2.md](../Quests/ALTAR_REWORK/ALTAR_BUILDING_V2.md).  
**Количества на старт фаз:** `src/data/altar/altar-phase-material-balance.ts` (и при необходимости [../Quests/ALTAR_REWORK/ALTAR_MATERIAL_BALANCE.md](../Quests/ALTAR_REWORK/ALTAR_MATERIAL_BALANCE.md)).  
**Цепочки руда → слиток → склад:** [../RESOURCE_TRANSFORMATION_MAP.md](../RESOURCE_TRANSFORMATION_MAP.md), рецепты горна — `src/data/refining-recipes.ts`, маппинг `materialId` — `src/lib/craft/inventory-check.ts`.  
**UI прогресса:** [../Quests/ALTAR_REWORK/ALTAR_CONSTRUCTION_PROGRESS_UI_PLAN.md](../Quests/ALTAR_REWORK/ALTAR_CONSTRUCTION_PROGRESS_UI_PLAN.md).

---

## 1. Место в продукте

| Условие | Что видит игрок |
|--------|------------------|
| Нет `altarUnlockedByForgottenForgeQuest` | Экран «Зачарования» — замок, CTA в гильдию |
| Чертёж выдан, `altarBuiltInForge === false` | Дорожная карта I–V, карточка фазы (материалы, техники, старт / прогресс / отмена) |
| `altarBuiltInForge === true` | Вкладки «Зачарование» / «Улучшение алтаря» (дальнейший модуль по плану) |

Стройка ведётся **только** на этом экране до финала фазы V. Вкладка «Алтарь» в кузнице **убрана** (persist: `forgeMainTab: 'altar'` → `'craft'`).

**Экран:** `src/components/screens/altar-screen.tsx`.  
**Ремонт синхронизации фазы:** монтирование с `key={currentScreen}` — см. §6.

---

## 2. Эталон данных: фаза I

**Конфиг:** `src/data/altar/altar-phases-config.ts` — `altarPhasesConfig[1]`.

| Аспект | Фаза I (образцово) |
|--------|---------------------|
| Материалы | Константы `ALTAR_PHASE1_*` в `altar-phase-material-balance.ts`; **железо** задано как **руда** + **уголь на плавку** считается из рецепта `iron_ingot` (`extraCost.coal` × число эквивалентных слитков); **отдельно** уголь стройки; `requiredMaterialDisplayHints` для связи руда ↔ слиток в UI |
| Техники крафта | `requiredTechniques` |
| Техники горна | При необходимости `requiredMaterialProcessingTechniqueIds` (напр. `forge_basic_iron_smelt`) |
| Микроэтапы | `stages` с `durationSec`; `techniqueId` только где осмысленно для UX |
| Старт | `startAltarConstructionPhase` → `canStartAltarPhase`, `consumeMaterialsForAltarPhase`, снимок `activePhaseStages` |

---

## 3. Состояние в store, тик, персист

**Тип:** `AltarConstructionState` — `src/types/altar-construction.ts`.

Поля активной фазы: `activePhase`, `activePhaseStartTime`, `activePhaseStageIndex`, `activePhaseStageStartTime`, `activePhaseStages`, `completedPhases`.

**Тик:** `computeAltarConstructionTick` — `src/lib/altar/altar-construction-phase.ts`; из store — `updateAltarConstructionProgress(nowMs)`.  
**UI:** `useAltarConstructionTick` — `src/hooks/use-altar-construction-tick.ts`.  
**Персист:** partialize в `game-store-composed.ts`; нормализация — `normalizeAltarConstructionFromSave` в `src/lib/normalize-forgotten-forge-persist.ts`.

Завершение последнего микроэтапа: обновление `completedPhases`, сброс активной стройки, затем **`gameEvents.emit('altar:phaseCompleted', { phase })`**; подписчик **`useForgottenForgeQuestEvents`** → `reduceForgottenForgeAfterAltarPhaseCompleted`.

---

## 4. Квест «Эхо забытой кузни» и фазы

Логика переходов: `src/lib/quests/forgotten-forge-event-transitions.ts` (чистые функции + тесты).  
Гейты старта макрофазы по шагу квеста: `forgottenForgeAllowsStartingAltarPhase` — `src/lib/altar/altar-quest-gates.ts`.

**Фаза I (пример динамического копирайта):** при `step === 8` после фазы 1 — `buildAfterAltarPhase1ArchivistMessage` с учётом `getEffectiveUnlockedCraftTechniques` и отсылкой к интенданту для техник фазы II.  
**Другие фазы:** для каждой макрофазы проверить наличие ветки в `reduceForgottenForgeAfterAltarPhaseCompleted` (шаг, флаги, `archivistPendingChoices`, `forgottenForgePhase`) и согласованность с `forgotten-forge-dialogue.ts`.

Контекст событий: `ForgottenForgeEventContext` (в т.ч. `unlockedCraftTechniqueIds` где нужно).

---

## 5. UI карточки и дорожной карты

**Карточка:** `altar-phase-details-panel.tsx`.  
**Карта:** `altar-roadmap.tsx` — блокировка через `forgottenForgeAllowsStartingAltarPhase`.

До старта: списки материалов и техник; для недостающих крафт-техник — подсказка **интендант** (`craft_technique` в каталоге) или **архивариус**.

Активная стройка: стиль «ремонт», сегментная полоса, `altar-construction-fill` в `globals.css`, список этапов, dev-кнопки (`devAltarConstructionSkipToNextStage`, `devAltarConstructionCompleteActivePhase`).

---

## 6. Выбор фазы и `coerceAltarPhase`

1. `coerceAltarPhase` — `src/lib/altar/coerce-altar-phase.ts` (число / строка из JSON).
2. В `altar-screen.tsx`: `detailPhase = activePhaseNorm ?? selectedPhase`; в roadmap — `activePhase={activePhaseNorm}`.
3. `useEffect`: при активной фазе синхронизировать `selectedPhase` с store.

Новые поля persist — только через нормализатор; сравнения фазы в UI — тип `AltarPhase` (число).

---

## 7. Отладка store

| Action | Назначение |
|--------|------------|
| `devAltarConstructionSkipToNextStage` | Следующий микроэтап или завершение на последнем |
| `devAltarConstructionCompleteActivePhase` | Мгновенно завершить макрофазу + событие |
| `altarConstructionStateAfterPhaseComplete` | Чистая функция — `altar-construction-phase.ts` |

---

## 8. Баланс материалов и горн: аудит несоответствий

**Источник правды по выплавке:** `refiningRecipes` в `src/data/refining-recipes.ts` (`inputs`, `extraCost.coal`). Для каждого `materialId` из `requiredMaterials`, который на складе является **слитком/сплавом** (`*_alloy`, `steel`, `bronze`, …), зафиксировать одно из двух **явных** решений в балансе/доке фазы:

| Режим | Описание | Проверка |
|--------|-----------|----------|
| **A. Как фаза I (детальный)** | В `altar-phase-material-balance.ts` раскладываем потребность в **руду / уголь на плавку** по рецептам; в `requiredMaterials` при необходимости оставляем руду + суммарный уголь (стройка + плавка), слитки — только если игрок действительно должен нести уже готовые |
| **B. Упрощённый** | В `requiredMaterials` только готовые слитки + отдельная строка `coal`; тогда **суммарный уголь обязан включать** `extraCost` всех выплавок, необходимых для перечисленных слитков, плюс «работы» фазы |

**Обязательные проверки для проработки фазы N:**

1. **Слежка за рецептом:** каждый сплав/сталь/медь в требованиях сопоставить с рецептом (`iron_ingot`, `steel_ingot`, `copper_ingot`, `bronze_ingot`, …). Учесть, что **сталь** в данных — из **железной руды** (4 руды + 5 угля за 1 слиток), не из железного слитка.
2. **Двойной счёт руды:** если в фазе одновременно «много железных слитков» и «много стали», нельзя молча складывать полные цепочки от руды **без** явной модели (сталь уже «съела» руду; итоговая руда — max или сумма — должна быть осознанной).
3. **Рецепт `unlocked: false`:** если фаза требует выплавку, которую игрок может не иметь (пример: `bronze_ingot`), проверить гейт горна/уровня/квеста и подсказку в UI.
4. **Лор микроэтапа vs списание при старте:** если этап называется «переплавка руды», а при старте списываются только слитки — это **несоответствие UX**; поправить текст этапа, или баланс (руда на старте), или подсказки `requiredMaterialDisplayHints`.
5. **`requiredMaterialDisplayHints`:** для материалов «сырьё ↔ продукт плавки» по аналогии с фазой I — чтобы в карточке не вводить игрока в заблуждение.
6. **Согласованность с `ALTAR_BUILDING_V2.md`:** числа микроэтапов, техники на этапах, суммарное время; расхождение только осознанно и с правкой дока или кода.

---

## 9. Полный чеклист перед мержем макрофазы

1. **`altar-phases-config.ts`** — `requiredMaterials` / `requiredTechniques` / горн / `stages` / `totalDurationSec`; импорт баланса из `altar-phase-material-balance.ts`.
2. **`altar-phase-material-balance.ts`** — пройти §8; нет «магического» угля без учёта горна (если выбран режим A или полный режим B).
3. **`canStartAltarPhase`** — предыдущая фаза в `completedPhases`; техники через `getEffectiveUnlockedCraftTechniques`; горн через `isMaterialProcessingTechniqueEffectiveUnlocked`.
4. **`forgottenForgeAllowsStartingAltarPhase`** — для шага квеста разрешён старт **ровно** этой фазы; при блокировке — текст в `getForgottenForgeAltarPhaseBlockHint` при необходимости.
5. **`reduceForgottenForgeAfterAltarPhaseCompleted`** — ветка по `phase` и `step`; реплики; `archivistPendingChoices`; смена `forgottenForgePhase`; финал фазы V и `altarBuiltInForge`/`altarConstruction` согласованы с кодом.
6. **Интендант** — для каждой требуемой крафт-техники либо выдача в квесте, либо `craft_technique` в `intendant-catalog.ts`, либо явное исключение в копирайте.
7. **События** — сначала консистентный store, затем `altar:phaseCompleted`.
8. **Тесты** — чистые функции (`computeAltarConstructionTick`, `reduceForgottenForgeAfterAltarPhaseCompleted`, `canStartAltarPhase`, `coerceAltarPhase`, гейты FF); при изменении баланса — точечный тест расчёта констант, если вводите формулы.

---

## 10. Типичные дефекты (античеклист)

| Симптом | Что проверить |
|---------|----------------|
| Игрок «платит» слитками, а этап говорит «плавим руду» | §8 п.4 |
| Мало угля относительно числа слитков | §8 режим B: суммировать `extraCost` по всем выплавкам |
| Нельзя начать фазу при открытом квесте | `altar-quest-gates.ts` vs фактический `step` |
| Техника есть у интенданта, но нет подсказки в карточке | `altar-phase-details-panel` и наличие оффера |
| После reload активная фаза не совпадает с выделением на карте | §6, `coerceAltarPhase` |
| Пропуск шага квеста при завершении фазы | `forgotten-forge-event-transitions.ts` + тест |

---

## 11. Ключевые пути в репозитории

| Назначение | Путь |
|------------|------|
| Экран | `src/components/screens/altar-screen.tsx` |
| Дорожная карта / карточка | `src/components/enchantment/altar-construction/altar-roadmap.tsx`, `altar-phase-details-panel.tsx` |
| Конфиг фаз | `src/data/altar/altar-phases-config.ts` |
| Баланс | `src/data/altar/altar-phase-material-balance.ts` |
| Рецепты горна | `src/data/refining-recipes.ts` |
| Старт / тик | `src/lib/altar/altar-construction-phase.ts` |
| Гейты квеста | `src/lib/altar/altar-quest-gates.ts` |
| Квест по событиям | `src/lib/quests/forgotten-forge-event-transitions.ts`, `src/hooks/use-forgotten-forge-quest-events.ts` |
| Реплика после фазы I | `src/lib/quests/ff-after-altar-phase1-archivist-message.ts` |
| CSS прогресса | `src/app/globals.css` (`.altar-construction-fill*`) |
| Каталог интенданта | `src/data/guild/intendant-catalog.ts` |
| Приведение фазы | `src/lib/altar/coerce-altar-phase.ts` |

---

*Документ заменяет узкий «опорный документ (фаза I)»: тот же каркас плюс стандарт аудита материалов/горна и расширенные чеклисты для всех макрофаз.*
