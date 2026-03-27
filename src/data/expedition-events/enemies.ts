/**
 * События по врагам экспедиций
 * Каждый тип врага имеет свои характерные события
 */

import type { ExpeditionEventTemplate } from '@/types/expedition-events'

// ================================
// ГОБЛИНЫ (goblins)
// ================================

export const GOBLIN_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'goblins_camp',
    text: 'Обнаружен лагерь гоблинов-патрулёров',
    type: 'discovery',
    icon: '🏕️',
    conditions: {
      enemies: ['goblins'],
    },
    weight: 5,
  },
  {
    id: 'goblins_ambush',
    text: 'Гоблины устроили засаду среди деревьев!',
    type: 'combat',
    icon: '⚔️',
    conditions: {
      enemies: ['goblins'],
      special: ['ambush'],
    },
    weight: 4,
  },
  {
    id: 'goblins_trash',
    text: 'Следы гоблинской деятельности повсюду',
    type: 'discovery',
    icon: '🗑️',
    conditions: {
      enemies: ['goblins'],
    },
    weight: 4,
  },
  {
    id: 'goblins_smell',
    text: 'Воздух отдаёт резким гоблинским запахом',
    type: 'danger',
    icon: '👃',
    conditions: {
      enemies: ['goblins'],
    },
    weight: 3,
  },
  {
    id: 'goblins_scavenging',
    text: 'Гоблины-шкурники обшаривают трупы',
    type: 'discovery',
    icon: '🔍',
    conditions: {
      enemies: ['goblins'],
    },
    weight: 3,
  },
  {
    id: 'goblins_trap',
    text: 'Примитивная ловушка гоблинов не сработала',
    type: 'danger',
    icon: '🪤',
    conditions: {
      enemies: ['goblins'],
    },
    weight: 3,
  },
  {
    id: 'goblins_war_cry',
    text: 'Визгливый боевой клич гоблинов!',
    type: 'combat',
    icon: '📢',
    conditions: {
      enemies: ['goblins'],
    },
    weight: 4,
  },
]

// ================================
// НЕЖИТЬ (undead)
// ================================

export const UNDEAD_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'undead_graveyard',
    text: 'Могильная земля вспыхивает жутким светом',
    type: 'mystery',
    icon: '💀',
    conditions: {
      enemies: ['undead'],
    },
    weight: 5,
  },
  {
    id: 'undead_cold',
    text: 'Холод нежити пробирает до костей',
    type: 'danger',
    icon: '❄️',
    conditions: {
      enemies: ['undead'],
    },
    weight: 4,
  },
  {
    id: 'undead_whispers',
    text: 'Безгласные шёпоты нежити слышны в ветру',
    type: 'mystery',
    icon: '👻',
    conditions: {
      enemies: ['undead'],
    },
    weight: 4,
  },
  {
    id: 'undead_risen',
    text: 'Из-под земли выползают мертвецы!',
    type: 'combat',
    icon: '🧟',
    conditions: {
      enemies: ['undead'],
    },
    weight: 5,
  },
  {
    id: 'undead_relics',
    text: 'Священные символы защищают от зла',
    type: 'discovery',
    icon: '✝️',
    conditions: {
      enemies: ['undead'],
    },
    weight: 3,
  },
  {
    id: 'undead_miasma',
    text: 'Гнилостное облако окутывает путь',
    type: 'danger',
    icon: '💨',
    conditions: {
      enemies: ['undead'],
    },
    weight: 4,
  },
]

// ================================
// ВОЛКИ (wolves)
// ================================

