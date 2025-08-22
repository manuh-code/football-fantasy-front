import { CountryResponse } from "@/interfaces/country/CountryResponse";


export interface FootballPlayerResponse {
    uuid: string;
    age: number;
    common_name: string;
    full_name: string;
    display_name: string;
    image_path: string;
    height: number;
    weight: number;
    date_of_birth: string;
    gender: string;
    country: CountryResponse;
}