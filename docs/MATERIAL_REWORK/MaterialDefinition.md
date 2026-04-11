Для реализации такого шаблона в коде нужна **гибкая data‑driven архитектура**, где описание материала — это не жёстко заданный класс, а конфигурационный файл (JSON, YAML или ScriptableObject), данные из которого интерпретируются системой крафта.

Ниже — рекомендуемая структура данных на примере C# (Unity) с аннотациями для сериализации. Аналогичный подход применим в любом движке.

---

## 1. Корневая структура: `MaterialDefinition`

```csharp
[System.Serializable]
public class MaterialDefinition
{
    // === 0. Идентификация ===
    public string materialId;
    public string displayName;
    public string loreName;
    public MaterialCategory category;
    public int tier;
    public bool isMagical;
    [TextArea] public string description;
    public string iconPath;

    // === 1. Происхождение ===
    public SourceData source;

    // === 2. Руда ===
    public OreData ore;

    // === 3. Плавка ===
    public SmeltingData smelting;

    // === 4. Физические свойства ===
    public MaterialProperties properties;

    // === 5. Техники обработки ===
    public TechniqueCompatibilityData techniques;

    // === 6. Модификации этапов крафта ===
    public StageOverrideData stageOverrides;

    // === 7. Сплав ===
    public AlloyData alloy;
}
```

---

## 2. Вспомогательные перечисления и структуры

### 2.1. Категория материала
```csharp
public enum MaterialCategory
{
    MetalFerrous,
    MetalPrecious,
    MagicMetal,
    Alloy,
    Organic,
    Stone
}
```

### 2.2. Источник сырья
```csharp
[System.Serializable]
public class SourceData
{
    public SourceType type;
    public string sourceId;           // ID локации, монстра, квеста
    public ToolRequirement miningToolRequired;
    public int miningYieldPerNode;
}

public enum SourceType { Mine, MonsterDrop, Quest, AlchemyTransmute, Purchase }
public enum ToolRequirement { None, PickaxeStone, PickaxeIron, PickaxeSteel, MagicHammer }
```

### 2.3. Руда
```csharp
[System.Serializable]
public class OreData
{
    public string oreId;
    public string oreDisplayName;
    public float oreWeight;
    public int oreStackSize;
    public float oreQualityModifier;
}
```

### 2.4. Плавка
```csharp
[System.Serializable]
public class SmeltingData
{
    public string ingotId;
    public string ingotDisplayName;
    public bool recipeUnlockedByDefault;
    public int requiredMasteryLevel;
    public FurnaceType requiredFurnaceType;
    public int inputOrePerCycle;
    public SecondaryIngredient[] inputSecondary;   // null если нет
    public int fuelConsumption;
    public FuelType fuelType;
    public int outputIngotPerCycle;
    public int cycleDurationBaseSeconds;
    public ByproductData byproduct;                // null если нет
}

public enum FurnaceType { Common, Magic, Dragon }
public enum FuelType { Charcoal, Coal, MagicCoal, DragonCoal }

[System.Serializable]
public class SecondaryIngredient
{
    public string itemId;
    public int quantity;
}

[System.Serializable]
public class ByproductData
{
    public string itemId;
    public int quantity;
    public float chance; // 0..1
}
```

### 2.5. Физические свойства
```csharp
[System.Serializable]
public class MaterialProperties
{
    public int meltingPoint;       // 0 = не требует нагрева
    public float workability;      // множитель времени ковки
    public float hardness;         // влияет на износ инструмента
    public float baseDurabilityMod;
    public float baseDamageMod;
    public float baseArmorMod;
    public float weightMod;
    public float valueMod;
}
```

