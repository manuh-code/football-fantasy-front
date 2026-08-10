/**
 * Cómo se ficha en la liga.
 *
 * - `snake`: draft en vivo, cada quien elige en su turno contra reloj.
 * - `auto`:  el backend ficha por todos a la hora de `draft_day`, en segundo
 *            plano. No hay sala que atender ni reloj por turno.
 */
export type FantasyDraftType = "snake" | "auto";

export interface FantasyLeagueDraftPayload {
    draft_day: string;
    /** Segundos por turno. Sólo aplica al draft en vivo. */
    pick_timer?: number | null;
    draft_type: FantasyDraftType;
}
