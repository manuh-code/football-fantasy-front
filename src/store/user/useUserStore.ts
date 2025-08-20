import { defineStore } from "pinia";
import { UserDataInterface } from "@/interfaces/user/userInterface";
import { UserPayload } from "@/interfaces/user/userPayload";
import { ChangePasswordPayload } from "@/interfaces/user/password/ChangePasswordPayload";
import { userService } from "@/services/user/UserService";
import { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";

export const useUserStore = defineStore("user", {
  state: () => {
    return {
      userData: null as UserDataInterface | null,
      userFantasyLeagues: null as FantasyLeaguesResponse[] | null,
    };
  },
  getters: {
    getUserData(): UserDataInterface | null {
      return this.userData;
    },
    getAvatarUrl(): string | null {
      return this.userData?.avatar || null;
    },
    getFavoriteTeam(): FootballTeamResponse | null {
      return this.userData?.favoriteFootballTeam || null;
    },
    getUserFantasyLeagues(): FantasyLeaguesResponse[] | null {
      return this.userFantasyLeagues;
    },
  },
  actions: {
    setUserData(userData: UserDataInterface | null): void {
      this.userData = userData;
    },
    setUserFantasyLeagues(leagues: FantasyLeaguesResponse[] | null): void {
      this.userFantasyLeagues = leagues;
    },
    clearUserData(): void {
      this.userData = null;
      this.userFantasyLeagues = null;
    },
    clearUserFantasyLeagues(): void {
        console.log('entro a borrar');
      this.userFantasyLeagues = null;
    },
    async setUserDataFromApi(): Promise<void> {
      const response = await userService.getUserData();
      this.setUserData(response);
    },
    async updateProfile(payload: UserPayload): Promise<void> {
      const response = await userService.updateProfile(payload);
      this.setUserData(response);
    },
    async changeAvatar(file: File): Promise<void> {
      const response = await userService.changeAvatar(file);
      this.setUserData(response);
    },
    async changePassword(payload: ChangePasswordPayload): Promise<void> {
      const response = await userService.changePassword(payload);
      this.setUserData(response);
    },
    async updateFavoriteTeam(payload: { teamUuid: string }): Promise<void> {
      const response = await userService.updateFavoriteTeam(payload);
      this.setUserData(response);
    },
    async getUserFantasyLeaguesFromApi(): Promise<void> {
      const response = await userService.getUserFantasyLeagues();
      this.setUserFantasyLeagues(response);
    },
  },
  persist: {
    storage: sessionStorage,
    pick: ["userData"], // Only persist the userData property
  },
});
