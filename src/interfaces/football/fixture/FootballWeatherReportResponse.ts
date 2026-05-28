export interface FootballWeatherTemperatureResponse {
    day: number;
    morning: number;
    evening: number;
    night: number;
}

export interface FootballWeatherWindResponse {
    speed: number;
    direction: number;
}

export interface FootballWeatherCurrentResponse {
    temp: number;
    wind: number;
    clouds: string | null;
    humidity: string;
    pressure: number;
    direction: number;
    feels_like: number;
    description: string;
}

export interface FootballWeatherReportResponse {
    id: number;
    fixture_id: number;
    venue_id: number;
    temperature: FootballWeatherTemperatureResponse;
    feels_like: FootballWeatherTemperatureResponse;
    wind: FootballWeatherWindResponse;
    humidity: string;
    pressure: number;
    clouds: string;
    description: string;
    icon: string;
    type: string;
    metric: string;
    current: FootballWeatherCurrentResponse;
}
