import { FootballStageResponse } from "../football/stage/FootballStageResponse";
import { UserDataInterface } from "../user/userInterface";

export interface PoolResponse {
    uuid: string;
    name: string;
    description: string;
    max_participants: number;
    stage: FootballStageResponse | null;
    access_code?: string | null;
    memberships?: UserDataInterface[] | null;
}
