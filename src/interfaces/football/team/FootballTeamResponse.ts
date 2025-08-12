import { CountryResponse } from "@/interfaces/country/CountryResponse";

export interface FootballTeamResponse {
    uuid: string;
    sm_id: number;
    name: string;
    short_code: string;
    image_path: string;
    founded: number;
    country: CountryResponse;
}