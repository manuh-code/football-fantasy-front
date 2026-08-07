/** Aciertos que puntúan en una quiniela. Mismas llaves que `config('pool.scoring')`. */
export type PoolScoringCode = "exact_score" | "home_win" | "away_win" | "draw";

export interface PoolScoringRuleResponse {
    code: PoolScoringCode;
    points: number;
    /** Lo que paga este acierto en el set compartido; sirve para marcar lo personalizado. */
    default_points: number;
}

export interface PoolSettingsResponse {
    /** Quien pregunta administra la quiniela. Sin esto, la pantalla es de solo lectura. */
    is_admin: boolean;
    /** Admin **y** quiniela sin arrancar: es la única bandera que hay que mirar para editar. */
    is_editable: boolean;
    /** Por qué está congelada (`pool_started`), o null. Sólo llega al admin. */
    locked_reason: string | null;
    is_custom: boolean;
    max_participants: number;
    participants_count: number;
    /** Nunca por debajo de quienes ya entraron. */
    participants_min: number;
    participants_max: number;
    points_min: number;
    points_max: number;
    rules: PoolScoringRuleResponse[];
}
