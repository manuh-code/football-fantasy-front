import { TypeResponse } from "../type/TypeResponse";

export interface FootballStageResponse {
    uuid: string;
    name: string;
    sort_order: number;
    finished: boolean;
    is_current: boolean;
    starting_at: string; // ISO date string or formatted date
    ending_at: string;   // ISO date string or formatted date
    games_in_current_week: boolean;
    tie_breaker_rule_id: string | null;
    type: TypeResponse;
}