
import { useApiFantasy } from "@/composables/useApiFantasy";
import { UserDataInterface } from "@/interfaces/user/userInterface";
import { UserPayload } from "@/interfaces/user/userPayload";
import { ChangePasswordPayload } from "@/interfaces/user/password/ChangePasswordPayload";
import { FavoriteTeamPayload } from "@/interfaces/user/favoriteTeam/FavoriteTeamPayload";
import { AxiosError } from "axios";
import { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";
import { ApiResponse } from "@/interfaces/api/ApiResponse";
import { UserFootballLeaguePayload } from "@/interfaces/user/footballLeague/UserFootballLeaguePayload";
import { UserStorePayload } from "@/interfaces/user/store/userStorePayload";
import { FantasyFootballPlayersResponse } from "@/interfaces/user/fantasy/FantasyFootballPlayersResponse";
import { FantasyFootballLineupPayload } from "@/interfaces/fantasy/leagues/FantasyFootballLineupPayload";
import { LineupPlayerUpdatePayload } from "@/interfaces/fantasy/lineup/LineupPlayerUpdatePayload";
import { FantasyFootballPlayerVersusResponse } from "@/interfaces/user/fantasy/FantasyFootballPlayerVersusResponse";

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

    async getUserFantasyLeagues(): Promise<FantasyLeaguesResponse[]> {
        const response = await this.api.get<ApiResponse<FantasyLeaguesResponse[]>>('user/fantasy/leagues');
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
