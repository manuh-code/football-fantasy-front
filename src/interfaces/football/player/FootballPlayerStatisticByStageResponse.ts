import { TypeResponse } from "../type/TypeResponse";
import { FootballPlayerResponse } from "./FootballPlayerResponse";

export interface FootballStatisticDetail {
    type: TypeResponse;
    player: FootballPlayerResponse;
    value: string;
}

export interface FootballPlayerStatisticByStageResponse {
    type: string;
    stat_group: string;
    statistics: FootballStatisticDetail[];
}
