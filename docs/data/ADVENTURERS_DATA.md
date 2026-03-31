# Данные искателей

## Обзор
Статические данные искателей формируют идентичность, редкость, характер и модификаторы, которые затем используются генератором `AdventurerExtended`.

## Главные файлы
- `src/data/adventurer-rarity.ts`
- `src/data/adventurer-traits.ts`
- `src/data/adventurer-tags/`
- `src/data/adventurer-names.ts`
- `src/data/unique-bonuses.ts`

## Что описывают данные
- таблицы редкости
- personality traits
- social tags
- motivations
- strengths
- weaknesses
- unique bonuses
- списки имен

## Почему это важно
Именно эти данные определяют:
- как часто встречаются сильные искатели
- какие бонусы они несут
- какие требования предъявляют к оружию
- насколько разнообразными будут экспедиции

## Что смотреть при изменениях
- `src/data/adventurer-rarity.ts`
- `src/data/adventurer-traits.ts`
- `src/data/adventurer-tags/`
- `src/data/adventurer-names.ts`
- `src/data/unique-bonuses.ts`
- `src/lib/adventurer-generator-extended.ts`
