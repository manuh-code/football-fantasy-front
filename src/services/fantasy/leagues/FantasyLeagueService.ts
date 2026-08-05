
import { AxiosError, type AxiosRequestConfig } from "axios";
import { useApiFantasy } from "@/composables/useApiFantasy";
import { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";
import { FantasyLeagueCreatePayload } from "@/interfaces/fantasy/leagues/FantasyLeagueCreatePayload";
import { FantasyLeagueJoined } from "@/interfaces/fantasy/leagues/FantasyLeagueJoined";
import { useUserStore } from "@/store";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { ScoreRulePayload } from "@/interfaces/fantasy/score/ScoreRulePayload";
import { ScoringEditorResponse } from "@/interfaces/fantasy/score/ScoringEditorResponse";
import { FantasyRoundResponse } from "@/interfaces/fantasy/rounds/FantasyRoundResponse";
import { FantasyPlayerDraftResponse } from "@/interfaces/fantasy/draft/FantasyPlayerDraftResponse";
import { FantasyPlayerDraftPayload } from "@/interfaces/fantasy/draft/FantasyPlayerDraftPayload";
import { FantasyAddPlayerPayload } from "@/interfaces/fantasy/draft/FantasyAddPlayerPayload";
import { FantasyUserTeamPayload } from "@/interfaces/fantasy/team/FantasyUserTeamPayload";
import { FantasyTeamData } from "@/interfaces/fantasy/team/FantasyUserTeamResponse";
import { FantasyLeagueMatchupResponse } from "@/interfaces/fantasy/matchups/FantasyLeagueMatchupResponse";
import { FantasyParticipantCountResponse } from "@/interfaces/fantasy/leagues/FantasyParticipanCountResponse";
import { FantasyDraftTurnStarted } from "@/interfaces/fantasy/draft/FantasyDraftTurnStarted";
import { FantasyDraftPlayerPicked } from "@/interfaces/fantasy/draft/FantasyDraftPlayerPicked";
import { LineupPlayerRemovePayload } from "@/interfaces/fantasy/lineup/LineupPlayerRemovePayload";
import { FantasyStandingResponse } from "@/interfaces/fantasy/standing/FantasyStandingResponse";
import { FantasyTradePayload } from "@/interfaces/fantasy/trade/FantasyTradePayload";
import { FantasyTradeResponse } from "@/interfaces/fantasy/trade/FantasyTradeResponse";
import { PlayerFantasyScoreDetailResponse } from "@/interfaces/fantasy/score/PlayerFantasyScoreDetailResponse";
import { DraftResults } from "@/interfaces/fantasy/draft/DraftResults";
import { FantasyPlayoffBracketResponse } from "@/interfaces/fantasy/playoffs/FantasyPlayoffBracketResponse";
import { RosterGrade } from "@/interfaces/fantasy/team/RosterGrade";


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

    async joinFantasyLeague(payload: FantasyLeagueJoined): Promise<FantasyLeaguesResponse> {
        const response = await this.api.post<ApiResponse<FantasyLeaguesResponse>>(`fantasy/leagues/join`, payload);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to join fantasy league');
    }

    async getScoringEditor(leagueUuid: string): Promise<ScoringEditorResponse> {
        const response = await this.api.get<ApiResponse<ScoringEditorResponse>>(`fantasy/leagues/score/${leagueUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to fetch scoring rules');
    }

    // Guardar y restaurar devuelven el editor completo, no sólo un ok: el guardado
    // puede cambiar `is_custom` y `active_preset`, y volver a pedirlo sería un
    // viaje extra para pintar lo que el servidor ya calculó.
    async updateScoreRules(payload: ScoreRulePayload, leagueUuid: string): Promise<ScoringEditorResponse> {
        const response = await this.api.put<ApiResponse<ScoringEditorResponse>>(`fantasy/leagues/score/${leagueUuid}`, payload);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to update score rules');
    }

    async resetScoreRules(leagueUuid: string): Promise<ScoringEditorResponse> {
        const response = await this.api.delete<ApiResponse<ScoringEditorResponse>>(`fantasy/leagues/score/${leagueUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to reset score rules');
    }

    async getFantasyRoundsByLeagueUuid(leagueUuid: string): Promise<FantasyRoundResponse[]> {
        const response = await this.api.get<ApiResponse<FantasyRoundResponse[]>>(`fantasy/leagues/rounds/${leagueUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch fantasy rounds');
    }

    async getPlayersToDraft(
        leagueUuid: string,
        payload: FantasyPlayerDraftPayload,
        options?: { silent?: boolean },
    ): Promise<FantasyPlayerDraftResponse[]> {
        // Background roster loads (e.g. the trade drawer) pass `silent` so a
        // failed fetch surfaces in-component instead of firing the global error
        // toast — a stale/invalid participant uuid shouldn't scare the user.
        const config = options?.silent
            ? ({ _silent: true } as AxiosRequestConfig & { _silent?: boolean })
            : undefined;
        const response = await this.api.post<ApiResponse<FantasyPlayerDraftResponse[]>>(`fantasy/leagues/draft/players/${leagueUuid}`, payload, config);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch players to draft');
    }

    async toggleAutoPick(leagueUuid: string, autoPick: boolean): Promise<ApiResponse<null>> {
        const response = await this.api.put<ApiResponse<null>>(`fantasy/leagues/draft/auto-pick`, {
            fantasy_league_uuid: leagueUuid,
            auto_pick: autoPick
        });
        if (response.data.code === 200) {
            return response.data;
        }
        throw new Error('Failed to toggle auto-pick');
    }

    async getAutoPickStatus(leagueUuid: string): Promise<boolean> {
        const response = await this.api.get<ApiResponse<{ auto_pick: boolean }>>(`fantasy/leagues/draft/user/autopick/${leagueUuid}`);
        if (response.data.code === 200) {
            return response.data.data.auto_pick;
        }
        throw new Error('Failed to fetch auto-pick status');
    }

    async pickerPlayer(payload: FantasyAddPlayerPayload): Promise<ApiResponse<null>> {
        const response = await this.api.post<ApiResponse<null>>(`fantasy/leagues/draft/pick/`, payload);
        if (response.data.code === 200) {
            return response.data;
        }
        throw new Error('Failed to add player');
    }

    async addPlayer(payload: FantasyAddPlayerPayload): Promise<ApiResponse<null>> {
        const response = await this.api.post<ApiResponse<null>>(`fantasy/leagues/add/player`, payload);
        if (response.data.code === 200) {
            return response.data;
        }
        throw new Error('Failed to select player');
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
            { _silent: true } as AxiosRequestConfig & { _silent?: boolean }
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

    async activateDraft(leagueUuid: string): Promise<ApiResponse<null>> {
        const response = await this.api.put<ApiResponse<null>>(`fantasy/leagues/draft/activate`, {
            fantasy_league_uuid: leagueUuid
        }
        );
        if (response.data.code === 200) {
            return response.data;
        }
        throw new Error('Failed to activate draft');
    }

    async completeDraft(leagueUuid: string): Promise<ApiResponse<null>> {
        const response = await this.api.put<ApiResponse<null>>(`fantasy/leagues/draft/completed`, {
            fantasy_league_uuid: leagueUuid
        }
        );
        if (response.data.code === 200) {
            return response.data;
        }
        throw new Error('Failed to complete draft');
    }

    /**
     * Skip the current draft turn (timer expired).
     * The backend advances to the next turn and broadcasts via Ably.
     */
    async skipDraftTurn(fantasyLeagueUuid: string): Promise<ApiResponse<null>> {
        const response = await this.api.post<ApiResponse<null>>(
            `fantasy/leagues/draft/skip-turn`,
            { fantasy_league_uuid: fantasyLeagueUuid }
        );
        if (response.data.code === 200) {
            return response.data;
        }
        throw new Error('Failed to skip draft turn');
    }

    async draftState(draftUuid: string): Promise<ApiResponse<unknown>> {
        const response = await this.api.get<ApiResponse<unknown>>(`fantasy/leagues/draft/${draftUuid}/state`);
        if (response.data.code === 200) {
            return response.data;
        }
        throw new Error('Failed to fetch draft state');
    }

    async getTurnInfo(fantasyLeagueUuid: string): Promise<FantasyDraftTurnStarted> {
        const response = await this.api.get<ApiResponse<FantasyDraftTurnStarted>>(
            `fantasy/leagues/draft/${fantasyLeagueUuid}/turn-info`
        );
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch turn info');
    }

    async getDraftPlayerPicked(fantasyLeagueUuid: string): Promise<FantasyDraftPlayerPicked[]> {
        const response = await this.api.get<ApiResponse<FantasyDraftPlayerPicked[]>>(
            `fantasy/leagues/draft/${fantasyLeagueUuid}/players/picked`
        );
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch picked players');
    }

    /**
     * Boleta del draft: nota, posición en la sala y mejor pick. Mismo payload
     * que la del mock draft, así que la pinta el mismo componente.
     */
    async getDraftResults(fantasyLeagueUuid: string): Promise<DraftResults> {
        const response = await this.api.get<ApiResponse<DraftResults>>(
            `fantasy/leagues/draft/${fantasyLeagueUuid}/results`
        );
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch draft results');
    }

    /**
     * Calificación de la plantilla actual. Misma fórmula que la boleta del
     * draft, pero sobre el lineup vigente, así que cambia con los traspasos.
     *
     * Devuelve 404 mientras la liga no tenga plantilla que calificar (antes del
     * draft); quien la consuma debe tratarlo como "todavía no", no como error.
     */
    async getRosterGrade(fantasyLeagueUuid: string): Promise<RosterGrade> {
        const response = await this.api.get<ApiResponse<RosterGrade>>(
            `fantasy/leagues/team/grade/${fantasyLeagueUuid}`,
            { _silent: true } as AxiosRequestConfig & { _silent?: boolean }
        );
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch roster grade');
    }

    async lineupPlayerRemove(payload: LineupPlayerRemovePayload): Promise<ApiResponse<null>> {
        const response = await this.api.delete<ApiResponse<null>>(
            `fantasy/leagues/remove/player`,
            { data: payload }
        );
        if (response.data.code === 200) {
            return response.data;
        }
        throw new Error('Failed to remove player from lineup');
    }

    async getCurrentMatchup(leagueUuid: string): Promise<FantasyLeagueMatchupResponse> {
        const response = await this.api.get<ApiResponse<FantasyLeagueMatchupResponse>>(`fantasy/leagues/matchups/${leagueUuid}/current/user`);

        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch current matchup');
    }

    async getMatchupByRoundAndUser(leagueUuid: string, roundUuid: string): Promise<FantasyLeagueMatchupResponse> {
        const response = await this.api.get<ApiResponse<FantasyLeagueMatchupResponse>>(`fantasy/leagues/matchups/${leagueUuid}/round/${roundUuid}/user`);

        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch matchup for round');
    }

    /**
     * Cuadro de eliminatorias de la liga. Responde también antes de que empiece
     * (con `has_started` en false y las series vacías), para poder anunciar
     * cuántos clasifican desde el primer día.
     */
    async getPlayoffBracket(leagueUuid: string): Promise<FantasyPlayoffBracketResponse> {
        const response = await this.api.get<ApiResponse<FantasyPlayoffBracketResponse>>(`fantasy/leagues/playoffs/${leagueUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch playoff bracket');
    }

    async getStandingsByLeague(leagueUuid: string): Promise<FantasyStandingResponse[]> {
        const response = await this.api.get<ApiResponse<FantasyStandingResponse[]>>(`fantasy/leagues/standings/${leagueUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch standings for league');
    }

    /**
     * Per-round, stat-by-stat fantasy score breakdown for a single player, scoped
     * to a league's scoring system. Powers the player-score detail drawer.
     */
    async getPlayerFantasyScore(
        fantasyLeagueUuid: string,
        roundUuid: string,
        playerUuid: string,
    ): Promise<PlayerFantasyScoreDetailResponse> {
        const response = await this.api.get<ApiResponse<PlayerFantasyScoreDetailResponse>>(
            `fantasy/leagues/statistics/${fantasyLeagueUuid}/round/${roundUuid}/player/${playerUuid}`,
        );
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch player fantasy score');
    }

    /**
     * Propose a trade: offer own players in exchange for another manager's players.
     */
    async proposeTrade(payload: FantasyTradePayload): Promise<FantasyTradeResponse> {
        const response = await this.api.post<ApiResponse<FantasyTradeResponse>>(`fantasy/leagues/trades`, payload);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to propose trade');
    }

    /**
     * Accept a pending trade (receiver only) — executes the player swap.
     */
    async acceptTrade(tradeUuid: string): Promise<FantasyTradeResponse> {
        const response = await this.api.post<ApiResponse<FantasyTradeResponse>>(`fantasy/leagues/trades/${tradeUuid}/accept`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to accept trade');
    }

    /**
     * Reject a pending trade (receiver only).
     */
    async rejectTrade(tradeUuid: string): Promise<FantasyTradeResponse> {
        const response = await this.api.post<ApiResponse<FantasyTradeResponse>>(`fantasy/leagues/trades/${tradeUuid}/reject`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to reject trade');
    }

    /**
     * Cancel a pending trade (proposer only). Like accept/reject, the backend
     * returns the full updated trade resource (not an empty body).
     */
    async cancelTrade(tradeUuid: string): Promise<FantasyTradeResponse> {
        const response = await this.api.delete<ApiResponse<FantasyTradeResponse>>(`fantasy/leagues/trades/${tradeUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to cancel trade');
    }

    /**
     * List the authenticated user's trades (sent + received) within a league.
     */
    async getTradesByLeague(fantasyLeagueUuid: string): Promise<FantasyTradeResponse[]> {
        const response = await this.api.get<ApiResponse<FantasyTradeResponse[]>>(`fantasy/leagues/trades/${fantasyLeagueUuid}`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch trades');
    }
}

export const fantasyLeagueService = new FantasyLeagueService();
export default fantasyLeagueService;