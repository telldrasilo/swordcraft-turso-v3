# Генераторы

## Обзор
В проекте генераторы создают искателей, заказы, события и некоторые производные игровые сущности. Их задача — держать стохастическую или условно-процедурную логику вне store и UI.

## Главные файлы
- `src/lib/adventurer-generator-extended.ts`
- `src/lib/expedition-event-selector.ts`
- `src/lib/expedition-reward-generator.ts`
- `src/lib/store-utils/order-achievable-utils.ts`
- `src/data/adventurer-names.ts`
- `src/data/adventurer-tags/`

## Генерация искателей
`generateExtendedAdventurer()` собирает:
- identity
- combat-профиль
- personality
- unique bonuses
- strengths и weaknesses
- требования к оружию

Источники данных:
- имена
- редкости
- personality traits
- social tags
- motivations
- combat styles

## Генерация заказов
Логика достижимых заказов ориентирована на текущее состояние игрока, чтобы заказ был выполнимым, а не случайно невозможным.

При генерации учитываются:
- доступные рецепты
- доступные материалы
- уровень игрока
- fame
- средний уровень крафта

## Генерация событий и наград экспедиции
Сначала выбираются подходящие события, затем на основе результата экспедиции формируются награды.

Это разделение важно:
- событие отвечает за нарратив и контекст
- reward generator отвечает за экономический результат

## Почему генераторы вынесены отдельно
Преимущества:
- store остается тоньше
- данные проще тестировать отдельно
- можно повторно использовать генерацию в UI предпросмотра и в итоговом расчете

## Что смотреть при изменениях
- `src/lib/adventurer-generator-extended.ts`
- `src/lib/store-utils/order-achievable-utils.ts`
- `src/lib/expedition-event-selector.ts`
- `src/lib/expedition-reward-generator.ts`
- `src/data/adventurer-tags/`
