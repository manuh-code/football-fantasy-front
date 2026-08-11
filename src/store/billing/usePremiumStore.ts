import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { getEntitlementService } from "@/services/user/billing/EntitlementService";
import type {
  EntitlementsResponse,
  PremiumFeature,
} from "@/interfaces/user/billing/EntitlementsResponse";

/**
 * Qué tiene desbloqueado el usuario, disponible para toda la app.
 *
 * NO se persiste, igual que el store de la suscripción: quien decide es el
 * servidor, y un `true` viejo en localStorage repartiría Premium que el API no
 * respalda. Lo peor que pasa al recargar es una llamada de más.
 *
 * Esto sólo decide qué se pinta. Cada acción de pago la vuelve a comprobar el
 * API, así que tocar el store desde la consola no desbloquea nada.
 */
export const usePremiumStore = defineStore("premium", () => {
  const isPremium = ref(false);
  const source = ref<string | null>(null);
  const expiresAt = ref<string | null>(null);
  const onGracePeriod = ref(false);
  const features = ref<Record<string, boolean>>({});
  const limits = ref<Record<string, number>>({});

  const isLoading = ref(false);
  // Distingue "no es premium" de "todavía no se ha preguntado", para que una
  // pantalla no pinte candados durante el primer render.
  const isLoaded = ref(false);

  // Evita que media docena de tarjetas montándose a la vez disparen media
  // docena de peticiones idénticas.
  let inFlight: Promise<void> | null = null;

  /** Cancelado pero aún dentro de lo pagado: conviene avisar, no bloquear. */
  const isExpiring = computed(() => isPremium.value && onGracePeriod.value);

  function apply(state: EntitlementsResponse): void {
    isPremium.value = state.is_premium;
    source.value = state.source;
    expiresAt.value = state.expires_at;
    onGracePeriod.value = state.on_grace_period;
    features.value = state.features ?? {};
    limits.value = state.limits ?? {};
    isLoaded.value = true;
  }

  /**
   * Si el usuario puede usar esta función.
   *
   * Mientras no se haya cargado el estado responde `false`: es el lado seguro
   * — enseñar un candado de más un instante se corrige solo, mientras que
   * dejar entrar y fallar al enviar es la experiencia que se quería evitar.
   */
  function can(feature: PremiumFeature): boolean {
    return features.value[feature] === true;
  }

  /** Tope numérico del plan, con un respaldo por si aún no se ha cargado. */
  function limit(feature: PremiumFeature, fallback: number): number {
    const value = limits.value[feature];
    return typeof value === "number" ? value : fallback;
  }

  async function fetch(force = false): Promise<void> {
    if (isLoaded.value && !force) {
      return;
    }
    if (inFlight) {
      return inFlight;
    }

    isLoading.value = true;
    inFlight = getEntitlementService()
      .show()
      .then(apply)
      .catch(() => {
        // Sin respuesta se queda como "sin premium" y se marca cargado, para
        // no reintentar en bucle en cada componente que se monte.
        isLoaded.value = true;
      })
      .finally(() => {
        isLoading.value = false;
        inFlight = null;
      });

    return inFlight;
  }

  function reset(): void {
    isPremium.value = false;
    source.value = null;
    expiresAt.value = null;
    onGracePeriod.value = false;
    features.value = {};
    limits.value = {};
    isLoaded.value = false;
    inFlight = null;
  }

  return {
    isPremium,
    source,
    expiresAt,
    onGracePeriod,
    features,
    limits,
    isLoading,
    isLoaded,
    isExpiring,
    apply,
    can,
    limit,
    fetch,
    reset,
  };
});
