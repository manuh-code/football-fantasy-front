/**
 * Cupos de clasificados a playoffs que caben para un número concreto de
 * participantes. Va indexado por participantes porque temporada regular y
 * bracket salen del mismo presupuesto de jornadas: cuantos más managers, más
 * larga la temporada regular y menos cuadro cabe. `options` vacío = esa liga no
 * puede jugar eliminatorias con ese número de participantes.
 */
export interface FantasyPlayoffOption {
    participants: number;
    options: number[];
    default: number | null;
}

export interface FantasyParticipantCountResponse {
    min: number;
    mid: number;
    max: number;
    /** Jornadas que le quedan por jugarse al torneo real. */
    available_rounds: number;
    playoffs: FantasyPlayoffOption[];
}
