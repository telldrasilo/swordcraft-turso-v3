# 06. Поверхность UI (экспедиции)

Компоненты под `src/components/guild/`, имеющие прямое отношение к экспедициям (старт, активная миссия, журнал событий, выбор сценария/оружия).

| Компонент / файл | Назначение | Store / действия |
|-------------------|------------|-------------------|
| `expeditions-section.tsx` | Основной блок экспедиций на экране гильдии | `startExpeditionFull`, списки шаблонов, искателей, оружия |
| `containers/ExpeditionsSectionContainer.tsx` | Контейнер секции | свои селекторы store |
| `presentation/ExpeditionsSection.tsx` | Презентация | props |
| `active-expedition-card.tsx` | Карточка активной экспедиции, таймер, завершение | `completeExpeditionFull` |
| `expeditions/ExpeditionEventLog.tsx` | Журнал событий по таймлайну | читает `active.events` |
| `expeditions/ExpeditionSelectionCard.tsx` | Выбор миссии | шаблон |
| `expeditions/ScenarioComparison.tsx` | Сравнение сценариев / калькулятор превью | `calculateExpeditionResult` (часто через хук) |
| `expeditions/WeaponSelectionCard.tsx` | Выбор оружия | инвентарь |
| `expedition-history-entry.tsx` | Строка истории | `guild.history` |
| `recovery-quest-card.tsx` | Квест восстановления оружия | квесты гильдии (побочный эффект экспедиции) |
| `GuildScreen.tsx` | Сборка экрана | маршрутизация вкладок |
| `adventurer-card/ExpeditionForecast.tsx` | Прогноз успеха / модификаторы | калькулятор v2, данные искателя |

Файлы дублированы в дереве (`src\components\guild\` vs `src/components/guild/`) из-за ОС — в рантайме один и тот же модуль по импорту `@/components/guild/...`.

## Зависимости данных

- Шаблоны: импорт `expeditionTemplates` из `@/data/expedition-templates`.  
- Превью исхода: `useModifierCalculator` или прямой вызов `calculateExpeditionResult` из `@/lib/expedition-calculator-v2` (проверить актуальный хук в проекте).

При переносе модуля сохраните связь: **тот же контракт** `startExpeditionFull` / `completeExpeditionFull`, чтобы остальной экран гильдии не ломался.
