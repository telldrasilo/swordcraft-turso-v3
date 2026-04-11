---
name: technique-microtasks
description: >-
  SwordCraft: правила стабильных id для микрозадач (TechniqueMicroTask) в энциклопедии и Крафтовой линии —
  боевые техники, обработка материалов, персист прогресса и томов. Use when adding or editing microTasks,
  «ход работы», шаги техники, TechniqueMicroTask id, или проверка контракта микрозадач.
---

# Technique microtasks — стабильные id шагов

Тип: [`TechniqueMicroTask`](../../../src/types/encyclopedia-techniques.ts) — поле **`id` обязательно**; **`label`** — текст для игрока; опционально **`hint`**, **`durationWeight`**.

Контракт реестров: **[`src/data/technique-microtasks-catalog-contract.test.ts`](../../../src/data/technique-microtasks-catalog-contract.test.ts)** (Vitest: формат id, уникальность внутри техники).

## Зачем нужен id

- Персист «открытых» шагов, награды из экспедиций, **тома изучения** — ключ в сохранении должен быть **стабильным**, не от порядка в массиве и не от текста `label`.
- Глобально id **не обязаны** быть уникальными между разными техниками; в сторе используйте **составной ключ**: [`EncyclopediaTechniqueRef`](../../../src/types/encyclopedia-techniques.ts) (`kind` + `id` техники) **+** `microTask.id`.

## Именование

- Формат: **`[a-z][a-z0-9_]*`** (как в контракт-тесте).
- Префиксируйте по смыслу техники, чтобы не пересечься с **другой** техникой, если позже понадобится плоский список id: например обработка сырой кожи — `proc_raw_tan_soak`, а не общее `tan_soak`, если у боевого приёма уже есть `tan_soak`.
- Внутри **одной** техники id не должны повторяться (ловит контракт-тест).

## Где прописывать

| Семейство | Файл |
|-----------|------|
| Боевые приёмы | [`src/data/techniques/basic.ts`](../../../src/data/techniques/basic.ts), [`advanced.ts`](../../../src/data/techniques/advanced.ts) — массив **`microTasks`** у **`Technique`** |
| Обработка материала | [`src/data/material-processing-techniques.ts`](../../../src/data/material-processing-techniques.ts) — **`microTasks`** у **`MaterialProcessingTechnique`** |

Если **`microTasks` нет**, шаги для UI могут выводиться из **`processingOperations`** / ремонта — тогда id подставляется в [`expand-technique-display-steps.ts`](../../../src/lib/encyclopedia/expand-technique-display-steps.ts); для фич прогресса по шагам лучше **явно** задать `microTasks` с id.

## После правок

`npm run type-check` и `npm run test` (в т.ч. `technique-microtasks-catalog-contract.test.ts`). При смене контракта типа — [`docs/04_TYPES_SYSTEM.md`](../../../docs/04_TYPES_SYSTEM.md).

## Связь

- Полный чеклист подключения техники — **[technique-wiring](../technique-wiring/SKILL.md)**.
- Дока roadmap: **[docs/ENCYCLOPEDIA_MATERIALS_TECHNIQUES_ROADMAP.md](../../../docs/ENCYCLOPEDIA_MATERIALS_TECHNIQUES_ROADMAP.md)** §5.5, §10.
