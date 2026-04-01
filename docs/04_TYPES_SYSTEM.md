# Система типов (TypeScript)

## Обзор

Все типы TypeScript проекта определены в папке src/types/ и реэкспортируются через центральный файл src/types/index.ts.

---

## Основные доменные типы

### 1. Игрок (Player) — src/types/player.ts

Interface Player:
- name: string — Имя игрока
- level: number — Уровень (1-50)
- experience: number — Текущий опыт
- experienceToNextLevel: number — Опыт до следующего уровня
- fame: number — Слава (репутация)
- title: string — Титул

Interface GameStatistics:
- totalCrafts: number — Всего крафтов
- totalRefines: number — Всего переплавок
- totalGoldEarned: number — Всего заработанного золота
- totalWorkersHired: number — Всего нанятых рабочих
- playTime: number — Время игры (секунды)
- weaponsSold: number — Продано оружия
- recipesUnlocked: number — Разблокировано рецептов
- ordersCompleted: number — Выполнено заказов

Interface PlayerTitle:
- minLevel: number — Мин уровень для титула
- maxLevel: number — Макс уровень для титула
- title: string — Название титула
- rank: string — Ранг (novice, apprentice, journeyman, ...)

---

### 2. Ресурсы (Resources) — src/types/resources.ts

Interface Resources включает:
- Валюта: gold, soulEssence
- Сырьё: wood, stone, iron, coal, copper, tin, silver, goldOre, mithril
- Переплавленные: ironIngot, copperIngot, tinIngot, bronzeIngot, steelIngot, silverIngot, goldIngot, mithrilIngot
- Обработанные: planks, stoneBlocks, leather

Type ResourceKey = keyof Resources

Type CraftingCost = Partial<Record<ResourceKey, number>>

---

### 3. Рабочие (Workers) — src/types/worker.ts

Type WorkerClass:
- apprentice — Ученик (бесплатный)
- blacksmith — Кузнец
- miner — Шахтёр
- merchant — Торговец
- enchanter — Зачарователь
- loggers — Лесоруб
- mason — Каменотёс
- smelter — Плавильщик

Interface WorkerStats:
- speed: number — Скорость работы (1-100)
- quality: number — Качество работы (1-100)
- stamina_max: number — Максимальная стамина
- intelligence: number — Интеллект
- loyalty: number — Лояльность

Interface Worker:
- id: string
- name: string
- class: WorkerClass
- level: number
- experience: number
- stamina: number
- stats: WorkerStats
- assignedBuildingId: string | null
- tasksCompleted: number
- earnings: number

---

### 4. Крафт (Craft) — src/types/craft.ts

Type WeaponType = sword | dagger | axe | mace | spear | hammer | bow | staff

Type WeaponTier = common | uncommon | rare | epic | legendary | mythic

Type WeaponMaterial = iron | bronze | steel | silver | gold | mithril

Type QualityGrade = poor | normal | good | excellent | masterwork | legendary

Interface WeaponEnchantment:
- id: string
- enchantmentId: string
- appliedAt: number

Interface ActiveCraft:
- recipeId: string | null
- weaponName: string
- progress: number (0-100)
- startTime: number | null
- endTime: number | null
- quality: number

Interface ActiveRefining:
- recipeId: string | null
- progress: number
- startTime: number | null
- endTime: number | null

Interface WeaponInventory:
- id: string
- recipeId: string
- weaponName: string
- type: WeaponType
- tier: WeaponTier
- material: WeaponMaterial
- quality: number
- qualityGrade: QualityGrade
- attack: number
- durability: number
- maxDurability: number
- weight: number
- sellPrice: number
- enchantments: WeaponEnchantment[]
- createdAt: number

