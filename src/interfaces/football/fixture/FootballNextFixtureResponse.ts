import { FootballTeamResponse } from "../team/FootballTeamResponse";
import FootballFixtureScoreResponse from "./FootballFixtureScoreResponse";

export interface FootballNextFixtureResponse {
    uuid: string;
    name: string;
    starting_at: string;
    participants: FootballTeamResponse[];
    scores: FootballFixtureScoreResponse[] | null;
}