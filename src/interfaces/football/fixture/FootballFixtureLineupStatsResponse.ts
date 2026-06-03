import { TypeResponse } from "../type/TypeResponse";
import { FootballPlayerResponse } from "../player/FootballPlayerResponse";
import { FootballTeamResponse } from "../team/FootballTeamResponse";

export interface FootballFixtureLineupStatsDataResponse {
    value: number;
}

export interface FootballFixtureLineupStatsTopResponse {
    player: FootballPlayerResponse;
    team: FootballTeamResponse;
    data: FootballFixtureLineupStatsDataResponse;
}

export interface FootballFixtureLineupStatsResponse {
    type: TypeResponse;
    top: FootballFixtureLineupStatsTopResponse[];
}
