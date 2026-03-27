# План исправления системы Души Войны

---

## Обзор

Комплексное исправление системы Души Войны: устранение критических багов, добавление проверки maxWarSoul, унификация логики между системами и улучшение UX/UI с системой тиров.

---

## ФАЗА 1: Критические баги (НЕЛЬЗЯ запускать игру пока не починено!)

### 1.1 Устранить двойное применение эффектов в экспедициях

**Проблема:** В `game-store-composed.ts:819-848` дважды обновляется оружие:
- Строка 820: `state.addWarSoulToWeapon(weapon.id, result.warSoul)`
- Строки 833-848: прямое обновление `currentDurability`, `epicMultiplier`, `adventureCount`

**Что делать:**
- Удалить строки 833-848 (дублирующий код)
- Оставить только вызов `addWarSoulToWeapon` (он уже всё делает правильно)
- Проверить, что `weaponWear` не нужен отдельно (функция уже вычитает durabilityLoss=5)

### 1.2 Исправить несуществующее поле `durability`

**Проблема:** В `game-store-composed.ts:1022` используется `weapon.durability`, но в `CraftedWeaponV2` только `currentDurability` и `stats.durability`

**Что делать:**
- Заменить `weapon.durability` на `weapon.currentDurability` (строка 1022)
- Проверить `craft-slice.ts:330` (там правильно используется `currentDurability`)

### 1.3 Добавить ограничение `maxWarSoul`

**Проблема:** Оружие может бесконечно накапливать души, нет проверки ограничения

**Что делать:**
- Создать систему тиров Души Войны (ФАЗА 2.1)
- Добавить проверку в `addWarSoulToWeapon`: `warSoul: Math.min(weapon.maxWarSoul, w.warSoul + points)`

---

## ФАЗА 2: Система тиров Души Войны

### 2.1 Создать систему тиров

**Новый файл:** `src/data/war-soul-tiers.ts`

**Что:**
- Создать константы для 5 тиров от Искры до Великой Души
- Добавить бонусы от тира (шанс успеха, золото, души, крит)
- Учесть связь с `soulCapacity` из материалов (УЖЕ РЕАЛИЗОВАНО в `use-craft-v2.ts:428`)

**Структура:**
```typescript
export const WAR_SOUL_TIERS = [
  {
    tier: 0,
    name: 'Искра',
    icon: '✨',
    color: 'text-stone-400',
    maxWarSoul: 50,
    bonus: { successBonus: 0, goldBonus: 0, warSoulBonus: 0 }
  },
  {
    tier: 1,
    name: 'Малая Душа',
    icon: '🔥',
    color: 'text-green-400',
    maxWarSoul: 150,
    bonus: { successBonus: 5, goldBonus: 0, warSoulBonus: 5 }
  },
  {
    tier: 2,
    name: 'Душа',
    icon: '💫',
    color: 'text-blue-400',
    maxWarSoul: 300,
    bonus: { successBonus: 10, goldBonus: 5, warSoulBonus: 10 }
  },
  {
    tier: 3,
    name: 'Большая Душа',
    icon: '🌟',
    color: 'text-purple-400',
    maxWarSoul: 500,
    bonus: { successBonus: 15, goldBonus: 10, warSoulBonus: 15 }
  },
  {
    tier: 4,
    name: 'Великая Душа',
    icon: '👑',
    color: 'text-amber-400',
    maxWarSoul: 1000,
    bonus: { successBonus: 20, goldBonus: 20, warSoulBonus: 20, critChance: 5 },
    note: 'Недостижим с текущими материалами (требует мифика)'
  },
]
```

### 2.2 Рассчитывать maxWarSoul от материалов (УЖЕ РЕАЛИЗОВАНО!)

**Что уже работает:** В `use-craft-v2.ts:428` уже есть:
```typescript
maxWarSoul: prev.preview.stats.soulCapacity
```

