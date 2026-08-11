/** Qué pasa cuando tu equipo empata. */
export type SurvivorDrawRule = "survive" | "loss";

/** Reglas de juego de un survivor. Mismas llaves que `config('survivor.rules')`. */
export interface SurvivorRules {
    /** Fallos que aguantas antes de quedar eliminado. */
    max_lives: number;
    /** `survive`: empatar te salva. `loss`: empatar cuesta una vida. */
    draw_counts_as: SurvivorDrawRule;
    /** Si olvidarte de una jornada cuesta una vida. */
    miss_penalty: boolean;
}

export interface SurvivorSettingsResponse {
    /** Quien pregunta administra el survivor. Sin esto, la pantalla es de solo lectura. */
    is_admin: boolean;
    /** Admin **y** survivor sin arrancar: es la única bandera que hay que mirar para editar. */
    is_editable: boolean;
    /** Un survivor de la casa: sus reglas no las cambia nadie. */
    is_official: boolean;
    /** Por qué está congelado (`survivor_started` | `official`), o null. Sólo llega al admin. */
    locked_reason: string | null;
    is_custom: boolean;
    /** Null en los oficiales: no tienen cupo. */
    max_participants: number | null;
    participants_count: number;
    /** Nunca por debajo de quienes ya entraron. */
    participants_min: number;
    participants_max: number;
    lives_min: number;
    lives_max: number;
    rules: SurvivorRules;
    /** Las de fábrica, para marcar lo que el admin cambió. */
    default_rules: SurvivorRules;
}

export interface SurvivorSettingsPayload {
    max_participants: number;
    max_lives: number;
    draw_counts_as: SurvivorDrawRule;
    miss_penalty: boolean;
}

export interface SurvivorCreatePayload extends SurvivorSettingsPayload {
    name: string;
    description: string | null;
    league_uuid: string;
}
