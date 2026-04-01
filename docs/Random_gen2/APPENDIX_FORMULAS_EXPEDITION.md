# APPENDIX D. Формулы экспедиции

## Константы калькулятора v2 (`expedition-calculator-v2.ts`)

| Имя | Значение |
|-----|----------|
| BASE_COMMISSION_PERCENT | 15 |
| COMMISSION_PER_GUILD_LEVEL | 2 |
| MAX_COMMISSION_PERCENT | 30 |
| BASE_CRIT_CHANCE | 5 (%) |
| baseWeaponWear (до модификаторов) | 10 |

База успеха: `baseSuccess = 100 - difficultyInfo[expedition.difficulty].failureChance`.

База золота и душ: из шаблона `expedition.reward.baseGold`, `expedition.reward.baseWarSoul`.

База потери оружия: `difficultyInfo[difficulty].weaponLossChance`.

## Сборка после модификаторов

1. Вызывается `calculateModifiers(context, baseValues)`; для целей `gold` и `warSoul` модификаторы трактуются как **проценты к множителю**:  
   - `goldMult = 1 + sum(applied effectiveValue / 100)` по всем модификаторам `gold`.  
   - `finalGold = floor(baseGold * goldMult)`.  
2. Аналогично War Soul: `warSoulMult = 1 + sum(.../100)`, `finalWarSoul = max(1, floor(baseWarSoul * warSoulMult))`.  
3. Успех: `finalSuccess = clamp(result.totals.successChance, 5, 95)` (целое в возврате).  
4. Комиссия:  
   - `commissionPercent = min(MAX_COMMISSION_PERCENT, BASE_COMMISSION_PERCENT + (guildLevel - 1) * COMMISSION_PER_GUILD_LEVEL)`  
   - `finalCommission = floor(finalGold * commissionPercent / 100)`  
5. Износ оружия: сумма модификаторов к `weaponWear` (аддитивно к базе), затем `clamp(1, 50)`.  
6. Шанс потери оружия: сумма модификаторов к `weaponLossChance`, затем `clamp(0, 50)`.  
7. Крит: база `BASE_CRIT_CHANCE` + сумма модификаторов `critChance`, затем `clamp(0, 25)`.

## Бросок и награды в cross-slice (`completeExpeditionFull`)

Пусть `calc` — результат `calculateExpeditionResultV2`, `template` — шаблон экспедиции, `success` и `isCrit` — булевы флаги после бросков.

- Успех: `Math.random() * 100 < calc.successChance`.  
- Крит (только если успех): `Math.random() * 100 < calc.critChance`.  
- Комиссия: `floor(calc.commission * (isCrit ? 1.5 : 1))`.  
- War Soul: `floor(calc.warSoul * (isCrit ? 1.5 : 1))`.  
- Слава:  
  `floor((template.reward.baseWarSoul * 0.1 + (success ? 5 : 2)) * (isCrit ? 1.5 : 1))`  
- Потеря оружия при провале: `!success && Math.random() * 100 < calc.weaponLossChance`.  
- Репутация (в объекте результата):  
  `success ? calculateReputationGain('expedition', template.reward.baseGold, player.level) : 0`  
  где `calculateReputationGain` из `src/types/guild.ts`:  
  - `playerLevelMultiplier = 0.5 + playerLevel * 0.05`  
  - `baseMultiplier = 2.0`  
  - для типа `expedition`: `activityMultiplier = 1.5`  
  - `reputation = max(1, floor(baseReward * baseMultiplier * activityMultiplier * playerLevelMultiplier))`  
- Epic gain для оружия при начислении War Soul:  
  `baseEpicGain = 0.05`, `successBonus = success ? 0.03 : 0`, `critBonus = isCrit ? 0.05 : 0`, плюс `Math.random() * 0.02`.  
- Опыт игрока: `success ? 20 : 5`.  
- Квест восстановления: `cost = floor(expedition.deposit * 0.5)`, `duration = template.duration * 2` (секунды, как в шаблоне).

## Справочник `difficultyInfo` (файл шаблонов)

Используются поля `failureChance` и `weaponLossChance` по уровню сложности (см. `src/data/expedition-templates.ts`). Пороги уровней искателя в `levelRange` участвуют в `calculateLevelMatch` для UI, не в бросок успеха напрямую.