**Что делать:** 
- ЗАДОКУМЕНТИРОВАТЬ связь в плане (это уже работает!)
- `soulCapacity` рассчитывается в `process-generator.ts:331-373`
- Значения зависят от материалов: обычные 10-40, редкие 50-100, легендарные 100+

**Проверить:** Убедиться, что все материалы в `src/data/materials/*.ts` имеют `soulCapacity`

---

## ФАЗА 3: Логические улучшения

### 3.1 Унифицировать формулу расчёта warSoul

**Проблема:** Две разные системы:
- Экспедиции: детальная система модификаторов `expedition-calculator-v2.ts`
- Приключения: простой рандом + бонус за события `dungeons-screen.tsx:81-96`

**Что делать:**
- Создать `src/lib/war-soul-utils.ts` с общей функцией `calculateWarSoulReward`
- Перенести логику расчёта из `dungeons-screen.tsx` в утилиту
- Использовать систему модификаторов v2 для обоих типов экспедиций
- Унифицировать применение критического успеха

### 3.2 Добавить критический успех в приключениях

**Проблема:** В `dungeons-screen.tsx:87` нет механизма крита для warSoul

**Что делать:**
- Добавить `critChance` (базовый 5%)
- При крите: `warSoulGained * 2`
- Показывать иконку крита в UI при завершении
- Добавить toast-уведомление

### 3.3 Ограничить epicMultiplier в экспедициях

**Проблема:** В `game-store-composed.ts:842` эпичность растёт без `Math.min(5.0, ...)`

**Что делать:**
- Добавить ограничение: `epicMultiplier: Math.min(5.0, w.epicMultiplier + 0.05)`

### 3.4 Создать утилиты для работы с тирами

**Новый файл:** `src/lib/war-soul-utils.ts`

**Что создать:**
```typescript
export const getWarSoulTier = (warSoul: number): WarSoulTierInfo => {
  return WAR_SOUL_TIERS.find(t => warSoul <= t.maxWarSoul) ?? WAR_SOUL_TIERS[0]
}

export const getWarSoulTierName = (warSoul: number): string => {
  return getWarSoulTier(warSoul).name
}

export const getWarSoulTierIcon = (warSoul: number): string => {
  return getWarSoulTier(warSoul).icon
}

export const getWarSoulTierColor = (warSoul: number): string => {
  return getWarSoulTier(warSoul).color
}

export const getWarSoulBonus = (warSoul: number): WarSoulBonus => {
  return getWarSoulTier(warSoul).bonus
}

export const getProgressToNextTier = (warSoul: number, maxWarSoul: number): number => {
  const tier = getWarSoulTier(warSoul)
  const nextTier = WAR_SOUL_TIERS[tier.tier + 1]
  if (!nextTier) return 0
  
  const progress = (warSoul - (WAR_SOUL_TIERS[tier.tier - 1]?.maxWarSoul || 0)) 
  const tierSize = nextTier.maxWarSoul - (WAR_SOUL_TIERS[tier.tier - 1]?.maxWarSoul || 0)
  return Math.min(100, Math.max(0, Math.round((progress / tierSize) * 100)))
}
```

---

## ФАЗА 4: UX/UI улучшения

### 4.1 Прогресс-бар для Души Войны

**Файлы:** `weapon-inventory-card.tsx:229-253`, `weapon-card.tsx:274-287`

**Что добавить:**
- Прогресс-бар к `maxWarSoul`
- Визуальный бейдж тира с иконкой и цветом
- Информация о следующем тире

**Пример прогресс-бара:**
```tsx
{weapon.warSoul > 0 && weapon.maxWarSoul && (
  <div className="mt-2">
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-purple-400">
        {getWarSoulTierName(weapon.warSoul)}
      </span>
      <span className="text-xs text-stone-400">
        {weapon.warSoul} / {weapon.maxWarSoul}
      </span>
    </div>
    <div className="h-1.5 bg-purple-900 rounded-full overflow-hidden">
      <div 
        className="h-full bg-purple-500 transition-all" 
        style={{ width: `${(weapon.warSoul / weapon.maxWarSoul) * 100}%` }}
      />
    </div>
    <div className="text-xs text-stone-500 mt-1">
      До {getWarSoulTierName(weapon.maxWarSoul)}: {getProgressToNextTier(weapon.warSoul, weapon.maxWarSoul)}%
    </div>
  </div>
)}
```

