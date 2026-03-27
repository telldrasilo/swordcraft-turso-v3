---
todos:
- id: "1"
  content: "Создать backup текущего ExpeditionForecast.tsx"
- id: "2"
  content: "Рефакторинг: вынести подкомпоненты (CriticalStatsSection, SecondaryStatsSection, ModifiersSection)"
- id: "3"
  content: "Реализовать новый дизайн первого уровня (шанс успеха, доход, души войны, риски)"
- id: "4"
  content: "Реализовать раскрываемую секцию для модификаторов с Collapsible"
- id: "5"
  content: "Обновить стили: улучшить визуальную иерархию (размеры шрифтов, цвета, spacing)"
- id: "6"
  content: "Удалить блок \"Рекомендуемая комбинация\" из ExpeditionsSection.tsx"
- id: "7"
  content: "Удалить файл RecommendedCombination.tsx"
- id: "8"
  content: "Протестировать различные сценарии (разные уровни успеха, рисков, наличия модификаторов)"
---

# План обновления дизайна карточек экспедиций

## Обзор
Переработать компонент `ExpeditionForecast` для улучшения UX/UI: создать чёткую иерархию информации, выделить важные цифры, спрятать лишние модификаторы в раскрываемую секцию, удалить блок "Рекомендуемая комбинация".

---

## Изменяемые файлы

### Основные файлы:
1. `src/components/guild/adventurer-card/ExpeditionForecast.tsx` - основной компонент для обновления
2. `src/components/guild/expeditions-section.tsx` - удаление блока рекомендаций

### Файлы для удаления:
3. `src/components/guild/expeditions/RecommendedCombination.tsx` - компонент рекомендаций (будет удалён)

### Файлы для обновления экспортов:
4. `src/components/guild/expeditions/index.ts` - возможно, нужно обновить экспорты (если RecommendedCombination экспортируется)

---

## Детальные задачи

### 1. Создать backup текущего ExpeditionForecast.tsx

**Действие:** Создать копию файла с суффиксом `.backup.tsx` для возможности отката

```
ExpeditionForecast.tsx → ExpeditionForecast.backup.tsx
```

---

### 2. Рефакторинг: вынести подкомпоненты

**Текущая проблема:** Компонент слишком сложный, много повторяющегося кода (59-343 строки в ExpeditionForecast.tsx)

**Решение:** Разделить на подкомпоненты:

#### 2.1. CriticalStatsSection - критически важные метрики
```typescript
// Показывает шанс успеха и доход (самые важные метрики)
interface CriticalStatsSectionProps {
  successChance: number
  goldReward: number
}

export const CriticalStatsSection: React.FC<CriticalStatsSectionProps> = ({
  successChance,
  goldReward
}) => {
  const successColor = successChance >= 75 ? 'text-green-400' :
                     successChance >= 50 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Шанс успеха */}
      <div className="p-3 rounded-lg bg-green-900/20 border border-green-800/30">
        <span className="text-xs text-green-300">Шанс успеха</span>
        <div className={`text-2xl font-bold ${successColor}`}>
          {successChance}%
        </div>
        <ProgressBar value={successChance} />
      </div>

      {/* Доход */}
      <div className="p-3 rounded-lg bg-amber-900/20 border border-amber-800/30">
        <span className="text-xs text-amber-300">Доход</span>
        <div className="text-xl font-bold text-amber-400">
          {goldReward} 💰
        </div>
      </div>
    </div>
  )
}
```

#### 2.2. SecondaryStatsSection - второстепенные метрики
```typescript
// Показывает души войны и риски
interface SecondaryStatsSectionProps {
  warSoulReward: number
  weaponLossChance: number
  weaponWear: number
}

export const SecondaryStatsSection: React.FC<SecondaryStatsSectionProps> = ({
  warSoulReward,
  weaponLossChance,
  weaponWear
}) => {
  const riskColor = weaponLossChance > 15 ? 'text-red-400' : 'text-stone-400'

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Души войны */}
      <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-800/30">
        <span className="text-xs text-purple-300">Души войны</span>
        <div className="text-lg font-semibold text-purple-400">
          ~{warSoulReward} ✨
        </div>
      </div>

      {/* Риски */}
      <div className="p-3 rounded-lg bg-red-900/20 border border-red-800/30">
        <span className="text-xs text-red-300">Риски</span>
        <div className="text-xs space-y-1">
          <div className={riskColor}>Потеря: {weaponLossChance}%</div>
          <div>Износ: -{weaponWear}%</div>
        </div>
      </div>
    </div>
  )
}
```

