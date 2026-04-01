// @ts-nocheck — только вход для scripts/split-world-resource-nodes.mjs; не импортируется.
/**
 * Агрегатор узлов миро-сырья для scripts/split-world-resource-nodes.mjs.
 * После разбиения источник правды — items/*.ts и index.ts.
 */

// @file coal.ts
export const coal = buildWorldNode({
id: 'coal',
    name: 'Уголь',
    role: 'stone',
    economy: { rarity: 28, tier: 1, baseValue: 9, availability: 88, discoverability: 85 },
    summary: loreSummary('Органический минерал. Основное топливо для плавки и кузни.'),
    description:
      'Уголь из шахт и залежей. Используется как топливо и восстановитель при выплавке.',
    tags: ['fuel', 'carbon'],
})

// @file red_stone.ts
export const red_stone = buildWorldNode({
id: 'red_stone',
    name: 'Красный камень',
    role: 'stone',
    economy: { rarity: 30, tier: 1, baseValue: 10, availability: 80, discoverability: 80 },
    summary: loreSummary('Порода с ржавым оттенком из рудников Красного Камня.'),
    description: 'Плотный камень местных жил; пригоден для строительства и как наполнитель.',
})

// @file clay.ts
export const clay = buildWorldNode({
id: 'clay',
    name: 'Глина',
    role: 'stone',
    economy: { rarity: 26, tier: 1, baseValue: 8, availability: 90, discoverability: 85 },
    summary: loreSummary('Пластичная порода для керамики и грубых форм.'),
    description: 'Сырая глина из низин и штолен; сохнет на воздухе, обжигается в печи.',
    tags: ['ceramic'],
})

// @file copper_nuggets.ts
export const copper_nuggets = buildWorldNode({
id: 'copper_nuggets',
    name: 'Медные самородки',
    role: 'ore',
    tags: ['copper-bearing'],
    economy: { rarity: 48, tier: 1, baseValue: 22, availability: 55, discoverability: 50 },
    summary: loreSummary('Куски почти чистой меди без полной переплавки.'),
    description: 'Редкие самородки в верхних жилах; ценятся алхимиками и плавильщиками.',
})

// @file oak_bark.ts
export const oak_bark = buildWorldNode({
id: 'oak_bark',
    name: 'Кора дуба',
    role: 'organic',
    economy: { rarity: 28, tier: 1, baseValue: 7, availability: 88, discoverability: 82 },
    summary: loreSummary('Кора для дубления, настоев и грубых перевязок.'),
    description: 'Собирается с окраин Дубовой Рощи; содержит дубильные вещества.',
})

// @file acorns.ts
export const acorns = buildWorldNode({
id: 'acorns',
    name: 'Жёлуди',
    role: 'organic',
    economy: { rarity: 22, tier: 1, baseValue: 4, availability: 95, discoverability: 90 },
    summary: loreSummary('Семена дуба: корм, мука, заготовки.'),
    description: 'Обычный лесной ресурс; при обработке даёт массу для выпечки и корма.',
})

// @file forest_moss.ts
export const forest_moss = buildWorldNode({
id: 'forest_moss',
    name: 'Лесной мох',
    role: 'organic',
    economy: { rarity: 30, tier: 1, baseValue: 8, availability: 85, discoverability: 80 },
    summary: loreSummary('Мягкий мох для набивки, укрытий и простых снадобий.'),
    description: 'Растёт на старых дубах и пнях; впитывает влагу.',
})

// @file wild_herbs.ts
export const wild_herbs = buildWorldNode({
id: 'wild_herbs',
    name: 'Дикие травы',
    role: 'organic',
    economy: { rarity: 45, tier: 1, baseValue: 16, availability: 60, discoverability: 55 },
    summary: loreSummary('Смесь целебных и ароматических трав.'),
    description: 'Собираются опытом; используются в настойках и простой медицине.',
})

// @file peat.ts
export const peat = buildWorldNode({
id: 'peat',
    name: 'Торф',
    role: 'organic',
    economy: { rarity: 28, tier: 1, baseValue: 7, availability: 82, discoverability: 75 },
    summary: loreSummary('Горючая масса болот; медленное, ровное пламя.'),
    description: 'Добывается в туманных низинах; сырьё для топлива и сушки материалов.',
    tags: ['fuel'],
})