### 4.2 Улучшить тултип Души Войны

**Что добавить:**
- Тир: [Иконка] Большая Душа (Tier 3/4)
- Вместимость: X/Y ({percent}%)
- Бонусы:
  - +15% шанс успеха в экспедициях
  - +10% золота от наград
  - +5% добычи душ

Следующий тир: Великая Душа (+5% крита) через {Y} душ

### 4.3 Визуализировать тир Души Войны

**Что:**
- Добавить бейдж с иконкой и цветом по тиру
- Цветовая схема:
  - Tier 0 (Искра): серый `bg-gray-600`
  - Tier 1 (Малая): зелёный `bg-green-600`
  - Tier 2 (Обычная): синий `bg-blue-600`
  - Tier 3 (Большая): фиолетовый `bg-purple-600`
  - Tier 4 (Великая): янтарный `bg-amber-600` (с анимацией пульсации)

### 4.4 Унифицировать UI между компонентами

**Проблема:** Дублирование логики в `weapon-inventory-card.tsx` и `weapon-card.tsx`

**Что делать:**
- Использовать общие утилиты из `war-soul-utils.ts` в обоих компонентах
- Унифицировать стилизацию бейджа тира
- Показывать одинаковые тултипы

### 4.5 Toast при критическом успехе

**Файл:** `dungeons-screen.tsx`

**Что:**
- Показывать всплывающее уведомление при критическом успехе
- Текст: "Критический успех! Души войны удвоены!"
- Иконка: молния/звезда
- Цвет: янтарный/фиолетовый

### 4.6 Адаптировать weapon-card.tsx для V2

**Проблема:** `extractWeaponProperties` в `weapon-card.tsx:224-328` работает только со старым `CraftedWeapon`, не поддерживает `CraftedWeaponV2`

**Что делать:**
- Создать `extractWeaponPropertiesV2` для `CraftedWeaponV2`
- Или адаптировать текущую функцию с проверкой типа
- Добавить поддержку полей: `currentDurability`, `maxWarSoul`, `epicMultiplier`, `adventureCount`, `qualityRank`

---

## ФАЗА 5: Оптимизация

### 5.1 Кэшировать расчёт тиров

**Файл:** `src/lib/war-soul-utils.ts`

**Что:**
- Использовать `memoize` для `getWarSoulTier`
- Кэшировать результаты для оптимизации при большом инвентаре

```typescript
import { memoize } from 'lodash-es'

export const getWarSoulTier = memoize((warSoul: number): WarSoulTierInfo => {
  return WAR_SOUL_TIERS.find(t => warSoul <= t.maxWarSoul) ?? WAR_SOUL_TIERS[0]
})
```

### 5.2 Ленивая загрузка иконок тиров

**Что:**
- Для улучшения производительности при большом инвентаре
- Загружать иконки по требованию

### 5.3 Ревизия вызовов addWarSoulToWeapon

**Что проверить:**
- Все места вызова функции
- Корректность параметров durabilityLoss и epicGain по умолчанию
- Убедиться, что значения не дублируются

**Где проверить:**
- `game-store-composed.ts:820, 1017`
- `craft-slice.ts:325`
- `dungeons-screen.tsx:96`

### 5.4 Удалить неиспользуемую функцию

**Файл:** `src/lib/store-utils/enchantment-utils.ts:226-229`

**Что:**
- Удалить `calculateWarSoulAttackBonus` (не используется)
- Вместо этого использовать бонусы от тиров

---

## Порядок выполнения (безопасный!)

