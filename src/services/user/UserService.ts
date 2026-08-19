
import { useApiFantasy } from "@/composables/useApiFantasy";
import { UserDataInterface } from "@/interfaces/user/userInterface";
import { UserPayload } from "@/interfaces/user/userPayload";
import { ChangePasswordPayload } from "@/interfaces/user/password/ChangePasswordPayload";
import { DeleteAccountPayload } from "@/interfaces/user/delete/DeleteAccountPayload";
import { FavoriteTeamPayload } from "@/interfaces/user/favoriteTeam/FavoriteTeamPayload";
import { AxiosError, AxiosRequestConfig } from "axios";
import { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { UserFootballLeaguePayload } from "@/interfaces/user/footballLeague/UserFootballLeaguePayload";
import { UserStorePayload } from "@/interfaces/user/store/userStorePayload";
import { FantasyFootballPlayersResponse } from "@/interfaces/user/fantasy/FantasyFootballPlayersResponse";
import { FantasyFootballLineupPayload } from "@/interfaces/fantasy/leagues/FantasyFootballLineupPayload";
import { LineupPlayerUpdatePayload } from "@/interfaces/fantasy/lineup/LineupPlayerUpdatePayload";
import { FantasyFootballPlayerVersusResponse } from "@/interfaces/user/fantasy/FantasyFootballPlayerVersusResponse";
import { FollowableTeamResponse, FollowableTeamsMeta, FollowableTeamsResult } from "@/interfaces/football/team/FollowableTeamResponse";

export class UserService {
    private readonly api;

    constructor() {
        const { apiFantasyInstance } = useApiFantasy();
        this.api = apiFantasyInstance;
    }

    async userStore(payload: UserStorePayload): Promise<UserDataInterface> {
        const response = await this.api.post<ApiResponse<UserDataInterface>>('user/store', payload);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to register user');
    }

    async getUserData(): Promise<UserDataInterface> {
        const response = await this.api.get<ApiResponse<UserDataInterface>>('user');
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to fetch user data');
    }

    async updateProfile(payload: UserPayload): Promise<UserDataInterface> {
        const response = await this.api.put<ApiResponse<UserDataInterface>>('user/update', payload);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to update user profile');
    }

    async changeAvatar(file: File): Promise<UserDataInterface> {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await this.api.post<ApiResponse<UserDataInterface>>('user/store/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to update avatar');
    }

    async changePassword(payload: ChangePasswordPayload): Promise<UserDataInterface> {
        const response = await this.api.put<ApiResponse<UserDataInterface>>('user/update/password', payload);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to change password');
    }

    /**
     * Borra la cuenta del usuario autenticado.
     *
     * El API exige reautenticación: la contraseña actual si la cuenta tiene, o
     * un `id_token` de Google si entró por ahí y no tiene contraseña. En la web
     * siempre es lo primero, porque el login de Google del front pasa por
     * redirección y no devuelve un id_token que reenviar.
     *
     * Ojo con el `data`: en Axios un DELETE lleva el cuerpo dentro de la
     * configuración, no como segundo argumento — pasarlo como en un `post` lo
     * enviaría como config y el API recibiría la petición vacía.
     *
     * No devuelve datos: la respuesta es sólo un mensaje. Quien llama tiene que
     * cerrar la sesión después, porque el token que acaba de usar ya no vale.
     */
    async deleteAccount(payload: DeleteAccountPayload): Promise<void> {
        const response = await this.api.delete<ApiResponse<null>>('user', { data: payload });
        if (response.data.code === 200) {
            return;
        }
        throw new AxiosError('Failed to delete account');
    }

    async updateFavoriteTeam(payload: FavoriteTeamPayload): Promise<UserDataInterface> {
        const response = await this.api.post<ApiResponse<UserDataInterface>>('user/store/favorite/teams', payload);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to update favorite team');
    }

    async unfollowFavoriteTeam(teamUuid: string): Promise<UserDataInterface> {
        const response = await this.api.delete<ApiResponse<UserDataInterface>>(`user/favorite/teams/${teamUuid}/unfollow`);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to unfollow favorite team');
    }

    async getTopFollowedTeams(limit?: number): Promise<FollowableTeamsResult> {
        const response = await this.api.get<ApiResponse<FollowableTeamResponse[], FollowableTeamsMeta>>('user/favorite/teams/discover/top', {
            params: limit ? { limit } : undefined,
        });
        if (response.data.code === 200) {
            return { teams: response.data.data, source: response.data.meta?.source ?? 'random' };
        }
        throw new AxiosError('Failed to fetch suggested teams');
    }

    async searchFollowableTeams(search: string, limit?: number): Promise<FollowableTeamsResult> {
        const response = await this.api.get<ApiResponse<FollowableTeamResponse[], FollowableTeamsMeta>>('user/favorite/teams/discover/search', {
            params: { search, ...(limit ? { limit } : {}) },
            // El buscador dispara una consulta por pausa de tecleo; un toast por
            // cada fallo sería ruido. El componente muestra el error en su lugar.
            _silent: true,
        } as AxiosRequestConfig & { _silent?: boolean });
        if (response.data.code === 200) {
            return { teams: response.data.data, source: response.data.meta?.source ?? 'search' };
        }
        throw new AxiosError('Failed to search teams');
    }

    async getUserFantasyLeagues(silent = false): Promise<FantasyLeaguesResponse[]> {
        // `silent` lo usa el hub de inicio, donde esta llamada va en paralelo con
        // las de quinielas y Survivor: un fallo debe degradar la sección sin
        // toast. Ver useGameHub.
        const config = silent
            ? ({ _silent: true } as AxiosRequestConfig & { _silent?: boolean })
            : undefined;
        const response = await this.api.get<ApiResponse<FantasyLeaguesResponse[]>>('user/fantasy/leagues', config);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to fetch user fantasy leagues');
    }

    async storeFootballLeagues(payload: UserFootballLeaguePayload): Promise<UserDataInterface> {
        const response = await this.api.post<ApiResponse<UserDataInterface>>('user/football/leagues', payload);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to store football leagues');
    }

    async getFantasyFootballPlayersByLeagueUuid(leagueUuid: string, payload: FantasyFootballLineupPayload): Promise<FantasyFootballPlayersResponse> {
        const response = await this.api.post<ApiResponse<FantasyFootballPlayersResponse>>(`user/fantasy/football/lineups/${leagueUuid}`, payload);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to fetch fantasy football players');
    }

    async getLineupsVersusByRoundAndMatchup(leagueUuid: string, roundUuid: string, matchupUuid: string): Promise<ApiResponse<FantasyFootballPlayerVersusResponse>> {
        const response = await this.api.post<ApiResponse<FantasyFootballPlayerVersusResponse>>(`user/fantasy/football/lineups/versus/${leagueUuid}`, {
            fantasy_round_uuid: roundUuid,
            fantasy_matchup_uuid: matchupUuid
        });
        if (response.data.code === 200) {
            return response.data;
        }
        throw new AxiosError('Failed to fetch lineups versus data');
    }

    async updatePlayerLineup(leagueUuid: string, payload: LineupPlayerUpdatePayload): Promise<null> {
        const response = await this.api.put<ApiResponse<null>>(`user/fantasy/football/lineups/${leagueUuid}`, payload);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to update player lineup');
    }
}

// Export factory function instead of singleton to avoid early initialization
let userServiceInstance: UserService | null = null;

export const getUserService = (): UserService => {
    userServiceInstance ??= new UserService();
    return userServiceInstance;
}

// Export default using factory
export default getUserService()
