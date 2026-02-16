import { defineStore } from "pinia";
import { loginService } from "@/services/login/LoginService";
import { LoginPayload } from "@/interfaces/login/LoginPayload";
import { LoginResponse } from "@/interfaces/login/LoginResponse";
import { useUserStore } from "../user/useUserStore";

export const useAuthStore = defineStore("auth", {
  state: () => {
    return {
      token: null as string | null,
      googleUrl: null as string | null,
    };
  },
  getters: {},
  actions: {
    clearAuth() {
      const userStore = useUserStore();
      this.token = null;
      userStore.clearUserData();
    },

    setToken(token: string) {
      this.token = token;
    },

    getToken(): string | null {
      return this.token;
    },

    async isAuthenticated(): Promise<boolean> {
      return loginService.isAuthenticated(this.token);
    },

    async login(payload: LoginPayload): Promise<LoginResponse> {
      const userStore = useUserStore();
      const response = await loginService.login(payload);
      this.setToken(response.token);
      userStore.setUserDataFromApi();
      return response;
    },

    async fetchGoogleLoginUrl(): Promise<string> {
      if (this.googleUrl) {
        return this.googleUrl;
      }
      const url = await loginService.fetchGoogleLoginUrl();
      this.googleUrl = url;
      return url;
    },

    async loginWithGoogle(queryParams: string): Promise<void> {
      const userStore = useUserStore();
      const response = await loginService.loginWithGoogle(queryParams);
      this.setToken(response.token);

      userStore.setUserDataFromApi();
    },

    async logout(): Promise<void> {
      const response = await loginService.logout();
      if (response.code === 200) {
        this.clearAuth();
      }
    },
  },
  persist: {
    storage: sessionStorage,
    pick: ["token"], // Only persist the count property
  },
});
