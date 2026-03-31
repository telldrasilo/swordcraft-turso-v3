# Данные материалов

## Обзор
Материалы — центральный источник вариативности в крафте v2. Они определяют статистический профиль частей оружия, качество, редкость и точность прогноза.

## Главные файлы
- `src/types/materials/material-core.ts`
- `src/types/materials/material-bonuses.ts`
- `src/data/materials/`
- `src/store/slices/encyclopedia-slice.ts`

## Основная сущность
Главный тип — `MaterialNode`.

Ключевые поля:
- `id`
- `name`
- `nameRu`
- `category`
- `rarity`
- `origin`
- `value`

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
