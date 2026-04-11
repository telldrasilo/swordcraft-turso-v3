/**
 * Эталонные стадии `basic_sword` с хребтом Крафтовой линии (микроэтапы + фазы).
 * @see docs/TZ_SWORD_RECIPE_AND_CRAFT_LINE.md §3.3
 */

import type { CraftLinePhase } from '@/types/craft-line'
import type { RecipeCraftLineMicroStep, RecipeStageConfig } from '@/types/craft-v2'

const BASIC_SWORD_LINE_PHASES: CraftLinePhase[] = [
  ...Array(2).fill('material_preparation' as CraftLinePhase),
  ...Array(17).fill('recipe_forming' as CraftLinePhase),
  ...Array(6).fill('craft_finishing' as CraftLinePhase),
]

/** По два коротких шага на макроэтап (TZ §4.1). */
const BASIC_SWORD_LABEL_PAIRS: readonly [string, string][] = [
  ['Разогрев горна', 'Вывод на режим'],
  ['Инструмент под рукой', 'Проверка оснастки'],
  ['Плавка заготовки', 'Снятие шлака'],
  ['Прокат', 'Контроль толщины'],
  ['Плавка заготовки', 'Слиток на наковальне'],
  ['Прокат', 'Правка'],
  ['Распил', 'Черновая обработка'],
  ['Плавка навершия', 'Форма слитка'],
  ['Нагрев', 'Контроль температуры'],
  ['Ковка', 'Правка геометрии губки'],
  ['Нагрев гарды', 'Подготовка к форме'],
  ['Придание формы', 'Обработка кромок'],
  ['Резьба и форма', 'Посадка на тыльник'],
  ['Нагрев навершия', 'Выверка оси'],
  ['Форма навершия', 'Обжиг патины'],
  ['Подгонка посадок', 'Проверка люфта'],
  ['Соединение узла', 'Контроль прочности'],
  ['Обмотка рукояти', 'Натяжка'],
  ['Балансировка', 'Контроль на весах'],
  ['Закалка', 'Контроль охлаждения'],
  ['Отпуск', 'Терморежим'],
  ['Шлифовка', 'Контроль плоскости'],
  ['Заточка', 'Проверка кромки'],
  ['Полировка', 'Устранение царапин'],
  ['Финальный осмотр', 'Отметка клейма'],
]

function microStepsForStage(
  stage: RecipeStageConfig,
  stageIndex: number,
  labels: [string, string]
): RecipeCraftLineMicroStep[] {
  const key = `${stage.stageType}_${stage.material ?? stage.target ?? 'na'}_${stageIndex}`
  return [
    {
      id: `basic_sword_bb_${key}_01`,
      label: labels[0],
      durationWeight: 1,
    },
    {
      id: `basic_sword_bb_${key}_02`,
      label: labels[1],
      durationWeight: 1,
    },
  ]
}

const BASE_BASIC_SWORD_STAGES: RecipeStageConfig[] = [
  { stageType: 'prep_heating' },
  { stageType: 'prep_tools' },
  { stageType: 'proc_smelting', material: 'blade', target: 'blade' },
  { stageType: 'proc_rolling', material: 'blade', target: 'blade' },
  { stageType: 'proc_smelting', material: 'guard', target: 'guard' },
  { stageType: 'proc_rolling', material: 'guard', target: 'guard' },
  { stageType: 'proc_sawing', material: 'grip', target: 'grip' },
  { stageType: 'proc_smelting', material: 'pommel', target: 'pommel' },
  { stageType: 'form_heating', target: 'blade' },
  { stageType: 'form_forging', target: 'blade' },
  { stageType: 'form_heating', target: 'guard' },
  { stageType: 'form_shaping', target: 'guard' },
  { stageType: 'form_carving', target: 'grip' },
  { stageType: 'form_heating', target: 'pommel' },
  { stageType: 'form_shaping', target: 'pommel' },
  { stageType: 'asmb_fitting' },
  { stageType: 'asmb_joining' },
  { stageType: 'asmb_wrapping', target: 'grip' },
  { stageType: 'asmb_balancing' },
  { stageType: 'fin_hardening', target: 'blade' },
  { stageType: 'fin_tempering', target: 'blade' },
  { stageType: 'fin_grinding', target: 'blade' },
  { stageType: 'fin_sharpening', target: 'blade' },
  { stageType: 'fin_polishing' },
  { stageType: 'fin_inspection' },
]

if (BASE_BASIC_SWORD_STAGES.length !== BASIC_SWORD_LINE_PHASES.length) {
  throw new Error(
    `basic_sword: phases ${BASIC_SWORD_LINE_PHASES.length} !== stages ${BASE_BASIC_SWORD_STAGES.length}`
  )
}

if (BASE_BASIC_SWORD_STAGES.length !== BASIC_SWORD_LABEL_PAIRS.length) {
  throw new Error(
    `basic_sword: label pairs ${BASIC_SWORD_LABEL_PAIRS.length} !== stages ${BASE_BASIC_SWORD_STAGES.length}`
  )
}

/** Стадии базового меча с `craftLinePhase` и `craftLineMicroSteps`. */
export const BASIC_SWORD_STAGES: RecipeStageConfig[] = BASE_BASIC_SWORD_STAGES.map(
  (stage, i) => {
    const pair = BASIC_SWORD_LABEL_PAIRS[i]
    if (!pair) {
      throw new Error(`basic_sword: нет пары подписей для стадии ${i}`)
    }
    return {
      ...stage,
      craftLinePhase: BASIC_SWORD_LINE_PHASES[i],
      craftLineMicroSteps: microStepsForStage(stage, i, pair),
    }
  }
)
