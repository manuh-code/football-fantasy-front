import { FootballPlayerResponse } from "@/interfaces/football/player/FootballPlayerResponse";
import { TypeResponse } from "@/interfaces/football/type/TypeResponse";
import { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";

export interface TransferResponse {
    date: string;
    completed: boolean;
    amount: number | null;
    player: FootballPlayerResponse;
    type: TypeResponse;
    from_team: FootballTeamResponse;
    to_team: FootballTeamResponse;
    position: TypeResponse;
    detailed_position: TypeResponse;
}