#### 2.3. ModifiersSection - раскрываемая секция модификаторов
```typescript
// Показывает модификаторы успеха и золота
interface ModifiersSectionProps {
  successModifiers: Array<Modifier>
  goldModifiers: Array<Modifier>
}

export const ModifiersSection: React.FC<ModifiersSectionProps> = ({
  successModifiers,
  goldModifiers
}) => {
  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full">
          Показать детали модификаторов
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-3 pt-3 border-t border-stone-700">
          {/* Модификаторы успеха */}
          {successModifiers.length > 0 && (
            <div>
              <h5 className="text-xs text-stone-400 mb-2">Модификаторы успеха:</h5>
              <div className="flex flex-wrap gap-1.5">
                {successModifiers.map(mod => (
                  <ModifierBadge key={mod.source} {...mod} />
                ))}
              </div>
            </div>
          )}

          {/* Модификаторы золота */}
          {goldModifiers.length > 0 && (
            <div>
              <h5 className="text-xs text-stone-400 mb-2">Модификаторы золота:</h5>
              <div className="flex flex-wrap gap-1.5">
                {goldModifiers.map(mod => (
                  <ModifierBadge key={mod.source} {...mod} />
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
```

---

### 3. Реализовать новый дизайн первого уровня

**Структура нового ExpeditionForecast:**

```typescript
export const ExpeditionForecast: React.FC<ExpeditionForecastProps> = ({
  expedition,
  advice,
}) => {
  return (
    <div className="space-y-2 p-3 rounded-lg bg-stone-950/80 border border-stone-700">
      {/* Заголовок с советом */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-stone-200 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Прогноз миссии
        </h4>
        {advice && <AdviceBadge advice={advice} />}
      </div>

      {/* Критические метрики (шанс успеха + доход) */}
      <CriticalStatsSection
        successChance={expedition.successChance}
        goldReward={expedition.goldReward}
      />

      {/* Второстепенные метрики (души войны + риски) */}
      <SecondaryStatsSection
        warSoulReward={expedition.warSoulReward}
        weaponLossChance={expedition.weaponLossChance}
        weaponWear={expedition.weaponWear}
      />

      {/* Раскрываемая секция модификаторов */}
      {(expedition.successModifiers.length > 0 || expedition.goldModifiers.length > 0) && (
        <ModifiersSection
          successModifiers={expedition.successModifiers}
          goldModifiers={expedition.goldModifiers}
        />
      )}
    </div>
  )
}
```

**Ключевые изменения:**
- Уменьшен padding с `p-4` на `p-3`
- Уменьшены отступы между секциями с `space-y-3` на `space-y-2`
- Шанс успеха: самый крупный шрифт (`text-2xl font-bold`)
- Доход: крупный шрифт (`text-xl font-bold`)
- Души войны: средний шрифт (`text-lg font-semibold`)
- Риски: уменьшенный шрифт (`text-xs`)
- Убраны лишние эмодзи из чисел
- Модификаторы скрыты в раскрываемую секцию

---

### 4. Реализовать раскрываемую секцию для модификаторов

**Требования:**
- Использовать `Collapsible` из shadcn/ui (если есть) или создать на основе HTML `<details>`
- Состояние `expanded` (по умолчанию `false`)
- Кнопка "Показать детали" / "Скрыть детали"
- Плавная анимация открытия/закрытия (Framer Motion или CSS transition)

**Пример реализации с Collapsible:**

```typescript
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useState } from "react"

export const ModifiersSection: React.FC<ModifiersSectionProps> = ({
  successModifiers,
  goldModifiers,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-amber-400 hover:text-amber-300"
        >
          <span className="mr-1">{isOpen ? '▼' : '▶'}</span>
          {isOpen ? 'Скрыть детали' : 'Показать детали'}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pt-3 border-t border-stone-700">
        {/* ... модификаторы ... */}
      </CollapsibleContent>
    </Collapsible>
  )
}
```

