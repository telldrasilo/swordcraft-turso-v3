# Данные материалов

## Обзор
Материалы — центральный источник вариативности в крафте v2. Они определяют статистический профиль частей оружия, качество, редкость и точность прогноза.

## Главные файлы
- `src/types/materials/material-core.ts`
- `src/types/materials/material-bonuses.ts`
- `src/data/materials/library/` — канон `MaterialNode`, в т.ч. `library/expedition/` для экспедиционных id
- `src/data/materials/collections/`
- `src/store/slices/encyclopedia-slice.ts`
- Маппинг id экспедиций: `docs/expedition-material-id-map.md`

## Как добавить материал

**[MATERIALS_ADDING.md](MATERIALS_ADDING.md)** — чеклист секций, эталоны по классам, политика энциклопедии, экспедиционный пакет.

## Основная сущность
Главный тип — `MaterialNode` (поля — в `material-core.ts`).

Кратко: `identity`, `physical`, `chemical`, `arcane`, `processing`, `economy`, `summary`, `discovery`, `description`, `icon`, `version`.

## Базовые свойства
Материал описывается набором характеристик, например:
- `hardness`
- `flexibility`
- `weight`
- `conductivity`
- `workability`
- `meltingPoint`
- `requiredHeat`

## Бонусные секции
Система бонусов включает:
- `speedBonus`
- `reliabilityBonus`
- `economyBonus`
- `qualityBonus`
- `forecastBonus`
- `spreadBonus`
- `customBonus`

Эти секции позволяют отделить сырые свойства материала от игровых эффектов более высокого уровня.

## Экспертиза
Энциклопедия хранит знания игрока по материалам и влияет на:
- точность прогноза
- раскрытие свойств
- уверенность в расчетах

## Что смотреть при изменениях
- `src/types/materials/material-core.ts`
- `src/types/materials/material-bonuses.ts`
- `src/data/materials/`
- `src/store/slices/encyclopedia-slice.ts`
