import { UserDataInterface } from "@/interfaces/user/userInterface";

export interface FantasyDraftTurnStarted {
    status: string | null;
    pick: number | null;
    round: number | null;
    user: UserDataInterface | null;
    turn_started_at: number | null; // Unix timestamp in seconds
    duration_seconds: number | null; // Duration of the turn in seconds
    auto_pick: boolean | null; // Indicates if the turn will be auto-picked after duration_seconds
    /**
     * El del turno no está en la sala: `duration_seconds` viene reducido y al
     * vencer se ficha por él. Si vuelve dentro de esa ventana el backend
     * reemite el turno con la duración completa y esto pasa a `false`.
     */
    absent?: boolean | null;
}
