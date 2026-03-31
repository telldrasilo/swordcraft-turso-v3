# Данные экспедиций

## Обзор
Статические данные экспедиций задают каркас миссий: доступные шаблоны, события, врагов, социальные ситуации и находки.

## Главные файлы
- `src/data/expedition-templates.ts`
- `src/data/expedition-events/core.ts`
- `src/data/expedition-events/locations.ts`
- `src/data/expedition-events/enemies.ts`
- `src/data/expedition-events/social.ts`
- `src/data/expedition-events/discovery.ts`

## Шаблоны экспедиций
Шаблон задает:
- тип миссии
- сложность
- награды
- длительность
- ограничения по уровню
- тематический контекст

## События
События делятся по смыслу:
- базовые служебные события
- локационные события
- боевые встречи
- социальные сцены
- находки и открытия

## Роль данных в расчете
Калькулятор экспедиции использует эти данные как контекст, а не как единственный источник результата. То есть шаблоны и события задают рамку, а финальный исход зависит еще и от искателя, оружия и модификаторов.

## Что смотреть при изменениях
- `src/data/expedition-templates.ts`
- `src/data/expedition-events/`
- `src/lib/expedition-event-selector.ts`
- `src/lib/expedition-calculator-v2.ts`
