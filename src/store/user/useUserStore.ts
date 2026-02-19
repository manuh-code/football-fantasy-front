import { defineStore } from "pinia";
import { UserDataInterface } from "@/interfaces/user/userInterface";
import { UserPayload } from "@/interfaces/user/userPayload";
import { ChangePasswordPayload } from "@/interfaces/user/password/ChangePasswordPayload";
import { userService } from "@/services/user/UserService";
import { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";
import { UserFootballLeaguePayload } from "@/interfaces/user/footballLeague/UserFootballLeaguePayload";
import { useFootballLeagueStore } from "../football/league/useFootballLeagueStore";
import { FantasyFootballPlayersResponse } from "@/interfaces/user/fantasy/FantasyFootballPlayersResponse";
import { FantasyFootballLineupPayload } from "@/interfaces/fantasy/leagues/FantasyFootballLineupPayload";

export const useUserStore = defineStore("user", {
  state: () => {
    return {
      userData: null as UserDataInterface | null,
      userFantasyLeagues: null as FantasyLeaguesResponse[] | null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
    getTimezone(): string {
      return this.timezone;
    }
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
    async storeFootballLeagues(payload: UserFootballLeaguePayload): Promise<void> {
      const footballLeagueStore = useFootballLeagueStore();
      const response = await userService.storeFootballLeagues(payload);
      this.setUserData(response);
     
      if (response.football_league) {
        footballLeagueStore.setLeague(response.football_league);
      }
    },
    async getFantasyFootballPlayersByLeagueUuid(leagueUuid: string, payload: FantasyFootballLineupPayload): Promise<FantasyFootballPlayersResponse[]> {
      return await userService.getFantasyFootballPlayersByLeagueUuid(leagueUuid, payload);
    }
  },
  persist: {
    storage: sessionStorage,
    pick: ["userData"], // Only persist the userData property
  },
});
