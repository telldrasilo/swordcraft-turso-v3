/**
 * Маппинг видимого физического тега → id шрама (колонка «Шрам» SPEC §2).
 * Только теги, реально присутствующие в реестре / игре.
 */
export const PHYSICAL_DAMAGE_TAG_TO_SCAR_ID: Record<string, string> = {
  physical_slash_chip: 'scar_slash_ragged',
  physical_loose_fitting: 'scar_grip_rigid',
  physical_gouge_chunk: 'scar_jagged_tooth',
  physical_bend_warp: 'scar_bend_spring',
  physical_blunt_dull: 'scar_hidden_edge',
  physical_crack_fissure: 'scar_crack_nerved',
  physical_impact_dent: 'scar_impact_brutal',
  physical_puncture_gouge: 'scar_puncture_piercing',
  physical_handle_split: 'scar_anatomical_grip',
}

export function getPhysicalScarIdForDamageTag(tagId: string): string | undefined {
  return PHYSICAL_DAMAGE_TAG_TO_SCAR_ID[tagId]
}
