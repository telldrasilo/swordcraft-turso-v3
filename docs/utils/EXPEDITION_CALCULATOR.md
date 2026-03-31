# Калькулятор экспедиций

## Обзор
Калькулятор экспедиций v2 собирает результат миссии из нескольких слоев модификаторов. Главный файл — `src/lib/expedition-calculator-v2.ts`.

## Главные файлы
- `src/lib/expedition-calculator-v2.ts`
- `src/lib/modifier-system/`
- `src/lib/expedition-reward-generator.ts`
- `src/lib/expedition-event-selector.ts`
- `src/types/guild.ts`

## Что считает калькулятор
Калькулятор формирует:
- `successChance`
- `commission`
- `warSoul`
- `weaponWear`
- `weaponLossChance`
- `critChance`
- развернутый список modifiers по источникам

## Входные данные
На расчет влияют:
- шаблон экспедиции
- сложность
- статы искателя
- редкость и уровень искателя
- стиль боя
- personality и social tags
- strengths и weaknesses
- качество оружия
- дополнительные бонусы предмета

## Провайдеры модификаторов
Система провайдеров нужна, чтобы изолировать источники бонусов и штрафов.

Ключевые провайдеры:
- `combat-stats-provider.ts`
- `combat-style-provider.ts`
- `level-rarity-provider.ts`
- `motivations-provider.ts`
- `personality-traits-provider.ts`
- `social-tags-provider.ts`
- `strengths-weaknesses-provider.ts`
- `weapon-quality-provider.ts`

## Логика расчета
Типовой pipeline:
1. Считать базовые параметры миссии.
2. Собрать все модификаторы по провайдерам.
3. Нормализовать и ограничить значения.
4. Отдельно посчитать успех, крит, износ и потерю оружия.
5. Сгенерировать награды и боевой лог.

## Категории модификаторов
- к шансу успеха
- к золоту
- к war soul
- к криту
- к износу оружия
- к потере оружия

## Что важно при расширении
Если добавляется новый тег или новый тип сильной стороны, лучше встраивать его через отдельный provider, а не дописывать большой `if` в главный калькулятор.

## Что проверять при изменениях
- `src/lib/expedition-calculator-v2.ts`
- `src/lib/modifier-system/`
- `src/lib/expedition-reward-generator.ts`
- `src/lib/expedition-event-selector.ts`
- `src/data/expedition-templates.ts`
- `src/data/expedition-events/`
