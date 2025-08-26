import { CountryResponse } from "@/interfaces/country/CountryResponse";
import { FootballTeamMetaResponse } from "./FootballTeamMetaResponse";
import { FootballTeamCurrentScoreResponse } from "./FootballTeamCurrentScoreResponse";

export interface FootballTeamResponse {
    uuid: string;
    sm_id: number;
    name: string;
    short_code: string;
    image_path: string;
    founded: number;
    country: CountryResponse;
    meta: FootballTeamMetaResponse | null;
    current_score: FootballTeamCurrentScoreResponse | null;

}