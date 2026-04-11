/**
 * Конфигурация макрофаз строительства алтаря v2.
 * @see docs/Quests/ALTAR_REWORK/ALTAR_BUILDING_V2.md
 *
 * Суммы длительностей микроэтапов (сек) по текущему конфигу — ориентир ГД «1–3 ч на фазу»:
 * фаза I ~7200, II ~10200, III ~7200, IV ~10800, V ~9000. Плейтест: править `durationSec` здесь.
 *
 * Количества материалов на старт фаз — в `altar-phase-material-balance.ts`.
 */

import type { AltarPhase, AltarPhaseConfig } from '@/types/altar-construction'
import {
  ALTAR_PHASE1_MATERIAL_DISPLAY_HINTS,
  ALTAR_PHASE1_REQUIRED_MATERIALS,
  ALTAR_PHASE2_REQUIRED_MATERIALS,
  ALTAR_PHASE3_REQUIRED_MATERIALS,
  ALTAR_PHASE4_REQUIRED_MATERIALS,
  ALTAR_PHASE5_REQUIRED_MATERIALS,
} from './altar-phase-material-balance'

/** Реэкспорт производных фазы I (тесты, UI тултипы). */
export {
  ALTAR_PHASE1_COAL_REQUIRED,
  ALTAR_PHASE1_CONSTRUCTION_COAL,
  ALTAR_PHASE1_IRON_ALLOY_EQUIV,
  ALTAR_PHASE1_IRON_ORE_REQUIRED,
  ALTAR_PHASE1_SMELT_COAL,
} from './altar-phase-material-balance'

function sumStageSeconds(stages: AltarPhaseConfig['stages']): number {
  return stages.reduce((a, s) => a + s.durationSec, 0)
}

const phase1Stages: AltarPhaseConfig['stages'] = [
  {
    id: 'clear_debris',
    name: 'Расчистка мусора и камней',
    durationSec: 900,
    description: 'Руками убираем крупные камни и корни.',
  },
  {
    id: 'dig_foundation',
    name: 'Копка котлована под фундамент',
    durationSec: 1800,
    description: 'Лопатами выравниваем площадку.',
  },
  {
    id: 'mix_clay_mortar',
    name: 'Замес глиняного раствора',
    durationSec: 600,
    description: 'Приготавливаем раствор.',
  },
  {
    id: 'lay_foundation',
    name: 'Кладка фундамента из камня',
    durationSec: 2400,
    description: 'Укладка полевого камня на раствор.',
  },
  {
    id: 'forge_brackets',
    name: 'Ковка железных скоб',
    durationSec: 900,
    techniqueId: 'basic_forging',
    description: 'Куём железные крепления.',
  },
  {
    id: 'install_brackets',
    name: 'Установка скоб',
    durationSec: 600,
    description: 'Закрепляем скобы в фундаменте.',
  },
]

const phase2Stages: AltarPhaseConfig['stages'] = [
  {
    id: 'smelt_iron',
    name: 'Переплавка железной руды в слитки',
    durationSec: 1200,
    techniqueId: 'basic_forging',
    description: 'Загружаем руду и уголь в печь, выплавляем железо.',
  },
  {
    id: 'cut_metal_rods',
    name: 'Резка прутьев',
    durationSec: 1200,
    techniqueId: 'basic_forging',
    description: 'Из слитков куём и режем заготовки для рамы.',
  },
  {
    id: 'weld_frame',
    name: 'Сварка рамы',
    durationSec: 1800,
    techniqueId: 'basic_forging',
    description: 'Соединяем прутья в прямоугольную раму.',
  },
  {
    id: 'forge_reinforcements',
    name: 'Ковка усиливающих колец',
    durationSec: 1500,
    techniqueId: 'folded_steel',
    description: 'Складываем металл в несколько слоёв для прочности колец.',
  },
  {
    id: 'attach_rings',
    name: 'Крепление колец',
    durationSec: 1200,
    techniqueId: 'basic_forging',
    description: 'Привариваем кольца к раме.',
  },
  {
    id: 'leather_wrap',
    name: 'Обмотка кожей с пропиткой смолой',
    durationSec: 1200,
    description: 'Кожа и смола для амортизации.',
  },
  {
    id: 'erect_pillars',
    name: 'Установка опор',
    durationSec: 1500,
    techniqueId: 'double_hardening',
    description: 'Закаливаем опоры двойным нагревом и резким охлаждением.',
  },
  {
    id: 'secure_pillars',
    name: 'Фиксация опор хомутами',
    durationSec: 600,
    techniqueId: 'basic_forging',
    description: 'Закрепляем опоры коваными хомутами.',
  },
]

