/**
 * Эталон для `scripts/gen-world-resource-nodes-from-expedition.mjs` → `world-resources/items`.
 * В рантайме каталог — `library/world-resources` (`buildWorldNode`); этот файл не экспортируется из `expedition/index.ts`.
 */

import { expeditionNode } from './factory'
import type { MaterialNode } from '@/types/materials/material-core'

const sb = (basic: string): MaterialNode['summary'] => ({
  basic,
  applied: basic,
  strengths: ['Экспедиционный ресурс'],
  weaknesses: ['Требует специальной обработки'],
  bestFor: ['Экспедиции', 'Коллекции', 'Будущий крафт'],
})

export const expeditionMaterialNodes: MaterialNode[] = [
  expeditionNode({
    id: 'coal',
    name: 'Уголь',
    role: 'stone',
    economy: { rarity: 28, tier: 1, baseValue: 9, availability: 88, discoverability: 85 },
    summary: sb('Органический минерал. Основное топливо для плавки и кузни.'),
    description:
      'Уголь из экспедиций и шахт. Используется как топливо и восстановитель при выплавке.',
    tags: ['fuel', 'carbon'],
  }),

  expeditionNode({
    id: 'red_stone',
    name: 'Красный камень',
    role: 'stone',
    economy: { rarity: 30, tier: 1, baseValue: 10, availability: 80, discoverability: 80 },
    summary: sb('Порода с ржавым оттенком из рудников Красного Камня.'),
    description: 'Плотный камень местных жил; пригоден для строительства и как наполнитель.',
  }),

  expeditionNode({
    id: 'clay',
    name: 'Глина',
    role: 'stone',
    economy: { rarity: 26, tier: 1, baseValue: 8, availability: 90, discoverability: 85 },
    summary: sb('Пластичная порода для керамики и грубых форм.'),
    description: 'Сырая глина из низин и штолен; сохнет на воздухе, обжигается в печи.',
    tags: ['ceramic'],
  }),

  expeditionNode({
    id: 'copper_nuggets',
    name: 'Медные самородки',
    role: 'ore',
    tags: ['copper-bearing'],
    economy: { rarity: 48, tier: 1, baseValue: 22, availability: 55, discoverability: 50 },
    summary: sb('Куски почти чистой меди без полной переплавки.'),
    description: 'Редкие самородки в верхних жилах; ценятся алхимиками и плавильщиками.',
  }),

  expeditionNode({
    id: 'oak_bark',
    name: 'Кора дуба',
    role: 'organic',
    economy: { rarity: 28, tier: 1, baseValue: 7, availability: 88, discoverability: 82 },
    summary: sb('Кора для дубления, настоев и грубых перевязок.'),
    description: 'Собирается с окраин Дубовой Рощи; содержит дубильные вещества.',
  }),

  expeditionNode({
    id: 'acorns',
    name: 'Жёлуди',
    role: 'organic',
    economy: { rarity: 22, tier: 1, baseValue: 4, availability: 95, discoverability: 90 },
    summary: sb('Семена дуба: корм, мука, заготовки.'),
    description: 'Обычный лесной ресурс; при обработке даёт массу для выпечки и корма.',
  }),

  expeditionNode({
    id: 'forest_moss',
    name: 'Лесной мох',
    role: 'organic',
    economy: { rarity: 30, tier: 1, baseValue: 8, availability: 85, discoverability: 80 },
    summary: sb('Мягкий мох для набивки, укрытий и простых снадобий.'),
    description: 'Растёт на старых дубах и пнях; впитывает влагу.',
  }),

  expeditionNode({
    id: 'wild_herbs',
    name: 'Дикие травы',
    role: 'organic',
    economy: { rarity: 45, tier: 1, baseValue: 16, availability: 60, discoverability: 55 },
    summary: sb('Смесь целебных и ароматических трав.'),
    description: 'Собираются опытом; используются в настойках и простой медицине.',
  }),

  expeditionNode({
    id: 'peat',
    name: 'Торф',
    role: 'organic',
    economy: { rarity: 28, tier: 1, baseValue: 7, availability: 82, discoverability: 75 },
    summary: sb('Горючая масса болот; медленное, ровное пламя.'),
    description: 'Добывается в туманных низинах; сырьё для топлива и сушки материалов.',
    tags: ['fuel'],
  }),

  expeditionNode({
    id: 'bones',
    name: 'Кости животных',
    role: 'organic',
    economy: { rarity: 26, tier: 1, baseValue: 6, availability: 85, discoverability: 78 },
    summary: sb('Прочный органический материал для клея, инструментов и украшений.'),
    description: 'Набираются на болотах и охотничьих тропах; подходят для измельчения и обработки.',
  }),

  expeditionNode({
    id: 'swamp_moss',
    name: 'Болотный мох',
    role: 'organic',
    economy: { rarity: 32, tier: 1, baseValue: 9, availability: 78, discoverability: 72 },
    summary: sb('Влажный мох для перевязок и противогнилостных примочек.'),
    description: 'Растёт в тумане; держит влагу дольше лесного собрата.',
  }),

  expeditionNode({
    id: 'mist_herbs',
    name: 'Туманные травы',
    role: 'organic',
    economy: { rarity: 48, tier: 1, baseValue: 18, availability: 50, discoverability: 48 },
    summary: sb('Травы, цветущие только в постоянном тумане.'),
    description: 'Имеют лёгкие магические свойства из-за среды произрастания.',
  }),

  expeditionNode({
    id: 'pine',
    name: 'Сосна',
    role: 'wood',
    economy: { rarity: 30, tier: 2, baseValue: 12, availability: 82, discoverability: 78 },
    summary: sb('Смолистая древесина: лёгкая, пахучая, быстрая в обработке.'),
    description: 'Основная древесина Серебряного Бора; смола выходит при распиле.',
  }),

  expeditionNode({
    id: 'pine_resin',
    name: 'Сосновая смола',
    role: 'organic',
    economy: { rarity: 32, tier: 2, baseValue: 11, availability: 80, discoverability: 75 },
    summary: sb('Вязкая смола для пропитки, клея и факела.'),
    description: 'Собирается с коры сосен над серебряными жилами; горит ярко.',
  }),

  expeditionNode({
    id: 'silver_bark',
    name: 'Серебряная кора',
    role: 'organic',
    economy: { rarity: 50, tier: 2, baseValue: 24, availability: 48, discoverability: 45 },
    summary: sb('Кора деревьев, подпитывающихся серебром из почвы.'),
    description: 'Слабо проводит магию серебра; подходит для инкрустаций и алхимии.',
  }),

  expeditionNode({
    id: 'moonstone_shards',
    name: 'Осколки лунного камня',
    role: 'gem',
    economy: { rarity: 52, tier: 2, baseValue: 26, availability: 45, discoverability: 42 },
    summary: sb('Светящиеся осколки, питающиеся лунным светом.'),
    description: 'Находятся в Серебряном Бору; используются в амулетах и контроле маны.',
  }),

  expeditionNode({
    id: 'silvered_pine',
    name: 'Серебристая сосна',
    role: 'wood',
    economy: { rarity: 68, tier: 3, baseValue: 42, availability: 28, discoverability: 30 },
    summary: sb('Дерево, впитавшее серебро; редкая древесина высокого тира.'),
    description: 'Растёт только там, где почва богата серебром; тяжелее обычной сосны.',
  }),

  expeditionNode({
    id: 'silver_ore',
    name: 'Серебряная руда',
    role: 'ore',
    tags: ['silver-bearing'],
    economy: { rarity: 42, tier: 2, baseValue: 22, availability: 62, discoverability: 58 },
    summary: sb('Руда с ценным серебром; требует очистки и сплава.'),
    description: 'Стандартный источник серебра в экспедициях средних тиров.',
  }),

  expeditionNode({
    id: 'gold_ore',
    name: 'Золотая руда',
    role: 'ore',
    tags: ['gold-bearing'],
    economy: { rarity: 55, tier: 3, baseValue: 38, availability: 40, discoverability: 38 },
    summary: sb('Редкая руда с высокой ценностью и примесью породы.'),
    description: 'Встречается в драконьих землях и глубинах; плавится в отдельных процессах.',
  }),

  expeditionNode({
    id: 'mithril_ore',
    name: 'Мифриловая руда',
    role: 'ore',
    tags: ['mithril-bearing'],
    economy: { rarity: 72, tier: 4, baseValue: 58, availability: 22, discoverability: 25 },
    summary: sb('Легендарная руда лёгкого металла невероятной прочности.'),
    description: 'Ключевой ресурс эндгейм-экспедиций; требует мастерской обработки.',
  }),

  expeditionNode({
    id: 'deep_clay',
    name: 'Глубинная глина',
    role: 'stone',
    economy: { rarity: 34, tier: 2, baseValue: 12, availability: 72, discoverability: 65 },
    summary: sb('Плотная глина с нижних уровней шахт.'),
    description: 'Держит форму после обжига лучше поверхностной глины.',
  }),

  expeditionNode({
    id: 'ancient_coal',
    name: 'Древний уголь',
    role: 'stone',
    tags: ['fuel'],
    economy: { rarity: 48, tier: 2, baseValue: 20, availability: 55, discoverability: 52 },
    summary: sb('Уголь высокой плотности; жар дольше обычного.'),
    description: 'Залегает в забытых шахтах; ценится для высокотемпературной плавки.',
  }),

  expeditionNode({
    id: 'echo_stone',
    name: 'Эхо-камень',
    role: 'gem',
    economy: { rarity: 52, tier: 2, baseValue: 24, availability: 48, discoverability: 46 },
    summary: sb('Камень, странным образом отражающий звук и вибрацию.'),
    description: 'Применяется в резонаторах и акустических ловушках древних штолен.',
  }),

  expeditionNode({
    id: 'black_dust',
    name: 'Чёрная пыль',
    role: 'organic',
    economy: { rarity: 50, tier: 2, baseValue: 22, availability: 50, discoverability: 48 },
    summary: sb('Алхимический порошок из глубинных отложений.'),
    description: 'Катализатор для взрывчатых и контрастных смесей; хранить сухим.',
  }),

  expeditionNode({
    id: 'depth_iron',
    name: 'Глубинное железо',
    role: 'ore',
    tags: ['iron-bearing'],
    economy: { rarity: 68, tier: 3, baseValue: 44, availability: 32, discoverability: 34 },
    summary: sb('Железная руда с аномально высокой плотностью и чистотой.'),
    description: 'Формируется под давлением глубин; даёт качественный металл.',
  }),

  expeditionNode({
    id: 'bog_iron',
    name: 'Болотное железо',
    role: 'ore',
    tags: ['iron-bearing'],
    economy: { rarity: 46, tier: 2, baseValue: 20, availability: 58, discoverability: 55 },
    summary: sb('Руда из заболоченных зон с примесью токсинов.'),
    description: 'Требует дополнительной очистки; может нести «болотную» порчу в сплавах.',
  }),

  expeditionNode({
    id: 'rotten_wood',
    name: 'Гнилое дерево',
    role: 'wood',
    economy: { rarity: 28, tier: 2, baseValue: 6, availability: 75, discoverability: 70 },
    summary: sb('Рыхлая древесина; горит дымно, годится для импровизаций.'),
    description: 'Массовый ресурс Гнилого Болота; питает грибницы и яды.',
  }),

  expeditionNode({
    id: 'poison_gland',
    name: 'Ядовитая железа',
    role: 'organic',
    economy: { rarity: 52, tier: 2, baseValue: 24, availability: 48, discoverability: 45 },
    summary: sb('Орган с сосредоточенным ядом болотных тварей.'),
    description: 'Сырьё для контактных ядов и противоядий при правильной экстракции.',
  }),

  expeditionNode({
    id: 'decayed_bones',
    name: 'Гнилые кости',
    role: 'organic',
    economy: { rarity: 30, tier: 2, baseValue: 8, availability: 72, discoverability: 68 },
    summary: sb('Кости в стадии разложения; источник костной муки и алхимии.'),
    description: 'Находятся на болотах; риск инфекции при сырой обработке.',
  }),

  expeditionNode({
    id: 'shadow_leather',
    name: 'Теневая кожа',
    role: 'leather',
    economy: { rarity: 72, tier: 3, baseValue: 48, availability: 28, discoverability: 30 },
    summary: sb('Шкура существ тьмы; поглощает часть света.'),
    description: 'Дорогая кожа для скрытных доспехов и магической обивки.',
  }),

  expeditionNode({
    id: 'toxic_moss',
    name: 'Токсичный мох',
    role: 'organic',
    economy: { rarity: 48, tier: 2, baseValue: 20, availability: 55, discoverability: 52 },
    summary: sb('Мох, накапливающий яды болота.'),
    description: 'Концентрат для фильтров-ловушек и контролируемых выделений.',
  }),

  expeditionNode({
    id: 'cold_iron_ore',
    name: 'Морозная руда',
    role: 'ore',
    tags: ['iron-bearing'],
    economy: { rarity: 52, tier: 3, baseValue: 28, availability: 45, discoverability: 48 },
    summary: sb('Руда, холодная на ощупь даже у кузницы.'),
    description: 'Кормит холодное железо; добывается на Кряже Морозного Железа.',
  }),

  expeditionNode({
    id: 'eternal_ice',
    name: 'Вечный лёд',
    role: 'special',
    origin: 'natural',
    economy: { rarity: 50, tier: 3, baseValue: 30, availability: 42, discoverability: 40 },
    summary: sb('Лёд, не тающий при обычном нагреве.'),
    description: 'Сохраняет холод; используется как стабилизатор ледяных зачарований.',
  }),

  expeditionNode({
    id: 'frozen_crystals',
    name: 'Ледяные кристаллы',
    role: 'gem',
    economy: { rarity: 68, tier: 3, baseValue: 44, availability: 30, discoverability: 32 },
    summary: sb('Магические кристаллы холода из морозных расщелин.'),
    description: 'Резонируют с водой и воздухом; ценны в магии и алхимии.',
  }),

  expeditionNode({
    id: 'cryo_fungi',
    name: 'Крио-грибы',
    role: 'organic',
    economy: { rarity: 46, tier: 3, baseValue: 22, availability: 50, discoverability: 48 },
    summary: sb('Грибы, растущие в зоне «тепла от холода».'),
    description: 'Парадоксальная флора хребта; экстракты с охлаждающим эффектом.',
  }),

  expeditionNode({
    id: 'primordial_ice',
    name: 'Первозданный лёд',
    role: 'special',
    origin: 'natural',
    economy: { rarity: 88, tier: 4, baseValue: 78, availability: 12, discoverability: 15 },
    summary: sb('Древний лёд возрастом тысячелетий; хранит память зимы.'),
    description: 'Редчайший ресурс хребта; опасен при быстом нагреве.',
  }),

  expeditionNode({
    id: 'volcanic_glass',
    name: 'Вулканическое стекло',
    role: 'gem',
    economy: { rarity: 66, tier: 3, baseValue: 40, availability: 32, discoverability: 35 },
    summary: sb('Остеклованная лава; режущий край острее многих сплавов.'),
    description: 'Добывается на Пепельных Пустошах; хрупок при ударе сбоку.',
  }),

  expeditionNode({
    id: 'ash_dust',
    name: 'Пепельная пыль',
    role: 'organic',
    economy: { rarity: 46, tier: 3, baseValue: 18, availability: 55, discoverability: 52 },
    summary: sb('Мелкая зола вулканов для укрепляющих смесей и адсорбции.'),
    description: 'Тонкий порошок; раздражает лёгкие при вдыхании.',
  }),

  expeditionNode({
    id: 'sulfur',
    name: 'Сера',
    role: 'stone',
    economy: { rarity: 34, tier: 3, baseValue: 14, availability: 65, discoverability: 62 },
    summary: sb('Жёлтый минерал для пороха, спичек и кислот.'),
    description: 'Характерен для жарких зон; хранить от огня и влаги.',
  }),

  expeditionNode({
    id: 'fire_stone',
    name: 'Огненный камень',
    role: 'gem',
    economy: { rarity: 70, tier: 3, baseValue: 46, availability: 26, discoverability: 28 },
    summary: sb('Камень, долго удерживающий тепло после нагрева.'),
    description: 'Применяется в накопителях тепла и малых горнах.',
  }),

  expeditionNode({
    id: 'primordial_amber',
    name: 'Первозданный янтарь',
    role: 'gem',
    economy: { rarity: 88, tier: 4, baseValue: 72, availability: 14, discoverability: 16 },
    summary: sb('Ископаемая смола, пропитанная энергией пепла эпох.'),
    description: 'Капсулирует заряды пламени; эндгейм-материал Пустошей.',
  }),

  expeditionNode({
    id: 'spirit_wood',
    name: 'Древесина духов',
    role: 'wood',
    economy: { rarity: 70, tier: 3, baseValue: 46, availability: 28, discoverability: 30 },
    summary: sb('Древесина, слегка поглощающая ману вокруг.'),
    description: 'Падает с особых деревьев Шепчущего Леса; подходит для магических рукоятей.',
  }),

  expeditionNode({
    id: 'whisper_moss',
    name: 'Шепчущий мох',
    role: 'organic',
    economy: { rarity: 48, tier: 3, baseValue: 24, availability: 48, discoverability: 46 },
    summary: sb('Мох для чернил и ментально-насыщенных порошков.'),
    description: 'При растирании издаёт едва слышимый шум, похожий на речь.',
  }),

  expeditionNode({
    id: 'echo_bark',
    name: 'Эхо-кора',
    role: 'organic',
    economy: { rarity: 50, tier: 3, baseValue: 26, availability: 46, discoverability: 44 },
    summary: sb('Кора, усиливающая отголоски шагов и заклинаний.'),
    description: 'Собирается с деревьев, чувствительных к вибрациям магии.',
  }),

  expeditionNode({
    id: 'memory_leaf',
    name: 'Лист памяти',
    role: 'organic',
    economy: { rarity: 68, tier: 3, baseValue: 40, availability: 32, discoverability: 34 },
    summary: sb('Лист, кратко удерживающий эмоциональный отпечаток касания.'),
    description: 'Используется в алхимии воспоминаний и детекции обмана.',
  }),

  expeditionNode({
    id: 'dream_resin',
    name: 'Смола снов',
    role: 'organic',
    economy: { rarity: 48, tier: 3, baseValue: 24, availability: 48, discoverability: 46 },
    summary: sb('Липкая смола с лёгким снотворным ароматом.'),
    description: 'База для зелий сна и успокоения без полной потери сознания.',
  }),

  expeditionNode({
    id: 'ancient_sap',
    name: 'Древний сок',
    role: 'special',
    origin: 'natural',
    economy: { rarity: 88, tier: 4, baseValue: 75, availability: 12, discoverability: 14 },
    summary: sb('Сок Первого Древа; концентрат жизненной силы леса.'),
    description: 'Легендарный ресурс Шепчущего Леса; переполняет слабые сосуды.',
  }),

  expeditionNode({
    id: 'dragon_bone',
    name: 'Драконья кость',
    role: 'special',
    origin: 'natural',
    economy: { rarity: 72, tier: 4, baseValue: 55, availability: 24, discoverability: 26 },
    summary: sb('Кость драконьего рода: легче стали при огромной твёрдости.'),
    description: 'Основа топоров и древков элитного уровня; трудна в распиле.',
  }),

  expeditionNode({
    id: 'dragon_scale',
    name: 'Драконья чешуя',
    role: 'leather',
    economy: { rarity: 72, tier: 4, baseValue: 56, availability: 24, discoverability: 26 },
    summary: sb('Чешуя с естественной устойчивостью к жару и удару.'),
    description: 'Идёт на броню и декор; требует специальных прессов.',
  }),

  expeditionNode({
    id: 'star_metal',
    name: 'Звёздный металл',
    role: 'ore',
    tags: ['meteoric'],
    economy: { rarity: 88, tier: 4, baseValue: 82, availability: 14, discoverability: 12 },
    summary: sb('Металл с небес, упавший в эпоху драконьих войн.'),
    description: 'Редчайшая руда для клинков и небесных артефактов.',
  }),

  expeditionNode({
    id: 'dragon_glass',
    name: 'Драконье стекло',
    role: 'gem',
    economy: { rarity: 88, tier: 4, baseValue: 78, availability: 14, discoverability: 15 },
    summary: sb('Стекло, сплавленное дыханием дракона с песком склонов.'),
    description: 'Сочетает жар и хрупкость; идеально для ритуальных орудий.',
  }),

  expeditionNode({
    id: 'heart_of_flame',
    name: 'Сердце пламени',
    role: 'special',
    origin: 'natural',
    economy: { rarity: 90, tier: 4, baseValue: 85, discoverability: 12, availability: 10 },
    summary: sb('Кристаллизованное дыхание древнего огня.'),
    description: 'Ядро огненных артефактов; нестабильно без оболочки.',
  }),

  expeditionNode({
    id: 'void_crystal',
    name: 'Кристалл пустоты',
    role: 'gem',
    economy: { rarity: 90, tier: 4, baseValue: 86, availability: 10, discoverability: 12 },
    summary: sb('Камень, стремящийся «съесть» соседнюю ману и свет.'),
    description: 'Добывается в Глубинах; требует защитных контейнеров.',
  }),

  expeditionNode({
    id: 'soulforge_ember',
    name: 'Уголь душеплавильни',
    role: 'special',
    origin: 'refined',
    economy: { rarity: 90, tier: 4, baseValue: 84, availability: 10, discoverability: 11 },
    summary: sb('Тлеющий уголь, горящий без кислорода и на питании духа.'),
    description: 'Топливо для легендарных горнов; опасен для неподготовленных кузнецов.',
  }),

  expeditionNode({
    id: 'depth_stone',
    name: 'Камень глубины',
    role: 'stone',
    economy: { rarity: 48, tier: 4, baseValue: 32, availability: 40, discoverability: 38 },
    summary: sb('Порода ядра мира: плотнее обычного камня.'),
    description: 'Строительный и ритуальный материал глубинных зон.',
  }),

  expeditionNode({
    id: 'ancient_metal',
    name: 'Древний металл',
    role: 'metal',
    origin: 'alloy',
    economy: { rarity: 72, tier: 4, baseValue: 58, availability: 26, discoverability: 28 },
    summary: sb('Сплав неизвестной эпохи; сохраняет форму веками.'),
    description: 'Слиток-подобный материал из руин глубин; тайна состава.',
  }),

  expeditionNode({
    id: 'living_ore',
    name: 'Живая руда',
    role: 'ore',
    economy: { rarity: 72, tier: 4, baseValue: 56, availability: 24, discoverability: 26 },
    summary: sb('Руда, медленно наращивающая массу при питании маной.'),
    description: 'Требует стабилизации перед плавкой; уникальна для Глубин.',
  }),

  expeditionNode({
    id: 'heart_of_the_mountain',
    name: 'Сердце горы',
    role: 'special',
    origin: 'natural',
    economy: { rarity: 96, tier: 5, baseValue: 120, availability: 5, discoverability: 8 },
    summary: sb('Легендарный конгломерат — память всех металлов мира.'),
    description: 'Кульминационный материал экспедиций; одна добыча меняет статус кузницы.',
  }),
]
