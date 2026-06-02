import { FootballTeamResponse } from "../team/FootballTeamResponse";

export interface FootballFixtureFormationResponse {
    formation: string;
    location: string;
    participant: FootballTeamResponse;
}
