import { useApiFantasy } from "@/composables/useApiFantasy";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { FootballPlayerStatisticPayload } from "@/interfaces/football/player/FootballPlayerStatisticPayload";
import { FootballPlayerStatisticResponse } from "@/interfaces/football/player/FootballPlayerStatisticResponse";
import { AxiosError } from "axios";

export class FootballPlayerService {
    private api;

    constructor() {
        const { apiFantasyInstance } = useApiFantasy();
        this.api = apiFantasyInstance;
    }

    async getFootballPlayerStatistics(payload: FootballPlayerStatisticPayload, footballSeasonUuid: string): Promise<ApiResponse<FootballPlayerStatisticResponse[]>> {
        const response = await this.api.post<ApiResponse<FootballPlayerStatisticResponse[]>>(`/football/players/statistics/season/${footballSeasonUuid}`, payload);
        if (response.data.code === 200) {
            return response.data;
        }

        throw new AxiosError('Failed to fetch football player statistics');
    }
}

export const footballPlayerService = new FootballPlayerService();
export default footballPlayerService;