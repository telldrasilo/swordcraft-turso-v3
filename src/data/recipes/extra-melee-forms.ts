/**
 * Полноценные v2-рецепты форм булава / копьё / молот (без материала в id рецепта).
 * Булава и молот разведены по частям, этапам отделки и базовым статам (не клоны топора без смысла).
 */

import type { WeaponRecipe } from '@/types/craft-v2'
import { getMeleeTemplate } from './extra-melee'

const mace = getMeleeTemplate('mace')
mace.id = 'basic_mace'
const maceHead = mace.parts.find(p => p.id === 'blade')
if (maceHead) {
  maceHead.name = 'Головка'
  maceHead.minQuantity = 2
  maceHead.maxQuantity = 5
}
mace.name = 'булава'
mace.description =
  'Ударное оружие с массивной металлической головкой на древке; без рубящей кромки как у топора — только финишная правка граней.'
mace.stages = mace.stages.filter(s => s.stageType !== 'fin_sharpening')
mace.baseStats = {
  ...mace.baseStats,
  attackBase: 50,
  durabilityBase: 76,
  weightBase: 3.2,
  soulCapacityBase: 44,
}

const spear = getMeleeTemplate('spear')
spear.id = 'basic_spear'
const spearTip = spear.parts.find(p => p.id === 'blade')
const spearGuard = spear.parts.find(p => p.id === 'guard')
const spearGrip = spear.parts.find(p => p.id === 'grip')
if (spearTip) spearTip.name = 'Наконечник'
if (spearGuard) spearGuard.name = 'Втулка крепления'
if (spearGrip) spearGrip.name = 'Древко'
const spearPommel = spear.parts.find(p => p.id === 'pommel')
if (spearPommel) spearPommel.name = 'Контргруз'
spear.name = 'копьё'
spear.description =
  'Металлический наконечник на длинном древке с креплением и контргрузом — не «меч», а колюще-рубящий наконечник с длинным рычагом.'
spear.baseStats = {
  ...spear.baseStats,
  attackBase: 46,
  durabilityBase: 64,
  weightBase: 2.4,
  soulCapacityBase: 46,
}

const hammer = getMeleeTemplate('hammer')
hammer.id = 'basic_hammer'
const hammerHead = hammer.parts.find(p => p.id === 'blade')
if (hammerHead) {
  hammerHead.name = 'Боёк'
  hammerHead.minQuantity = 3
  hammerHead.maxQuantity = 6
}
hammer.name = 'молот'
hammer.description =
  'Тяжёлый боевой молот: массивный боёк и длинная рукоять; кромка не затачивается — удар массой и правильной посадкой бойка.'
hammer.stages = hammer.stages.filter(s => s.stageType !== 'fin_sharpening')
hammer.baseStats = {
  ...hammer.baseStats,
  attackBase: 72,
  durabilityBase: 82,
  weightBase: 4.6,
  soulCapacityBase: 50,
}

/** Форма с минеральной/металлической головкой (хвост A: камень в части оружия). */
const stoneHeadMace = structuredClone(mace)
stoneHeadMace.id = 'stone_head_mace'
stoneHeadMace.name = 'каменная булава'
stoneHeadMace.description =
  'Ударная головка из камня или металла на деревянном древке; массивнее и с иным балансом, чем у чисто металлической булавы.'
const stoneHeadPart = stoneHeadMace.parts.find(p => p.id === 'blade')
if (stoneHeadPart) {
  stoneHeadPart.name = 'Головка'
  stoneHeadPart.materialTypes = ['stone', 'metal', 'alloy']
}
stoneHeadMace.stages = [
  { stageType: 'prep_heating' },
  { stageType: 'prep_tools' },
  { stageType: 'proc_sawing', material: 'blade', target: 'blade' },
  { stageType: 'proc_sawing', material: 'grip', target: 'grip' },
  { stageType: 'form_shaping', target: 'blade' },
  { stageType: 'form_carving', target: 'grip' },
  { stageType: 'asmb_fitting' },
  { stageType: 'asmb_joining' },
  { stageType: 'asmb_wrapping', target: 'grip' },
  { stageType: 'asmb_balancing' },
  { stageType: 'fin_grinding', target: 'blade' },
  { stageType: 'fin_polishing' },
  { stageType: 'fin_inspection' },
]
stoneHeadMace.baseStats = {
  ...stoneHeadMace.baseStats,
  attackBase: 44,
  durabilityBase: 72,
  weightBase: 3.9,
  soulCapacityBase: 36,
}
stoneHeadMace.requiredLevel = 2
stoneHeadMace.source = { rarity: 'common' }

export const extraMeleeFormRecipes: WeaponRecipe[] = [
  mace,
  spear,
  hammer,
  stoneHeadMace,
]
