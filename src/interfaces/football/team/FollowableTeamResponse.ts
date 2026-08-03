import { CountryResponse } from "@/interfaces/country/CountryResponse";

/**
 * Un equipo ofrecido para seguir. Trae cuánta gente lo sigue y si el usuario
 * actual ya lo sigue, datos que no vienen en FootballTeamResponse.
 */
export interface FollowableTeamResponse {
    uuid: string;
    sm_id: number;
    name: string;
    short_code: string;
    image_path: string;
    founded: number;
    country: CountryResponse;
    followers_count: number;
    is_following: boolean;
}

/**
 * De dónde salió la lista de sugerencias.
 *
 * `random` significa que todavía no hay seguidores suficientes para armar un
 * ranking, así que la vista no debe presentarla como "los más seguidos".
 */
export type FollowableTeamsSource = "top" | "random" | "mixed" | "search";

export interface FollowableTeamsMeta {
    source: FollowableTeamsSource;
}

export interface FollowableTeamsResult {
    teams: FollowableTeamResponse[];
    source: FollowableTeamsSource;
}
