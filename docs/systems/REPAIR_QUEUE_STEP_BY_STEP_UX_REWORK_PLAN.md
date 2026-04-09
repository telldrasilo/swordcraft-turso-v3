# План переработки: пошаговый ремонт внутри очереди

Документ согласован; логика **вариант A** и очереди реализована в коде. **Сверка с модулем «Верстак»:** целевой UX и вложенность подвкладок описаны в [**WORKBENCH_MODULE_REDESIGN.md**](WORKBENCH_MODULE_REDESIGN.md): **(1)** переключатель «Ремонт | Перековка» должен оказаться **внутри** интерфейса верстака, а не в одной строке с кнопкой «Верстак» в шапке кузницы; **(2)** единый список оружия на ремонт и перековку — до полного слияния UI возможна разметка в двух секциях, но спецификация требует одного общего представления инвентаря. Панель этапов и очередь по-прежнему следуют варианту A (под списком позиций в блоке работ), с переносом под общую оболочку `WorkbenchShell` по мере выполнения W7 в worklog верстака.

## Реализованное поведение

- **Вариант A:** панель этапов (`RepairStageProgressPanel`) в блоке «Очередь ремонта», **под** списком позиций и **над** кнопками «Начать ремонт» / очистки.
- **Запуск:** `beginRepairTechniqueStageRun` с `source: 'queue'`, затем `start()` из `useWeaponRepairStageRun` в [`src/components/forge/repair-section.tsx`](src/components/forge/repair-section.tsx).
- **Автопереход:** после успешного или неуспешного завершения одного пункта выбирается следующий:
  - при **успехе** — round-robin: сначала индексы \> текущего, затем \< текущего ([`findNextWorkbenchQueueItemIndex`](../../src/lib/workbench/workbench-queue.ts));
  - при **ошибке** — только индексы строго **после** текущего ([`findNextWorkbenchQueueItemIndexAfterFailure`](../../src/lib/workbench/workbench-queue.ts)), без обёртки к меньшим индексам; при одном пункте с ошибкой очередь не зацикливается.
- **Пополнение очереди во время прогона** разрешено; активен один таймер этапов.
- **Отмены починки нет**; кнопка «Отменить работу» убрана из карточки ремонта. Этапы для очереди отображаются только в панели под очередью.
- **Development:** кнопка «Починить мгновенно (dev)» при `NODE_ENV === 'development'`: сбрасывает таймер и сразу вызывает `executeWeaponRepairByTechniques` для активного queue-run либо для первого запланированного, затем продолжает очередь тем же правилом, что после этапов.

## Модель стора

- `RepairTechniqueStageRunState` дополнен опциональным `source?: 'queue' | 'adhoc'` ([`craft-slice.ts`](src/store/slices/craft-slice.ts)).
- Нормализация сейва: [`normalizeRepairTechniqueStageRunFromSave`](src/lib/normalize-repair-bench-from-save.ts) проверяет, что `weaponId` входит в **`repairBenchWeaponIds`** (а не только в выбранный слот).

## UX карточки ремонта

- [`RepairCard`](src/components/ui/repair-card.tsx): убран локальный таймер этапов; при активном `repairTechniqueStageRun.source === 'queue'` для этого оружия блокируется редактирование техник; текст подсказки указывает на «Начать ремонт» внизу.

## Критерии приёмки (выполнено)

- По «Начать ремонт» видны этапы таймера, затем выполнение ремонта и переход к следующему пункту при наличии.
- Ресурсы списываются при успешном исходе после этапов (как раньше в cross-slice).
- Статусы позиций очереди обновляются; панель этапов видна при `phase === 'running'` для queue-run.

## История решений (§7)

1. Автостарт следующего пункта — **да** (с правилами выбора индекса выше).
2. Добавление в очередь во время текущей починки — **да**.
3. Статус «Отменено» — **не используется**.
4. Отмена — **нет**; вместо этого dev-only «Починить мгновенно».

---

*Связанные файлы:* [`repair-section.tsx`](../../src/components/forge/repair-section.tsx), [`repair-stage-progress-panel.tsx`](../../src/components/ui/repair-stage-progress-panel.tsx), [`repair-card.tsx`](../../src/components/ui/repair-card.tsx), [`use-weapon-repair-stage-run.ts`](../../src/hooks/use-weapon-repair-stage-run.ts), очередь верстака — [`workbench-queue.ts`](../../src/lib/workbench/workbench-queue.ts), [`workbench-shell.tsx`](../../src/components/forge/workbench-shell.tsx), [`repair-cross-slice.ts`](../../src/store/cross-slice/repair-cross-slice.ts).

*План модуля верстака:* [WORKBENCH_MODULE_REDESIGN.md](WORKBENCH_MODULE_REDESIGN.md).
