import { FootballPlayerResponse } from "../player/FootballPlayerResponse";
import { FootballTeamResponse } from "../team/FootballTeamResponse";

export interface FootballFixtureManOfTheMatchResponse {
    player: FootballPlayerResponse | null;
    team: FootballTeamResponse | null;
    rating: number | null;
}
