import { FootballFixtureResponse } from '../fixture/FootballFixtureResponse';
import { FootballLeagueResponse } from '../league/FootballLeagueResponse';

export interface FootballRoundResponse {
    league: FootballLeagueResponse;
    name: string;
    finished: boolean;
    is_current: boolean;
    starting_at: string;
    ending_at: string;
    games_in_current_week: boolean;
    fixtures: FootballFixtureResponse[];
}