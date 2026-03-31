# Аудит текущей реализации зачарований

## Цель документа

Этот файл фиксирует фактическое состояние системы зачарований на момент подготовки автономного пакета документации. Его задача - предотвратить ситуацию, когда внешняя разработка будет опираться на устаревшие docs вместо реального кода.

## Что реально является источником истины

На практике система зачарований сейчас распределена между несколькими файлами:

- `src/data/enchantments.ts` - статические данные чар, школы, helper-функции, лимит по количеству чар, проверка совместимости, альтернативная формула жертвоприношения.
- `src/types/shared/enchantment.ts` - общий тип `WeaponEnchantment`.
- `src/store/slices/craft-slice.ts` - фактическое состояние `unlockedEnchantments` и action `unlockEnchantment`.
- `src/store/game-store-composed.ts` - реальные cross-slice действия `sacrificeWeaponForEssence`, `unlockEnchantmentWithCost`, `enchantWeapon`, `removeEnchantment`.
- `src/hooks/use-cloud-save.ts`, `src/app/api/save/route.ts`, `src/lib/db.ts` - сохранение и загрузка.

## Главные расхождения между кодом и старой документацией

### 1. Указан не тот основной slice

Старая документация указывает `src/store/slices/enchantments-slice.ts` как главный slice системы.

Фактическое состояние:

- store type в `src/store/game-store-composed.ts` не включает отдельный `EnchantmentsSlice`;
- `unlockedEnchantments` хранится в `CraftSlice`;
- боевые операции наложения и удаления зачарований реализованы в `game-store-composed.ts`.

Практический вывод:

- при внешней разработке нельзя считать `enchantments-slice.ts` активным контрактом подключения;
- возвращаемая реализация должна интегрироваться в `game-store-composed.ts` и в уже существующую shape-модель store.

### 2. Типы в docs расходятся с кодом

В `docs/04_TYPES_SYSTEM.md` перечислены школы вроде `ice`, `nature`, `shadow`, `light`, `chaos`, `void`.

В реальном коде `src/data/enchantments.ts` используются:

- `fire`
- `frost`
- `life`
- `protection`
- `power`
- `speed`

Практический вывод:

- внешняя разработка должна опираться на текущие реальные школы из `src/data/enchantments.ts`;
- старая docs-секция по типам не подходит как спецификация.

### 3. Лимит зачарований описан в двух местах по-разному

Расхождение:

- `src/data/enchantments.ts` -> `MAX_ENCHANTMENTS_PER_WEAPON = 2`
- `src/lib/store-utils/constants.ts` -> `MAX_ENCHANTMENTS_PER_WEAPON = 3`

Что реально влияет на UI и текущую логику:

- `game-store-composed.ts` импортирует лимит из `src/data/enchantments.ts`;
- UI в `src/components/screens/altar-screen.tsx` и `src/components/altar/enchanted-weapons-section.tsx` показывает лимит `2`.

Практический вывод:

- для автономной разработки нужно считать текущим фактическим лимитом значение `2`;
- в merge-playbook нужно отдельно предусмотреть унификацию лимита в одном источнике истины.

### 4. Разблокировка зачарования в UI проверяет стоимость, но action не списывает ресурсы

Что происходит сейчас:

- `src/components/altar/enchantment-shop-section.tsx` вызывает `canAffordEnchantment(...)` только для отображения доступности;
- затем вызывает `unlockEnchantment(enchantmentId)` из store;
- `src/store/slices/craft-slice.ts` просто добавляет id в `unlockedEnchantments`;
- `src/store/game-store-composed.ts` содержит `unlockEnchantmentWithCost`, но он не реализован до конца и не списывает ресурсы.

Практический вывод:

- текущий код допускает бесплатную разблокировку, если action вызван напрямую;
- автономная реализация должна считать это багом текущей версии, а не нормой.

### 5. Формула жертвоприношения продублирована и расходится

Есть две разные реализации:

- `src/data/enchantments.ts`
- `src/lib/store-utils/enchantment-utils.ts`

Дополнительно:

- `sacrificeWeaponForEssence` в `src/store/game-store-composed.ts` вызывает util-версию;
- UI-предпросмотр и рядом стоящие компоненты ориентированы на data-версию.

Практический вывод:

- внешняя разработка должна использовать единую каноническую формулу;
- при обратной интеграции дубликаты нужно свернуть в один источник истины.

### 6. Проверка совместимости зачарований тоже задублирована

Есть два варианта совместимости:

- `src/data/enchantments.ts` - логика через сравнение школ;
- `src/lib/store-utils/enchantment-utils.ts` - логика через `incompatibleMap`.

Практический вывод:

- в текущем интерфейсе фактически используется правило "нельзя два зачарования одной школы";
- расширенная incompatible-map логика пока не встроена как канон.

### 7. Материалы уже генерируют магические характеристики, но altar пока их почти не использует

В `src/types/craft-v2.ts` и `src/lib/craft/calculator.ts` уже существуют:

- `CraftedWeaponV2.stats.enchantSlots`
- `CraftedWeaponV2.stats.enchantPower`

Проблема:

- текущая логика `enchantWeapon` опирается на `MAX_ENCHANTMENTS_PER_WEAPON`, а не на реальные слоты и силу чара у конкретного оружия.

Практический вывод:

- автономная разработка должна документировать эти поля как обязательные будущие точки интеграции;
- но нельзя считать, что они уже определяют текущую механику altar.

### 8. Карточка оружия ещё не применяет эффекты чар к отображаемым свойствам

В `src/components/ui/weapon-card.tsx` есть конфигурация enchantment-свойств, но блок `extractWeaponProperties()` для `weapon.enchantments` пока является заглушкой.

Практический вывод:

- визуальное применение эффектов чар к карточке оружия пока не завершено;
- это нужно описать как future integration point, а не как готовое поведение.

### 9. Экспедиции пока не учитывают зачарования в расчётах

`src/lib/store-utils/expedition-utils.ts` использует `WeaponForExpedition` со следующими полями:

- `attack`
- `quality`
- `durability`
- `warSoul`
- `epicMultiplier`

Поля зачарований в расчёте отсутствуют.

Практический вывод:

- если внешняя разработка захочет добавлять влияние чар на экспедиции, это должно идти как отдельное расширение контракта.

### 10. Предпочитаемые зачарования у искателей существуют только как задел

Поле `preferredEnchantment?: string` встречается в:

- `src/types/adventurer-extended.ts`
- `src/types/guild.ts`
- `src/lib/adventurer-generator.ts`

Но генератор сейчас пишет `undefined` и помечает это как TODO.

Практический вывод:

- это допустимая future integration point;
- на неё нельзя опираться как на рабочую механику.

## Что можно считать фактическим текущим контрактом

На сегодня для автономной разработки безопасно считать, что система делает следующее:

1. Хранит список открытых чар в `unlockedEnchantments: string[]`.
2. Хранит наложенные чары в `weaponInventory.weapons[].enchantments`.
3. Позволяет жертвовать оружие ради `resources.soulEssence` и бонусного золота.
4. Позволяет накладывать до двух чар.
5. Не даёт применить две чары одной школы.
6. Инкрементирует `statistics.weaponsSacrificed` и `statistics.enchantmentsApplied`.
7. Сохраняет `unlockedEnchantments` и `weaponInventory` через persist и cloud save.

## Что обязательно исправить на уровне документации

Ниже список тем, которые должны быть отражены в новом каноническом пакете:

- какой файл реально является integration point для store;
- какие типы и школы считаются действительными;
- какой лимит чар считать каноническим;
- какая формула жертвоприношения является каноном;
- какие поля оружия уже существуют, но пока не задействованы;
- какие будущие связи допустимы, но пока не реализованы.
