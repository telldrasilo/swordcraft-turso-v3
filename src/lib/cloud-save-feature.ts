/**
 * Фича-флаг облачных сейвов (Turso + `/api/save` + синхронизация в `use-cloud-save`).
 *
 * Включение (после настройки Turso, NextAuth при необходимости):
 * - В `.env.local`: `NEXT_PUBLIC_CLOUD_SAVE_ENABLED=true`
 * - Пересборка / перезапуск dev-сервера (NEXT_PUBLIC_* вшивается на этапе сборки).
 *
 * ---
 * Почему новые модули «ломают» облако, и как не ломать:
 *
 * 1. **Zustand `persist` (localStorage, ключ `swordcraft-store-v2`)** — основной офлайн-слой.
 *    Новые поля в store: поднимайте `STORE_VERSION` в `game-store-composed.ts` и при необходимости
 *    дополняйте `merge` / `partialize`, чтобы старые сейвы получали дефолты (в т.ч. **`activeRefining`**
 *    через `mergeActiveRefiningFromSave` в `save-craft-normalize.ts`, фаза 7 аудита материалов; B1 —
 *    **`materialStudySessions`**, **`gameMessages`**, **`tutorial.starterForgeExpertiseGranted`**;
 *    повреждения на оружии — **`STORE_VERSION` 13+**, `migrateCraftedWeaponV2DamageFields` / `normalizeWeaponDamageInMergedState`).
 *
 * 2. **Облако** дублирует подмножество состояния: `collectSaveData` / `applyLoadedData`
 *    в `use-cloud-save.ts`, Zod в `save-payload-schema.ts`, колонки/SQL в
 *    `lib/db.ts` + `app/api/save/route.ts`. Любое новое **персистящееся** поле
 *    нужно протащить по этой цепочке и (при смене схемы БД) через миграцию SQLite.
 *
 * 3. **`saveVersion` в payload** — используйте для однократных миграций блоба на сервере
 *    (см. `formatSaveData` / `validateSaveData`).
 *
 * При `NEXT_PUBLIC_CLOUD_SAVE_ENABLED !== 'true'` сетевые вызовы не идут; игра живёт
 * на persist + локальном бэкапе ключа `swordcraft-offline-backup`.
 *
 * **Чеклист при расширении Craft v2 / заказов / изучения:**
 * - новые поля в `MaterialStudySession` (например `progressMessageBits`) — поднять `STORE_VERSION`
 *   при необходимости, убедиться что merge в `game-store-composed` / `use-cloud-save` задаёт дефолты;
 * - изменение формы `craftV2Persisted` / плана — `save-craft-normalize.ts`, Zod в `save-payload-schema.ts`,
 *   колонки JSON в Turso при облаке;
 * - единая оценка стоимости материалов для заказов — `order-material-cost-gold.ts` + `RESOURCE_SELL_PRICES`,
 *   чтобы награда NPC не расходилась с локальными таблицами; аванс материалов — тот же мост через
 *   `getCraftingCost` → `craftingResourceCostMapToGoldApprox` в `order-achievable-utils.ts`.
 *
 * - **STORE_VERSION 25:** в локальном persist добавлены `forgeMainTab: 'bench'` / `forgeBenchSubTab`, миграция со старых `repair`/`reforge`; неперсистящийся `workbenchBarBaseline` (полоса §8.5). В облако эти поля не попадают, пока не занесены в `collectSaveData` / Zod.
 * - очередь верстака + активный прогон этапов: **`repairQueuePlan`** (сериализованный `workbenchQueue`),
 *   `repairTechniqueStageRun` — `collectSaveData` / `applyLoadedData`, Zod (`save-payload-schema`, passthrough
 *   для легаси ключей в POST), колонки в Turso `game_saves` (`lib/db.ts` / миграция D5 без `repairBench*`),
 *   `validateSaveData` / `formatSaveData`, нормализация в `normalize-repair-bench-from-save.ts` при миграции старых блобов.
 *
 * - новые **техники ремонта** / теги в `repair-techniques-registry` / `damage-tag-registry` / маппинг событий
 *   `event-template-to-damage-tags` — без новых persist-полей на оружии обычно достаточно правок данных; иначе п. 1 и миграции.
 *
 * - **Модуль зачарований (фаза 0+):** опциональные поля на `CraftedWeaponV2` — `awakeningLevel`, `enchantmentTreeSteps`,
 *   `secondBranchMode`, `thirdBranchMode` (см. `src/types/weapon-enchantment-tree.ts`); живут внутри JSON `weaponInventory`,
 *   отдельных колонок Turso не требуется. При изменении формы — `STORE_VERSION` / merge в store при необходимости.
 *
 * - **Лента сообщений / квест FF:** `messagesDockEncyclopediaReadUpToTs`, `messagesDockArchivistReadUpToTs` в `forgottenForgePersist` (Zustand persist + облако при включении).
 * - **Интендант крафта:** `unlockedCraftTechniqueIds` (store persist + `collectSaveData`/`applyLoadedData` + Zod + Turso/route).
 * - **§9.1 / §9.1.1 weaponLegacy на оружии:** `repairResolveCountByTagId`, `archivedDamageTagIds`, опционально
 *   `repairDiagnosisPreciseCountByTagId` / `repairDiagnosisRiskyCountByTagId` / `repairDiagnosisSkippedCountByTagId` —
 *   внутри JSON `weaponInventory` / guild / `craftV2Persisted`; нормализация в `migrateCraftedWeaponV2DamageFields`;
 *   отдельных колонок Turso не требуется.
 * - **Шрамы (SPEC §1.1):** `physicalScarWeights`, `elementalScarWeights` в `weaponLegacy` — та же схема, без колонок Turso.
 * - **Перековка (фаза 1):** опционально `weaponReforge` на `CraftedWeaponV2` (стаки баффов, `awakenedScarKeys`, `scarAwakeningCompleted`) — внутри JSON `weaponInventory`; отдельных колонок Turso не требуется.
 *
 * **Бэклог:** разблокировка авто-ремонта по прокачке / мета (§9.2 спеки) — отдельная задача, UI «Дополнительно» уже есть.
 *
 * Чисто **дата-дополнения** в `src/data/*` без новых полей persist/облака — Turso/API не трогаем.
 */
export function isCloudSaveEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CLOUD_SAVE_ENABLED === 'true'
}
