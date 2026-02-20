import { FootballPlayerResponse } from "@/interfaces/football/player/FootballPlayerResponse";
import { TypeResponse } from "@/interfaces/football/type/TypeResponse";

export interface FantasyFootballPlayersResponse {
    football_player: FootballPlayerResponse;
    position: TypeResponse;
    is_starter: boolean;
    is_flex: boolean;
    fantasy_points: number;
}