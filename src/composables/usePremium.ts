import { usePremiumStore } from "@/store/billing/usePremiumStore";
import {
  openPremiumUpsell,
  closePremiumUpsell,
  usePremiumUpsell,
} from "@/composables/usePremiumUpsell";
import type { PremiumFeature } from "@/interfaces/user/billing/EntitlementsResponse";

/**
 * Lo que usa una pantalla para tratar con los candados.
 *
 * El estado de la hoja vive en `usePremiumUpsell`, que no importa nada: desde
 * ahí tira también el interceptor de axios, y si esa parte arrastrara el store
 * se cerraría un ciclo de imports contra `useApiFantasy`.
 */
export function usePremium() {
  const store = usePremiumStore();
  const { isUpsellOpen, upsellFeature } = usePremiumUpsell();

  /**
   * Puerta para una acción de pago: deja pasar, o abre la hoja y corta.
   *
   * Pensada para el `@click` de un control con candado:
   * `if (!requirePremium(PREMIUM_FEATURES.poolScoringRules)) return`
   *
   * Esto sólo decide qué se enseña. Cada acción la vuelve a comprobar el API,
   * así que saltarse esta comprobación no desbloquea nada.
   */
  const requirePremium = (feature: PremiumFeature): boolean => {
    if (store.can(feature)) {
      return true;
    }

    openPremiumUpsell(feature);

    return false;
  };

  return {
    isUpsellOpen,
    upsellFeature,
    requirePremium,
    can: store.can,
    limit: store.limit,
    isPremium: store.isPremium,
    openUpsell: openPremiumUpsell,
    closeUpsell: closePremiumUpsell,
  };
}
