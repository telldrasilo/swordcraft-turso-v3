# План внедрения системы нейминга и скрытых тегов оружия

## 1. Общая архитектура системы

```mermaid
flowchart TD
    subgraph CraftFlow["Процесс крафта"]
        A[Выбор рецепта] --> B[Выбор материалов]
        B --> C[Определение combatPart]
        C --> D[Расчет качества]
        D --> E[Генерация имени с ранговым префиксом]
        E --> F[Создание hiddenTags]
        F --> G[Генерация уникального ID]
        G --> H[Создание CraftedWeaponV2]
    end

    subgraph WeaponData["Структура оружия"]
        H --> I[id: w_timestamp_random]
        H --> J[fullName: РанговыйПрефикс + Материал + Тип]
        H --> K[hiddenTags: [sword, iron, q:45, rank:C]]
        H --> L[qualityRank: F/D/C/B/A/S]
        H --> M[combatMaterialId: iron]
    end

    subgraph OrderSystem["Система заказов"]
        N[Генерация заказа] --> O[Требования: type.material.q>=X]
        P[Сдача заказа] --> Q[Проверка hiddenTags]
        Q --> R[Соответствует?]
    end

    H -.->|проверка| Q
```

## 2. Изменения в типах данных

### 2.1 CraftedWeaponV2 (src/types/craft-v2.ts)

**Добавить поля:**
```typescript
interface CraftedWeaponV2 {
  // ... существующие поля ...
  
  // Новые поля
  hiddenTags: string[]           // ["sword", "iron", "q:45", "rank:C"]
  qualityRank: 'F' | 'D' | 'C' | 'B' | 'A' | 'S'  // Ранг от качества
  combatMaterialId: string       // ID материала combatPart (например, "iron")
}
```

### 2.2 QualityRank определение

| Ранг | Мин. качество | Префикс имени |
|------|--------------|---------------|
| F | 0-30 | Обычный |
| D | 31-50 | Стандартный |
| C | 51-70 | Хороший |
| B | 71-85 | Отличный |
| A | 86-95 | Мастерский |
| S | 96-100 | Легендарный |

## 3. Файлы для изменения

### 3.1 src/types/craft-v2.ts
**Что делать:**
- Добавить `hiddenTags: string[]` в CraftedWeaponV2
- Добавить `qualityRank: QualityRank` в CraftedWeaponV2
- Добавить `combatMaterialId: string` в CraftedWeaponV2
- Создать тип `QualityRank = 'F' | 'D' | 'C' | 'B' | 'A' | 'S'`

**Влияние:**
- Затрагивает все места создания оружия
- Нужно обновить initialWeaponInventory и initialActiveCraft

### 3.2 src/lib/craft/name-generator.ts
**Что делать:**
- Добавить функцию `getQualityRank(quality: number): QualityRank`
- Добавить функцию `getQualityPrefix(rank: QualityRank): string`
- Обновить `generateWeaponName()` чтобы добавлять ранговый префикс

**Влияние:**
- Изменится формат имени оружия
- Все существующие имена будут с префиксами

### 3.3 src/lib/craft/craft-utils.ts (если есть старая система)
**Что делать:**
- Обновить функцию создания оружия для поддержки новых полей

### 3.4 src/hooks/use-craft-v2.ts
**Что делать:**
- Добавить функцию `generateUniqueWeaponId()`
- Добавить функцию `generateHiddenTags()`
- Обновить создание оружия (строки ~430-460) для заполнения новых полей
- Формат ID: `w_${timestamp}_${random6chars}`

**Влияние:**
- Основной процесс крафта
- Требуется получить combatMaterialId из материалов

### 3.5 src/lib/store-utils/craft-utils.ts
**Что делать:**
- Обновить `createWeapon()` для поддержки новых полей
- Добавить передачу combatMaterialId и hiddenTags

**Влияние:**
- Legacy система создания оружия
- Должна быть совместима с новой системой

### 3.6 src/store/slices/orders-slice.ts
**Что делать:**
- Заменить проверку `weapon.recipeId.includes(order.material)`
- На проверку `weapon.hiddenTags.includes(order.material)`
- Добавить функцию `checkWeaponMatchesOrder()` для комплексной проверки

**Влияние:**
- Все заказы будут использовать новую систему проверки
- Миграция старых данных не требуется (проверка только при сдаче)