// @file bones.ts
export const bones = buildWorldNode({
id: 'bones',
    name: 'Кости животных',
    role: 'organic',
    economy: { rarity: 26, tier: 1, baseValue: 6, availability: 85, discoverability: 78 },
    summary: loreSummary('Прочный органический материал для клея, инструментов и украшений.'),
    description: 'Набираются на болотах и охотничьих тропах; подходят для измельчения и обработки.',
})

// @file swamp_moss.ts
export const swamp_moss = buildWorldNode({
id: 'swamp_moss',
    name: 'Болотный мох',
    role: 'organic',
    economy: { rarity: 32, tier: 1, baseValue: 9, availability: 78, discoverability: 72 },
    summary: loreSummary('Влажный мох для перевязок и противогнилостных примочек.'),
    description: 'Растёт в тумане; держит влагу дольше лесного собрата.',
})

// @file mist_herbs.ts
export const mist_herbs = buildWorldNode({
id: 'mist_herbs',
    name: 'Туманные травы',
    role: 'organic',
    economy: { rarity: 48, tier: 1, baseValue: 18, availability: 50, discoverability: 48 },
    summary: loreSummary('Травы, цветущие только в постоянном тумане.'),
    description: 'Имеют лёгкие магические свойства из-за среды произрастания.',
})

// @file pine.ts
export const pine = buildWorldNode({
id: 'pine',
    name: 'Сосна',
    role: 'wood',
    economy: { rarity: 30, tier: 2, baseValue: 12, availability: 82, discoverability: 78 },
    summary: loreSummary('Смолистая древесина: лёгкая, пахучая, быстрая в обработке.'),
    description: 'Основная древесина Серебряного Бора; смола выходит при распиле.',
})

// @file pine_resin.ts
export const pine_resin = buildWorldNode({
id: 'pine_resin',
    name: 'Сосновая смола',
    role: 'organic',
    economy: { rarity: 32, tier: 2, baseValue: 11, availability: 80, discoverability: 75 },
    summary: loreSummary('Вязкая смола для пропитки, клея и факела.'),
    description: 'Собирается с коры сосен над серебряными жилами; горит ярко.',
})

// @file silver_bark.ts
export const silver_bark = buildWorldNode({
id: 'silver_bark',
    name: 'Серебряная кора',
    role: 'organic',
    economy: { rarity: 50, tier: 2, baseValue: 24, availability: 48, discoverability: 45 },
    summary: loreSummary('Кора деревьев, подпитывающихся серебром из почвы.'),
    description: 'Слабо проводит магию серебра; подходит для инкрустаций и алхимии.',
})

// @file moonstone_shards.ts
export const moonstone_shards = buildWorldNode({
id: 'moonstone_shards',
    name: 'Осколки лунного камня',
    role: 'gem',
    economy: { rarity: 52, tier: 2, baseValue: 26, availability: 45, discoverability: 42 },
    summary: loreSummary('Светящиеся осколки, питающиеся лунным светом.'),
    description: 'Находятся в Серебряном Бору; используются в амулетах и контроле маны.',
})

// @file silvered_pine.ts
export const silvered_pine = buildWorldNode({
id: 'silvered_pine',
    name: 'Серебристая сосна',
    role: 'wood',
    economy: { rarity: 68, tier: 3, baseValue: 42, availability: 28, discoverability: 30 },
    summary: loreSummary('Дерево, впитавшее серебро; редкая древесина высокого тира.'),
    description: 'Растёт только там, где почва богата серебром; тяжелее обычной сосны.',
})

// @file silver_ore.ts
export const silver_ore = buildWorldNode({
id: 'silver_ore',
    name: 'Серебряная руда',
    role: 'ore',
    tags: ['silver-bearing'],
    economy: { rarity: 42, tier: 2, baseValue: 22, availability: 62, discoverability: 58 },
    summary: loreSummary('Руда с ценным серебром; требует очистки и сплава.'),
    description: 'Стандартный источник серебра в средних тирах.',
})

// @file gold_ore.ts
export const gold_ore = buildWorldNode({
id: 'gold_ore',
    name: 'Золотая руда',
    role: 'ore',
    tags: ['gold-bearing'],
    economy: { rarity: 55, tier: 3, baseValue: 38, availability: 40, discoverability: 38 },
    summary: loreSummary('Редкая руда с высокой ценностью и примесью породы.'),
    description: 'Встречается в драконьих землях и глубинах; плавится в отдельных процессах.',
})

