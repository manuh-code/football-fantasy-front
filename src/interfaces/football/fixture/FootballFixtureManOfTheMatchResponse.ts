import { FootballPlayerResponse } from "../player/FootballPlayerResponse";
import { FootballTeamResponse } from "../team/FootballTeamResponse";

export interface FootballFixtureManOfTheMatchResponse {
    player: FootballPlayerResponse;
    team: FootballTeamResponse;
    rating: number;
}
