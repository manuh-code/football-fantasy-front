import { useApiFantasy } from "@/composables/useApiFantasy";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";
import { FootballRoundResponse } from "@/interfaces/football/round/FootballRoundResponse";
import { AxiosError } from "axios";

export class FootballFixtureService {
    private api;

    constructor() {
        const { apiFantasyInstance } = useApiFantasy();
        this.api = apiFantasyInstance;
    }

    async getFixturesForTheWeek(): Promise<FootballFixtureResponse[]> {
        const response = await this.api.get<ApiResponse<FootballFixtureResponse[]>>("/fixtures/this-week");
        if (response.data.code === 200) {
            return response.data.data;
        }

        throw new AxiosError('Failed to fetch football fixture data');
    }

    async getRoundBySeasonFixtures(leagueUuid: string): Promise<FootballRoundResponse[]> {
        const response = await this.api.get<ApiResponse<FootballRoundResponse[]>>(`/rounds/by/season/${leagueUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }

        throw new AxiosError('Failed to fetch football fixture data');
    }
}

export const footballFixtureService = new FootballFixtureService();
export default footballFixtureService;