// @file mithril_ore.ts
export const mithril_ore = buildWorldNode({
id: 'mithril_ore',
    name: 'Мифриловая руда',
    role: 'ore',
    tags: ['mithril-bearing'],
    economy: { rarity: 72, tier: 4, baseValue: 58, availability: 22, discoverability: 25 },
    summary: loreSummary('Легендарная руда лёгкого металла невероятной прочности.'),
    description: 'Ключевой ресурс высоких тиров; требует мастерской обработки.',
})

// @file deep_clay.ts
export const deep_clay = buildWorldNode({
id: 'deep_clay',
    name: 'Глубинная глина',
    role: 'stone',
    economy: { rarity: 34, tier: 2, baseValue: 12, availability: 72, discoverability: 65 },
    summary: loreSummary('Плотная глина с нижних уровней шахт.'),
    description: 'Держит форму после обжига лучше поверхностной глины.',
})

// @file ancient_coal.ts
export const ancient_coal = buildWorldNode({
id: 'ancient_coal',
    name: 'Древний уголь',
    role: 'stone',
    tags: ['fuel'],
    economy: { rarity: 48, tier: 2, baseValue: 20, availability: 55, discoverability: 52 },
    summary: loreSummary('Уголь высокой плотности; жар дольше обычного.'),
    description: 'Залегает в забытых шахтах; ценится для высокотемпературной плавки.',
})

// @file echo_stone.ts
export const echo_stone = buildWorldNode({
id: 'echo_stone',
    name: 'Эхо-камень',
    role: 'gem',
    economy: { rarity: 52, tier: 2, baseValue: 24, availability: 48, discoverability: 46 },
    summary: loreSummary('Камень, странным образом отражающий звук и вибрацию.'),
    description: 'Применяется в резонаторах и акустических ловушках древних штолен.',
})

// @file black_dust.ts
export const black_dust = buildWorldNode({
id: 'black_dust',
    name: 'Чёрная пыль',
    role: 'organic',
    economy: { rarity: 50, tier: 2, baseValue: 22, availability: 50, discoverability: 48 },
    summary: loreSummary('Алхимический порошок из глубинных отложений.'),
    description: 'Катализатор для взрывчатых и контрастных смесей; хранить сухим.',
})

// @file depth_iron.ts
export const depth_iron = buildWorldNode({
id: 'depth_iron',
    name: 'Глубинное железо',
    role: 'ore',
    tags: ['iron-bearing'],
    economy: { rarity: 68, tier: 3, baseValue: 44, availability: 32, discoverability: 34 },
    summary: loreSummary('Железная руда с аномально высокой плотностью и чистотой.'),
    description: 'Формируется под давлением глубин; даёт качественный металл.',
})

// @file bog_iron.ts
export const bog_iron = buildWorldNode({
id: 'bog_iron',
    name: 'Болотное железо',
    role: 'ore',
    tags: ['iron-bearing'],
    economy: { rarity: 46, tier: 2, baseValue: 20, availability: 58, discoverability: 55 },
    summary: loreSummary('Руда из заболоченных зон с примесью токсинов.'),
    description: 'Требует дополнительной очистки; может нести «болотную» порчу в сплавах.',
})

// @file rotten_wood.ts
export const rotten_wood = buildWorldNode({
id: 'rotten_wood',
    name: 'Гнилое дерево',
    role: 'wood',
    economy: { rarity: 28, tier: 2, baseValue: 6, availability: 75, discoverability: 70 },
    summary: loreSummary('Рыхлая древесина; горит дымно, годится для импровизаций.'),
    description: 'Массовый ресурс Гнилого Болота; питает грибницы и яды.',
})

// @file poison_gland.ts
export const poison_gland = buildWorldNode({
id: 'poison_gland',
    name: 'Ядовитая железа',
    role: 'organic',
    economy: { rarity: 52, tier: 2, baseValue: 24, availability: 48, discoverability: 45 },
    summary: loreSummary('Орган с сосредоточенным ядом болотных тварей.'),
    description: 'Сырьё для контактных ядов и противоядий при правильной экстракции.',
})

// @file decayed_bones.ts
export const decayed_bones = buildWorldNode({
id: 'decayed_bones',
    name: 'Гнилые кости',
    role: 'organic',
    economy: { rarity: 30, tier: 2, baseValue: 8, availability: 72, discoverability: 68 },
    summary: loreSummary('Кости в стадии разложения; источник костной муки и алхимии.'),
    description: 'Находятся на болотах; риск инфекции при сырой обработке.',
})

