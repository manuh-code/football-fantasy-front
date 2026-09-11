import { FootballRoundResponse } from "@/interfaces/football/round/FootballRoundResponse";

export interface FantasyRoundResponse {
    uuid: string;
    order: number;
    is_current: boolean;
    /** La jornada real ya arrancó (aunque le falten partidos). */
    is_started?: boolean;
    is_completed: boolean;
    /**
     * La jornada real todavía tiene partidos sin jugar.
     *
     * No es lo contrario de `is_completed`: en Liga MX un aplazamiento manda un
     * partido semanas adelante (la jornada 7 del Apertura 2026 dejó dos para el
     * 28 de octubre y el 14 de noviembre), y la jornada fantasy se cierra con lo
     * que se jugó en su hueco del calendario para no congelar la tabla. Una
     * jornada puede estar cerrada y seguir teniendo partidos pendientes: cuando
     * se jueguen, el marcador y la clasificación se recalculan.
     */
    has_pending_fixtures?: boolean;
    pending_fixtures_count?: number;
    /** "regular" o "playoff": las últimas jornadas se reservan para el cuadro. */
    phase: "regular" | "playoff";
    /** Profundidad dentro del bracket (1 = primera eliminatoria). Null si regular. */
    playoff_round: number | null;
    /** 1 = ida, 2 = vuelta. Null si es jornada de temporada regular. */
    leg: number | null;
    round: FootballRoundResponse
}