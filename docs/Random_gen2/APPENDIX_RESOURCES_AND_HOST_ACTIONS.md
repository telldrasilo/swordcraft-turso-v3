# APPENDIX B. Ресурсы и действия хоста

## ResourceKey (полный перечень)

Тип `Resources` / `ResourceKey` из `src/store/slices/resources-slice.ts`:

| Ключ | Назначение (кратко) |
|------|---------------------|
| gold | Валюта; стоимость экспедиции и комиссия |
| soulEssence | Эссенция душ |
| wood, stone, iron, coal, copper, tin, silver, goldOre, mithril | Сырьё |
| ironIngot, copperIngot, tinIngot, bronzeIngot, steelIngot, silverIngot, goldIngot, mithrilIngot | Слитки |
| planks, stoneBlocks | Переработка |
| leather | Кожа (рукояти) |

## Сигнатуры методов стора (ресурсы)

```text
canAfford(cost: Partial<Record<ResourceKey, number>>): boolean
spendResource(key: ResourceKey, amount: number): boolean
addResource(key: ResourceKey, amount: number): void
spendResources(cost: Partial<Record<ResourceKey, number>>): boolean
```

Экспедиционный cross-slice использует **`canAfford({ gold: totalCost })`**, **`spendResource('gold', totalCost)`** при старте и **`addResource('gold', result.commission)`** при успешном начислении комиссии.

## Прочие вызовы из cross-slice

```text
addExperience(amount: number): void
updateStatistics(partial: Partial<GameStatistics>): void
removeWeapon(weaponId: string): boolean
addWarSoulToWeapon(
  weaponId: string,
  points: number,
  durabilityLoss?: number,
  epicGain?: number
): boolean
```

Значения `epicGain` при успешном завершении задаются в cross-slice (см. приложение формул).
