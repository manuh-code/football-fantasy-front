import { FantasyLeagueDraftPayload } from "./FantasyLeagueDraftPayload";

export interface FantasyLeagueCreatePayload {
    name: string;
    league_uuid: string;
    password: string;
   
    status_uuid?: string | null;
    participants_count?: number | null;
    description?: string | null;
    is_private?: boolean | null;
    image_path?: string | null;
    started_at?: string | null;
    draft?: FantasyLeagueDraftPayload | null;
}
