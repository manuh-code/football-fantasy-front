import { useApiFantasy } from "@/composables/useApiFantasy";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { FootballLeagueStandingsResponse } from "@/interfaces/football/league/FootballLeagueStandingsResponse";
import { FootballStageLeagueResponse } from "@/interfaces/football/league/stage/FootballStageLeagueResponse";
import { FootballLeagueStandingsPayload } from "@/interfaces/football/league/Standing/FootballLeagueStandingsPayload";
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

    async getStandings(payload: FootballLeagueStandingsPayload): Promise<FootballLeagueStandingsResponse[]> {
        const response = await this.api.post<ApiResponse<FootballLeagueStandingsResponse[]>>('/leagues/standings', payload);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to fetch standings');
    }

    async getStage(leagueUuid: string): Promise<FootballStageLeagueResponse[]> {
        const response = await this.api.get<ApiResponse<FootballStageLeagueResponse[]>>(`/leagues/${leagueUuid}/stages`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to fetch league stages');
    }
}

export const footballLeagueService = new FootballLeagueService();
export default footballLeagueService;