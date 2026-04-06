# TD-INV-2 — таблица решений по волнам (ENC-only → `ResourceKey`)

**Назначение:** зафиксировать per-id решения для программы снятия с реестра [`gatherable-enc-only.ts`](../../src/lib/materials/gatherable-enc-only.ts). Источник папок — [`MATERIALS_UNIFICATION_AUDIT.md`](../MATERIALS_UNIFICATION_AUDIT.md) §4.1.

**Сопровождение:** при новом добываемом id без маппинга — см. [`MATERIALS_ADDING.md`](MATERIALS_ADDING.md) (TD-DOC-1); реестр ENC-only пополняется только для таких id до подключения моста.

---

## Гардрейлы и DoD волны (копировать в MR)

**DoD одной волны / порции PR:**

1. Запись в [`world-resource-inventory-bridge.ts`](../../src/lib/materials/world-resource-inventory-bridge.ts) (или CORE в `inventory-check`, без коллизий с ядром).
2. Удаление id из [`gatherable-enc-only.ts`](../../src/lib/materials/gatherable-enc-only.ts) (или не добавлять — при полном закрытии реестр пуст).
3. Тесты: [`gatherable-enc-only.test.ts`](../../src/lib/materials/gatherable-enc-only.test.ts), при необходимости мост / пулы.
4. **TD-SEM-4:** [`material-process-overrides.ts`](../../src/data/materials/material-process-overrides.ts) + при smelting fuel/charge — согласованность с [`material-process-contract.test.ts`](../../src/lib/materials/material-process-contract.test.ts).
5. Документы: §4.1 в [`MATERIALS_UNIFICATION_AUDIT.md`](../MATERIALS_UNIFICATION_AUDIT.md), [`RESOURCE_TRANSFORMATION_MAP.md`](../RESOURCE_TRANSFORMATION_MAP.md), статус в таблице ниже.
6. Баланс: не смешивать в одном PR массовый маппинг и крупную перекройку чисел рецептов.

**Риски (кратко):** пул богаче — отметить в колонке «баланс»; UX крафта — сверка `identity.class`/тегов с `allowedCategories` рецептов; новый `ResourceKey` в этой программе **не** вводился (все ключи существующие).

---

## Таблица (34 id) — статус merged

Все строки закрыты одной интеграционной волной кодом от **2026-04-01** (контент-программа TD-INV-2, гибрид per-id).

| materialId | Папка | Волна | ResourceKey | Подкластер | Крафт (селектор) | Баланс / примечание | Риск | Статус |
|------------|-------|-------|-------------|------------|------------------|---------------------|------|--------|
| acorns | organics | W1 | wood | кора/семена | проверить | +wood pool | низкий | merged 2026-04-01 |
| echo_bark | organics | W1 | wood | кора | проверить | +wood | низкий | merged 2026-04-01 |
| oak_bark | organics | W1 | wood | кора | проверить | +wood | низкий | merged 2026-04-01 |
| silver_bark | organics | W1 | wood | кора | проверить | +wood | низкий | merged 2026-04-01 |
| pine_resin | organics | W1 | wood | смола | проверить | +wood | низкий | merged 2026-04-01 |
| dream_resin | organics | W1 | wood | смола | проверить | +wood | низкий | merged 2026-04-01 |
| forest_moss | organics | W1 | wood | мох | проверить | +wood | низкий | merged 2026-04-01 |
| swamp_moss | organics | W1 | wood | мох | проверить | +wood | низкий | merged 2026-04-01 |
| toxic_moss | organics | W1 | wood | мох | проверить | +wood | низкий | merged 2026-04-01 |
| whisper_moss | organics | W1 | wood | мох | проверить | +wood | низкий | merged 2026-04-01 |
| ash_dust | organics | W2 | coal | пыль | проверить | +coal pool | средний | merged 2026-04-01 |
| black_dust | organics | W2 | coal | пыль | проверить | +coal | средний | merged 2026-04-01 |
| bones | organics | W2 | leather | кости | проверить | +leather pool | средний | merged 2026-04-01 |
| cryo_fungi | organics | W2 | wood | трава/гриб | проверить | +wood | низкий | merged 2026-04-01 |
| decayed_bones | organics | W2 | leather | кости | проверить | +leather | средний | merged 2026-04-01 |
| memory_leaf | organics | W2 | wood | трава | проверить | +wood | низкий | merged 2026-04-01 |
| mist_herbs | organics | W2 | wood | трава | проверить | +wood | низкий | merged 2026-04-01 |
| poison_gland | organics | W2 | leather | органика | проверить | +leather | средний | merged 2026-04-01 |
| wild_herbs | organics | W2 | wood | трава | проверить | +wood | низкий | merged 2026-04-01 |
| dragon_glass | gems | W3 | stone | самоцвет | да (inlay) | +stone | низкий | merged 2026-04-01 |
| echo_stone | gems | W3 | stone | самоцвет | да | +stone | низкий | merged 2026-04-01 |
| fire_stone | gems | W3 | stone | самоцвет | да | +stone | низкий | merged 2026-04-01 |
| frozen_crystals | gems | W3 | stone | кристалл | да | +stone | низкий | merged 2026-04-01 |
| moonstone_shards | gems | W3 | stone | самоцвет | да | +stone | низкий | merged 2026-04-01 |
| primordial_amber | gems | W3 | stone | смола-камень | да | +stone | низкий | merged 2026-04-01 |
| void_crystal | gems | W3 | stone | кристалл | да | +stone | низкий | merged 2026-04-01 |
| volcanic_glass | gems | W3 | stone | стекло | да | +stone | низкий | merged 2026-04-01 |
| ancient_sap | special | W4 | wood | смола | проверить | +wood | низкий | merged 2026-04-01 |
| dragon_bone | special | W4 | leather | кость | проверить | +leather | средний | merged 2026-04-01 |
| eternal_ice | special | W4 | stone | лёд | проверить | +stone | средний | merged 2026-04-01 |
| heart_of_flame | special | W4 | coal | эмбер | проверить | +coal | средний | merged 2026-04-01 |
| heart_of_the_mountain | special | W4 | stone | сердце камня | проверить | +stone | средний | merged 2026-04-01 |
| primordial_ice | special | W4 | stone | лёд | проверить | +stone | средний | merged 2026-04-01 |
| soulforge_ember | special | W4 | coal | топливо | проверить | +coal | средний | merged 2026-04-01 |

**NEW_KEY:** не использовался — все id сопоставлены существующим `ResourceKey` (A1).
