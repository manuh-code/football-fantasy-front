// composables/useAblyClient.ts
import * as Ably from "ably";

let ablyInstance: Ably.Realtime | null = null;

export function useAblyClient() {
  if (!ablyInstance) {
    ablyInstance = new Ably.Realtime({
      key: import.meta.env.VITE_ABLY_KEY,
      clientId: "vue-client-" + Math.random().toString(36).substring(2, 8),
      closeOnUnload: true, // 🔑 se asegura de cerrar en refresh/tab close
    });
  }

  return ablyInstance;
}
