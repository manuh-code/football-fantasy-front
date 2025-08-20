import { CountryResponse } from "@/interfaces/country/CountryResponse";
import { TypeResponse } from "../type/TypeResponse";
import { FootballTeamResponse } from "../team/FootballTeamResponse";

export interface FootballPlayerStatisticResponse {
    uuid: string;
    age: number;
    common_name: string;
    full_name: string;
    display_name: string;
    image_path: string;
    country: CountryResponse;
    position: TypeResponse | null;
    team: FootballTeamResponse;
    statistics: {
        uuid: string;
        has_values: boolean;
        details: Record<string, number>;
    }
}