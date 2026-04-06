# Душа войны: модель только через Soul Potential

> Обновление: 2026-04-06. Этот документ фиксирует целевую модель, где **ёмкость пула не используется**. В крафте и экспедициях учитывается только **Soul Potential** как множитель получения души войны.

---

## 1. Цель переработки

Упростить и сделать полезной механику для игрока:

1. Убрать из планирования и UX метрику «пул души» (сотни тысяч), которая не помогает принимать решения.
2. Оставить одну ключевую метрику: **Потенциал души (`soulPotential`)**.
3. Привязать потенциал к материалам и комбинациям материалов, чтобы сборка реально влияла на скорость прокачки тиров.
4. Синхронизировать логику крафта, прогноза и экспедиции через одну формулу.

---

## 2. Новая модель (без пула)

### 2.1. Что остаётся

- `warSoul` — накопленная душа на оружии.
- `WAR_SOUL_TIERS` — пороги тиров по `warSoul`.
- Бонусы тира (`warSoulBonus`, `successBonus`, `goldBonus`, `critChance`) остаются как сейчас.

### 2.2. Что убираем из дизайна

- `maxWarSoul` больше **не участвует в балансе, прогнозе и UI**.
- Функции и отображения, связанные с ёмкостью пула, считаются legacy и должны быть исключены из пользовательского интерфейса.

### 2.3. Что вводим как главный параметр

- `soulPotential` — множитель к награде души войны за успешную экспедицию.
- Целевой диапазон: **x1.00...x3.00** (база x1, сильные сборки x2-x3).

---

## 3. Формула Soul Potential

### 3.1. Базовая формула

```text
rawPotential = basePotential + materialScore + synergyScore + techniqueScore
soulPotential = clamp(rawPotential, SOUL_POTENTIAL_MIN, SOUL_POTENTIAL_MAX)
```

Рекомендуемые стартовые константы:

- `basePotential = 1.00`
- `SOUL_POTENTIAL_MIN = 0.85`
- `SOUL_POTENTIAL_MAX = 3.00`
- `SYNERGY_CAP = +0.60` (суммарный вклад синергий до clamp)

### 3.2. Вклад материалов (`materialScore`)

Считаем по выбранным частям оружия (`blade`, `guard`, `grip`, `pommel`).

```text
partContribution = normalizeSoul(material.weaponEffects.soulCapacity) * partWeight
materialScore = sum(partContribution) * MATERIAL_SCORE_SCALE
```

Где:

- `normalizeSoul(...)` — нормализация `weaponEffects.soulCapacity` в диапазон 0...1 по каталогу материалов.
- `partWeight` — вклад части в душу (стартово: blade 0.40, guard 0.25, grip 0.20, pommel 0.15).
- `MATERIAL_SCORE_SCALE` — коэффициент, который даёт итоговый материалный вклад примерно до `+0.90`.

### 3.3. Вклад техник (`techniqueScore`)

Стартово можно оставить простым:

- `techniqueScore = sum(technique.effects.conductivityBonus) * TECHNIQUE_SOUL_K`
- Ограничить: `-0.10 ... +0.30`

---

## 4. Интеграция в награду экспедиции

После расчёта базовой награды души войны:

```text
effectiveWarSoul = floor(baseWarSoul * soulPotential * tierMult * critMult)
```

где:

- `baseWarSoul` — из `expedition-calculator-v2`;
- `tierMult = 1 + warSoulBonus / 100` — бонус текущего тира;
- `critMult` — как в текущей логике (например x1.5 при крите).

---

## 5. Синергии материалов

### 5.1. Общая логика

- Синергии описываются данными (`WarSoulSynergyRule[]`), не `if-else` по коду.
- Каждое правило имеет: `id`, `name`, `requirements`, `bonus`, `description`.
- Срабатывает любое число правил, но итоговый `synergyScore` режется `SYNERGY_CAP`.
- Приоритет проверки: **точные ID материалов** -> **категории** -> **fallback по части**.

### 5.2. Формат правила

```ts
type WarSoulSynergyRule = {
  id: string
  name: string
  requirements: {
    blade?: string[]
    guard?: string[]
    grip?: string[]
    pommel?: string[]
    categoriesAll?: Array<'metal' | 'alloy' | 'wood' | 'leather' | 'stone'>
    atLeastLegendaryParts?: number
  }
  bonus: number // additive to rawPotential
  note: string
}
```

### 5.3. Стартовый набор: 10 комбинаций (конкретные материалы)

Ниже комбинации, которые нужно сразу занести в документ и в реестр данных.

