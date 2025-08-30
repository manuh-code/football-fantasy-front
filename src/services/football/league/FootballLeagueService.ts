import { useApiFantasy } from "@/composables/useApiFantasy";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { FootballLeagueStandingsResponse } from "@/interfaces/football/league/FootballLeagueStandingsResponse";
import { AxiosError } from "axios";

export class FootballLeagueService {
    private api;

    constructor() {
        const { apiFantasyInstance } = useApiFantasy();
        this.api = apiFantasyInstance;
    }

    async getCurrentStandings(leagueUuid: string): Promise<FootballLeagueStandingsResponse[]> {
        const response = await this.api.get<ApiResponse<FootballLeagueStandingsResponse[]>>(`/leagues/${leagueUuid}/standings/current`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to fetch current standings');
    }
}

export const footballLeagueService = new FootballLeagueService();
export default footballLeagueService;