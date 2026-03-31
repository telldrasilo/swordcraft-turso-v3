# Система ресурсов и работников

## Обзор
Система ресурсов отвечает за экономику проекта: добычу, хранение, переработку и трату материалов. Вместе с ней тесно связана система работников и производственных зданий.

Главные файлы:
- `src/store/slices/resources-slice.ts`
- `src/store/slices/workers-slice.ts`
- `src/lib/store-utils/constants.ts`
- `src/lib/store-utils/worker-utils.ts`
- `src/types/resources.ts`
- `src/types/worker.ts`

## Ресурсы
Основные категории ресурсов:
- валюта: `gold`, `soulEssence`
- сырье: `wood`, `stone`, `iron`, `coal`, `copper`, `tin`, `silver`, `goldOre`, `mithril`
- переработанные: `ironIngot`, `copperIngot`, `tinIngot`, `bronzeIngot`, `steelIngot`, `silverIngot`, `goldIngot`, `mithrilIngot`
- обработанные: `planks`, `stoneBlocks`, `leather`

Основные действия `resources-slice.ts`:
- `addResource()`
- `removeResource()`
- `spendResources()`
- `addGold()`
- `spendGold()`
- `addSoulEssence()`
- `sellResource()`

## Цены продажи
Цены продажи ресурсов хранятся в `RESOURCE_SELL_PRICES` внутри `src/lib/store-utils/constants.ts`.

Эти значения используются для:
- продажи лишних ресурсов
- оценки экономического баланса
- расчета доходности некоторых действий

## Работники
`workers-slice.ts` управляет рабочими и зданиями.

Классы работников:
- `apprentice`
- `blacksmith`
- `miner`
- `merchant`
- `enchanter`
- `loggers`
- `mason`
- `smelter`

Характеристики работника:
- `speed`
- `quality`
- `stamina_max`
- `intelligence`
- `loyalty`

## Здания
Производственные здания используются как точки назначения рабочих.

Типичные направления:
- добыча древесины
- добыча камня
- добыча руды
- плавка
- обработка материалов

Основные действия:
- `hireWorker()`
- `fireWorker()`
- `assignWorkerToBuilding()`
- `unassignWorkerFromBuilding()`
- `upgradeBuilding()`
- `completeTask()`

## Стамина и эффективность
Работники расходуют стамину, а их характеристики влияют на:
- скорость производства
- качество результата
- потенциальную окупаемость

Утилиты для расчета находятся в `src/lib/store-utils/worker-utils.ts`.

## Связи с другими системами
- кузница потребляет ресурсы
- зачарования используют `soulEssence`
- гильдия списывает золото и комиссию
- заказы дают золото и иногда материалы

## Что смотреть при изменениях
- `src/store/slices/resources-slice.ts`
- `src/store/slices/workers-slice.ts`
- `src/types/resources.ts`
- `src/types/worker.ts`
- `src/lib/store-utils/constants.ts`
- `src/lib/store-utils/worker-utils.ts`
