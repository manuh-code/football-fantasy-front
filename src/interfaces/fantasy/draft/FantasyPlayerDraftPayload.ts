export interface FantasyPlayerDraftPayload {
    page: number;
    per_page: number;
    filters?: {
        position_uuid?: string;
    };
}