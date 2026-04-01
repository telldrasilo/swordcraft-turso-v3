# APPENDIX C. Материалы и экспертиза (стык с экспедицией)

## Текущее состояние рантайма

- Завершение экспедиции в `completeExpeditionFull` **не** начисляет материалы и **не** вызывает экспертизу.
- Тип `EventReward` поддерживает `type: 'material'` и поле `itemId`, но `generateRandomRewards` в `src/lib/expedition-reward-generator.ts` **возвращает пустой массив** (заглушка).

## Целевой хост для vNext

Экспертиза материалов живёт в **encyclopedia slice** (`src/store/slices/encyclopedia-slice.ts`):

```text
addMaterialExpertise(materialId: string, amount: number): void
setMaterialExpertise(materialId: string, expertise: number): void
useMaterial(materialId: string): void
discoverMaterial(materialId: string): void
```

Ограничение значения экспертизы при прибавлении: clamp **0–100** (`clampExpertise` в том же файле).

Persist: `materialKnowledge` входит в `partialize` стора (поле `materialKnowledge`) — восстанавливается между сессиями.

## Идентификаторы материалов

Материалы описаны в `src/data/materials/**`; примеры `id`: `iron`, `steel`, `mithril`, `birch`, `oak`, `raw_leather`, `tanned_leather`, `coal`, `iron_ore`, `obsidian`, …  

Для награды события vNext использовать **те же строковые id**, что в библиотеке материалов и в энциклопедии, чтобы `addMaterialExpertise` совпадал с ключами `materialKnowledge`.

## Разделение с ResourceKey

- `ResourceKey` — складские **количественные** ресурсы (руда, слитки, дерево и т.д.).  
- `materialId` в энциклопедии — **знание/экспертиза** по типу материала для крафта и UI.  

Награда «10 железа» — `addResource('iron', 10)` или согласованный слиток.  
Награда «опыт с материалом steel» — `addMaterialExpertise('steel', delta)`.

## Начальные открытые материалы (пример из стора)

В `initialEncyclopediaState` заданы, среди прочих: `iron_ore`, `iron`, `birch`, `oak`, `raw_leather`, `tanned_leather`, `coal`. Это не исчерпывающий список игры — только стартовые знания.
