import { ApiResponse } from "@/composables";
import { useApiFantasy } from "@/composables/useApiFantasy";
import { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";

export class FantasyLeagueService {
    private api;

    constructor() {
        const { apiFantasyInstance } = useApiFantasy();
        this.api = apiFantasyInstance;
    }

    async storeFantasyLeague(): Promise<FantasyLeaguesResponse> {
        const response = await this.api.post<ApiResponse<FantasyLeaguesResponse>>('fantasy/leagues/store');
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to create fantasy league'); 
    }

}

export const fantasyLeagueService = new FantasyLeagueService();
export default fantasyLeagueService;