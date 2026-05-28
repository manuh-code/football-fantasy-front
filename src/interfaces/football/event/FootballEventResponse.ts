import { FootballPlayerResponse } from "@/interfaces/football/player/FootballPlayerResponse";
import { TypeResponse } from "@/interfaces/football/type/TypeResponse";

export interface FootballPeriodResponse {
    id: number;
    fixture_id: number;
    type_id: number;
    started: number;
    ended: number;
    counts_from: number;
    ticking: boolean;
    sort_order: number;
    description: string;
    time_added: number;
    period_length: number;
    minutes: number;
    seconds: number;
    has_timer: boolean;
    type: TypeResponse;
}

export interface FootballEventResponse {
    id: number;
    fixture_id: number;
    period_id: number;
    participant_id: number;
    type_id: number;
    section: string;
    player_id: number;
    related_player_id: number | null;
    player_name: string;
    related_player_name: string | null;
    result: string | null;
    info: string;
    addition: string;
    minute: number;
    extra_minute: number;
    injured: string | null;
    on_bench: boolean;
    coach_id: string | null;
    sub_type_id: string | null;
    detailed_period_id: number;
    rescinded: boolean;
    sort_order: number;
    period: FootballPeriodResponse;
    type: TypeResponse;
    player: FootballPlayerResponse;
}