**Альтернатива с HTML `<details>`:**

```typescript
export const ModifiersSection: React.FC<ModifiersSectionProps> = ({
  successModifiers,
  goldModifiers,
}) => {
  return (
    <details className="group">
      <summary className="cursor-pointer text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1 list-none">
        <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
        Показать детали модификаторов
      </summary>
      <div className="mt-3 space-y-3 pt-3 border-t border-stone-700">
        {/* ... модификаторы ... */}
      </div>
    </details>
  )
}
```

---

### 5. Обновить стили: улучшить визуальную иерархию

**Таблица размеров шрифтов:**

| Элемент | Старый размер | Новый размер | Вес |
|---------|--------------|--------------|-----|
| Шанс успеха | `text-xl` | `text-2xl` | `font-bold` |
| Доход | `text-2xl` | `text-xl` | `font-bold` |
| Души войны | `text-2xl` | `text-lg` | `font-semibold` |
| Риски | `text-sm` | `text-xs` | `normal` |
| Заголовки секций | `text-xs` | `text-xs` | `font-medium` |
| Подписи | `text-[10px]` | `text-[10px]` | `normal` |
| Модификаторы | `text-xs` | `text-xs` | `normal` |

**Цветовая иерархия:**

| Элемент | Цвет | Условия |
|---------|------|---------|
| Шанс успеха (высокий) | `text-green-400` | >= 75% |
| Шанс успеха (средний) | `text-amber-400` | 50-74% |
| Шанс успеха (низкий) | `text-red-400` | < 50% |
| Доход | `text-amber-400` | всегда |
| Души войны | `text-purple-400` | всегда |
| Риски (высокий) | `text-red-400` | потеря > 15% |
| Риски (средний) | `text-amber-400` | потеря 5-15% |
| Риски (низкий) | `text-stone-400` | потеря < 5% |

**Spacing:**

| Элемент | Старый | Новый |
|---------|--------|-------|
| Padding карточки | `p-4` | `p-3` |
| Gap между секциями | `space-y-3` | `space-y-2` |
| Gap в grid | `gap-2` | `gap-1.5` |
| Padding ячеек | `p-3` | `p-3` (без изменений) |

**Убрать лишние эмодзи:**
- ❌ Из чисел: `~{value} ✨` → `~{value}`
- ✅ Остать только в заголовках колонок: `💰 Доход`, `✨ Души войны`

---

### 6. Удалить блок "Рекомендуемая комбинация" из ExpeditionsSection.tsx

**Текущее состояние:** Блок находится в строках 474-489 в `expeditions-section.tsx`

```tsx
{/* Умные рекомендации */}
{availableAdventurers.length > 0 && availableWeapons.length > 0 && (
  <RecommendedCombination
    availableExpeditions={currentExpeditions}
    availableAdventurers={availableAdventurers.map(a => convertToExtended(a))}
    availableWeapons={availableWeapons}
    currentExpedition={selectedExpedition}
    currentAdventurer={selectedExtendedAdventurer}
    currentWeapon={selectedWeapon}
    onSelectRecommendation={(expedition, adventurer, weapon) => {
      setSelectedExpedition(expedition)
      setSelectedExtendedAdventurer(adventurer)
      setSelectedAdventurer(convertToLegacy(adventurer))
      setSelectedWeapon(weapon)
    }}
  />
)}
```

**Действия:**
1. Удалить секцию {/* Умные рекомендации */} целиком (строки 473-489)
2. Удалить импорт компонента (строка 57):

```tsx
import { RecommendedCombination } from './expeditions/RecommendedCombination'
```

**Результат:** Пользователь самостоятельно выбирает экспедицию, искателя и оружие без рекомендаций

---

### 7. Удалить файл RecommendedCombination.tsx

**Файл:** `src/components/guild/expeditions/RecommendedCombination.tsx`

**Действия:**
1. Удалить файл `RecommendedCombination.tsx` (322 строки)
2. Проверить, используется ли он где-то ещё:

```bash
# Поиск использований
grep -r "RecommendedCombination" src/
```

Если используется в других файлах - удалить их тоже

---

### 8. Протестировать различные сценарии

**Тест-кейсы:**

