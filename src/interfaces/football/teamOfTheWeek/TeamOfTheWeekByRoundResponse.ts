import { FootballPlayerResponse } from "../player/FootballPlayerResponse";
import { FootballTeamResponse } from "../team/FootballTeamResponse";

export interface TeamOfTheWeekByRoundResponse {
    rating: number;
    formation_position: number;
    formation: string;
    player: FootballPlayerResponse;
    team: FootballTeamResponse;
}
