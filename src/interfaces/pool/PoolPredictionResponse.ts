import { UserDataInterface } from "../user/userInterface";
import { FootballFixtureResponse } from "../football/fixture/FootballFixtureResponse";

export interface PoolGroupResponse {
    uuid: string;
    name: string;
    description: string | null;
    max_participants: number;
    access_code: string;
}

export interface PoolPredictionResponse {
    pool_group: PoolGroupResponse | null;
    user: UserDataInterface | null;
    fixture: FootballFixtureResponse | null;
    home_score: number;
    away_score: number;
    points: number;
}
