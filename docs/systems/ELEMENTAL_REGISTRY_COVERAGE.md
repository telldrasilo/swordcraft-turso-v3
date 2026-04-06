# Покрытие реестра повреждений и техник vs SPEC

**Назначение:** аудит фазы 3 (опционально из [ELEMENTAL_PLATFORM_IMPLEMENTATION.md](./ELEMENTAL_PLATFORM_IMPLEMENTATION.md)): что из полных таблиц §2–§3 [ELEMENTAL_PLATFORM_SPEC.md](./ELEMENTAL_PLATFORM_SPEC.md) уже есть в коде, а что ещё только в каноне.

## Видимые теги (`DAMAGE_TAG_REGISTRY`)

В реестре сейчас **12** видимых id (`physical_*` и `elemental_*` первой волны + три дополнительных физических из §2): см. `src/data/weapon-damage/damage-tag-registry.ts`.

Строк §2 (физика) и §3 (стихии) в SPEC больше — новые `physical_*` / `elemental_*` добавляются при расширении контента событий и реестра, с синхронным обновлением §3.5 и при необходимости `PHYSICAL_DAMAGE_TAG_TO_SCAR_ID` / `EVENT_TEMPLATE_TO_DAMAGE_TAGS`.

## Техники ремонта (`REPAIR_TECHNIQUE_REGISTRY`)

Каждый видимый тег первой волны закрыт хотя бы одной техникой (`clearsTagIds`). Расширение под новые теги — по §3.1 SPEC.

## Шрамы

Маппинг `physical_*` → `scar_*`: `src/data/weapon-damage/physical-damage-to-scar.ts`.  
Стихии: ось из `ELEMENTAL_DAMAGE_TAG_TO_AXIS` в `src/data/weapon-damage/elemental-axes.ts`.
