import { FootballLeagueResponse } from "../league/FootballLeagueResponse";
import { FootballStateResponse } from "../state/FootballStateResponse";
import { FootballTeamResponse } from "../team/FootballTeamResponse";
import { ScoreResponse } from "./ScoreResponse";

export interface FootballFixtureResponse {
    league: FootballLeagueResponse;
    football_state: FootballStateResponse;
    name: string;
    starting_at: string;
    starting_at_timestamp: number;
    length: number;
    placeholder: boolean;
    participants: FootballTeamResponse[];
    scores: ScoreResponse[];
}