### 2.6. Совместимость с техниками
```csharp
[System.Serializable]
public class TechniqueCompatibilityData
{
    public string[] allowedTechniqueTags;
    public string[] forbiddenTechniqueIds;
    public UniqueTechniqueData[] uniqueTechniques;
}

[System.Serializable]
public class UniqueTechniqueData
{
    public string techniqueId;
    public string displayName;
    [TextArea] public string description;
    public int requiredMasteryLevel;
    public string[] requiredTools;          // ID инструментов
    public ResourceCostModifier resourceCostModifier;
    public StageModifications stageModifications;
    public OutputBonus outputBonus;
}

[System.Serializable]
public class ResourceCostModifier
{
    public SecondaryIngredient[] addsConsumption;
}

[System.Serializable]
public class StageModifications
{
    public string[] removesStages;
    public AddedStageData[] addsStages;
    public StageAlteration[] altersStages;
}

[System.Serializable]
public class AddedStageData
{
    public string stageId;
    public float durationMultiplier = 1f;
    public int durationBase;        // в секундах, если не через множитель
    public string insertAfter;      // ID этапа, после которого вставить
}

[System.Serializable]
public class StageAlteration
{
    public string stageId;
    public float durationMultiplier = 1f;
}

[System.Serializable]
public class OutputBonus
{
    public string property;     // например "GLOW_VS_UNDEAD"
    public string value;        // сериализуем как строку (bool, float, string)
}
```

### 2.7. Модификации этапов крафта (stageOverrides)
```csharp
[System.Serializable]
public class StageOverrideData
{
    public HeatOverride onHeat;
    public QuenchOverride onQuench;
    public string[] removedStages;
    public AddedStageData[] addedStages;
}

[System.Serializable]
public class HeatOverride
{
    public bool enabled = true;
    public float durationMultiplier = 1f;
    public float fuelConsumptionMultiplier = 1f;
}

[System.Serializable]
public class QuenchOverride
{
    public QuenchantType requiredQuenchant;
}

public enum QuenchantType { None, Water, Oil, MagicBrine, WaterOrOil }
```

### 2.8. Сплав
```csharp
[System.Serializable]
public class AlloyData
{
    public bool isAlloy;
    public AlloyRecipe alloyRecipe;
}

[System.Serializable]
public class AlloyRecipe
{
    public SecondaryIngredient[] inputs;   // слитки или руды
    public int outputQuantity;
    public bool requiresCrucible;
}
```

---

## 3. Хранение и загрузка

### Вариант А: JSON‑файлы (рекомендуемый для гибкости)
- Каждый материал — отдельный `.json` в папке `StreamingAssets/Materials/`.
- Загружается через `JsonUtility.FromJson<MaterialDefinition>()` (Unity) или Newtonsoft.Json.
- Легко редактировать без перекомпиляции, удобно для нейросетевой генерации.

### Вариант Б: ScriptableObject (Unity)
- Создаётся ассет `MaterialDefinitionSO` со всеми полями.
- Плюс: наглядное редактирование в инспекторе.
- Минус: сложнее для массовой генерации и внешнего инструментария.

### Вариант В: SQLite / Addressables
- Для больших проектов с динамической подгрузкой контента.

---

## 4. Использование в коде

В момент расчёта этапов крафта система:
1. Получает `MaterialDefinition` для каждой детали.
2. Собирает список этапов из базового шаблона предмета (`CraftingTemplate`).
3. Применяет `stageOverrides` материала: удаляет, добавляет, изменяет этапы.
4. Если игрок выбрал технику, применяет `stageModifications` из `UniqueTechniqueData`.
5. На основе `MaterialProperties` корректирует длительности и расход ресурсов.

```csharp
public List<CraftingStage> BuildStageSequence(
    MaterialDefinition material,
    TechniqueCompatibilityData selectedTechnique = null)
{
    var stages = GetBaseTemplateForItemType().Clone();

    // Применить переопределения материала
    ApplyStageOverrides(stages, material.stageOverrides);

    // Применить изменения от выбранной техники
    if (selectedTechnique != null)
        ApplyTechniqueModifications(stages, selectedTechnique);

    // Скорректировать длительности согласно свойствам
    foreach (var stage in stages)
    {
        if (stage.Type == StageType.Heating)
            stage.Duration *= material.properties.workability;
        // и т.д.
    }

    return stages;
}
```

---

## 5. Рекомендации по расширяемости

- Поля, которые могут отсутствовать (например `byproduct`), делайте nullable или используйте отдельный флаг `hasByproduct`.
- Для свойств вроде `outputBonus.value` используйте тип `string` с последующим парсингом (bool, float, enum), чтобы не плодить варианты полей.
- Все идентификаторы (`materialId`, `stageId`, `techniqueId`) должны быть константами или ссылаться на общий реестр для валидации.

---

Такая структура данных полностью покрывает описанный шаблон, легко сериализуется в JSON и позволяет добавлять новые материалы без изменения кода — достаточно создать новый конфигурационный файл.