export const WOLF_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'wolves_howl',
    text: 'Волчий вой разносится по округе',
    type: 'danger',
    icon: '🐺',
    conditions: {
      enemies: ['wolves'],
    },
    weight: 5,
  },
  {
    id: 'wolves_tracks',
    text: 'Свежие следы волчьей стаи на снегу',
    type: 'discovery',
    icon: '🐾',
    conditions: {
      enemies: ['wolves'],
    },
    weight: 4,
  },
  {
    id: 'wolves_attack',
    text: 'Стая оборвала отставшего!',
    type: 'combat',
    icon: '🐕',
    conditions: {
      enemies: ['wolves'],
    },
    weight: 4,
  },
  {
    id: 'wolves_den',
    text: 'Вдали видна волчья нора',
    type: 'discovery',
    icon: '🕳️',
    conditions: {
      enemies: ['wolves'],
    },
    weight: 3,
  },
  {
    id: 'wolves_pack',
    text: 'Серая тень мелькнула между деревьями',
    type: 'danger',
    icon: '👀',
    conditions: {
      enemies: ['wolves'],
    },
    weight: 4,
  },
  {
    id: 'wolves_alpha',
    text: 'Огромный вожак стаи вышел на тропу',
    type: 'combat',
    icon: '🐺',
    conditions: {
      enemies: ['wolves'],
      special: ['boss'],
    },
    weight: 5,
    flags: { bossOnly: true },
  },
]

// ================================
// РАЗБОЙНИКИ (bandits)
// ================================

export const BANDIT_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'bandits_blockade',
    text: 'Дорога перекрыта бревенчатым заграждением',
    type: 'danger',
    icon: '🚧',
    conditions: {
      enemies: ['bandits'],
    },
    weight: 4,
  },
  {
    id: 'bandits_demand',
    text: 'Стой! Клади оружие и ценности!',
    type: 'combat',
    icon: '💰',
    conditions: {
      enemies: ['bandits'],
    },
    weight: 5,
  },
  {
    id: 'bandits_camp',
    text: 'Бандитский шалаш дымит в роще',
    type: 'discovery',
    icon: '🏕️',
    conditions: {
      enemies: ['bandits'],
    },
    weight: 4,
  },
  {
    id: 'bandits_victim',
    text: 'Ограбленный путник лежит у дороги',
    type: 'discovery',
    icon: '💔',
    conditions: {
      enemies: ['bandits'],
    },
    weight: 3,
  },
  {
    id: 'bandits_leader',
    text: 'Вооружённый главарь банд выступает вперёд',
    type: 'combat',
    icon: '👤',
    conditions: {
      enemies: ['bandits'],
      special: ['boss'],
    },
    weight: 5,
    flags: { bossOnly: true },
  },
  {
    id: 'bandits_wanted',
    text: 'На стволе дерева — плакат о награде',
    type: 'discovery',
    icon: '📋',
    conditions: {
      enemies: ['bandits'],
    },
    weight: 3,
  },
]

// ================================
// ДРАКОНЫ (dragons)
// ================================

export const DRAGON_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'dragons_shadow',
    text: 'Огромная тень пролетела над горами',
    type: 'danger',
    icon: '🐉',
    conditions: {
      enemies: ['dragons'],
    },
    weight: 5,
  },
  {
    id: 'dragons_scorch',
    text: 'Всё вокруг выжжено драконьим пламенем',
    type: 'danger',
    icon: '🔥',
    conditions: {
      enemies: ['dragons'],
    },
    weight: 5,
  },
  {
    id: 'dragons_roar',
    text: 'Рёв раскатывается по горам как гром',
    type: 'danger',
    icon: '📢',
    conditions: {
      enemies: ['dragons'],
    },
    weight: 4,
  },
  {
    id: 'dragons_treasure_glint',
    text: 'В пещере блестят золотые чешуйки и монеты',
    type: 'treasure',
    icon: '💎',
    conditions: {
      enemies: ['dragons'],
    },
    weight: 4,
  },
  {
    id: 'dragons_confrontation',
    text: 'Дракон восседал на троне из черепов',
    type: 'combat',
    icon: '👑',
    conditions: {
      enemies: ['dragons'],
      special: ['boss'],
    },
    weight: 5,
    flags: { bossOnly: true },
  },
  {
    id: 'dragons_cultists',
    text: 'Культисты поклоняются крылатому богу',
    type: 'discovery',
    icon: '🛐',
    conditions: {
      enemies: ['dragons', 'cultists'],
    },
    weight: 3,
  },
]

// ================================
// ДЕМОНЫ (demons)
// ================================

