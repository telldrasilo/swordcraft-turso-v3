Вот универсальный шаблон для описания материала, который может служить одновременно **базой данных проекта** и **техническим заданием** для генерации контента. Шаблон построен так, чтобы любое вещество — от обычного железа до магического сплава — описывалось в единой структуре и без доработок кода интегрировалось в игровую логику.

---

# Шаблон материала (Material Template)

## 0. Идентификация и метаданные

| Поле | Тип | Описание | Пример |
|------|-----|----------|--------|
| `material_id` | string | Уникальный идентификатор для кода и базы данных | `MAT_IRON`, `MAT_MITHRIL_TRUE` |
| `display_name` | localized string | Отображаемое имя | «Железо» |
| `lore_name` | localized string (опционально) | Поэтическое/редкое название для особых предметов | «Серый металл», «Лунное серебро» |
| `category` | enum | Группа для фильтрации рецептов и баланса | `METAL_FERROUS`, `METAL_PRECIOUS`, `MAGIC_METAL`, `ALLOY` |
| `tier` | int (1-10) | Общий уровень мощности/редкости. Влияет на требования к уровню кузнеца, прочность/урон оружия. | 1 (железо), 8 (адамантит) |
| `is_magical` | boolean | Требует ли особых условий обработки (магический горн, особое топливо) | `false` / `true` |
| `description` | localized text | Внутриигровое описание для энциклопедии | «Самый распространённый металл, прочный, но подвержен коррозии.» |
| `icon_path` | string | Путь к иконке в UI | `res://icons/materials/iron.png` |

---

## 1. Происхождение и ресурсная цепочка

### 1.1. Источник сырья

| Поле | Тип | Описание | Пример |
|------|-----|----------|--------|
| `source_type` | enum | Как добывается | `MINE`, `MONSTER_DROP`, `QUEST`, `ALCHEMY_TRANSMUTE`, `PURCHASE` |
| `source_id` | string (опционально) | ID локации/монстра/квеста | `mine_iron_vein` |
| `mining_tool_required` | enum | Необходимый инструмент для добычи | `PICKAXE_IRON`, `PICKAXE_STEEL`, `MAGIC_HAMMER` |
| `mining_yield_per_node` | int | Базовое кол-во руды с одного узла | 3-5 |

### 1.2. Руда (Ore)

| Поле | Тип | Описание | Пример |
|------|-----|----------|--------|
| `ore_id` | string | ID предмета руды на складе | `ore_iron` |
| `ore_display_name` | localized string | «Железная руда» | «Железная руда» |
| `ore_weight` | float | Вес единицы для инвентаря | 2.5 |
| `ore_stack_size` | int | Макс. стак | 30 |
| `ore_quality_modifier` | float (0.5-2.0) | Множитель качества при плавке (влияет на выход слитков или шанс брака) | 1.0 (стандарт) |

---

## 2. Плавка (Smelting)

### 2.1. Рецепт получения слитка

| Поле | Тип | Описание | Пример |
|------|-----|----------|--------|
| `ingot_id` | string | ID слитка | `ingot_iron` |
| `ingot_display_name` | localized string | «Железный слиток» | «Железный слиток» |
| `recipe_unlocked_by_default` | boolean | Доступен ли рецепт с начала игры | `true` |
| `required_mastery_level` | int | Мин. уровень навыка «Плавка» | 1 |
| `required_furnace_type` | enum | Тип горна | `FURNACE_COMMON`, `FURNACE_MAGIC`, `FURNACE_DRAGON` |
| `input_ore_per_cycle` | int | Кол-во руды на 1 цикл | 3 |
| `input_secondary` | array of objects | Доп. ингредиенты (флюс, магическая пыль) | `[ { "id": "flux", "qty": 1 } ]` или `null` |
| `fuel_consumption` | int | Расход единиц топлива за цикл | 2 |
| `fuel_type` | string / enum | ID допустимого топлива | `fuel_charcoal`, `fuel_coal`, `fuel_dragon_coal` |
| `output_ingot_per_cycle` | int | Кол-во слитков за цикл | 1 |
| `cycle_duration_base_seconds` | int | Длительность одного цикла плавки (игровых секунд) | 60 |
| `byproduct` | object (опционально) | Побочный продукт (шлак и т.п.) | `{ "id": "slag", "qty": 1, "chance": 0.3 }` |

