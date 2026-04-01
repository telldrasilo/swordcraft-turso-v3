# APPENDIX E. Входы модификаторов (контекст калькулятора)

`calculateExpeditionResult(adventurer, expedition, guildLevel, weaponAttack, weaponDurability, weaponType, weaponId, weaponQualityRank?, weaponEpicMultiplier?, weaponCombatMaterialId?, weaponQuality?)`

## AdventurerExtended (блоки, используемые провайдерами)

Полный тип: `src/types/adventurer-extended.ts`. Для калькулятора критичны:

| Блок | Поля, влияющие на модификаторы |
|------|----------------------------------|
| identity | портрет/имя — косвенно UI |
| combat | `level`, `rarity`, `power`, `precision`, `endurance`, `luck`, `combatStyle`, `preferredWeapons`, `avoidedWeapons` |
| personality | `primaryTrait`, `secondaryTrait`, `motivations`, `socialTags`, `riskTolerance` |
| traits | массив черт (данные из `adventurer-traits`) |
| uniqueBonuses | массив уникальных бонусов |
| strengths | массив сильных сторон |
| weaknesses | массив слабостей |
| requirements | требования к оружию (для отбора, не для формул в calculator-v2 напрямую) |

Fallback в cross-slice, если нет `adventurerExtended`: жёстко прошитый минимальный `AdventurerExtended` (уровень 10, rarity common, стили и черты по умолчанию) — при миграции данных лучше всегда сохранять extended на старте экспедиции.

## Срез экспедиции в контексте

Передаётся в модификаторы как:

- `id`, `type`, `difficulty`, `duration`  
- `minWeaponAttack`  
- `enemyTypes: []` (зарезервировано, в шаблоне может быть пусто)

## Оружие в контексте

- `attack` = `weapon.stats.attack` из `CraftedWeaponV2`  
- `quality`, `qualityRank`, `epicMultiplier`, `combatMaterialId`  
- `durability` / `currentDurability` — текущая прочность  

## Гильдия в контексте

- `level` — фактический уровень гильдии из стора  
- `glory` — в контексте сейчас передаётся как `0` (заглушка в калькуляторе); провайдеры могут ожидать иное при доработке.

## Провайдеры (источники модификаторов)

Регистрация в `src/lib/modifier-system/index.ts`:

1. `combat-stats-provider`  
2. `level-rarity-provider`  
3. `personality-traits-provider`  
4. `motivations-provider`  
5. `social-tags-provider`  
6. `strengths-weaknesses-provider`  
7. `combat-style-provider`

Детальное значение каждого модификатора — в соответствующих файлах провайдеров; для переноса модуля достаточно сохранить вызов `calculateModifiers` и набор импортов регистрации.