const phase3Stages: AltarPhaseConfig['stages'] = [
  {
    id: 'clean_matrix',
    name: 'Очистка резонаторной матрицы',
    durationSec: 600,
    description: 'Удаляем пыль и грязь с артефакта.',
  },
  {
    id: 'engrave_matrix',
    name: 'Гравировка рун на матрице',
    durationSec: 1800,
    techniqueId: 'rune_engraving_basic',
    description: 'Наносим руническую вязь для фокусировки эссенции.',
  },
  {
    id: 'prepare_clay',
    name: 'Приготовление огнеупорной глины',
    durationSec: 900,
    techniqueId: 'clay_firing',
    description: 'Замешиваем особую глину для обжига чаши.',
  },
  {
    id: 'fire_chalice',
    name: 'Обжиг чаши в печи',
    durationSec: 1500,
    techniqueId: 'clay_firing',
    description: 'Обжигаем фокусирующую чашу при высокой температуре.',
  },
  {
    id: 'tune_fork_prep',
    name: 'Чистка и калибровка камертона',
    durationSec: 600,
    description: 'Снимаем окислы с лунного камертона.',
  },
  {
    id: 'tune_fork',
    name: 'Настройка частоты',
    durationSec: 1800,
    techniqueId: 'frequency_tuning',
    description: 'Подстраиваем вилку под резонанс эссенции.',
  },
]

const phase4Stages: AltarPhaseConfig['stages'] = [
  {
    id: 'cast_copper_wires',
    name: 'Литьё медных проводников',
    durationSec: 1500,
    techniqueId: 'basic_forging',
    description: 'Плавим медь и отливаем тонкие жилы.',
  },
  {
    id: 'lay_wires',
    name: 'Прокладка проводников',
    durationSec: 1500,
    description: 'Укладываем медные жилы в пазы каркаса.',
  },
  {
    id: 'set_resonators',
    name: 'Установка резонаторов',
    durationSec: 1800,
    techniqueId: 'frequency_tuning',
    description: 'Настраиваем резонаторы из красного камня на нужную частоту.',
  },
  {
    id: 'invoke_spirits',
    name: 'Призыв духов для проводки',
    durationSec: 1800,
    techniqueId: 'spirit_blessing',
    description: 'Ритуал благословения, чтобы духи направили эссенцию.',
  },
  {
    id: 'channel_essence',
    name: 'Формирование каналов эссенции',
    durationSec: 1200,
    description: 'Физическая прокладка каналов.',
  },
  {
    id: 'install_stabilizers',
    name: 'Крепление стабилизирующих колец',
    durationSec: 1500,
    techniqueId: 'basic_forging',
    description: 'Крепим оловянные кольца для подавления помех.',
  },
  {
    id: 'align_circuit',
    name: 'Выравнивание контура',
    durationSec: 1500,
    techniqueId: 'frequency_tuning',
    description: 'Точная подстройка резонанса всей системы.',
  },
]

