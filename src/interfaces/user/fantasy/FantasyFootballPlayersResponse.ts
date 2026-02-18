import { FootballPlayerResponse } from "@/interfaces/football/player/FootballPlayerResponse";
import { TypeResponse } from "@/interfaces/football/type/TypeResponse";

export interface FantasyFootballPlayersResponse {
    "pick_number": number;
    "football_player": FootballPlayerResponse;
    "position": TypeResponse;
}