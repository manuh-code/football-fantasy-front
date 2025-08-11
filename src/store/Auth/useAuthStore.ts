
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => {
    return {
      token: null as string | null,
      googleUrl: null as string | null,
    };
  },
  getters: {
    isAuthenticated: (state): boolean => {
      return state.token !== null;
    },
  },
  actions: {
    clearAuth() {
      this.token = null;
    },
    setToken(token: string) {
      this.token = token;
    }
  },
  persist: {
    storage: sessionStorage,
    pick: ["token"], // Only persist the count property
  },
});
