# Система бонусов к крафту

**Дата:** 2025-03-25  
**Версия:** 1.0

## Обзор

Бонусы к крафту теперь зависят от **двух факторов**:
1. **Экспертиза игрока** - знание и опыт работы с материалом
2. **Свойства материала** - физические, химические, магические и технологические характеристики

Эта система делает каждый материал уникальным и мотивирует игроков изучать разные материалы.

---

## Структура бонусов

### 1. Скорость крафта (timeMultiplier)

**Что это:** Множитель времени выполнения крафта. Меньше значение = быстрее.

**Формула:**
```
baseTimeMultiplier = 1.0 - (expertise * 0.0015)           // Экспертиза даёт 15% максимум
materialTimeFactor =
  (workability / 100) * 0.35 -          // Обрабатываемость (35%)
  (hardness / 200) * 0.20 -             // Твёрдость замедляет (20%)
  (refineDifficulty / 100) * 0.15 +    // Сложность переработки (15%)
  (thermalConductivity / 100) * 0.30     // Теплопроводность ускоряет (30%)
  
timeMultiplier = max(0.2, baseTimeMultiplier * (0.7 + materialTimeFactor * 0.6))
```

**Влияющие свойства:**
- `processing.workability` - чем выше, тем быстрее
- `physical.hardness` - твёрдые материалы обрабатываются медленнее
- `processing.refineDifficulty` - сложная переработка замедляет
- `physical.thermalConductivity` - высокая теплопроводность ускоряет

**Примеры при экспертизе 50%:**
- Железо (70/50/50/40): **-22%** скорости (быстрее среднего)
- Мифрил (25/88/90/90): **-3%** скорости (медленно)
- Обсидиан (5/140/80/50): **+12%** скорости (очень медленно)

---

### 2. Надёжность / Риск дефектов (defectRiskMultiplier)

**Что это:** Множитель вероятности дефектов. Меньше значение = надёжнее.

**Формула:**
```
baseRiskMultiplier = 1.0 - (expertise * 0.005)           // Экспертиза даёт 50% максимум
materialRiskFactor =
  (chemical.stability / 100) * 0.25 -        // Химическая стабильность (25%)
  (processing.defectRisk / 100) * 0.25 +    // Базовый риск дефектов (25%)
  (tensileStrength / 200) * 0.25 +         // Прочность на разрыв (25%)
  (purityPotential / 100) * 0.25             // Потенциал чистоты (25%)
  
defectRiskMultiplier = max(0.1, baseRiskMultiplier * (0.5 + materialRiskFactor * 1.0))
```

**Влияющие свойства:**
- `chemical.stability` - химически стабильные материалы надёжнее
- `processing.defectRisk` - базовый риск дефектов
- `physical.tensileStrength` - прочность на разрыв уменьшает риск
- `processing.purityPotential` - высокий потенциал чистоты уменьшает риск

**Примеры при экспертизе 50%:**
- Железо (50/10/30/40): **-58%** риска (низкий риск)
- Обсидиан (70/40/80/30): **-70%** риска (очень низкий риск)
- Дерево (60/25/50/80): **-61%** риска (низкий риск)

---

### 3. Экономия материала (materialWasteMultiplier)

**Что это:** Множитель количества отходов. Меньше значение = меньше отходов.

**Формула:**
```
baseWasteMultiplier = 1.0 - (expertise * 0.006)           // Экспертиза даёт 60% максимум
materialWasteFactor =
  (1 - porosity / 100) * 0.30 -          // Пористость увеличивает отходы (30%)
  (repairability / 100) * 0.35 -          // Ремонтопригодность уменьшает отходы (35%)
  (workability / 100) * 0.25 -            // Обрабатываемость уменьшает отходы (25%)
  (tensileStrength / 200) * 0.10          // Прочность на разрыв (10%)
  
materialWasteMultiplier = max(0.1, baseWasteMultiplier * (0.4 + materialWasteFactor * 1.2))
```

**Влияющие свойства:**
- `physical.porosity` - пористые материалы дают больше отходов
- `processing.repairability` - высокая ремонтопригодность уменьшает отходы
- `processing.workability` - легко обрабатываемые материалы дают меньше отходов
- `physical.tensileStrength` - прочные материалы дают меньше отходов

