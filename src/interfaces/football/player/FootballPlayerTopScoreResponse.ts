import { FootballTeamResponse } from "../team/FootballTeamResponse";
import { TypeResponse } from "../type/TypeResponse";
import { FootballPlayerResponse } from "./FootballPlayerResponse";

export interface FootballPlayerTopScoreResponse {
    uuid: string;
    season_id: number;
    position: number;
    total: number;
    player: FootballPlayerResponse;
    team: FootballTeamResponse;
    type: TypeResponse;
    
}