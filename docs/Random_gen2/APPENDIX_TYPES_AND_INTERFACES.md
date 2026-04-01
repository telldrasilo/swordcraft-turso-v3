# APPENDIX A. Типы и интерфейсы (сводка)

Канон для **работающего стора и UI** в монорепозитории: типы под `src/types/` и `src/data/expedition-templates.ts`. Файл в корне репозитория `types/expedition-loot.types.ts` — **параллельная** схема для системы лута (Random_gen); при объединении с рантаймом сверяйте `ResourceId` с `ResourceKey` из `src/store/slices/resources-slice.ts` (должны совпадать по именам полей ресурсов).

## GuildState (фрагмент)

См. полное определение `src/types/guild.ts`.

- `level: number`
- `reputation`, `totalReputation`, `glory`, `totalGlory`: number
- `activeExpeditions: ActiveExpedition[]`
- `recoveryQuests: RecoveryQuest[]`
- `history: ExpeditionHistoryEntry[]`
- `stats: GuildStats`
- `adventurers`, `adventurerRefreshAt`, `knownAdventurers`, `maxKnownAdventurers`

## ActiveExpedition

| Поле | Тип |
|------|-----|
| id | string |
| expeditionId | string |
| expeditionName | string |
| expeditionIcon | string |
| adventurerId | string |
| adventurerName | string |
| adventurerData? | Adventurer |
| adventurerExtended? | AdventurerExtended |
| weaponId | string |
| weaponName | string |
| weaponData | CraftedWeaponV2 |
| startedAt | number |
| endsAt | number |
| deposit | number |
| suppliesCost | number |
| events? | ExpeditionEvent[] |

## ExpeditionHistoryEntry

| Поле | Тип |
|------|-----|
| id | string |
| expeditionName | string |
| expeditionIcon | string |
| adventurerName | string |
| adventurerData? | Adventurer |
| adventurerExtended? | AdventurerExtended |
| weaponName | string |
| completedAt | number |
| success | boolean |
| commission | number |
| warSoul | number |
| glory | number |
| weaponLost | boolean |
| isCrit? | boolean |

## RecoveryQuest

| Поле | Тип |
|------|-----|
| id | string |
| lostWeaponId | string |
| lostWeaponData | CraftedWeaponV2 |
| originalExpeditionId | string |
| originalExpeditionName | string |
| cost | number |
| duration | number |
| startedAt? | number |
| endsAt? | number |
| status | `'available' \| 'active' \| 'completed' \| 'declined'` |

## ExpeditionTemplate (данные)

| Поле | Тип |
|------|-----|
| id | string |
| name | string |
| description | string |
| icon | string |
| type | ExpeditionType |
| difficulty | ExpeditionDifficulty |
| duration | number (сек) |
| cost | { supplies, deposit } |
| reward | { baseGold, baseWarSoul, bonusResources?, bonusEssence? } |
| minGuildLevel | number |
| failureChance | number |
| weaponLossChance | number |
| recommendedWeaponTypes | string[] |
| minWeaponAttack | number |
| tags? | ExpeditionTags |

`ExpeditionType`: `hunt | scout | clear | delivery | magic`

`ExpeditionDifficulty`: `easy | normal | hard | extreme | legendary`

## ExpeditionEventTemplate / ExpeditionEvent

- Шаблон: `id`, `text`, `type` (`ExpeditionEventType`), `icon`, `conditions`, `weight?`, `flags?`.
- Инстанс: плюс `instanceId`, `triggeredAt`, `order`, `shownAt?`, `rewards?`, `rewardTriggered?`.

`ExpeditionEventType`: `combat | discovery | social | travel | danger | rest | mystery | weather | treasure`

## EventReward (черновик награды события)

- `type`: `gold | warSoul | glory | item | material | essence | buff | debuff`
- `amount?`, `itemId?`, `itemData?`, `rarity?`, `name?`, `description?`, `duration?`

## ExpeditionResult (slice)

Файл `src/store/slices/guild-slice.ts`: `success`, `commission`, `warSoul`, `bonusGold`, `glory`, `reputation`, `weaponWear`, `weaponLost`, опционально `recoveryQuest`, `bonusResources`, `bonusEssence`, `isCrit` и поля контрактов.

## ModifierContext (калькулятор)

Поле `context` в `src/lib/expedition-calculator-v2.ts`:

- `adventurer: AdventurerExtended`
- `expedition: { id, type, difficulty, duration, minWeaponAttack, enemyTypes }`
- `weapon: { id, type, attack, quality, qualityRank?, epicMultiplier?, combatMaterialId?, durability, currentDurability }`
- `guild: { level, glory }`