export const DEMON_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'demons_sigil',
    text: 'На земле начертан зловещий символ',
    type: 'mystery',
    icon: '⭕',
    conditions: {
      enemies: ['demons'],
    },
    weight: 4,
  },
  {
    id: 'demons_portal',
    text: 'Щель между мирами трещит энергией',
    type: 'mystery',
    icon: '🌀',
    conditions: {
      enemies: ['demons'],
    },
    weight: 5,
  },
  {
    id: 'demons_smell',
    text: 'Запах серы и горелого заполняет воздух',
    type: 'danger',
    icon: '👃',
    conditions: {
      enemies: ['demons'],
    },
    weight: 4,
  },
  {
    id: 'demons_bargain',
    text: 'Демонический голос шепчет искушения',
    type: 'mystery',
    icon: '🗣️',
    conditions: {
      enemies: ['demons'],
    },
    weight: 3,
  },
  {
    id: 'demons_lord',
    text: 'Владыка демонов явился на бой',
    type: 'combat',
    icon: '👿',
    conditions: {
      enemies: ['demons'],
      special: ['boss'],
    },
    weight: 5,
    flags: { bossOnly: true },
  },
]

// ================================
// КУЛЬТИСТЫ (cultists)
// ================================

export const CULTIST_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'cultists_ritual',
    text: 'Вдали виден свет ритуальных костров',
    type: 'discovery',
    icon: '🔥',
    conditions: {
      enemies: ['cultists'],
    },
    weight: 4,
  },
  {
    id: 'cultists_chant',
    text: 'Неясное пение доносится из глубин',
    type: 'mystery',
    icon: '🎵',
    conditions: {
      enemies: ['cultists'],
    },
    weight: 4,
  },
  {
    id: 'cultists_sacrifice',
    text: 'Алтарь окроплён свежей кровью',
    type: 'danger',
    icon: '🩸',
    conditions: {
      enemies: ['cultists'],
    },
    weight: 4,
  },
  {
    id: 'cultists_surprise',
    text: 'Культисты атакуют из засады!',
    type: 'combat',
    icon: '⚔️',
    conditions: {
      enemies: ['cultists'],
      special: ['ambush'],
    },
    weight: 5,
  },
  {
    id: 'cultists_leader',
    text: 'Жрец-культист поднимает окровавленный кинжал',
    type: 'combat',
    icon: '🔪',
    conditions: {
      enemies: ['cultists'],
      special: ['boss'],
    },
    weight: 5,
    flags: { bossOnly: true },
  },
]

// ================================
// ПАУКИ (spiders)
// ================================

export const SPIDER_EVENTS: ExpeditionEventTemplate[] = [
  {
    id: 'spiders_web',
    text: 'Паутина затрудняет продвижение',
    type: 'danger',
    icon: '🕸️',
    conditions: {
      enemies: ['spiders'],
    },
    weight: 5,
  },
  {
    id: 'spiders_nest',
    text: 'Обнаружено паучье гнездо с яйцами',
    type: 'discovery',
    icon: '🥚',
    conditions: {
      enemies: ['spiders'],
    },
    weight: 3,
  },
  {
    id: 'spiders_eggs',
    text: 'Яйца вот-вот вылупятся!',
    type: 'danger',
    icon: '💥',
    conditions: {
      enemies: ['spiders'],
    },
    weight: 4,
  },
  {
    id: 'spiders_broodmother',
    text: 'Гигантская паучиха выходит из норы',
    type: 'combat',
    icon: '🕷️',
    conditions: {
      enemies: ['spiders'],
      special: ['boss'],
    },
    weight: 5,
    flags: { bossOnly: true },
  },
]

// ================================
// ВСЕ СОБЫТИЯ ПО ВРАГАМ
// ================================

export const ENEMY_EVENTS: ExpeditionEventTemplate[] = [
  ...GOBLIN_EVENTS,
  ...UNDEAD_EVENTS,
  ...WOLF_EVENTS,
  ...BANDIT_EVENTS,
  ...DRAGON_EVENTS,
  ...DEMON_EVENTS,
  ...CULTIST_EVENTS,
  ...SPIDER_EVENTS,
]

export default ENEMY_EVENTS