**Примеры при экспертизе 50%:**
- Железо (15/100/70/30): **-67%** отходов (мало отходов)
- Дерево (60/100/90/50): **-57%** отходов (средне)
- Камень (20/100/20/100): **-44%** отходов (много отходов)

---

### 4. Бонус к качеству (qualityBonus)

**Что это:** Плюс к итоговому качеству изделия.

**Формула:**
```
baseQualityBonus = expertise * 0.15                       // Экспертиза даёт до +15
materialQualityBonus =
  (hardness / 200) * 20 +           // Твёрдость даёт до +20
  (toughness / 200) * 20 +          // Прочность даёт до +20
  (arcane.conductivity / 100) * 10   // Магическая проводимость до +10
  (rarity / 200) * 15               // Редкость даёт до +15
  
qualityBonus = min(100, baseQualityBonus + materialQualityBonus)
```

**Влияющие свойства:**
- `physical.hardness` - твёрдые материалы дают бонус к качеству
- `physical.toughness` - прочные материалы дают бонус к качеству
- `arcane.conductivity` - магические материалы дают бонус к качеству
- `economy.rarity` - редкие материалы дают бонус к качеству

**Примеры при экспертизе 50%:**
- Железо (50/45/15/25): **+26** качества (среднее)
- Мифрил (88/75/90/95): **+65** качества (очень высокое)
- Дерево (20/35/5/15): **+12** качества (низкое)

---

### 5. Разброс характеристик (varianceMultiplier)

**Что это:** Множитель разброса характеристик изделия. Меньше значение = более предсказуемые результаты.

**Формула:**
```
baseVariance = 1.0 - (expertise * 0.008)                 // Экспертиза даёт 80% (1.0→0.2)
materialStability = (chemical.stability + arcane.stability) / 200
materialQuality = (hardness + toughness) / 400
  
varianceMultiplier = max(0, baseVariance * (0.3 + materialStability * 0.35 + materialQuality * 0.35))
```

**Влияющие свойства:**
- `chemical.stability` + `arcane.stability` - стабильные материалы дают меньше разброса
- `physical.hardness` + `physical.toughness` - качественные материалы дают меньше разброса

**Примеры при экспертизе 50%:**
- Железо (стability=55, quality=0.24): **0.19** разброса (низкий)
- Мифрил (stability=90, quality=0.41): **0.24** разброса (низкий)
- Дерево (stability=60, quality=0.14): **0.19** разброса (низкий)

---

### 6. Точность прогноза (predictionAccuracy)

**Что это:** Точность предсказания результатов крафта (в процентах).

**Формула:**
```
baseAccuracy = 50 + expertise * 0.4                        // Экспертиза даёт 40% (50→90)
materialAccuracyFactor =
  (chemical.stability / 100) * 20 +        // Стабильность до +20%
  (arcane.stability / 100) * 15 +         // Магическая стабильность до +15%
  (discoverability / 100) * 15            // Изученность до +15%
  
predictionAccuracy = min(100, baseAccuracy + materialAccuracyFactor)
```

**Влияющие свойства:**
- `chemical.stability` - стабильные материалы легче предсказуемы
- `arcane.stability` - магически стабильные материалы легче предсказуемы
- `economy.discoverability` - изученные материалы легче предсказуемы

**Примеры при экспертизе 50%:**
- Железо (50/60/100): **76%** точности (хорошая точность)
- Мифрил (90/90/20): **86%** точности (очень точный)
- Обсидиан (70/40/80): **77%** точности (хорошая точность)

---

## Сводная таблица

| Бонус | Основные свойства материала | Вес влияния материала | Экспертиза максимум |
|-------|----------------------------|------------------------|---------------------|
| **Скорость** | workability, hardness, refineDifficulty, thermalConductivity | 60% | 15% |
| **Надёжность** | stability, defectRisk, tensileStrength, purityPotential | 100% | 50% |
| **Экономия** | porosity, repairability, workability, tensileStrength | 120% | 60% |
| **Качество** | hardness, toughness, arcane.conductivity, rarity | +65 (аддитивно) | +15 |
| **Прогноз** | stability, arcane.stability, discoverability | +50% (аддитивно) | +40% |
| **Разброс** | stability, hardness + toughness | 70% | 80% |

---

## Примеры для разных материалов

