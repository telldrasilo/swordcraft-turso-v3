# APPENDIX F. Карта путей репозитория (экспедиции)

Кратко: путь → назначение.

| Путь | Назначение |
|------|------------|
| `src/store/cross-slice/guild-expedition-cross-slice.ts` | Старт/завершение экспедиции, стык ресурсов и оружия |
| `src/store/game-store-composed.ts` | Сборка стора, persist, встраивание cross-slice |
| `src/store/slices/guild-slice.ts` | Тип `ExpeditionResult`, расширенное состояние/контракты гильдии |
| `src/store/slices/resources-slice.ts` | `ResourceKey`, `addResource` / `spendResource` |
| `src/store/slices/encyclopedia-slice.ts` | `addMaterialExpertise`, знания о материалах |
| `src/types/guild.ts` | `GuildState`, `ActiveExpedition`, история, репутация |
| `src/types/expedition-events.ts` | События и награды событий |
| `src/types/expedition-tags.ts` | Теги шаблонов для отбора событий |
| `src/types/adventurer-extended.ts` | Вход калькулятора v2 |
| `src/data/expedition-templates.ts` | Шаблоны миссий, `difficultyInfo` |
| `src/data/expedition-events.ts` | Агрегатор `ALL_EXPEDITION_EVENTS` |
| `src/data/expedition-events/*.ts` | Контент событий по категориям |
| `src/lib/expedition-calculator-v2.ts` | Расчёт исхода и наград (до бросков) |
| `src/lib/expedition-event-selector.ts` | Выбор событий для активной экспедиции |
| `src/lib/expedition-reward-generator.ts` | Заглушка наград событий |
| `src/lib/modifier-system/*` | Реестр и провайдеры модификаторов |
| `src/lib/store-utils/expedition-utils.ts` | Вспомогательные функции завершения (legacy/утилиты) |
| `src/lib/cloud-save-feature.ts` | Флаг `NEXT_PUBLIC_CLOUD_SAVE_ENABLED`, чеклист схемы сейва |
| `src/hooks/use-cloud-save.ts` | Бэкап + опциональная синхронизация с `/api/save` |
| `src/app/api/save/route.ts` | Сериализация `guild` в БД (активно при включённом облаке) |
| `src/components/guild/expeditions-section.tsx` | UI старта экспедиции |
| `src/components/guild/active-expedition-card.tsx` | UI завершения |
| `src/components/guild/expeditions/ExpeditionEventLog.tsx` | Журнал событий |
| `types/expedition-loot.types.ts` | Параллельная схема лута (не импортируется калькулятором v2) |
