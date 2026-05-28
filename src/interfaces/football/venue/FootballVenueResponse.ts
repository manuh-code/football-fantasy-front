import { CountryResponse } from '../../country/CountryResponse';

export interface CityResponse {
    uuid: string | null;
    sm_id: number | null;
    name: string | null;
    latitude: string | null;
    longitude: string | null;
}

export interface FootballVenueResponse {
    uuid: string | null;
    name: string | null;
    address: string | null;
    zipcode: string | null;
    latitude: string | null;
    longitude: string | null;
    capacity: number | null;
    image_path: string | null;
    city_name: string | null;
    surface: string | null;
    city: CityResponse | null;
    country: CountryResponse | null;
}
