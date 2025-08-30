import { FootballSeasonResponse } from "../season/FootballSeasonResponse";
import { FootballStageResponse } from "../stage/FootballStageResponse";
import { FootballTeamResponse } from "../team/FootballTeamResponse";
import { TypeResponse } from "../type/TypeResponse";
import { FootballLeagueResponse } from "./FootballLeagueResponse";

export interface FootballLeagueStandingsResponse {
    position: number;
    result: string;
    points: number;
    team: FootballTeamResponse;
    league: FootballLeagueResponse;
    season: FootballSeasonResponse;
    stage: FootballStageResponse;
    statistics: {
        type: TypeResponse;
        value: number;
    }
    form: {
        form: string;
        sort_order: number;
    }

}