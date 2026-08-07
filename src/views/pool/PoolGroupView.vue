<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-28">
    <div class="container mx-auto px-4 max-w-3xl">
      <!-- Navegación de la quiniela: salir ← / pestañas de sus paneles -->
      <PoolNav :active-key="activeTab" :pool-name="poolName" @select="onSelect" />

      <!-- Pool Group / Rules Component -->
      <div class="animate-page-enter">
        <PoolRulesComponent v-if="activeTab === 'rules'" :pool-uuid="poolUuid" />
        <PoolGroupComponent
          v-else
          :pool-uuid="poolUuid"
          :active-tab="activeTab"
          @select-tab="onSelect"
          @loaded="poolName = $event.name"
        />
      </div>
    </div>

    <!-- Soft fade behind the floating nav so content scrolling under it fades
         out instead of being hard-clipped by the pill. -->
    <div
      class="fixed inset-x-0 bottom-0 h-24 z-[90] pointer-events-none bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent"
      aria-hidden="true"
    />

    <!-- Fixed bottom navigation; Play stays selected here and returns to the
         Gaming screen — see HomeMenu. -->
    <HomeMenu />

    <!-- Visita guiada de la quiniela: solo la primera vez (o tras "Ver de nuevo"). -->
    <OnboardingTour :is-visible="showOnboarding" :steps="POOL_STEPS" @finish="finishOnboarding" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import HomeMenu from "@/components/home/HomeMenu.vue";
import PoolNav from "@/components/pool/PoolNav.vue";
import PoolGroupComponent from "@/components/pool/PoolGroupComponent.vue";
import PoolRulesComponent from "@/components/pool/PoolRulesComponent.vue";
import OnboardingTour from "@/components/onboarding/OnboardingTour.vue";
import { POOL_STEPS } from "@/components/onboarding/onboardingSteps";
import { useOnboardingStore } from "@/store/onboarding";
import { useAuthStore } from "@/store/auth/useAuthStore";

const { t } = useI18n();

const onboarding = useOnboardingStore();
const authStore = useAuthStore();
const showOnboarding = ref(false);

const finishOnboarding = () => {
  onboarding.markPoolSeen();
  showOnboarding.value = false;
};

// Mostrar la guía la primera vez que se abre el detalle de una quiniela
// (solo para usuarios autenticados).
onMounted(async () => {
  if (!onboarding.poolSeen && (await authStore.isAuthenticated())) {
    setTimeout(() => {
      if (!onboarding.poolSeen) showOnboarding.value = true;
    }, 700);
  }
});

// Set page title
document.title = t("pool.group.docTitle");

const route = useRoute();

const poolUuid = computed(() => route.params.uuid as string);
const activeTab = ref("info");

// El nombre lo trae el componente que ya carga la quiniela; la cabecera de la
// navegación solo lo muestra, así que no vuelve a pedirlo.
const poolName = ref("");

const onSelect = (key: string) => {
  activeTab.value = key;
};
</script>
