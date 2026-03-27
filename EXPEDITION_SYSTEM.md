# Система Экспедиций — Техническая документация

## Оглавление

1. [Архитектура системы](#архитектура-системы)
2. [Типы экспедиций](#типы-экспедиций)
3. [Поток пользователя](#поток-пользователя)
4. [Система модификаторов v2](#система-модификаторов-v2)
5. [Расчёт результатов](#расчёт-результатов)
6. [Квесты восстановления](#квесты-восстановления)
7. [Интерфейс пользователя](#интерфейс-пользователя)
8. [История и статистика](#история-и-статистика)

---

## Архитектура системы

### Основные компоненты

```
┌─────────────────────────────────────────────────────────────┐
│                      GuildScreen                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Заказы   │ │Экспедиции│ │ Искатели │ │Статистика│       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              ExpeditionsSectionContainer                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            ExpeditionsSection (v2)                    │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │   1. Активные экспедиции                        │ │  │
│  │  │   2. Квесты восстановления                     │ │  │
│  │  │   3. Выбор экспедиции                          │ │  │
│  │  │   4. Выбор оружия                             │ │  │
│  │  │   5. Поиск искателей (RecruitmentInterface)   │ │  │
│  │  │   6. Кнопка запуска + модификаторы              │ │  │
│  │  │   7. История экспедиций                        │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                       Store (Zustand)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              guild-slice.ts                          │  │
│  │  • GuildState (уровень, слава, искатели, экспедиции) │ │  │
│  │  • ExtendedGuildState (контрактные искатели)         │ │  │
│  │  • Actions: startExpedition, completeExpedition,    │ │  │
│  │             startRecoveryQuest, etc.                 │ │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   Бизнес-логика                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ expedition-      │  │ expedition-      │                │
│  │ calculator-v2.ts │  │ utils.ts         │                │
│  │ • Расчёт        │  │ • Обновление     │                │
│  │   результатов    │  │   искателей      │                │
│  │ • Модификаторы   │  │ • Квесты         │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### Типы данных

#### ExpeditionTemplate

```typescript
interface ExpeditionTemplate {
  id: string                    // Уникальный ID экспедиции
  name: string                  // Название миссии
  description: string           // Описание
  icon: string                  // Эмодзи-иконка
  type: ExpeditionType          // Тип экспедиции
  difficulty: ExpeditionDifficulty  // Сложность
  duration: number              // Длительность (секунды)
  cost: {                       // Стоимость запуска
    supplies: number            // Снаряжение
    deposit: number             // Депозит (возвращается при успехе)
  }
  reward: {                      // Награда
    baseGold: number            // Базовое золото
    baseWarSoul: number         // Базовые души войны
    bonusResources?: [...]      // Дополнительные ресурсы
    bonusEssence?: number       // Дополнительная эссенция
  }
  minGuildLevel: number          // Мин. уровень гильдии
  failureChance: number          // Базовый шанс провала (%)
  weaponLossChance: number       // Базовый шанс потери оружия (%)
  recommendedWeaponTypes: string[]  // Рекомендуемые типы оружия
  minWeaponAttack: number        // Мин. атака оружия
}
```

#### ActiveExpedition

```typescript
interface ActiveExpedition {
  id: string                        // Уникальный ID экспедиции
  expeditionId: string              // ID шаблона экспедиции
  expeditionName: string           // Кэшированное название
  expeditionIcon: string            // Кэшированная иконка
  adventurerId: string             // ID искателя
  adventurerName: string           // Кэшированное имя искателя
  adventurerData?: Adventurer      // Старый формат (совместимость)
  adventurerExtended?: AdventurerExtended  // Полные данные
  weaponId: string                 // ID оружия
  weaponName: string               // Кэшированное имя оружия
  weaponData: CraftedWeaponV2      // Копия данных оружия
  startedAt: number                // Время начала (timestamp)
  endsAt: number                    // Время окончания (timestamp)
  deposit: number                   // Сохранённый депозит
  suppliesCost: number             // Сохранённая стоимость снабжения
}
```

#### RecoveryQuest

```typescript
interface RecoveryQuest {
  id: string                        // Уникальный ID квеста
  lostWeaponId: string             // ID потерянного оружия
  lostWeaponData: CraftedWeaponV2  // Копия данных оружия
  originalExpeditionId: string     // ID исходной экспедиции
  originalExpeditionName: string   // Название исходной экспедиции
  cost: number                     // Стоимость восстановления
  duration: number                 // Длительность (мс)
  status: 'available' | 'active' | 'completed' | 'declined'
  startedAt?: number              // Время начала
  endsAt?: number                  // Время окончания
}
```

#### ExpeditionHistoryEntry

```typescript
interface ExpeditionHistoryEntry {
  id: string                        // Уникальный ID записи
  expeditionName: string           // Название экспедиции
  expeditionIcon: string           // Иконка экспедиции
  adventurerName: string           // Имя искателя
  adventurerData?: Adventurer      // Данные искателя (старый формат)
  adventurerExtended?: AdventurerExtended  // Полные данные
  weaponName: string               // Имя оружия
  completedAt: number              // Время завершения
  success: boolean                 // Успех ли
  commission: number                // Заработанное золото
  warSoul: number                   // Заработанные души войны
  glory: number                    // Заработанная слава
  weaponLost: boolean              // Потеряно ли оружие
  isCrit?: boolean                 // Критический успех
}
```

---

## Типы экспедиций

### По типу (ExpeditionType)

| Тип | Иконка | Описание | Множитель WarSoul |
|-----|--------|----------|-------------------|
| hunt | ⚔️ | Охота на монстров | 1.2x |
| scout | 💎 | Разведка территорий | 1.0x |
| clear | 🏰 | Зачистка подземелий | 1.5x |
| delivery | 📜 | Сопровождение караванов | 0.8x |
| magic | 🧙 | Магические задания | 1.3x |

### По сложности (ExpeditionDifficulty)

| Сложность | Уровень | Диапазон уровней искателей | Шанс провала | Шанс потери | Звёзды |
|-----------|--------|---------------------------|--------------|-------------|--------|
| easy | 1 (Новичок) | 1-10 | 5% | 5% | ⭐ |
| normal | 2 (Опытный) | 8-20 | 15% | 10% | ⭐⭐ |
| hard | 3 (Ветеран) | 18-30 | 30% | 15% | ⭐⭐⭐ |
| extreme | 4 (Мастер) | 28-40 | 50% | 20% | ⭐⭐⭐⭐ |
| legendary | 5 (Герой) | 38-50 | 70% | 25% | ⭐⭐⭐⭐⭐ |

### Примеры экспедиций

#### Лёгкие (уровень гильдии 1)

```typescript
{
  id: 'rat_cellar',
  name: 'Крысы в подвале',
  description: 'Крысы заполонили подвал таверны. Простая работа.',
  icon: '🐀',
  type: 'clear',
  difficulty: 'easy',
  duration: 120,              // 2 минуты
  cost: { supplies: 5, deposit: 10 },
  reward: { baseGold: 25, baseWarSoul: 1 },
  minGuildLevel: 1,
  failureChance: 3,
  weaponLossChance: 2,
  recommendedWeaponTypes: ['dagger', 'sword'],
  minWeaponAttack: 3,
}
```

#### Легендарные (уровень гильдии 5)

```typescript
{
  id: 'lich_tomb',
  name: 'Гробница лича',
  description: 'Древний лич хранит секреты бессмертия.',
  icon: '💀',
  type: 'magic',
  difficulty: 'legendary',
  duration: 5400,             // 90 минут
  cost: { supplies: 800, deposit: 1600 },
  reward: { 
    baseGold: 4000, 
    baseWarSoul: 200,
    bonusEssence: 25,
  },
  minGuildLevel: 5,
  failureChance: 55,
  weaponLossChance: 22,
  recommendedWeaponTypes: ['sword', 'mace', 'hammer'],
  minWeaponAttack: 60,
}
```

---

## Поток пользователя

### Диаграмма потока

```
┌──────────────┐
│  Начало      │
│  (Гильдия)   │
└──────┬───────┘
       ↓
┌─────────────────────────────────────┐
│  Показать список доступных экспедиций│
│  (3 случайных из доступных по уровню)│
└──────┬──────────────────────────────┘
       ↓
┌──────────────────┐    ┌──────────────────┐
│  Выбрать        │    │  Обновить список │
│  экспедицию     │    │  (за золото)     │
└──────┬───────────┘    └────────┬─────────┘
       ↓                         ↓
┌─────────────────────────────────────┐
│  Показать доступное оружие          │
│  (фильтр: прочность > 10%,          │
│   атака >= мин. требования,         │
│   не используется в экспедиции)     │
└──────┬──────────────────────────────┘
       ↓
┌──────────────────┐    ┌──────────────────┐
│  Выбрать        │    │  Нет оружия →     │
│  оружие         │    │  Создать в кузнице│
└──────┬───────────┘    └────────┬─────────┘
       ↓                         ↓
┌─────────────────────────────────────┐
│  Показать поиск искателей            │
│  (RecruitmentInterface)             │
│  - Случайные искатели               │
│  - Поиск по параметрам              │
│  - Предложить контракт              │
└──────┬──────────────────────────────┘
       ↓
┌──────────────────┐    ┌──────────────────┐
│  Выбрать        │    │  Нет искателей   │
│  искателя       │    │  (обновить)      │
└──────┬───────────┘    └────────┬─────────┘
       ↓                         ↓
┌─────────────────────────────────────┐
│  Показать модификаторы и прогноз     │
│  - Шанс успеха                       │
│  - Награды                           │
│  - Риски                             │
│  - Детализация модификаторов         │
└──────┬──────────────────────────────┘
       ↓
┌──────────────────┐    ┌──────────────────┐
│  Запустить      │    │  Отменить        │
│  экспедицию     │    │  (сброс выбора)  │
└──────┬───────────┘    └────────┬─────────┘
       ↓
┌─────────────────────────────────────┐
│  Активная экспедиция                 │
│  - Таймер                           │
│  - Прогресс                         │
│  - Ожидание завершения              │
└──────┬──────────────────────────────┘
       ↓
┌─────────────────────────────────────┐
│  Завершение экспедиции              │
│  - Расчёт результата               │
│  - Применение наград/штрафов        │
│  - Запись в историю                 │
│  - Создание квеста (если потеряно)  │
└──────┬──────────────────────────────┘
       ↓
┌──────────────┐
│  Обновление  │
│  интерфейса  │
└──────────────┘
```

### Пошаговое описание

#### 1. Выбор экспедиции

**Компонент:** `ExpeditionSelectionCard`

**Логика:**
```typescript
// Проверка доступности
const canSelectExpedition = (expedition: ExpeditionTemplate) => {
  const totalCost = expedition.cost.supplies + expedition.cost.deposit
  if (resources.gold < totalCost) {
    return { can: false, reason: `Нужно ${totalCost} золота` }
  }
  return { can: true, reason: '' }
}
```

**Фильтр экспедиций:**
- Доступны только экспедиции с `minGuildLevel <= guild.level`
- Показывается 3 случайных экспедиции
- Можно обновить список за золото (`refreshCost = 10 * player.level`)

#### 2. Выбор оружия

**Компонент:** `WeaponSelectionCard`

**Логика фильтрации:**
```typescript
const availableWeapons = weaponInventory.weapons.filter(w => {
  // Базовые проверки
  if (w.currentDurability <= 10) return false
  if (guild.activeExpeditions.some(e => e.weaponId === w.id)) return false
  
  // Если выбрана экспедиция, проверяем требования
  if (selectedExpedition && w.stats.attack < selectedExpedition.minWeaponAttack) {
    return false
  }
  
  return true
})
```

**Причины недоступности:**
- Оружие слишком повреждено (`durability <= 10`)
- Оружие уже в активной экспедиции
- Атака ниже минимального требования экспедиции

#### 3. Выбор искателя

**Компонент:** `RecruitmentInterface`

**Типы искателей:**
- **Случайные искатели** — автоматически генерируются пулом (4 искателя)
- **Поиск по параметрам** — можно искать по уровню, типу оружия, чертам
- **Предложить контракт** — для заключения долгосрочного сотрудничества

**Логика выбора:**
```typescript
const canSelectAdventurer = (adventurer: Adventurer) => {
  if (!selectedWeapon) {
    return { can: false, reason: 'Сначала выберите оружие' }
  }
  const minAttack = adventurer.requirements?.minAttack ?? 0
  if (selectedWeapon.stats.attack < minAttack) {
    return { can: false, reason: `Искатель требует атаку ${minAttack}+` }
  }
  return { can: true, reason: '' }
}
```

#### 4. Запуск экспедиции

**Action:** `startExpeditionFull`

**Проверки перед запуском:**
```typescript
const canStartExpedition = () => {
  if (!selectedExpedition) return { can: false, reason: 'Выберите экспедицию' }
  if (!selectedWeapon) return { can: false, reason: 'Выберите оружие' }
  if (!selectedAdventurer) return { can: false, reason: 'Выберите искателя' }
  
  const totalCost = expedition.cost.supplies + expedition.cost.deposit
  if (resources.gold < totalCost) {
    return { can: false, reason: 'Недостаточно золота' }
  }
  
  return { can: true, reason: '' }
}
```

**Процесс запуска:**
1. Списывается стоимость (`supplies + deposit`)
2. Создаётся `ActiveExpedition`
3. Добавляется в `guild.activeExpeditions`
4. Оружие помечается как занятое
5. Искатель помечается как занятый

---

## Система модификаторов v2

### Архитектура модификаторов

```
┌─────────────────────────────────────────────────────────────┐
│                   ModifierContext                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AdventurerExtended                                   │  │
│  │  • identity (имя, титул, портрет)                     │  │
│  │  • combat (уровень, стиль, бонусы)                    │  │
│  │  • personality (личность, мотивация)                 │  │
│  │  • traits (черты характера)                          │  │
│  │  • rarity (редкость, бонусы)                          │  │
│  └──────────────────────────────────────────────────────┘  │
│  +                                                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ExpeditionTemplate                                   │  │
│  │  • type (тип экспедиции)                              │  │
│  │  • difficulty (сложность)                             │  │
│  │  • duration (длительность)                           │  │
│  │  • minWeaponAttack (мин. атака)                       │  │
│  └──────────────────────────────────────────────────────┘  │
│  +                                                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Weapon (CraftedWeaponV2)                             │  │
│  │  • type (тип оружия)                                 │  │
│  │  • attack (атака)                                    │  │
│  │  • quality (качество 0-100)                          │  │
│  │  • qualityRank (ранг качества)                       │  │
│  │  • epicMultiplier (эпик-множитель)                   │  │
│  │  • combatMaterialId (боевой материал)                 │  │
│  │  • durability (прочность)                             │  │
│  └──────────────────────────────────────────────────────┘  │
│  +                                                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Guild                                                │  │
│  │  • level (уровень гильдии)                           │  │
│  │  • glory (слава)                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓
            ┌─────────────────────┐
            │  calculateModifiers │
            │  (сбор модификаторов)│
            └─────────┬───────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                Modifier Targets (цели)                       │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐ │
│  │success   │ gold     │ warSoul  │ weapon   │ crit     │ │
│  │Chance    │          │          │ Wear     │ Chance   │ │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘ │
│  + weaponLossChance                                         │
└─────────────────────────────────────────────────────────────┘
```

### Цели модификаторов (ModifierTarget)

| Цель | Описание | Базовое значение |
|------|----------|------------------|
| successChance | Шанс успешного выполнения экспедиции | 95% - failureChance |
| gold | Множитель золота (%) | 0% (1.0x) |
| warSoul | Множитель душ войны (%) | 0% (1.0x) |
| glory | Слава (фиксированное значение) | 0 |
| weaponWear | Износ оружия (дополнительный %) | 0 |
| weaponLossChance | Шанс потери оружия (%) | weaponLossChance |
| critChance | Шанс критического успеха (%) | 5% |

### Провайдеры модификаторов

#### 1. RarityModifierProvider

```typescript
// Бонусы от редкости искателя
const RARITY_MODIFIERS: Record<Rarity, Partial<ModifierResult>> = {
  common: {
    successChance: 0,
    goldBonus: 0,
    warSoulBonus: 0,
  },
  rare: {
    successChance: 5,
    goldBonus: 10,
    warSoulBonus: 5,
  },
  epic: {
    successChance: 10,
    goldBonus: 25,
    warSoulBonus: 15,
    critChance: 5,
  },
  legendary: {
    successChance: 15,
    goldBonus: 50,
    warSoulBonus: 30,
    critChance: 10,
  },
}
```

#### 2. LevelModifierProvider

```typescript
// Бонусы от уровня искателя (1-50)
const calculateLevelBonus = (level: number, missionTier: number) => {
  const levelDiff = level - missionTier * 10  // Соответствие уровня
  
  if (levelDiff >= 5) {
    return { successChance: 10, wearReduction: 5 }  // Переподготовлен
  } else if (levelDiff >= 0) {
    return { successChance: 5, wearReduction: 2 }   // Идеально подходит
  } else if (levelDiff >= -5) {
    return { successChance: -5, wearIncrease: 3 }  // Чуть ниже
  } else {
    return { successChance: -15, wearIncrease: 10 } // Опасно
  }
}
```

#### 3. CombatStyleModifierProvider

```typescript
// Бонусы от стиля боя
const COMBAT_STYLE_MODIFIERS: Record<CombatStyle, Partial<ModifierResult>> = {
  aggressive: {
    successChance: 5,
    goldBonus: 15,
    weaponWear: 3,
  },
  defensive: {
    successChance: 3,
    wearReduction: 5,
    weaponLossReduction: 3,
  },
  balanced: {
    goldBonus: 5,
    warSoulBonus: 5,
  },
  tactical: {
    successChance: 8,
    critChance: 3,
  },
  reckless: {
    successChance: -5,
    goldBonus: 25,
    weaponWear: 5,
    weaponLossIncrease: 5,
  },
}
```

#### 4. TraitModifierProvider

```typescript
// Примеры черт и их модификаторов
const TRAIT_MODIFIERS: Record<string, Partial<ModifierResult>> = {
  'treasure_hunter': {
    goldBonus: 20,
  },
  'lucky': {
    successChance: 8,
    critChance: 5,
  },
  'careful': {
    wearReduction: 5,
    weaponLossReduction: 5,
  },
  'fearless': {
    successChance: 5,
    weaponLossReduction: 3,
  },
  'experienced': {
    goldBonus: 10,
    warSoulBonus: 10,
  },
}
```

#### 5. WeaponModifierProvider

```typescript
// Модификаторы от оружия
const calculateWeaponModifiers = (weapon: Weapon) => {
  const modifiers: ModifierResult = {}
  
  // Бонус от качества (0-100)
  if (weapon.quality >= 90) {
    modifiers.successChance = 5
    modifiers.wearReduction = 3
  } else if (weapon.quality >= 70) {
    modifiers.successChance = 3
    modifiers.wearReduction = 1
  }
  
  // Бонус от эпик-множителя
  if (weapon.epicMultiplier > 2) {
    modifiers.goldBonus = 15
    modifiers.warSoulBonus = 15
  } else if (weapon.epicMultiplier > 1.5) {
    modifiers.goldBonus = 8
    modifiers.warSoulBonus: 8
  }
  
  // Бонус от боевого материала
  const materialBonus = getCombatMaterialBonus(weapon.combatMaterialId)
  if (materialBonus) {
    Object.assign(modifiers, materialBonus)
  }
  
  return modifiers
}
```

#### 6. ExpeditionTypeModifierProvider

```typescript
// Бонусы от типа экспедиции
const EXPEDITION_TYPE_MODIFIERS: Record<ExpeditionType, Partial<ModifierResult>> = {
  hunt: {
    warSoulBonus: 20,
  },
  scout: {
    goldBonus: 10,
  },
  clear: {
    warSoulBonus: 50,
    weaponWear: 5,
  },
  delivery: {
    successChance: 5,
    weaponWear: -3,  // Меньше износа
  },
  magic: {
    warSoulBonus: 30,
    critChance: 3,
  },
}
```

### Формула расчёта

```typescript
// 1. Базовые значения
const baseSuccessChance = 100 - expedition.failureChance
const baseGold = expedition.reward.baseGold
const baseWarSoul = expedition.reward.baseWarSoul
const baseWeaponLoss = expedition.weaponLossChance
const baseWeaponWear = 10
const baseCritChance = 5

// 2. Сбор модификаторов через провайдеры
const modifiers = calculateModifiers(context, baseValues)

// 3. Применение модификаторов
const finalSuccessChance = clamp(5, 95, 
  baseSuccessChance + modifiers.successChance.total
)

const goldMultiplier = 1 + (modifiers.gold.total / 100)
const finalGold = Math.floor(baseGold * goldMultiplier)

const warSoulMultiplier = 1 + (modifiers.warSoul.total / 100)
const finalWarSoul = Math.max(1, Math.floor(baseWarSoul * warSoulMultiplier))

const finalWeaponWear = clamp(1, 50,
  baseWeaponWear + modifiers.weaponWear.total
)

const finalWeaponLoss = clamp(0, 50,
  baseWeaponLoss + modifiers.weaponLossChance.total
)

const finalCritChance = clamp(0, 25,
  baseCritChance + modifiers.critChance.total
)

// 4. Расчёт комиссии
const commissionPercent = min(30, 15 + (guildLevel - 1) * 2)
const finalCommission = Math.floor(finalGold * commissionPercent / 100)
```

---

## Расчёт результатов

### Основная функция: `calculateExpeditionResult`

**Файл:** `src/lib/expedition-calculator-v2.ts`

**Параметры:**
```typescript
function calculateExpeditionResult(
  adventurer: AdventurerExtended,
  expedition: ExpeditionTemplate,
  guildLevel: number,
  weaponAttack: number,
  weaponDurability: number,
  weaponType: string,
  weaponId: string,
  // Новые параметры для CraftedWeaponV2
  weaponQualityRank?: string,
  weaponEpicMultiplier?: number,
  weaponCombatMaterialId?: string,
  weaponQuality?: number
): ExpeditionCalculation
```

**Возвращаемое значение:**
```typescript
interface ExpeditionCalculation {
  successChance: number           // Итоговый шанс успеха (%)
  commission: number              // Комиссия гильдии
  warSoul: number                 // Души войны
  weaponWear: number              // Износ оружия (%)
  weaponLossChance: number        // Шанс потери оружия (%)
  critChance: number              // Шанс крита (%)
  
  // Детализация модификаторов для UI
  successModifiers: ModifierDetail[]
  goldModifiers: ModifierDetail[]
  warSoulModifiers: ModifierDetail[]
  weaponLossModifiers: ModifierDetail[]
  weaponWearModifiers: ModifierDetail[]
  critModifiers: ModifierDetail[]
  
  // Соответствие уровня
  levelMatch: {
    adventurerLevel: number
    missionTier: number
    missionTierName: string
    match: 'optimal' | 'underlevel' | 'overlevel' | 'dangerous'
    matchDescription: string
  }
  
  // Рекомендация
  recommendation: {
    rating: 'excellent' | 'good' | 'risky' | 'dangerous'
    description: string
  }
}
```

### Определение успеха/провала

```typescript
// 1. Расчёт шанса успеха
const calculation = calculateExpeditionResult(...)
const successChance = calculation.successChance

// 2. Ролл результата
const roll = Math.random() * 100
const success = roll < successChance

// 3. Проверка крита (только при успехе)
const isCrit = success && (Math.random() * 100 < calculation.critChance)
const critMultiplier = isCrit ? 2 : 1

// 4. Определение потери оружия (только при провале)
const weaponLost = !success && (Math.random() * 100 < calculation.weaponLossChance)
```

### Расчёт наград

```typescript
const commission = success 
  ? Math.floor(calculation.commission * critMultiplier)
  : 0

const warSoul = success
  ? Math.floor(calculation.warSoul * critMultiplier)
  : 0

const glory = success
  ? Math.floor((5 + Math.random() * 5) * critMultiplier)
  : 1  // +1 слава даже при провале

const weaponWear = calculation.weaponWear
```

### Соответствие уровня (Level Match)

```typescript
const calculateLevelMatch = (adventurerLevel, difficulty) => {
  const difficultyData = difficultyInfo[difficulty]
  const [minLevel, maxLevel] = difficultyData.levelRange
  
  if (adventurerLevel < minLevel - 5) {
    return {
      match: 'dangerous',
      matchDescription: `Уровень искателя слишком низкий для этой миссии (рекомендуется ${minLevel}+)`
    }
  } else if (adventurerLevel > maxLevel + 10) {
    return {
      match: 'overlevel',
      matchDescription: `Искатель слишком опытный для такой простой миссии`
    }
  } else if (adventurerLevel >= minLevel && adventurerLevel <= maxLevel) {
    return {
      match: 'optimal',
      matchDescription: `Отличное соответствие уровню миссии`
    }
  } else {
    return {
      match: 'underlevel',
      matchDescription: `Уровень чуть ниже рекомендованного, но допустимо`
    }
  }
}
```

### Рекомендации

```typescript
if (successChance >= 80) {
  recommendation = {
    rating: 'excellent',
    description: 'Отличный выбор! Высокий шанс успеха и хорошая награда.'
  }
} else if (successChance >= 60) {
  recommendation = {
    rating: 'good',
    description: 'Хороший выбор. Шанс успеха приемлемый.'
  }
} else if (successChance >= 40) {
  recommendation = {
    rating: 'risky',
    description: 'Рискованно. Есть значительный шанс провала.'
  }
} else {
  recommendation = {
    rating: 'dangerous',
    description: 'Опасно! Высокий риск провала и потери оружия.'
  }
}
```

---

## Квесты восстановления

### Создание квеста

**Условие:** Оружие потеряно при провале экспедиции

```typescript
const createRecoveryQuest = (expedition: ActiveExpedition, template: ExpeditionTemplate, weapon: Weapon) => {
  return {
    id: generateId(),
    lostWeaponId: weapon.id,
    lostWeaponData: weapon,
    originalExpeditionId: expedition.id,
    originalExpeditionName: expedition.name,
    cost: Math.floor(template.cost.deposit * 0.5),  // 50% от депозита
    duration: template.duration * 2 * 1000,         // 2x длительность
    status: 'available',
  }
}
```

### Процесс восстановления

```
┌─────────────────────────────────────┐
│  Оружие потеряно в экспедиции       │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  Создаётся RecoveryQuest            │
│  - status: 'available'              │
│  - стоимость: 50% от депозита       │
│  - длительность: 2x экспедиции      │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  Игрок видит квест в списке         │
│  "Потерянное оружие"                │
└──────────────┬──────────────────────┘
               ↓
    ┌──────────┴──────────┐
    ↓                     ↓
┌──────────────┐   ┌──────────────┐
│ Принять     │   │ Отклонить   │
│ квест       │   │             │
└──────┬───────┘   └──────┬───────┘
       ↓                  ↓
┌──────────────────┐  ┌──────────────┐
│ Списать золото   │  │ status:      │
│ и начать         │  │ 'declined'   │
│ ожидание         │  └──────────────┘
└──────┬───────────┘
       ↓
┌─────────────────────────────────────┐
│  status: 'active'                   │
│  Ожидание завершения                │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  Завершение по таймеру              │
│  status: 'completed'                │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  Оружие возвращается в инвентарь     │
│  - Сохраняются все характеристики    │
│  - Сохраняются зачарования           │
│  - Сохраняется War Soul              │
└─────────────────────────────────────┘
```

### Интерфейс квеста

**Компонент:** `RecoveryQuestCard`

```typescript
interface RecoveryQuestCardProps {
  quest: RecoveryQuest
}

// Отображает:
// - Название потерянного оружия
// - Исходную экспедицию
// - Стоимость восстановления
// - Длительность
// - Статус
// - Кнопки: Принять / Отклонить / Завершить
```

---

## Интерфейс пользователя

### Компоненты UI

#### 1. ActiveExpeditionCard

Показывает активную экспедицию с прогрессом.

**Поля:**
- Название экспедиции
- Имя искателя
- Имя оружия
- Оставшееся время
- Прогресс-бар
- Прогноз результата (опционально)

```typescript
const ActiveExpeditionCard = ({ expedition }: { expedition: ActiveExpedition }) => {
  const remainingTime = expedition.endsAt - Date.now()
  const progress = 1 - (remainingTime / (expedition.endsAt - expedition.startedAt))
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{expedition.expeditionName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <p>Искатель: {expedition.adventurerName}</p>
          <p>Оружие: {expedition.weaponName}</p>
        </div>
        <Progress value={progress * 100} />
        <p>Осталось: {formatTime(remainingTime)}</p>
      </CardContent>
    </Card>
  )
}
```

#### 2. ExpeditionSelectionCard

Карточка для выбора экспедиции.

**Поля:**
- Иконка и название
- Тип и сложность
- Описание
- Длительность
- Стоимость (supplies + deposit)
- Минимальная атака
- Шанс провала
- Награды (базовое золото и души войны)
- Индикатор выбора
- Причина недоступности (если не выбрана)

#### 3. WeaponSelectionCard

Карточка для выбора оружия.

**Поля:**
- Иконка типа оружия
- Название
- Атака
- Прочность (текущая/максимальная)
- Качество
- War Soul
- Epic Multiplier
- Зачарования (опционально)
- Индикатор выбора
- Причина недоступности

#### 4. RecruitmentInterface

Интерфейс найма искателей.

**Табы:**
- Случайные искатели (пул из 4)
- Поиск по параметрам
- Предложить контракт

**Поля карточки искателя:**
- Портрет
- Имя и титул
- Редкость (цвет)
- Уровень
- Стиль боя
- Черты (до 3)
- Уникальные бонусы (до 3)
- Статистика (если был в экспедициях)
- Кнопка "Выбрать"

**Поля поиска:**
- Уровень (min/max)
- Стиль боя
- Редкость
- Черты (фильтр)
- Сортировка

#### 5. ExpeditionForecast

Секция прогноза миссии.

**Показывает:**
- Шанс успеха (прогресс-бар)
- Риск потери оружия
- Комиссия гильдии
- Души войны
- Износ оружия
- Модификаторы успеха
- Модификаторы золота
- Рекомендация (excellent/good/risky/dangerous)

**Пример:**
```typescript
<ExpeditionForecast
  expedition={{
    difficulty: 'hard',
    type: 'hunt',
    baseGold: 350,
    baseWarSoul: 18,
    successChance: 72,
    goldReward: 52,
    warSoulReward: 27,
    weaponWear: 8,
    weaponLossChance: 10,
    successModifiers: [
      { source: 'Редкость', value: 10, type: 'positive' },
      { source: 'Уровень', value: 5, type: 'positive' },
      { source: 'Стиль боя', value: 8, type: 'positive' },
    ],
    goldModifiers: [
      { source: 'Редкость', value: 25, type: 'positive' },
    ],
  }}
  advice={{
    type: 'good',
    icon: '👍',
    text: 'Хороший выбор',
    detail: 'Шанс успеха выше среднего, награда достойная.'
  }}
/>
```

#### 6. ModifierBreakdown

Компонент для отображения детализации модификаторов.

**Показывает:**
- Источник модификатора
- Иконка источника
- Значение (+/-)
- Тип (positive/negative/neutral)
- Описание

**Пример:**
```typescript
<ModifierBreakdown
  title="Шанс успеха"
  icon="🎯"
  modifiers={[
    {
      source: 'Редкость',
      sourceIcon: '💎',
      value: 10,
      description: 'Эпический искатель',
      type: 'positive'
    },
    {
      source: 'Уровень',
      sourceIcon: '⭐',
      value: 5,
      description: 'Уровень искателя 25, миссия tier 3',
      type: 'positive'
    },
    {
      source: 'Стиль боя',
      sourceIcon: '⚔️',
      value: 8,
      description: 'Тактический стиль',
      type: 'positive'
    },
  ]}
  baseValue={70}
  finalValue={93}
/>
```

### Полный экран экспедиций

**Структура:**
```
┌─────────────────────────────────────────────┐
│  1. Активные экспедиции (если есть)          │
│     Grid карточек с таймером                │
├─────────────────────────────────────────────┤
│  2. Квесты восстановления (если есть)         │
│     Grid карточек с красной рамкой           │
├─────────────────────────────────────────────┤
│  3. Доступные экспедиции                     │
│     Grid из 3 карточек + кнопка обновления  │
├─────────────────────────────────────────────┤
│  4. Выбор оружия (если выбрана экспедиция)  │
│     Grid карточек оружия                    │
├─────────────────────────────────────────────┤
│  5. Поиск искателей (если выбрано оружие)   │
│     RecruitmentInterface                    │
├─────────────────────────────────────────────┤
│  6. Кнопка запуска + модификаторы            │
│     - Сводка результатов                     │
│     - Рекомендация                           │
│     - Сворачиваемая детализация               │
├─────────────────────────────────────────────┤
│  7. История экспедиций (если есть)           │
│     Список записей в обратном порядке       │
└─────────────────────────────────────────────┘
```

---

## История и статистика

### История экспедиций

**Хранится в:** `guild.history`

**Поля записи:**
```typescript
interface ExpeditionHistoryEntry {
  id: string
  expeditionName: string
  expeditionIcon: string
  adventurerName: string
  adventurerData?: Adventurer
  adventurerExtended?: AdventurerExtended
  weaponName: string
  completedAt: number
  success: boolean
  commission: number
  warSoul: number
  glory: number
  weaponLost: boolean
  isCrit?: boolean
}
```

**Отображение:**
- Показывается последние 20 записей
- Сортировка по времени (новые сверху)
- Клик на иконку искателя открывает карточку
- Возможность предложить контракт

### Статистика гильдии

**Хранится в:** `guild.stats`

**Поля:**
```typescript
interface GuildStats {
  totalExpeditions: number
  successfulExpeditions: number
  failedExpeditions: number
  weaponsLost: number
  weaponsRecovered: number
  totalCommission: number
  totalWarSoul: number
  totalGlory: number
}
```

**Отображение:**
- Общее количество экспедиций
- Успешные / проваленные
- Потеряно / восстановлено оружия
- Общий заработок (золото)
- Всего добыто душ войны
- Всего заработано славы

### Уровни гильдии

**Константа:** `GUILD_LEVELS`

```typescript
const GUILD_LEVELS = [
  { level: 1, requiredGlory: 0, commissionBonus: 15 },
  { level: 2, requiredGlory: 500, commissionBonus: 17 },
  { level: 3, requiredGlory: 1500, commissionBonus: 20 },
  { level: 4, requiredGlory: 4000, commissionBonus: 24 },
  { level: 5, requiredGlory: 10000, commissionBonus: 30 },
]
```

**Расчёт уровня:**
```typescript
function getGuildLevel(glory: number): number {
  for (let i = GUILD_LEVELS.length - 1; i >= 0; i--) {
    if (glory >= GUILD_LEVELS[i].requiredGlory) {
      return GUILD_LEVELS[i].level
    }
  }
  return 1
}
```

**Бонусы уровня:**
- Разблокировка новых экспедиций
- Увеличение комиссии (15% → 30%)
- Увеличение лимита контрактных искателей

---

## Ссылки на файлы

### Типы данных
- `src/types/guild.ts` — основные типы системы экспедиций
- `src/types/adventurer-extended.ts` — расширенные данные искателя
- `src/types/contract.ts` — типы контрактов

### Данные
- `src/data/expedition-templates.ts` — шаблоны экспедиций
- `src/data/adventurer-traits.ts` — черты искателей
- `src/data/unique-bonuses.ts` — уникальные бонусы
- `src/data/adventurer-rarity.ts` — система редкости

### Store
- `src/store/slices/guild-slice.ts` — slice гильдии с экспедициями
- `src/store/game-store-composed.ts` — объединённый store

### Утилиты
- `src/lib/expedition-calculator-v2.ts` — расчёт результатов (v2)
- `src/lib/store-utils/expedition-utils.ts` — утилиты экспедиций
- `src/lib/adventurer-generator-extended.ts` — генерация искателей
- `src/lib/contract-manager.ts` — управление контрактами

### Компоненты
- `src/components/guild/expeditions-section.tsx` — основной секции
- `src/components/guild/expeditions/ExpeditionSelectionCard.tsx` — карточка экспедиции
- `src/components/guild/recruitment-interface.tsx` — интерфейс найма
- `src/components/guild/adventurer-card/ExpeditionForecast.tsx` — прогноз экспедиции
- `src/components/ui/modifier-breakdown.tsx` — детализация модификаторов

---

## Заключение

Система экспедиций представляет собой комплексный механик, включающий:

1. **Выбор экспедиции** — 3 случайные из доступных по уровню гильдии
2. **Выбор оружия** — фильтрация по прочности и требованиям атаки
3. **Выбор искателя** — случайные или поиск по параметрам
4. **Расчёт результатов** — через систему модификаторов v2
5. **Мониторинг** — активные экспедиции с таймером
6. **Восстановление** — квесты для потерянного оружия
7. **История** — записи о всех экспедициях
8. **Статистика** — агрегированные данные о гильдии

Система модификаторов v2 позволяет легко добавлять новые эффекты через провайдеры без изменения основной логики расчёта.
