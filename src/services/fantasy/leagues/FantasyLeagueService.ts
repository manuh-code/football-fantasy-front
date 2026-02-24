
import { useApiFantasy } from "@/composables/useApiFantasy";
import { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";
import { FantasyLeagueCreatePayload } from "@/interfaces/fantasy/leagues/FantasyLeagueCreatePayload";
import { FantasyLeagueJoined } from "@/interfaces/fantasy/leagues/FantasyLeagueJoined";
import { useUserStore } from "@/store";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { ScoreRulePayload } from "@/interfaces/fantasy/score/ScoreRulePayload";
import { FantasyRoundResponse } from "@/interfaces/fantasy/rounds/FantasyRoundResponse";
import { FantasyPlayerDraftResponse } from "@/interfaces/fantasy/draft/FantasyPlayerDraftResponse";
import { FantasyPlayerDraftPayload } from "@/interfaces/fantasy/draft/FantasyPlayerDraftPayload";
import { FantasyAddPlayerPayload } from "@/interfaces/fantasy/draft/FantasyAddPlayerPayload";
import { FantasyUserTeamPayload } from "@/interfaces/fantasy/team/FantasyUserTeamPayload";
import { FantasyTeamData } from "@/interfaces/fantasy/team/FantasyUserTeamResponse";
import { FantasyLeagueMatchupResponse } from "@/interfaces/fantasy/matchups/FantasyLeagueMatchupResponse";
import { FantasyParticipantCountResponse } from "@/interfaces/fantasy/leagues/FantasyParticipanCountResponse";

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

    async addTeam(payload: FantasyUserTeamPayload): Promise<ApiResponse<FantasyTeamData>> {
        const formData = new FormData();
        formData.append('fantasy_league_uuid', payload.fantasy_league_uuid);
        formData.append('team_name', payload.team_name);
        formData.append('initials', payload.initials);

        if (payload.image) {
            formData.append('image', payload.image);
        }

        const response = await this.api.post<ApiResponse<FantasyTeamData>>(
            `fantasy/leagues/team/store`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        if (response.data.code === 200) {
            return response.data;
        }
        throw new Error('Failed to add team');
    }

    async getTeam(leagueUuid: string): Promise<FantasyTeamData> {
        const response = await this.api.get<ApiResponse<FantasyTeamData>>(`fantasy/leagues/team/${leagueUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch team');
    }

    async getMatchupsByFantasyRound(leagueUuid: string, roundUuid: string): Promise<ApiResponse<FantasyLeagueMatchupResponse[]>> {
        const response = await this.api.get<ApiResponse<FantasyLeagueMatchupResponse[]>>(`fantasy/leagues/matchups/${leagueUuid}/round/${roundUuid}`);
        if (response.data.code === 200) {
            return response.data;
        }
        throw new Error('Failed to fetch matchups');
    }

    /**
     * Check if the user has a team in the given league.
     * Uses silent mode to avoid showing toast on 404 errors.
     */
    async getTeamSilent(leagueUuid: string): Promise<FantasyTeamData> {
        const response = await this.api.get<ApiResponse<FantasyTeamData>>(
            `fantasy/leagues/team/${leagueUuid}`,
            { _silent: true } as any
        );
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch team');
    }

    async getParticipantOptions(leagueUuid: string): Promise<ApiResponse<FantasyParticipantCountResponse>> {
        const response = await this.api.get<ApiResponse<FantasyParticipantCountResponse>>(`fantasy/leagues/participant-options/${leagueUuid}`);
        if (response.data.code === 200) {
            return response.data;
        }
        throw new Error('Failed to fetch participant options');
    }
}

export const fantasyLeagueService = new FantasyLeagueService();
export default fantasyLeagueService;