#### 8.1. Различные уровни успеха:
- Высокий шанс (>75%) - зелёный цвет
- Средний шанс (50-74%) - амберный цвет
- Низкий шанс (<50%) - красный цвет

#### 8.2. Различные уровни риска:
- Высокий риск (>15%) - красный цвет, крупнее шрифт
- Средний риск (5-15%) - амберный цвет
- Низкий риск (<5%) - каменный цвет

#### 8.3. Отсутствие модификаторов:
- Если модификаторов нет, кнопка "Детали" не показывается

#### 8.4. Различные комбинации данных:
- Полный набор (шанс, доход, души, риски, модификаторы)
- Минимальный набор (только шанс и доход, без модификаторов)

#### 8.5. Раскрываемая секция:
- Открытие по клику на кнопку
- Закрытие по клику на кнопку
- Анимация плавная и без багов

#### 8.6. Размеры экранов:
- Карточка корректно отображается на мобильных устройствах
- Grid 2x2 адаптируется

#### 8.7. Проверка после удаления рекомендаций:
- Секция экспедиций работает без блока рекомендаций
- Все функции выбора (экспедиция → оружие → искатель) работают корректно

---

## Технические детали

### Зависимости (уже есть в проекте):
- `lucide-react` - иконки (TrendingUp, CheckCircle, Skull, Coins, Zap, Swords)
- `@/components/ui/tooltip` - tooltips
- `@/components/ui/badge` - бейджи
- `@/components/ui/collapsible` - раскрываемая секция (проверить наличие)
- `framer-motion` - анимации (для expand/collapse, если нужно)

### Новые зависимости (возможно):
- Если `Collapsible` не реализован - использовать HTML `<details>` или создать компонент

### Обратная совместимость:
- Типы `ExpeditionData` не изменяются
- Пропсы `ExpeditionForecastProps` не изменяются
- Компонент может быть заменён без изменений в родительских компонентах
- Удаление `RecommendedCombination` не ломает основную функциональность

---

## Порядок реализации

1. Создать backup текущего компонента `ExpeditionForecast.tsx`
2. Создать подкомпоненты (CriticalStatsSection, SecondaryStatsSection, ModifiersSection)
3. Реализовать новый дизайн ExpeditionForecast с использованием подкомпонентов
4. Реализовать раскрываемую секцию для модификаторов (Collapsible или `<details>`)
5. Обновить стили (размеры шрифтов, цвета, spacing)
6. Удалить блок "Рекомендуемая комбинация" из ExpeditionsSection.tsx
7. Удалить файл RecommendedCombination.tsx
8. Удалить импорт RecommendedCombination из ExpeditionsSection.tsx
9. Протестировать различные сценарии
10. Удалить старый backup, если новый код работает корректно

---

## Пример итогового кода (концептуальный)

```typescript
// ExpeditionForecast.tsx - новая компактная версия
export const ExpeditionForecast: React.FC<ExpeditionForecastProps> = ({
  expedition,
  advice,
}) => {
  return (
    <div className="space-y-2 p-3 rounded-lg bg-stone-950/80 border border-stone-700">
      {/* Заголовок */}
      <Header advice={advice} />

      {/* Критические метрики */}
      <CriticalStatsSection
        successChance={expedition.successChance}
        goldReward={expedition.goldReward}
      />

      {/* Второстепенные метрики */}
      <SecondaryStatsSection
        warSoulReward={expedition.warSoulReward}
        weaponLossChance={expedition.weaponLossChance}
        weaponWear={expedition.weaponWear}
      />

      {/* Раскрываемая секция модификаторов */}
      {(expedition.successModifiers.length > 0 || expedition.goldModifiers.length > 0) && (
        <ModifiersSection
          successModifiers={expedition.successModifiers}
          goldModifiers={expedition.goldModifiers}
        />
      )}
    </div>
  )
}
```

---

## Примечания

- Модификаторы остаются в tooltip'ах бейджей (существующая функциональность `ModifierBadge`)
- Совет (advice) остаётся как status-бейдж в заголовке
- Все цвета соответствуют существующей теме проекта
- Используются существующие иконки из lucide-react
- Размеры и spacing соответствуют дизайн-системе проекта
- После удаления рекомендаций игрок самостоятельно принимает решения
