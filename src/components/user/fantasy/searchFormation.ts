/**
 * Formación tal como la consume el buscador de jugadores para construir los
 * filtros por posición: el uuid del tipo (para filtrar en la API) y cuántos
 * titulares admite ese puesto (para el contador que se pinta en el chip).
 *
 * El draft real la saca de la liga; el mock draft no tiene liga, así que su
 * sala la compone con el catálogo de posiciones y los cupos del mock.
 */
export interface SearchFormationSlot {
  uuid: string
  starter: number
}

export interface SearchFormation {
  goalkeeper?: SearchFormationSlot
  defender?: SearchFormationSlot
  midfielder?: SearchFormationSlot
  attacker?: SearchFormationSlot
}