// @file shadow_leather.ts
export const shadow_leather = buildWorldNode({
id: 'shadow_leather',
    name: 'Теневая кожа',
    role: 'leather',
    economy: { rarity: 72, tier: 3, baseValue: 48, availability: 28, discoverability: 30 },
    summary: loreSummary('Шкура существ тьмы; поглощает часть света.'),
    description: 'Дорогая кожа для скрытных доспехов и магической обивки.',
})

// @file toxic_moss.ts
export const toxic_moss = buildWorldNode({
id: 'toxic_moss',
    name: 'Токсичный мох',
    role: 'organic',
    economy: { rarity: 48, tier: 2, baseValue: 20, availability: 55, discoverability: 52 },
    summary: loreSummary('Мох, накапливающий яды болота.'),
    description: 'Концентрат для фильтров-ловушек и контролируемых выделений.',
})

// @file cold_iron_ore.ts
export const cold_iron_ore = buildWorldNode({
id: 'cold_iron_ore',
    name: 'Морозная руда',
    role: 'ore',
    tags: ['iron-bearing'],
    economy: { rarity: 52, tier: 3, baseValue: 28, availability: 45, discoverability: 48 },
    summary: loreSummary('Руда, холодная на ощупь даже у кузницы.'),
    description: 'Кормит холодное железо; добывается на Кряже Морозного Железа.',
})

// @file eternal_ice.ts
export const eternal_ice = buildWorldNode({
id: 'eternal_ice',
    name: 'Вечный лёд',
    role: 'special',
    origin: 'natural',
    economy: { rarity: 50, tier: 3, baseValue: 30, availability: 42, discoverability: 40 },
    summary: loreSummary('Лёд, не тающий при обычном нагреве.'),
    description: 'Сохраняет холод; используется как стабилизатор ледяных зачарований.',
})

// @file frozen_crystals.ts
export const frozen_crystals = buildWorldNode({
id: 'frozen_crystals',
    name: 'Ледяные кристаллы',
    role: 'gem',
    economy: { rarity: 68, tier: 3, baseValue: 44, availability: 30, discoverability: 32 },
    summary: loreSummary('Магические кристаллы холода из морозных расщелин.'),
    description: 'Резонируют с водой и воздухом; ценны в магии и алхимии.',
})

// @file cryo_fungi.ts
export const cryo_fungi = buildWorldNode({
id: 'cryo_fungi',
    name: 'Крио-грибы',
    role: 'organic',
    economy: { rarity: 46, tier: 3, baseValue: 22, availability: 50, discoverability: 48 },
    summary: loreSummary('Грибы, растущие в зоне «тепла от холода».'),
    description: 'Парадоксальная флора хребта; экстракты с охлаждающим эффектом.',
})

// @file primordial_ice.ts
export const primordial_ice = buildWorldNode({
id: 'primordial_ice',
    name: 'Первозданный лёд',
    role: 'special',
    origin: 'natural',
    economy: { rarity: 88, tier: 4, baseValue: 78, availability: 12, discoverability: 15 },
    summary: loreSummary('Древний лёд возрастом тысячелетий; хранит память зимы.'),
    description: 'Редчайший ресурс хребта; опасен при быстом нагреве.',
})

// @file volcanic_glass.ts
export const volcanic_glass = buildWorldNode({
id: 'volcanic_glass',
    name: 'Вулканическое стекло',
    role: 'gem',
    economy: { rarity: 66, tier: 3, baseValue: 40, availability: 32, discoverability: 35 },
    summary: loreSummary('Остеклованная лава; режущий край острее многих сплавов.'),
    description: 'Добывается на Пепельных Пустошах; хрупок при ударе сбоку.',
})

// @file ash_dust.ts
export const ash_dust = buildWorldNode({
id: 'ash_dust',
    name: 'Пепельная пыль',
    role: 'organic',
    economy: { rarity: 46, tier: 3, baseValue: 18, availability: 55, discoverability: 52 },
    summary: loreSummary('Мелкая зола вулканов для укрепляющих смесей и адсорбции.'),
    description: 'Тонкий порошок; раздражает лёгкие при вдыхании.',
})

