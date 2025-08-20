import { ApiResponse } from "@/composables";
import { useApiFantasy } from "@/composables/useApiFantasy";
import { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";
import { FantasyLeagueCreatePayload } from "@/interfaces/fantasy/leagues/FantasyLeagueCreatePayload";
import { FantasyLeagueJoined } from "@/interfaces/fantasy/leagues/FantasyLeagueJoined";
import { useUserStore } from "@/store";

export class FantasyLeagueService{
    private api;

    private userStore;
    constructor() {
        const { apiFantasyInstance } = useApiFantasy();
        this.api = apiFantasyInstance;
        this.userStore = useUserStore();
    }

    async showFantasyLeague(uuid: string): Promise<FantasyLeaguesResponse> {
        const response = await this.api.get<ApiResponse<FantasyLeaguesResponse>>(`fantasy/leagues/${uuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch fantasy league');
    }

    async storeFantasyLeague(payload: FantasyLeagueCreatePayload): Promise<FantasyLeaguesResponse> {
        const response = await this.api.post<ApiResponse<FantasyLeaguesResponse>>('fantasy/leagues/store', payload);
        if (response.data.code === 200) {
            this.userStore.clearUserFantasyLeagues();
            return response.data.data;
        }
        throw new Error('Failed to create fantasy league'); 
    }

    async joinFantasyLeague(payload: FantasyLeagueJoined, leagueUuid: string): Promise<FantasyLeaguesResponse> {
        const response = await this.api.post<ApiResponse<FantasyLeaguesResponse>>(`fantasy/leagues/join/${leagueUuid}`, payload);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to join fantasy league');
    }

}

export const fantasyLeagueService = new FantasyLeagueService();
export default fantasyLeagueService;