---

## 3. Физические и крафтовые свойства

Эти параметры напрямую влияют на этапы крафта и итоговые характеристики предмета.

| Поле | Тип | Описание | Пример для железа | Пример для мифрила |
|------|-----|----------|-------------------|---------------------|
| `melting_point` | int (условные градусы) | Влияет на расход топлива при нагреве и время этапов «Нагрев» | 1500 | 0 (не требует нагрева) |
| `workability` | float (0.1-2.0) | Множитель времени на этапах «Ковка», «Формовка», «Прокат». Меньше — труднее обрабатывать. | 1.0 | 0.8 (легче куётся) |
| `hardness` | float (1.0-10.0) | Влияет на износ инструмента и сложность заточки/шлифовки | 2.0 | 5.0 |
| `base_durability_mod` | float | Множитель прочности готового предмета | 1.0 | 2.5 |
| `base_damage_mod` | float | Множитель урона (для оружия) | 1.0 | 1.8 |
| `base_armor_mod` | float | Множитель защиты (для брони) | 1.0 | 2.0 |
| `weight_mod` | float | Множитель веса предмета | 1.0 | 0.6 |
| `value_mod` | float | Множитель стоимости | 1.0 | 8.0 |

---

## 4. Техники обработки (Crafting Techniques)

Здесь описывается, как материал взаимодействует с системой техник и какие специфические техники для него доступны.

### 4.1. Общие правила совместимости

| Поле | Тип | Описание | Пример |
|------|-----|----------|--------|
| `allowed_technique_tags` | array of strings | Теги техник, которые можно применить к этому материалу | `["SMELT_FROM_ORE", "CARBURIZE", "QUENCH"]` |
| `forbidden_technique_ids` | array of strings | Конкретные техники, запрещённые для этого материала | `["TECH_WATER_QUENCH"]` (если материал трескается от воды) |

### 4.2. Специфические техники (массив объектов)

Для каждого материала можно определить уникальные техники, доступные только для него.

```json
"unique_techniques": [
  {
    "technique_id": "TECH_MITHRIL_COLD_FORGE",
    "display_name": "Холодная ковка мифрила",
    "description": "Мифрил не нуждается в нагреве. Ковка на холоде с лунной эссенцией придаёт свечение.",
    "required_mastery_level": 15,
    "required_tools": ["hammer_mithril", "anvil_mithril"],
    "resource_cost_modifier": {
      "adds_consumption": [
        { "item_id": "essence_moon", "qty": 1 }
      ]
    },
    "stage_modifications": {
      "removes_stages": ["HEATING", "QUENCHING"],
      "adds_stages": [
        { "stage_id": "COLD_ROLLING", "duration_multiplier": 1.5 },
        { "stage_id": "RUNE_ENGRAVING", "duration_base": 300 }
      ],
      "alters_stages": {
        "POLISHING": { "duration_multiplier": 0.7 }
      }
    },
    "output_bonus": {
      "property": "GLOW_VS_UNDEAD",
      "value": true
    }
  }
]
```

---

## 5. Интеграция с этапами крафта предметов

Каждый материал может влиять на **базовый шаблон этапов** создания предмета. Эта секция описывает, какие изменения вносятся в список из 26 этапов (или аналогичный).

| Поле | Тип | Описание | Пример |
|------|-----|----------|--------|
| `stage_overrides` | object | Замены, добавления, удаления этапов относительно шаблона | См. ниже |

**Структура `stage_overrides`:**

```json
"stage_overrides": {
  "on_heat": {
    "stage_id": "HEATING",
    "duration_multiplier": 1.0,
    "fuel_consumption_multiplier": 1.0
  },
  "on_quench": {
    "required_quenchant": "OIL" // или "WATER", "MAGIC_BRINE", "NONE"
  },
  "removed_stages": ["TEMPERING"], // если материал не требует отпуска
  "added_stages": [
    {
      "stage_id": "MAGIC_INFUSION",
      "insert_after": "FORGING",
      "duration_base": 120,
      "resource_cost": { "item_id": "mana_dust", "qty": 2 }
    }
  ]
}
```

