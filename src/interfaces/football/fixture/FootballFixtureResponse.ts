import { FootballEventResponse } from "../event/FootballEventResponse";
import { FootballLeagueResponse } from "../league/FootballLeagueResponse";
import { FootballRoundResponse } from "../round/FootballRoundResponse";
import { FootballSeasonResponse } from "../season/FootballSeasonResponse";
import { FootballStageResponse } from "../stage/FootballStageResponse";
import { FootballStateResponse } from "../state/FootballStateResponse";
import { FootballTeamResponse } from "../team/FootballTeamResponse";
import { FootballVenueResponse } from "../venue/FootballVenueResponse";
import { ScoreResponse } from "./ScoreResponse";
import { FootballStatisticResponse } from "./FootballStatisticResponse";
import { FootballSidelinedResponse } from "./FootballSidelinedResponse";
import { FootballWeatherReportResponse } from "./FootballWeatherReportResponse";
import { FootballEventFilterResponse } from "../event/FootballEventFilterResponse";
import { FootballLineupResponse } from "./FootballLineupResponse";
import { FootballFixtureFormationResponse } from "./FootballFixtureFormationResponse";
import { FootballFixtureCommentResponse } from "./FootballFixtureCommentResponse";
import { FootballFixtureLineupStatsResponse } from "./FootballFixtureLineupStatsResponse";
import { FootballFixtureManOfTheMatchResponse } from "./FootballFixtureManOfTheMatchResponse";
import { PoolPredictionResponse } from "@/interfaces/pool/PoolPredictionResponse";

export interface FootballFixtureResponse {
    uuid: string;
    league: FootballLeagueResponse | null;
    season: FootballSeasonResponse | null;
    stage: FootballStageResponse | null;
    round: FootballRoundResponse | null;
    state: FootballStateResponse | null;
    participants: FootballTeamResponse[] | null;
    venue: FootballVenueResponse | null;
    scores: ScoreResponse[] | null;
    events: FootballEventResponse[] | null;
    eventFilters : FootballEventFilterResponse | null;
    statistics: FootballStatisticResponse[] | null;
    sidelined: FootballSidelinedResponse[] | null;
    weatherReport: FootballWeatherReportResponse | null;
    lineups: FootballLineupResponse[] | null;
    formations: FootballFixtureFormationResponse[] | null;
    comments: FootballFixtureCommentResponse[] | null;
    lineupStats: FootballFixtureLineupStatsResponse[] | null;
    manOfTheMatch: FootballFixtureManOfTheMatchResponse | null;
    prediction?: PoolPredictionResponse | null;

    name: string;
    starting_at: string;
    starting_at_timestamp: number;
    length: number;
    placeholder: boolean;

}