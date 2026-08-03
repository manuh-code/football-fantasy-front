import { FootballRoundResponse } from "@/interfaces/football/round/FootballRoundResponse";

export interface FantasyRoundResponse {
    uuid: string;
    order: number;
    is_current: boolean;
    is_completed: boolean;
    /** "regular" o "playoff": las últimas jornadas se reservan para el cuadro. */
    phase: "regular" | "playoff";
    /** Profundidad dentro del bracket (1 = primera eliminatoria). Null si regular. */
    playoff_round: number | null;
    /** 1 = ida, 2 = vuelta. Null si es jornada de temporada regular. */
    leg: number | null;
    round: FootballRoundResponse
}