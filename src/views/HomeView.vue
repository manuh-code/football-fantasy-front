<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 py-4 md:py-8 pb-28 md:pb-8">
    <div class="container mx-auto px-4 max-w-lg">
      <GameHub />
    </div>
  </div>
  <HomeMenu />

  <!-- Visita guiada: se muestra solo la primera vez (o tras "Ver de nuevo"). -->
  <OnboardingTour :is-visible="showOnboarding" :steps="HOME_STEPS" @finish="finishOnboarding" />
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import GameHub from "@/components/home/GameHub.vue";
import HomeMenu from "@/components/home/HomeMenu.vue";
import OnboardingTour from "@/components/onboarding/OnboardingTour.vue";
import { HOME_STEPS } from "@/components/onboarding/onboardingSteps";
import { useOnboardingStore } from "@/store/onboarding";
import { useAuthStore } from "@/store/auth/useAuthStore";

const onboarding = useOnboardingStore();
const authStore = useAuthStore();
const showOnboarding = ref(false);

const finishOnboarding = () => {
  onboarding.markHomeSeen();
  showOnboarding.value = false;
};

// Mostrar la guía tras un pequeño retardo para no chocar con el splash y la
// animación de entrada de la página. Home es accesible sin sesión, así que la
// visita guiada solo aplica a usuarios autenticados.
onMounted(async () => {
  if (!onboarding.homeSeen && (await authStore.isAuthenticated())) {
    setTimeout(() => {
      if (!onboarding.homeSeen) showOnboarding.value = true;
    }, 700);
  }
});
</script>