| # | ID правила | Комбинация материалов | Условие | Бонус |
|---|------------|------------------------|---------|-------|
| 1 | `soul_pair_iron_oak` | `iron` + `oak` | `blade` = `iron` или `iron_alloy`, `grip` = `oak` | `+0.08` |
| 2 | `soul_pair_steel_ash` | `steel` + `ash` | `blade` = `steel`, `grip` = `ash` | `+0.11` |
| 3 | `soul_pair_silver_ebony` | `silver_alloy` + `ebony` | `blade/guard` содержит `silver_alloy`, `grip` = `ebony` | `+0.14` |
| 4 | `soul_pair_mithril_dragon_leather` | `mithril` + `dragon_leather` | `blade` = `mithril` или `mithril_alloy`, `grip` = `dragon_leather` | `+0.22` |
| 5 | `soul_pair_coldiron_bull` | `cold_iron` + `bull_leather` | `blade` = `cold_iron`, `grip` = `bull_leather` | `+0.09` |
| 6 | `soul_pair_obsidian_tanned` | `obsidian` + `tanned_leather` | `blade` = `obsidian`, `grip` = `tanned_leather` | `+0.10` |
| 7 | `soul_core_bloodstone` | `bloodstone` как фокус | `pommel` = `bloodstone` и любой металл в `blade` | `+0.12` |
| 8 | `soul_core_granite_ironwood` | `granite` + `ironwood` | `pommel` = `granite`, `grip` = `ironwood` | `+0.10` |
| 9 | `soul_triad_arcane` | `silver_alloy` + `bloodstone` + `ebony` | `blade/guard` = `silver_alloy`, `pommel` = `bloodstone`, `grip` = `ebony` | `+0.20` |
| 10 | `soul_triad_legendary` | `mithril` + `dragon_leather` + `bloodstone` | `blade` = `mithril`/`mithril_alloy`, `grip` = `dragon_leather`, `pommel` = `bloodstone` | `+0.28` |

### 5.4. Пояснение логики 10 комбинаций

- **#1, #2**: ранняя/средняя игра. Дают заметный, но не ломающий буст, обучают игрока идее «правильных пар».
- **#3, #7, #9**: «магический канал» через серебро и кровавик; усиливают душу без обязательной легендарности.
- **#4, #10**: эндгейм-сборки. Самые сильные бонусы, но требуют редких материалов и нескольких слотов одновременно.
- **#5, #8**: «стабильный накопитель». Чуть ниже пикового потенциала, зато рабочие и доступные комбинации.
- **#6**: рискованная сборка (обсидиан), но с полезным приростом души, чтобы риск имел смысл.

---

## 6. UX и прогноз (после переработки)

### 6.1. Что показываем в крафте

- Главная строка: **`Потенциал души: x1.37`**
- Tooltip:
  - вклад частей (`blade`, `guard`, `grip`, `pommel`);
  - сработавшие синергии (+0.XX каждая);
  - итоговый диапазон множителя после clamp.

### 6.2. Что не показываем

- Никаких чисел «пула души» в прогнозе.
- Никаких прогресс-баров, нормализованных под большой `maxWarSoul`.

### 6.3. «Слабое место»

- `soulPotential` не участвует в блоке «слабое место» как стат атаки/прочности/веса.
- Для потенциала отдельная нейтральная карточка: «Эффективность накопления души».

---

## 7. Данные и типы

### 7.1. Тип оружия

Добавить поле в `CraftedWeaponV2`:

```ts
soulPotential?: number
```

Поведение для старых сохранений:

- если поля нет, использовать `1.0`.

### 7.2. Новые данные

- `src/data/war-soul-synergies.ts` — 10 правил из §5.3.
- `src/data/war-soul-balance.ts` — константы (`basePotential`, `caps`, `weights`, `scale`).

---

## 8. План внедрения

| Фаза | Что делаем | Результат |
|------|------------|-----------|
| F1 | Вводим `computeSoulPotential(...)` как чистую функцию | Один источник правды для расчёта потенциала |
| F2 | Добавляем `soulPotential` в результат крафта (`buildCompletedWeaponV2`) | Новое оружие получает множитель |
| F3 | Подключаем множитель в `guild-expedition-cross-slice` | Награда души зависит от сборки |
| F4 | Добавляем 10 синергий из §5.3 | Разные билды реально отличаются по темпу прокачки |
| F5 | Обновляем UI прогноза и тултипы (только потенциал) | Прогноз информативный и понятный |
| F6 | Тесты + документация (`FORMULAS.md`, `04_TYPES_SYSTEM.md`) | Формула стабильна и описана |

---

## 9. Риски и ограничения

- Перекос темпа прокачки при слишком сильных синергиях (`+0.28` и выше) — контролировать через `SYNERGY_CAP`.
- Наложение с `warSoulBonus` тиров может ускорить прогрессию сильнее ожидаемого — нужен плейтест на 3 этапах игры (ранний/средний/эндгейм).
- Если много правил срабатывает одновременно, игроку нужно явное объяснение в tooltip, иначе система будет «чёрным ящиком».

---

## 10. Краткий итог

- Целевая система теперь **без ёмкости пула**: только `warSoul` + тиры + `soulPotential`.
- Влияние материалов становится центральной частью механики через формулу и 10 синергий.
- Прогноз в кузнице показывает то, что реально важно игроку: **насколько быстро это оружие качает Душу войны**.
