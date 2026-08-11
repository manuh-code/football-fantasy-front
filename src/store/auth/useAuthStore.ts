import { defineStore } from "pinia";
import { getLoginService } from "@/services/login/LoginService";
import { LoginPayload } from "@/interfaces/login/LoginPayload";
import { LoginResponse } from "@/interfaces/login/LoginResponse";
import { useUserStore } from "../user/useUserStore";
import { usePushNotifications } from "@/composables/usePushNotifications";

/**
 * Import dinámico, no estático: el store de premium arrastra su servicio y con
 * él `useApiFantasy` → `router` → este mismo store. Cargarlo dentro de la
 * acción rompe el ciclo, igual que hace el guard del router con CatalogService.
 */
const withPremiumStore = async <T>(
  run: (store: ReturnType<typeof import("@/store/billing/usePremiumStore").usePremiumStore>) => T,
): Promise<void> => {
  const { usePremiumStore } = await import("@/store/billing/usePremiumStore");
  run(usePremiumStore());
};

/** Lo desbloqueado depende de quién entró: se recarga en cada inicio de sesión. */
const loadPremium = () => withPremiumStore((store) => store.fetch(true));

/** Al cerrar sesión (o al caducar el token) no puede quedar premium de nadie. */
const resetPremium = () => withPremiumStore((store) => store.reset());

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
      void resetPremium();
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
      // Awaited: callers (and the router's post-login redirect) must be able
      // to rely on userData being populated as soon as login() resolves —
      // fire-and-forget left a window where a uuid-dependent feature could
      // read a stale/null currentUserUuid right after logging in.
      await userStore.setUserDataFromApi();
      // Esperado, no disparado y olvidado: la pantalla a la que se redirige
      // tras entrar ya decide qué pinta con candado, y llegar sin esto le haría
      // enseñar la app como si nadie fuera premium durante un instante.
      await loadPremium();
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
      await userStore.setUserDataFromApi();
      await loadPremium();
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
