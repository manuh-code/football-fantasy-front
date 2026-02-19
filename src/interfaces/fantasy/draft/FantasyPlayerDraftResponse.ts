import { FootballPlayerResponse } from "@/interfaces/football/player/FootballPlayerResponse";
import { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import { TypeResponse } from "@/interfaces/football/type/TypeResponse";

export interface FantasyPlayerDraftResponse {

    player: FootballPlayerResponse;
    team: FootballTeamResponse;
    position: TypeResponse;
    total_points: number;
    total_fixtures: number;
    average_points: number;
}