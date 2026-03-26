import { UserDataInterface } from "@/interfaces/user/userInterface";

export interface FantasyDraftTurnStarted {
    status: string | null;
    pick: number | null;
    round: number | null;
    user: UserDataInterface | null;
    turn_started_at: number | null; // Unix timestamp in seconds
    duration_seconds: number | null; // Duration of the turn in seconds
}
