# Баланс материалов строительства алтаря v2

## Где править

Единый источник количеств для **проверки и списания со склада** при старте макрофазы:

**[`src/data/altar/altar-phase-material-balance.ts`](../../../src/data/altar/altar-phase-material-balance.ts)**

- **Фазы II–V** — прямо в объектах `ALTAR_PHASE2_REQUIRED_MATERIALS` … `ALTAR_PHASE5_REQUIRED_MATERIALS` (числа на усмотрение ГД).
- **Фаза I** — базовые величины в `phase1Base`, плюс константы `ALTAR_PHASE1_IRON_ALLOY_EQUIV` и `ALTAR_PHASE1_CONSTRUCTION_COAL`.  
  Итоговые **`iron_ore`** и **дополнительный уголь на плавку** считаются из рецепта **`iron_ingot`** в [`src/data/refining-recipes.ts`](../../../src/data/refining-recipes.ts) (`inputs` и `extraCost.coal`), чтобы не расходиться с кузницей. Если меняете экономику плавки — правьте рецепт и при необходимости комментарий в balance-файле.
- **Подпись в UI** для руды фазы I (`железный слиток × N` при учёте `iron_ore`) задаётся в `ALTAR_PHASE1_MATERIAL_DISPLAY_HINTS` в том же файле.

## Что не дублировать

Конфиг микроэтапов, техник крафта и горна остаётся в **`altar-phases-config.ts`**. Там только подключаются списки материалов из balance-файла.

## Связанные документы

- Общая модель стройки: [`ALTAR_BUILDING_V2.md`](./ALTAR_BUILDING_V2.md)