const phase5Stages: AltarPhaseConfig['stages'] = [
  {
    id: 'clean_channels',
    name: 'Очистка каналов эссенции травами',
    durationSec: 1200,
    description: 'Окуриваем каналы травами и мхом.',
  },
  {
    id: 'align_flow',
    name: 'Выравнивание потоков',
    durationSec: 1800,
    techniqueId: 'frequency_tuning',
    description: 'Настраиваем частоту эссенции для равномерного потока.',
  },
  {
    id: 'ignition_ritual',
    name: 'Ритуал зажжения',
    durationSec: 1800,
    techniqueId: 'spirit_blessing',
    description: 'Призываем духов для первого зажигания алтаря.',
  },
  {
    id: 'test_run',
    name: 'Пробный пуск',
    durationSec: 1200,
    description: 'Включаем алтарь и наблюдаем за стабильностью.',
  },
  {
    id: 'adjust_frequency',
    name: 'Корректировка частоты',
    durationSec: 1200,
    techniqueId: 'frequency_tuning',
    description: 'По результатам теста подстраиваем резонаторы.',
  },
  {
    id: 'carve_final_runes',
    name: 'Нанесение закрепляющих рун',
    durationSec: 1200,
    techniqueId: 'rune_engraving_basic',
    description: 'Вырезаем руны стабилизации на основании.',
  },
  {
    id: 'final_blessing',
    name: 'Финальное благословение',
    durationSec: 600,
    techniqueId: 'spirit_blessing',
    description: 'Запечатываем магию благословением духов.',
  },
]

export const altarPhasesConfig: Record<AltarPhase, AltarPhaseConfig> = {
  1: {
    phase: 1,
    roadmapTitle: 'Фаза I: Подготовка площадки',
    roadmapDescription:
      'Расчистка площадки, котлован и фундамент, ковка и установка скоб — основание под алтарь.',
    requiredMaterials: { ...ALTAR_PHASE1_REQUIRED_MATERIALS },
    requiredMaterialDisplayHints: { ...ALTAR_PHASE1_MATERIAL_DISPLAY_HINTS },
    requiredTechniques: ['basic_forging'],
    requiredMaterialProcessingTechniqueIds: ['forge_basic_iron_smelt'],
    stages: phase1Stages,
    totalDurationSec: sumStageSeconds(phase1Stages),
  },
  2: {
    phase: 2,
    roadmapTitle: 'Фаза II: Силовой каркас',
    roadmapDescription:
      'Металлический каркас: плавка, рама, усиления, обмотка, опоры и хомуты.',
    requiredMaterials: { ...ALTAR_PHASE2_REQUIRED_MATERIALS },
    requiredTechniques: ['basic_forging', 'folded_steel', 'double_hardening'],
    stages: phase2Stages,
    totalDurationSec: sumStageSeconds(phase2Stages),
  },
  3: {
    phase: 3,
    roadmapTitle: 'Фаза III: Ядро и квестовые артефакты',
    roadmapDescription:
      'Резонаторная матрица, фокусирующая чаша и лунный камертон: руны, обжиг и настройка частоты.',
    requiredMaterials: { ...ALTAR_PHASE3_REQUIRED_MATERIALS },
    requiredTechniques: ['rune_engraving_basic', 'clay_firing', 'frequency_tuning'],
    stages: phase3Stages,
    totalDurationSec: sumStageSeconds(phase3Stages),
  },
  4: {
    phase: 4,
    roadmapTitle: 'Фаза IV: Проводка души / резонанс',
    roadmapDescription:
      'Медные проводники, резонаторы, ритуал духов и выравнивание контура эссенции.',
    requiredMaterials: { ...ALTAR_PHASE4_REQUIRED_MATERIALS },
    requiredTechniques: ['basic_forging', 'frequency_tuning', 'spirit_blessing'],
    stages: phase4Stages,
    totalDurationSec: sumStageSeconds(phase4Stages),
  },
  5: {
    phase: 5,
    roadmapTitle: 'Фаза V: Пуск и калибровка',
    roadmapDescription:
      'Очистка каналов, зажигание, пробный пуск, корректировка, руны стабилизации и благословение.',
    requiredMaterials: { ...ALTAR_PHASE5_REQUIRED_MATERIALS },
    requiredTechniques: ['frequency_tuning', 'spirit_blessing', 'rune_engraving_basic'],
    stages: phase5Stages,
    totalDurationSec: sumStageSeconds(phase5Stages),
  },
}

export function getAltarPhaseConfig(phase: AltarPhase): AltarPhaseConfig {
  return altarPhasesConfig[phase]
}