### 3.7 src/lib/store-utils/order-achievable-utils.ts
**Что делать:**
- Обновить генерацию заказов для поддержки теговой системы
- Убедиться что заказы генерируют требования в формате hiddenTags

**Влияние:**
- Новые заказы будут использовать корректные требования

### 3.8 src/components/forge/active-orders-section.tsx
**Что делать:**
- Обновить `suitableWeapons` фильтрацию для использования hiddenTags
- Заменить проверку `w.recipeId.includes(order.material)`
- На проверку `w.hiddenTags?.includes(order.material)`

**Влияние:**
- UI покажет правильное количество подходящего оружия

### 3.9 src/components/guild/containers/OrdersSectionContainer.tsx
**Что делать:**
- Обновить фильтрацию `suitableWeapons` аналогично active-orders-section

**Влияние:**
- Гильдейские заказы тоже будут работать с hiddenTags

### 3.10 src/store/game-store-composed.ts
**Что делать:**
- Обновить `completeOrder` вызов для передачи данных оружия
- Убедиться что передается правильная структура с hiddenTags

**Влияние:**
- Cross-slice операция сдачи заказа

## 4. Зависимости и порядок работы

### Этап 1: Типы и утилиты (независимые)
1. **src/types/craft-v2.ts** - Добавить новые поля
2. **src/lib/craft/name-generator.ts** - Добавить ранговые префиксы

### Этап 2: Генерация оружия (зависит от Этапа 1)
3. **src/hooks/use-craft-v2.ts** - Создание оружия с hiddenTags и ID
4. **src/lib/store-utils/craft-utils.ts** - Обновить legacy создание

### Этап 3: Система заказов (зависит от Этапа 1-2)
5. **src/store/slices/orders-slice.ts** - Проверка по hiddenTags
6. **src/lib/store-utils/order-achievable-utils.ts** - Генерация с тегами
7. **src/store/game-store-composed.ts** - Cross-slice операции

### Этап 4: UI компоненты (зависит от Этапа 3)
8. **src/components/forge/active-orders-section.tsx** - Фильтрация оружия
9. **src/components/guild/containers/OrdersSectionContainer.tsx** - Фильтрация оружия

## 5. Обратная совместимость

### Старые сохраненные оружия
- У старых оружий не будет полей `hiddenTags`, `qualityRank`, `combatMaterialId`
- При загрузке сохранения нужно добавить миграцию или fallback
- Вариант: при отсутствии hiddenTags, проверять по старой схеме (recipeId)

### Fallback для проверки заказов
```typescript
function checkWeaponMatchesOrder(weapon: CraftedWeaponV2, order: NPCOrder): boolean {
  // Новая система: проверяем hiddenTags
  if (weapon.hiddenTags && weapon.hiddenTags.length > 0) {
    if (!weapon.hiddenTags.includes(order.weaponType)) return false
    if (order.material && !weapon.hiddenTags.includes(order.material)) return false
  } else {
    // Fallback: старая система проверки
    if (weapon.type !== order.weaponType) return false
    if (order.material && weapon.recipeId && !weapon.recipeId.includes(order.material)) {
      return false
    }
  }
  
  // Общие проверки
  if (weapon.quality < order.minQuality) return false
  if (order.minAttack && weapon.attack < order.minAttack) return false
  
  return true
}
```

## 6. Тестирование

### Что проверить после изменений:
1. Создание оружия - генерируется ли unique ID?
2. hiddenTags - правильно ли формируются?
3. qualityRank - правильно ли определяется?
4. fullName - есть ли ранговый префикс?
5. Генерация заказа - создаются ли требования правильно?
6. Сдача заказа - находится ли подходящее оружие?
7. UI - показывает ли правильное количество подходящего оружия?

## 7. Риски и запасные планы

### Риск: Нарушение сохранений
**Решение:** Добавить миграцию при загрузке сохранения

### Риск: Старые заказы перестанут работать
**Решение:** Fallback проверка как показано выше

### Риск: Поломка UI компонентов
**Решение:** Этап 4 делать последним, когда вся логика готова

---

## Итог

**Всего файлов для изменения:** 10
**Оценка времени:** 2-3 часа работы
**Критические пути:**
1. Типы → Создание оружия → Проверка заказов
2. Проверка заказов → UI компоненты

**Рекомендация:** Работать строго по этапам, тестировать после каждого этапа.
