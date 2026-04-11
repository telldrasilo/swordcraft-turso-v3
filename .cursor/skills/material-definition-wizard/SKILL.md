---
name: material-definition-wizard
description: >-
  Runs a step-by-step interview to produce a SwordCraft material definition as JSON
  matching docs/MATERIAL_REWORK. Use when the user wants to add or redesign a material,
  fill the material template, run a "material wizard", standardize material data, or
  generate a spec for NN/code from Material_Template / MaterialDefinition.
---

# Material definition wizard

## Canonical sources (read when details matter)

- Human-oriented template and examples: [docs/MATERIAL_REWORK/Material_Template.md](../../../docs/MATERIAL_REWORK/Material_Template.md)
- Data shape / serialization notes (C# annotated — treat as field glossary): [docs/MATERIAL_REWORK/MaterialDefinition.md](../../../docs/MATERIAL_REWORK/MaterialDefinition.md)

Prefer **JSON** in the final answer, keyed like `Material_Template.md` (`material_id`, `source`, `ore`, `smelting`, `properties`, `techniques`, `stage_overrides`, `alloy`). Use `null` for optional objects when the template shows `null`; use empty arrays `[]` where the template lists arrays.

## When invoked

1. Say you are running the **material definition wizard** and will go **one section at a time**.
2. For **enums** (category, source type, furnace, fuel, quenchant, flags): offer **short options** (multiple choice in chat or numbered list); ask follow-ups only if the answer is ambiguous.
3. After each section, **summarize** what you captured in one or two lines before the next section.
4. After **section 7** (alloy), emit the **full JSON** in one fenced block, then a **short checklist**: tier vs workability/hardness consistency, magical materials have special smelting/techniques if that was the intent, all IDs are stable snake_case / `MAT_` style per user convention.

## Question order (mirror Material_Template)

Ask in this order; skip sub-questions that clearly do not apply (e.g. alloy subsection if `is_alloy` is false).

1. **§0 Identification** — `material_id`, `display_name`, `lore_name` (optional), `category`, `tier` (1–10), `is_magical`, `description`, `icon_path` (path or placeholder).
2. **§1 Source & ore** — `source` (type, `source_id`, mining tool, yield) and `ore` block (ids, names, weight, stack, quality modifier).
3. **§2 Smelting** — full `smelting` table: ingot ids/names, unlock, mastery, furnace, inputs per cycle, secondary ingredients, fuel, outputs, cycle time, optional `byproduct`.
4. **§3 Properties** — `properties`: melting point, workability, hardness, durability/damage/armor/weight/value mods.
5. **§4 Techniques** — `allowed_technique_tags`, `forbidden_technique_ids`, and any `unique_techniques` (as array of objects per template example).
6. **§5 Stage overrides** — `stage_overrides`: `on_heat`, `on_quench`, `removed_stages`, `added_stages` (with `insert_after` / durations / resource costs if present).
7. **§6 Alloy** — `is_alloy`, and if true `alloy_recipe` (inputs, output qty, crucible).

## SwordCraft implementation note (after JSON)

If the user wants code changes in this repo: **do not** assume Unity paths or C# types. Align with existing game data and types under `src/data/**` and `src/types/**`, and existing id registries. The JSON from this wizard is the **design artifact**; mapping to actual TypeScript records may require renaming keys or splitting files — confirm against current schemas before editing.

## Material catalog wave (добавление узла в репозиторий)

После правок данных материала в этом репозитории (не только JSON визарда): читай **[docs/MATERIALS_SINGLE_SOURCE_ROADMAP.md](../../../docs/MATERIALS_SINGLE_SOURCE_ROADMAP.md)** §7–§8 и **§8.5** для своей фазы. Минимум:

1. Новый узел подключён в **[`src/data/materials/library/material-registry-manifest.ts`](../../../src/data/materials/library/material-registry-manifest.ts)** (или в массив, который уже импортирует manifest).
2. `npm run test` — зелёный **`material-catalog-contract`**; при необходимости добавь **строку в регистр сканеров** в [`src/lib/materials/material-catalog-contract.ts`](../../../src/lib/materials/material-catalog-contract.ts), если появился новый тип ссылок на `materialId`.
3. Быстрая проверка без полного Vitest: **`npm run audit:materials`** (обёртка над тем же движком контракта).
4. Одна строка в **§11 Worklog** того roadmap и при смене цепочек — точечно **[`docs/RESOURCE_TRANSFORMATION_MAP.md`](../../../docs/RESOURCE_TRANSFORMATION_MAP.md)**.

## Output quality

- Balance hints from `Material_Template.md` §8: higher `tier` → stricter requirements; magical metals need special smelting/techniques when `is_magical` is true.
- All string IDs should be **stable** and **unique**; reference a registry or prefix convention if the user provides one.
