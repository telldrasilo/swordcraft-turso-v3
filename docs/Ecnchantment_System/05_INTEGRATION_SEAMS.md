# Integration seams: системы, файлы и action boundaries

## Назначение

Этот документ перечисляет все реальные швы интеграции, которые внешняя разработка системы зачарований должна учитывать. Это не обзор фичи, а карта зависимостей.

## Главные интеграционные зоны

### 1. Статические данные зачарований

Файл:

- `src/data/enchantments.ts`

Что отсюда приходит:

- школы зачарований;
- карточки чар;
- цены;
- требования;
- helper-функции;
- текущий лимит по количеству чар.

Когда менять:

- при добавлении новых чар;
- при изменении требований;
- при изменении совместимости школ;
- при унификации лимитов и формул.

### 2. Общие типы

Файлы:

- `src/types/shared/enchantment.ts`
- `src/types/craft-v2.ts`

Что отсюда приходит:

- `WeaponEnchantment`;
- поля оружия с зачарованиями;
- `stats.enchantSlots`;
- `stats.enchantPower`.

Когда менять:

- при расширении shape чара на оружии;
- при переходе от простого массива к более сложной runtime-модели;
- при использовании магических слотов и силы зачарования в боевой логике.

### 3. Store и cross-slice orchestration

Файлы:

- `src/store/slices/craft-slice.ts`
- `src/store/game-store-composed.ts`

Action boundaries:

- `unlockEnchantment`
- `isEnchantmentUnlocked`
- `unlockEnchantmentWithCost`
- `sacrificeWeaponForEssence`
- `enchantWeapon`
- `removeEnchantment`

Когда менять:

- при переносе логики из legacy shape в отдельный доменный slice;
- при исправлении оплаты разблокировки;
- при подключении `enchantSlots` и `enchantPower`.

### 4. Экран altar и UI-компоненты

Файлы:

- `src/components/screens/altar-screen.tsx`
- `src/components/altar/enchantment-shop-section.tsx`
- `src/components/altar/enchant-weapon-modal.tsx`
- `src/components/altar/sacrifice-section.tsx`
- `src/components/altar/enchanted-weapons-section.tsx`

Что связывает UI и домен:

- отображение `resources.soulEssence`;
- список доступных чар;
- проверка покупки;
- выбор оружия;
- показ текущих чар;
- запуск action-ов store.

Когда менять:

- при изменении правил покупки;
- при появлении стоимости наложения чара;
- при переходе от school-based совместимости к более сложной модели;
- при использовании слотов чара конкретного оружия.

### 5. Карточка оружия

Файл:

- `src/components/ui/weapon-card.tsx`

Текущее состояние:

- конфиги enchantment-свойств существуют;
- фактическое извлечение свойств из `weapon.enchantments` пока не реализовано.

Когда менять:

- когда эффекты чар начнут визуально влиять на оружие;
- когда понадобится отображение боевых модификаторов от чар.

### 6. Крафт и генерация оружия

Файлы:

- `src/lib/craft/calculator.ts`
- `src/lib/craft/process-generator.ts`

Что уже готово:

- расчёт `enchantSlots`;
- расчёт `enchantPower`.

Когда менять:

- когда лимит чар станет зависеть от оружия;
- когда сила чара начнёт масштабироваться от материалов.

### 7. Экспедиции

Файлы:

- `src/lib/store-utils/expedition-utils.ts`
- `src/lib/expedition-calculator-v2.ts`

Текущее состояние:

- экспедиции используют `attack`, `quality`, `durability`, `warSoul`, `epicMultiplier`;
- зачарования в расчёт напрямую не входят.

Когда менять:

- если чары начнут влиять на успех, награды, боевые роли или типы событий.

### 8. Искатели и требования

Файлы:

- `src/types/adventurer-extended.ts`
- `src/types/guild.ts`
- `src/lib/adventurer-generator.ts`

Текущее состояние:

- `preferredEnchantment` существует только как подготовка к будущей механике.

Когда менять:

- если заказы или искатели начнут требовать конкретные школы или эффекты чар.

### 9. Persistence

Файлы:

- `src/hooks/use-cloud-save.ts`
- `src/app/api/save/route.ts`
- `src/lib/db.ts`

Когда менять:

- всегда, если меняется save-shape или новый altar-state выходит за текущие JSON-структуры.

## Обязательные action boundaries для внешнего модуля

Внешняя реализация должна хотя бы на уровне адаптера уметь работать с такими командами:

1. Получить список доступных и разблокированных чар.
2. Проверить возможность разблокировки чара.
3. Разблокировать чару со списанием ресурсов.
4. Проверить возможность жертвоприношения оружия.
5. Выполнить жертвоприношение.
6. Проверить возможность наложения чара.
7. Наложить чару на оружие.
8. Снять чару с оружия.

Если внешняя среда реализует другие имена функций, для возврата в проект потребуется adapter layer.

## Файлы, которые почти наверняка затронет обратная интеграция

- `src/data/enchantments.ts`
- `src/types/shared/enchantment.ts`
- `src/types/craft-v2.ts`
- `src/store/slices/craft-slice.ts`
- `src/store/game-store-composed.ts`
- `src/components/screens/altar-screen.tsx`
- `src/components/altar/enchantment-shop-section.tsx`
- `src/components/altar/enchant-weapon-modal.tsx`
- `src/components/altar/sacrifice-section.tsx`
- `src/components/altar/enchanted-weapons-section.tsx`
- `src/components/ui/weapon-card.tsx`
- `src/hooks/use-cloud-save.ts`
- `src/app/api/save/route.ts`
- `src/lib/db.ts`

## Какие зависимости являются обязательными, а какие опциональными

### Обязательные

- ресурсы;
- игрок;
- инвентарь оружия;
- store actions;
- save/load;
- UI altar.

### Опциональные, но желательные для будущего

- экспедиции;
- заказы;
- предпочтения искателей;
- вывод эффектов на карточке оружия;
- полноценная incompatible-map модель.
