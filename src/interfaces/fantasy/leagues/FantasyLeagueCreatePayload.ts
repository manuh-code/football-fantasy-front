export interface FantasyLeagueCreatePayload {
    name: string;
    status_uuid?: string | null;
    league_uuid: string;
    participants_count: number;
    description?: string;
    is_private: boolean;
    password: string;
    image_path?: string;
    started_at: string;
    draft: {
        draft_day: string;
        pick_timer: number;
        snake_order: boolean;
    };
}
