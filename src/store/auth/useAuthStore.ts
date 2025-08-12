
import { defineStore } from "pinia";
import { loginService } from '@/services/login/LoginService';
import { LoginPayload } from '@/interfaces/login/LoginPayload';
import { LoginResponse } from '@/interfaces/login/LoginResponse';
import { useUserStore } from "../user/useUserStore";



export const useAuthStore = defineStore("auth", {
  state: () => {
    return {
      token: null as string | null,
      googleUrl: null as string | null,
    };
  },
  getters: {

  },
  actions: {
    clearAuth() {
      this.token = null;
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
    async logout(): Promise<void> {
      const userStore = useUserStore();
      await loginService.logout();
      this.clearAuth();
      userStore.setUserData(null);
    }

  },
  persist: {
    storage: sessionStorage,
    pick: ["token"], // Only persist the count property
  },
});
