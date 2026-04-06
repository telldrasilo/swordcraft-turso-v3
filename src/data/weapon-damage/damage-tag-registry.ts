/**
 * Реестр видимых повреждений оружия (канонические id: `physical_*`, `elemental_*` — SPEC §2–§3).
 * Тексты — от первого лица мастера, короткие строки для UI.
 */

import { SOUL_LEAK_G1_ENHANCEMENT_PLACEHOLDER_ID } from '@/data/weapon-damage/repair-g1-ids'

/** Полное описание тега для данных и UI */
export interface DamageTagDefinition {
  id: string
  /** Короткое имя в списке */
  label: string
  /** 1–2 строки для карточки / инвентаря */
  shortDescription: string
  /** Развёрнуто от первого лица мастера */
  flavorFromSmith: string
  /** Заготовка под кнопку «осмотреть глубже» (фаза 3) */
  analysisHint?: string
  /** Мост к зачарованиям / скрытым маркерам */
  isSpecial: boolean
  /**
   * G1: какие id техник задают **допустимые профили броска** для этого тега.
   * Пустой массив — без ограничения (все пять профилей кубика).
   * Каждый id маппится через `mapTechniqueIdsToRepairDiceProfile([id])`; пересечение по тегам — в `filter-repair-by-damage-tags`.
   * Применимость техник к снятию тегов — `repair-techniques-registry` (`clearsTagIds`).
   */
  allowedRepairTechniqueIds: string[]
  /** Текстовая заглушка влияния на потолок прочности после ремонта */
  maxDurabilityImpactHint: string
  /**
   * G2/G3: тег требует отдельного этапа подготовки (полный цикл не в MVP).
   * UI показывает баннер; логика этапов — позже.
   */
  requiresPrepStep?: boolean
}

/** Без дополнительного ограничения G1 по этому тегу */
const ALL_TECHNIQUES_G1: string[] = []

