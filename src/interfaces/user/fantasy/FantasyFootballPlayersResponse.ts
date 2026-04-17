import { FootballNextFixtureResponse } from "@/interfaces/football/fixture/FootballNextFixtureResponse";
import { FootballPlayerResponse } from "@/interfaces/football/player/FootballPlayerResponse";
import { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import { TypeResponse } from "@/interfaces/football/type/TypeResponse";

export interface FantasyFootballPlayersResponse {
    round: number;
    is_starter: boolean;
    is_flex: boolean;
    fantasy_points: number;
    football_player: FootballPlayerResponse;
    position: TypeResponse;
    team: FootballTeamResponse;
    next_fixture: FootballNextFixtureResponse;


}