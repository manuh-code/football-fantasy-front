import { FootballSeasonResponse } from "../season/FootballSeasonResponse";

export interface FootballLeagueResponse {
    uuid: string;
    sm_id: number;
    country_id: number;
    name: string;
    image_path: string;
    current_season: FootballSeasonResponse | null;
}