export const DAMAGE_TAG_REGISTRY: DamageTagDefinition[] = [
  {
    id: 'physical_slash_chip',
    label: 'Сколы на лезвии',
    shortDescription: 'Кромка местами рваная, как после удара о камень.',
    flavorFromSmith:
      'Вижу сколы по режущей кромке — бился об преграду, не остудив удар. Подправить можно, но след останется в стали.',
    analysisHint:
      'Под лупой видно направление удара: косой заход, не излом. Это не заводской брак.',
    isSpecial: false,
    allowedRepairTechniqueIds: ALL_TECHNIQUES_G1,
    maxDurabilityImpactHint: 'После полной правки потолок прочности может быть чуть ниже прежнего.',
  },
  {
    id: 'physical_loose_fitting',
    label: 'Ослабление крепления',
    shortDescription: 'Рукоять или гарда «плывут», клинок бьётся о пяту.',
    flavorFromSmith:
      'Крепление ходит — влага, рывок, или долгая дорога без ухода. Без подтяжки удар пойдёт в шейку, не в цель.',
    analysisHint: 'Люфт не равномерный: ближе к гарде сильнее — типично для трясины и падений.',
    isSpecial: false,
    allowedRepairTechniqueIds: ALL_TECHNIQUES_G1,
    maxDurabilityImpactHint: 'Перетяжка может слегка снизить запас по максимуму, если гнездо расточилось.',
  },
  {
    id: 'physical_gouge_chunk',
    label: 'Вырыв металла',
    shortDescription: 'Глубокая ямка или зазубрина — зверь, шип или тяжёлый удар.',
    flavorFromSmith:
      'Зарубина глубокая — звериная работа или чужая сталь. Снять слой придётся аккуратно, иначе пойдёт трещина.',
    analysisHint: 'Края зоны закалены по-разному — здесь любит застревать ржавчина.',
    isSpecial: false,
    allowedRepairTechniqueIds: ALL_TECHNIQUES_G1,
    maxDurabilityImpactHint: 'Сильное снятие металла уменьшает запас по длине режущей кромки.',
  },
  {
    id: 'physical_bend_warp',
    label: 'Перегиб клинка',
    shortDescription: 'Ось ушла — гарда, шейка или полотно не в плоскости.',
    flavorFromSmith:
      'Вижу деформацию оси: удар мимо плоскости, жар или долгий клинок без опоры. Выпрямить можно, но баланс проверим на стенде.',
    analysisHint: 'Пластическая деформация у основания — не путать с литейным упрочнением; перегиб у острия усиливает изгиб при следующем ударе.',
    isSpecial: false,
    allowedRepairTechniqueIds: ALL_TECHNIQUES_G1,
    maxDurabilityImpactHint: 'После выпрямления возможен лёгкий перекос баланса до подбора веса.',
  },
  {
    id: 'physical_blunt_dull',
    label: 'Затупление',
    shortDescription: 'Режущая кромка закруглена — много ударов о твёрдое.',
    flavorFromSmith:
      'Острие ушло в округ — удары по кости и кольцу брони. Вернуть остроту проще, чем лечить трещину, но металла станет меньше.',
    analysisHint: 'Износ симметричный — не слом, а износ в бою.',
    isSpecial: false,
    allowedRepairTechniqueIds: ALL_TECHNIQUES_G1,
    maxDurabilityImpactHint: 'Переточка снимает слой; максимум длины клинка может чуть уменьшиться.',
  },
  {
    id: 'physical_crack_fissure',
    label: 'Трещина в металле',
    shortDescription: 'Сталь на изгибе устала — после удара или обвала.',
    flavorFromSmith:
      'Вижу усталость металла на изгибе: камень, обвал, удар на рычаге. Такое любит превратиться в трещину позже.',
    analysisHint: 'Микроповреждения в зоне шейки — проверить перед следующей вылазкой.',
    isSpecial: false,
    allowedRepairTechniqueIds: ALL_TECHNIQUES_G1,
    maxDurabilityImpactHint: 'Отжиг и правка могут снизить предельный запас прочности клинка.',
    requiresPrepStep: true,
  },
  {
    id: 'physical_impact_dent',
    label: 'Вмятина на полотне',
    shortDescription: 'Металл ушёл внутрь — удар об камень, обух или тяжёлая дробинка.',
    flavorFromSmith:
      'Вмятина на обухе или плашке — удар не в плоскость. Выровнять молотом можно, но геометрия клинка уже другая.',
    analysisHint: 'Зона смещения ближе к середине полотна — типично для обвала и удара о породу.',
    isSpecial: false,
    allowedRepairTechniqueIds: ALL_TECHNIQUES_G1,
    maxDurabilityImpactHint: 'После рихтовки зона может чуть мягче соседних участков.',
  },
  {
    id: 'physical_puncture_gouge',
    label: 'Прокол и зазубрина',
    shortDescription: 'Глубокая царапина или рваная зона у острия — копьё, шип, клык.',
    flavorFromSmith:
      'Острие поймало чужую сталь или зуб — зазубрина глубокая. Снимать слой придётся аккуратно, иначе уйдёшь в трещину.',
    analysisHint: 'Направление одно — не расползание, а локальный прокол.',
    isSpecial: false,
    allowedRepairTechniqueIds: ALL_TECHNIQUES_G1,
    maxDurabilityImpactHint: 'Восстановление геометрии острия снимает металл с кромки.',
  },
  {
    id: 'physical_handle_split',
    label: 'Трещина рукояти',
    shortDescription: 'Древесина или рог потрескались — влага, удар по эфесу, старость клея.',
    flavorFromSmith:
      'Рукоять пошла трещиной — влага добралась или эфес поймал удар. Склеить и перемотать нужно до следующего рывка.',
    analysisHint: 'Трещина по волокнам — не скол металла; трогать клинок осторожно до перетяжки.',
    isSpecial: false,
    allowedRepairTechniqueIds: ALL_TECHNIQUES_G1,
    maxDurabilityImpactHint: 'Перемотка и клей меняют баланс рукояти; проверка посадки обязательна.',
  },
  {
    id: 'elemental_fire_scorch',
    label: 'Ожог огня',
    shortDescription: 'Тёмные окалины, синеватый налёт — металл перегрелся и остыл резко.',
    flavorFromSmith:
      'Вижу след жара по полотну: окалина легла пятнами — не кузница, а чужой жар. Снимать осторожно, иначе зерно поплывёт.',
    isSpecial: false,
    allowedRepairTechniqueIds: ALL_TECHNIQUES_G1,
    maxDurabilityImpactHint: 'Закалка-отпуск в зоне следа меняет запас прочности локально.',
  },
  {
    id: 'elemental_water_soak',
    label: 'Проточка воды',
    shortDescription: 'Тусклые пятна, рукоять разбухла — влага добралась везде.',
    flavorFromSmith:
      'Металл матовеет, узлы ослабли — вода сделала свою работу. Сушка и пропитка, иначе ржавчина придёт сама.',
    isSpecial: false,
    allowedRepairTechniqueIds: ALL_TECHNIQUES_G1,
    maxDurabilityImpactHint: 'Сушка и воск снижают риск коррозии, но посадка рукояти может смениться.',
  },
  {
    id: 'elemental_earth_grit',
    label: 'Земля и песок в стали',
    shortDescription: 'Царапины, крошка в заклёпках — пыль породы врезалась в металл.',
    flavorFromSmith:
      'Песок и крошка забились в микрорельеф — чистить долго, иначе кромка пойдёт рыть сама себя.',
    isSpecial: false,
    allowedRepairTechniqueIds: ALL_TECHNIQUES_G1,
    maxDurabilityImpactHint: 'Глубокая чистка снимает слой с полировки.',
  },
  {
    id: 'elemental_air_shear',
    label: 'Сдвиг воздуха',
    shortDescription: 'Микротрещины от перепада давления; клинок «звенит» на изгибе.',
    flavorFromSmith:
      'Слышу отзыв металла — воздух бил по плоскости, микротрещины по шейке. Отжиг мягче обычного, иначе лопнет.',
    isSpecial: false,
    allowedRepairTechniqueIds: ALL_TECHNIQUES_G1,
    maxDurabilityImpactHint: 'Гармонизирующий отжиг может чуть снизить твёрдость кромки.',
  },
  {
    id: 'elemental_lightning_arc',
    label: 'След разряда',
    shortDescription: 'Точечные оплавления, кратеры — молния коснулась стали.',
    flavorFromSmith:
      'Точки оплавления — не кузнечный град, а небесный. Выравнивать аккуратно: зона закалки другая.',
    isSpecial: false,
    allowedRepairTechniqueIds: ALL_TECHNIQUES_G1,
    maxDurabilityImpactHint: 'Локальная перекалка меняет отзыв клинка.',
  },
  {
    id: 'elemental_poison_etch',
    label: 'Ядовитое травление',
    shortDescription: 'Матовые зеленоватые разводы, запах горелых трав.',
    flavorFromSmith:
      'Кислота и яд пошли по зерну — не ржавчина, а травление. Нейтрализовать и зачистить, иначе пойдёт глубже.',
    isSpecial: false,
    allowedRepairTechniqueIds: ALL_TECHNIQUES_G1,
    maxDurabilityImpactHint: 'Зачистка снимает слой; пятна могут остаться видимыми.',
  },
  {
    id: 'elemental_space_shift',
    label: 'Сдвиг геометрии',
    shortDescription: 'Линии клинка «плывут» — пространство исказило металл.',
    flavorFromSmith:
      'Геометрия не сходится с шаблоном — не перегиб, а чужое искажение. Стабилизировать долго, иначе баланс уйдёт.',
    isSpecial: false,
    allowedRepairTechniqueIds: ALL_TECHNIQUES_G1,
    maxDurabilityImpactHint: 'Работа с искажением снижает запас по длине режущей кромки.',
    requiresPrepStep: true,
  },
  {
    id: 'elemental_darkness_stain',
    label: 'Теневой налёт',
    shortDescription: 'Чёрные разводы, металл «тяжелеет» на ощупь.',
    flavorFromSmith:
      'Тьма оставила след не как ржавчина — как память тени. Светлая полировка не берёт; нужен другой уход.',
    isSpecial: false,
    allowedRepairTechniqueIds: ALL_TECHNIQUES_G1,
    maxDurabilityImpactHint: 'Очистка может потребовать снятия тонкого слоя.',
  },
  {
    id: 'elemental_light_sear',
    label: 'Ожог света',
    shortDescription: 'Пережжённые зоны, обесцвеченный металл — вспышка или лунный жар.',
    flavorFromSmith:
      'Свет оставил границу между «было» и «стало» на стали. Работать бережно: перегрев уже прошёл.',
    isSpecial: false,
    allowedRepairTechniqueIds: ALL_TECHNIQUES_G1,
    maxDurabilityImpactHint: 'Локальный отпуск выравнивает тон, max может чуть просесть.',
  },
  {
    id: 'elemental_nature_bloom',
    label: 'Порча природы',
    shortDescription: 'Зелёный налёт, споры в царапинах — органика врезалась в металл.',
    flavorFromSmith:
      'Спора и сок добрались до микрорельефа — чистить и окуривать, иначе корни пойдут глубже ржавчины.',
    isSpecial: false,
    allowedRepairTechniqueIds: ALL_TECHNIQUES_G1,
    maxDurabilityImpactHint: 'Глубокая чистка снимает слой патины.',
  },
  {
    id: 'elemental_arcane_noise',
    label: 'Арканический шум',
    shortDescription: 'Мерцающие разводы, слабый гул — магия осталась в стали.',
    flavorFromSmith:
      'Металл гудит тише обычного — чужая частота. Успокоить ритуалом и отжигом, иначе клинок «спорит» с рукой.',
    isSpecial: false,
    allowedRepairTechniqueIds: ALL_TECHNIQUES_G1,
    maxDurabilityImpactHint: 'Ритуальная работа может снизить отклик max до стабильного.',
    requiresPrepStep: true,
  },
  {
    id: 'elemental_blood_mark',
    label: 'Кровяной след',
    shortDescription: 'Тёмно-бурые пятна — память крови на стали.',
    flavorFromSmith:
      'Кровь въелась не как ржавчина — как знак. Смыть и простуить, иначе металл «помнит» дольше, чем нужно.',
    isSpecial: false,
    allowedRepairTechniqueIds: ALL_TECHNIQUES_G1,
    maxDurabilityImpactHint: 'Травление и полировка снимают слой видимости следа.',
  },
  {
    id: 'elemental_corrosion_rot',
    label: 'Коррозия',
    shortDescription: 'Язвенная коррозия и матовость там, где сталь голая.',
    flavorFromSmith:
      'Влага добралась до голого металла — пятна пошли, зерно стало капризнее. Чистка и масло спасут, если не запустить.',
    analysisHint: 'Локально пониженная твёрдость у пятен — не путать с закалкой.',
    isSpecial: false,
    allowedRepairTechniqueIds: ALL_TECHNIQUES_G1,
    maxDurabilityImpactHint: 'Глубокая зачистка снимает слой; потолок защиты от среды падает.',
  },
  {
    id: 'elemental_frost_bite',
    label: 'Мороз по стали',
    shortDescription: 'Белесые пятна и микротрещины у кромки — холод ударил по клинку.',
    flavorFromSmith:
      'Мороз оставил сеточку у шейки — не критично сегодня, опасно завтра, если удар придётся туда же.',
    analysisHint: 'Трещины смотрят в сторону режущей кромки — следить при заточке.',
    isSpecial: false,
    allowedRepairTechniqueIds: ALL_TECHNIQUES_G1,
    maxDurabilityImpactHint: 'Заплавка и отжиг меняют зону термообработки; max может просесть локально.',
  },
  {
    id: 'elemental_skverna_taint',
    label: 'Скверна на клинке',
    shortDescription: 'Серый налёт, липкая рукоять, металл ведёт себя «живее» обычного.',
    flavorFromSmith:
      'Чувствую в металле чужую усталость и порчу — не просто зарубина. Тёмные пятна и отклик стали; для работы с душой клинка это важно.',
    analysisHint: 'Для энциклопедии: связать с биомом, редкими событиями и осью skverna.',
    isSpecial: true,
    allowedRepairTechniqueIds: [
      'blade_soul_tending',
      'frost_crack_seal',
      SOUL_LEAK_G1_ENHANCEMENT_PLACEHOLDER_ID,
    ],
    maxDurabilityImpactHint: 'Особая работа: влияние на max зависит от выбранной операции и удачи.',
    requiresPrepStep: true,
  },
]

const byId = new Map<string, DamageTagDefinition>(
  DAMAGE_TAG_REGISTRY.map((d) => [d.id, d])
)

export function getDamageTagById(id: string): DamageTagDefinition | undefined {
  return byId.get(id)
}

export function getAllDamageTagIds(): string[] {
  return DAMAGE_TAG_REGISTRY.map((d) => d.id)
}