// @file sulfur.ts
export const sulfur = buildWorldNode({
id: 'sulfur',
    name: 'Сера',
    role: 'stone',
    economy: { rarity: 34, tier: 3, baseValue: 14, availability: 65, discoverability: 62 },
    summary: loreSummary('Жёлтый минерал для пороха, спичек и кислот.'),
    description: 'Характерен для жарких зон; хранить от огня и влаги.',
})

// @file fire_stone.ts
export const fire_stone = buildWorldNode({
id: 'fire_stone',
    name: 'Огненный камень',
    role: 'gem',
    economy: { rarity: 70, tier: 3, baseValue: 46, availability: 26, discoverability: 28 },
    summary: loreSummary('Камень, долго удерживающий тепло после нагрева.'),
    description: 'Применяется в накопителях тепла и малых горнах.',
})

// @file primordial_amber.ts
export const primordial_amber = buildWorldNode({
id: 'primordial_amber',
    name: 'Первозданный янтарь',
    role: 'gem',
    economy: { rarity: 88, tier: 4, baseValue: 72, availability: 14, discoverability: 16 },
    summary: loreSummary('Ископаемая смола, пропитанная энергией пепла эпох.'),
    description: 'Капсулирует заряды пламени; эндгейм-материал Пустошей.',
})

// @file spirit_wood.ts
export const spirit_wood = buildWorldNode({
id: 'spirit_wood',
    name: 'Древесина духов',
    role: 'wood',
    economy: { rarity: 70, tier: 3, baseValue: 46, availability: 28, discoverability: 30 },
    summary: loreSummary('Древесина, слегка поглощающая ману вокруг.'),
    description: 'Падает с особых деревьев Шепчущего Леса; подходит для магических рукоятей.',
})

// @file whisper_moss.ts
export const whisper_moss = buildWorldNode({
id: 'whisper_moss',
    name: 'Шепчущий мох',
    role: 'organic',
    economy: { rarity: 48, tier: 3, baseValue: 24, availability: 48, discoverability: 46 },
    summary: loreSummary('Мох для чернил и ментально-насыщенных порошков.'),
    description: 'При растирании издаёт едва слышимый шум, похожий на речь.',
})

// @file echo_bark.ts
export const echo_bark = buildWorldNode({
id: 'echo_bark',
    name: 'Эхо-кора',
    role: 'organic',
    economy: { rarity: 50, tier: 3, baseValue: 26, availability: 46, discoverability: 44 },
    summary: loreSummary('Кора, усиливающая отголоски шагов и заклинаний.'),
    description: 'Собирается с деревьев, чувствительных к вибрациям магии.',
})

// @file memory_leaf.ts
export const memory_leaf = buildWorldNode({
id: 'memory_leaf',
    name: 'Лист памяти',
    role: 'organic',
    economy: { rarity: 68, tier: 3, baseValue: 40, availability: 32, discoverability: 34 },
    summary: loreSummary('Лист, кратко удерживающий эмоциональный отпечаток касания.'),
    description: 'Используется в алхимии воспоминаний и детекции обмана.',
})

// @file dream_resin.ts
export const dream_resin = buildWorldNode({
id: 'dream_resin',
    name: 'Смола снов',
    role: 'organic',
    economy: { rarity: 48, tier: 3, baseValue: 24, availability: 48, discoverability: 46 },
    summary: loreSummary('Липкая смола с лёгким снотворным ароматом.'),
    description: 'База для зелий сна и успокоения без полной потери сознания.',
})

// @file ancient_sap.ts
export const ancient_sap = buildWorldNode({
id: 'ancient_sap',
    name: 'Древний сок',
    role: 'special',
    origin: 'natural',
    economy: { rarity: 88, tier: 4, baseValue: 75, availability: 12, discoverability: 14 },
    summary: loreSummary('Сок Первого Древа; концентрат жизненной силы леса.'),
    description: 'Легендарный ресурс Шепчущего Леса; переполняет слабые сосуды.',
})

// @file dragon_bone.ts
export const dragon_bone = buildWorldNode({
id: 'dragon_bone',
    name: 'Драконья кость',
    role: 'special',
    origin: 'natural',
    economy: { rarity: 72, tier: 4, baseValue: 55, availability: 24, discoverability: 26 },
    summary: loreSummary('Кость драконьего рода: легче стали при огромной твёрдости.'),
    description: 'Основа топоров и древков элитного уровня; трудна в распиле.',
})