---

## 6. Рецепты сплавов (если материал — сплав)

Если материал получается смешиванием других слитков/руд непосредственно в горне (как бронза), заполняется эта секция.

| Поле | Тип | Описание | Пример (Бронза) |
|------|-----|----------|-----------------|
| `is_alloy` | boolean | `true` / `false` | `true` |
| `alloy_recipe` | object | Прямой рецепт сплава | |
| `alloy_recipe.inputs` | array | Компоненты | `[ {"id": "ingot_copper", "qty": 2}, {"id": "ingot_tin", "qty": 1} ]` |
| `alloy_recipe.output_qty` | int | Кол-во слитков сплава на выходе | 2 |
| `alloy_recipe.requires_crucible` | boolean | Нужен ли тигель (отдельный инструмент) | `true` |

---

## 7. Примеры заполнения шаблона

### Пример 1: Железо (Iron) — базовый материал

```json
{
  "material_id": "MAT_IRON",
  "display_name": "Железо",
  "lore_name": null,
  "category": "METAL_FERROUS",
  "tier": 1,
  "is_magical": false,
  "description": "Ковкий и прочный металл, основа кузнечного ремесла. Подвержен ржавчине.",
  "icon_path": "res://icons/materials/iron_ingot.png",

  "source": {
    "source_type": "MINE",
    "source_id": "world_iron_vein",
    "mining_tool_required": "PICKAXE_STONE",
    "mining_yield_per_node": 4
  },

  "ore": {
    "ore_id": "ore_iron",
    "ore_display_name": "Железная руда",
    "ore_weight": 2.0,
    "ore_stack_size": 30,
    "ore_quality_modifier": 1.0
  },

  "smelting": {
    "ingot_id": "ingot_iron",
    "ingot_display_name": "Железный слиток",
    "recipe_unlocked_by_default": true,
    "required_mastery_level": 1,
    "required_furnace_type": "FURNACE_COMMON",
    "input_ore_per_cycle": 3,
    "input_secondary": null,
    "fuel_consumption": 2,
    "fuel_type": "fuel_charcoal",
    "output_ingot_per_cycle": 1,
    "cycle_duration_base_seconds": 60,
    "byproduct": { "id": "slag", "qty": 1, "chance": 0.2 }
  },

  "properties": {
    "melting_point": 1500,
    "workability": 1.0,
    "hardness": 2.0,
    "base_durability_mod": 1.0,
    "base_damage_mod": 1.0,
    "base_armor_mod": 1.0,
    "weight_mod": 1.0,
    "value_mod": 1.0
  },

  "techniques": {
    "allowed_technique_tags": ["SMELT_FROM_ORE", "CARBURIZE", "QUENCH_WATER", "QUENCH_OIL"],
    "forbidden_technique_ids": [],
    "unique_techniques": []
  },

  "stage_overrides": {
    "on_heat": { "duration_multiplier": 1.0, "fuel_consumption_multiplier": 1.0 },
    "on_quench": { "required_quenchant": "WATER_OR_OIL" },
    "removed_stages": [],
    "added_stages": []
  },

  "alloy": {
    "is_alloy": false,
    "alloy_recipe": null
  }
}
```

### Пример 2: Истинный мифрил (True Mithril) — магический металл