**Статус (P2-Craft-05):** `src/types/craft.ts` описывает **историческую** модель «плоского» оружия и `CraftedWeapon` с полями `attack`/`durability` на верхнем уровне. **Канон рантайма** — `CraftedWeaponV2`, `WeaponRecipe`, `ActiveCraftV2` в [`src/types/craft-v2.ts`](../src/types/craft-v2.ts): характеристики в `stats`, прочность в `currentDurability`, материалы по частям, `hiddenTags` для заказов. Инвентарь и экран кузницы используют **V2** (`craft-slice` → `WeaponInventory.weapons: CraftedWeaponV2[]`). Тип `CraftedWeapon` из `craft.ts` остаётся для обратной совместимости в реэкспорте [`src/store/game-store-composed.ts`](../src/store/game-store-composed.ts) (`src/store/index.ts`); новый код должен импортировать **`CraftedWeaponV2`**. Активный крафт v2 хранится в **`craftV2Persisted`** (и в облачной колонке / Zod-сейве как `ActiveCraftV2 | null`); legacy `ActiveCraft` из [`craft-slice`](../src/store/slices/craft-slice.ts) **не** входит в `CraftState` — только константа `initialActiveCraft` для разбора старых JSON при необходимости (`save-craft-normalize`).

---

### 5. Заказы (Orders) — src/types/orders.ts

Type OrderStatus = available | in_progress | completed | expired

Interface NPCOrder:
- id: string
- npcName: string
- weaponType: string
- material?: string
- minQuality: number
- minAttack?: number
- reward: number
- deadline: number
- bonusItems: OrderBonusItem[]
- requirements: OrderRequirements
- expiresAt: number
- createdAt: number

---

### 6. Гильдия (Guild) — src/types/guild.ts

Type ExpeditionType = exploration | gathering | combat | social | mystery

Type ExpeditionDifficulty = easy | medium | hard | deadly

Interface Adventurer:
- id: string
- name: string
- level: number
- rarity: common | uncommon | rare | epic | legendary
- power: number
- precision: number
- endurance: number
- luck: number
- traits: string[]
- uniqueBonuses: string[]

Interface ActiveExpedition:
- id: string
- adventurerId: string
- expeditionId: string
- weaponId: string
- startedAt: number
- endsAt: number

Канон и расширения (события, снимки модуля экспедиций): `src/types/guild.ts` — `events`, `locationId`, `missionTemplateId`, `contractType`, `moduleEventSnapshots`, кэши имён/иконок, `weaponData`, …

---

### 7. Зачарования (Shared) — src/types/shared/enchantment.ts

Канонический runtime-тип чара на оружии:

Interface WeaponEnchantment:
- id: string
- enchantmentId: string
- appliedAt: number

Канонические школы текущей системы определены в `src/data/enchantments.ts`:

Type EnchantmentSchool = fire | frost | life | protection | power | speed

Канонические типы эффектов текущего каталога чар:

Type EnchantmentEffect = damage | defense | speed | regen | lifesteal | burn | slow | crit

Связанные типы и поля системы:

- `Enchantment` — каталог чара в `src/data/enchantments.ts`
- `SacrificeResult` — результат жертвоприношения
- `CraftedWeaponV2.enchantments?: WeaponEnchantment[]`
- `CraftedWeaponV2.stats.enchantSlots`
- `CraftedWeaponV2.stats.enchantPower`

Важно:

- часть старой документации по школам и effect types устарела;
- для автономной разработки и интеграции ориентироваться на пакет `docs/Ecnchantment_System/` и на реальные типы/данные в `src/data/enchantments.ts`, `src/types/shared/enchantment.ts`, `src/types/craft-v2.ts`.

---

### 8. Качество (Quality System) — src/types/shared/quality.ts

Конфигурации качества:
- QUALITY_GRADES_V1 — для старой системы крафта
- QUALITY_GRADES_V2 — для новой системы крафта

Функции:
- getQualityGrade() — получить градацию по значению качества (0-100)
- getQualityMultiplier() — получить множитель качества
- getQualityColor() — получить цвет качества
- getQualityNameRu() — получить русское название

