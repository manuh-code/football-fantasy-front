import { FootballTeamResponse } from "../team/FootballTeamResponse";
import { TypeResponse } from "../type/TypeResponse";
import { FootballPlayerResponse } from "./FootballPlayerResponse";

export interface FootballPlayerFantasyPointsResponse {
    "player": FootballPlayerResponse;
    "team": FootballTeamResponse;
    "position": TypeResponse | null;
    "total_points": number | string | null;
    "total_fixtures": number | null;
    "average_points": number | string | null;
}