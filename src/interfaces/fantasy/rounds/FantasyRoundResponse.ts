import { FootballRoundResponse } from "@/interfaces/football/round/FootballRoundResponse";

export interface FantasyRoundResponse {
    uuid: string;
    is_current: boolean;
    is_completed: boolean;
    round: FootballRoundResponse
}