// @file dragon_scale.ts
export const dragon_scale = buildWorldNode({
id: 'dragon_scale',
    name: 'Драконья чешуя',
    role: 'leather',
    economy: { rarity: 72, tier: 4, baseValue: 56, availability: 24, discoverability: 26 },
    summary: loreSummary('Чешуя с естественной устойчивостью к жару и удару.'),
    description: 'Идёт на броню и декор; требует специальных прессов.',
})

// @file star_metal.ts
export const star_metal = buildWorldNode({
id: 'star_metal',
    name: 'Звёздный металл',
    role: 'ore',
    tags: ['meteoric'],
    economy: { rarity: 88, tier: 4, baseValue: 82, availability: 14, discoverability: 12 },
    summary: loreSummary('Металл с небес, упавший в эпоху драконьих войн.'),
    description: 'Редчайшая руда для клинков и небесных артефактов.',
})

// @file dragon_glass.ts
export const dragon_glass = buildWorldNode({
id: 'dragon_glass',
    name: 'Драконье стекло',
    role: 'gem',
    economy: { rarity: 88, tier: 4, baseValue: 78, availability: 14, discoverability: 15 },
    summary: loreSummary('Стекло, сплавленное дыханием дракона с песком склонов.'),
    description: 'Сочетает жар и хрупкость; идеально для ритуальных орудий.',
})

// @file heart_of_flame.ts
export const heart_of_flame = buildWorldNode({
id: 'heart_of_flame',
    name: 'Сердце пламени',
    role: 'special',
    origin: 'natural',
    economy: { rarity: 90, tier: 4, baseValue: 85, discoverability: 12, availability: 10 },
    summary: loreSummary('Кристаллизованное дыхание древнего огня.'),
    description: 'Ядро огненных артефактов; нестабильно без оболочки.',
})

// @file void_crystal.ts
export const void_crystal = buildWorldNode({
id: 'void_crystal',
    name: 'Кристалл пустоты',
    role: 'gem',
    economy: { rarity: 90, tier: 4, baseValue: 86, availability: 10, discoverability: 12 },
    summary: loreSummary('Камень, стремящийся «съесть» соседнюю ману и свет.'),
    description: 'Добывается в Глубинах; требует защитных контейнеров.',
})

// @file soulforge_ember.ts
export const soulforge_ember = buildWorldNode({
id: 'soulforge_ember',
    name: 'Уголь душеплавильни',
    role: 'special',
    origin: 'refined',
    economy: { rarity: 90, tier: 4, baseValue: 84, availability: 10, discoverability: 11 },
    summary: loreSummary('Тлеющий уголь, горящий без кислорода и на питании духа.'),
    description: 'Топливо для легендарных горнов; опасен для неподготовленных кузнецов.',
})

// @file depth_stone.ts
export const depth_stone = buildWorldNode({
id: 'depth_stone',
    name: 'Камень глубины',
    role: 'stone',
    economy: { rarity: 48, tier: 4, baseValue: 32, availability: 40, discoverability: 38 },
    summary: loreSummary('Порода ядра мира: плотнее обычного камня.'),
    description: 'Строительный и ритуальный материал глубинных зон.',
})

// @file ancient_metal.ts
export const ancient_metal = buildWorldNode({
id: 'ancient_metal',
    name: 'Древний металл',
    role: 'metal',
    origin: 'alloy',
    economy: { rarity: 72, tier: 4, baseValue: 58, availability: 26, discoverability: 28 },
    summary: loreSummary('Сплав неизвестной эпохи; сохраняет форму веками.'),
    description: 'Слиток-подобный материал из руин глубин; тайна состава.',
})

// @file living_ore.ts
export const living_ore = buildWorldNode({
id: 'living_ore',
    name: 'Живая руда',
    role: 'ore',
    economy: { rarity: 72, tier: 4, baseValue: 56, availability: 24, discoverability: 26 },
    summary: loreSummary('Руда, медленно наращивающая массу при питании маной.'),
    description: 'Требует стабилизации перед плавкой; уникальна для Глубин.',
})

// @file heart_of_the_mountain.ts
export const heart_of_the_mountain = buildWorldNode({
id: 'heart_of_the_mountain',
    name: 'Сердце горы',
    role: 'special',
    origin: 'natural',
    economy: { rarity: 96, tier: 5, baseValue: 120, availability: 5, discoverability: 8 },
    summary: loreSummary('Легендарный конгломерат — память всех металлов мира.'),
    description: 'Кульминационный материал дальних земель; одна добыча меняет статус кузницы.',
})

