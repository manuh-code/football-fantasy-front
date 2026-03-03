import { defineStore } from "pinia";
import { getLoginService } from "@/services/login/LoginService";
import { LoginPayload } from "@/interfaces/login/LoginPayload";
import { LoginResponse } from "@/interfaces/login/LoginResponse";
import { useUserStore } from "../user/useUserStore";
import { usePushNotifications } from "@/composables/usePushNotifications";

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
      return getLoginService().isAuthenticated(this.token);
    },

    async login(payload: LoginPayload): Promise<LoginResponse> {
      const userStore = useUserStore();
      const response = await getLoginService().login(payload);
      const { claimTokensForUser } = usePushNotifications();
      this.setToken(response.token);
      userStore.setUserDataFromApi();
      await claimTokensForUser();
      return response;
    },

    async fetchGoogleLoginUrl(): Promise<string> {
      if (this.googleUrl) {
        return this.googleUrl;
      }
      const url = await getLoginService().fetchGoogleLoginUrl();
      this.googleUrl = url;
      return url;
    },

    async loginWithGoogle(queryParams: string): Promise<void> {
      const userStore = useUserStore();
      const response = await getLoginService().loginWithGoogle(queryParams);
      const { claimTokensForUser } = usePushNotifications();
      this.setToken(response.token);
      userStore.setUserDataFromApi();
      await claimTokensForUser();
    },

    async logout(): Promise<void> {
      const { unregisterToken } = usePushNotifications();
      const response = await getLoginService().logout();
      if (response.code === 200) {
        this.clearAuth();
        await unregisterToken()

      }
    },
  },
  persist: {
    storage: localStorage,
    pick: ["token"],
  },
});
