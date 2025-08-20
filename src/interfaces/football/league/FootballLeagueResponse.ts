export interface FootballLeagueResponse {
    uuid: string;
    sm_id: number;
    country_id: number;
    name: string;
    image_path: string;
    current_season: {
        uuid: string;
        sm_id: number;
        league_id: number;
        name: string;
        is_current: boolean;
        starting_at: string; // ISO 8601 date string
        ending_at: string;   // ISO 8601 date string
    };
}