---

### 9. Материалы (Materials) — src/types/materials/material-core.ts

**Актуально (код):** интерфейс `MaterialNode` и `MaterialClass = 'metal' | 'mineral' | 'wood' | 'leather' | 'organic' | 'other'` — только в `material-core.ts`. Экспедиционные id: узлы в [`src/data/materials/library/expedition/`](../src/data/materials/library/expedition/), маппинг [`docs/expedition-material-id-map.md`](expedition-material-id-map.md), гайд добавления — [`docs/data/MATERIALS_ADDING.md`](data/MATERIALS_ADDING.md).

*Фрагмент ниже — устаревшее краткое описание; при расхождении ориентироваться на исходники.*

Type MaterialClass = metal | wood | leather | stone | ore | organic

Type MaterialOrigin = local | imported | magical | ancient | divine

Type MaterialRarity = common | uncommon | rare | epic | legendary

Interface MaterialNode:
- id: string
- name: string
- nameRu: string
- category: MaterialCategory
- rarity: MaterialRarity
- origin: MaterialOrigin
- value: number

Свойства (1-100):
- hardness — твёрдость
- flexibility — гибкость
- weight — относительный вес
- conductivity — проводимость

Свойства крафта (1-100):
- workability — обрабатываемость
- meltingPoint — температура плавления
- requiredHeat — требуемый уровень нагрева

Бонусные секции:
- speedBonus — бонус к скорости крафта
- reliabilityBonus — бонус к надёжности
- economyBonus — экономия материалов
- qualityBonus — бонус к качеству
- forecastBonus — бонус к точности прогноза
- spreadBonus — бонус к разбросу
- customBonus — кастомные бонусы

---

### 10. Прогноз (Forecast) — src/types/forecast.ts

Interface WeaponForecast:
- stats: WeaponStats — ожидаемые характеристики
- quality: number — ожидаемое качество
- qualityGrade: QualityGrade
- qualityRange: StatRange
- attack: StatRange
- durability: StatRange
- accuracy: ForecastAccuracy
- confidence: number — уверенность прогноза (0-1)

Interface StatRange:
- min: number
- max: number
- average: number

Type ForecastAccuracy = low | medium | high | exact

---

## Константы игры

### Цены ресурсов
Расположены в src/lib/store-utils/constants.ts:

RESOURCE_SELL_PRICES включает цены для:
- Сырьё: wood (0.3), stone (0.4), iron (2), coal (1.5), copper (3), tin (3), silver (8), goldOre (15), mithril (50)
- Переплавленные: ironIngot (4), copperIngot (6), tinIngot (6), bronzeIngot (10), steelIngot (15), silverIngot (16), goldIngot (30), mithrilIngot (100)
- Обработанные: planks (0.5), stoneBlocks (0.6), leather (1.5)

---

## Как использовать типы

### Импорт типов
import { Player, Resources, WeaponType, QualityGrade } from '@/types'

### Создание объектов
const player: Player = {
  name: 'Кузнец',
  level: 1,
  experience: 0,
  experienceToNextLevel: 100,
  fame: 0,
  title: 'Новичок'
}

### Проверка типов
function isMaterial(item: unknown): item is Material {
  return item && typeof item === 'object' && 'category' in item
}

---

## Пути оптимизации для AI

1. Используйте src/types/index.ts как единую точку импорта
2. Проверяйте типы в src/types/ перед использованием
3. Не дублируйте типы — реэкспортируйте из одного места

---

## Связи типов с системами

Типы используют следующие системы:
- Крафт — для создания оружия
- Гильдия — для экспедиций
- Зачарования — для магических эффектов
- Ресурсы — для проверки и списания

---

## Примечания

- Центральный экспорт: Все типы экспортируются через src/types/index.ts
- Строгая типизация: Проект использует strict: true в tsconfig.json
- Shared types: Общие типы (качество, зачарования) в src/types/shared/
