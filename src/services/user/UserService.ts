
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

export class UserService {
    private api;

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
        const response = await this.api.post<ApiResponse<UserDataInterface>>('user/store/favorite/team', payload);
        if (response.data.code === 200) {
            return response.data.data;
        }
        throw new AxiosError('Failed to update favorite team');
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
}

// Export singleton instance
export const userService = new UserService()

// Export default
export default userService
