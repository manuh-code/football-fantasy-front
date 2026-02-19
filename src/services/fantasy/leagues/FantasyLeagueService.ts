
import { useApiFantasy } from "@/composables/useApiFantasy";
import { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";
import { FantasyLeagueCreatePayload } from "@/interfaces/fantasy/leagues/FantasyLeagueCreatePayload";
import { FantasyLeagueJoined } from "@/interfaces/fantasy/leagues/FantasyLeagueJoined";
import { useUserStore } from "@/store";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { ScoreRulePayload } from "@/interfaces/fantasy/score/ScoreRulePayload";
import { FantasyRoundResponse } from "@/interfaces/fantasy/rounds/FantasyRoundResponse";
import { FantasyFootballPlayersResponse } from "@/interfaces/user/fantasy/FantasyFootballPlayersResponse";
import { FantasyPlayerDraftResponse } from "@/interfaces/fantasy/draft/FantasyPlayerDraftResponse";
import { FantasyPlayerDraftPayload } from "@/interfaces/fantasy/draft/FantasyPlayerDraftPayload";
import { FantasyAddPlayerPayload } from "@/interfaces/fantasy/draft/FantasyAddPlayerPayload";

export class FantasyLeagueService {
    private readonly api;

    private readonly userStore;

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

    async updateScoreRules(payload: ScoreRulePayload, leagueUuid: string): Promise<ApiResponse<null>> {
        const response = await this.api.put<ApiResponse<null>>(`fantasy/leagues/score/${leagueUuid}`, payload);
        if (response.data.code === 200) {
            return response.data;
        }
        throw new Error('Failed to update score rules');
    }

    async getFantasyRoundsByLeagueUuid(leagueUuid: string): Promise<FantasyRoundResponse[]> {
        const response = await this.api.get<ApiResponse<FantasyRoundResponse[]>>(`fantasy/leagues/rounds/${leagueUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch fantasy rounds');
    }

    async getPlayersToDraft(leagueUuid: string, payload: FantasyPlayerDraftPayload): Promise<FantasyPlayerDraftResponse[]> {
        const response = await this.api.post<ApiResponse<FantasyPlayerDraftResponse[]>>(`fantasy/leagues/draft/players/${leagueUuid}`, payload);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch players to draft');
    }

    async addPlayer(payload: FantasyAddPlayerPayload): Promise<ApiResponse<null>> {
        const response = await this.api.post<ApiResponse<null>>(`fantasy/leagues/draft/pick/`, payload);
        if (response.data.code === 200) {
            return response.data;
        }
        throw new Error('Failed to add player');
    }

}

export const fantasyLeagueService = new FantasyLeagueService();
export default fantasyLeagueService;