```json
{
  "material_id": "MAT_MITHRIL_TRUE",
  "display_name": "Истинный мифрил",
  "lore_name": "Лунное серебро",
  "category": "MAGIC_METAL",
  "tier": 8,
  "is_magical": true,
  "description": "Легендарный металл эльфов, лёгкий как перо и прочный как сталь. Не ржавеет и светится в присутствии нежити.",
  "icon_path": "res://icons/materials/mithril_ingot.png",

  "source": {
    "source_type": "MINE",
    "source_id": "deep_elf_mines",
    "mining_tool_required": "PICKAXE_MITHRIL",
    "mining_yield_per_node": 2
  },

  "ore": {
    "ore_id": "ore_mithril",
    "ore_display_name": "Мифриловая руда",
    "ore_weight": 1.0,
    "ore_stack_size": 20,
    "ore_quality_modifier": 1.5
  },

  "smelting": {
    "ingot_id": "ingot_mithril",
    "ingot_display_name": "Мифриловый слиток",
    "recipe_unlocked_by_default": false,
    "required_mastery_level": 15,
    "required_furnace_type": "FURNACE_MAGIC",
    "input_ore_per_cycle": 5,
    "input_secondary": [
      { "id": "essence_fire", "qty": 1 }
    ],
    "fuel_consumption": 4,
    "fuel_type": "fuel_magic_coal",
    "output_ingot_per_cycle": 1,
    "cycle_duration_base_seconds": 180,
    "byproduct": { "id": "mithril_dust", "qty": 1, "chance": 0.5 }
  },

  "properties": {
    "melting_point": 0,
    "workability": 0.8,
    "hardness": 5.0,
    "base_durability_mod": 2.5,
    "base_damage_mod": 1.8,
    "base_armor_mod": 2.0,
    "weight_mod": 0.6,
    "value_mod": 8.0
  },

  "techniques": {
    "allowed_technique_tags": ["COLD_FORGE", "RUNE_ENGRAVE", "MAGIC_QUENCH"],
    "forbidden_technique_ids": ["TECH_WATER_QUENCH", "TECH_SMELT_FROM_ORE"],
    "unique_techniques": [
      {
        "technique_id": "TECH_MITHRIL_COLD_FORGE",
        "display_name": "Холодная ковка мифрила",
        "description": "Мифрил куётся без нагрева с использованием лунной эссенции. Оружие получает свойство свечения.",
        "required_mastery_level": 18,
        "required_tools": ["hammer_mithril", "anvil_mithril"],
        "resource_cost_modifier": {
          "adds_consumption": [
            { "item_id": "essence_moon", "qty": 1 }
          ]
        },
        "stage_modifications": {
          "removes_stages": ["HEATING", "QUENCHING", "TEMPERING"],
          "adds_stages": [
            { "stage_id": "COLD_ROLLING", "duration_multiplier": 1.5 },
            { "stage_id": "RUNE_ENGRAVING", "duration_base": 300 }
          ]
        },
        "output_bonus": {
          "property": "GLOW_VS_UNDEAD",
          "value": true
        }
      }
    ]
  },

  "stage_overrides": {
    "on_heat": null,
    "on_quench": { "required_quenchant": "NONE" },
    "removed_stages": ["HEATING", "QUENCHING", "TEMPERING"],
    "added_stages": [
      {
        "stage_id": "MANA_INFUSION",
        "insert_after": "POLISHING",
        "duration_base": 180,
        "resource_cost": { "item_id": "mana_crystal", "qty": 3 }
      }
    ]
  },

  "alloy": {
    "is_alloy": false,
    "alloy_recipe": null
  }
}
```

---

## 8. Инструкция по использованию шаблона

1. **Для разработчиков:** каждый материал реализуется как экземпляр структуры данных на основе этого шаблона. При расчёте этапов крафта система обращается к полям `properties`, `stage_overrides` и `techniques`.
2. **Для геймдизайнеров / нейросети:** шаблон служит ТЗ. При генерации нового металла (например, «Кровь дракона» или «Обсидиановая сталь») нужно заполнить все обязательные поля, следуя логике баланса:
   - Чем выше `tier`, тем хуже `workability` и выше требования.
   - Магические металлы (`is_magical = true`) должны иметь особые условия плавки и техники.
3. **Расширяемость:** если в будущем появятся новые механики (например, «Коррозия» или «Сродство со стихиями»), добавьте соответствующие поля в раздел `properties` или `stage_overrides`, не ломая существующие материалы (у них эти поля будут `null` или значением по умолчанию).

---

Этот шаблон полностью покрывает жизненный цикл материала от руды до готового изделия и позволяет легко добавлять новые сущности без изменения кодовой базы, работая исключительно с данными.