/**
 * Данные техник изучения материалов (MVP B1).
 */

import type { MaterialStudyTechnique } from '@/types/material-study'

const MIN_60 = 60 * 60_000
const MIN_90 = 90 * 60_000

export const MATERIAL_STUDY_TECHNIQUES: MaterialStudyTechnique[] = [
  {
    id: 'study_quick_notes',
    name: 'Краткие записи',
    description:
      'Короткая сессия записей без расхода образца изучаемого материала; уголь — на свет и обогрев в мастерской. Опыт чуть меньше, чем у полноценной практики.',
    durationMs: 30 * 60_000,
    materialCosts: [{ materialId: 'coal', quantity: 1 }],
  },
  {
    id: 'study_surface_reading',
    name: 'Поверхностный осмотр',
    description:
      'Вдумчивый осмотр и разметка учебной заготовки на верстаке; расход берёзы — условный «контрольный» образец для отработки приёма.',
    durationMs: MIN_60,
    materialCosts: [{ materialId: 'birch', quantity: 1 }],
  },
  {
    id: 'study_sample_work',
    name: 'Пробная обработка',
    description: 'Практический разбор с расходом ресурсов — глубже понимание, дольше по времени.',
    durationMs: MIN_90,
    materialCosts: [
      { materialId: 'coal', quantity: 1 },
      { materialId: 'birch', quantity: 1 },
    ],
  },
  {
    id: 'study_masonry_sketch',
    name: 'Эскиз кладки',
    description:
      'Разбор стыков и текстуры блоков — для базовых и обработанных камней энциклопедии.',
    durationMs: 45 * 60_000,
    materialCosts: [{ materialId: 'basic_stone', quantity: 1 }],
    targetMaterialIds: ['basic_stone', 'granite', 'marble', 'processed_stone', 'obsidian'],
  },
]

const byId: Record<string, MaterialStudyTechnique> = Object.fromEntries(
  MATERIAL_STUDY_TECHNIQUES.map(t => [t.id, t])
)

export function getMaterialStudyTechniqueById(id: string): MaterialStudyTechnique | undefined {
  return byId[id]
}

export function getStudyTechniquesForMaterial(materialId: string): MaterialStudyTechnique[] {
  return MATERIAL_STUDY_TECHNIQUES.filter(
    t => !t.targetMaterialIds?.length || t.targetMaterialIds.includes(materialId)
  )
}
