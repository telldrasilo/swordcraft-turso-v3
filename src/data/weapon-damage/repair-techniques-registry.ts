/**
 * Реестр техник починки (базовый набор). Источник правды для применимости к тегам.
 *
 * G1 по тегам — `damage-tag-registry.allowedRepairTechniqueIds` → ось броска через `repair-dice-from-techniques` (`RepairDiceProfile`).
 *
 * При добавлении техники: разблокировка в `unlock`, при необходимости — маппинг событий в `event-template-to-damage-tags.ts`;
 * новые поля на оружии / persist — `STORE_VERSION` в `game-store-composed.ts` и чеклист в `cloud-save-feature.ts`.
 */

import type { RepairTechniqueDefinition, RepairTechniqueTier } from '@/types/weapon-repair'

/** Техника без видимых тегов: только износ прочности; стоимость материалов — как у базового ремонта прочности (`resolveWeaponRepairPlanEconomy`). */
export const DURABILITY_MAINTENANCE_TECHNIQUE_ID = 'durability_maintenance' as const

const T_BASIC: RepairTechniqueTier = 'basic'
const T_SPEC: RepairTechniqueTier = 'specialized'

export const REPAIR_TECHNIQUE_REGISTRY: RepairTechniqueDefinition[] = [
  {
    id: DURABILITY_MAINTENANCE_TECHNIQUE_ID,
    name: 'Уход и восстановление прочности',
    description:
      'Сервисный ремонт без видимых сколов: разборка узла, подтяжка, сборка. Стоимость как у обычного ремонта по рецепту оружия.',
    clearsTagIds: [],
    stages: [
      { id: 'dm_strip', name: 'Частичная разборка и очистка', baseDurationSec: 10, category: 'preparation' },
      { id: 'dm_tune', name: 'Подтяжка, смазка, выверка', baseDurationSec: 20, category: 'work' },
      { id: 'dm_fin', name: 'Сборка и контроль клина', baseDurationSec: 12, category: 'finishing' },
    ],
    goldCost: 0,
    materials: {},
    unlock: 'base',
    repairTier: T_BASIC,
  },
  {
    id: 'edge_truing',
    name: 'Правка кромки',
    description:
      'Снятие сколов и выравнивание режущей кромки; подходит для механических повреждений лезвия.',
    clearsTagIds: ['physical_slash_chip', 'physical_blunt_dull', 'physical_puncture_gouge'],
    stages: [
      { id: 'edge_inspect', name: 'Осмотр кромки', baseDurationSec: 8, category: 'preparation' },
      { id: 'edge_file', name: 'Правка напильником и бруском', baseDurationSec: 25, category: 'work' },
      { id: 'edge_hone', name: 'Доводка и снятие заусенцев', baseDurationSec: 12, category: 'finishing' },
    ],
    goldCost: 0,
    materials: { ironIngot: 1 },
    unlock: 'base',
    repairTier: T_BASIC,
  },
  {
    id: 'haft_tightening',
    name: 'Перетяжка крепления',
    description: 'Подтяжка рукояти, гарды и посадки клинка без полной пересборки.',
    clearsTagIds: ['physical_loose_fitting', 'physical_handle_split'],
    stages: [
      { id: 'haft_strip', name: 'Частичная разборка узла', baseDurationSec: 10, category: 'preparation' },
      { id: 'haft_reset', name: 'Подтяжка и подкладки', baseDurationSec: 22, category: 'work' },
      { id: 'haft_set', name: 'Контроль люфта и фиксация', baseDurationSec: 10, category: 'finishing' },
    ],
    goldCost: 0,
    materials: { wood: 2 },
    unlock: 'base',
    repairTier: T_BASIC,
  },
  {
    id: 'notch_filing',
    name: 'Зачистка зарубины',
    description: 'Снятие металла по шаблону глубокой зарубины с контролем трещин.',
    clearsTagIds: ['physical_gouge_chunk'],
    stages: [
      { id: 'notch_mark', name: 'Разметка и снятие напряжения', baseDurationSec: 12, category: 'preparation' },
      { id: 'notch_grind', name: 'Зачистка и снятие слоя', baseDurationSec: 28, category: 'work' },
      { id: 'notch_blend', name: 'Сглаживание переходов', baseDurationSec: 14, category: 'finishing' },
    ],
    goldCost: 0,
    materials: { ironIngot: 1, coal: 1 },
    unlock: 'base',
    repairTier: T_SPEC,
  },
  {
    id: 'guard_straightening',
    name: 'Рихтовка крестовины',
    description: 'Выпрямление гарды и проверка плоскости для безопасного удара.',
    clearsTagIds: ['physical_bend_warp'],
    stages: [
      { id: 'guard_fix', name: 'Фиксация и прогрев зоны', baseDurationSec: 10, category: 'preparation' },
      { id: 'guard_bend', name: 'Рихтовка на шаблоне', baseDurationSec: 20, category: 'work' },
      { id: 'guard_check', name: 'Проверка баланса', baseDurationSec: 8, category: 'finishing' },
    ],
    goldCost: 0,
    materials: { steelIngot: 1 },
    unlock: 'base',
    repairTier: T_SPEC,
  },
  {
    id: 'binding_relief',
    name: 'Снятие напряжения в шейке',
    description: 'Локальный отжиг и осторожная правка зоны перегруза клинка.',
    clearsTagIds: ['physical_crack_fissure'],
    stages: [
      { id: 'bind_soft', name: 'Подготовка зоны и снятие окалины', baseDurationSec: 14, category: 'preparation' },
      { id: 'bind_heat', name: 'Контролируемый нагрев и отжиг', baseDurationSec: 32, category: 'work' },
      { id: 'bind_straight', name: 'Правка и контроль микротрещин', baseDurationSec: 18, category: 'work' },
      { id: 'bind_cool', name: 'Остывание и контроль твёрдости', baseDurationSec: 12, category: 'finishing' },
    ],
    goldCost: 0,
    materials: { coal: 2, ironIngot: 1 },
    unlock: 'base',
    repairTier: T_SPEC,
    requiresPrepWarning: true,
  },
  {
    id: 'corrosion_cleanup',
    name: 'Зачистка и пассивация',
    description: 'Удаление коррозии и подготовка поверхности под уход.',
    clearsTagIds: ['elemental_corrosion_rot'],
    stages: [
      { id: 'cor_strip', name: 'Механическая зачистка пятен', baseDurationSec: 15, category: 'work' },
      { id: 'cor_pass', name: 'Пассивация и масло', baseDurationSec: 12, category: 'finishing' },
    ],
    goldCost: 0,
    materials: { coal: 1 },
    unlock: 'base',
    repairTier: T_SPEC,
  },
  {
    id: 'frost_crack_seal',
    name: 'Работа с морозной сеткой',
    description: 'Заплавка или зарезка микротрещины у шейки без разгона трещины.',
    clearsTagIds: ['elemental_frost_bite'],
    stages: [
      { id: 'fc_grind', name: 'Раскрытие и зачистка канавки', baseDurationSec: 18, category: 'preparation' },
      { id: 'fc_weld', name: 'Локальная заплавка / заполнение', baseDurationSec: 26, category: 'work' },
      { id: 'fc_finish', name: 'Сглаживание и контроль', baseDurationSec: 12, category: 'finishing' },
    ],
    goldCost: 0,
    materials: { steelIngot: 1, coal: 1 },
    unlock: 'base',
    repairTier: T_SPEC,
  },
  {
    id: 'axis_straightening',
    name: 'Выпрямление оси клинка',
    description: 'Рихтовка лёгкого перегиба и выверка плоскости.',
    clearsTagIds: ['physical_bend_warp', 'physical_impact_dent'],
    stages: [
      { id: 'ax_measure', name: 'Стенд и измерение прогиба', baseDurationSec: 10, category: 'preparation' },
      { id: 'ax_bend', name: 'Выпрямление с прогревом', baseDurationSec: 22, category: 'work' },
      { id: 'ax_verify', name: 'Проверка баланса', baseDurationSec: 10, category: 'finishing' },
    ],
    goldCost: 0,
    materials: { ironIngot: 1 },
    unlock: 'base',
    repairTier: T_SPEC,
  },
  {
    id: 'elemental_prima_treatment',
    name: 'Стабилизация стихийного следа (I)',
    description:
      'Снятие следов огня, влаги, земли, воздуха, молнии, яда и природной порчи по канону §3.1 SPEC; базовые материалы кузницы.',
    clearsTagIds: [
      'elemental_fire_scorch',
      'elemental_water_soak',
      'elemental_earth_grit',
      'elemental_air_shear',
      'elemental_lightning_arc',
      'elemental_poison_etch',
      'elemental_nature_bloom',
    ],
    stages: [
      { id: 'ep_clean', name: 'Очистка и снятие окалины/налёта', baseDurationSec: 16, category: 'preparation' },
      { id: 'ep_stab', name: 'Томление и нейтрализация', baseDurationSec: 28, category: 'work' },
      { id: 'ep_oil', name: 'Пропитка и контроль', baseDurationSec: 12, category: 'finishing' },
    ],
    goldCost: 0,
    materials: { ironIngot: 1, coal: 1, wood: 1 },
    unlock: 'base',
    repairTier: T_SPEC,
  },
  {
    id: 'elemental_veil_treatment',
    name: 'Стабилизация стихийного следа (II)',
    description:
      'Работа со следами пространства, тьмы, света, арканы и крови; осторожный отжиг и нейтрализация по §3.1.',
    clearsTagIds: [
      'elemental_space_shift',
      'elemental_darkness_stain',
      'elemental_light_sear',
      'elemental_arcane_noise',
      'elemental_blood_mark',
    ],
    stages: [
      { id: 'ev_mask', name: 'Изоляция зоны и снятие напряжения', baseDurationSec: 18, category: 'preparation' },
      { id: 'ev_rite', name: 'Ритуальная стабилизация / отжиг', baseDurationSec: 32, category: 'work' },
      { id: 'ev_seal', name: 'Фиксация и полировка', baseDurationSec: 14, category: 'finishing' },
    ],
    goldCost: 0,
    materials: { steelIngot: 1, coal: 1, soulEssence: 1 },
    unlock: 'base',
    repairTier: T_SPEC,
    requiresPrepWarning: true,
  },
  {
    id: 'blade_soul_tending',
    name: 'Укрепление связи с клинком',
    description:
      'Особая работа с «живым» металлом и наследием экземпляра; требует сосредоточенности мастера.',
    clearsTagIds: ['elemental_skverna_taint'],
    stages: [
      { id: 'soul_listen', name: 'Настройка и прослушивание металла', baseDurationSec: 16, category: 'preparation' },
      { id: 'soul_work', name: 'Плавная правка без рывка', baseDurationSec: 35, category: 'work' },
      { id: 'soul_seal', name: 'Фиксация отклика', baseDurationSec: 14, category: 'finishing' },
    ],
    goldCost: 0,
    materials: { mithrilIngot: 1 },
    unlock: 'base',
    repairTier: T_SPEC,
    requiresPrepWarning: true,
  },
]

const byId = new Map<string, RepairTechniqueDefinition>(
  REPAIR_TECHNIQUE_REGISTRY.map((t) => [t.id, t])
)

export function getRepairTechniqueById(id: string): RepairTechniqueDefinition | undefined {
  return byId.get(id)
}

export function getAllRepairTechniqueIds(): string[] {
  return REPAIR_TECHNIQUE_REGISTRY.map((t) => t.id)
}

/** Техники, у которых в clearsTagIds есть этот id тега */
export function getRepairTechniquesClearingTagId(tagId: string): RepairTechniqueDefinition[] {
  return REPAIR_TECHNIQUE_REGISTRY.filter((t) => t.clearsTagIds.includes(tagId))
}
