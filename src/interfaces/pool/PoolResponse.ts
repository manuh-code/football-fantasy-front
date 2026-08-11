import { FootballLeagueSummary } from "../football/league/FootballLeagueSummary";
import { FootballStageResponse } from "../football/stage/FootballStageResponse";
import { UserDataInterface } from "../user/userInterface";

export interface PoolResponse {
    uuid: string;
    name: string;
    description: string;
    max_participants: number;
    is_admin: boolean;
    stage: FootballStageResponse | null;
    /** Liga de futbol sobre la que se juega; su escudo va en la tarjeta. */
    football_league?: FootballLeagueSummary | null;
    access_code?: string | null;
    memberships?: UserDataInterface[] | null;
}
