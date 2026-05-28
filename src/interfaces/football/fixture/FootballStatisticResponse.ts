import { TypeResponse } from "../type/TypeResponse";

export interface FootballStatisticDataResponse {
    value: number;
}

export interface FootballStatisticResponse {
    id: number;
    fixture_id: number;
    type_id: number;
    participant_id: number;
    data: FootballStatisticDataResponse;
    location: "home" | "away";
    type: TypeResponse;
}
