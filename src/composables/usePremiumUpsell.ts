import { ref, readonly } from "vue";
import type { PremiumFeature } from "@/interfaces/user/billing/EntitlementsResponse";

/**
 * Estado de la hoja que vende Premium, y nada más.
 *
 * Vive aparte de `usePremium` a propósito: de esto tira el interceptor de axios,
 * y `usePremium` arrastra el store → el servicio → `useApiFantasy` → el router,
 * o sea un ciclo de imports que rompe el arranque de la app. Aquí sólo hay dos
 * refs, así que se puede importar desde cualquier sitio sin riesgo.
 *
 * Los refs son de módulo, no de instancia: cualquier pantalla abre la hoja y la
 * única montada en App.vue es la que la pinta.
 */
const isOpen = ref(false);
const feature = ref<PremiumFeature | null>(null);

export function openPremiumUpsell(target: PremiumFeature | null): void {
  feature.value = target;
  isOpen.value = true;
}

export function closePremiumUpsell(): void {
  isOpen.value = false;
}

export function usePremiumUpsell() {
  return {
    isUpsellOpen: readonly(isOpen),
    upsellFeature: readonly(feature),
    openUpsell: openPremiumUpsell,
    closeUpsell: closePremiumUpsell,
  };
}