### Железо (экспертиза 50%)
```typescript
material: {
  physical: { density: 5.0, hardness: 50, toughness: 45, thermalConductivity: 40, porosity: 15, tensileStrength: 30 },
  chemical: { stability: 50 },
  arcane: { conductivity: 15, stability: 60 },
  processing: { workability: 70, refineDifficulty: 50, purityPotential: 40, defectRisk: 10, repairability: 100 },
  economy: { rarity: 25, discoverability: 100 }
}

Бонусы:
- Скорость: -22% (быстро)
- Надёжность: -58% (низкий риск)
- Экономия: -67% (мало отходов)
- Качество: +26 (среднее)
- Прогноз: 76% (хорошо)
- Разброс: 0.19 (низкий)
```

### Мифрил (экспертиза 50%)
```typescript
material: {
  physical: { density: 2.5, hardness: 88, toughness: 75, thermalConductivity: 90, porosity: 5, tensileStrength: 90 },
  chemical: { stability: 90 },
  arcane: { conductivity: 90, stability: 90 },
  processing: { workability: 25, refineDifficulty: 90, purityPotential: 90, defectRisk: 15, repairability: 100 },
  economy: { rarity: 95, discoverability: 20 }
}

Бонусы:
- Скорость: -3% (медленно, но экспертно)
- Надёжность: -65% (очень низкий риск)
- Экономия: -52% (средне)
- Качество: +65 (очень высокое)
- Прогноз: 86% (очень точно)
- Разброс: 0.24 (низкий)
```

### Обсидиан (экспертиза 50%)
```typescript
material: {
  physical: { density: 3.0, hardness: 140, toughness: 50, thermalConductivity: 50, porosity: 15, tensileStrength: 80 },
  chemical: { stability: 70 },
  arcane: { conductivity: 25, stability: 40 },
  processing: { workability: 5, refineDifficulty: 80, purityPotential: 30, defectRisk: 40, repairability: 100 },
  economy: { rarity: 70, discoverability: 80 }
}

Бонусы:
- Скорость: +12% (медленно)
- Надёжность: -70% (очень низкий риск)
- Экономия: -54% (средне)
- Качество: +45 (высокое)
- Прогноз: 77% (хорошо)
- Разброс: 0.14 (очень низкий)
```

---

## Использование в коде

```typescript
import { calculateExpertiseImpact, type MaterialNode } from '@/types/materials'

const material: MaterialNode = { /* ... */ }
const expertise: number = 50

const impact = calculateExpertiseImpact(material, expertise)

console.log(`Скорость: ${Math.round((1 - impact.timeMultiplier) * 100)}%`)
console.log(`Риск: ${Math.round((1 - impact.defectRiskMultiplier) * 100)}%`)
console.log(`Отходы: ${Math.round((1 - impact.materialWasteMultiplier) * 100)}%`)
console.log(`Качество: +${Math.round(impact.qualityBonus)}`)
console.log(`Точность: ${Math.round(impact.predictionAccuracy)}%`)
```

---

## Баланс и настройка

### Настройка влияния экспертизы
- Увеличьте коэффициенты в формулах `base*Multiplier`, чтобы экспертиза давала больше бонусов
- Уменьшите коэффициенты, чтобы свойства материала были важнее

### Настройка влияния свойств
- Измените веса (0.35, 0.20, и т.д.) в `material*Factor`
- Сумма весов в каждом `material*Factor` должна быть около 1.0
- Положительные веса ускоряют/улучшают, отрицательные замедляют/ухудшают

### Предельные значения
- `timeMultiplier`, `defectRiskMultiplier`, `materialWasteMultiplier`: min 0.1-0.2
- `varianceMultiplier`: min 0
- `qualityBonus`, `predictionAccuracy`: max 100

---

## Дизайн-решения

### Почему сложная формула?
- Простая формула сделала бы все материалы одинаковыми
- Свойства материалов должны реально влиять на игровой процесс
- Игроки должны мотивироваться искать редкие материалы

### Почему экспертиза всё ещё важна?
- Без экспертизы даже мифрил не даст максимальных бонусов
- Экспертиза открывает потенциал материала
- Система поощряет долгосрочное развитие

### Почему разные веса?
- Некоторые свойства более важны для конкретных бонусов
- Пример: обрабатываемость важнее для скорости, чем для качества
- Это создаёт разнообразие стратегий игрока

---

## История изменений

| Дата | Версия | Изменения |
|------|--------|-----------|
| 2025-03-25 | 1.0 | Начальная версия системы бонусов |