1. **ФАЗА 1.1** → ФАЗА 1.2 → ФАЗА 1.3 (критические баги)
2. **ТЕСТ:** Запустить игру, проверить экспедицию (НЕ переходить дальше!)
3. ФАЗА 2.1 (тиры) → ФАЗА 2.2 (maxWarSoul от материалов - УЖЕ РАБОТАЕТ!)
4. ФАЗА 3.1 → ФАЗА 3.2 → ФАЗА 3.3 → ФАЗА 3.4 (логика)
5. **ТЕСТ:** Запустить обе системы (экспедиции + приключения)
6. ФАЗА 4.1 → ФАЗА 4.2 → ФАЗА 4.3 → ФАЗА 4.4 → ФАЗА 4.5 → ФАЗА 4.6 (UX/UI)
7. ФАЗА 5.1 → ФАЗА 5.2 → ФАЗА 5.3 → ФАЗА 5.4 (оптимизация)
8. **ТЕСТ:** Полное тестирование всех изменений

---

## Новые файлы

- `src/data/war-soul-tiers.ts` — система тиров Души Войны
- `src/lib/war-soul-utils.ts` — утилиты для тиров и расчётов

---

## Изменяемые файлы

### Критические (ФАЗА 1)
- `src/store/game-store-composed.ts`
  - Удалить строки 833-848 (дублирование)
  - Исправить `weapon.durability` → `weapon.currentDurability` (строка 1022)
  - Добавить проверку maxWarSoul в `addWarSoulToWeapon` (строка 1032)
  
- `src/store/slices/craft-slice.ts`
  - Добавить проверку maxWarSoul в `addWarSoulToWeapon` (строка 339)

### Система тиров (ФАЗА 2)
- `src/data/war-soul-tiers.ts` — СОЗДАТЬ
- `src/lib/war-soul-utils.ts` — СОЗДАТЬ

### Логика (ФАЗА 3)
- `src/lib/expedition-calculator-v2.ts` — задокументировать связь с soulCapacity
- `src/components/screens/dungeons-screen.tsx`
  - Добавить критический успех (строки 81-96)
  - Добавить toast-уведомление
  
- `src/store/game-store-composed.ts`
  - Ограничить epicMultiplier (строка 842)

### UX/UI (ФАЗА 4)
- `src/components/forge/weapon-inventory-card.tsx`
  - Добавить прогресс-бар (строки 229-253)
  - Добавить бейдж тира
  - Использовать утилиты из war-soul-utils
  
- `src/components/ui/weapon-card.tsx`
  - Адаптировать для V2 или создать extractWeaponPropertiesV2
  - Добавить прогресс-бар и тир

### Оптимизация (ФАЗА 5)
- `src/lib/store-utils/enchantment-utils.ts`
  - Удалить calculateWarSoulAttackBonus (строки 226-229)

---

## Критерии успеха

- Нет двойного применения эффектов (durability вычитается 1 раз)
- Нет ошибок TypeScript (поле durability → currentDurability)
- Оружие не может превысить maxWarSoul
- Души Войны отображаются с прогресс-баром и тиром
- Обе системы (экспедиции + приключения) используют одну логику
- Критический успех работает в обеих системах
- Toast показывается при крите
- Утилиты мемоизированы
- weapon-card.tsx адаптирован для V2
- Неиспользуемые функции удалены

---

## Дополнительные улучшения (опционально)

### A. Анимации при достижении тира

**Что:**
- Показывать анимацию вспышки при достижении нового тира
- Звуковой эффект (если включён звук)

### B. Сравнительная статистика

**Что:**
- Показывать сравнение: "Раньше: Tier 2 (150 душ), Сейчас: Tier 3 (220 душ)"
- Подсвечивать прирост в процентах

### C. Фильтр инвентаря по тиру

**Что:**
- Добавить возможность фильтровать оружие по тиру Души Войны
- Быстро находить лучшие оружия для экспедиций
