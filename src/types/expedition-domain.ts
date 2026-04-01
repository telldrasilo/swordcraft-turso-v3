/**
 * Канон типов экспедиции/миссии для хоста и модуля `src/modules/expeditions`.
 * Калькулятор v2, модификаторы и UI опираются на те же литералы, что и данные миссий.
 */

export type ExpeditionMissionType =
  | 'hunt'
  | 'scout'
  | 'clear'
  | 'delivery'
  | 'magic'
  | 'rescue'
  | 'gather'
  | 'escort'
  | 'investigate'

export type ExpeditionDifficulty = 'easy' | 'normal' | 'hard' | 'extreme' | 'legendary'
