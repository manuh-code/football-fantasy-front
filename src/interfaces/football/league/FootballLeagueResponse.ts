import { FootballSeasonResponse } from "../season/FootballSeasonResponse";

export interface FootballLeagueResponse {
    uuid: string;
    sm_id: number;
    country_id: number;
    name: string;
    image_path: string;
    /** Jugar en esta liga exige suscripción. Sólo la Liga MX es gratuita. */
    premium: boolean;
    current_season: FootballSeasonResponse | null;
}