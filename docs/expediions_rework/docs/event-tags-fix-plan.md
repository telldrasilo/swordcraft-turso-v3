# План исправления системы тегов событий

## Проблема

События, не подходящие по контексту к локации:
- В шахте появляются "кусты", "деревья", "поляна"
- Беженец из кустов в подземелье
- Красивый цветок в заброшенных шахтах

## Причины

### 1. Функция фильтрации не используется
```typescript
// В events/index.ts ЕСТЬ функция filterEventsByConditions
// Но в API route она НЕ вызывается!
const locationEvents = location ? mods.getEventsForLocation(location.id) : mods.EVENT_REGISTRY;
const selectedEvents = mods.getRandomEvents(locationEvents, ...); // Без фильтрации!
```

### 2. Общие события без ограничений локации
```typescript
// eventCommonForgottenCache - НЕТ locationTypes
// "Под раскидистым кустом..." - появится в шахте!

// eventCommonAbandonedCamp - НЕТ locationTypes  
// "На поляне видны следы..." - появится в шахте!

// eventCommonRefugee - НЕТ locationTypes
// "Из кустов выбрался..." - появится в подземелье!
```

---

## План исправления

### Этап 1: Использовать фильтрацию в API ✅ (быстро)

- [ ] **1.1** Импортировать `filterEventsByConditions` в API route
- [ ] **1.2** Перед выбором событий фильтровать по условиям локации
- [ ] **1.3** Передать контекст: `locationId`, `locationType`, `locationTags`, `locationTier`

### Этап 2: Добавить ограничения в общие события

- [ ] **2.1** discovery.ts - обновить условия:
  - `eventCommonResourceCache`: оставить `['forest', 'mountain', 'mine']` + изменить описание на универсальное
  - `eventCommonForgottenCache`: добавить `locationTypes: ['forest', 'mountain']` или изменить описание
  - `eventCommonAbandonedCamp`: добавить `locationTypes: ['forest', 'mountain', 'swamp']`
  - `eventCommonOldGrave`: уже есть `['forest', 'mountain', 'swamp']` ✓
  - `eventCommonHiddenPassage`: уже есть `['forest', 'mountain', 'mine', 'underground']` ✓

- [ ] **2.2** social.ts - обновить условия:
  - `eventCommonWanderer`: добавить `locationTypes: ['forest', 'mountain']` (на дорогах)
  - `eventCommonRefugee`: добавить `locationTypes: ['forest', 'mountain']` или изменить описание
  - `eventCommonMerchant`: добавить `locationTypes: ['forest', 'mountain']` (повозка)
  - `eventCommonBeggar`: добавить `locationTypes: ['forest', 'mountain']` (у дороги)
  - `eventCommonLostChild`: уже есть `['forest', 'mountain']` ✓

- [ ] **2.3** danger.ts - проверить все события
- [ ] **2.4** travel.ts - проверить все события

### Этап 3: Создать универсальные описания (опционально)

Для событий, которые должны работать везде:

- [ ] **3.1** Добавить систему вариантов описаний по типу локации
  ```typescript
  descriptions: {
    forest: "Среди густых зарослей...",
    mine: "В темном углу штольни...",
    swamp: "Сквозь туман болота...",
    mountain: "Среди скал...",
    underground: "В глубине пещеры..."
  }
  ```

- [ ] **3.2** Или сделать описания нейтральными:
  ```
  "Вы обнаружили тайник — кто-то спрятал его здесь давно."
  ```

### Этап 4: Создать специфичные события для шахт/подземелий

- [ ] **4.1** Добавить события специально для `mine` типа:
  - Заброшенная штольня
  - Старая тележка шахтёра
  - Обвал породы
  - Подземный ручей
  - Странные звуки из глубины

---

## Приоритеты

1. **Критично:** 1.1-1.3 — фильтрация в API (решит 80% проблемы)
2. **Важно:** 2.1-2.4 — ограничения в общих событиях
3. **Опционально:** 3.1-3.2, 4.1 — улучшение контента

---

## Ожидаемый результат

После исправлений:
- События про кусты/деревья не появляются в шахтах
- События про подземелья не появляются в лесу
- Все события соответствуют контексту локации
- Фильтрация работает автоматически через conditions
